import { CommonService } from './../../../public/services/common.service';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { IMedicineTypes } from './../../../public/models/iprescription';
import { OrderService } from '../../../public/services/order.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Ordersetmodel } from './../../../public/models/ordersetmodel.model';
import { PublicService } from './../../../public/services/public.service';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { LabOrders } from './../../../public/models/lab-order';
import { RadiologyOrder } from './../../../public/models/radiology-orders';
import { EditOrderComponent } from '../edit-order/edit-order.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InvestigationMaster } from './../../../public/models/investigation-master.model';
import { Medicine } from './../../../public/models/medicine';
import { Constants } from './../../../config/constants';
@Component({
  selector: 'app-order-set',
  templateUrl: './order-set.component.html',
  styleUrls: ['./order-set.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderSetComponent implements OnInit, OnDestroy {
  orderSetList: any[] = [];
  userId: number;
  ordersetDataObject = new Ordersetmodel;
  masterCategories: any[] = [];
  checkedOrderKey: string;
  suggestionPanelSettings: any;
  isOnload: boolean;
  isFrom: { sectionKeyName: string, sourceKey: string, ordersOrderSetId: number, ordersOrderSetData: any };
  addEditOrderSetDisplay = false;
  orderSetObj: any;
  destroy$ = new Subject();
  medicineTypes: any;
  priorityList: any[] = [];
  openOnlyPreview = false;
  activeOrderTempId: number;
  setAlertMessage: { message: string, messageType: string, duration: number };
  suggestionObj: any;
  // displayType = 'list';
  localOrdersDataAvailable = false;
  showAddMoreSection = true;
  showSuggestion = false;
  patientObj: any;
  constructor(
    private _orderService: OrderService,
    public activeModal: NgbActiveModal,
    public _publicService: PublicService,
    public _modalService: NgbModal,
    public commonService: CommonService
  ) { }

  ngOnInit() {
    this.userId = Constants.EMR_IPD_USER_DETAILS.docId;
    this.getpatientData();
    this.getAllCategories();
    this.getAllOrderSetData();
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings['suggestionIsShow'] = true;
    this.suggestionPanelSettings['suggestionPin'] = 'pin';
    // console.log('in order set on init');
    this.subcriptionOfEvents();
    this.getAllMedicineTypes();
    this.getPriorityLists();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
  }
  getAllCategories() {
    const requestParams = {
      serviceTypeId: this.patientObj.serviceType.id,
    };
    this._orderService.getAllMasterOrderCategories(requestParams).subscribe(res => {
      this.masterCategories = res;
      // get all local orders. If any order exist, display add new section with those orders. Else display order set list.
      this.setAddOrderSetDataFromLocalOrders(true);
    });
  }

  getAllMedicineTypes() {
    this._publicService.getMasterMedicineTypes().subscribe(res => {
      this.medicineTypes = res;
    });
  }

  getPriorityLists(): void {
    this._orderService.getPriorityList().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.priorityList = res;
    });
  }

  getAllOrderSetData(): void {
    const self = this;
    this._orderService.getOrderSetData().subscribe(res => {
      _.map(res, (rol, i) => {
        const orderSetModelObj = new Ordersetmodel();
        if (orderSetModelObj.isObjectValid(rol)) {
          orderSetModelObj.generateObject(rol);
          this.orderSetList.push(orderSetModelObj);
        }
      });
    });
  }

  setOrderSet(param: any): void {
    _.forEach(param, (value, key) => {
      if (_.isArray(value)) {
        let i = 0;
        _.forEach(value, (val) => {
          val.startDateTime = new Date();
          if ('medicineOrders' == key) {
            val['tempId'] = moment(new Date).valueOf() + i;
            val['medicineObj']['startDate'] = new Date();
            i++;
          }
        });
      }
    });
    this.activeModal.close(param);
  }

  isArray(val) { return _.isArray(val); }

  openSuggestionPanel(orderKey, passLocalObject?) {
    this.showSuggestion = true;
    // this.isOnload = true;
    // this.isFrom = {
    //   sectionKeyName: orderKey,
    //   sourceKey: 'ordersOrderSet',
    //   ordersOrderSetId: this.orderSetObj.orderSetId,
    //   ordersOrderSetData: (this.orderSetObj.orderSetId == '') ? this.orderSetObj : null,
    // }; // -- to update suggestion list
    this.suggestionObj = {
      sectionKeyName: orderKey,
      sourceKey: 'ordersOrderSet',
      ordersOrderSetId: this.orderSetObj.orderSetId,
      // ordersOrderSetData: (this.orderSetObj.orderSetId == '' || passLocalObject) ? this.orderSetObj : null
      ordersOrderSetData: this.orderSetObj
    };

    setTimeout(() => {
      this._publicService.componentSectionClicked(this.suggestionObj); // -- to update suggestion list
    });
  }

  // set new order set object, when clicked on add button.
  setOrderSetObj(orderData?) {
    // this.isOnload = false;
    this.checkedOrderKey = '';
    this.addEditOrderSetDisplay = true;
    this.openOnlyPreview = false;
    this.orderSetObj = {};
    this.orderSetObj.orderSetId = '';
    this.orderSetObj.ordersetName = '';
    this.orderSetObj.isVisible = true;
    this.orderSetObj.isExpanded = true;
    this.orderSetObj.isDataAvailable = true;
    _.forEach(this.masterCategories, (o) => {
      if (orderData) {
        this.orderSetObj[o.orderKey] = orderData[o.orderKey];
      } else {
        this.orderSetObj[o.orderKey] = [];
      }
    });
  }

  subcriptionOfEvents() {
    // -- event subscribed if any suggestion list is updated
    this._publicService.listenEventFromSuggList.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.key === 'ordersOrderSet') {
        const orderKey = this.suggestionObj.sectionKeyName;
        if (data.type === 'add') {
          // add object to local array
          let obj = _.cloneDeep(data.data);
          obj['tempId'] = moment(new Date).valueOf();
          obj['isDirty'] = true;
          obj['id'] = '';
          obj['status'] = 'approvelPending';
          if (this.suggestionObj.sectionKeyName === 'medicineOrders') {
            const medicine = { ...data.data };
            const orderObj: any = {};
            orderObj.tempId = moment(new Date).valueOf();
            orderObj.isDirty = true;
            orderObj.status = 'approvelPending';
            const medicineType = _.find(this.medicineTypes, x => x.id === medicine.MedicineTypeID);
            const medicineTypeModel = new IMedicineTypes();
            const medicineModel = new Medicine();
            if (medicineTypeModel.isObjectValid(medicineType)) {
              medicineTypeModel.generateObject(medicineType);
              medicine['type'] = medicineTypeModel;
              medicine['duration'] = 1;
              medicine['genericDuration'] = {
                duration: 1
              };
              medicine['genericFreq'] = '1';
              if (medicineModel.isObjectValid(medicine) || medicineModel.isObjGenerated) {
                if (medicineModel.isObjGenerated) {
                  orderObj['medicineObj'] = medicine;
                  return;
                }
                medicineModel.generateObject(medicine);
                orderObj['medicineObj'] = medicineModel;
              }
            }
            // obj['medicineType'] = medicineType['MedicineTypeID'];
            // obj['medicineTypeName'] = medicineType['Name'];
            obj = this._orderService.getOrderObjectByOrderKey('medicineOrders', orderObj, false);
          }
          if (this.suggestionObj.sectionKeyName == 'labOrders') {
            // obj['id'] = data.data.id;
            const labOrderModel = new LabOrders();
            const investigationM = new InvestigationMaster();
            if (investigationM.isObjectValid(data.data)) {
              investigationM.generateObject(data.data);
              obj.labInvestigationObj = investigationM;
              obj['specimen'] = '';
              if (labOrderModel.isObjectValid(obj)) {
                labOrderModel.generateObject(obj);
                obj = { ...obj, ...labOrderModel };
              }
            }
          }
          if (this.suggestionObj.sectionKeyName == 'radiologyOrders') {
            // obj['radioId'] = data.data.id;
            obj['priority'] = (this.priorityList.length) ? this.priorityList[0] : '';
            const radiologyOrderModel = new RadiologyOrder();
            const investigationM = new InvestigationMaster();
            if (investigationM.isObjectValid(data.data)) {
              investigationM.generateObject(data.data);
              radiologyOrderModel.radioInvestigationObj = investigationM;
              obj = { ...obj, ...radiologyOrderModel };
              radiologyOrderModel.generateObject(obj);
            }
            // radiologyOrderModel.generateObject(obj);
            // obj = radiologyOrderModel;
          }
          this.orderSetObj[orderKey].push(obj);
          // console.log('order set obj');
          // console.log(this.orderSetObj);
        } else if (data.type === 'delete') {
          if (data.data !== -1) {
            this.orderSetObj[orderKey].splice(data.data, 1);
          }
        }
      }
    });

    // -- event fired when data need to be editted
    this._orderService.$subcEditEvent.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if ('orderSetEditPopup' === res.mode) {
        // console.log(this.activeOrderTempId);
        const orderKey = res.key;
        const index = _.findIndex(this.orderSetObj[res.key], (o) => {
          return o.tempId === this.activeOrderTempId;
        });
        if (index !== -1) {
          this.orderSetObj[orderKey][index] = res.data;
          this.orderSetObj[orderKey][index]['isDirty'] = true;
          if (this.orderSetObj.orderSetId !== '') {
            // update local order set data
            // this.updateLocalOrderSetData(orderKey, index);
            // const orderSetLocalData = this._orderService.getOrderData('ordersOrderSet', true);
            // const activeOrderSetLocalIndex = _.findIndex(orderSetLocalData, (o) => {
            //   return o.orderSetId == this.orderSetObj.orderSetId;
            // });
            // orderSetLocalData[activeOrderSetLocalIndex][orderKey][index] =  _.cloneDeep(this.orderSetObj[orderKey][index]);
            // this._orderService.setOrderData(orderSetLocalData, 'update', 'ordersOrderSet');
          }
        }
      }
    });
  }

  openEditOrderSetPreview(orderObj) {
    this.addEditOrderSetDisplay = false;
    this.openOnlyPreview = true;
    this.orderSetObj = _.cloneDeep(orderObj);
    this.orderSetObj.isExpanded = true;
  }

  editOrderSet(obj) {
    if (!obj.openPopup) {
      this.addEditOrderSetDisplay = true;
      this.openOnlyPreview = false;
      this.checkedOrderKey = obj.orderKey;
      setTimeout(() => {
        this.openSuggestionPanel(obj.orderKey, true);
      }, 500);
    } else {
      this.activeOrderTempId = obj.data.tempId;
      // open popup
      this.openOrderEditPopup(obj.orderKey, obj.data);
    }
  }

  openOrderEditPopup(orderKey, data) {
    const editData = {
      'key': orderKey,
      'data': data,
      'orderIndex': 0
    };
    const selectedCompForEdit = _.find(this.masterCategories, (o) => {
      return o.orderKey == orderKey;
    });
    if (selectedCompForEdit) {
      // load popup here
      const modelInstance = this._modalService.open(EditOrderComponent, {
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        windowClass: 'custom-modal edit-order'
      });
      const editObj = {
        selectedCompForEdit: selectedCompForEdit,
        editData: editData
      };
      modelInstance.componentInstance.editObj = editObj;
      modelInstance.componentInstance.isFromOrderSetEdit = true;
    }
  }

  saveOrderSet() {
    // this._orderService.saveOrdersOrderSet();
    if (this.orderSetObj.ordersetName == '') {
      this.setAlertMessage = {
        message: 'Please Enter Order Set Template Name.',
        messageType: 'danger',
        duration: 3000
      };
      return;
    }

    // check if any order set is dirty.
    let isDirtyCount = 0;
    _.forEach(this.orderSetObj, (o, key) => {
      if (_.isArray(o)) {
        const cntArr = _.filter(o, (obj) => obj.isDirty == true);
        if (cntArr.length) {
          isDirtyCount++;
        }
      }
    });
    if (!isDirtyCount) {
      this.setAlertMessage = {
        message: 'Please Add/Edit Data.',
        messageType: 'danger',
        duration: 3000
      };
      return;
    }

    // save orders
    this._orderService.saveOrdersOrderSet(this.orderSetObj).subscribe(res => {
      this.setAlertMessage = {
        message: 'Order Set Saved Successfully',
        messageType: 'success',
        duration: 3000
      };
      this.getOrderSetLocalListData();
      // show list and hide add/edit section
      this.addEditOrderSetDisplay = false;
      this.openOnlyPreview = false;
    });
  }

  getOrderSetLocalListData() {
    this.addEditOrderSetDisplay = false;
    this.openOnlyPreview = false;
    // this.orderSetList = this._orderService.getOrderData('ordersOrderSet', true);
    this.orderSetList = this._orderService.getOrderSetLocalData();
    this.orderSetList = _.orderBy(this.orderSetList, ['orderSetId'], ['desc']);
  }

  deleteFromOrderSet(deleteObj) {
    if (deleteObj.deleteType === 'orderSet') {
      this.deleteOrderSet(deleteObj.index);
    }
    if (deleteObj.deleteType === 'order') {
      this.orderSetObj[deleteObj.orderKey].splice(deleteObj.index, 1);
      this.orderSetObj = this._orderService.setOrderSetDataByDirtyData(this.orderSetObj, 'markDirtyTrue');
      // if (this.orderSetObj.orderSetId != '') {
      //   // update local order set data
      //   this.updateLocalOrderSetData(deleteObj.orderKey, deleteObj.index);
      // }
      this.openSuggestionPanel(deleteObj.orderKey, true);
    } else if (deleteObj.deleteType === 'clearAllOrders') {
      // clear all orders in given order key
      this.orderSetObj[deleteObj.orderKey] = [];
      this.orderSetObj = this._orderService.setOrderSetDataByDirtyData(this.orderSetObj, 'markDirtyTrue');
      // if (this.orderSetObj.orderSetId != '') {
      //   this.updateLocalOrderSetData(deleteObj.orderKey);
      // }
      this.openSuggestionPanel(deleteObj.orderKey, true);
    }
  }

  deleteOrderSet(orderSetId) {
    this._orderService.deleteOrderSet(orderSetId).subscribe(res => {
      if (res) {
        const index = _.findIndex(this.orderSetList, (o) => {
          return o.orderSetId === orderSetId;
        });
        if (index !== -1) {
          this.orderSetList.splice(index, 1);
        }
        this.setAlertMessage = {
          message: 'Order Set Deleted Successfully',
          messageType: 'success',
          duration: 3000
        };
      }
    });
  }

  updateLocalOrderSetData(orderKey, index?) {
    // update local order set data
    // const orderSetLocalData = this._orderService.getOrderData('ordersOrderSet', true);
    const orderSetLocalData = this._orderService.getOrderSetLocalData();
    const activeOrderSetLocalIndex = _.findIndex(orderSetLocalData, (o) => {
      return o.orderSetId == this.orderSetObj.orderSetId;
    });
    if (index) {
      orderSetLocalData[activeOrderSetLocalIndex][orderKey][index] = _.cloneDeep(this.orderSetObj[orderKey][index]);
    } else {
      orderSetLocalData[activeOrderSetLocalIndex][orderKey] = _.cloneDeep(this.orderSetObj[orderKey]);
    }
    // this._orderService.setOrderData(orderSetLocalData, 'update', 'ordersOrderSet');
    // this._orderService.setOrderSetLocalData(orderSetLocalData, 'update');
  }

  setAddOrderSetDataFromLocalOrders(init?) {
    this.showSuggestion = false;
    const allLocalOrders = {};
    let orderData: any;
    _.forEach(this.masterCategories, (val) => {
      orderData = this._orderService.getOrderData(val.orderKey, true);
      orderData = _.cloneDeep(orderData);
      if (orderData && _.isArray(orderData)) {
        if (orderData.length) {
          this.localOrdersDataAvailable = true;
        }
        allLocalOrders[val.orderKey] = orderData;
      } else {
        allLocalOrders[val.orderKey] = [];
      }
    });
    // set local order for add section
    if (this.localOrdersDataAvailable || !init) {
      const param = (this.localOrdersDataAvailable) ? allLocalOrders : false;
      this.setOrderSetObj(param);
    }
    if (this.localOrdersDataAvailable && init) {
      this.openOnlyPreview = true;
    }
  }

  closeShowSuggestion(event) {
    this.showSuggestion = false;
  }
}

import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';
import { InvestigationMaster } from './../../../public/models/investigation-master.model';
import { PublicService } from './../../../public/services/public.service';
import { OrderService } from './../../../public/services/order.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { RadiologyOrder } from './../../../public/models/radiology-orders';
import { CommonService } from './../../../public/services/common.service';
import { AuthService } from './../../../public/services/auth.service';
import { ConfirmationOrderPopupComponent } from '../confirmation-order-popup/confirmation-order-popup.component';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-radiology-orders',
  templateUrl: './radiology-orders.component.html',
  styleUrls: ['./radiology-orders.component.scss']
})
export class RadiologyOrdersComponent implements OnInit, OnDestroy {
  compInstance = this;
  radiologyOrderForm: FormGroup;
  radiologyOrderList: any[] = [];
  priorityList: any[] = [];
  actionList$: Observable<any[]>;
  copyOfRecurringList: any[] = [];
  copyOfPriorityList: any[] = [];
  loadSuggestion = true;
  showInputSearchBox = true;
  searchKeyword: any;
  isOpen: false;
  destroy$ = new Subject();
  submitted = false;
  selectedIndex = -1;
  loginUserInfo: any;
  userData: any;
  prevStatus: string;
  showAddSection = false;
  activeIds = [];
  filterBy: string;
  closeOthers = true;
  orderCatId: number;
  userId: number;
  alertMsg: IAlert;
  orderDisplayType: string; // -- value set from dynacic load comp
  editData: any;
  isEdit: boolean = true;
  isDelete: boolean = true;
  isShowActions: boolean = true;
  checkAllValue: boolean = false;
  isFromOrderSetEdit: boolean;
  @Output() showOrders = new EventEmitter<any>();
  activeModal: any;
  frequencyMasterList: any[] = [];
  frequencyNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  hoursList: Array<any> = [];
  activeIndex = -1;
  suggestionPanelSettings: any;
  isOnload = true;
  isFrom: any;
  radiologyOrdersFavSuggestionTemplateList: any[] = [];
  patientId: any;
  patientObj: EncounterPatient;
  activeTab: any = 'Templates';
  orderInstructionList: any[] = [];
  radioOrdersRequisitionList: any[] = [];
  @ViewChild('suggestionPanel', { static: false }) suggestionPanelComp: any;
  isTabModeOn;
  constructor(
    private _fb: FormBuilder,
    private _publicService: PublicService,
    private _orderService: OrderService,
    private _modalService: NgbModal,
    private commonService: CommonService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isTabModeOn = this.commonService.isTabModeOn;
    this.userId = +this.authService.getLoggedInUserId();
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings['suggestionIsShow'] = true;
    this.suggestionPanelSettings['suggestionPin'] = 'pin';
    this.isFrom = { sectionName: 'Radiology Orders', sectionKeyName: 'radiologyOrders', modelpopup: 'OrdersPopup' };
    // this.loginUserInfo = this._authService.getUserDetailsByKey('userInfo');
    this.getpatientData();
    this.afterGetPatData();
    this.subcriptionOfEvents();
  }

  afterGetPatData() {
    this.radiologyOrderList = [];
    this.frequencyMasterList = [];
    this.setRadiologyOrderFormData();
    this.getPriorityLists();
    this.getActionLists();
    this.getOrdersData();
    this.editOnInit();
    this.findPendingObject();
    for (let i = 1; i <= 99; i++) {
      this.frequencyMasterList.push(i);
    }
    this.showAddSection = (this.showAddSection === undefined) ? false : this.showAddSection;
    this.hoursList = this._orderService.generateHours();
    this.updateOrderChanges();
  }

  setRadiologyOrderFormData() {
    this.radiologyOrderForm = this._fb.group({
      id: [''],
      name: ['', Validators.required],
      // radioId: [''],
      startDateTime: [new Date()],
      endDateTime: [new Date()],
      recurring: [''],
      priority: [''],
      action: [''],
      status: ['approved'],
      reason: [''],
      signSymptoms: [''],
      patientConsentNeeded: ['no'],
      clinicalInfo: [''],
      radiologyInstruction: [''],
      patientInstruction: [''],
      // is_favourite: [''],
      // use_count: [''],
      isDirty: [true],
      tempId: [''],
      radioInvestigationObj: [null],
      frequency: [1],
      freqStartTime: ['08:00 AM'],
      frequencySchedule: [''],
      orderDate: [new Date()],
      orderBy: [null],
      requisition: ['']
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  onSelectRadiology($event): void {
    this.radiologyOrderForm.patchValue({
      radioInvestigationObj: $event ? $event : '',
      name: $event ? $event.label : ''
    });
  }

  getPriorityLists(): void {
    this._orderService.getPriorityList().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.priorityList = res;
      this.radiologyOrderForm.patchValue({
        priority: this.priorityList[0]
      });
    });
  }

  // -- return observable
  getAllRadiologyTestList(searchVal, strict_match?): Observable<any> {
    return this.compInstance._publicService.getInvestigationWithPaginationByType('radio', 1, 20, searchVal, strict_match, -1, 0).pipe(map(res => {
      const investMastList: InvestigationMaster[] = [];
      res.data.forEach(element => {
        const investModel = new InvestigationMaster();
        if (investModel.isObjectValid(element)) {
          investModel.generateObject(element);
          investMastList.push(investModel);
        }
      });
      return investMastList;
    }));
  }

  getOrdersData() {
    this._orderService.getOrderData('radiologyOrders').pipe(takeUntil(this.destroy$)).subscribe(result => {
      result = _.uniqBy(result, 'tempId');
      this.radiologyOrderList = result;
      const radiologyModel = new RadiologyOrder();
      _.map(this.radiologyOrderList, (rol, i) => {
        if (radiologyModel.isObjectValid(rol)) {
          radiologyModel.generateObject(rol);
          this.radiologyOrderList[i] = _.cloneDeep(radiologyModel);
        }
      });
    });
  }

  updateDataToArray() {
    this.submitted = true;
    const radiologyModel = new RadiologyOrder();
    if (this.radiologyOrderForm.status == 'VALID' && radiologyModel.isObjectValid(this.radiologyOrderForm.value)) {
      this.submitted = false;
      if (this.selectedIndex != -1) { // edit
        if (_.isUndefined(this.isFromOrderSetEdit)) {
          this.radiologyOrderList[this.selectedIndex] = this.radiologyOrderForm.value;
        }
      }
    }
    this.selectedIndex = -1;
    this.activeIndex = -1;
  }

  addradiologyOrders() {
    if (!this.isTabModeOn) {
      return;
    }
    this.submitted = true;
    const radiologyModel = new RadiologyOrder();
    if (this.radiologyOrderForm.status == 'VALID' && radiologyModel.isObjectValid(this.radiologyOrderForm.value)) {
      this.submitted = false;
      if (this.selectedIndex != -1) { // edit
        if (_.isUndefined(this.isFromOrderSetEdit)) {
          this.radiologyOrderList[this.selectedIndex] = this.radiologyOrderForm.value;
        }
        // this.selectedIndex = -1;
        if (!_.isUndefined(this.activeModal)) {
          if (!_.isUndefined(this.isFromOrderSetEdit)) {
            // set order set data
            const editObj = {
              mode: 'orderSetEditPopup',
              key: 'radiologyOrders',
              data: this.radiologyOrderForm.value,
              orderIndex: 0
            };
            this._orderService.editOrderSetData(editObj);
          }
          this.showAddSection = false;
          this.activeModal.close();
        }
      } else {
        this.radiologyOrderForm.value['tempId'] = moment(new Date()).valueOf();
        if (radiologyModel.isObjectValid(this.radiologyOrderForm.value)) {
          radiologyModel.generateObject(this.radiologyOrderForm.value);
          this.radiologyOrderList.push(radiologyModel);
        }
      }
      // this.clearForm();
    }
  }

  getActionLists(): void {
    this.actionList$ = this._orderService.getActionLists().pipe(
      map(res => {
        this.radiologyOrderForm.patchValue({
          action: res[0]
        });
        return res;
      })
    );
  }

  saveOrderActionFromPopup(medicine, res, act): Observable<any> {
    const param = {
      user_id: this.userId,
      items: [{
        order_item_id: res.id,
        order_category_key: medicine.key,
        status: act
      }]
    };
    return this.compInstance._orderService.SaveOrderAction(param).pipe(map(dt => {
      return dt;
    }));
  }

  checkOrderTypeExistInOrder(order): Observable<any> {
    const param = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo,
      orderCategory: order.key,
      masterId: order.data.id,
    };
    return this.compInstance._orderService.checkPatientOrderStatus(param).pipe(map(res => {
      if (res.radiologyOrders) {
        return res.radiologyOrders;
        // const medObj = this.updateFormValue(res.radiologyOrders, true);
        // return medObj;
      } else {
        return null;
      }
    }));
  }

  getConfirmationPopup(selectedData, res) {
    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Already Exist in Orders',
      selectedOrder: selectedData.data,
      orderStatus: res.status,
      resData: res,
      type: 'radiologyOrders',
      showEditButton: res.status === 'INITIATED' ? true : false
    };
    const modalInstance = this._modalService.open(ConfirmationOrderPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'sm',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result !== 'edit') {
        this.saveOrderActionFromPopup(selectedData, res, result).subscribe(dt => {
          this.updateFormValue(selectedData.data);
        });
      } else {
        this.updateFormValue(res);
      }
    }, (dis) => {
      this.suggestionPanelComp.initialLoadData(this.isFrom);
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
      this.afterGetPatData();
    });
    // -- event subscribed if any suggestion list is updated
    this._publicService.listenEventFromSuggList.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.key === 'radiologyOrders') {
        if (data.type === 'add') {
          this.checkOrderTypeExistInOrder(data).subscribe(res => {
            if (res) {
              this.getConfirmationPopup(data, res);
            } else {
              this.updateFormValue(data.data);
            }
          });
        } else if (data.type === 'delete') {
          if (data.data !== -1) {
            this.radiologyOrderList.splice(data.data, 1);
          }
        }
      }
    });

    // -- event fired when filter type change on order component
    this._orderService.$subcFilteredEvnt.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if ('setData' === res.mode && 'radiologyOrders' === res.filterBy) {
        this.getOrdersData();
      }
    });

    this._orderService.$subLoadSuggestionFromOrders.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res === 'radiologyOrders' && !this.loadSuggestion) {
        this.openSuggestion();
      }
    });

    this._orderService.$OrderEvent.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res.orderKey === 'radiologyOrders' && res.action === 'clear_orders') {
        this.radiologyOrderList = [];
      }
    });

    this.radiologyOrderForm.get('freqStartTime').valueChanges.subscribe(res => {
      if (!res) {
        this.onFreqStartTimeSelect('08:00 AM'); // set default value.
      }
    });
  }

  updateFormValue(result, retObj?) {
    const investModel = new InvestigationMaster();
    const radiologyOrder = new RadiologyOrder();
    if (investModel.isObjectValid(result)) {
      investModel.generateObject(result);
    }
    let obj = null;
    const statusData = this._orderService.checkOrderStatus(this.userData);
    obj = {
      radioInvestigationObj: investModel,
      tempId: moment(new Date()).valueOf(),
      name: investModel.name,
      status: statusData.status,
      priority: 'Routine',
      componentList: [],
      isDirty: true
    };
    if (statusData.approvedBy) {
      obj = {
        radioInvestigationObj: investModel,
        tempId: moment(new Date()).valueOf(),
        status: statusData.status,
        name: investModel.name,
        priority: 'Routine',
        isDirty: true,
        componentList: [],
        approvedBy: statusData.approvedBy
      };
    }
    if (radiologyOrder.isObjectValid(obj)) {
      radiologyOrder.generateObject(obj);
      this._publicService.setupdateByValueOnOrder(radiologyOrder);
      this.radiologyOrderList.push(radiologyOrder);
      this._orderService.setOrderData(this.radiologyOrderList, 'update', 'radiologyOrders');
      radiologyOrder.sequence = this._orderService.getOrderSequence();
      this._orderService.setOrderSequence(this._orderService.getOrderSequence() + 1);
    }
    // this._orderService.setOrderData(this.radiologyOrderList, 'update', 'radiologyOrders');
  }

  removeRadiologyOrders(selectedItem, fromSuggestion?) {
    const index = _.findIndex(this.radiologyOrderList, ro => ro.tempId === selectedItem.tempId && (ro.id === undefined || ro.id === ''));
    if (index === -1) { return; }
    const status = this.radiologyOrderList[index].status;
    this.radiologyOrderList.splice(index, 1);
    this._orderService.setOrderData(this.radiologyOrderList, 'update', 'radiologyOrders');
    this.clearForm();

    if (!fromSuggestion) {
      this.loadSuggestion = true;
      this.showAddSection = false;
      // this.suggestionPanelComp.loadAllMaster().subscribe(res => {
      this.suggestionPanelComp.initialLoadData(this.isFrom);
      // });
    }
  }

  // menuClicked() {
  //   this._publicService.componentSectionClicked({
  //     sectionKeyName: 'radiologyOrders'
  //   }); // -- to update suggestion list
  // }

  get getRadiologyOrdersForm() {
    return this.radiologyOrderForm.controls;
  }

  clearForm() {
    this.radiologyOrderForm.reset({
      status: 'approved',
      recurring: [this.copyOfRecurringList[0]],
      priority: [this.priorityList[0]],
      specimen: [''],
      patientConsentNeeded: 'no',
      startDateTime: new Date(),
      endDateTime: new Date(),
      isDirty: true
    });
    this.submitted = false;
    this.selectedIndex = -1;
  }

  onEditRadiologyOrder(item, i) {
    let index = -1;
    if (item.orderIndex !== undefined) {
      index = item.orderIndex;
      delete item.orderIndex;
    } else {
      index = _.findIndex(this.radiologyOrderList, (o) => o.name === item.name && ((o.id === undefined || o.id === '') || o.isDirty));
    }
    if (index === -1) {
      return;
    }
    if (this.isTabModeOn) {
      this.showAddSection = true;
      this.loadSuggestion = false;
    }
    this.selectedIndex = index;
    this.prevStatus = item.status;
    this.radiologyOrderForm.patchValue(item);
    if (this.isTabModeOn) {
      this.loadRadiologyFavTemplateSuggestions();
      // this.getLanguageInstruction().subscribe();
      this.getRequisitionList().subscribe();
    }
  }

  // saveRadioOrdes() {
  //   const ordStatus = _.some(this.radiologyOrderList, res => res.status == 'approvelPending');
  //   const reqParams = {
  //     orderCategoryid: this.orderCatId,
  //     order_data: { 'radiologyOrders': this.radiologyOrderList },
  //     orderStatus: ordStatus ? 'approvelPending' : 'approved'
  //   };
  //   this._orderService.saveOrdersByCategory(reqParams).subscribe(res => {
  //     this.alertMsg = {
  //       message: 'Radiology Order Saved Successfully.',
  //       messageType: 'success',
  //       duration: 3000
  //     };
  //   });
  // }

  editOnInit() {
    if (!_.isUndefined(this.editData)) {
      this.onEditRadiologyOrder(this.editData.data, this.editData.orderIndex);
    }
  }

  openSuggestion(): void {
    // const modelInstance = this._modalService.open(SuggestionModelPopupComponent, {
    //   // backdrop: 'static',
    //   keyboard: false,
    //   size: 'lg',
    //   windowClass: 'custom-modal'
    // });
    // modelInstance.result.then(result => {
    // }, reason => { });
    // modelInstance.componentInstance.isFrom = { sectionName: 'Radiology Orders', sectionKeyName: 'radiologyOrders', modelpopup: 'OrdersPopup' };
    this.showAddSection = false;
    // this._orderService.loadSuggestionFromOrders.next({ sectionName: 'Radiology Orders', sectionKeyName: 'radiologyOrders', modelpopup: 'OrdersPopup' });
    this.loadSuggestion = true;
    setTimeout(() => {
      this._publicService.componentSectionClicked(this.isFrom); // -- to update suggestion list
    });
  }

  findPendingObject() {
    if (this.radiologyOrderList.length) {
      this.checkAllValue = _.some(this.radiologyOrderList, res => res.status === 'approvelPending' && res.tempstatus !== 'approved') ? false : true;
    }
  }

  setMedicineFreqSchedule(radiologyDetails, onBlur?) {
    let Freq;
    Freq = +radiologyDetails.frequency || 1;

    if (onBlur) { return; }

    if (!_.isUndefined(radiologyDetails) && Freq !== '') {
      if (Freq === 1) {
        if (!radiologyDetails.frequencySchedule) {
          radiologyDetails.frequencySchedule = '1-0-0';
        } else if (radiologyDetails.frequencySchedule === '1-0-0') {
          radiologyDetails.frequencySchedule = '0-1-0';
        } else if (radiologyDetails.frequencySchedule === '0-1-0') {
          radiologyDetails.frequencySchedule = '0-0-1';
        } else {
          radiologyDetails.frequencySchedule = '1-0-0';
        }
      } else if (Freq === 2) {
        if (!radiologyDetails.frequencySchedule) {
          radiologyDetails.frequencySchedule = '1-0-1';
        } else if (radiologyDetails.frequencySchedule === '1-0-1') {
          radiologyDetails.frequencySchedule = '1-1-0';
        } else if (radiologyDetails.frequencySchedule === '1-1-0') {
          radiologyDetails.frequencySchedule = '0-1-1';
        } else {
          radiologyDetails.frequencySchedule = '1-0-1';
        }
      } else if (Freq >= 3 || Freq === 0) {
        radiologyDetails.frequencySchedule = '';
        for (let i = 0; i < Freq && Freq <= 24; i++) {
          radiologyDetails.frequencySchedule += (i === 0) ? 1 : '-1';
        }
      }
    } else {
      radiologyDetails.frequencySchedule = '';
    }
    this.radiologyOrderForm.patchValue(radiologyDetails);
  }

  openSuggestionPanel() {
    this._publicService.componentSectionClicked({
      sectionKeyName: 'radiologyOrders'
    }); // -- to update suggestion list
  }

  onFreqStartTimeSelect(hrs?) {
    if (!hrs) { return; }
    this.radiologyOrderForm.patchValue({
      freqStartTime: hrs.time
    });
    const hrsObj = _.find(this.hoursList, (o) => o.time === hrs);
    _.map(this.hoursList, (o) => { if (hrs !== o.time) { o.isActive = false; } });
    if (!hrsObj) { return; }
    hrsObj.isActive = !hrsObj.isActive;
  }

  updateOrderChanges(): void {
    this.radiologyOrderForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.addradiologyOrders();
    });
  }

  onSearch(event) {
    this.suggestionPanelComp.searchKeyword = event;
    this.suggestionPanelComp.subject.next();
  }

  hideHistory() {
    this.suggestionPanelComp.hideHistory();
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  loadRadiologyFavTemplateSuggestions() {
    const reqParams = {
      item_id: this.radiologyOrderForm.get('radioInvestigationObj').value.id,
      patient_id: this.patientId,
      dept_id: null,
      user_id: this.userId,
      limit: 5
    };

    this._orderService.getOrderFavTemplates(reqParams, 'radiologyOrders').subscribe(result => {
      this.activeTab = !result.length ? 'Frequency' : 'Templates';
      _.map(result, (o) => {
        o.id = '';
        o.tempId = this.radiologyOrderForm.value.tempId;
        o.priority = this.radiologyOrderForm.value.priority;
        o.action = this.radiologyOrderForm.value.action;
        o.status = this.radiologyOrderForm.value.status;
        o.order_id = '';
        o.orderDate = this.radiologyOrderForm.value.orderDate;
        o.orderBy = null;
        o.approvedBy = null;
      });
      this.radiologyOrdersFavSuggestionTemplateList = result;
    });
  }

  configureAction($event) {
    if ($event.nextId === 'Templates') {
      this.loadRadiologyFavTemplateSuggestions();
    }
  }
  approveOrders(item, i) {
    this.radiologyOrderList[i] = item;
  }
  getLanguageInstruction(term?) {
    const reqParams = {
      patient_id: this.patientId,
      user_id: this.userId,
      item_id: this.radiologyOrderForm.get('radioInvestigationObj').value.id,
      limit: 50
    };
    return this._orderService.getOrderInstructions(reqParams, 'radiologyOrders').pipe(
      map(result => {
        const list = [];
        _.map(result, (v) => {
          const obj = {
            instruction: v
          };
          list.push(obj);
        });
        this.orderInstructionList = list;
        return result;
      })
    );
  }
  getRequisitionList(term?) {
    const reqParams = {
      patient_id: this.patientId,
      user_id: this.userId,
      item_id: this.radiologyOrderForm.get('radioInvestigationObj').value.id,
      limit: 50
    };
    return this._orderService.getOrderInstructions(reqParams, 'radiologyOrderRequisition').pipe(
      map(result => {
        const list = [];
        _.map(result, (v) => {
          const obj = {
            instruction: v
          };
          list.push(obj);
        });
        this.radioOrdersRequisitionList = list;
        return result;
      })
    );
  }
}

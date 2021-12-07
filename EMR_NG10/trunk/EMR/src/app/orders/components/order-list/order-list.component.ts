import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { OtherServicesOrder } from './../../../public/models/doctor-information-order';
import { DoctorInformationOrder } from './../../../public/models/doctor-information-order';
import { NursingOrder } from './../../../public/models/nursing-order';
import { DietOrder } from './../../../public/models/diet-order';
import { LabOrders } from './../../../public/models/lab-order';
import { MedicineOrders } from './../../../public/models/medicine-orders';
import { ConfirmationOrderPopupComponent } from './../confirmation-order-popup/confirmation-order-popup.component';
import { map, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PatientService } from './../../../public/services/patient.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrderService } from '../../../public/services/order.service';
import { Subject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderListFiltersComponent } from '../order-list-filters/order-list-filters.component';
import { AuthService } from './../../../public/services/auth.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { CommonService } from './../../../public/services/common.service';
import { OrderListFilterPipe } from '../../pipes/order-list-filter.pipe';
import { OrderByPipe } from 'src/app/shared/pipes/orderby.pipe';
import { RadiologyOrder } from 'src/app/public/models/radiology-orders';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  providers: [OrderListFilterPipe, OrderByPipe]
})
export class OrderListComponent implements OnInit, OnDestroy {
  masterCategories = [];
  allOrders: any[] = [];
  $destroy: Subject<boolean> = new Subject();
  filters: any;
  userInfo: any = null;
  orderByRecords: any[] = [];
  approvedByRecords: any[] = [];
  alertMsg: IAlert;
  userId: number;
  orderStatusMasterList: any[] = [];
  patientObj: EncounterPatient;
  patientId: any;
  selectedOrderKey: any;
  sortKeyList: any = [{ key: 'approved_by', name: 'Approved By' },
  { key: 'order_by', name: 'Order By' },
  { key: 'order_date', name: 'Order Date' },
  { key: 'status', name: 'Order Status' }];
  selectedSortkey: any = 'order_date';
  selectedSubSortKey: any = null;
  selectedSortType = true; // true asc, false  desc
  statusText = '';
  filterBy = '';
  allFilterCount = 0;
  pendingWithMeCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  unApprovedCount = 0;
  myAllOrderCount = 0;
  completedCount = 0;
  allTempOrderList: any[] = [];
  searchTxt = '';
  isShowBulkapproveBtn = false;
  selectedCategoryName: any;
  selectedCategoryList = [];
  isSelectedAll = false;
  dropdownSettings = {};

  constructor(
    private orderService: OrderService,
    private modalService: NgbModal,
    private authService: AuthService,
    private commonService: CommonService,
    private orderListFilterPipe: OrderListFilterPipe,
    private patientService: PatientService,
    private router: Router,
    private orderByList: OrderByPipe) { }

  ngOnInit() {
    this.userId = +this.authService.getLoggedInUserId();
    this.userInfo = +this.authService.getUserInfoFromLocalStorage();
    this.initDropDownList();
    this.getpatientData();
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  initDropDownList() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'orderKey',
      textField: 'orderName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: false
    };
  }

  openFilterPopup() {
    const cateogoriesList = _.clone(this.masterCategories);
    cateogoriesList.shift();
    const messageDetails = {
      modalTitle: 'Filter',
      filters: {
        orderBy: this.orderByRecords,
        approvedBy: this.approvedByRecords,
        selectedFilter: this.filters ? this.filters : null
      },
      orderCategories: cateogoriesList,
      orderStatusList: this.orderStatusMasterList
    };
    const modalInstance = this.modalService.open(OrderListFiltersComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'visit-modal'
      });
    modalInstance.result.then((filterResponse: any) => {
      this.filters = filterResponse;
      this.allOrders = _.clone(this.allTempOrderList);
      if (_.isObject(filterResponse)) {
        // get filter
        this.allOrders = this.orderListFilterPipe.transform(_.clone(this.allTempOrderList), filterResponse, true);
        // set default value while diffrent filter apply
        this.isShowBulkapproveBtn = false;
        this.statusText = `ALL (${this.allFilterCount})`;
      }
    }, (response) => {
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  prepareReqForSaveOrderAction(orderKey, statusKey, details?) {
    if (details) {
      const orderStatusObj = _.find(this.orderStatusMasterList, (o) => o.status_key === statusKey);
      if (orderStatusObj) {
        details.status = orderStatusObj.status_key;
      }
      const actionArray = [{
        order_category_key: orderKey,
        order_item_id: details.id,
        status: statusKey,
        action: '',
      }];
      this.saveOrderAction(actionArray);
    }
  }

  saveOrderAction(items?) {
    const reqParams = {
      user_id: this.userId,
      items: (items) ? items : []
    };
    if (reqParams.items.length) {
      this.orderService.SaveOrderAction(reqParams, 'order_list').subscribe(data => {
        if (data.status_code === 200 && data.status_message === 'Success') {
          _.map(reqParams.items, (i) => {
            const statusChangeObject = _.find(this.allTempOrderList, (o) => o.categoryKey === i.order_category_key && o.id === i.order_item_id);
            if (!_.isUndefined(statusChangeObject)) {
              statusChangeObject.status = i.status;
              statusChangeObject.isSelected = false;
              statusChangeObject.isDisbale = statusChangeObject.order_by.user_id === this.userId && statusChangeObject.status === 'INITIATED' ? false : true;
            }
            if (i.status === 'APPROVED') {
              statusChangeObject.approved_by = {
                approved_date: new Date(),
                user_id: this.userId,
                user_name: this.userInfo.user_name
              };
            }
          });
          this.allOrders = _.clone(this.allTempOrderList);
          this.setInitialStatusCount();
          this.isBulkApprovedExist();
          this.alertMsg = {
            message: 'Order(s) Approved Successfully',
            messageType: 'success',
            duration: 3000
          };
        } else {
          this.alertMsg = {
            message: data.message,
            messageType: 'warning',
            duration: 3000
          };
        }
      });
    }
  }

  getAllOrdersList() {
    let orders: any[] = [];
    this.allOrders = [];
    this.allTempOrderList = [];
    const params = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo
    };
    this.orderService.getOrderDetailsByIpdId(params, true).subscribe(res => {
      const masterKeys = Object.keys(res);
      this.masterCategories = [];
      _.forEach(masterKeys, (key) => {
        const name = key.substring(0, key.indexOf('Orders'));
        const obj = {
          orderKey: key,
          orderName: this.orderNamecapitalize(name)
        };
        this.masterCategories.push(obj);
        orders = this.storeOrderByCategory(key, this.orderNamecapitalize(name), _.clone(res[key]));
        this.allOrders = this.allOrders.concat(_.clone(orders));
      });
      this.allTempOrderList = _.clone(this.allOrders);
      this.setInitialStatusCount();
      // extract unique
      this.orderByRecords = _.uniqBy(this.orderByRecords, (e) => {
        return e.user_id;
      });
      this.approvedByRecords = _.uniqBy(this.approvedByRecords, (e) => {
        return e.user_id;
      });
      this.sortingOrderList(this.selectedSortkey);
    });
  }

  setInitialStatusCount() {
    this.allFilterCount = _.filter(this.allOrders, res => res).length;
    this.statusText = `ALL (${this.allFilterCount})`;
    this.pendingWithMeCount = +this.getStatusFilterList('approvelPending', 'count');
    this.approvedCount = +this.getStatusFilterList('approved', 'count');
    this.rejectedCount = +this.getStatusFilterList('rejected', 'count');
    this.myAllOrderCount = +this.getStatusFilterList('myAllorder', 'count');
    this.unApprovedCount = +this.getStatusFilterList('unApproved', 'count');
    this.completedCount = +this.getStatusFilterList('completed', 'count');
  }

  storeOrderByCategory(key, name, list) {
    // set categoryKey on each object
    _.forEach(list, (o, k) => {
      o.categoryKey = key;
      o.categoryName = name;
      o.isSelected = false;
      o.isDisbale = o.order_by.user_id === this.userId && o.status === 'INITIATED' ? false : true; // enable for pendingwithme orders
      if (key === 'medicineOrders') {
        o.name = o.medicineObj.name;
      }
      // filter unique order by from result
      if (o.order_by !== null && o.order_by !== undefined &&
        o.order_by.user_id !== 0 && o.order_by.user_id !== null) {
        this.orderByRecords.push(o.order_by);
      }
      if (o.approved_by !== null && o.approved_by !== undefined &&
        o.approved_by.user_id !== 0 && o.approved_by.user_id !== null) {
        this.approvedByRecords.push(o.approved_by);
      }
    });
    return list;
  }

  orderNamecapitalize(name) {
    if (typeof name !== 'string') {
      return '';
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
    this.getAllOrdersList();
    this.orderService.getOrderStatusMaster().subscribe(res => {
      this.orderStatusMasterList = res;
    });
  }

  filterByCategoryKey(eventList) {
    this.isShowBulkapproveBtn = false;
    this.statusText = `ALL (${this.allFilterCount})`;
    let filters = {};
    if (_.isArray(eventList)) { // selectAll/deselect all
      this.selectedCategoryList = [];
      filters = { orderStatusList: eventList };
    } else if (_.isObject(eventList)) { // on single/more then one category
      const indx = _.findIndex(this.selectedCategoryList, (o) => o.orderKey === eventList.orderKey);
      indx !== -1 ? this.selectedCategoryList.splice(indx, 1) : this.selectedCategoryList.push(eventList);
      filters = { orderStatusList: this.selectedCategoryList };
    }
    this.allOrders = this.orderListFilterPipe.transform(_.clone(this.allTempOrderList), filters, true);
  }

  sortingOrderList(event) {
    if (event) {
      this.selectedSubSortKey = event === 'order_by' || event === 'approved_by' ? 'user_name' : null;
      this.allOrders = this.orderByList.transform(_.clone(this.allOrders),
        this.selectedSortkey, this.selectedSortType, this.selectedSubSortKey);
    }
  }

  onFilterClick(searchText: string, text: number) {
    this.filterBy = searchText;
    this.statusText = searchText === 'approvelPending' ? `Pending With Me (${text})` :
      searchText === 'approved' ? `Approved Orders (${text})` :
        searchText === 'rejected' ? `Rejected Orders (${text})` :
          searchText === 'myAllorder' ? `My Orders (${text})` :
            searchText === 'completed' ? `Completed Orders (${text})` :
              searchText === 'unApproved' ? `UnApproved Orders (${text})` :
                `All (${text})`;
    // -- send filtered value to child component which we want to filter
    this.isShowBulkapproveBtn = false;
    this.selectedCategoryName = null;
    this.selectedSortkey = 'order_date';
    this.allOrders = searchText ? this.getStatusFilterList(searchText, 'list') : _.clone(this.allTempOrderList);
  }

  getStatusFilterList(filterBy, returnType) {
    // pendingwithMe = userId + initiated // myOrder = userId + AllStaus
    // approveOrder = approved staus // rejectedOrder = defer status // unApproved Order = all initiated
    const statusFilter = {
      userId: 0,
      status: ''
    };
    const listwithKey = {};
    const allorderList = _.clone(this.allTempOrderList);
    switch (filterBy) {
      case 'approvelPending':
        statusFilter.userId = this.userId;
        statusFilter.status = 'INITIATED';
        break;
      case 'myAllorder':
        statusFilter.userId = this.userId;
        statusFilter.status = '';
        break;
      case 'approved':
        statusFilter.userId = 0;
        statusFilter.status = 'APPROVED';
        break;
      case 'rejected':
        statusFilter.userId = 0;
        statusFilter.status = 'DEFER';
        break;
      case 'unApproved':
        statusFilter.userId = 0;
        statusFilter.status = 'INITIATED';
        break;
      case 'completed':
        statusFilter.userId = 0;
        statusFilter.status = 'COMPLETE';
        break;
    }
    let lengthCount = 0;
    const filterList = this.orderListFilterPipe.transform(allorderList, false, false, false, statusFilter);
    lengthCount = lengthCount + filterList.length;
    if (returnType === 'list') {
      this.isShowBulkapproveBtn = filterList.length > 0 && filterBy === 'approvelPending' ? true : false;
      return filterList;
    } else if (returnType === 'count') {
      return lengthCount;
    }
  }

  isBulkApprovedExist() {
    // pendingwithme filter
    this.isShowBulkapproveBtn = _.filter(this.allOrders, (o) => o.order_by.user_id === this.userId
      && o.status === 'INITIATED' && o.isSelected).length > 0 ? true : false;
    this.isSelectedAll = _.filter(this.allOrders, (o) => o.order_by.user_id === this.userId
      && o.status === 'INITIATED' && o.isSelected).length === this.allOrders.length ? true : false;
  }

  selectAllOrder() {
    _.map(this.allOrders, (o) => {
      o.isSelected = this.isSelectedAll;
    });
  }

  allOrderStatusUpdate() {
    // Bulk Approve
    const actionArray = [];
    const pendingwithList = _.filter(this.allOrders, (o) => o.order_by.user_id === this.userId
      && o.status === 'INITIATED' && o.isSelected);
    if (!pendingwithList.length) {
      this.alertMsg = {
        message: 'Please Select Orders(s) To Approve.',
        messageType: 'warning',
        duration: 3000
      };
      return;
    }
    _.map(pendingwithList, (o) => {
      const obj = {
        order_category_key: o.categoryKey,
        order_item_id: o.id,
        status: 'APPROVED',
        action: '',
      };
      actionArray.push(obj);
    });
    this.saveOrderAction(actionArray);
  }

  saveOrderActionFromPopup(order): Observable<any> {
    const param = {
      user_id: this.userId,
      items: [{
        order_item_id: order.id,
        order_category_key: order.categoryKey,
        status: 'DISCARD'
      }]
    };
    return this.orderService.SaveOrderAction(param).pipe(map(dt => {
      return dt;
    }));
  }

  discardOrder(data, index) {
    let name = '';
    if (data.categoryKey === 'medicineOrders') {
      name = data.medicineObj.name;
    } else {
      name = data.name;
    }
    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Do you want to Discard ?',
      selectedOrder: data,
      orderStatus: data.status,
      showEditButton: false
    };
    const modalInstance = this.modalService.open(ConfirmationOrderPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'sm',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result) {
        this.saveOrderActionFromPopup(data).subscribe(dt => {
          this.getAllOrdersList();
        });
      }
    }, (dis) => {

    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  editOrder(data, index) {
    if (data.categoryKey === 'medicineOrders') {
      let medicineOrdersList = [];
      this.orderService.getOrderData('medicineOrders').subscribe(result => {
        medicineOrdersList = (_.isArray(result)) ? result : [];
        const medOrder = new MedicineOrders();
        _.map(medicineOrdersList, (o, i) => {
          medOrder.generateObject(o, false);
          medicineOrdersList[i] = _.clone(medOrder);
        });
        this.allOrders[index].isDirty = true;
        medicineOrdersList.push(this.allOrders[index]);
        this.orderService.setOrderData(medicineOrdersList, 'update', 'medicineOrders');
        this.navigate('patient/orders/medicine/' + this.patientId, 'order_medicine');
      });
    } else if (data.categoryKey === 'radiologyOrders') {
      let radiologyOrderList = [];
      this.orderService.getOrderData('radiologyOrders').subscribe(result => {
        radiologyOrderList = result;
        const radiologyModel = new RadiologyOrder();
        _.map(radiologyOrderList, (rol, i) => {
          if (radiologyModel.isObjectValid(rol)) {
            radiologyModel.generateObject(rol);
            radiologyOrderList[i] = _.cloneDeep(radiologyModel);
          }
        });
        this.allOrders[index].isDirty = true;
        radiologyOrderList.push(this.allOrders[index]);
        this.orderService.setOrderData(radiologyOrderList, 'update', 'radiologyOrders');
        this.navigate('patient/orders/radiology/' + this.patientId, 'order_radiology');
      });
    } else if (data.categoryKey === 'labOrders') {
      let labOrderList = [];
      this.orderService.getOrderData('labOrders').subscribe(result => {
        labOrderList = result;
        const lab = new LabOrders();
        _.map(labOrderList, (obj, i) => {
          if (lab.isObjectValid(obj)) {
            lab.generateObject(obj);
            labOrderList[i] = _.clone(lab);
          }
        });
        this.allOrders[index].isDirty = true;
        labOrderList.push(this.allOrders[index]);
        this.orderService.setOrderData(labOrderList, 'update', 'labOrders');
        this.navigate('patient/orders/lab/' + this.patientId, 'order_lab');
      });
    } else if (data.categoryKey === 'dietOrders') {
      let dietOrderList = [];
      this.orderService.getOrderData('dietOrders').subscribe(result => {
        dietOrderList = result;
        const diet = new DietOrder();
        _.map(result, (obj) => {
          if (diet.isObjectValid(obj)) {
            diet.generateObject(obj);
            dietOrderList.push(diet);
          }
        });
        this.allOrders[index].isDirty = true;
        dietOrderList.push(this.allOrders[index]);
        this.orderService.setOrderData(dietOrderList, 'update', 'dietOrders');
        this.navigate('patient/orders/diet/' + this.patientId, 'order_diet');
      });
    } else if (data.categoryKey === 'nursingOrders') {
      let nursingOrders = [];
      this.orderService.getOrderData('nursingOrders').subscribe(result => {
        const nursing = new NursingOrder();
        nursingOrders = result;
        _.map(nursingOrders, (obj, i) => {
          if (nursing.isObjectValid(obj)) {
            nursing.generateObject(obj);
            nursingOrders[i] = _.clone(nursing);
          }
        });
        this.allOrders[index].isDirty = true;
        nursingOrders.push(this.allOrders[index]);
        this.orderService.setOrderData(nursingOrders, 'update', 'nursingOrders');
        this.navigate('patient/orders/nursing/' + this.patientId, 'order_nursing');
      });
    } else if (data.categoryKey === 'serviceOrders' || 'instructionOrders' === data.categoryKey) {
      const otherServiceandNotesOrderList = [];
      const doctorInstructionOrderList = [];
      this.orderService.getOrderData('otherOrders').subscribe(result => {
        const doctorInfo = new DoctorInformationOrder();
        _.map(result.docInstructionOrder, (rol) => {
          if (doctorInfo.isObjectValid(rol)) {
            doctorInfo.generateObject(rol);
            doctorInstructionOrderList.push(_.cloneDeep(doctorInfo));
          }
        });
        const otherService = new OtherServicesOrder();
        _.map(result.servicesOrder, (obj) => {
          if (otherService.isObjectValid(obj)) {
            otherService.generateObject(obj);
            otherServiceandNotesOrderList.push(_.cloneDeep(otherService));
          }
        });
        this.allOrders[index].isDirty = true;
        if ('instructionOrders' === data.categoryKey) {
          doctorInstructionOrderList.push(this.allOrders[index]);
        }
        if (data.categoryKey === 'serviceOrders') {
          otherServiceandNotesOrderList.push(this.allOrders[index]);
        }
        const objOrdr = {
          docInstructionOrder: doctorInstructionOrderList,
          servicesOrder: otherServiceandNotesOrderList,
        };
        this.orderService.setOrderData(objOrdr, 'update', 'otherOrders');
        this.navigate('patient/orders/other/' + this.patientId, 'order_other');
      });
    }
  }

  navigate(navigateURL, order?) {
    if (order) {
      // set subject
      this.patientService.setInputToSideBar.next({ source: 'order', data: { orderName: order } });
      navigateURL = '/emr/' + navigateURL;
      this.router.navigate([navigateURL]);
      return;
    }
    navigateURL = 'dashboard/patientDashboard/' + navigateURL + '/';
    this.router.navigate([navigateURL, 'ipd', this.patientId]);
  }
}

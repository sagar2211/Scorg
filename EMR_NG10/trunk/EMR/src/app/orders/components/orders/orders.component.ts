import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { MedicineOrders } from './../../../public/models/medicine-orders';
import {
  Component,
  OnChanges,
  OnInit,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
  ComponentFactoryResolver,
  AfterViewInit
} from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { PublicService } from './../../../public/services/public.service';
import { IOrdersCategory } from './../../../public/models/iorders';
import { OrderService } from '../../../public/services/order.service';
import { IConsultationSectionComponent } from './../../../public/models/iConsultationSectionComponent';
import { ComponentsService } from './../../../public/services/components.service';
import { ConsultationService } from './../../../public/services/consultation.service';
// import { IAlert } from './../../../models/ialert';
import { IAlert } from './../../../public/models/AlertMessage';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { OrderSetComponent } from '../../order-set/order-set.component';
import { OrderSetComponent } from '../order-set/order-set.component';
import { ReviewOrdersComponent } from '../review-orders/review-orders.component';
import * as moment from 'moment';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Constants } from './../../../config/constants';
import { CommonService } from './../../../public/services/common.service';
import { AuthService } from './../../../public/services/auth.service';
import { AddEditOrderSetComponent } from '../add-edit-order-set/add-edit-order-set.component';
import { PatientService } from './../../../public/services/patient.service';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  userId: number;
  patientId: any;
  filterBy = 'all';
  allFilterCount = 0;
  pendingWithMeCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  isComponentsLoaded = false;
  isOrderListVisible = true;
  isOrderSetListVisible = false;
  searchKeyword: any;
  activeOrderPanels: any[] = [];
  allOrders: any[] = [];
  suggestionPanelSetting: any;
  masterCategories: IOrdersCategory[];
  alertMsg: IAlert;
  locationId: number;
  copyOfOrdersList: any = {};
  sideBarArray: any = [];
  componentList: any[] = [];
  closeResult: string;
  allOrdersListWithKey: any; // -- store all orders with keys like med, lab
  selectedComp: any;
  isSet = false;
  selectedComponentRef: any;
  statusText: any;
  unsavedCount = 0;
  ordersLoading = false;
  isAddPanelOpen = false;
  hasApprovalPending = false;
  patProfileIsOpen = true;
  patientObj: EncounterPatient;
  currentSection = '';
  boxShadow = false;
  prevPath = '';
  isFormDisable = false;
  suggestionPanelSettings: any;
  isOnload: boolean;
  showInputSearchBox = true;
  isFrom: any;
  $destroy: Subject<boolean> = new Subject();
  loadSuggestion = false;
  initialized = false;
  userInfo: any;
  activeOrderMenuName = '';
  loadOrderSetList = false;
  editOrderSetData: any;
  sideBarOrderMenuList = [];
  careTeamUserList: Array<any> = [];
  selectedorderByUser: any;
  afterSaveFormClear: boolean = false;
  disableSaveReviewButton: boolean;
  // @ViewChild('unsavedOrderRef', { read: ViewContainerRef }) unsavedOrderDisContainer: ViewContainerRef;
  @ViewChild('saveOrderRef', { static: false, read: ViewContainerRef }) savedOrderContainer: ViewContainerRef;
  @ViewChild('displayForms', { static: false, read: ViewContainerRef }) displayFormContainer: ViewContainerRef;
  @ViewChild('suggestionPanel', { static: false }) suggestionPanelComp: any;

  constructor(
    public publicService: PublicService,
    private orderService: OrderService,
    private consultationService: ConsultationService,
    private componentsService: ComponentsService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private authService: AuthService,
    private patientService: PatientService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkCurrentActive();
      }
    });
  }

  ngOnInit() {
    this.getpatientData();
    this.initialized = true;
    this.subcribeEvents();
    this.orderService.selectedDoctorForOrder = null;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings.suggestionIsShow = true;
    this.suggestionPanelSettings.suggestionPin = 'pin';
    this.isOnload = false;
    // this.checkCurrentActive();
    this.isFrom = { sectionName: 'Medicine Orders', sectionKeyName: 'medicineOrders', modelpopup: 'OrdersPopup' };
    this.orderService.getOrderStatusMaster().subscribe();
    const localOrderSetEditData = this.orderService.getOrderData('patientOrderSetEditData', true);
    this.editOrderSetData = (localOrderSetEditData) ? localOrderSetEditData : undefined;
    this.sideBarOrderMenuList = this.patientService.getOrdersMenuList(this.patientId);
    this.getCareTeamUserList();
    this.getSettingData();
    this.checkifOrdersIsEmpty(this.isOrderExist());
  }

  ngOnChanges() {
  }

  ngAfterViewInit() {
    this.showOrderList();
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.isAddPanelOpen = false;
    this.modalService.dismissAll();
  }

  // Same code for ngInit also
  loadOnListToggle() {
    this.selectedComponentRef = {};
    this.allOrdersListWithKey = {};
    this.selectedComp = '';
    this.suggestionPanelSetting = this.publicService.rightPanelSetting;
    this.activeOrderPanels = ['medicineOrders'];
    this.userId = +this.authService.getLoggedInUserId();
    this.locationId = Constants.EMR_IPD_USER_DETAILS.locationId;
    this.route.data.subscribe((res: any) => {
      this.isFormDisable = res.permissions ? res.permissions.isView : true;
    });
    this.route.queryParams.subscribe(result => {
      this.prevPath = (_.isEmpty(result) || (!_.isEmpty(result) && _.isUndefined(result.from))) ? '' : result.from;
    });
    // this.consultationService.getPatientObj('patientId', true).subscribe((res) => {
    //   this.patientId = Constants.EMR_IPD_USER_DETAILS.patientId;
    if (this.patientId && !(this.componentList.length > 0)) {
      this.getAllCategories();
    }
    // });

    // this.getSuggestionSetting();
    // this.toggleAddSection(false, this.selectedPanel, this.isPanelOpen, this.isAddSectionVisible, true);
    // -- dynamic content
    this.statusText = this.pendingWithMeCount !== 0 ? `Pending With Me (${this.pendingWithMeCount})` : this.allFilterCount > 0 ? `All (${this.allFilterCount})` : `All`;
    if (this.pendingWithMeCount !== 0) {
      this.onFilterClick('approvelPending', this.pendingWithMeCount);
    }

  }

  getSetOrderDetails() {
    const params = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo,
    };
    this.orderService.getOrderDetailsByIpdId(params).subscribe(result => {
      this.getAllOrdersCount();
      const displayComponents = this.masterCategories.filter((mc: any) => mc.display === true);
      this.loadChildComponents(displayComponents);
    });
  }

  // -- get all orders categories.
  getAllCategories(): void {
    const self = this;
    const requestParams = {
      serviceTypeId: this.patientObj.serviceType.id,
    };
    this.orderService.getAllMasterOrderCategories(requestParams).pipe(takeUntil(this.$destroy)).subscribe(res => {
      this.masterCategories = res;
      const displayComponents = this.masterCategories.filter((mc: any) => mc.display === true);
      const isLocalOrdersExist = true;
      _.forEach(this.masterCategories, (o) => {
        if (o.orderKey === 'otherOrders') {
          const obj = {
            docInstructionOrder: [],
            servicesOrder: []
          };
          self.orderService.setOrderData(obj, 'update', o.orderKey);
        } else {
          self.orderService.setOrderData([], 'update', o.orderKey);
        }
        // check if key exist or not. If not exist, call API.
        // const localOrder = self.consultationService.getConsultationFormDataByKey(self.patientId, o.orderKey, true);
        // if (!localOrder) {
        //   isLocalOrdersExist = false;
        //   return false;
        // }
      });
      // if (!isLocalOrdersExist) {
      // set local order.
      // this.getSetOrderDetails();
      // } else {
      this.getAllOrdersCount();
      this.loadChildComponents(displayComponents);
      // }
    });
  }

  // -- load selected components in container
  loadChildComponents(compList, loadSelectedComSectionIndex?) {
    if (!compList.length) {
      this.componentList = [];
      return;
    }
    this.isComponentsLoaded = true;
    // this.componentList = _.sortBy(compList, 'orderName');
    this.componentList = compList;
    // this.currentSection = this.componentList[2]['orderKey'];
    const currentSectionIndex = _.findIndex(this.componentList, (o) => o.orderKey === this.currentSection);
    if (currentSectionIndex === -1) {
      return;
    }
    this.selectedComp = this.componentList[currentSectionIndex];
    // const viewContainerRef = this.unsavedOrderDisContainer;
    // viewContainerRef.clear();
    // compList.forEach(item => {
    //   item['component'] = this.componentsService.getComponentDetailsByKey(item.orderKey)['component']; // -- to get component instance
    //   const componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);
    //   const componentRef = viewContainerRef.createComponent(componentFactory);
    //   componentRef.instance['activeIds'] = this.activeOrderPanels;
    //   componentRef.instance['filterBy'] = this.filterBy;
    //   componentRef.instance['orderCatId'] = item.orderId;
    //   const dataObj = {
    //     name: item.orderName,
    //     orderCatId: item.orderId,
    //     filterBy: this.filterBy,
    //     key: item.key
    //   };
    //   (<IConsultationSectionComponent>componentRef.instance).data = dataObj;
    // });
    // this.isComponentsLoaded = false;

    // Commented unsaved components list---------------------->
    // this.loadUnsavedCompList(compList);
    this.loadSavedCompList(this.componentList);
  }

  // loadChildComponents(compList) {
  //   if (!compList.length) {
  //     this.componentList = [];
  //     return;
  //   }
  //   this.isComponentsLoaded = true;
  //   this.componentList = compList;
  //   const viewContainerRef = this.ordersContainer;
  //   viewContainerRef.clear();
  //   compList.forEach(item => {
  //     item['component'] = this.componentsService.getComponentDetailsByKey(item.orderKey)['component']; // -- to get component instance
  //     const componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);
  //     const componentRef = viewContainerRef.createComponent(componentFactory);
  //     componentRef.instance['activeIds'] = this.activeOrderPanels;
  //     componentRef.instance['filterBy'] = this.filterBy;
  //     componentRef.instance['orderCatId'] = item.orderId;
  //     const dataObj = {
  //       name: item.orderName,
  //       orderCatId: item.orderId,
  //       filterBy: this.filterBy,
  //       key: item.key
  //     };
  //     (<IConsultationSectionComponent>componentRef.instance).data = dataObj;
  //   });
  //   this.isComponentsLoaded = false;
  // }

  getSuggestionSetting() {
    this.publicService.getDoctorSettings(Constants.EMR_IPD_USER_DETAILS.docId, 'suggestionSettings').subscribe(res => {
      if (_.isString(res)) {
        res = JSON.parse(res);
      }
      if (!_.isUndefined(res.showSuggestion)) {
        // this.suggestionPanelSetting.showSuggestion = res.showSuggestion;
        // if (consultation.calWidth <= 1280) { // -- for Ipad or lower devices
        //  this.suggestionPanelSetting.suggestionPin = res.suggestionPin || true;
        // } else {
        this.suggestionPanelSetting.suggestionPin = res.suggestionPin || false;
        this.suggestionPanelSetting.suggestionIsShow = res.suggestionPin ? true : false;
        this.suggestionPanelSetting.showMiniSuggestion = res.suggestionPin ? false : true;
        // }
        // this.suggestionPanelSetting.opdHeadsIsShow = this.suggestionPanelSetting.suggestionPin ? false : true;
        // this.suggestionPanelSetting.opdHeadsPin = this.suggestionPanelSetting.suggestionPin ? false : true;
      } else {
        // this.suggestionPanelSetting.showSuggestion = true;
        this.suggestionPanelSetting.suggestionPin = false;
        // this.suggestionPanelSetting.opdHeadsIsShow = true;
        // this.suggestionPanelSetting.opdHeadsPin = true;
      }
    });
  }

  suggestionPinUnpinSettings(option, init?) {
    const isSuggestionPined = _.cloneDeep(this.suggestionPanelSetting.suggestionPin);
    let suggestionsData: any;

    // change pin / unpin / close suggestion setting
    this.suggestionPanelSetting.suggestionIsShow = (option !== 'close');
    this.suggestionPanelSetting.suggestionPin = (option === 'pin') ? !this.suggestionPanelSetting.suggestionPin : ((option === 'unpin') ? false : this.suggestionPanelSetting.suggestionPin);
    this.suggestionPanelSetting.showMiniSuggestion = (option === 'close');
    // this.suggestionPanelSetting.opdHeadsIsShow = (option != 'pin');
    // this.suggestionPanelSetting.opdHeadsPin = (option != 'pin');

    // if suggestion is not pined and closed then no need to update setting
    if (option === 'close' && !isSuggestionPined) {
      return;
    }
    // if (this.calWidth <= 1280) {
    //     suggestionsData = {showSuggestion: true, suggestionPin: true};
    // } else {
    suggestionsData = { showSuggestion: true, suggestionPin: (option === 'pin') };
    // }
    if (!init) {
      this.publicService.saveDoctorSettings(this.userId, 'suggestionSettings', suggestionsData).subscribe();
    }
  }

  onMiniSuggestionClick(flag): void {
    this.suggestionPanelSetting.suggestionIsShow = !this.suggestionPanelSetting.suggestionIsShow;
    // this.suggestionPanelSetting.suggestionPin = this.suggestionPanelSetting.suggestionIsShow;
    this.suggestionPanelSetting.showMiniSuggestion = !this.suggestionPanelSetting.suggestionIsShow;
  }

  // --save all orders
  saveOrders(flag?) {
    if (this.selectedorderByUser) {
      this.afterSaveFormClear = false;
      const forkJoins: any[] = [];
      forkJoins.push(this.orderService.getOrderData('dietOrders')); // -- for diet order components
      forkJoins.push(this.orderService.getOrderData('nursingOrders')); // -- for nursing order components
      forkJoins.push(this.orderService.getOrderData('radiologyOrders')); // -- for radiology order components
      forkJoins.push(this.orderService.getOrderData('medicineOrders')); // -- for medicine order components
      forkJoins.push(this.orderService.getOrderData('labOrders')); // -- for lab order components
      forkJoins.push(this.orderService.getOrderData('otherOrders')); // -- for lab order components
      forkJoin(forkJoins).subscribe(([dietOrd, nursOrd, radioOrd, medOrder, labOrder, otherOrders]) => {
        const reqParams = {
          docId: this.selectedorderByUser.user_id, // this.userId,
          visitNo: this.patientObj.visitNo,
          serviceTypeId: this.patientObj.serviceType.id,
          userId: this.userId,
          patientId: this.patientId,
          order_data: {
            dietOrders: this.getOnlyDirtyObject(dietOrd, 'dietOrders', flag),
            nursingOrders: this.getOnlyDirtyObject(nursOrd, 'nursingOrders', flag),
            radiologyOrders: this.getOnlyDirtyObject(radioOrd, 'radiologyOrders', flag),
            medicineOrders: this.getOnlyDirtyObject(medOrder, 'medicineOrders', flag),
            labOrders: this.getOnlyDirtyObject(labOrder, 'labOrders', flag),
            doctorInstructionOrders: this.getOnlyDirtyObject(otherOrders['docInstructionOrder'], 'otherOrders', flag),
            doctorServiceOrders: this.getOnlyDirtyObject(otherOrders['servicesOrder'], 'otherOrders', flag)
          }
        };
        // format medicine orders object
        this.prepareMedicineOrderForRequest(reqParams.order_data.medicineOrders);
        if ((flag === 'approveAll' || flag === 'reject') && !this.checkifOrdersHasApprovalPending(reqParams.order_data)) {
          this.alertMsg = {
            message: 'Please select at least one order to ' + flag,
            messageType: 'warning',
            duration: 3000
          };
          return;
        } else if (this.checkifOrdersIsEmpty(reqParams.order_data)) {
          this.alertMsg = {
            message: 'Please add orders',
            messageType: 'warning',
            duration: 3000
          };
          return;
        } else {
          // unsavedCount update after save order.
          _.forEach(reqParams.order_data, (value) => {
            if (_.isArray(value)) {
              _.forEach(value, (val) => {
                if (!val.isDirty) {
                  this.unsavedCount = this.unsavedCount !== 0 ? this.unsavedCount - 1 : 0;
                  // update status for pendingStatus.(reject or approve) before save on db.
                  if (val.status === 'approvelPending' && val.tempstatus === 'approved') {
                    // user can update reject status from pendingStatus  only from rejecte button on click event.
                    val.status = (flag === 'reject') ? 'rejected' : 'approved';
                  }
                }
              });
            }
            const statusString = this.statusText.split(' ');
            if (statusString[0] === 'Unsaved') {
              this.statusText = `Unsaved Orders (${this.unsavedCount})`;
            }
          });
        }

        // check if edit order set mode is on
        if (this.editOrderSetData !== undefined && this.editOrderSetData.length) {
          this.saveEditOrderSetDetails(reqParams.order_data);
          return;
        }
        reqParams.order_data.dietOrders = reqParams.order_data.dietOrders.filter(d => {
          return d.tempId ? true : false;
        });
        reqParams.order_data.doctorInstructionOrders = reqParams.order_data.doctorInstructionOrders.filter(d => {
          return d.tempId ? true : false;
        });
        reqParams.order_data.doctorServiceOrders = reqParams.order_data.doctorServiceOrders.filter(d => {
          return d.tempId ? true : false;
        });
        reqParams.order_data.labOrders = reqParams.order_data.labOrders.filter(d => {
          return d.tempId ? true : false;
        });
        reqParams.order_data.medicineOrders = reqParams.order_data.medicineOrders.filter(d => {
          return d.tempId ? true : false;
        });
        reqParams.order_data.nursingOrders = reqParams.order_data.nursingOrders.filter(d => {
          return d.tempId ? true : false;
        });
        reqParams.order_data.radiologyOrders = reqParams.order_data.radiologyOrders.filter(d => {
          return d.tempId ? true : false;
        });
        this.orderService.saveAllOrders(reqParams).subscribe((res: any) => {
          // after save clear local object.
          this.afterSaveFormClear = true;
          _.forEach(this.masterCategories, (o) => {
            if (o.orderKey === 'otherOrders') {
              const otehrOrderData = {
                docInstructionOrder: [],
                servicesOrder: []
              }
              this.orderService.setOrderData(otehrOrderData, 'update', o.orderKey);
            } else {
              this.orderService.setOrderData([], 'update', o.orderKey);
            }
          });
          this.copyOfOrdersList = {};
          this.alertMsg = {
            message: 'All Orders Saved Successfully.',
            messageType: 'success',
            duration: 3000
          };
          this.openSuggestions();
        });
      });
    } else {
      this.alertMsg = {
        message: 'Please Select Doctor to save Order',
        messageType: 'warning',
        duration: 3000
      };
    }
  }
  checkifOrdersHasApprovalPending(orderData) {
    this.hasApprovalPending = false;
    _.forEach(orderData, (objectList) => {
      this.hasApprovalPending = _.some(objectList, res => res.status === 'approvelPending' && res.tempstatus === 'approved');
      if (this.hasApprovalPending) {
        return false;
      }
    });
    return this.hasApprovalPending;
  }

  getOnlyDirtyObject(orderList, source?, flag?): any[] {
    const filteredArr = _.filter(_.cloneDeep(orderList), mol => !!((!mol.id || mol.id === undefined || mol.id === '') || mol.isDirty));
    this.copyOfOrdersList[source] = orderList;
    _.map(filteredArr, fa => {
      fa.isDirty = false;
      fa.id = fa.id ? fa.id : '0';
    });
    return filteredArr;
  }

  mergeFilteredStatusWithOld(mode, status, id?) {
    switch (status) {
      case 'approved':
        if (mode === 'added') {
          this.approvedCount = this.approvedCount + 1;
          this.allFilterCount = this.allFilterCount + 1;
          this.unsavedCount = this.unsavedCount + 1;
        } else if (mode === 'update') {
          this.pendingWithMeCount = this.pendingWithMeCount - 1;
          this.approvedCount = this.approvedCount + 1;
        } else if (mode === 'removed') {
          this.approvedCount = this.approvedCount - 1;
          this.allFilterCount = this.allFilterCount - 1;
          this.unsavedCount = this.unsavedCount - 1;
        }
        this.statusText = this.getmergeFilterStatusText();
        break;
      case 'approvelPending':
        if (mode === 'added') {
          this.pendingWithMeCount = this.pendingWithMeCount + 1;
          this.allFilterCount = this.allFilterCount + 1;
          this.unsavedCount = this.unsavedCount + 1;
        } else if (mode === 'update') {
          this.pendingWithMeCount = this.pendingWithMeCount + 1;
          this.approvedCount = this.approvedCount - 1;
        } else if (mode === 'removed') {
          this.pendingWithMeCount = this.pendingWithMeCount - 1;
          this.allFilterCount = this.allFilterCount - 1;
          this.unsavedCount = this.unsavedCount - 1;
        }
        this.statusText = this.getmergeFilterStatusText();
        break;
      case 'rejected':
        if (mode === 'update') {
          this.rejectedCount = this.rejectedCount + 1;
          this.pendingWithMeCount = this.pendingWithMeCount - 1;
        }
        this.statusText = this.getmergeFilterStatusText();
        break;
      case 'unsaveStatus':
        if (mode === 'update') {
          this.unsavedCount = this.unsavedCount + 1;
        } else if (mode === 'remove') {
          this.unsavedCount = this.unsavedCount - 1;
        }
        this.statusText = this.getmergeFilterStatusText();
        break;
    }
  }

  getmergeFilterStatusText() {
    const statusString = this.statusText.split(' ');
    return (statusString[0] === 'Pending') ? `Pending With Me (${this.pendingWithMeCount})` :
      (statusString[0] === 'Approved') ? `Approved Orders (${this.approvedCount})` :
        (statusString[0] === 'Rejected') ? `Rejected Orders (${this.rejectedCount})` :
          (statusString[0] === 'Unsaved' && statusString[0] !== 'All') ? `Unsaved Orders (${this.unsavedCount})` :
            `All (${this.allFilterCount})`;

  }

  onFilterClick(searchText: string, text: number) {
    this.filterBy = searchText;
    this.statusText = searchText === 'approvelPending' ? `Pending With Me (${text})` :
      searchText === 'approved' ? `Approved Orders (${text})` :
        searchText === 'unsaved' ? `Unsaved Orders (${text})` :
          searchText === 'rejected' ? `Rejected Orders (${text})` :
            `All (${text})`;
    // -- send filtered value to child component which we want to filter
    this.orderService.setFilteredValue({
      mode: '',
      filterBy: searchText,
      activeIds: ['medicineOrders', 'labOrders', 'radiologyOrders', 'dietOrders', 'nursingOrders']
    });
  }

  getAllOrdersCount() {
    let orders: any[] = [];
    _.forEach(this.masterCategories, (o) => {
      const orderData = this.orderService.getOrderData(o.orderKey, true);
      orders = orders.concat(orderData);
      this.allOrders = orders;
      this.storeOrderByCategory(o.orderKey, orderData);
      // this.unsavedCount = _.filter(this.allOrders, (all) => all.isDirty == true).length;
    });

    this.ordersLoading = true;
    this.setInitialStatusCount(this.allOrders);
    this.statusText = this.pendingWithMeCount !== 0 ? `Pending With Me (${this.pendingWithMeCount})` : this.allFilterCount > 0 ? `All (${this.allFilterCount})` : `All`;
    if (this.pendingWithMeCount !== 0) {
      this.onFilterClick('approvelPending', this.pendingWithMeCount);
    }
  }
  setInitialStatusCount(orders: any[]) {
    this.allFilterCount = _.filter(orders, res => res).length;
    this.pendingWithMeCount = _.filter(orders, res => res.status === 'approvelPending').length;
    this.approvedCount = _.filter(orders, res => res.status === 'approved').length;
    this.rejectedCount = _.filter(orders, res => res.status === 'rejected').length;
  }
  subcribeEvents() {
    this.orderService.$subcGetChildData.subscribe((res: any) => {
      this.mergeFilteredStatusWithOld(res.mode, res.status);
    });

    // -- event fired when data need to be editted
    this.orderService.$subcEditEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if ('editData' === res.mode) {
        const selectedCompForEdit = _.find(this.componentList, (o) => {
          return o.orderKey === res.key;
        });
        if (selectedCompForEdit) {
          this.selectedComp = selectedCompForEdit;
          this.loadSelectedForms(selectedCompForEdit, true, res);
        }
        // this.showAddSection = true;
        // this.onEditMedicineOrder(res.data, res.orderIndex);
      } else if (res.mode === 'delete' && !_.isEmpty(this.selectedComponentRef)) {
        this.selectedComponentRef.instance.clearForm();
      } else {

      }
    });

    this.publicService.$subPatProfileEvent.pipe(takeUntil(this.$destroy)).subscribe(res => {
      this.patProfileIsOpen = res;
    });

    this.orderService.$sideMenuOrderEvents.subscribe((res: any) => {
      this.mergeFilteredStatusWithOld(res.mode, res.status);
    });

    this.publicService.$updateOrderBy.subscribe((object: any) => {
      object.orderBy = this.selectedorderByUser ? this.selectedorderByUser : null;
    });

    this.orderService.$OrderErrorEvent.pipe(takeUntil(this.$destroy)).subscribe(res => {
      if (res) {
        this.alertMsg = {
          message: res.message,
          messageType: res.messageType,
          duration: Constants.ALERT_DURATION
        };
      }
    });

    this.orderService.$OrderSaveButtonEnableDisable.pipe(takeUntil(this.$destroy)).subscribe(res => {
      this.checkifOrdersIsEmpty(this.isOrderExist());
    });
  }

  checkifOrdersIsEmpty(orders) {
    const props = Object.keys(orders);
    let count = 0;
    props.forEach(rs => {
      if (_.isEmpty(orders[rs])) {
        count++;
      }
    });
    this.disableSaveReviewButton = (props.length === count);
    return (props.length === count);
  }

  getOrderSetPopup(): void {
    const modelInstance = this.modalService.open(OrderSetComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'lg'
    });
    modelInstance.result.then(result => {
      if (!_.isUndefined(result)) {
        const temp = [];
        result.medicineOrders.forEach(element => {
          const medicineOrder = new MedicineOrders();
          medicineOrder.generateObject({ ...element });
          temp.push(medicineOrder);
        });
        // medicineOrder.generateObject()
        result.medicineOrders = temp;
        this.setOrdersetData(result);
      }
    }, reason => {
      this.closeResult = `Dismissed ${reason}`;
    });
  }

  setOrdersetData(dataObject: any) {
    _.forEach(dataObject, (value, key) => {
      if (_.isArray(value)) {
        // generate new tempId
        let i = 0;
        _.map(value, (o) => {
          o['tempId'] = moment(new Date()).valueOf() + i;
          i++;
          o['isDirty'] = true;
        });
        this.orderService.getOrderData(key).subscribe((res: any) => {
          if (res.length > 0) {
            _.forEach(value, (val) => {
              // res.push(val);
              this.mergeFilteredStatusWithOld('added', 'approvelPending');
              this.orderService.setOrderData(val, 'add', key);
            });
          } else {
            this.mergeFilteredStatusWithOld('added', 'approvelPending');
            this.orderService.setOrderData(value, 'update', key);
            this.orderService.setFilteredValue({
              'mode': 'setData',
              'filterBy': key,
              'activeIds': ['medicineOrders', 'labOrders', 'radiologyOrders', 'dietOrders', 'nursingOrders']
            });
          }
          this.getAllOrdersCount();
        });
      }
    });
  }

  //  -- Store all orders with keys
  storeOrderByCategory(key, list) {
    if (!(this.allOrdersListWithKey.hasOwnProperty(key))) {
      this.allOrdersListWithKey[key] = list;
    }
  }

  loadSavedCompList(compList, showOrderList?) {
    compList = _.filter(compList, (o => {
      return o.orderKey === this.currentSection;
    }));
    const viewContainerRef = this.savedOrderContainer;
    viewContainerRef.clear();
    compList.forEach(item => {
      item['component'] = this.componentsService.getComponentDetailsByKey(item.orderKey)['component']; // -- to get component instance
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);
      const componentRef = viewContainerRef.createComponent(componentFactory);
      componentRef.location.nativeElement.setAttribute('id', item.orderKey);
      componentRef.instance['activeIds'] = this.activeOrderPanels;
      componentRef.instance['filterBy'] = this.filterBy;
      componentRef.instance['orderCatId'] = item.orderId;
      componentRef.instance['orderDisplayType'] = 'all';
      componentRef.instance['isOpen'] = true;
      componentRef.instance['showAddSection'] = false;

      const dataObj = {
        name: item.orderName,
        orderCatId: item.orderId,
        filterBy: this.filterBy,
        key: item.orderKey
      };
      (<IConsultationSectionComponent>componentRef.instance).data = dataObj;
    });
    this.isComponentsLoaded = false;
    this.isOrderListVisible = (showOrderList === undefined) ? this.isOrderListVisible : showOrderList;
  }

  loadSelectedForms(selectedCom, edit?, editData?): void {
    const viewContainerRef = this.displayFormContainer;
    viewContainerRef.clear();
    // compList.forEach(item => {
    // item['component'] = this.componentsService.getComponentDetailsByKey(item.orderKey)['component']; // -- to get component instance
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(selectedCom.component);
    const componentRef = viewContainerRef.createComponent(componentFactory);
    this.selectedComponentRef = componentRef;
    componentRef.location.nativeElement.setAttribute('id', selectedCom.orderKey);
    // componentRef.instance['activeIds'] = this.activeOrderPanels;
    componentRef.instance['showAddSection'] = true;
    componentRef.instance['orderCatId'] = selectedCom.orderId;
    componentRef.instance['publicService'].componentSectionClicked({
      sectionKeyName: selectedCom.orderKey
    });
    if (edit) {
      this.isAddPanelOpen = true;
      // const editFrm = editData.data;
      componentRef.instance['editData'] = editData;
    }
  }

  openCompForm(): void {
    if (this.selectedComp) {
      this.isSet = true;
      this.loadSelectedForms(this.selectedComp);
      // this.loadSelectedForms(this.selectedComp, true);
    }
  }

  closeForm(): void {
    const viewContainerRef = this.displayFormContainer;
    viewContainerRef.clear();
    this.isSet = false;
    this.isAddPanelOpen = false;
  }

  openOrderPopup(content): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'sm', windowClass: 'custom-modal', backdrop: 'static', keyboard: false }).result.then((result) => {
      this.isAddPanelOpen = true;
    }, (reason) => {

    });
  }

  getReviewOrdersPopup(): void {
    const modelInstanceReviewPopup = this.modalService.open(ReviewOrdersComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'lg'
    });
    modelInstanceReviewPopup.result.then(result => {
      if (result === 'save') {
        this.saveOrders('');
      }
    });
    modelInstanceReviewPopup.componentInstance.compList = this.componentList;
    modelInstanceReviewPopup.componentInstance.masterCategories = this.masterCategories;
  }
  getReviewOrdersPopupClose() {
    this.modalService.dismissAll();
  }

  approveAllPendingStatus() {
    // tempstatus(approved) its a flag to find out select and Deselect
    this.saveOrders('approveAll');
  }

  rejectPendingStatus() {
    // tempstatus(approved) its a flag to find out select and Deselect
    this.saveOrders('reject');
  }

  scrollTo(section, index) {
    this.currentSection = '';
    const dom: HTMLCollection = this.savedOrderContainer.element.nativeElement.parentNode.children;
    // const selectedDom = document.getElementsByTagName(dom[index].localName);
    // selectedDom[0].scrollIntoView();
    this.onSectionChange(section);
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
    this.boxShadow = true;
    // console.log(sectionId);
    const displayComponents = this.masterCategories.filter((mc: any) => mc.display === true);
    this.loadSuggestion = false;
    this.loadSavedCompList(displayComponents, false);
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

  showOrderList() {
    // this.isOrderListVisible = !this.isOrderListVisible;
    // if (!this.isOrderListVisible) {
    this.loadOnListToggle();
    // }
  }

  showHideSearchInputBox() {
    this.showInputSearchBox = !this.showInputSearchBox;
  }

  onSearch(event) {
    this.suggestionPanelComp.searchKeyword = event;
    this.suggestionPanelComp.subject.next();
  }

  hideHistory() {
    this.suggestionPanelComp.hideHistory();
  }

  checkCurrentActive() {
    const splitCount = 2;
    const orderSection = this.router.url.split('/')[this.router.url.split('/').length - splitCount];
    this.isOrderSetListVisible = (orderSection === 'orderSets');
    // load orders list
    this.activeOrderMenuName = orderSection;
    this.isOrderListVisible = orderSection === 'ordersList';
    if (!this.isOrderListVisible) {
      this.currentSection = orderSection + 'Orders';
    }
    if (this.initialized) {
      if (this.isOrderListVisible) {
        this.showOrderList();
      } else {
        this.scrollTo(this.currentSection, -1);
      }

    }
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  openSuggestions() {
    this.orderService.loadSuggestionFromOrders.next(this.currentSection);
  }

  openOrderSetPopup() {
    // const messageDetails = {
    //   modalTitle: 'Filter',
    //   filters: {orderBy: this.orderByRecords, approvedBy: this.approvedByRecords}
    // };
    const modalInstance = this.modalService.open(AddEditOrderSetComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'add-edit-order-set-modal'
      });
    modalInstance.result.then((result) => {
      if (result) {
        this.loadOrderSetList = true;
        this.alertMsg = {
          message: 'Order Set Added Successfully',
          messageType: 'success',
          duration: 3000
        };
      }
    });
    modalInstance.componentInstance.masterCategories = this.masterCategories;
    modalInstance.componentInstance.serviceType = this.patientObj.serviceType;
  }

  saveEditOrderSetDetails(orderData) {
    const reqParams = {
      speciality_id: +this.userInfo.speciality_id,
      deptId: '111',
      orderset_id: this.editOrderSetData.orderSetId,
      userId: this.userId,
      orderset_name: this.editOrderSetData.orderSetName,
      order_desc: this.editOrderSetData.orderSetDescription,
      order_data: orderData
    };

    this.orderService.saveOrderSet(reqParams).subscribe(res => {
      if (res) {
        // clear all local orders data added for order set edit.
        this.orderService.setOrderData(false, 'update', 'patientOrderSetEditData');
        this.editOrderSetData = undefined;
        _.forEach(this.masterCategories, (o) => {
          this.orderService.OrderEvent.next({ orderKey: o.orderKey, action: 'clear_orders' });
        });
        this.alertMsg = {
          message: 'Order Set Saved Successfully',
          messageType: 'success',
          duration: 3000
        };
      }
    });
  }

  getCareTeamUserList(): void {
    const reqParams = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo
    };
    this.orderService.getCareTeamUserList(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.careTeamUserList = res.data;
        const obj = _.find(this.careTeamUserList, (o) => {
          return o.user_id === this.userInfo.user_id;
        });
        this.selectedorderByUser = obj ? obj : null;
        this.orderService.selectedDoctorForOrder = obj ? obj : null;
      }
    });
  }
  isOrderExist() {
    let orderData = {};
    const forkJoins: any[] = [];
    forkJoins.push(this.orderService.getOrderData('dietOrders')); // -- for diet order components
    forkJoins.push(this.orderService.getOrderData('nursingOrders')); // -- for nursing order components
    forkJoins.push(this.orderService.getOrderData('radiologyOrders')); // -- for radiology order components
    forkJoins.push(this.orderService.getOrderData('medicineOrders')); // -- for medicine order components
    forkJoins.push(this.orderService.getOrderData('labOrders')); // -- for lab order components
    forkJoins.push(this.orderService.getOrderData('otherOrders')); // -- for Other (Doctor Instruction) components
    forkJoin(forkJoins).subscribe(([dietOrd, nursOrd, radioOrd, medOrder, labOrder, docInfoOrders]: any) => {
      if (docInfoOrders === false) {
        docInfoOrders = {
          docInstructionOrder: [],
          servicesOrder: []
        }
      }
      if (!dietOrd.length && !nursOrd.length && !radioOrd.length && !medOrder.length && !labOrder.length
        && !docInfoOrders.docInstructionOrder.length && !docInfoOrders.servicesOrder.length) {
        return orderData;
      } else {
        orderData = {
          dietOrders: dietOrd,
          nursingOrders: nursOrd,
          radiologyOrders: radioOrd,
          medicineOrders: medOrder,
          labOrders: labOrder,
          otherOrders: docInfoOrders
        };
      }
    });
    return orderData;
  }

  changeOrderByValue(event) {
    const orderData = this.isOrderExist();
    if (this.checkifOrdersIsEmpty(orderData)) {
      this.orderService.selectedDoctorForOrder = event ? event : null;
      this.orderService.OrderByEvent.next(this.orderService.selectedDoctorForOrder);
      return;
    }
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Changes apply to all unsave orders?',
      buttonType: 'yes_no',
    };
    modalInstance.result.then((res: any) => {
      if (res === 'yes') {
        this.orderService.selectedDoctorForOrder = event ? event : null;
        this.orderService.OrderByEvent.next(this.orderService.selectedDoctorForOrder);
        _.forEach(orderData, (value) => {
          if (_.isArray(value)) {
            _.forEach(value, (val) => {
              val.orderBy = this.selectedorderByUser = event ? event : null;
              const statusData = this.orderService.checkOrderStatus(this.userInfo);
              val.status = statusData.status;
              if (statusData.approvedBy) {
                val.status = statusData.status;
                val.approvedBy = statusData.approvedBy;
              }
            });
          } else if (_.isObject(value)) {
            _.forEach(value.docInstructionOrder, (val) => {
              val.orderBy = this.selectedorderByUser = event ? event : null;
              const statusData = this.orderService.checkOrderStatus(this.userInfo);
              val.status = statusData.status;
              if (statusData.approvedBy) {
                val.status = statusData.status;
                val.approvedBy = statusData.approvedBy;
              }
            });
            _.forEach(value.servicesOrder, (val) => {
              val.orderBy = this.selectedorderByUser = event ? event : null;
              const statusData = this.orderService.checkOrderStatus(this.userInfo);
              val.status = statusData.status;
              if (statusData.approvedBy) {
                val.status = statusData.status;
                val.approvedBy = statusData.approvedBy;
              }
            });
          }
        });
      } else if (res === 'no') {
        this.selectedorderByUser = _.cloneDeep(this.orderService.selectedDoctorForOrder)
        modalInstance.dismiss();
      }
    }, () => {
    });
  }

  prepareMedicineOrderForRequest(medicineOrders) {
    _.forEach(medicineOrders, (order) => {
      if (_.isString(order.medicineObj.dose)) {
        if (order.medicineObj.dose !== '') {
          order.medicineObj.dose = { id: 0, dose: order.medicineObj.dose };
        }
      }
      order.medicineObj.doseUnit = order.medicineObj.type.doseUnitObj;
    });
  }

  getSettingData() {
    const param = {
      patient_id: "0",
      opd_id: "0",
      user_id: "0",
      date: null,
      key: [Constants.orderStatusDefaultKey],
    };
    this.orderService.getKeyWiseData(param).subscribe(res => {
      // if (res.length > 0) {
      //   this.statusSetting = res[0].value;
      // }
    });
  }
}

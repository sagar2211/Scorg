import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PublicService } from './../../../public/services/public.service';
import { OrderService } from '../../../public/services/order.service';
import { NursingOrder } from './../../../public/models/nursing-order';
import { Constants } from './../../../config/constants';
import { AuthService } from './../../../public/services/auth.service';
import { CommonService } from './../../../public/services/common.service';
import { AddSuggestionMasterComponent } from './../../../emr-shared/components/add-suggestion-master/add-suggestion-master.component';
import { ConfirmationOrderPopupComponent } from '../confirmation-order-popup/confirmation-order-popup.component';
import { IAlert } from './../../../public/models/AlertMessage';

@Component({
  selector: 'app-nursing-orders',
  templateUrl: './nursing-orders.component.html',
  styleUrls: ['./nursing-orders.component.scss']
})
export class NursingOrdersComponent implements OnInit, OnDestroy {
  nursingOrderFrm: FormGroup;
  mstNursingOrderList$: Observable<any[]>;

  nursingOrders: Array<NursingOrder> = [];
  activeIds = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  filterBy: string;
  isOpen = false;
  submitted = false;
  compInstance = this;
  patientId: any;
  selectedItemIndex = -1;
  loginUserInfo: any;
  prevStatus: number;
  showAddSection: boolean;
  closeOthers = true;
  orderCatId: number;
  userId: number;
  userData: any;
  alertMsg: IAlert;
  orderDisplayType: string; // -- value set from dynacic load comp
  editData: any;
  isEdit: boolean = true;
  isDelete: boolean = true;
  isShowActions: boolean = true;
  genericDurationList: any[] = [];
  genericFrequencyList: any[] = [];
  checkAllValue: boolean = false;
  activeModal: any;
  isFromOrderSetEdit: boolean;
  frequencyMasterList: Array<any> = [];
  frequencyNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  daysSuggesion = [1, 2, 3, 5, 7, 10, 15, 20, 30, 60, 90];
  hoursList: Array<any> = [];
  activeIndex = 1;
  loadSuggestion = false;
  showInputSearchBox = true;
  suggestionPanelSettings: any;
  isOnload = false;
  isFrom: any;
  searchKeyword: any;
  patientObj: EncounterPatient;
  nursingtOrdersFavSuggestionTemplateList: any[] = [];

  @ViewChild('suggestionPanel', { static: false }) suggestionPanelComp: any;
  isTabModeOn;
  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private publicService: PublicService,
    private route: ActivatedRoute,
    public modalService: NgbModal,
    private authService: AuthService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.isTabModeOn = this.commonService.isTabModeOn;
    this.userId = +this.authService.getLoggedInUserId();
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.setNursingOrderForm();
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings.suggestionIsShow = true;
    this.suggestionPanelSettings.suggestionPin = 'pin';
    this.isFrom = { sectionName: 'Nursing Orders', sectionKeyName: 'nursingOrders', modelpopup: 'OrdersPopup' };

    this.getpatientData();
    this.afterGetPatData();
    this.subcriptionOfEvents();
  }
  afterGetPatData() {
    this.nursingOrders = [];
    this.frequencyMasterList = [];
    this.openSuggestion();
    this.getNursingOrders();
    // this.getGenericeMasterData();
    // this.loginUserInfo = this._authService.getUserDetailsByKey('userInfo');
    this.editOnInit();
    for (let i = 1; i <= 99; i++) {
      this.frequencyMasterList.push(i);
    }
    this.showAddSection = (this.showAddSection === undefined) ? false : this.showAddSection;
    this.hoursList = this.orderService.generateHours();
    this.updateOrderChanges();
  }

  setNursingOrderForm() {
    this.nursingOrderFrm = this.fb.group({
      name: ['', Validators.required],
      tempId: [''],
      nursingId: [''],
      action: [''],
      id: [''],
      status: ['approved'],
      isDirty: [true],
      frequency: [''],
      genericFreq: ['', Validators.compose([Validators.pattern('^[0-9]*$')])],
      genericDuration: [1],
      startDateTime: [new Date()],
      FreqSchedule: [''],
      freqStartTime: ['08:00 AM'],
      orderDate: [new Date()],
      orderBy: [null]
    });
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getNursingOrders() {
    this.orderService.getOrderData('nursingOrders').pipe(takeUntil(this.destroy$)).subscribe(res => {
      res = _.uniqBy(res, 'tempId');
      const nursing = new NursingOrder();
      this.nursingOrders = res;
      _.map(this.nursingOrders, (obj, i) => {
        if (nursing.isObjectValid(obj)) {
          nursing.generateObject(obj);
          this.nursingOrders[i] = _.clone(nursing);
        }
      });
    });
  }

  // getMasterNursingOrdList(searchVal): Observable<any> {
  //   return this.compInstance.orderService.getMasterNursingOrders().pipe(
  //     map(res => {
  //       return searchVal == ('' || null) ? res : res.filter((fil: any) => {
  //         return (fil.name.toLowerCase().indexOf(searchVal.toLowerCase()) > -1);
  //       });
  //     })
  //   );
  // }

  onSelectNursing($event) {
    this.nursingOrderFrm.patchValue({
      name: $event ? $event.name : '',
      nursingId: $event ? $event.id : ''
    });
  }

  updateDataToArray() {
    this.submitted = true;
    if (this.nursingOrderFrm.status === 'VALID') {
      this.submitted = false;
      if (this.selectedItemIndex !== -1) { // -- only for edit mode
        if (_.isUndefined(this.isFromOrderSetEdit)) {
          this.nursingOrders[this.selectedItemIndex] = this.nursingOrderFrm.value;
        }
      }
    }
    this.selectedItemIndex = -1;
    this.activeIndex = -1;
  }

  addNursingOrders() {
    if (!this.isTabModeOn) {
      return;
    }
    this.submitted = true;
    if (this.nursingOrderFrm.status === 'VALID') {
      // this.nursingOrderFrm.value['isDirty'] = true;
      // if (this.nursingOrderFrm.valid && this.submitted && nursingModel.isObjectValid(this.nursingOrderFrm.value)) {
      this.submitted = false;
      if (this.selectedItemIndex !== -1) { // -- only for edit mode
        if (_.isUndefined(this.isFromOrderSetEdit)) {
          this.nursingOrders[this.selectedItemIndex] = this.nursingOrderFrm.value;
        }
        // this.selectedItemIndex = -1;
        if (!_.isUndefined(this.activeModal)) {
          if (!_.isUndefined(this.isFromOrderSetEdit)) {
            // set order set data
            const editObj = {
              mode: 'orderSetEditPopup',
              key: 'nursingOrders',
              data: this.nursingOrderFrm.value,
              orderIndex: 0
            };
            this.orderService.editOrderSetData(editObj);
          }
          this.showAddSection = false;
          this.activeModal.close();
        }
      } else {
        const nursingModel = new NursingOrder();
        nursingModel.generateObject(this.nursingOrderFrm.value);
        nursingModel.tempId = moment(new Date()).valueOf();
        this.nursingOrders.push(nursingModel);
      }
      // this.clearForm();
      // }
    }
  }

  // -- get forms controls
  get nursingFormControls() {
    return this.nursingOrderFrm.controls;
  }

  removeNurOrders(selectedItem: any) {
    this.showAddSection = false;
    const i = _.findIndex(this.nursingOrders, no => no.tempId == selectedItem.tempId && (no.id === undefined || no.id === ''));
    if (i == -1) { return; }
    const status = this.nursingOrders[i].status;
    this.nursingOrders.splice(i, 1);
    this.orderService.setOrderData(this.nursingOrders, 'update', 'nursingOrders');
    this.clearForm();
    this.openSuggestion();
  }

  openSuggestionPanel() {
    this.publicService.componentSectionClicked({
      sectionKeyName: 'nursingOrders'
    }); // -- to update suggestion list
  }

  saveOrderActionFromPopup(medicine, res, act): Observable<any> {
    const param = {
      user_id: this.userId,
      items: [{
        order_item_id: res.id,
        order_category_key: medicine.key,
        // action: act,
        status: act
      }]
    };
    return this.compInstance.orderService.SaveOrderAction(param).pipe(map(dt => {
      return dt;
    }));
  }

  checkOrderTypeExistInOrder(order): Observable<any> {
    const param = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo,
      orderCategory: order.key,
      masterId: order.data.nursingId,
    };
    return this.compInstance.orderService.checkPatientOrderStatus(param).pipe(map(res => {
      if (res.nursingOrders) {
        return res.nursingOrders;
        // const medObj = this.updateFormValue(res.nursingOrders, true);
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
      orderStatus: res.status,
      selectedOrder: selectedData.data,
      resData: res,
      type: 'nursingOrders',
      showEditButton: res.status === 'INITIATED' ? true : false
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
      if (result !== 'edit') {
        this.saveOrderActionFromPopup(selectedData, res, result).subscribe(dt => {
          this.updateFormValue(selectedData);
        });
      } else {
        this.updateFormValue(res);
      }
    }, (dis) => {
      this.suggestionPanelComp.initialLoadData(this.isFrom);
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  updateFormValue(selectedData, returnObj?) {
    const nursingOrder = new NursingOrder();
    const selData = _.cloneDeep(selectedData.data ? selectedData.data : selectedData);
    let obj: any = _.cloneDeep({ ...selData });
    const statusData = this.orderService.checkOrderStatus(this.userData);
    obj.isDirty = true;
    obj.status = statusData.status;
    obj.tempId = moment(new Date()).valueOf();
    if (statusData.approvedBy) {
      obj.status = statusData.status;
      obj.approvedBy = statusData.approvedBy;
    }
    if (nursingOrder.isObjectValid(obj)) {
      nursingOrder.generateObject(obj);
      if (returnObj) {
        return nursingOrder;
      }
      this.publicService.setupdateByValueOnOrder(nursingOrder);
      this.nursingOrders.push(nursingOrder);
      this.orderService.setOrderData(this.nursingOrders, 'update', 'nursingOrders');
      nursingOrder.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
    }
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
      this.afterGetPatData();
    });
    // -- event subscribed if any suggestion list is updated
    this.publicService.listenEventFromSuggList.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.key === 'nursingOrders') {
        if (data.type === 'add') {
          this.checkOrderTypeExistInOrder(data).subscribe(res => {
            if (res) {
              this.getConfirmationPopup(data, res);
            } else {
              this.updateFormValue(data);
            }
          });
        } else if (data.type === 'delete') {
          if (data.data !== -1) {
            this.nursingOrders.splice(data.data, 1);
          }
        }
        this.saveToLocalObj(this.nursingOrders);
      }
    });

    // -- event fired when filter type change on order component
    this.orderService.$subcFilteredEvnt.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if ('setData' === res.mode && 'nursingOrders' === res.filterBy) {
        this.getNursingOrders();
      }
    });

    this.orderService.$subLoadSuggestionFromOrders.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res === 'nursingOrders' && !this.loadSuggestion) {
        this.openSuggestion();
      }
    });

    this.orderService.$OrderEvent.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res.orderKey === 'nursingOrders' && res.action === 'clear_orders') {
        this.nursingOrders = [];
      }
    });

    this.nursingOrderFrm.get('freqStartTime').valueChanges.subscribe(res => {
      if (!res) {
        this.onFreqStartTimeSelect('08:00 AM'); // set default value.
      }
    });
  }

  saveToLocalObj(array) {
    this.orderService.setOrderData(array, 'update', 'nursingOrders');
  }

  clearForm() {
    this.nursingOrderFrm.reset({
      status: 'approved',
      isDirty: true,
      startDateTime: new Date()
    });
    this.submitted = false;
    this.selectedItemIndex = -1;
  }

  onEditNursing(item, i) {
    let index = -1;
    if (item.orderIndex !== undefined) {
      index = item.orderIndex;
      delete item.orderIndex;
    } else {
      index = _.findIndex(this.nursingOrders, (o) => o.name === item.name && ((o.id === undefined || o.id === '') || o.isDirty));
    }
    if (index === -1) {
      return;
    }
    if (index === -1) { return; }
    this.selectedItemIndex = index;
    if (this.isTabModeOn) {
      this.showAddSection = true;
      this.loadSuggestion = false;
    }
    this.prevStatus = item.status;
    this.nursingOrderFrm.patchValue(item);
    if (this.isTabModeOn) {
      this.loadNursingFavTemplateSuggestions();
    }
  }

  // saveNursingOrders() {
  //   const ordStatus = _.some(this.nursingOrders, res => res.status == 'approvelPending');
  //   const reqParams = {
  //     orderCategoryid: this.orderCatId,
  //     order_data: { 'nursingOrders': this.nursingOrders },
  //     orderStatus: ordStatus ? 'approvelPending' : 'approved'
  //   };
  //   this.orderService.saveOrdersByCategory(reqParams).subscribe(res => {
  //     this.alertMsg = {
  //       message: 'Nursing Order Saved Successfully.',
  //       messageType: 'success',
  //       duration: 3000
  //     };
  //   });
  // }

  editOnInit() {
    if (!_.isUndefined(this.editData)) {
      this.onEditNursing(this.editData.data, this.editData.orderIndex);
    }
  }

  setMedicineFreqSchedule(nursingDetails, onBlur?) {
    let Freq;
    Freq = +nursingDetails.genericFreq || 1;
    if (onBlur) { return; }
    if (!_.isUndefined(nursingDetails) && Freq !== '') {
      if (Freq === 1) {
        if (!nursingDetails.FreqSchedule) {
          nursingDetails.FreqSchedule = '1-0-0';
        } else if (nursingDetails.FreqSchedule === '1-0-0') {
          nursingDetails.FreqSchedule = '0-1-0';
        } else if (nursingDetails.FreqSchedule === '0-1-0') {
          nursingDetails.FreqSchedule = '0-0-1';
        } else {
          nursingDetails.FreqSchedule = '1-0-0';
        }
      } else if (Freq === 2) {
        if (!nursingDetails.FreqSchedule) {
          nursingDetails.FreqSchedule = '1-0-1';
        } else if (nursingDetails.FreqSchedule === '1-0-1') {
          nursingDetails.FreqSchedule = '1-1-0';
        } else if (nursingDetails.FreqSchedule === '1-1-0') {
          nursingDetails.FreqSchedule = '0-1-1';
        } else {
          nursingDetails.FreqSchedule = '1-0-1';
        }
      } else if (Freq >= 3 || Freq === 0) {
        nursingDetails.FreqSchedule = '';
        for (let i = 0; i < Freq && Freq <= 12; i++) {
          nursingDetails.FreqSchedule += (i === 0) ? 1 : '-1';
        }
      }
    } else {
      nursingDetails.FreqSchedule = '';
    }
    this.nursingOrderFrm.patchValue(nursingDetails);
  }

  get getNursingOrderFormCtrl() {
    return this.nursingOrderFrm.controls;
  }

  openSuggestion(): void {
    // const modelInstance = this._modalService.open(SuggestionModelPopupComponent, {
    //   // backdrop: 'static',
    //   keyboard: false,
    //   size: 'lg',
    //   windowClass: 'custom-modal'
    // });
    // modelInstance.result.then(result => { }, reason => { });
    // modelInstance.componentInstance.isFrom = { sectionName: 'Nursing Orders', sectionKeyName: 'nursingOrders', modelpopup: 'OrdersPopup' };
    this.showAddSection = false;
    // this.orderService.loadSuggestionFromOrders.next({ sectionName: 'Nursing Orders', sectionKeyName: 'nursingOrders', modelpopup: 'OrdersPopup' });
    this.loadSuggestion = true;
    setTimeout(() => {
      this.publicService.componentSectionClicked(this.isFrom); // -- to update suggestion list
    });
  }

  // setInvalidMsg(obj): String {
  //   const nursingModel = new NursingOrder();
  //   if (nursingModel.isObjectIncomplete(obj)) {
  //     return obj['invalidObjectMessage'] = nursingModel.getInvalidObjectMessage();
  //   } else {
  //     return '';
  //   }
  // }
  findPendingObject() {
    if (this.nursingOrders.length) {
      this.checkAllValue = _.some(this.nursingOrders, res => res.status == 'approvelPending' && res.tempstatus != 'approved') ? false : true;
    }
  }

  onFreqStartTimeSelect(hrs?) {
    if (!hrs) { return; }
    this.nursingOrderFrm.patchValue({
      freqStartTime: hrs.time
    });
    const hrsObj = _.find(this.hoursList, (o) => o.time === hrs);
    _.map(this.hoursList, (o) => { if (hrs !== o.time) { o.isActive = false; } });
    if (!hrsObj) { return; }
    hrsObj.isActive = !hrsObj.isActive;
  }

  updateOrderChanges(): void {
    this.nursingOrderFrm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.addNursingOrders();
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

  loadNursingFavTemplateSuggestions() {
    const reqParams = {
      item_id: this.nursingOrderFrm.value.nursingId,
      patient_id: this.patientId,
      dept_id: null,
      user_id: this.userId,
      limit: 5
    };

    this.orderService.getOrderFavTemplates(reqParams, 'nursingOrders').subscribe(result => {
      _.map(result, (o) => {
        o.id = '';
        o.tempId = this.nursingOrderFrm.value.tempId;
        // o.priority = this.diatOrdersFrm.value.priority;
        o.action = this.nursingOrderFrm.value.action;
        o.status = this.nursingOrderFrm.value.status;
        o.order_id = '';
        o.orderDate = this.nursingOrderFrm.value.orderDate;
        o.orderBy = null;
        o.approvedBy = null;
      });
      this.nursingtOrdersFavSuggestionTemplateList = result;
    });
  }

  configureAction($event) {
    if ($event.nextId === 'Templates') {
      this.loadNursingFavTemplateSuggestions();
    }
  }
  addMasterNursing(): void {
    const modelInstancePopup = this.modalService.open(AddSuggestionMasterComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'sm'
    });
    modelInstancePopup.componentInstance.masterName = 'Nursing';
    modelInstancePopup.componentInstance.placeHolderName = 'Add Nursing Name';
    modelInstancePopup.componentInstance.newSuggNameEvent.subscribe((e: any) => {
      this.saveMasterNursing(e);
    });
    modelInstancePopup.result.then(result => {
    });
  }

  saveMasterNursing(event): void {
    const reqParams = {
      id: 0,
      name: event,
      instruction: ''
    };
    this.orderService.saveNursingMaster(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: 'Nursing Saved Successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.onSearch(this.searchKeyword);
      }
    });
  }
  approveOrders(item, i) {
    this.nursingOrders[i] = item;
  }

}

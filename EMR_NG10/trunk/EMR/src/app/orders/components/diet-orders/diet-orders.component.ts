import { EncounterPatient } from './../../../public/models/encounter-patient.model';

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { PublicService } from './../../../public/services/public.service';
import { ConsultationService } from './../../../public/services/consultation.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { OrderService } from '../../../public/services/order.service';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DietOrder } from './../../../public/models/diet-order';
import { Constants } from './../../../config/constants';
import { CommonService } from './../../../public/services/common.service';
import { AuthService } from './../../../public/services/auth.service';
import { AddSuggestionMasterComponent } from './../../../emr-shared/components/add-suggestion-master/add-suggestion-master.component';
import { ConfirmationOrderPopupComponent } from '../confirmation-order-popup/confirmation-order-popup.component';

@Component({
  selector: 'app-diet-orders',
  templateUrl: './diet-orders.component.html',
  styleUrls: ['./diet-orders.component.scss']
})
export class DietOrdersComponent implements OnInit, OnDestroy {
  diatOrdersFrm: FormGroup;
  dietOrderList: Array<DietOrder> = [];
  destroy$: Subject<any> = new Subject<any>();
  loginUserInfo: any;
  loadSuggestion = true;
  showInputSearchBox = true;
  searchKeyword: any;
  isOpen = false;
  submitted = false;
  compInstance = this;
  patientId: any;
  selectedItemIndx = -1;
  prevStatus: string;
  activeIds = [];
  filterBy: string;
  closeOthers = true;
  orderCatId: number;
  userId: number;
  userData: any;
  alertMsg: IAlert;
  orderDisplayType: string; // -- value set from dynacic load comp
  editData: any;
  isEdit = true;
  isDelete = true;
  isShowActions = true;
  checkAllValue = false;
  showAddSection: boolean;
  activeModal: any;
  isFromOrderSetEdit: boolean;
  activeIndex = -1;
  suggestionPanelSettings: any;
  isOnload = false;
  isFrom: any;
  patientObj: EncounterPatient;
  dietOrdersFavSuggestionTemplateList: any[] = [];
  click$ = new Subject<string>();
  orderInstructionList: any[] = [];
  isTabModeOn;
  @ViewChild('suggestionPanel', { static: false }) suggestionPanelComp: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private publicService: PublicService,
    private consultationService: ConsultationService,
    private commonService: CommonService,
    private authService: AuthService,
    public modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.isTabModeOn = this.commonService.isTabModeOn;
    this.getpatientData();
    this.afterGetPatData();
    this.subcriptionOfEvents();
  }

  afterGetPatData() {
    this.dietOrderList = [];
    this.userId = +this.authService.getLoggedInUserId();
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings['suggestionIsShow'] = true;
    this.suggestionPanelSettings['suggestionPin'] = 'pin';
    this.isFrom = { sectionName: 'Diet Orders', sectionKeyName: 'dietOrders', modelpopup: 'OrdersPopup' };
    this.openSuggestion();
    this.setDietOrderForm();
    this.getDietOrders();
    // this.loginUserInfo = this._authService.getUserDetailsByKey('userInfo');
    this.editOnInit();
    this.findPendingObject();
    this.showAddSection = (this.showAddSection === undefined) ? false : this.showAddSection;
    this.updateOrderChanges();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getDietOrders() {
    this.orderService.getOrderData('dietOrders').pipe(takeUntil(this.destroy$)).subscribe(res => {
      const diet = new DietOrder();
      res = _.uniqBy(res, 'tempId');
      _.map(res, (obj) => {
        if (diet.isObjectValid(obj)) {
          diet.generateObject(obj);
          this.dietOrderList.push(diet);
        }
      });
    });
  }

  get diatOrdersFrmCntrols() {
    return this.diatOrdersFrm.controls;
  }

  // getDiatList(term: string): Observable<any> {
  //   return this.compInstance.orderService.getDiatOrderList().pipe(
  //     map((res: any) => {
  //       return !(term) ? res : res.filter(f => {
  //         return (f.name.toLowerCase().indexOf(term.toLowerCase()) > -1);
  //       });
  //     })
  //   );
  // }

  updateDataToArray() {
    this.submitted = true;
    if (this.diatOrdersFrm.valid && this.submitted) {
      this.submitted = false;
      const dietModel = new DietOrder();
      if (this.diatOrdersFrm.value && dietModel.isObjectValid(this.diatOrdersFrm.value)) {
        dietModel.generateObject(this.diatOrdersFrm.value);
        if (this.selectedItemIndx !== -1) {
          if (_.isUndefined(this.isFromOrderSetEdit)) {
            this.dietOrderList[this.selectedItemIndx] = dietModel;
          }
        }
      }
    }
    this.selectedItemIndx = -1;
    this.activeIndex = -1;
  }

  addDiats() {
    if (!this.isTabModeOn) {
      return;
    }
    this.submitted = true;
    if (this.diatOrdersFrm.valid && this.submitted) {
      this.submitted = false;
      const dietModel = new DietOrder();
      if (this.diatOrdersFrm.value && dietModel.isObjectValid(this.diatOrdersFrm.value)) {
        dietModel.generateObject(this.diatOrdersFrm.value);
        if (this.selectedItemIndx !== -1) { // edit
          if (_.isUndefined(this.isFromOrderSetEdit)) {
            this.dietOrderList[this.selectedItemIndx] = dietModel;
          }
          // this.selectedItemIndx = -1;

          if (!_.isUndefined(this.activeModal)) {
            if (!_.isUndefined(this.isFromOrderSetEdit)) {
              // set order set data
              const editObj = {
                mode: 'orderSetEditPopup',
                key: 'dietOrders',
                data: this.diatOrdersFrm.value,
                orderIndex: 0
              };
              this.orderService.editOrderSetData(editObj);
            }
            this.showAddSection = false;
            this.activeModal.close();
          }
        } else {
          dietModel['tempId'] = moment(new Date()).valueOf();
          this.dietOrderList.push(dietModel);
        }
        // this.saveToLocalObj(this.dietOrderList);
        // this.openSuggestionPanel();
        // this.clearForm();
      }
    }
  }


  // -- add orders
  onDietSelect($event) {
    this.diatOrdersFrm.patchValue({
      dietId: $event ? $event.id : '',
      name: $event ? $event.name : ''
    });
    this.openSuggestionPanel();
  }

  // -- remove orders
  removeDiet(selectedItem: any) {
    const i = _.findIndex(this.dietOrderList, dl => dl.tempId = selectedItem.tempId && (dl.id === undefined || dl.id === ''));
    if (i === -1) { return; }
    const status = this.dietOrderList[i].status;
    this.dietOrderList.splice(i, 1);
    this.orderService.setOrderData(this.dietOrderList, 'update', 'dietOrders');
    // this.saveToLocalObj(this.dietOrderList);
    // this.openSuggestionPanel();
    this.clearForm();
    this.openSuggestion();
  }

  openSuggestionPanel() {
    this.publicService.componentSectionClicked({
      sectionKeyName: 'dietOrders'
    }); // -- to update suggestion list
  }

  saveToLocalObj(array) {
    this.consultationService.setConsultationFormData(this.patientId, 'dietOrders', array, 'update', false, true);
  }

  clearForm() {
    this.diatOrdersFrm.reset({
      startDateTime: new Date(),
      endDateTime: null,
      action: 'approved',
      status: 'approved',
      isDirty: true
    });
    this.submitted = false;
    this.selectedItemIndx = -1;
  }

  saveOrderActionFromPopup(order, res, act): Observable<any> {
    const param = {
      user_id: this.userId,
      items: [{
        order_item_id: res.id,
        order_category_key: order.key,
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
      masterId: order.data.dietId,
    };
    return this.compInstance.orderService.checkPatientOrderStatus(param).pipe(map(res => {
      if (res.dietOrders) {
        return res.dietOrders;
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
      type: 'dietOrders',
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

  updateFormValue(selectedData, retObject?) {
    const dietOrder = new DietOrder();
    let obj: any = _.cloneDeep({ ...selectedData.data });
    const statusData = this.orderService.checkOrderStatus(this.userData);
    obj['isDirty'] = true;
    obj['tempId'] = selectedData.tempId ? selectedData.tempId : moment(new Date()).valueOf();
    obj['status'] = statusData.status;
    if (statusData.approvedBy) {
      obj['status'] = statusData.status;
      obj['approvedBy'] = statusData.approvedBy;
    }
    if (dietOrder.isObjectValid(obj)) {
      dietOrder.generateObject(obj);
      if (retObject) {
        return dietOrder;
      }
      dietOrder.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
      this.publicService.setupdateByValueOnOrder(dietOrder);
      this.dietOrderList.push(dietOrder);
      this.orderService.setOrderData(this.dietOrderList, 'update', 'dietOrders');
    }
  }


  subcriptionOfEvents() {
    // -- event subscribed if any suggestion list is updated
    // -- event fired when filter type change on order component
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
      this.afterGetPatData();
    });
    this.orderService.$subcFilteredEvnt.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if ('setData' === res.mode && 'dietOrders' === res.filterBy) {
        this.getDietOrders();
      } else if ('setData' !== res.mode) {
        this.filterBy = res.filterBy;
        this.activeIds = res.activeIds;
        this.closeOthers = false;
      }
    });
    this.publicService.listenEventFromSuggList.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.key === 'dietOrders') {
        if (data.type === 'add') {
          if (this.orderDisplayType === 'all') {
            this.checkOrderTypeExistInOrder(data).subscribe(res => {
              if (res) {
                this.getConfirmationPopup(data, res);
              } else {
                this.updateFormValue(data);
              }
            });
          }
        } else if (data.type === 'delete') {
          if (this.orderDisplayType === 'all' && data.data !== -1) {
            this.dietOrderList.splice(data.data, 1);
          }
        }
        this.saveToLocalObj(this.dietOrderList);
      }
    });

    this.orderService.$subLoadSuggestionFromOrders.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res === 'dietOrders' && !this.loadSuggestion) {
        this.openSuggestion();
      }
    });

    this.orderService.$OrderEvent.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res.orderKey === 'dietOrders' && res.action === 'clear_orders') {
        this.dietOrderList = [];
      }
    });
  }

  onEditDiet(item, i) {
    let index = -1;
    if (item.orderIndex !== undefined) {
      index = item.orderIndex;
      delete item.orderIndex;
    } else {
      index = _.findIndex(this.dietOrderList, (o) => o.name === item.name && ((o.id === undefined || o.id === '') || o.isDirty));
    }
    if (index === -1) {
      return;
    }
    if (index === -1) { return; }
    if (this.isTabModeOn) {
      this.showAddSection = true;
      this.loadSuggestion = false;
    }
    this.selectedItemIndx = index;
    this.prevStatus = item.status;
    this.diatOrdersFrm.patchValue(item);
    if (this.isTabModeOn) {
      this.loadDietFavTemplateSuggestions();
      this.getLanguageInstruction().subscribe();
    }
  }

  // saveDietOrders() {
  //   const ordStatus = _.some(this.dietOrderList, res => res.status == 'approvelPending');
  //   const reqParams = {
  //     orderCategoryid: this.orderCatId,
  //     order_data: { 'dietOrders': this.dietOrderList },
  //     orderStatus: ordStatus ? 'approvelPending' : 'approved'
  //   };
  //   this.orderService.saveOrdersByCategory(reqParams).subscribe(res => {
  //     this.alertMsg = {
  //       message: 'Diet Order Saved Successfully.',
  //       messageType: 'success',
  //       duration: 3000
  //     };
  //   });
  // }

  editOnInit() {
    if (!_.isUndefined(this.editData)) {
      this.onEditDiet(this.editData.data, this.editData.orderIndex);
    }
  }

  openSuggestion(): void {
    // const modelInstance = this._modalService.open(SuggestionModelPopupComponent, {
    //   keyboard: false,
    //   size: 'lg',
    //   windowClass: 'custom-modal'
    // });
    // modelInstance.result.then(result => { }, reason => { });
    // modelInstance.componentInstance.isFrom = { sectionName: 'Diet Orders', sectionKeyName: 'dietOrders', modelpopup: 'OrdersPopup' };
    this.showAddSection = false;
    // this.orderService.loadSuggestionFromOrders.next({ sectionName: 'Diet Orders', sectionKeyName: 'dietOrders', modelpopup: 'OrdersPopup' });
    this.loadSuggestion = true;
    setTimeout(() => {
      this.publicService.componentSectionClicked(this.isFrom); // -- to update suggestion list
    });
  }

  // setInvalidMsg(obj): string {
  //   const dietModel = new DietOrder();
  //   if (dietModel.isObjectIncomplete(obj)) {
  //     return obj['invalidObjectMessage'] = dietModel.getInvalidObjectMessage();
  //   } else {
  //     return '';
  //   }
  // }

  findPendingObject() {
    if (this.dietOrderList.length) {
      this.checkAllValue = _.some(this.dietOrderList, res => res.status === 'approvelPending' && res.tempstatus !== 'approved') ? false : true;
    }
  }

  setDietOrderForm() {
    this.diatOrdersFrm = this.fb.group({
      dietId: [''],
      name: ['', Validators.required],
      startDateTime: [new Date(), Validators.required],
      endDateTime: [null],
      quantity: [''],
      freq: [1],
      specInstruction: [''],
      action: [''],
      id: [''],
      status: ['approved'],
      isDirty: [true],
      orderDate: [new Date()],
      tempId: '',
      orderBy: [null]
    });
  }

  updateOrderChanges(): void {
    this.diatOrdersFrm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.addDiats();
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

  loadDietFavTemplateSuggestions() {
    const reqParams = {
      item_id: this.diatOrdersFrm.value.dietId,
      patient_id: this.patientId,
      dept_id: null,
      user_id: this.userId,
      limit: 5
    };

    this.orderService.getOrderFavTemplates(reqParams, 'dietOrders').subscribe(result => {
      _.map(result, (o) => {
        o.id = '';
        o.tempId = this.diatOrdersFrm.value.tempId;
        // o.priority = this.diatOrdersFrm.value.priority;
        o.action = this.diatOrdersFrm.value.action;
        o.status = this.diatOrdersFrm.value.status;
        o.order_id = '';
        o.orderDate = this.diatOrdersFrm.value.orderDate;
        o.orderBy = null;
        o.approvedBy = null;
      });
      this.dietOrdersFavSuggestionTemplateList = result;
    });
  }

  configureAction($event) {
    if ($event.nextId === 'Templates') {
      this.loadDietFavTemplateSuggestions();
    }
  }

  addMasterDiet(): void {
    const modelInstancePopup = this.modalService.open(AddSuggestionMasterComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'sm'
    });
    modelInstancePopup.componentInstance.masterName = 'Diet';
    modelInstancePopup.componentInstance.placeHolderName = 'Add Diet Name';
    modelInstancePopup.componentInstance.newSuggNameEvent.subscribe((e: any) => {
      this.saveDietmaster(e);
    });
    modelInstancePopup.result.then(result => {
    });
  }

  saveDietmaster(event) {
    const reqParams = {
      id: 0,
      name: event,
      instruction: ''
    };
    this.orderService.saveDietMaster(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: 'Diet Saved Successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.onSearch(this.searchKeyword);
      }
    });
  }
  approveOrders(item, i) {
    this.dietOrderList[i] = item;
  }

  // searchInstructionList = (text$: Observable<string>) => {
  //   const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
  //   }));
  //   const clicksWithClosedPopup$ = this.click$.pipe();
  //   return merge(debouncedText$, clicksWithClosedPopup$).pipe(
  //     tap((e) => {
  //     }),
  //     distinctUntilChanged(),
  //     switchMap((term: string) => {
  //         return this.getLanguageInstruction(term);
  //     })
  //   );
  // };

  getLanguageInstruction(term?) {
    const reqParams = {
      patient_id: this.patientId,
      user_id: this.userId,
      item_id: this.diatOrdersFrm.value.dietId,
      limit: 50
    };
    return this.orderService.getOrderInstructions(reqParams, 'dietOrders').pipe(
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

}

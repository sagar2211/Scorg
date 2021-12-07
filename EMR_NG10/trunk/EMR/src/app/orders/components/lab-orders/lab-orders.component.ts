import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PublicService } from './../../../public/services/public.service';
import { OrderService } from '../../../public/services/order.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { InvestigationComponentListComponent } from '../investigation-component-list/investigation-component-list.component';
import { PrescriptionService } from './../../../public/services/prescription.service';
import { LabOrders } from './../../../public/models/lab-order';
import { InvestigationMaster } from './../../../public/models/investigation-master.model';
import { CommonService } from './../../../public/services/common.service';
import { AuthService } from './../../../public/services/auth.service';
import { ConfirmationOrderPopupComponent } from '../confirmation-order-popup/confirmation-order-popup.component';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-lab-orders',
  templateUrl: './lab-orders.component.html',
  styleUrls: ['./lab-orders.component.scss']
})
export class LabOrdersComponent implements OnInit, OnDestroy {
  compInstance = this;
  labOrderForm: FormGroup;

  priorityList$: Observable<any[]>;
  actionList$: Observable<any[]>;
  labSpecimentList$: Observable<any[]>;

  destroy$: Subject<any> = new Subject(); // --for memory leak
  copyOfPriorityList: any[] = [];
  copyOfRecurringList: any[] = [];
  activeIds = [];
  labOrderList: any[] = [];
  genericDurationList: any[] = [];
  patientObj: EncounterPatient;

  isOpen = false;
  spinners = false;
  submitted = false;
  selectedItemIndx = -1;
  loginUserInfo: any;
  prevStatus: String;
  showAddSection: boolean;
  filterBy: String;
  activeOrderActionName = 'Add'; // 2 values: Add, View;
  closeOthers = true;
  orderCatId: Number;
  userId: Number;
  userData: any;
  alertMsg: IAlert;
  orderDisplayType: string; // -- value set from dynacic load comp
  editData: any;
  isEdit: Boolean = true;
  isDelete: Boolean = true;
  isShowActions: Boolean = true;
  checkAllValue: Boolean = false;
  selectedInvestigationComponentList: any;

  labOrderModelInst = new LabOrders();
  activeModal: any;
  componentPopupFrom: String = '';

  isFromOrderSetEdit: Boolean;
  modelInstanceInvestigationPopup: any;
  _modalService: NgbModal;
  labList: any = [];
  frequencyMasterList: Array<any> = [];
  frequencyNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  hoursList: Array<any> = [];
  activeIndex = -1;
  loadSuggestion = true;
  showInputSearchBox = true;
  suggestionPanelSettings: any;
  isOnload = true;
  isFrom: any;
  searchKeyword: any;
  labOrdersFavSuggestionTemplateList: any[] = [];
  patientId: any;
  activeTab: any = 'Templates';
  click$ = new Subject<string>();
  orderInstructionList: any[] = [];
  labOrdersRequisitionList: any[] = [];
  isTabModeOn;
  @ViewChild('suggestionPanel', { static: false }) suggestionPanelComp: any;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private orderService: OrderService,
    // private _authService: AuthService,
    private modalService: NgbModal,
    private prescriptionService: PrescriptionService,
    private commonService: CommonService,
    private authService: AuthService
  ) {
    this._modalService = modalService;
  }

  ngOnInit() {
    this.isTabModeOn = this.commonService.isTabModeOn;
    this.userId = +this.authService.getLoggedInUserId();
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings.suggestionIsShow = true;
    this.suggestionPanelSettings.suggestionPin = 'pin';
    this.isFrom = { sectionName: 'Lab Orders', sectionKeyName: 'labOrders', modelpopup: 'OrdersPopup' };
    // this.loginUserInfo = this._authService.getUserDetailsByKey('userInfo');
    this.getpatientData();
    this.afterGetPatData();
    this.subcriptionOfEvents();
  }

  afterGetPatData() {
    this.labOrderList = [];
    this.frequencyMasterList = [];
    this.setLabOrderFormData();
    this.getPriorityLists(); // -- get priority list
    this.getActionLists(); // -- get actions list
    this.getLabSpecimenList(); // -- get Laboratory specimen list
    this.getOrdersData();
    this.editOnInit();
    this.findPendingObject();
    for (let i = 1; i <= 99; i++) {
      this.frequencyMasterList.push(i);
    }
    this.showAddSection = (this.showAddSection === undefined) ? false : this.showAddSection;
    this.hoursList = this.orderService.generateHours();
    this.updateOrderChanges();
  }

  setLabOrderFormData() {
    this.labOrderForm = this.fb.group({
      name: ['', Validators.required],
      tempId: [''],
      specimen: [''],
      startDateTime: [new Date()],
      recurring: [''],
      priority: [''],
      action: [''],
      status: ['approved'],
      patientConsentNeeded: ['no'],
      labInstruction: [''],
      patientInstruction: [''],
      reason: [''],
      componentList: [[]],
      selectedComponentCount: [null],
      isDirty: [true],
      endDateTime: [new Date()],
      labInvestigationObj: [null],
      frequency: [1],
      frequencySchedule: [''],
      freqStartTime: ['08:00 AM'],
      orderDate: [new Date()],
      orderBy: [null],
      requisition: ['']
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  // -- get all labtest data for typhead
  getAllLabTestList(searchVal, strictMatch?): Observable<any> {
    return this.compInstance.publicService.getInvestigationWithPaginationByType('lab', 1, 20, searchVal, strictMatch, -1, 0).pipe(map((res: any) => {
      const labInvest: InvestigationMaster[] = [];
      res.data.forEach(element => {
        const labInv = new InvestigationMaster();
        if (labInv.isObjectValid(element)) {
          labInv.generateObject(element);
          labInvest.push(labInv);
        }
      });
      this.labList = labInvest;
      return labInvest;
    }));
  }

  onSelectLab($event): void {
    if ($event) {
      const param = {
        investigation_id: $event.id
      };
      this.orderService.getComponentListForSelectedInvestigation(param).subscribe(result => {
        const componentList = result;
        const selectedComponentCount = (_.filter(result, (val, index) => {
          return val.isSelected === true;
        })).length;
        this.labOrderForm.patchValue({
          componentList,
          selectedComponentCount,
          labInvestigationObj: $event ? $event : null,
          name: $event ? $event.label : ''
        });
      });
    } else {
      this.labOrderForm.patchValue({
        componentList: [],
        selectedComponentCount: null,
        labInvestigationObj: $event ? $event : null,
        name: $event ? $event.label : ''
      });
    }
  }

  getOrdersData() {
    this.orderService.getOrderData('labOrders').subscribe((result: any[]) => {
      result = _.uniqBy(result, 'tempId');
      this.labOrderList = result;
      const lab = new LabOrders();
      _.map(this.labOrderList, (obj, i) => {
        if (lab.isObjectValid(obj)) {
          lab.generateObject(obj);
          this.labOrderList[i] = _.clone(lab);
        }
      });
    });
  }

  getPriorityLists(): void {
    this.priorityList$ = this.orderService.getPriorityList().pipe(map((res: any) => {
      this.copyOfPriorityList = res;
      this.labOrderForm.patchValue({
        priority: res[0]
      });
      return res;
    }));
  }

  getActionLists(): void {
    this.actionList$ = this.orderService.getActionLists().pipe(
      map(res => {
        this.labOrderForm.patchValue({
          action: res[0]
        });
        return res;
      })
    );
  }

  updateDataToArray() {
    this.submitted = true;
    if (this.labOrderForm.status == 'VALID') {
      this.submitted = false;
      if (this.selectedItemIndx != -1) { // edit
        // const componentList = _.cloneDeep(this.labOrderList[this.selectedItemIndx].componentList);
        if (_.isUndefined(this.isFromOrderSetEdit)) {
          const selectedComponentCount = 0;
          this.labOrderList[this.selectedItemIndx] = this.labOrderForm.value;
          this.labOrderList[this.selectedItemIndx].selectedComponentCount = selectedComponentCount;
        }
      }
    }
    this.selectedItemIndx = -1;
    this.activeIndex = -1;
  }

  addLabOrders() {
    if (!this.isTabModeOn) {
      return;
    }
    this.submitted = true;
    if (this.labOrderForm.status == 'VALID') {
      this.submitted = false;
      if (this.selectedItemIndx != -1) { // edit
        // const componentList = _.cloneDeep(this.labOrderList[this.selectedItemIndx].componentList);
        if (_.isUndefined(this.isFromOrderSetEdit)) {
          const selectedComponentCount = 0;
          this.labOrderList[this.selectedItemIndx] = this.labOrderForm.value;
          this.labOrderList[this.selectedItemIndx].selectedComponentCount = selectedComponentCount;
        }
        if (!_.isUndefined(this.activeModal)) {
          if (!_.isUndefined(this.isFromOrderSetEdit)) {
            // set order set data
            const editObj = {
              mode: 'orderSetEditPopup',
              key: 'labOrders',
              data: this.labOrderForm.value,
              orderIndex: 0
            };
            this.orderService.editOrderSetData(editObj);
          }
          this.showAddSection = false;
          this.activeModal.close();
        }
      } else {
        this.labOrderForm.value.tempId = moment(new Date).valueOf();
        const labOrder = new LabOrders();
        if (labOrder.isObjectValid(this.labOrderForm.value)) {
          labOrder.generateObject(this.labOrderForm.value);
          this.labOrderList.push(labOrder);
        }
      }
      // this.orderService.setOrderData(this.labOrderForm.value, 'add', 'labOrders', null, true);
      // this.clearForm();
    }
  }

  removeLabOrders(selectedItem, fromSuggestion?) {
    const index = _.findIndex(this.labOrderList, lor => lor.tempId === selectedItem.tempId && (lor.id === undefined || lor.id === ''));
    if (index === -1) { return; }
    const status = this.labOrderList[index].status;
    this.labOrderList.splice(index, 1);
    this.orderService.setOrderData(this.labOrderList, 'update', 'labOrders');
    this.clearForm();

    if (!fromSuggestion) {
      this.loadSuggestion = true;
      this.showAddSection = false;
      // this.suggestionPanelComp.loadAllMaster().subscribe(res => {
      this.suggestionPanelComp.initialLoadData(this.isFrom);
      // });
    }
  }

  getLabSpecimenList() {
    this.labSpecimentList$ = this.orderService.getLabSpecimenList();
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
      masterId: order.data.id,
    };
    return this.compInstance.orderService.checkPatientOrderStatus(param).pipe(map(res => {
      if (res.labOrders) {
        return res.labOrders;
        // const labobj = this.updateFormValue(res.labOrders, true);
        // return labobj;
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
      type: 'labOrders',
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
    this.publicService.listenEventFromSuggList.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.key === 'labOrders') {
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
            this.labOrderList.splice(data.data, 1);
          }
        }
      }
    });

    // -- event fired when filter type change on order component
    this.orderService.$subcFilteredEvnt.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res.mode === 'setData' && res.filterBy === 'labOrders') {
        this.getOrdersData();
      }
    });

    this.orderService.$subLoadSuggestionFromOrders.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res === 'labOrders' && !this.loadSuggestion) {
        this.openSuggestion();
      }
    });

    this.orderService.$OrderEvent.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res.orderKey === 'labOrders' && res.action === 'clear_orders') {
        this.labOrderList = [];
      }
    });

    this.labOrderForm.get('freqStartTime').valueChanges.subscribe(res => {
      if (!res) {
        this.onFreqStartTimeSelect('08:00 AM'); // set default value.
      }
    });
  }

  updateFormValue(result, retObject?) {
    const investigation = new InvestigationMaster();
    if (investigation.isObjectValid(result)) {
      investigation.generateObject(result);
    }
    let obj = null;
    const statusData = this.orderService.checkOrderStatus(this.userData);
    obj = {
      labInvestigationObj: investigation,
      tempId: moment(new Date()).valueOf(),
      name: investigation.name,
      status: statusData.status,
      priority: 'Routine',
      componentList: [],
      isDirty: true
    };
    if (statusData.approvedBy) {
      obj = {
        labInvestigationObj: investigation,
        tempId: moment(new Date()).valueOf(),
        status: statusData.status,
        name: investigation.name,
        priority: 'Routine',
        isDirty: true,
        componentList: [],
        approvedBy: statusData.approvedBy
      };
    }
    const param = {
      investigation_id: obj.labInvestigationObj.id
    };
    // this.orderService.getComponentListForSelectedInvestigation(param).subscribe(resultData => {
    obj.componentList = [];
    obj['selectedComponentCount'] = 0;
    const labOrder = new LabOrders();
    obj['specimen'] = '';
    obj['frequency'] = 1;
    if (labOrder.isObjectValid(obj)) {
      labOrder.generateObject(obj);
      if (retObject) {
        return labOrder;
      }
      this.publicService.setupdateByValueOnOrder(labOrder);
      this.labOrderList.push(labOrder);
      this.orderService.setOrderData(this.labOrderList, 'update', 'labOrders');
      labOrder.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
    }
    // });
  }

  get getLabOrdersForm() {
    return this.labOrderForm.controls;
  }

  clearForm() {
    this.labOrderForm.reset({
      status: 'approved',
      recurring: [''],
      priority: [this.copyOfPriorityList[0]],
      specimen: [''],
      patientConsentNeeded: ['no'],
      startDateTime: new Date(),
      endDateTime: new Date(),
      isDirty: true
    });
    this.submitted = false;
    this.selectedItemIndx = -1;
  }

  onEditLabOrder(item, i) {
    let index = -1;
    if (item.orderIndex !== undefined) {
      index = item.orderIndex;
      delete item.orderIndex;
    } else {
      index = _.findIndex(this.labOrderList, (o) => o.name === item.name && ((o.id === undefined || o.id === '') || o.isDirty));
    } if (index === -1) { return; }
    if (this.isTabModeOn) {
      this.showAddSection = true;
      this.loadSuggestion = false;
    }
    this.selectedItemIndx = index;
    this.prevStatus = item.status;
    this.labOrderForm.patchValue(item);
    if (this.isTabModeOn) {
      this.loadLabFavTemplateSuggestions();
      this.getLanguageInstruction().subscribe();
      this.getRequisitionList().subscribe();
    }
  }

  // saveLabOrders() {
  //   const ordStatus = _.some(this.labOrderList, res => res.status == 'approvelPending');
  //   const reqParams = {
  //     orderCategoryid: this.orderCatId,
  //     order_data: { 'labOrders': this.labOrderList },
  //     orderStatus: ordStatus ? 'approvelPending' : 'approved'
  //   };
  //   this.orderService.saveOrdersByCategory(reqParams).subscribe(res => {
  //     this.alertMsg = {
  //       message: 'Lab Order Saved Successfully.',
  //       messageType: 'success',
  //       duration: 3000
  //     };
  //   });
  // }

  editOnInit() {
    if (!_.isUndefined(this.editData)) {
      this.onEditLabOrder(this.editData.data, this.editData.orderIndex);
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
    // modelInstance.componentInstance.isFrom = { sectionName: 'Lab Orders', sectionKeyName: 'labOrders', modelpopup: 'OrdersPopup' };
    this.showAddSection = false;
    // this.orderService.loadSuggestionFromOrders.next({ sectionName: 'Lab Orders', sectionKeyName: 'labOrders', modelpopup: 'OrdersPopup' });
    this.loadSuggestion = true;
    setTimeout(() => {
      this.publicService.componentSectionClicked(this.isFrom); // -- to update suggestion list
    });
  }

  // setInvalidMsg(obj): String {
  //   if (!this.labOrderModelInst.isObjectValid(obj)) {
  //     return obj['invalidObjectMessage'] = this.labOrderModelInst.getInvalidObjectMessage();
  //   } else {
  //     return '';
  //   }
  // }
  findPendingObject() {
    if (this.labOrderList.length) {
      this.checkAllValue = _.some(this.labOrderList, res => res.status == 'approvelPending' && res.tempstatus != 'approved') ? false : true;
    }
  }


  getselectInvestigationComponentData(data, openFrom?) {
    if (openFrom) {
      this.componentPopupFrom = openFrom;
    }
    this.modelInstanceInvestigationPopup = this._modalService.open(InvestigationComponentListComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal modal-md'
    });
    this.modelInstanceInvestigationPopup.result.then(result => {
      if (result != 'close' && this.componentPopupFrom == 'lab_form_add') {
        result.selectedComponentCount = (_.filter(result.componentList, (val, index) => {
          return val.isSelected == true;
        })).length;
        this.labOrderForm.patchValue(result);
      }
      if (result != 'close' && this.componentPopupFrom == 'lab_order_list') {
        _.map(this.labOrderList, (val, index) => {
          if (val.labId == result.labId) {
            val.componentList = result.componentList;
            val.selectedComponentCount = (_.filter(result.componentList, (v, i) => {
              return v.isSelected == true;
            })).length;
          }
        });
      }
      this.componentPopupFrom = '';
    });
    this.modelInstanceInvestigationPopup.componentInstance.selectedInvestigationComponentList = _.cloneDeep(data);
  }

  setMedicineFreqSchedule(labDetails, onBlur?) {
    let Freq;
    Freq = +labDetails.frequency || 1;

    if (onBlur) { return; }

    if (!_.isUndefined(labDetails) && Freq !== '') {
      if (Freq === 1) {
        if (!labDetails.frequencySchedule) {
          labDetails.frequencySchedule = '1-0-0';
        } else if (labDetails.frequencySchedule === '1-0-0') {
          labDetails.frequencySchedule = '0-1-0';
        } else if (labDetails.frequencySchedule === '0-1-0') {
          labDetails.frequencySchedule = '0-0-1';
        } else {
          labDetails.frequencySchedule = '1-0-0';
        }
      } else if (Freq === 2) {
        if (!labDetails.frequencySchedule) {
          labDetails.frequencySchedule = '1-0-1';
        } else if (labDetails.frequencySchedule === '1-0-1') {
          labDetails.frequencySchedule = '1-1-0';
        } else if (labDetails.frequencySchedule === '1-1-0') {
          labDetails.frequencySchedule = '0-1-1';
        } else {
          labDetails.frequencySchedule = '1-0-1';
        }
      } else if (Freq >= 3 || Freq === 0) {
        labDetails.frequencySchedule = '';
        for (let i = 0; i < Freq && Freq <= 24; i++) {
          labDetails.frequencySchedule += (i === 0) ? 1 : '-1';
        }
      }
    } else {
      labDetails.frequencySchedule = '';
    }
    this.labOrderForm.patchValue(labDetails);
  }

  openSuggestionPanel() {
    this.publicService.componentSectionClicked({
      sectionKeyName: 'labOrders'
    }); // -- to update suggestion list
  }

  onFreqStartTimeSelect(hrs?) {
    if (!hrs) { return; }
    this.labOrderForm.patchValue({
      freqStartTime: hrs.time
    });
    const hrsObj = _.find(this.hoursList, (o) => o.time === hrs);
    _.map(this.hoursList, (o) => { if (hrs !== o.time) { o.isActive = false; } });
    if (!hrsObj) { return; }
    hrsObj.isActive = !hrsObj.isActive;
  }

  updateOrderChanges(): void {
    this.labOrderForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.addLabOrders();
    });
  }

  onSearch(event) {
    this.suggestionPanelComp.searchKeyword = event;
    this.suggestionPanelComp.subject.next();
  }

  hideHistory() {
    this.suggestionPanelComp.hideHistory();
  }

  loadLabFavTemplateSuggestions() {
    const reqParams = {
      item_id: this.labOrderForm.get('labInvestigationObj').value.id,
      patient_id: this.patientId,
      dept_id: null,
      user_id: this.userId,
      limit: 50
    };

    this.orderService.getOrderFavTemplates(reqParams, 'labOrders').subscribe(result => {
      this.activeTab = !result.length ? 'Frequency' : 'Templates';
      _.map(result, (o) => {
        o.id = '';
        o.tempId = this.labOrderForm.value.tempId;
        o.priority = this.labOrderForm.value.priority;
        o.action = this.labOrderForm.value.action;
        o.status = this.labOrderForm.value.status;
        o.order_id = '';
        o.orderDate = this.labOrderForm.value.orderDate;
        o.orderBy = null;
        o.approvedBy = null;
      });
      this.labOrdersFavSuggestionTemplateList = result;
    });
  }

  configureAction($event) {
    if ($event.nextId === 'Templates') {
      this.loadLabFavTemplateSuggestions();
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

  approveOrders(item, i) {
    this.labOrderList[i] = item;
  }

  getLanguageInstruction(term?) {
    const reqParams = {
      patient_id: this.patientId,
      user_id: this.userId,
      item_id: this.labOrderForm.get('labInvestigationObj').value.id,
      limit: 50
    };
    return this.orderService.getOrderInstructions(reqParams, 'labOrders').pipe(
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
      item_id: this.labOrderForm.get('labInvestigationObj').value.id,
      limit: 50
    };
    return this.orderService.getOrderInstructions(reqParams, 'labOrdersRequisition').pipe(
      map(result => {
        const list = [];
        _.map(result, (v) => {
          const obj = {
            instruction: v
          };
          list.push(obj);
        });
        this.labOrdersRequisitionList = list;
        return result;
      })
    );
  }
}

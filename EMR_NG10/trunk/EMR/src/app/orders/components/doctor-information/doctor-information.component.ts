import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { takeUntil, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { AuthService } from './../../../public/services/auth.service';
import { CommonService } from './../../../public/services/common.service';
import { ConsultationService } from './../../../public/services/consultation.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { OrderService } from './../../../public/services/order.service';
import { PublicService } from './../../../public/services/public.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { DoctorInformationOrder, OtherServicesOrder } from './../../../public/models/doctor-information-order';
import { AddSuggestionMasterComponent } from './../../../emr-shared/components/add-suggestion-master/add-suggestion-master.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationOrderPopupComponent } from '../confirmation-order-popup/confirmation-order-popup.component';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-doctor-information',
  templateUrl: './doctor-information.component.html',
  styleUrls: ['./doctor-information.component.scss']
})
export class DoctorInformationComponent implements OnInit, OnDestroy {
  doctorInstrucFrm: FormGroup;
  otherServiceFrm: FormGroup;
  patientObj: EncounterPatient = null;
  patientId: any;
  userData: any;
  userId: number;
  alertMsg: IAlert;
  doctorInstructionOrderList: Array<any> = [];
  otherServiceandNotesOrderList: Array<any> = [];

  destroy$: Subject<any> = new Subject<any>();
  orderDisplayType: string; // -- value set from dynamic load comp
  isFrom: any;
  loadSuggestion = true;
  showInputSearchBox = true;
  activeIndex = -1;
  checkAllValue = false;
  showdoctorInstructionAddSection = false;
  otherServicesAddSection = false;
  suggestionPanelSettings: any;
  isOnload = false;
  searchKeyword = '';
  submitted = false;
  selectedItemIndx = -1;
  prevStatus: string;
  isFromOrderSetEdit: boolean;
  activeModal: any;
  docInstructOrderFavSuggTemplateList: any[] = [];
  activeTab: any = 'Templates';
  activedisplayTab: any = 'DoctorInstruction';
  click$ = new Subject<string>();
  DInstructionList: any = [];
  editData: any;
  isTabModeOn;

  @ViewChild('suggestionPanel', { static: false }) suggestionPanelComp: any;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private consultationService: ConsultationService,
    private orderService: OrderService,
    private publicService: PublicService,
    private authService: AuthService,
    public modalService: NgbModal
  ) { }

  ngOnInit() {
    this.isTabModeOn = this.commonService.isTabModeOn;
    this.userId = +this.authService.getLoggedInUserId();
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings.suggestionIsShow = true;
    this.suggestionPanelSettings.suggestionPin = 'pin';
    this.isFrom = { sectionName: 'Other', sectionKeyName: 'otherOrders', subSectionKeyName: 'Doctor Instruction', modelpopup: 'OrdersPopup' };
    this.showdoctorInstructionAddSection = (this.showdoctorInstructionAddSection === undefined) ? false : this.showdoctorInstructionAddSection;
    this.otherServicesAddSection = (this.otherServicesAddSection === undefined) ? false : this.otherServicesAddSection;

    this.getpatientData();
    this.afterGetPatData();
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
      this.afterGetPatData();
    });
    this.doctorInstrucFrm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (this.selectedItemIndx !== -1 && this.isTabModeOn) {
        this.doctorInstructionOrderList[this.selectedItemIndx].startDateTime = res.startDateTime;
        this.doctorInstructionOrderList[this.selectedItemIndx].specInstruction = res.specInstruction;
      }
    });
    this.otherServiceFrm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (this.selectedItemIndx !== -1 && this.isTabModeOn) {
        this.otherServiceandNotesOrderList[this.selectedItemIndx].startDateTime = res.startDateTime;
        this.otherServiceandNotesOrderList[this.selectedItemIndx].specInstruction = res.specInstruction;
      }
    });
  }

  afterGetPatData() {
    this.doctorInstructionOrderList = [];
    this.otherServiceandNotesOrderList = [];
    this.getotherOrders();
    this.openSuggestion();
    this.setDoctorInstOrderForm();
    this.subcriptionOfEvents();
    this.setServicesOrderForm();
    this.editOnInit();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  updateDataToArray() {
    this.submitted = true;
    if (this.doctorInstrucFrm.valid && this.submitted) {
      this.submitted = false;
      const doctorInfoModal = new DoctorInformationOrder();
      if (this.doctorInstrucFrm.value && doctorInfoModal.isObjectValid(this.doctorInstrucFrm.value)) {
        doctorInfoModal.generateObject(this.doctorInstrucFrm.value);
        if (this.selectedItemIndx !== -1) { // edit
          if (_.isUndefined(this.isFromOrderSetEdit)) {
            this.doctorInstructionOrderList[this.selectedItemIndx] = doctorInfoModal;
          }
        }
      }
    }
    this.selectedItemIndx = -1;
    this.activeIndex = -1;
  }

  updateDataToArrayOther() {
    this.submitted = true;
    if (this.otherServiceFrm.valid && this.submitted) {
      this.submitted = false;
      const otherInfoModal = new OtherServicesOrder();
      if (this.otherServiceFrm.value && otherInfoModal.isObjectValid(this.otherServiceFrm.value)) {
        otherInfoModal.generateObject(this.otherServiceFrm.value);
        if (this.selectedItemIndx !== -1) { // edit
          if (_.isUndefined(this.isFromOrderSetEdit)) {
            this.otherServiceandNotesOrderList[this.selectedItemIndx] = otherInfoModal;
          }
        }
      }
    }
    this.selectedItemIndx = -1;
    this.activeIndex = -1;
  }

  setDoctorInstOrderForm() {
    this.doctorInstrucFrm = this.fb.group({
      instructionId: [''],
      name: ['', Validators.required],
      startDateTime: [new Date(), Validators.required],
      endDateTime: [null],
      quantity: [''],
      // freq: [1],
      specInstruction: [''],
      action: [''],
      id: [''],
      status: ['approved'],
      isDirty: [true],
      tempId: '',
      orderBy: [null]
    });
  }
  setServicesOrderForm() {
    this.otherServiceFrm = this.fb.group({
      serviceId: [''],
      name: ['', Validators.required],
      startDateTime: [new Date(), Validators.required],
      endDateTime: [null],
      quantity: [''],
      // freq: [1],
      specInstruction: [''],
      action: [''],
      id: [''],
      status: ['approved'],
      isDirty: [true],
      tempId: '',
      orderBy: [null]
    });
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  getotherOrders() {
    this.orderService.getOrderData('otherOrders').pipe(takeUntil(this.destroy$)).subscribe(res => {
      res.docInstructionOrder = _.uniqBy(res.docInstructionOrder, 'tempId');
      res.servicesOrder = _.uniqBy(res.servicesOrder, 'tempId');
      const doctorInfo = new DoctorInformationOrder();
      _.map(res.docInstructionOrder, (rol) => {
        if (doctorInfo.isObjectValid(rol)) {
          doctorInfo.generateObject(rol);
          this.doctorInstructionOrderList.push(_.cloneDeep(doctorInfo));
        }
      });
      const otherService = new OtherServicesOrder();
      _.map(res.servicesOrder, (obj) => {
        if (otherService.isObjectValid(obj)) {
          otherService.generateObject(obj);
          this.otherServiceandNotesOrderList.push(_.cloneDeep(otherService));
        }
      });
    });
  }

  editOnInit() {
    if (!_.isUndefined(this.editData)) {
      this.onEditInfo(this.editData.data, this.editData.orderIndex);
    }
  }

  saveToLocalObj(array) {
    this.consultationService.setConsultationFormData(this.patientId, 'otherOrders', array, 'update', false, true);
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
    return this.orderService.SaveOrderAction(param).pipe(map(dt => {
      return dt;
    }));
  }

  checkOrderTypeExistInOrder(order): Observable<any> {
    const param = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo,
      orderCategory: order.key,
      masterId: null,
    };
    if (order.key === 'Doctor Instruction') {
      param.masterId = order.data.instructionId;
    } else if (order.key === 'Services with Notes') {
      param.masterId = order.data.serviceId;
    }
    return this.orderService.checkPatientOrderStatus(param).pipe(map(res => {
      if (order.key === 'Doctor Instruction') {
        if (res.instructionOrders) {
          return res.instructionOrders;
        } else {
          return null;
        }
      } else if (order.key === 'Services with Notes') {
        if (res.serviceOrders) {
          return res.serviceOrders;
        } else {
          return null;
        }
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
      type: 'otherOrders',
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
          if (selectedData.key === 'Doctor Instruction') {
            this.updateFormValueDoctor(selectedData);
          } else if (selectedData.key === 'Services with Notes') {
            this.updateFormValueService(selectedData);
          }
        });
      } else {
        if (selectedData.key === 'Doctor Instruction') {
          this.updateFormValueDoctor(res);
        } else if (selectedData.key === 'Services with Notes') {
          this.updateFormValueService(res);
        }
      }
    }, (dis) => {
      this.suggestionPanelComp.initialLoadData(this.isFrom);
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  updateFormValueDoctor(selectedData, retObject?) {
    const doctorInfo = new DoctorInformationOrder();
    const obj: any = Object.assign({}, selectedData.data);
    if (this.userData.role_type !== _.toUpper(Constants.userRoleType.doctor.key)) {
      obj.isDirty = true;
      obj.tempId = moment(new Date()).valueOf();
      obj.status = 'INITIATED';
    } else {
      obj.isDirty = true;
      obj.tempId = moment(new Date()).valueOf();
      obj.status = 'APPROVED';
      obj['approvedBy'] = {
        approved_date: new Date(),
        user_id: this.userId,
        user_name: this.userData.user_name
      };
    }

    // obj['invalidObjectMessage'] = this.setInvalidMsg(obj);
    // this.dietOrdModelInst.generateObject(obj);
    if (doctorInfo.isObjectValid(obj)) {
      doctorInfo.generateObject(obj);
      if (retObject) {
        return doctorInfo;
      }
      this.publicService.setupdateByValueOnOrder(doctorInfo);
      this.doctorInstructionOrderList.push(doctorInfo);
      doctorInfo.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
      const data = {
        docInstructionOrder: this.doctorInstructionOrderList,
        servicesOrder: this.otherServiceandNotesOrderList
      };
      this.orderService.setOrderData(data, 'update', 'otherOrders');
    }
  }

  updateFormValueService(selectedData, retObject?) {
    const oterServiceInfo = new OtherServicesOrder();
    let obj: any = Object.assign({}, selectedData.data);
    const statusData = this.orderService.checkOrderStatus(this.userData);
    obj.isDirty = true;
    obj.tempId = moment(new Date()).valueOf();
    obj.status = statusData.status;
    if (statusData.approvedBy) {
      obj.status = statusData.status;
      obj.approvedBy = statusData.approvedBy
    }
    if (oterServiceInfo.isObjectValid(obj)) {
      oterServiceInfo.generateObject(obj);
      if (retObject) {
        return oterServiceInfo;
      }
      this.publicService.setupdateByValueOnOrder(oterServiceInfo);
      this.otherServiceandNotesOrderList.push(oterServiceInfo);
      oterServiceInfo.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1); const data = {
        docInstructionOrder: this.doctorInstructionOrderList,
        servicesOrder: this.otherServiceandNotesOrderList
      };
      this.orderService.setOrderData(data, 'update', 'otherOrders');
    }
  }

  subcriptionOfEvents() {
    this.orderService.$subcFilteredEvnt.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if ('setData' === res.mode && 'otherOrders' === res.filterBy) {
        this.getotherOrders();
      }
    });
    this.publicService.listenEventFromSuggList.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.key === 'Doctor Instruction') {
        if (data.type === 'add') {
          if (this.orderDisplayType === 'all') {
            this.checkOrderTypeExistInOrder(data).subscribe(res => {
              if (res) {
                this.getConfirmationPopup(data, res);
              } else {
                this.updateFormValueDoctor(data);
              }
            });
          }
        } else if (data.type === 'delete') {
          if (data.data !== -1) {
            this.doctorInstructionOrderList.splice(data.data, 1);
          }
        }
      } else if (data.key === 'Services with Notes') {
        if (data.type === 'add') {
          this.checkOrderTypeExistInOrder(data).subscribe(res => {
            if (res) {
              this.getConfirmationPopup(data, res);
            } else {
              this.updateFormValueService(data);
            }
          });
        } else if (data.type === 'delete') {
          if (data.data !== -1) {
            this.otherServiceandNotesOrderList.splice(data.data, 1);
          }
        }
      }
      const obj = {
        docInstructionOrder: this.doctorInstructionOrderList,
        servicesOrder: this.otherServiceandNotesOrderList
      };
      this.saveToLocalObj(obj);
    });

    this.orderService.$subLoadSuggestionFromOrders.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res === 'otherOrders' && !this.loadSuggestion) {
        this.openSuggestion();
      }
    });

    this.orderService.$OrderEvent.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res.orderKey === 'otherOrders' && res.action === 'clear_orders') {
        this.doctorInstructionOrderList = [];
        this.otherServiceandNotesOrderList = [];
      }
    });
  }

  openSuggestion(): void {
    this.showdoctorInstructionAddSection = false;
    this.otherServicesAddSection = false;
    this.loadSuggestion = true;
    setTimeout(() => {
      this.publicService.componentSectionClicked(this.isFrom); // -- to update suggestion list
    });
  }

  findPendingObject(key?) {
    if (key === 'Doctor Instruction' && this.doctorInstructionOrderList.length) {
      this.checkAllValue = this.doctorInstructionOrderList.some((res: any) => res.status === 'approvelPending' && res.tempstatus !== 'approved') ? false : true;
    } else if (key === 'Services with Notes' && this.otherServiceandNotesOrderList.length) {
      this.checkAllValue = this.otherServiceandNotesOrderList.some((res: any) => res.status === 'approvelPending' && res.tempstatus !== 'approved') ? false : true;
    }
  }

  onSearch(event) {
    this.suggestionPanelComp.searchKeyword = event;
    this.suggestionPanelComp.subject.next();
  }

  hideHistory() {
    this.suggestionPanelComp.hideHistory();
  }

  // -- remove orders
  removeDoctorInfo(selectedItem: any, sugKey?) {
    const list = sugKey === 'Doctor Instruction' ? this.doctorInstructionOrderList : this.otherServiceandNotesOrderList;
    const i = list.findIndex((dl) => dl.tempId === selectedItem.tempId && (dl.id === undefined || dl.id === ''));
    if (i === -1) { return; }
    const status = list[i].status;
    list.splice(i, 1);
    this.clearForm();
    this.openSuggestion();

    const data = {
      docInstructionOrder: this.doctorInstructionOrderList,
      servicesOrder: this.otherServiceandNotesOrderList
    };
    this.orderService.setOrderData(data, 'update', 'otherOrders');
  }

  clearForm() {
    this.doctorInstrucFrm.reset({
      startDateTime: new Date(),
      endDateTime: null,
      action: 'approved',
      status: 'approved',
      isDirty: true
    });
    this.submitted = false;
    this.selectedItemIndx = -1;
  }

  onEditInfo(item, i, key?) {
    let index = -1;
    if (item.orderIndex !== undefined) {
      index = item.orderIndex;
      delete item.orderIndex;
    } else {
      const list = key === 'Doctor Instruction' ? this.doctorInstructionOrderList : this.otherServiceandNotesOrderList;
      index = list.findIndex((o: any) => o.name === item.name && ((o.id === undefined || o.id === '') || o.isDirty));
    }
    if (index === -1) { return; }

    if (this.isTabModeOn) {
      this.showdoctorInstructionAddSection = key === 'Doctor Instruction' ? true : false;
      this.otherServicesAddSection = key === 'Services with Notes' ? true : false;
      this.loadSuggestion = false;
    }
    this.selectedItemIndx = index;
    this.prevStatus = item.status;
    if (key === 'Doctor Instruction') {
      this.doctorInstrucFrm.patchValue(item);
      if (this.isTabModeOn) {
        this.loaddoctorInstructionFavTemplateSuggestions();
        this.getLanguageInstruction().subscribe();
      }
    } else {
      this.otherServiceFrm.patchValue(item);
    }
  }


  addDoctorInfo() {
    if (!this.isTabModeOn) {
      return;
    }
    this.submitted = true;
    if (this.doctorInstrucFrm.valid && this.submitted) {
      this.submitted = false;
      const doctorInfoModal = new DoctorInformationOrder();
      if (this.doctorInstrucFrm.value && doctorInfoModal.isObjectValid(this.doctorInstrucFrm.value)) {
        doctorInfoModal.generateObject(this.doctorInstrucFrm.value);
        if (this.selectedItemIndx !== -1) { // edit
          if (_.isUndefined(this.isFromOrderSetEdit)) {
            this.doctorInstructionOrderList[this.selectedItemIndx] = doctorInfoModal;
          }
          // this.selectedItemIndx = -1;
          if (!_.isUndefined(this.activeModal)) {
            if (!_.isUndefined(this.isFromOrderSetEdit)) {
              // set order set data
              const editObj = {
                mode: 'orderSetEditPopup',
                key: 'otherOrders',
                data: this.doctorInstrucFrm.value,
                orderIndex: 0
              };
              this.orderService.editOrderSetData(editObj);
            }
            this.showdoctorInstructionAddSection = false;
            this.otherServicesAddSection = false;
            this.activeModal.close();
          }
        } else {
          doctorInfoModal['tempId'] = moment(new Date()).valueOf();
          this.doctorInstructionOrderList.push(doctorInfoModal);
        }
      }
    }
  }

  approveOrders(item, i, sugKey?) {
    const list = sugKey === 'Doctor Instruction' ? this.doctorInstructionOrderList : this.otherServiceandNotesOrderList;
    list[i] = item;
  }
  addMasterDoctorInstruction(): void {
    const modelInstancePopup = this.modalService.open(AddSuggestionMasterComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'sm'
    });
    modelInstancePopup.componentInstance.masterName = 'Doctor Instruction';
    modelInstancePopup.componentInstance.placeHolderName = 'Add Doctor Instruction Name';
    modelInstancePopup.componentInstance.newSuggNameEvent.subscribe((e: any) => {
      this.saveMasterDoctorInstruction(e);
    });
    modelInstancePopup.result.then(result => {
    });
  }

  saveMasterDoctorInstruction(event) {
    const reqParams = {
      id: 0,
      name: event,
      instruction: ''
    };
    this.orderService.savedctorInstructionMaster(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          message: 'Saved Successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.onSearch(this.searchKeyword);
      }
    });
  }
  configureAction($event) {
    if ($event.nextId === 'Templates') {
      this.loaddoctorInstructionFavTemplateSuggestions();
    }
    if ($event.nextId === 'DoctorInstruction') {
      this.isFrom.subSectionKeyName = 'Doctor Instruction';
      this.openSuggestion();
      this.selectedItemIndx = -1;
    } else if ($event.nextId === 'serviceswithnotes') {
      this.isFrom.subSectionKeyName = 'Services with Notes';
      this.openSuggestion();
      this.selectedItemIndx = -1;
    }
  }

  loaddoctorInstructionFavTemplateSuggestions() {
    const reqParams = {
      item_id: this.doctorInstrucFrm.value.instructionId,
      patient_id: this.patientId,
      user_id: this.userId,
      limit: 5
    };

    this.orderService.getOrderFavTemplates(reqParams, 'otherOrders').subscribe(result => {
      this.activeTab = !result.length ? 'Instruction' : 'Templates';
      _.map(result, (o) => {
        o.id = '';
        o.tempId = this.doctorInstrucFrm.value.tempId;
        // o.priority = this.diatOrdersFrm.value.priority;
        o.action = this.doctorInstrucFrm.value.action;
        o.status = this.doctorInstrucFrm.value.status;
        o.order_id = '';
        o.orderBy = null;
        o.approvedBy = null;
      });
      this.docInstructOrderFavSuggTemplateList = result;
    });
  }

  getLanguageInstruction(term?) {
    const reqParams = {
      patient_id: this.patientId,
      user_id: this.userId,
      item_id: this.doctorInstrucFrm.value.instructionId,
      limit: 50
    };
    return this.orderService.getOrderInstructions(reqParams, 'otherOrders_doctorInstruction').pipe(
      map(result => {
        const list = [];
        _.map(result, (v) => {
          const obj = {
            instruction: v
          };
          list.push(obj);
        });
        this.DInstructionList = list;
        return result;
      })
    );
  }
}

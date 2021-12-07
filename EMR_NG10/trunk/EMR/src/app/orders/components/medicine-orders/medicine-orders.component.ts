import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy, OnChanges, Input, ViewChild, SimpleChanges, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { forkJoin, Observable, Subject, throwError, merge, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PrescriptionService } from './../../../public/services/prescription.service';
import { ConsultationService } from './../../../public/services/consultation.service';
import { PublicService } from './../../../public/services/public.service';
import { OrderService } from '../../../public/services/order.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { MedicineOrders } from './../../../public/models/medicine-orders';
import { MedicineRoute } from './../../../public/models/medicine-route';
import { MedicineSig } from './../../../public/models/medicine-sig';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Medicine } from './../../../public/models/medicine';
import { CommonService } from './../../../public/services/common.service';
import { AuthService } from './../../../public/services/auth.service';

declare const google: any;
import { DynamicChartService } from '././../../../dynamic-chart/dynamic-chart.service';
import { PrescriptionDetails } from './../../models/prescription-detail';
import { IMedicineTypes } from './../../../public/models/iprescription';
import { ConfirmationOrderPopupComponent } from '../confirmation-order-popup/confirmation-order-popup.component';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-medicine-orders',
  templateUrl: './medicine-orders.component.html',
  styleUrls: ['./medicine-orders.component.scss'],
})
export class MedicineOrdersComponent implements OnInit, OnDestroy, OnChanges {
  doseMaster: any[] = [];
  doseUnitMaster: any[] = [];
  frequencyNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  daysSuggesion = [1, 2, 3, 5, 7, 10, 15, 20, 30, 60, 90];
  hoursList: Array<any> = [];
  defaultInstructions = ['Before Meal', 'After Meal'];
  medicineOrderFrm: FormGroup;
  compInstance = this;
  genericFrequencyList: any[] = [];
  genericDurationList: any[] = [];
  sigList: MedicineSig[] = [];
  genericDoseList: any[] = [];
  dosageUnitList: Array<any> = [];
  routeList: Array<MedicineRoute> = [];
  genericRemarksList: any[] = [];
  medicineOrdersList: any[] = [];
  showInputSearchBox = true;
  priorityList$: Observable<any[]>;
  copyOfPriorityList: any[] = [];
  actionList$: Observable<any[]>;
  copyOfActionList: any[] = [];
  patientId: any;
  destroy$ = new Subject();
  submitted = false;
  selectedItemIndx = -1;
  loginUserInfo: any;
  prevStatus: string;
  medicineTypes: any[] = [];
  filterBy: string;
  activeIds = [];
  closeOthers = true;
  orderCatId: number;
  userId: number;
  userData: any;
  alertMsg: IAlert;
  usedFor: string;
  editData: any;
  isEdit: boolean = true;
  isDelete: boolean = true;
  isShowActions: boolean = true;
  medicineOrdModelInst = new MedicineOrders();
  activeModal: any;
  isFromOrderSetEdit: boolean;
  _modalService: NgbModal;
  frequencyMasterList: Array<any> = [];
  activeIndex = -1;
  suggestionPanelSettings: any;
  isOnload = true;
  isFrom: any;
  searchKeyword: any;
  activeOrderIndex = -1;
  medicineOrdersFavSuggestionTemplateList: MedicineOrders[] = [];
  patientObj: EncounterPatient;
  googleTransControl: any;
  isTranslationEnabled = true;
  click$ = new Subject<string>();
  prescriptionInstructionsList: any[] = [];
  orderInstructionList: any[] = [];
  activeTab: any = 'Templates';
  checkAllValue = false;
  isTabModeOn;

  @Input() orderFieldInputDetails = {
    orderKey: '',
    selectedDose: '',
    selectedDoseUnit: ''
  };
  @Input() source = 'medicineOrders';
  @Input() selectedLanguage: any;
  @Input() orderDisplayType: string; // -- value set from dynacic load comp
  @Input() loadSuggestion = true;
  @Input() showAddSection: boolean;
  @Input() isOpen = false;
  @Input() chartDetailId: number;
  @Input() isNonOpdConsultationChart = false;
  @ViewChild('suggestionPanel', { static: false }) suggestionPanelComp: any;
  @ViewChild('medicineInput', { static: false, read: ViewContainerRef }) filterContainerRef: ViewContainerRef;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private prescriptionService: PrescriptionService,
    private orderService: OrderService,
    private consultationService: ConsultationService,
    private modService: NgbModal,
    private authService: AuthService,
    private commonService: CommonService,
    private dynamicChartService: DynamicChartService
  ) {
    this._modalService = modService;
  }

  ngOnInit() {
    this.isTabModeOn = this.commonService.isTabModeOn;
    this.userId = +this.authService.getLoggedInUserId();
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.createMedicineForm();
    this.getpatientData();
    this.afterGetPatData();
    this.subcriptionOfEvents();
  }

  afterGetPatData() {
    this.medicineOrdersList = [];
    this.frequencyMasterList = [];
    this.setSuggestionPanelSetting();
    this.getAllMedicineTypes('').subscribe(); // t
    this.getGenericeMasterData(); // t
    this.getPriorityLists();
    this.getActionsList();
    if (this.source !== 'prescription') {
      this.getOrdersData();
    } else if (this.source === 'prescription') {
      this.getPrescriptionData();
    }
    for (let i = 1; i <= 99; i++) {
      this.frequencyMasterList.push(i);
    }
    this.showAddSection = (this.showAddSection === undefined) ? false : this.showAddSection;
    this.hoursList = this.orderService.generateHours();
    this.editOnInit();
    this.onFormChanges();
    this.updateOrderChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.source === 'prescription') {
      if (this.loadSuggestion) {
        this.openSuggestion();
      }
      if (this.showAddSection) {
        this.initTransliterationAPI();
      }
      if (this.medicineOrderFrm) {
        this.medicineOrderFrm.get('medicineObj').patchValue({
          languageId: this.selectedLanguage.id,
          chart_detail_id: this.chartDetailId
        });
      }
    }
  }

  setSuggestionPanelSetting() {
    const panelHeaderText = (this.source === 'medicineOrders') ? 'Medicine Orders' : 'Prescription';
    this.suggestionPanelSettings = {};
    this.suggestionPanelSettings.suggestionIsShow = true;
    this.suggestionPanelSettings.suggestionPin = 'pin';
    this.isFrom = { sectionName: panelHeaderText, sectionKeyName: 'medicineOrders', modelpopup: 'OrdersPopup' };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  createMedicineForm() {
    this.medicineOrderFrm = this.fb.group({
      id: [''],
      tempId: [''],
      medicineObj: this.fb.group({
        id: ['', Validators.required],
        name: ['', Validators.required],
        type: this.fb.group({
          id: ['', Validators.required],
          shortName: [''],
          name: ['', Validators.required],
          doseUnit: [''],
          doseUnitObj: [null]
        }, Validators.required),
        genricName: [''],
        frequency: [1, Validators.compose([Validators.pattern('^[0-9]*$'), Validators.required, Validators.max(24)])],
        frequencySchedule: [''],
        freqStartTime: ['08:00 AM'],
        duration: [1, Validators.required],
        sig: [null],
        dose: [null],
        route: [null],
        startDate: [new Date()],
        endDate: [new Date()],
        instruction: [''],
        mealTypeInstruction: [''],
        languageId: ['1']
      }, Validators.required),
      priority: [''],
      action: [''],
      status: 'approved',
      isDirty: true,
      orderBy: [null]
    });
  }

  // -- get all medicine types return observable
  getAllMedicineTypes(searchValue: string): Observable<any> {
    searchValue = _.isArray(searchValue) ? '' : searchValue;
    searchValue = searchValue === undefined ? '' : searchValue;
    return this.compInstance.publicService.getMasterMedicineTypes().pipe(map(res => {
      this.compInstance.medicineTypes = res;
      const data = searchValue === '' ? res :
        _.filter(res, (v: any) => v.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
      return data;
    }));
  }

  getOrdersData() {
    this.orderService.getOrderData('medicineOrders').subscribe(result => {
      result = _.uniqBy(result, 'tempId');
      this.medicineOrdersList = (_.isArray(result)) ? result : [];
      const medOrder = new MedicineOrders();
      _.map(this.medicineOrdersList, (o, i) => {
        medOrder.generateObject(o, false);
        this.medicineOrdersList[i] = _.clone(medOrder);
      });
    });
  }

  onMedicineType(e): void {
    const isTrue = typeof e === 'object';
    const medicineTypes = new IMedicineTypes();
    if (isTrue && medicineTypes.isObjectValid(e)) {
      medicineTypes.generateObject(e);
      this.mediceTypeControls.patchValue(medicineTypes);
    }
    this.mediceObjectControls.patchValue({ id: '', name: '' });
    this.getMedicineNamesByTypes('');
  }

  // -- get medicine list by its type ie:medicine_type
  getMedicineNamesByTypes(searchKey): Observable<any> {
    return this.compInstance.publicService.getMedicinesAllWithPagination(this.compInstance.mediceTypeControls.value.id, 1, 50, searchKey)
      .pipe(
        takeUntil(this.compInstance.destroy$),
        map(res => res.medicine_data),
        catchError(error => [])
      );
  }

  openSuggestionPanel() {
    this.publicService.componentSectionClicked({
      sectionKeyName: 'medicineOrders',
      componentData: { chartDetailId: this.chartDetailId }
    }); // -- to update suggestion list
  }

  selectMedicine(e): void {
    const isTrue = typeof e === 'object';
    if (!isTrue) {
      return;
    }
    this.onMedicineSelect(e).subscribe();
  }

  onMedicineSelect(e): Observable<any> {
    return this.prescriptionService.getMedicineDetailsById(e.id).pipe(map(response => {
      if (!response || _.isEmpty(response)) {
        return;
      }
      const mergedObj = Object.assign(e, response);
      const medicinetype = this.getMedicineTypeName(e.MedicineTypeID);

      //  --- 22-05-2019 -- vikram
      const medicine = new Medicine();
      const medicineTypeModel = new IMedicineTypes();
      if (medicineTypeModel.isObjectValid(medicinetype) || (medicineTypeModel.isObjGenerated)) {
        medicineTypeModel.generateObject(medicinetype);
        mergedObj.type = medicineTypeModel;
        mergedObj.duration = '1';
        mergedObj.genericFreq = '1';
        mergedObj.genericDuration = {
          duration: 1
        };
        if (medicine.isObjectValid(mergedObj)) {
          medicine.generateObject(mergedObj);
          this.mediceObjectControls.patchValue(medicine);
        }
      }
    })
    );
  }

  getGenericeMasterData(): void {
    const sigListObs = this.prescriptionService.GetMedicineSigList();
    const routeListObs = this.prescriptionService.GetMedicineRouteList();
    const doseListObs = this.prescriptionService.GetMedicineDoseList(1);
    const doseUnitListObs = this.prescriptionService.GetMedicineDoseUnitList(1);
    forkJoin([sigListObs, routeListObs, doseListObs, doseUnitListObs]).subscribe(res => {
      this.sigList = res[0];
      this.routeList = res[1];
      this.doseMaster = res[2];
      this.doseUnitMaster = res[3];
      this.genericFrequencyList = [];
      this.genericDurationList = [];
      this.genericRemarksList = [];
    });
  }

  updateDataToArray() {
    if (this.medicineOrderFrm.valid) {
      this.medicineOrderFrm.get('medicineObj').value.startDate = new Date(this.medicineOrderFrm.value.medicineObj.startDate);
      this.medicineOrderFrm.value.isDirty = true;
      if (this.selectedItemIndx !== -1) { // -- Edit mode
        const medicineOrderObj = this.orderService.getOrderObjectByOrderKey('medicineOrders', this.medicineOrderFrm.value);
        if (_.isUndefined(this.isFromOrderSetEdit)) {
          this.medicineOrdersList[this.selectedItemIndx] = medicineOrderObj;
        }
      }
    }
    this.selectedItemIndx = -1;
    if (this.source === 'order') {
      this.saveToLocalObj(this.medicineOrdersList);
    }
    if (this.source === 'prescription') {
      this.updatePrescriptionData();
    }
  }

  addMedicine(): void {
    if (!this.isTabModeOn) {
      return;
    }
    this.submitted = true;
    if (this.medicineOrderFrm.valid) {
      this.medicineOrderFrm.get('medicineObj').value.startDate = new Date(this.medicineOrderFrm.value.medicineObj.startDate);
      this.medicineOrderFrm.value.isDirty = true;
      if (this.selectedItemIndx !== -1) { // -- Edit mode
        const medicineOrderObj = this.orderService.getOrderObjectByOrderKey('medicineOrders', this.medicineOrderFrm.value);
        if (_.isUndefined(this.isFromOrderSetEdit)) {
          this.medicineOrdersList[this.selectedItemIndx] = medicineOrderObj;
        }
        // this.selectedItemIndx = -1;
        if (!_.isUndefined(this.activeModal)) {
          if (!_.isUndefined(this.isFromOrderSetEdit)) {
            // set order set data
            const editObj = {
              mode: 'orderSetEditPopup',
              key: 'medicineOrders',
              data: medicineOrderObj,
              orderIndex: 0
            };
            this.orderService.editOrderSetData(editObj);
          }
          this.showAddSection = false;
          this.activeModal.close();
        }
      } else {
        this.submitted = false;
        this.medicineOrderFrm.value.tempId = moment().valueOf();
        this.medicineOrdersList.push(this.orderService.getOrderObjectByOrderKey('medicineOrders', this.medicineOrderFrm.value));
      }
      if (this.source === 'order') {
        this.saveToLocalObj(this.medicineOrdersList);
      }
      if (this.source === 'prescription') {
        this.updatePrescriptionData();
      }
    }
  }

  saveToLocalObj(array) {
    this.consultationService.setConsultationFormData(this.patientId, 'medicineOrders', array, 'update', false, true);
  }

  getPriorityLists(): void {
    this.priorityList$ = this.orderService.getPriorityList().pipe(map((res: any) => {
      this.copyOfPriorityList = res;
      this.medicineOrderFrm.patchValue({
        priority: res[0]
      });
      return res;
    }));
  }

  getActionsList() {
    this.actionList$ = this.orderService.getActionLists().pipe(map((res: any) => {
      this.copyOfActionList = res;
      this.medicineOrderFrm.patchValue({
        action: res[0]
      });
      return res;
    })
    );
  }

  // -- reset whole form
  clearForm(): void {
    this.medicineOrderFrm.reset({
      medicineType: null,
      medicineTypeName: null,
      startDate: [new Date()],
      priority: this.copyOfPriorityList[0],
      status: 'approved',
      action: this.copyOfActionList[0],
      isDirty: true
    });
    this.submitted = false;
    this.selectedItemIndx = -1;
    this.getAllMedicineTypes('');
  }

  removeMedicineOrders(selectedItem, fromSuggestion?) {
    const index = _.findIndex(this.medicineOrdersList, res => res.tempId === selectedItem.tempId && (res.id === undefined || res.id === ''));
    if (index === -1) {
      return;
    }
    const status = this.medicineOrdersList[index].status;
    this.medicineOrdersList.splice(index, 1);

    if (this.source === 'prescription') {
      this.dynamicChartService.sendEventToSuggestion.next({
        sectionKeyName: 'prescription',
        action: 'ADD',
        selectedData: selectedItem.medicineObj,
        componentData: { chartDetailId: this.chartDetailId }
      });
      this.updatePrescriptionData();
      this.dynamicChartService.sendEventToParentChartContainer.next({ source: 'prescription', content: { prescriptionDetails: null } });
      return;
    }

    if (this.source === 'medicineOrders') {
      this.orderService.setOrderData(this.medicineOrdersList, 'update', 'medicineOrders');
    }
    this.clearForm();
    if (!fromSuggestion) {
      this.loadSuggestion = true;
      this.showAddSection = false;
      // this.suggestionPanelComp.loadAllMaster().subscribe(res => {
      this.suggestionPanelComp.initialLoadData(this.isFrom);
      // });
    }

  }

  updateFormValue(medicineObj, retObj?) {
    let orderObj = null;
    const statusData = this.orderService.checkOrderStatus(this.userData);
    orderObj = {
      tempId: moment(new Date()).valueOf(),
      status: statusData.status,
      priority: 'Routine',
      isDirty: true
    };
    if (statusData.approvedBy) {
      orderObj = {
        tempId: moment(new Date()).valueOf(),
        status: statusData.status,
        priority: 'Routine',
        isDirty: true,
        approvedBy: statusData.approvedBy
      };
    }
    const medicineType = this.getMedicineTypeName(medicineObj.MedicineTypeID || medicineObj.medicineTypeID);
    const medicineTypeModel = new IMedicineTypes();
    const medicine = new Medicine();
    if (medicineTypeModel.isObjectValid(medicineType) || (medicineTypeModel.isObjGenerated) || medicineObj.type === "new_added_suggestion") {
      // if (medicineObj.type !== "new_added_suggestion") {
      //   medicineTypeModel.generateObject(medicineType); // generate type objects
      //   medicineObj.type = medicineTypeModel;
      // }
      medicineTypeModel.generateObject(medicineType); // generate type objects
      medicineObj.type = medicineTypeModel;
      medicineObj.duration = medicineObj.duration ? medicineObj.duration : 1;
      medicineObj.genericFreq = '1';
      medicineObj.genericDuration = {
        duration: 1
      };
      if (this.source === 'prescription') {
        medicineObj.languageId = this.selectedLanguage.id;
      }
      if (medicine.isObjectValid(medicineObj)) {
        medicine.generateObject(medicineObj);
        orderObj['medicineObj'] = medicine;
      }
    }
    const medOrder = new MedicineOrders();
    medOrder.generateObject(orderObj, false);
    if (retObj) {
      return medOrder;
    }
    medOrder.sequence = this.orderService.getOrderSequence();
    // this.medicineOrdersList.push(this.orderService.generateOrderObjectByOrderKey('medicineOrders', orderObj, false));
    this.publicService.setupdateByValueOnOrder(medOrder);
    this.medicineOrdersList.push(medOrder);
    if (this.source === 'medicineOrders') {
      this.orderService.setOrderData(this.medicineOrdersList, 'update', 'medicineOrders');
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
    }
    if (this.source === 'prescription') {
      this.updatePrescriptionData();
    }
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

  checkOrderTypeExistInOrder(medicine): Observable<any> {
    const param = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo,
      orderCategory: medicine.key,
      masterId: medicine.data.id,
    };
    return this.compInstance.orderService.checkPatientOrderStatus(param).pipe(map(res => {
      if (res.medicineOrders) {
        return res.medicineOrders;
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
      type: 'medicineOrders',
      showEditButton: res.status === 'INITIATED' ? true : false
    };
    const modalInstance = this.modService.open(ConfirmationOrderPopupComponent,
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
        // this.publicService.setupdateByValueOnOrder(res);
        // this.medicineOrdersList.push(res);
        this.updateFormValue(selectedData.data);
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
      if (data.key === 'medicineOrders') {
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
            this.medicineOrdersList.splice(data.data, 1);
          }
        }
      }
    });

    // -- event fired when filter type change on order component
    this.orderService.$subcFilteredEvnt.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if ('setData' === res.mode && 'medicineOrders' === res.filterBy) {
        this.getOrdersData();
      }
    });

    // -- event fired when data need to be editted
    // this.orderService.$subcEditEvent.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
    //   if ('editData' == res.mode && 'medicineOrders' == res.key && this.usedFor == 'add') {
    //     this.showAddSection = true;
    //     this.onEditMedicineOrder(res.data, res.orderIndex);
    //   } else {
    //     this.showAddSection = false;
    //     // this.filterBy = res.filterBy;
    //     // this.activeIds = res.activeIds;
    //     // this.closeOthers = false;
    //   }
    // });

    this.orderService.$subLoadSuggestionFromOrders.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res === 'medicineOrders' && !this.loadSuggestion) {
        this.openSuggestion();
      }
    });
    this.orderService.$OrderEvent.pipe(takeUntil(this.destroy$)).subscribe(res => {
      // this.isFrom = res;
      if (res.orderKey === 'medicineOrders' && res.action === 'clear_orders') {
        this.medicineOrdersList = [];
      }
    });

    this.dynamicChartService.$getEventFrmSuggestion.subscribe(data => {
      if (data.sectionKeyName === 'prescription' && data.componentData.chartDetailId === this.chartDetailId) {
        if (data.action === 'ADD') {
          this.updateFormValue(data.selectedSuggestion);
        } else if (data.action === 'delete') {
          if (data.selectedSuggestionIndx !== -1) {
            this.medicineOrdersList.splice(data.selectedSuggestionIndx, 1);
          }
        }
        this.updatePrescriptionData();
      }
    });
  }

  // -- Get Medicine form controls
  get mediceObjectControls() {
    return this.medicineOrderFrm.get('medicineObj');
  }

  // -- Get Medicine Type form controls
  get mediceTypeControls() {
    return this.medicineOrderFrm.get('medicineObj').get('type');
  }
  approveOrders(item, i) {
    this.medicineOrdersList[i] = item;
  }

  onEditMedicineOrder(item, i) {
    let index = -1;
    if (item.orderIndex !== undefined) {
      index = item.orderIndex;
      delete item.orderIndex;
    } else {
      index = _.findIndex(this.medicineOrdersList, (o) => o.medicineObj.name === item.medicineObj.name && ((o.id === undefined || o.id === '') || o.isDirty));
    }
    if (index === -1) {
      return;
    }
    // if (this.isTabModeOn) {
    this.showAddSection = true;
    this.loadSuggestion = false;
    // }
    this.selectedItemIndx = index;
    this.prevStatus = item.status;
    this.medicineOrderFrm.patchValue(item);
    if (this.source === 'prescription') {
      // this.initTransliterationAPI();
      this.dynamicChartService.sendEventToParentChartContainer.next({ source: 'prescription', content: { prescriptionDetails: this } });
    }
    // if (this.isTabModeOn) {
    this.loadMedicineFavTemplateSuggestions();
    this.getMedicineOrderInstructions().subscribe();
    // }
  }

  selectInstruction(event) {
    const isObj = typeof event === 'object';
    this.mediceObjectControls.patchValue({
      instruction: isObj ? event.remark : event
    });
  }

  getMedicineTypeName(medicineTypeId) {
    return _.find(this.medicineTypes, x => x.id === medicineTypeId);
  }

  setMedicineFreqSchedule(medicineDetail, onBlur?) {
    let Freq;
    Freq = +medicineDetail.frequency || 1;

    if (onBlur) {
      return;
    }

    if (!_.isUndefined(medicineDetail) && Freq !== '') {
      if (Freq === 1) {
        if (!medicineDetail.frequencySchedule) {
          medicineDetail.frequencySchedule = '1-0-0';
        } else if (medicineDetail.frequencySchedule === '1-0-0') {
          medicineDetail.frequencySchedule = '0-1-0';
        } else if (medicineDetail.frequencySchedule === '0-1-0') {
          medicineDetail.frequencySchedule = '0-0-1';
        } else {
          medicineDetail.frequencySchedule = '1-0-0';
        }
      } else if (Freq === 2) {
        if (!medicineDetail.frequencySchedule) {
          medicineDetail.frequencySchedule = '1-0-1';
        } else if (medicineDetail.frequencySchedule === '1-0-1') {
          medicineDetail.frequencySchedule = '1-1-0';
        } else if (medicineDetail.frequencySchedule === '1-1-0') {
          medicineDetail.frequencySchedule = '0-1-1';
        } else {
          medicineDetail.frequencySchedule = '1-0-1';
        }
      } else if (Freq >= 3 || Freq === 0) {
        medicineDetail.frequencySchedule = '';
        for (let i = 0; i < Freq && Freq <= 24; i++) {
          medicineDetail.frequencySchedule += (i === 0) ? 1 : '-1';
        }
      }
    } else {
      medicineDetail.frequencySchedule = '';
    }
    this.mediceObjectControls.patchValue(medicineDetail);
  }

  editOnInit() {
    if (!_.isUndefined(this.editData)) {
      this.onEditMedicineOrder(this.editData.data, this.editData.orderIndex);
    }
  }

  openSuggestion(): void {
    this.showAddSection = false;
    this.loadSuggestion = true;
    if (this.source === 'prescription') {
      this.dynamicChartService.sendEventToSuggestion.next({
        sectionKeyName: 'prescription',
        componentData: { chartDetailId: this.chartDetailId }
      });
      this.dynamicChartService.sendEventToParentChartContainer.next({ source: 'prescription', content: { prescriptionDetails: null } });
      return;
    }
    setTimeout(() => {
      this.publicService.componentSectionClicked(this.isFrom); // -- to update suggestion list
    });
  }

  onSigSelect($event) {
    this.mediceObjectControls.patchValue({ sig: $event });
  }

  onRouteSelect($event) {
    this.mediceObjectControls.patchValue({ route: $event });
  }


  onFormChanges(): void {
    this.medicineOrderFrm.get('priority').valueChanges.subscribe(res => {
      if (res === 'IMMEDIATE') {
        this.medicineOrderFrm.get('medicineObj').patchValue({
          startDate: new Date()
        });
      }
      this.updatePrescriptionData();
    });

    this.medicineOrderFrm.get('medicineObj').valueChanges.subscribe(res => {
      if (!res.freqStartTime) {
        this.onFreqStartTimeSelect('08:00 AM'); // set default value.
      }
    });
  }

  onDoseUnit(event): void {
    this.medicineOrderFrm.get('medicineObj').get('type').patchValue({
      doseUnit: event ? event.dose_unit : '',
      doseUnitObj: event ? event : null
    });
  }

  onFreqStartTimeSelect(hrs?) {
    if (!hrs) {
      return;
    }
    const hrsObj = _.find(this.hoursList, (o) => o.time === hrs);
    _.map(this.hoursList, (o) => {
      if (hrs !== o.time) {
        o.isActive = false;
      }
    });
    if (!hrsObj) {
      return;
    }
    hrsObj.isActive = !hrsObj.isActive;
    this.medicineOrderFrm.get('medicineObj').patchValue({
      freqStartTime: hrs
    });
  }

  checkSameTime(time) {
    if (this.mediceObjectControls.value.freqStartTime === '') {
      return false;
    }
    const currentStartTime = moment(this.mediceObjectControls.value.freqStartTime, ['HH:mm']).format('h:mm A');
    return time === currentStartTime;

  }

  updateOrderChanges(): void {
    this.medicineOrderFrm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.addMedicine();
    });
  }

  setDose(event) {
    const doseValue = event.target.value;
    const obj = _.find(this.doseMaster, (o) => o.dose === doseValue);
    const doseId = (obj) ? obj.dose : '';
    const doseObj = { id: doseId, dose: doseValue };
    this.mediceObjectControls.patchValue({ dose: doseObj });
  }

  setActive() {
    // console.log(' outside click');
  }
  onSearch(event) {
    this.suggestionPanelComp.searchKeyword = event;
    this.suggestionPanelComp.subject.next();
  }

  hideHistory() {
    this.suggestionPanelComp.hideHistory();
  }

  loadMedicineFavTemplateSuggestions() {
    const reqParams = {
      item_id: this.mediceObjectControls.value.id,
      patient_id: this.patientId,
      dept_id: null,
      user_id: this.userId,
      limit: 5
    };

    this.orderService.getOrderFavTemplates(reqParams, 'medicineOrders').subscribe(result => {
      this.activeTab = !result.length ? 'Dose' : 'Templates';
      _.map(result, (o) => {
        o.id = '';
        o.tempId = this.medicineOrderFrm.value.tempId;
        o.priority = this.medicineOrderFrm.value.priority;
        o.action = this.medicineOrderFrm.value.action;
        o.status = this.medicineOrderFrm.value.status;
        o.order_id = '';
        o.orderDate = this.mediceObjectControls.value.startDate;
        o.orderBy = null;
        o.approvedBy = null;
      });
      this.medicineOrdersFavSuggestionTemplateList = result;
    });
  }

  configureAction($event) {
    if ($event.nextId === 'Templates') {
      this.loadMedicineFavTemplateSuggestions();
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

  // -- call the google transliteration function
  initTransliterationAPI() {
    if (!this.googleTransControl) {
      this.initTransliteration();
    }
    if (this.googleTransControl.isTransliterationEnabled() && this.selectedLanguage.id === '1') {
      this.googleTransControl.toggleTransliteration();
    } else if (!this.googleTransControl.isTransliterationEnabled() && this.selectedLanguage.id !== '1') {
      this.googleTransControl.toggleTransliteration();
    }
  }

  // --load the google translatitaration for language change
  initTransliteration() {
    const options = {
      sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH,
      destinationLanguage: [google.elements.transliteration.LanguageCode.MARATHI, google.elements.transliteration.LanguageCode.HINDI],
      transliterationEnabled: true
    };
    if (this.selectedLanguage.id === '2') {
      options.destinationLanguage = [google.elements.transliteration.LanguageCode.HINDI];
    } else if (this.selectedLanguage.id === '3') {
      options.destinationLanguage = [google.elements.transliteration.LanguageCode.MARATHI];
    } else if (this.selectedLanguage.id === '1') {
      options.transliterationEnabled = false;
    }

    this.googleTransControl = new google.elements.transliteration.TransliterationControl(options);
    this.googleTransControl.addEventListener(google.elements.transliteration.TransliterationControl.EventType.STATE_CHANGED,
      this.transliterateStateChangeHandler);
    const transIds = ['transTextRemarks1'];
    setTimeout(() => {
      this.googleTransControl.makeTransliteratable(transIds);
    }, 500);
  }

  transliterateStateChangeHandler(e) {
    this.isTranslationEnabled = e.transliterationEnabled;
  }

  // -- for typhead
  searchInstructionList = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
    }));
    const clicksWithClosedPopup$ = this.click$.pipe();
    return merge(debouncedText$, clicksWithClosedPopup$).pipe(
      tap((e) => {
      }),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (this.source === 'prescription') {
          return this.getLanguageInstructions(term);
        }
        // if (this.source === 'medicineOrders') {
        //   return this.getMedicineOrderInstructions(term);
        // }
      })
    );
  }
  searchInstructionFormattter = (x) => x;

  getLanguageInstructions(searchKeyword) {
    const reqParams = {
      language_id: this.selectedLanguage.id,
      search_keyword: searchKeyword === null ? '' : searchKeyword,
      service_type_id: '0',
      speciality_id: '0',
      user_id: this.userId,
      medicine_id: this.medicineOrderFrm.get('medicineObj').value.id
    };
    return this.prescriptionService.GetInstructionsByLanguage(reqParams).pipe(
      map(result => {
        this.prescriptionInstructionsList = result;
        return result;
      })
    );
  }

  getMedicineOrderInstructions(searchKeyword?) {
    const reqParams = {
      patient_id: this.patientId,
      user_id: this.userId,
      item_id: this.mediceObjectControls.value.id,
      limit: 50
    };
    return this.orderService.getOrderInstructions(reqParams, 'medicineOrders').pipe(
      map((result: any) => {
        this.orderInstructionList = result;
        return result;
      })
    );
  }
  findPendingObject() {
    if (this.medicineOrdersList.length) {
      this.checkAllValue = _.some(this.medicineOrdersList, res => res.status === 'approvelPending' && res.tempstatus !== 'approved') ? false : true;
    }
  }

  updatePrescriptionData(): void {
    const prescriptionList = this.preparePrescriptionData();
    this.dynamicChartService.updateLocalChartData('prescription_detail', prescriptionList, 'update', this.chartDetailId);
  }

  preparePrescriptionData(): Array<PrescriptionDetails> {
    const temp = [];
    this.medicineOrdersList.forEach(md => {
      temp.push({
        tran_id: 0,
        type: {
          id: md.medicineObj.type.id,
          name: md.medicineObj.type.name
        },
        medicine: {
          id: md.medicineObj.id,
          medicine_name: md.medicineObj.name,
          generic_name: md.medicineObj.genricName
        },
        start_date: md.medicineObj.startDate,
        end_date: md.medicineObj.endDate,
        frequency: md.medicineObj.frequency,
        freq_start_time: md.medicineObj.freqStartTime,
        meal_type_instruction: md.medicineObj.mealTypeInstruction,
        frequency_schedule: md.medicineObj.frequencySchedule,
        days: md.medicineObj.duration,
        sig: {
          id: 0,
          sig: ''
        },
        dose: md.medicineObj.dose,
        dose_unit: md.medicineObj.type.doseUnitObj,
        route: md.medicineObj.route,
        qty: '',
        language_id: md.medicineObj.languageId,
        instruction: md.medicineObj.instruction,
        chart_detail_id: this.chartDetailId
      });
    });
    return temp;
  }

  getPrescriptionData(): void {
    this.dynamicChartService.getChartDataByKey('prescription_detail', true, null, this.chartDetailId).pipe(takeUntil(this.destroy$)).subscribe((result: Array<PrescriptionDetails>) => {
      if ((_.isArray(result) && result.length && result !== null)) {
        _.map(result, (x) => {
          this.updatePrescriptionDataToForm(x);
        });
      }
    });
  }

  updatePrescriptionDataToForm(prescMedicineObj: PrescriptionDetails): void {
    const typeObj = {
      id: prescMedicineObj.type.id,
      name: prescMedicineObj.type.name,
      doseUnit: (prescMedicineObj.dose_unit !== null) ? prescMedicineObj.dose_unit.dose_unit : '',
      doseUnitObj: prescMedicineObj.dose_unit
    };
    const tempMedObject = {
      tempId: moment(new Date()).valueOf(),
      status: 'INITIATED',
      priority: 'Routine',
      isDirty: true,
      medicineObj: {
        id: prescMedicineObj.medicine.id,
        name: prescMedicineObj.medicine.medicine_name,
        genricName: prescMedicineObj.medicine.generic_name,
        startDate: new Date(prescMedicineObj.start_date),
        endDate: new Date(prescMedicineObj.end_date),
        dose: prescMedicineObj.dose,
        frequency: prescMedicineObj.frequency,
        type: typeObj,
        sig: prescMedicineObj.sig,
        instruction: prescMedicineObj.instruction,
        duration: +prescMedicineObj.days,
        route: prescMedicineObj.route,
        frequencySchedule: prescMedicineObj.frequency_schedule,
        isValid: true,
        freqStartTime: (prescMedicineObj.freq_start_time) ? prescMedicineObj.freq_start_time : '08:00 AM',
        mealTypeInstruction: (prescMedicineObj.meal_type_instruction) ? prescMedicineObj.meal_type_instruction : '',
        // "mealTypeInstruction": prescMedicineObj.,
        languageId: prescMedicineObj.language_id,
        isObjGenerated: true
      },
      action: '',
      tempstatus: '',
      invalidObjectMessage: '',
      orderBy: {
        userId: 0,
        userName: null
      },
      approvedBy: {
        userId: 0,
        userName: null
      },
      chart_detail_id: this.chartDetailId
    };
    this.medicineOrdersList.push(tempMedObject);
    // this.updatePrescriptionData();
  }

  openModalPopupSugg(val) {
    if (this.commonService.isTabModeOn) {
      this.commonService.openSuggesstionPanelWhenTabModeOnForComponents(val);
    }
  }

}

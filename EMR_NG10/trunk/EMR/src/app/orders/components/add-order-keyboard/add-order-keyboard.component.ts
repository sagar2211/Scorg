import { Component, OnInit, ElementRef, OnChanges, Input, ViewChildren, QueryList, SimpleChanges, OnDestroy } from '@angular/core';
import { Subject, Observable, forkJoin, of, concat } from 'rxjs';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { takeUntil, map, distinctUntilChanged, tap, switchMap, catchError, debounceTime } from 'rxjs/operators';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import * as _ from 'lodash';
import { PrescriptionService } from './../../../public/services/prescription.service';
import { MedicineOrders } from './../../../public/models/medicine-orders';
import { IMedicineTypes } from './../../../public/models/iprescription';
import { Medicine } from './../../../public/models/medicine';
import * as moment from 'moment';
import { DietOrder } from './../../../public/models/diet-order';
import { DoctorInformationOrder, OtherServicesOrder } from './../../../public/models/doctor-information-order';
import { InvestigationMaster } from './../../../public/models/investigation-master.model';
import { LabOrders } from './../../../public/models/lab-order';
import { NursingOrder } from './../../../public/models/nursing-order';
import { RadiologyOrder } from './../../../public/models/radiology-orders';
import { OrderService } from './../../../public/services/order.service';
import { PublicService } from './../../../public/services/public.service';
import { CommonService } from './../../../public/services/common.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { Constants } from 'src/app/config/constants';
import { AuthService } from 'src/app/public/services/auth.service';
import { ConfirmationOrderPopupComponent } from '../confirmation-order-popup/confirmation-order-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-order-keyboard',
  templateUrl: './add-order-keyboard.component.html',
  styleUrls: ['./add-order-keyboard.component.scss']
})
export class AddOrderKeyboardComponent implements OnInit, OnChanges, OnDestroy {
  destroy$ = new Subject<any>();
  desgList$ = new Observable<any>();
  alertMsg: IAlert;
  patientObj: EncounterPatient;
  userData: any;
  userId: any;
  allOrderFrm: FormGroup;
  compInstance = this;
  medicineTypes: any[] = [];
  sigList = [];
  routeList = [];
  doseMaster = [];
  doseUnitMaster = [];
  medicineOrdersList = [];
  dietOrderList = [];
  doctorInstructionOrderList = [];
  otherServiceandNotesOrderList = [];
  labOrderList = [];
  nursingOrders = [];
  radiologyOrderList = [];
  $destroy: Subject<boolean> = new Subject();

  medicineOrderKey = 'MEDICINEORDERS';
  labOrderKey = 'LABORDERS';
  radioOrderKey = 'RADIOLOGYORDERS';
  serviceOrderKey = 'SERVICEORDERS';
  docInsOrderKey = 'INSTRUCTIONORDERS';
  nursingOrderKey = 'NURSINGORDERS';
  dietOrderKey = 'DIETORDERS';

  allOrdersMasterData$ = new Observable<any>();
  allOrdersMasterDataInput$ = new Subject<string>();
  allOrdersMasterDataLoading = false;
  isDeleteEventFired$ = new Subject<{ data: any, index, isTrue: boolean }>();
  activeOrderDetails = null;
  @Input() isFormClear: boolean = false;
  @ViewChildren('orderName') orderNameListRef: QueryList<NgSelectComponent>;

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    private publicService: PublicService,
    private fb: FormBuilder,
    private orderService: OrderService,
    private prescriptionService: PrescriptionService,
    private el: ElementRef,
    private modService: NgbModal,
  ) { }

  ngOnInit() {
    this.userId = +this.authService.getLoggedInUserId();
    this.userData = this.authService.getUserInfoFromLocalStorage();
    this.getpatientData();
    this.subscribeTest();
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook.
    // Use it to inject dependencies, but avoid any serious work here.
    if (changes.isFormClear) {
      this.createAllOrderFormArray();
    }
  }

  getpatientData(patient?) {
    this.patientObj = null;
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.createAllOrderFormArray();
    this.getGenericeMasterData();
    this.getAllOrderListFromService();
    this.loadAllOrdersList();
    this.getAllMedicineTypes('').subscribe();
  }

  createAllOrderFormArray() {
    this.allOrderFrm = this.fb.group({
      orderForm: this.fb.array([])
    });
    this.patchDefaultFormValue();
  }

  get orderForm(): FormArray {
    return this.allOrderFrm.get('orderForm') as FormArray;
  }

  patchDefaultFormValue() {
    this.orderForm.push(this.createMainForm());
  }

  getAllDataList(searchKey?): Observable<any> {
    if (searchKey) {
      return this.compInstance.orderService.getOrderSuggestionList(searchKey).pipe(map(resultList => {
        return resultList;
      }));
    } else {
      return of([]);
    }
  }

  updateFormValueForAll(selectedData, res, indx, type) {
    if (type === 'medicineOrders') {
      this.focusOnElm('medicineDoseComp', indx);
      this.addNewMedicineOrder(null, indx, res);
    } else if (type === 'radiologyOrders') {
      this.focusOnElm('readioLogyFreqComp', indx);
      this.addNewRadioOrder(null, indx, res);
    } else if (type === 'labOrders') {
      this.focusOnElm('labOrderFreqComp', indx);
      this.addNewLabOrder(null, indx, res);
    } else if (type === 'Services with Notes') {
      this.addNewServiceOrder(null, indx, res);
      setTimeout(() => {
        this.focusOnElm('serviceInstructionComp', indx);
      }, 100);
    } else if (type === 'Doctor Instruction') {
      this.focusOnElm('doctorInstructionComp', indx);
      this.addNewDoctorOrder(null, indx, res);
    } else if (type === 'nursingOrders') {
      this.focusOnElm('nursingFreqComp', indx);
      this.addNewNursingOrder(null, indx, res);
    } else if (type === 'dietOrders') {
      this.focusOnElm('dietInstructionComp', indx);
      this.addNewDietOrder(null, indx, res);
    }
  }

  checkOrderTypeExistInOrder(key, id): Observable<any> {
    const param = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
      orderCategory: key,
      masterId: id,
    };
    return this.compInstance.orderService.checkPatientOrderStatus(param).pipe(map(res => {
      if (key === 'medicineOrders' && res.medicineOrders) {
        return res.medicineOrders;
      } else if (key === 'radiologyOrders' && res.radiologyOrders) {
        return res.radiologyOrders;
      } else if (key === 'labOrders' && res.labOrders) {
        return res.labOrders;
      } else if (key === 'Services with Notes' && res.serviceOrders) {
        return res.serviceOrders;
      } else if (key === 'Doctor Instruction' && res.instructionOrders) {
        return res.instructionOrders;
      } else if (key === 'nursingOrders' && res.nursingOrders) {
        return res.nursingOrders;
      } else if (key === 'dietOrders' && res.dietOrders) {
        return res.dietOrders;
      } else {
        return null;
      }
    }));
  }

  saveOrderActionFromPopup(key, id, act): Observable<any> {
    const param = {
      user_id: this.userId,
      items: [{
        order_item_id: id,
        order_category_key: key,
        // action: act,
        status: act
      }]
    };
    return this.compInstance.orderService.SaveOrderAction(param).pipe(map(dt => {
      return dt;
    }));
  }

  getConfirmationPopup(selectedData, res, indx, type) {
    const messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Already Exist in Orders',
      selectedOrder: selectedData.data,
      orderStatus: res.status,
      resData: res,
      type: type,
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
        this.saveOrderActionFromPopup(type, res.id, result).subscribe(dt => {
          if (type === 'medicineOrders') {
            this.focusOnElm('medicineDoseComp', indx);
            this.addNewMedicineOrder(selectedData, indx);
          } else if (type === 'radiologyOrders') {
            this.focusOnElm('readioLogyFreqComp', indx);
            this.addNewRadioOrder(selectedData, indx);
          } else if (type === 'labOrders') {
            this.focusOnElm('labOrderFreqComp', indx);
            this.addNewLabOrder(selectedData, indx);
          } else if (type === 'Services with Notes') {
            this.addNewServiceOrder(selectedData, indx);
            setTimeout(() => {
              this.focusOnElm('serviceInstructionComp', indx);
            }, 100);
          } else if (type === 'Doctor Instruction') {
            this.addNewServiceOrder(selectedData, indx);
            setTimeout(() => {
              this.focusOnElm('serviceInstructionComp', indx);
            }, 100);
          } else if (type === 'nursingOrders') {
            this.focusOnElm('nursingFreqComp', indx);
            this.addNewNursingOrder(selectedData, indx);
          } else if (type === 'dietOrders') {
            this.focusOnElm('dietInstructionComp', indx);
            this.addNewDietOrder(selectedData, indx);
          }
        });
      } else {
        this.updateFormValueForAll(selectedData, res, indx, type);
      }
    }, (dis) => {
      this.deleteFormRow(indx);
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  selectValue(evnt, indx): void {
    if (!this.orderService.selectedDoctorForOrder) {
      const obj = {
        message: 'Please Select Doctor',
        messageType: 'warning'
      };
      this.orderService.OrderErrorEvent.next(obj);
      this.deleteFormRow(indx);
      return;
    }
    if (evnt === undefined) { return; }
    this.orderForm.at(indx).patchValue({
      type: evnt.orderCategory,
      data: evnt
    });
    switch (evnt.orderCategory) {
      case 'MEDICINEORDERS':
        this.checkOrderTypeExistInOrder('medicineOrders', evnt.id).subscribe(res => {
          if (res) {
            this.getConfirmationPopup(evnt, res, indx, 'medicineOrders');
          } else {
            this.focusOnElm('medicineDoseComp', indx);
            this.addNewMedicineOrder(evnt, indx);
          }
        });
        break;
      case 'RADIOLOGYORDERS':
        this.checkOrderTypeExistInOrder('radiologyOrders', evnt.id).subscribe(res => {
          if (res) {
            this.getConfirmationPopup(evnt, res, indx, 'radiologyOrders');
          } else {
            this.focusOnElm('readioLogyFreqComp', indx);
            this.addNewRadioOrder(evnt, indx);
          }
        });
        break;
      case 'LABORDERS':
        this.checkOrderTypeExistInOrder('labOrders', evnt.id).subscribe(res => {
          if (res) {
            this.getConfirmationPopup(evnt, res, indx, 'labOrders');
          } else {
            this.focusOnElm('labOrderFreqComp', indx);
            this.addNewLabOrder(evnt, indx);
          }
        });
        break;
      case 'SERVICEORDERS':
        this.checkOrderTypeExistInOrder('Services with Notes', evnt.id).subscribe(res => {
          if (res) {
            this.getConfirmationPopup(evnt, res, indx, 'Services with Notes');
          } else {
            this.addNewServiceOrder(evnt, indx);
            setTimeout(() => {
              this.focusOnElm('serviceInstructionComp', indx);
            }, 100);
          }
        });
        break;
      case 'NURSINGORDERS':
        this.checkOrderTypeExistInOrder('nursingOrders', evnt.id).subscribe(res => {
          if (res) {
            this.getConfirmationPopup(evnt, res, indx, 'nursingOrders');
          } else {
            this.focusOnElm('nursingFreqComp', indx);
            this.addNewNursingOrder(evnt, indx);
          }
        });
        break;
      case 'DIETORDERS':
        this.checkOrderTypeExistInOrder('dietOrders', evnt.id).subscribe(res => {
          if (res) {
            this.getConfirmationPopup(evnt, res, indx, 'dietOrders');
          } else {
            this.focusOnElm('dietInstructionComp', indx);
            this.addNewDietOrder(evnt, indx);
          }
        });
        break;
      case 'INSTRUCTIONORDERS':
        this.checkOrderTypeExistInOrder('Doctor Instruction', evnt.id).subscribe(res => {
          if (res) {
            this.getConfirmationPopup(evnt, res, indx, 'Doctor Instruction');
          } else {
            this.focusOnElm('doctorInstructionComp', indx);
            this.addNewDoctorOrder(evnt, indx);
          }
        });
        break;
    }
  }

  addNewMedicineOrder(evnt, indx, skipAdd?): void {
    let medObj = null;
    if (skipAdd) {
      medObj = skipAdd;
    } else {
      medObj = this.updateFormValueMedicine(evnt, true);
    }
    this.updateMedicineFormValuesOnLoad(medObj, indx);
    let med = { ...medObj };
    if (med.medicineObj.dose && !_.isObject(med.medicineObj.dose)) {
      let dose = +med.medicineObj.dose;
      med.medicineObj.dose = {
        id: 0,
        dose: dose
      };
    }
    this.orderService.setOrderData(med, 'add', 'medicineOrders');
  }

  addNewRadioOrder(evnt, indx, skipAdd?): void {
    let radioObj = null;
    if (skipAdd) {
      radioObj = skipAdd;
    } else {
      radioObj = this.updateFormValueRadio(evnt, true);
    }
    this.updateRadioFormValuesOnLoad(radioObj, indx);
    this.orderService.setOrderData(radioObj, 'add', 'radiologyOrders');
  }

  addNewLabOrder(evnt, indx, skipAdd?): void {
    let labObj = null;
    if (skipAdd) {
      labObj = skipAdd;
    } else {
      labObj = this.updateFormValueLab(evnt, true);
    }
    this.updateLabFormValuesOnLoad(labObj, indx);
    this.orderService.setOrderData(labObj, 'add', 'labOrders');
  }

  addNewNursingOrder(evnt, indx, skipAdd?): void {
    let nursingObj = null;
    if (skipAdd) {
      nursingObj = skipAdd;
    } else {
      nursingObj = this.updateFormValueNursing(evnt, true);
    }
    this.updateNursingFormValuesOnLoad(nursingObj, indx);
    this.orderService.setOrderData(nursingObj, 'add', 'nursingOrders');
  }

  addNewDietOrder(evnt, indx, skipAdd?): void {
    let nursingObj = null;
    if (skipAdd) {
      nursingObj = skipAdd;
    } else {
      nursingObj = this.updateFormValueDiet(evnt, true);
    }
    this.updateDietFormValuesOnLoad(nursingObj, indx);
    this.orderService.setOrderData(nursingObj, 'add', 'dietOrders');
  }

  addNewServiceOrder(evnt, indx, skipAdd?): void {
    let serviceObj = null;
    if (skipAdd) {
      serviceObj = skipAdd;
    } else {
      serviceObj = this.updateFormValueService(evnt, true);
    }
    this.updateServiceFormValuesOnLoad(serviceObj, indx);
    this.otherServiceandNotesOrderList.push(serviceObj);
    const data = {
      docInstructionOrder: this.doctorInstructionOrderList,
      servicesOrder: this.otherServiceandNotesOrderList
    };
    this.orderService.setOrderData(data, 'update', 'otherOrders');
  }

  addNewDoctorOrder(evnt, indx, skipAdd?): void {
    let serviceObj = null;
    if (skipAdd) {
      serviceObj = skipAdd;
    } else {
      serviceObj = this.updateFormValueDoctor(evnt, true);
    }
    this.updateDoctorFormValuesOnLoad(serviceObj, indx);
    this.doctorInstructionOrderList.push(serviceObj);
    const data = {
      docInstructionOrder: this.doctorInstructionOrderList,
      servicesOrder: this.otherServiceandNotesOrderList
    };
    this.orderService.setOrderData(data, 'update', 'otherOrders');
  }

  focusOnElm(key, indx): void {
    setTimeout(() => {
      const el = document.getElementById(key + indx);
      if (el) {
        el.focus();
      }
    }, 500);
  }

  getValueForm(index) {
    const allFormVal = this.allOrderFrm.value;
    const allFormCon = this.allOrderFrm.controls;
    if (allFormVal.orderForm[index].type === this.radioOrderKey) {
      const checkIdx = _.findIndex(this.radiologyOrderList, d => {
        return d.tempId === allFormVal.orderForm[index].radioForm.tempId;
      });
      if (checkIdx !== -1) {
        this.radiologyOrderList[checkIdx] = { ...allFormVal.orderForm[index].radioForm };
      } else {
        this.radiologyOrderList.push({ ...allFormVal.orderForm[index].radioForm });
      }
    } else if (allFormVal.orderForm[index].type === this.labOrderKey) {
      const checkIdx = _.findIndex(this.labOrderList, d => {
        return d.tempId === allFormVal.orderForm[index].labForm.tempId;
      });
      if (checkIdx !== -1) {
        this.labOrderList[checkIdx] = { ...allFormVal.orderForm[index].labForm };
      } else {
        this.labOrderList.push({ ...allFormVal.orderForm[index].labForm });
      }
    } else if (allFormVal.orderForm[index].type === this.medicineOrderKey) {
      const checkIdx = _.findIndex(this.medicineOrdersList, d => {
        return d.tempId === allFormVal.orderForm[index].medicineForm.tempId;
      });
      if (checkIdx !== -1) {
        this.medicineOrdersList[checkIdx] = { ...allFormVal.orderForm[index].medicineForm };
      } else {
        this.medicineOrdersList.push({ ...allFormVal.orderForm[index].medicineForm });
      }
    } else if (allFormVal.orderForm[index].type === this.dietOrderKey) {
      const checkIdx = _.findIndex(this.dietOrderList, d => {
        return d.tempId === allFormVal.orderForm[index].dietForm.tempId;
      });
      if (checkIdx !== -1) {
        this.dietOrderList[checkIdx] = { ...allFormVal.orderForm[index].dietForm };
      } else {
        this.dietOrderList.push({ ...allFormVal.orderForm[index].dietForm });
      }
    } else if (allFormVal.orderForm[index].type === this.nursingOrderKey) {
      const checkIdx = _.findIndex(this.nursingOrders, d => {
        return d.tempId === allFormVal.orderForm[index].nursingForm.tempId;
      });
      if (checkIdx !== -1) {
        this.nursingOrders[checkIdx] = allFormVal.orderForm[index].nursingForm;
      } else {
        this.nursingOrders.push({ ...allFormVal.orderForm[index].nursingForm });
      }
    } else if (allFormVal.orderForm[index].type === this.docInsOrderKey) {
      const checkIdx = _.findIndex(this.doctorInstructionOrderList, d => {
        return d.tempId === allFormVal.orderForm[index].docInsForm.tempId;
      });
      if (checkIdx !== -1) {
        this.doctorInstructionOrderList[checkIdx] = { ...allFormVal.orderForm[index].docInsForm };
      } else {
        this.doctorInstructionOrderList.push({ ...allFormVal.orderForm[index].docInsForm });
      }
    } else if (allFormVal.orderForm[index].type === this.serviceOrderKey) {
      const checkIdx = _.findIndex(this.otherServiceandNotesOrderList, d => {
        return d.tempId === allFormVal.orderForm[index].serviceOrderForm.tempId;
      });
      if (checkIdx !== -1) {
        this.otherServiceandNotesOrderList[checkIdx] = { ...allFormVal.orderForm[index].serviceOrderForm };
      } else {
        this.otherServiceandNotesOrderList.push({ ...allFormVal.orderForm[index].serviceOrderForm });
      }
    }
    this.updateAllTypeOrders();
  }

  updateAllTypeOrders() {
    this.radiologyOrderList = _.uniqBy(this.radiologyOrderList, 'tempId');
    this.labOrderList = _.uniqBy(this.labOrderList, 'tempId');
    this.medicineOrdersList = _.uniqBy(this.medicineOrdersList, 'tempId');
    this.dietOrderList = _.uniqBy(this.dietOrderList, 'tempId');
    this.nursingOrders = _.uniqBy(this.nursingOrders, 'tempId');
    this.doctorInstructionOrderList = _.uniqBy(this.doctorInstructionOrderList, 'tempId');
    this.otherServiceandNotesOrderList = _.uniqBy(this.otherServiceandNotesOrderList, 'tempId');
    this.orderService.setOrderData(this.radiologyOrderList, 'update', 'radiologyOrders');
    this.orderService.setOrderData(this.labOrderList, 'update', 'labOrders');
    this.setMedicineOrderListToservice(this.medicineOrdersList);
    this.orderService.setOrderData(this.dietOrderList, 'update', 'dietOrders');
    this.orderService.setOrderData(this.nursingOrders, 'update', 'nursingOrders');
    const data = {
      docInstructionOrder: this.doctorInstructionOrderList,
      servicesOrder: this.otherServiceandNotesOrderList
    };
    this.orderService.setOrderData(data, 'update', 'otherOrders');
    // console.log(this.radiologyOrderList, 'this.radiologyOrderList');
    // console.log(this.labOrderList, 'this.labOrderList');
    // console.log(this.medicineOrdersList, 'this.medicineOrdersList');
    // console.log(this.dietOrderList, 'this.dietOrderList');
    // console.log(this.nursingOrders, 'this.nursingOrders');
    // console.log(this.doctorInstructionOrderList, 'this.doctorInstructionOrderList');
    // console.log(this.otherServiceandNotesOrderList, 'this.otherServiceandNotesOrderList');
  }

  setMedicineOrderListToservice(medicineOrderList) {
    let medicineOrders = [...medicineOrderList];
    medicineOrders.map(medObj => {
      if (medObj.medicineObj.dose && !_.isObject(medObj.medicineObj.dose)) {
        let dose = medObj.medicineObj.dose;
        medObj.medicineObj.dose = {
          id: 0,
          dose: dose
        };
      }
    });
    this.orderService.setOrderData(medicineOrders, 'update', 'medicineOrders');
  }

  onMedFreqChange(indx) {
    const allFormVal = this.allOrderFrm.value;
    const allFormCon = this.allOrderFrm.controls;
    const frq = allFormVal.orderForm[indx].medicineForm.medicineObj.frequency;
    if (frq.match(/^-?\d+$/)) {
      allFormCon['orderForm']['controls'][indx]['controls']['medicineForm'].patchValue({ freqIsNumber: true });
    } else {
      allFormCon['orderForm']['controls'][indx]['controls']['medicineForm'].patchValue({ freqIsNumber: false });
      setTimeout(() => {
        const el = document.getElementById('medicineFreqHrTime' + indx);
        el.focus();
      }, 500);
    }
    const medicineFormGroup = this.orderForm.at(indx).get('medicineForm');
    this.setMedicineFreqSchedule(medicineFormGroup);
    // get medicine form and update on local
    this.setMedicineOrderListToservice(this.getMedicineForms());
  }

  onLabFreqChange(indx): void {
    const frq = this.orderForm.at(indx).get('labForm').value.frequency;
    if (frq.match(/^-?\d+$/)) {
      this.orderForm.at(indx).get('labForm').patchValue({
        freqIsNumber: true
      });
      // allFormCon['orderForm']['controls'][indx]['controls']['labForm'].patchValue({ freqIsNumber: true });
    } else {
      this.orderForm.at(indx).get('labForm').patchValue({
        freqIsNumber: false
      });
      // allFormCon['orderForm']['controls'][indx]['controls']['labForm'].patchValue({ freqIsNumber: false });
      setTimeout(() => {
        const el = document.getElementById('labFreqHrTime' + indx);
        el.focus();
      }, 500);
    }
    const labFormGroup = this.orderForm.at(indx).get('labForm');
    this.setLabFreqSchedule(labFormGroup);
  }

  onNurFreqChange(indx): void {
    const frq = this.orderForm.at(indx).get('nursingForm').value.genericFreq;
    if (frq.match(/^-?\d+$/)) {
      this.orderForm.at(indx).get('nursingForm').patchValue({
        freqIsNumber: true
      });
    } else {
      this.orderForm.at(indx).get('nursingForm').patchValue({
        freqIsNumber: false
      });
      setTimeout(() => {
        const el = document.getElementById('nurseFreqHrTime' + indx);
        el.focus();
      }, 500);
    }
    const nursingFormGroup = this.orderForm.at(indx).get('nursingForm');
    this.setNursingFreqSchedule(nursingFormGroup);
  }

  onMedicineRoutChange(indx) {
    const allFormVal = this.allOrderFrm.value;
    const rout = allFormVal.orderForm[indx].medicineForm.medicineObj.route;
    if (rout) {
      const el = document.getElementById('medicineInstruction' + indx);
      el.focus();
    }
    // get medicine form and update on local
    this.setMedicineOrderListToservice(this.getMedicineForms());
  }

  onMedicineDoseSelect(indx) {
    const allFormVal = this.allOrderFrm.value;
    const doseUnit = allFormVal.orderForm[indx].medicineForm.medicineObj.type.doseUnitObj;
    allFormVal.orderForm[indx].medicineForm.medicineObj.type.doseUnit = doseUnit ? doseUnit.dose_unit : null;
    if (doseUnit) {
      const el = document.getElementById('medicineFreq' + indx);
      el.focus();
    }
    // get medicine form and update on local
    this.setMedicineOrderListToservice(this.getMedicineForms());
  }

  addNewForm() {
    this.orderForm.push(this.createMainForm());
  }

  deleteFormRow(index): void {
    this.isDeleteEventFired$.next({ data: null, index: index, isTrue: true });
    const copyObj = { ...this.orderForm.value[index] };
    if (copyObj.name) {
      this.orderForm.removeAt(index);
      this.removeDataFromGlobalObj(copyObj);
      if (this.orderForm.length <= 0) {
        this.addNewForm();
      }
    }
  }

  removeDataFromGlobalObj(deletedRow): void {
    switch (deletedRow.type) {
      case this.medicineOrderKey:
        const indx = this.medicineOrdersList.findIndex(m => m.medicineObj.id === deletedRow.data.id);
        if (indx !== -1) {
          this.medicineOrdersList.splice(indx, 1);
          this.setMedicineOrderListToservice(this.medicineOrdersList);
        }
        break;
      case this.labOrderKey:
        const labIndx = this.labOrderList.findIndex(m => m.labInvestigationObj.id === deletedRow.data.id);
        if (labIndx !== -1) {
          this.labOrderList.splice(labIndx, 1);
          this.orderService.setOrderData(this.labOrderList, 'update', 'labOrders');
        }
        break;
      case this.radioOrderKey:
        const radioIndx = this.radiologyOrderList.findIndex(m => m.radioInvestigationObj.id === deletedRow.data.id);
        if (radioIndx !== -1) {
          this.radiologyOrderList.splice(radioIndx, 1);
          this.orderService.setOrderData(this.radiologyOrderList, 'update', 'radiologyOrders');
        }
        break;
      case this.dietOrderKey:
        const dietIndx = this.dietOrderList.findIndex(m => m.dietId === deletedRow.data.id);
        if (dietIndx !== -1) {
          this.dietOrderList.splice(dietIndx, 1);
          this.orderService.setOrderData(this.dietOrderList, 'update', 'dietOrders');
        }
        break;
      case this.nursingOrderKey:
        const nurseIndx = this.nursingOrders.findIndex(m => m.nursingId === deletedRow.data.id);
        if (nurseIndx !== -1) {
          this.nursingOrders.splice(nurseIndx, 1);
          this.orderService.setOrderData(this.nursingOrders, 'update', 'nursingOrders');
        }
        break;
      case (this.serviceOrderKey):
        const servIndx = this.otherServiceandNotesOrderList.findIndex(m => m.serviceId === deletedRow.data.id);
        if (servIndx !== -1) {
          this.otherServiceandNotesOrderList.splice(servIndx, 1);
          const data = {
            docInstructionOrder: this.doctorInstructionOrderList,
            servicesOrder: this.otherServiceandNotesOrderList
          };
          this.orderService.setOrderData(data, 'update', 'otherOrders');
        }
        break;
      case (this.docInsOrderKey):
        const docIndx = this.doctorInstructionOrderList.findIndex(m => m.instructionId === deletedRow.data.id);
        if (docIndx !== -1) {
          this.doctorInstructionOrderList.splice(docIndx, 1);
          const data = {
            docInstructionOrder: this.doctorInstructionOrderList,
            servicesOrder: this.otherServiceandNotesOrderList
          };
          this.orderService.setOrderData(data, 'update', 'otherOrders');
        }
        break;
    }
  }

  createMainForm() {
    const form = {
      type: [''],
      name: [null],
      data: [''],
      medicineForm: this.createMedicineForm(),
      labForm: this.createLabOrderFormData(),
      docInsForm: this.createDoctorInstOrderForm(),
      nursingForm: this.createNursingOrderForm(),
      dietForm: this.createDietOrderForm(),
      radioForm: this.createRadiologyOrderFormData(),
      serviceOrderForm: this.createServicesOrderForm(),
    };
    return this.fb.group(form);
  }

  createMedicineForm(): FormGroup {
    return this.fb.group({
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
        frequency: [null, Validators.compose([Validators.pattern('^[0-9]*$'), Validators.required, Validators.max(24)])],
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
      orderBy: [null],
      freqIsNumber: null,
      sequence: null
    });
  }

  createNursingOrderForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      tempId: [''],
      nursingId: [''],
      action: [''],
      id: [''],
      status: ['approved'],
      isDirty: [true],
      // frequency: [''],
      genericFreq: ['', Validators.compose([Validators.pattern('^[0-9]*$')])],
      genericDuration: [1],
      startDateTime: [new Date()],
      FreqSchedule: [''],
      freqStartTime: ['08:00 AM'],
      orderDate: [new Date()],
      orderBy: [null],
      sequence: null,
      freqIsNumber: null
    });
  }

  createLabOrderFormData(): FormGroup {
    return this.fb.group({
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
      frequency: [null],
      frequencySchedule: [''],
      freqStartTime: ['08:00 AM'],
      orderDate: [new Date()],
      orderBy: [null],
      requisition: [''],
      sequence: null,
      freqIsNumber: [null]
    });
  }

  createDietOrderForm(): FormGroup {
    return this.fb.group({
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
      orderBy: [null],
      sequence: null
    });
  }

  createRadiologyOrderFormData(): FormGroup {
    return this.fb.group({
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
      frequency: [null],
      freqStartTime: ['08:00 AM'],
      frequencySchedule: [''],
      orderDate: [new Date()],
      orderBy: [null],
      requisition: [''],
      sequence: null
    });
  }

  createDoctorInstOrderForm(): FormGroup {
    return this.fb.group({
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
      orderBy: [null],
      sequence: null
    });
  }

  createServicesOrderForm(): FormGroup {
    return this.fb.group({
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
      orderBy: [null],
      sequence: null
    });
  }

  getGenericeMasterData(): void {
    const sigListObs = this.prescriptionService.GetMedicineSigList();
    const routeListObs = this.prescriptionService.GetMedicineRouteList();
    const doseListObs = this.prescriptionService.GetMedicineDoseList(1);
    const doseUnitListObs = this.prescriptionService.GetMedicineDoseUnitList(1);
    forkJoin([sigListObs, routeListObs, doseListObs, doseUnitListObs]).subscribe((res: any) => {
      this.sigList = res[0];
      this.routeList = res[1];
      this.doseMaster = res[2];
      this.doseUnitMaster = res[3];
    });
  }

  updateFormValueMedicine(medicineObj, retObj?): MedicineOrders {
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
    const medicineType = this.getMedicineTypeName(medicineObj.MedicineTypeID || medicineObj.medicineTypeID || medicineObj.medicineTypeId);
    const medicineTypeModel = new IMedicineTypes();
    const medicine = new Medicine();
    if (medicineTypeModel.isObjectValid(medicineType) || (medicineTypeModel.isObjGenerated)) {
      medicineTypeModel.generateObject(medicineType); // generate type objects
      medicineObj.type = medicineTypeModel;
      medicineObj.duration = medicineObj.duration ? medicineObj.duration : 1;
      medicineObj.genericFreq = '1';
      medicineObj.genericDuration = {
        duration: 1
      };
    }
    if (medicine.isObjectValid(medicineObj)) {
      medicine.generateObject(medicineObj);
      orderObj['medicineObj'] = medicine;
    }

    const medOrder = new MedicineOrders();
    medOrder.sequence = this.orderService.getOrderSequence();
    this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
    medOrder.generateObject(orderObj, false);
    if (retObj) {
      return medOrder;
    }
    // this.medicineOrdersList.push(this.orderService.generateOrderObjectByOrderKey('medicineOrders', orderObj, false));
    // this.publicService.setupdateByValueOnOrder(medOrder);
    // this.medicineOrdersList.push(medOrder);
    // this.orderService.setOrderData(this.medicineOrdersList, 'update', 'medicineOrders');
  }

  updateFormValueDiet(selectedData, retObject?): DietOrder {
    const dietOrder = new DietOrder();
    let obj: any = _.cloneDeep({ ...selectedData });
    // let obj: any = _.cloneDeep({ ...selectedData.data });
    const statusData = this.orderService.checkOrderStatus(this.userData);
    obj['isDirty'] = true;
    obj['tempId'] = selectedData.tempId ? selectedData.tempId : moment(new Date()).valueOf();
    obj['status'] = statusData.status;
    if (statusData.approvedBy) {
      obj['status'] = statusData.status;
      obj['approvedBy'] = statusData.approvedBy;
    }
    if (dietOrder.isObjectValid(obj)) {
      dietOrder.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
      dietOrder.generateObject(obj);
      if (retObject) {
        return dietOrder;
      }
      this.publicService.setupdateByValueOnOrder(dietOrder);
      this.dietOrderList.push(dietOrder);
    }
  }

  updateFormValueDoctor(selectedData, retObject?): DoctorInformationOrder {
    const doctorInfo = new DoctorInformationOrder();
    const obj: any = Object.assign({}, selectedData);
    const statusData = this.orderService.checkOrderStatus(this.userData);
    obj.isDirty = true;
    obj.tempId = moment(new Date()).valueOf();
    obj.status = statusData.status;
    obj.instructionId = obj.id;
    obj.id = '';
    if (statusData.approvedBy) {
      obj.status = statusData.status;
      obj.approvedBy = statusData.approvedBy
    }
    if (doctorInfo.isObjectValid(obj)) {
      doctorInfo.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
      doctorInfo.generateObject(obj);
      if (retObject) {
        return doctorInfo;
      }
      this.publicService.setupdateByValueOnOrder(doctorInfo);
      this.doctorInstructionOrderList.push(doctorInfo);
    }
  }

  updateFormValueService(selectedData, retObject?): OtherServicesOrder {
    const oterServiceInfo = new OtherServicesOrder();
    const obj: any = Object.assign({}, selectedData);
    const statusData = this.orderService.checkOrderStatus(this.userData);
    obj.isDirty = true;
    obj.tempId = moment(new Date()).valueOf();
    obj.status = statusData.status;
    obj.id = '';
    if (statusData.approvedBy) {
      obj.status = statusData.status;
      obj.approvedBy = statusData.approvedBy
    }
    if (oterServiceInfo.isObjectValid(obj)) {
      oterServiceInfo.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
      oterServiceInfo.generateObject(obj);
      if (retObject) {
        return oterServiceInfo;
      }
      this.publicService.setupdateByValueOnOrder(oterServiceInfo);
      this.otherServiceandNotesOrderList.push(oterServiceInfo);
    }
  }

  updateFormValueLab(result, retObject?): LabOrders {
    const investigation = new InvestigationMaster();
    // if (investigation.isObjectValid(result)) {
    investigation.generateObject(result);
    // }
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
      labOrder.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
      labOrder.generateObject(obj);
      if (retObject) {
        return labOrder;
      }
      this.publicService.setupdateByValueOnOrder(labOrder);
      this.labOrderList.push({ ...labOrder });
    }
    // });
  }

  updateFormValueNursing(selectedData, returnObj?): NursingOrder {
    const nursingOrder = new NursingOrder();
    const obj = _.cloneDeep(selectedData);
    const statusData = this.orderService.checkOrderStatus(this.userData);
    obj.isDirty = true;
    obj.status = statusData.status;
    obj.tempId = moment(new Date()).valueOf();
    obj.id = '';
    obj['nursingId'] = obj.id;
    if (statusData.approvedBy) {
      obj.status = statusData.status;
      obj.approvedBy = statusData.approvedBy;
    }
    if (nursingOrder.isObjectValid(obj)) {
      nursingOrder.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
      nursingOrder.generateObject(obj);
      if (returnObj) {
        return nursingOrder;
      }
      this.publicService.setupdateByValueOnOrder(nursingOrder);
      this.nursingOrders.push(nursingOrder);
    }
  }

  updateFormValueRadio(result, retObj?): RadiologyOrder {
    const investModel = new InvestigationMaster();
    const radiologyOrder = new RadiologyOrder();
    // if (investModel.isObjectValid(result)) {
    investModel.generateObject(result);
    // }
    let obj = null;
    const statusData = this.orderService.checkOrderStatus(this.userData);
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
      radiologyOrder.sequence = this.orderService.getOrderSequence();
      this.orderService.setOrderSequence(this.orderService.getOrderSequence() + 1);
      radiologyOrder.generateObject(obj);
      this.publicService.setupdateByValueOnOrder(radiologyOrder);
      this.radiologyOrderList.push(radiologyOrder);
      if (retObj) {
        return radiologyOrder;
      }
    }
    // this._orderService.setOrderData(this.radiologyOrderList, 'update', 'radiologyOrders');
  }

  getAllOrderListFromService() {
    const diet = this.getDietOrders();
    const other = this.getotherOrders();
    const lab = this.getLabOrders();
    const medcine = this.getMedicineOrders();
    const nursing = this.getNursingOrders();
    const radio = this.getRadioOrders();
    forkJoin([diet, other, lab, medcine, nursing, radio]).subscribe(res => {
      this.updateAllFormValues();
    });
  }

  getDietOrders(): Observable<any> {
    return this.orderService.getOrderData('dietOrders').pipe(map((res: any) => {
      res = _.uniqBy(res, 'tempId');
      _.map(res, (obj, i) => {
        const diet = new DietOrder();
        if (diet.isObjectValid(obj)) {
          diet.generateObject(obj);
          diet.key = this.dietOrderKey;
          this.dietOrderList.push({ ...diet });
        }
      });
      return this.dietOrderList;
    }));
  }


  getotherOrders(): Observable<any> {
    return this.orderService.getOrderData('otherOrders').pipe(map((res: any) => {
      const doctorInfo = new DoctorInformationOrder();
      const otherService = new OtherServicesOrder();
      res.docInstructionOrder = _.uniqBy(res.docInstructionOrder, 'tempId');
      res.servicesOrder = _.uniqBy(res.servicesOrder, 'tempId');

      _.map(res.docInstructionOrder, (rol, i) => {
        if (doctorInfo.isObjectValid(rol)) {
          doctorInfo.generateObject(rol);
          doctorInfo.key = this.docInsOrderKey;
          this.doctorInstructionOrderList.push({ ...doctorInfo });
        }
      });
      _.map(res.servicesOrder, (obj, i) => {
        if (otherService.isObjectValid(obj)) {
          otherService.generateObject(obj);
          otherService.key = this.serviceOrderKey;
          this.otherServiceandNotesOrderList.push({ ...otherService });
        }
      });
      return true;
    }));
  }

  getLabOrders(): Observable<any> {
    return this.orderService.getOrderData('labOrders').pipe(map((res: any) => {
      res = _.uniqBy(res, 'tempId');
      const lab = new LabOrders();
      _.map(res, (obj, i) => {
        if (lab.isObjectValid(obj)) {
          lab.generateObject(obj);
          lab.key = this.labOrderKey;
          this.labOrderList.push({ ...lab });
        }
      });
      return this.labOrderList;
    }));
  }

  getMedicineOrders(): Observable<any> {
    return this.orderService.getOrderData('medicineOrders').pipe(map((res: any) => {
      this.medicineOrdersList = [];
      res = _.uniqBy(res, 'tempId');
      const medOrder = new MedicineOrders();
      _.map(res, (o, i) => {
        medOrder.generateObject(o, false);
        medOrder.key = this.medicineOrderKey;
        if (medOrder.medicineObj.dose && _.isObject(medOrder.medicineObj.dose)) {
          let dose = medOrder.medicineObj.dose;
          medOrder.medicineObj.dose = dose.dose;
        }
        this.medicineOrdersList.push({ ...medOrder });
      });
      return this.medicineOrdersList;
    }));
  }

  getNursingOrders(): Observable<any> {
    return this.orderService.getOrderData('nursingOrders').pipe(map((res: any) => {
      const nursing = new NursingOrder();
      res = _.uniqBy(res, 'tempId');
      _.map(res, (obj, i) => {
        if (nursing.isObjectValid(obj)) {
          nursing.generateObject(obj);
          nursing.key = this.nursingOrderKey;
          this.nursingOrders.push({ ...nursing });
        }
      });
      return this.nursingOrders;
    }));
  }

  getRadioOrders(): Observable<any> {
    return this.orderService.getOrderData('radiologyOrders').pipe(map((res: any) => {
      res = _.uniqBy(res, 'tempId');
      const radiologyModel = new RadiologyOrder();
      _.map(res, (rol, i) => {
        if (radiologyModel.isObjectValid(rol)) {
          radiologyModel.generateObject(rol);
          radiologyModel.key = this.radioOrderKey;
          this.radiologyOrderList.push({ ...radiologyModel });
        }
      });
      return this.radiologyOrderList;
    }));
  }

  getMedicineTypeName(medicineTypeId) {
    return _.find(this.medicineTypes, x => x.id === medicineTypeId);
  }

  updateAllFormValues() {
    let arrayIndex = 0;
    let allArray = (this.medicineOrdersList).concat(this.dietOrderList)
      .concat(this.nursingOrders).concat(this.labOrderList).concat(this.radiologyOrderList)
      .concat(this.doctorInstructionOrderList).concat(this.otherServiceandNotesOrderList);
    allArray = _.orderBy(allArray, 'sequence');
    _.map(allArray, (ordr, indx) => {
      if (ordr.key === this.medicineOrderKey) {
        this.focusOnElm('medicineDoseComp', arrayIndex);
        this.updateMedicineFormValuesOnLoad(ordr, arrayIndex);
      }
      if (ordr.key === this.dietOrderKey) {
        this.updateDietFormValuesOnLoad(ordr, arrayIndex);
      }
      if (ordr.key === this.nursingOrderKey) {
        this.updateNursingFormValuesOnLoad(ordr, arrayIndex);
      }
      if (ordr.key === this.labOrderKey) {
        this.updateLabFormValuesOnLoad(ordr, arrayIndex);
      }
      if (ordr.key === this.radioOrderKey) {
        this.updateRadioFormValuesOnLoad(ordr, arrayIndex);
      }
      if (ordr.key === this.docInsOrderKey) {
        this.updateDoctorFormValuesOnLoad(ordr, arrayIndex);
      }
      if (ordr.key === this.serviceOrderKey) {
        this.updateServiceFormValuesOnLoad(ordr, arrayIndex);
      }
      arrayIndex = _.clone(arrayIndex + 1);
      this.addNewForm();
    });

  }

  updateMedicineFormValuesOnLoad(med, arrayIndex): void {
    const suggtype = {
      id: med.medicineObj.id,
      medicineTypeId: med.medicineObj && med.medicineObj.type ? med.medicineObj.type.id : null,
      name: med.medicineObj.name,
      orderCategory: this.medicineOrderKey,
    };
    this.orderForm.at(arrayIndex).patchValue({
      type: this.medicineOrderKey,
      name: med.medicineObj.name,
      data: suggtype
    });
    this.orderForm.at(arrayIndex).get('medicineForm').get('medicineObj').patchValue({
      dose: med.medicineObj.dose && med.medicineObj.dose.dose ? med.medicineObj.dose.dose : med.medicineObj.dose
    });
    // if (med.medicineObj.dose && _.isObject(med.medicineObj.dose)) {
    //   this.orderForm.at(arrayIndex).get('medicineForm').get('medicineObj').patchValue({
    //     dose: med.medicineObj.dose && med.medicineObj.dose.dose ? med.medicineObj.dose.dose : med.medicineObj.dose
    //   });
    // } else if (med.medicineObj.dose && _.isNumber(med.medicineObj.dose)) {
    //   this.orderForm.at(arrayIndex).get('medicineForm').get('medicineObj').patchValue({
    //     dose: med.medicineObj.dose
    //   });
    // }
    // if (med.medicineObj.type.doseUnitObj) {
    //   // allFormVal['orderForm']['controls'][arrayIndex]['controls']['medicineForm']['controls']['medicineObj']['controls']['type'].patchValue({ doseUnitObj: med.medicineObj.type.doseUnitObj });
    //   // allFormVal['orderForm']['controls'][arrayIndex]['controls']['medicineForm']['controls']['medicineObj']['controls']['type'].patchValue({ doseUnit: med.medicineObj.type.doseUnit });
    //   // allFormVal['orderForm']['controls'][arrayIndex]['controls']['medicineForm']['controls']['medicineObj']['controls']['type'].patchValue({ shortName: med.medicineObj.type.shortName });
    // }
    // if (med.medicineObj.frequency) {
    //   // allFormVal['orderForm']['controls'][arrayIndex]['controls']['medicineForm']['controls']['medicineObj'].patchValue({ frequency: med.medicineObj.frequency });
    //   // allFormVal['orderForm']['controls'][arrayIndex]['controls']['medicineForm']['controls']['medicineObj'].patchValue({ frequencySchedule: med.medicineObj.frequencySchedule });
    //   if (_.toString(med.medicineObj.frequency).match(/^-?\d+$/)) {
    //     allFormVal['orderForm']['controls'][arrayIndex]['controls']['medicineForm'].patchValue({ freqIsNumber: true });
    //   } else {
    //     allFormVal['orderForm']['controls'][arrayIndex]['controls']['medicineForm'].patchValue({ freqIsNumber: false });
    //   }
    // }

    this.orderForm.at(arrayIndex).get('medicineForm').get('medicineObj').patchValue({
      duration: med.medicineObj.duration,
      route: med.medicineObj.route,
      instruction: med.medicineObj.instruction,
      id: med.medicineObj.id,
      name: med.medicineObj.name,
      frequency: med.medicineObj.frequency,
      frequencySchedule: med.medicineObj.frequencySchedule
    });

    this.orderForm.at(arrayIndex).get('medicineForm').get('medicineObj').get('type').patchValue({
      id: med.medicineObj && med.medicineObj.type ? med.medicineObj.type.id : null,
      name: med.medicineObj && med.medicineObj.type ? med.medicineObj.type.name : null,
      doseUnitObj: med.medicineObj.type ? med.medicineObj.type.doseUnitObj : '',
      doseUnit: med.medicineObj.type ? med.medicineObj.type.doseUnit : '',
      shortName: med.medicineObj.type ? med.medicineObj.type.shortName : ''
    });

    this.orderForm.at(arrayIndex).get('medicineForm').patchValue({
      sequence: med.sequence,
      tempId: med.tempId,
      freqIsNumber: _.toString(med.medicineObj.frequency).match(/^-?\d+$/) ? true : false
    });
  }

  updateLabFormValuesOnLoad(lab, arrayIndex): void {
    const suggtype = {
      id: lab.labInvestigationObj.id,
      medicineTypeId: 0,
      name: lab.name,
      orderCategory: this.labOrderKey,
    };

    this.orderForm.at(arrayIndex).patchValue({
      type: this.labOrderKey,
      name: lab.name,
      data: suggtype
    });
    this.orderForm.at(arrayIndex).get('labForm').patchValue({
      name: lab.name,
      frequencySchedule: lab.frequencySchedule,
      frequency: lab.frequency,
      labInvestigationObj: lab.labInvestigationObj,
      labInstruction: lab.labInstruction,
      requisition: lab.requisition ? lab.requisition : null,
      sequence: lab.sequence,
      tempId: lab.tempId,
      freqIsNumber: _.toString(lab.frequency).match(/^-?\d+$/) ? true : false
    });
  }

  updateRadioFormValuesOnLoad(radio, arrayIndex: number): void {
    const suggtype = {
      id: radio.radioInvestigationObj.id,
      medicineTypeId: 0,
      name: radio.name,
      orderCategory: this.radioOrderKey,
    };

    this.orderForm.at(arrayIndex).patchValue({
      type: this.radioOrderKey,
      name: radio.name,
      data: suggtype
    });

    this.orderForm.at(arrayIndex).get('radioForm').patchValue({
      name: radio.name,
      frequencySchedule: radio.frequencySchedule,
      frequency: radio.frequency,
      radioInvestigationObj: radio.radioInvestigationObj,
      radiologyInstruction: radio.radiologyInstruction,
      signSymptoms: radio.signSymptoms,
      patientInstruction: radio.patientInstruction,
      requisition: radio.requisition ? radio.requisition : null,
      sequence: radio.sequence,
      tempId: radio.tempId
    });
  }

  updateDoctorFormValuesOnLoad(doc, arrayIndex): void {
    const suggtype = {
      id: doc.instructionId,
      medicineTypeId: 0,
      name: doc.name,
      orderCategory: this.docInsOrderKey,
    };
    this.orderForm.at(arrayIndex).patchValue({
      type: this.docInsOrderKey,
      name: doc.name,
      data: suggtype
    });

    this.orderForm.at(arrayIndex).get('docInsForm').patchValue({
      instructionId: doc.instructionId,
      name: doc.name,
      specInstruction: doc.specInstruction,
      sequence: doc.sequence,
      tempId: doc.tempId
    });
  }

  updateServiceFormValuesOnLoad(ser, arrayIndex): void {
    const suggtype = {
      id: ser.serviceId,
      medicineTypeId: 0,
      name: ser.name,
      orderCategory: this.serviceOrderKey,
    };

    this.orderForm.at(arrayIndex).patchValue({
      type: this.serviceOrderKey,
      name: ser.name,
      data: suggtype
    });

    this.orderForm.at(arrayIndex).get('serviceOrderForm').patchValue({
      serviceId: ser.serviceId,
      name: ser.name,
      specInstruction: ser.specInstruction,
      sequence: ser.sequence,
      tempId: ser.tempId
    });
  }

  updateDietFormValuesOnLoad(diet, arrayIndex: number): void {
    const suggtype = {
      id: diet.dietId,
      medicineTypeId: 0,
      name: diet.name,
      orderCategory: this.dietOrderKey,
    };
    this.orderForm.at(arrayIndex).patchValue({
      type: this.dietOrderKey,
      name: diet.name,
      data: suggtype
    });
    this.orderForm.at(arrayIndex).get('dietForm').patchValue({
      dietId: diet.dietId,
      name: diet.name,
      specInstruction: diet.specInstruction,
      sequence: diet.sequence,
      tempId: diet.tempId
    });
  }

  updateNursingFormValuesOnLoad(nurs, arrayIndex): void {
    const suggtype = {
      id: nurs.nursingId,
      medicineTypeId: 0,
      name: nurs.name,
      orderCategory: this.nursingOrderKey,
    };

    this.orderForm.at(arrayIndex).patchValue({
      type: this.nursingOrderKey,
      name: nurs.name,
      data: suggtype
    });

    this.orderForm.at(arrayIndex).get('nursingForm').patchValue({
      nursingId: nurs.nursingId,
      name: nurs.name,
      FreqSchedule: nurs.FreqSchedule,
      genericFreq: nurs.genericFreq,
      genericDuration: nurs.genericDuration,
      sequence: nurs.sequence,
      tempId: nurs.tempId,
      freqIsNumber: _.toString(nurs.genericFreq).match(/^-?\d+$/) ? true : false
    });
  }

  private loadAllOrdersList(searchTxt?) {
    this.allOrdersMasterData$ = concat(
      this.getAllDataList(searchTxt), // default items
      this.allOrdersMasterDataInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        // tap(() => this.allOrdersMasterDataLoading = true),
        switchMap(term => this.getAllDataList(term).pipe(
          catchError(() => of([])), // empty list on error
          // tap(() => this.allOrdersMasterDataLoading = false)
        ))
      )
    );
  }

  // -- get all medicine types return observable
  getAllMedicineTypes(searchValue: string): Observable<any> {
    searchValue = _.isArray(searchValue) ? '' : searchValue;
    searchValue = searchValue === undefined ? '' : searchValue;
    return this.publicService.getMasterMedicineTypes().pipe(map(res => {
      this.medicineTypes = res;
      const data = searchValue === '' ? res :
        _.filter(res, (v: any) => v.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
      return data;
    }));
  }

  setMedicineFreqSchedule(medicineFormGroup, onBlur?) {
    let Freq;
    Freq = +medicineFormGroup.get('medicineObj').value.frequency;
    const freqIsNumber = medicineFormGroup.value.freqIsNumber;

    if (onBlur) {
      return;
    }
    const medicineDetail = medicineFormGroup.get('medicineObj').value;
    if (freqIsNumber) {
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
      } else {
        medicineDetail.frequencySchedule = '';
      }
    } else {
      medicineDetail.frequencySchedule = '';
    }
    medicineFormGroup.get('medicineObj').patchValue(medicineDetail);
  }

  setLabFreqSchedule(labFormGroup, onBlur?) {
    let Freq;
    Freq = +labFormGroup.value.frequency;
    const freqIsNumber = labFormGroup.value.freqIsNumber;

    if (onBlur) {
      return;
    }
    const labDetails = labFormGroup.value;
    if (freqIsNumber) {
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
      } else {
        labDetails.frequencySchedule = '';
      }
    } else {
      labDetails.frequencySchedule = '';
    }
    labFormGroup.patchValue(labDetails);
  }

  setNursingFreqSchedule(labFormGroup, onBlur?) {
    let Freq;
    Freq = +labFormGroup.value.genericFreq;
    const freqIsNumber = labFormGroup.value.freqIsNumber;

    if (onBlur) {
      return;
    }
    const labDetails = labFormGroup.value;
    if (freqIsNumber) {
      if (Freq === 1) {
        if (!labDetails.FreqSchedule) {
          labDetails.FreqSchedule = '1-0-0';
        } else if (labDetails.FreqSchedule === '1-0-0') {
          labDetails.FreqSchedule = '0-1-0';
        } else if (labDetails.FreqSchedule === '0-1-0') {
          labDetails.FreqSchedule = '0-0-1';
        } else {
          labDetails.FreqSchedule = '1-0-0';
        }
      } else if (Freq === 2) {
        if (!labDetails.FreqSchedule) {
          labDetails.FreqSchedule = '1-0-1';
        } else if (labDetails.FreqSchedule === '1-0-1') {
          labDetails.FreqSchedule = '1-1-0';
        } else if (labDetails.FreqSchedule === '1-1-0') {
          labDetails.FreqSchedule = '0-1-1';
        } else {
          labDetails.FreqSchedule = '1-0-1';
        }
      } else if (Freq >= 3 || Freq === 0) {
        labDetails.FreqSchedule = '';
        for (let i = 0; i < Freq && Freq <= 24; i++) {
          labDetails.FreqSchedule += (i === 0) ? 1 : '-1';
        }
      } else {
        labDetails.FreqSchedule = '';
      }
    } else {
      labDetails.FreqSchedule = '';
    }
    labFormGroup.patchValue(labDetails);
  }

  show(event, index): void {
    const copyObj = { ...this.orderForm.value[index] };
    this.isDeleteEventFired$.next({ data: copyObj, index: index, isTrue: false });
  }

  subscribeTest(): void {
    const sub = this.isDeleteEventFired$.pipe(debounceTime(500)).subscribe(res => {
      if (res.isTrue) {
        setTimeout(() => {
          this.orderNameListRef.last.searchInput.nativeElement.focus();
        }, 500);
      } else {
        const isDefaultRowGenerate = this.orderForm.value[this.orderForm.value.length - 1];
        if (isDefaultRowGenerate && isDefaultRowGenerate.name && res.data.name) {
          this.addNewForm();
        } else {
          if (this.orderNameListRef) {
            const index = res.index <= this.orderForm.value.length - 2 ? res.index : this.orderForm.value.length - 1
            this.orderNameListRef.find((x, i) => i == index)['nativeElement'].focus()
            // this.orderNameListRef.last.searchInput.nativeElement.focus();
          }
        }
      }
      sub.unsubscribe();
      this.subscribeTest();
    });
  }

  onKeypress(event, i): void {
    const obj = { ...this.orderForm.at(i).value };
    this.activeOrderDetails = obj;
    this.activeOrderDetails['itemIndex'] = i;
  }

  isCheck(orderName, orderType, fieldValue, i): boolean {
    let isTrue;
    if (this.activeOrderDetails) {
      isTrue = (this.activeOrderDetails.name === orderName
        && this.activeOrderDetails.type === orderType
        && this.activeOrderDetails.itemIndex === i) ? true : (fieldValue ? true : false);
    } else {
      isTrue = false;
    }
    return isTrue;
  }

  getMedicineForms() {
    let medForms = [];
    _.forEach(this.allOrderFrm.value.orderForm, (o) => {
      medForms.push(o.medicineForm);
    });
    medForms = medForms.filter(d => {
      return d.tempId;
    });
    return medForms;
  }

  toLowerCase(val) {
    return _.toLower(val);
  }
}

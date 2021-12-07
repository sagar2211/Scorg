import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { concat, of, Observable, Subject } from 'rxjs';
import { OtMasterService } from 'src/app/ot module/ot/services/ot-master.service';
import { distinctUntilChanged, debounceTime, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from 'src/app/config/constants';
import { PublicService } from 'src/app/public/services/public.service';
import { OtRegisterService } from 'src/app/ot module/ot-register/services/ot-register.service';

@Component({
  selector: 'app-param-medicine',
  templateUrl: './param-medicine.component.html',
  styleUrls: ['./param-medicine.component.scss']
})
export class ParamMedicineComponent implements OnInit {
  @Input() addUpdateData: any;
  setAlertMessage: IAlert;
  prescription = {
    medicineId: null,
    name: null,
    qty: null,
    unitId: null,
    unitName: null,
  };
  blood = {
    itemId: null,
    name: null,
    qty: null,
    unitId: null,
    unitName: null,
  };
  implants = {
    itemId: null,
    name: null,
    qty: null,
    unitId: null,
    unitName: null,
  };
  CSSDEqipment = {
    itemId: null,
    name: null,
    qty: null,
    unitId: null,
    unitName: null,
  };
  general = {
    name: null
  };
  parameterDrug = [];
  parameterBlood = [];
  parameterImplants = [];
  parameterCSSDEqipment = [];
  parameterGeneralEqipment = [];
  doseList = [];

  prescriptionList$ = new Observable<any>();
  prescriptionInput$ = new Subject<any>();

  bloodList$ = new Observable<any>();
  bloodnInput$ = new Subject<any>();

  implantsList$ = new Observable<any>();
  implantsInput$ = new Subject<any>();

  cssdEqipList$ = new Observable<any>();
  cssdEqipInput$ = new Subject<any>();

  generalEqipList$ = new Observable<any>();
  generalEqipInput$ = new Subject<any>();

  selectedType: any;
  selectedTypeArray = [];

  constructor(
    public modal: NgbActiveModal,
    public otMasterService: OtMasterService,
    private publicService: PublicService,
    private otRegisterService: OtRegisterService,
  ) { }

  ngOnInit(): void {
    this.selectedTypeArray = ['Prescription', 'Blood', 'Implants', 'CSSD Eqipment', 'General'];
    this.setDefaultObj(true);
    this.loadBloodList();
    this.loadCSSDEqipList();
    this.loadImplantsList();
    this.loadPrescriptionList();
    this.getLoadDoseUnitList();
    this.loadGeneralEqipList();
    this.updateValueType(this.selectedTypeArray[0]);
  }

  setDefaultObj(from?) {
    this.setDefaultObjPrescription();
    this.setDefaultObjBlood();
    this.setDefaultObjImplants();
    this.setDefaultObjCSSDEquipment();
    if (from) {
      this.selectedType = null;
      this.parameterDrug = [];
      this.parameterBlood = [];
      this.parameterImplants = [];
      this.parameterCSSDEqipment = [];
    }
  }
  private loadPrescriptionList(searchTxt?) {
    this.prescriptionList$ = concat(
      this.publicService.getMedicinesBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.prescriptionInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.publicService.getMedicinesBySearchKeyword(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadBloodList(searchTxt?) {
    this.bloodList$ = concat(
      this.otMasterService.getPreOtCheckListItemList(searchTxt ? searchTxt : '', 'parameterBlood'), // default items
      this.bloodnInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otMasterService.getPreOtCheckListItemList(term ? term : (searchTxt ? searchTxt : ''), 'parameterBlood').pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadImplantsList(searchTxt?) {
    this.implantsList$ = concat(
      this.otMasterService.getPreOtCheckListItemList(searchTxt ? searchTxt : '', 'parameterImplants'), // default items
      this.implantsInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otMasterService.getPreOtCheckListItemList(term ? term : (searchTxt ? searchTxt : ''), 'parameterImplants').pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadCSSDEqipList(searchTxt?) {
    this.cssdEqipList$ = concat(
      this.otMasterService.getPreOtCheckListItemList(searchTxt ? searchTxt : '', 'parameterCSSDEquipment'), // default items
      this.cssdEqipInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otMasterService.getPreOtCheckListItemList(term ? term : (searchTxt ? searchTxt : ''), 'parameterCSSDEquipment').pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadGeneralEqipList(searchTxt?) {
    this.generalEqipList$ = concat(
      this.otMasterService.getPreOtCheckListItemList(searchTxt ? searchTxt : '', 'parameterGeneralEquipment'), // default items
      this.generalEqipInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otMasterService.getPreOtCheckListItemList(term ? term : (searchTxt ? searchTxt : ''), 'parameterGeneralEquipment').pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  onItemChange(val, type) {
    if (val) {
      this[type].itemId = val.itemId;
      this[type].name = val.itemName;
    } else {
      this[type].itemId = null;
      this[type].name = null;
    }
  }

  getLoadDoseUnitList() {
    this.otRegisterService.getMedicineDoseUnitList(1).subscribe(res => {
      this.doseList = res;
    });
  }

  setDefaultObjPrescription() {
    this.prescription = {
      medicineId: null,
      name: null,
      qty: null,
      unitId: null,
      unitName: null,
    };
  }

  setDefaultObjBlood() {
    this.blood = {
      itemId: null,
      name: null,
      qty: null,
      unitId: null,
      unitName: null,
    };
  }

  setDefaultObjImplants() {
    this.implants = {
      itemId: null,
      name: null,
      qty: null,
      unitId: null,
      unitName: null,
    };
  }

  setDefaultObjCSSDEquipment() {
    this.CSSDEqipment = {
      itemId: null,
      name: null,
      qty: null,
      unitId: null,
      unitName: null,
    };
  }

  setDefaultObjGeneralEquipment() {
    this.general = {
      name: null,
    };
  }

  addValToArray(type) {
    if (type === 'medicine') {
      if (this.prescription.medicineId && this.prescription.qty && this.prescription.unitId) {
        const check = _.findIndex(this.parameterDrug, d => {
          return d.medicineId === this.prescription.medicineId;
        });
        if (check === -1) {
          this.parameterDrug.push(_.clone(this.prescription));
          this.setDefaultObjPrescription()
        } else {
          this.setAlertMessage = {
            message: 'Already Exist',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      } else {
        let message;
        if (!this.prescription.medicineId) {
          message = 'Select Value';
        } else if (!this.prescription.qty) {
          message = 'Enter Quantity';
        } else if (!this.prescription.unitId) {
          message = 'Select Dose';
        }
        this.setAlertMessage = {
          message: message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else if (type === 'blood') {
      if (this.blood.itemId && this.blood.qty && this.blood.unitId) {
        const check = _.findIndex(this.parameterBlood, d => {
          return d.itemId === this.blood.itemId;
        });
        if (check === -1) {
          this.parameterBlood.push(_.clone(this.blood));
          this.setDefaultObjBlood();
        } else {
          this.setAlertMessage = {
            message: 'Already Exist',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      } else {
        let message;
        if (!this.blood.itemId) {
          message = 'Select Value';
        } else if (!this.blood.qty) {
          message = 'Enter Quantity';
        } else if (!this.blood.unitId) {
          message = 'Select Dose';
        }
        this.setAlertMessage = {
          message: message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else if (type === 'implants') {
      if (this.implants.itemId && this.implants.qty && this.implants.unitId) {
        const check = _.findIndex(this.parameterImplants, d => {
          return d.itemId === this.implants.itemId;
        });
        if (check === -1) {
          this.parameterImplants.push(_.clone(this.implants));
          this.setDefaultObjImplants();
        } else {
          this.setAlertMessage = {
            message: 'Already Exist',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      } else {
        let message;
        if (!this.implants.itemId) {
          message = 'Select Value';
        } else if (!this.implants.qty) {
          message = 'Enter Quantity';
        } else if (!this.implants.unitId) {
          message = 'Select Dose';
        }
        this.setAlertMessage = {
          message: message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else if (type === 'cssdEqipments') {
      if (this.CSSDEqipment.itemId && this.CSSDEqipment.qty && this.CSSDEqipment.unitId) {
        const check = _.findIndex(this.parameterCSSDEqipment, d => {
          return d.itemId === this.CSSDEqipment.itemId;
        });
        if (check === -1) {
          this.parameterCSSDEqipment.push(_.clone(this.CSSDEqipment));
          this.setDefaultObjCSSDEquipment();
        } else {
          this.setAlertMessage = {
            message: 'Already Exist',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      } else {
        let message;
        if (!this.CSSDEqipment.itemId) {
          message = 'Select Value';
        } else if (!this.CSSDEqipment.qty) {
          message = 'Enter Quantity';
        } else if (!this.CSSDEqipment.unitId) {
          message = 'Select Dose';
        }
        this.setAlertMessage = {
          message: message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else if (type === 'generalEqipments') {
      if (this.general.name) {
        const check = _.findIndex(this.parameterGeneralEqipment, d => {
          return d.name === this.general.name;
        });
        if (check === -1) {
          this.parameterGeneralEqipment.push(_.clone(this.general));
          this.setDefaultObjGeneralEquipment();
        } else {
          this.setAlertMessage = {
            message: 'Already Exist',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      } else {
        this.setAlertMessage = {
          message: 'Select Value',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    }
  }

  removeValFomArray(type, indx) {
    if (type === 'medicine') {
      this.parameterDrug.splice(indx, 1);
    } else if (type === 'blood') {
      this.parameterBlood.splice(indx, 1);
    } else if (type === 'implants') {
      this.parameterImplants.splice(indx, 1);
    } else if (type === 'cssdEqipments') {
      this.parameterCSSDEqipment.splice(indx, 1);
    } else if (type === 'generalEqipments') {
      this.parameterGeneralEqipment.splice(indx, 1);
    }
  }

  onPrescrirtionChange(val) {
    this.prescription.medicineId = val.id;
    this.prescription.name = val.name;
  }

  onDoseChange(val, type) {
    if (val) {
      this[type].unitId = val.id;
      this[type].unitName = val.dose_unit;
    } else {
      this[type].unitId = null;
      this[type].unitName = null;
    }
  }

  updateValueType(val) {
    this.selectedType = val;
    this.setDefaultObj();
  }

  saveValue() {
    const type = {
      type: 'yes',
      data: {
        parameterDrug: this.parameterDrug,
        parameterBlood: this.parameterBlood,
        parameterImplants: this.parameterImplants,
        parameterCSSDEquipment: this.parameterCSSDEqipment,
        parameterGeneralEquipment: this.parameterGeneralEqipment,
      }
    };
    this.closeModal(type)
  }

  closeModal(type) {
    this.modal.close(type);
  }


}

import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OtMasterService } from 'src/app/ot module/ot/services/ot-master.service';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { Constants } from 'src/app/config/constants';
import { Observable, Subject, concat, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OtRegisterService } from 'src/app/ot module/ot-register/services/ot-register.service';
import { OtScheduleService } from 'src/app/ot module/ot-schedule/services/ot-schedule.service';
import { PublicService } from 'src/app/public/services/public.service';
import { distinctUntilChanged, debounceTime, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-parametar',
  templateUrl: './parametar.component.html',
  styleUrls: ['./parametar.component.scss']
})
export class ParametarComponent implements OnInit {
  checkListForm: FormGroup;
  userId: any;
  timeFormateKey: string;
  timeFormate: string;
  submitted: boolean = false;
  loadForm: boolean = false;
  isAddNew: boolean;
  mainDateDisable: boolean;
  today = new Date();
  dateFormat = 'YYYY-MM-DD';
  startTimeArray = [];
  setAlertMessage: IAlert;
  allParamList = [];


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
  parameterDrug = [];
  parameterBlood = [];
  parameterImplants = [];
  parameterCSSDEqipment = [];
  doseList = [];

  prescriptionList$ = new Observable<any>();
  prescriptionInput$ = new Subject<any>();

  bloodList$ = new Observable<any>();
  bloodnInput$ = new Subject<any>();

  implantsList$ = new Observable<any>();
  implantsInput$ = new Subject<any>();

  cssdEqipList$ = new Observable<any>();
  cssdEqipInput$ = new Subject<any>();

  roomList$ = new Observable<any>();
  roomListInput$ = new Subject<any>();

  specialityList$ = new Observable<any>();
  specialityInput$ = new Subject<any>();

  procedureList$ = new Observable<any>();
  procedureInput$ = new Subject<any>();

  selectedType: any;
  selectedTypeArray = [];
  checkListId: number;

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private otRegisterService: OtRegisterService,
    private otMasterService: OtMasterService,
    private otScheduleService: OtScheduleService,
    private publicService: PublicService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.isAddNew = true;
    this.mainDateDisable = false;
    this.selectedTypeArray = ['Prescription', 'Blood', 'Implants', 'CSSD Eqipment'];
    this.createForm();
    this.setDefaultObj(true);
    this.commonService.routeChanged(this.route);
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
      this.checkListForm.patchValue({
        type: 'Room'
      });
    }
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

  createForm() {
    this.checkListForm = this.fb.group({
      type: ['Room'],
      roomId: [null],
      specialityId: [null],
      procedureId: [null]
    });
    this.loadForm = true;
    this.loadBloodList();
    this.loadCSSDEqipList();
    this.loadImplantsList();
    this.loadRoomList();
    this.loadPrescriptionList();
    this.getLoadDoseUnitList();
    this.loadSpecialityList();
  }

  saveValue() {
    const formVal = this.checkListForm.getRawValue();
    const param = {
      checkListId: this.checkListId ? this.checkListId : 0,
      roomId: formVal.roomId ? formVal.roomId : 0,
      specialityId: formVal.specialityId ? formVal.specialityId : 0,
      procedureId: formVal.procedureId ? formVal.procedureId : 0,
      parameterBlood: this.parameterBlood,
      parameterDrug: _.map(this.parameterDrug, d => {
        d.dose = d.qty;
        d.doseUnitId = d.unitId;
        return d;
      }),
      parameterImplants: this.parameterImplants,
      parameterCSSDEquipment: this.parameterCSSDEqipment,
    }
    if (param.parameterBlood.length > 0 || param.parameterCSSDEquipment.length > 0 || param.parameterDrug.length > 0 || param.parameterImplants.length > 0) {
      this.otRegisterService.saveOTCheckListMaster(param).subscribe(res => {
        this.setAlertMessage = {
          message: 'Value Updated',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.setDefaultObj(true);
        this.checkListForm.patchValue({
          type: 'Room',
          roomId: null,
          specialityId: null,
          procedureId: null
        });
      });
    } else {
      this.setAlertMessage = {
        message: 'Please Add Value',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  getParamData() {
    const formVal = this.checkListForm.getRawValue();
    const param = {
      roomId: formVal.roomId ? formVal.roomId : 0,
      specialityId: formVal.specialityId ? formVal.specialityId : 0,
      procedureId: formVal.procedureId ? formVal.procedureId : 0,
    }
    this.otRegisterService.getOTCheckListMasterById(param).subscribe(res => {
      if (res && res.data) {
        this.checkListId = res.data.checkListId;
        this.setExistingData(res.data);
      } else {
        this.checkListId = 0;
        const obj = {
          parameterImplants: [],
          parameterDrug: [],
          parameterCSSDEquipment: [],
          parameterBlood: [],
        }
        this.setExistingData(obj);
      }
    });
  }

  setExistingData(val) {
    if (val.parameterImplants.length > 0) {
      this.parameterImplants = _.map(val.parameterImplants, d => {
        d.name = d.itemName;
        d.unitName = d.unit;
        return d;
      });
    } else {
      this.parameterImplants = [];
    }
    if (val.parameterDrug.length > 0) {
      this.parameterDrug = _.map(val.parameterDrug, d => {
        d.name = d.medicineName;
        d.qty = d.dose;
        d.unitId = d.doseUnitId;
        d.unitName = d.doseUnit;
        return d;
      });
    } else {
      this.parameterDrug = [];
    }
    if (val.parameterCSSDEquipment.length > 0) {
      this.parameterCSSDEqipment = _.map(val.parameterCSSDEquipment, d => {
        d.name = d.itemName;
        d.unitName = d.unit;
        return d;
      });
    } else {
      this.parameterCSSDEqipment = [];
    }
    if (val.parameterBlood.length > 0) {
      this.parameterBlood = _.map(val.parameterBlood, d => {
        d.name = d.itemName;
        d.unitName = d.unit;
        return d;
      });
    } else {
      this.parameterBlood = []
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

  private loadRoomList(searchTxt?): void {
    this.roomList$ = concat(
      this.otMasterService.getOTRoomBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.roomListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otMasterService.getOTRoomBySearchKeyword(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadSpecialityList(searchTxt?) {
    this.specialityList$ = concat(
      this.otScheduleService.getOTSpecialityList(searchTxt ? searchTxt : ''), // default items
      this.specialityInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getOTSpecialityList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  private loadProcedureList(searchTxt?) {
    this.procedureList$ = concat(
      this.otScheduleService.getOTProcedureList(searchTxt ? searchTxt : ''), // default items
      this.procedureInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otScheduleService.getOTProcedureList(term ? term : (searchTxt ? searchTxt : '')).pipe(
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

  onSpecilityChange(event) {
    if (event) {
      this.checkListForm.patchValue({
        specialityId: event.id,
      });
      this.otScheduleService.selectedSpecialityId = event.id;
      this.getParamData();
    } else {
      this.checkListForm.patchValue({
        specialityId: null
      });
      this.otScheduleService.selectedSpecialityId = null;
    }
    this.loadProcedureList();
  }

  onProcedureChange(event) {
    if (event) {
      this.checkListForm.patchValue({
        procedureId: event.id,
      });
    } else {
      this.checkListForm.patchValue({
        procedureId: null,
      });
    }
    this.getParamData();
  }

  onRoomChange(event) {
    if (event) {
      this.checkListForm.patchValue({
        roomId: event.roomId
      });
      this.getParamData();
    } else {
      this.checkListForm.patchValue({
        roomId: null
      });
    }
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

  addValToArray(type) {
    if (type === 'medicine') {
      if (this.prescription.medicineId) {
        if (!this.prescription.qty || !this.prescription.unitId) {
          this.setAlertMessage = {
            message: 'Please check Unit',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
          return;
        }
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
        this.setAlertMessage = {
          message: 'Select Value',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else if (type === 'blood') {
      if (!this.blood.qty || !this.blood.unitId) {
        this.setAlertMessage = {
          message: 'Please check Unit',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      if (this.blood.itemId) {
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
        this.setAlertMessage = {
          message: 'Select Value',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else if (type === 'implants') {
      if (!this.implants.qty || !this.implants.unitId) {
        this.setAlertMessage = {
          message: 'Please check Unit',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      if (this.implants.itemId) {
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
        this.setAlertMessage = {
          message: 'Select Value',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    } else if (type === 'CSSDEqipment') {
      if (!this.CSSDEqipment.qty || !this.CSSDEqipment.unitId) {
        this.setAlertMessage = {
          message: 'Please check Unit',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
        return;
      }
      if (this.CSSDEqipment.itemId) {
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
    } else if (type === 'CSSDEqipment') {
      this.parameterCSSDEqipment.splice(indx, 1);
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
    if (val === 'main') {
      this.checkListForm.patchValue({
        roomId: null,
        specialityId: null,
        procedureId: null
      })
    } else if (val === 'sub') {
      this.setDefaultObj();
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Observable, Subject, concat, of } from 'rxjs';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { OtRegisterService } from 'src/app/ot module/ot-register/services/ot-register.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { OtMasterService } from 'src/app/ot module/ot/services/ot-master.service';
import { OtScheduleService } from 'src/app/ot module/ot-schedule/services/ot-schedule.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ParamMedicineComponent } from '../param-medicine/param-medicine.component';
import { Constants } from 'src/app/config/constants';
import { PublicService } from 'src/app/public/services/public.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-parameter-check',
  templateUrl: './parameter-check.component.html',
  styleUrls: ['./parameter-check.component.scss']
})
export class ParameterCheckComponent implements OnInit {
  imgBaseUrl = environment.HIS_Add_PatientCommon_API;
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
    isSelected: false,
    medicineId: null,
    name: null,
    qty: null,
    unitId: null,
    unitName: null,
    date: new Date(),
    time: null,
    hrTime: null,
    minTime: moment().format('m'),
    amPmTime: moment().format('a')
  };
  blood = {
    isSelected: false,
    itemId: null,
    name: null,
    qty: null,
    unitId: null,
    unitName: null,
  };
  implants = {
    isSelected: false,
    itemId: null,
    name: null,
    qty: null,
    unitId: null,
    unitName: null,
  };
  CSSDEqipment = {
    isSelected: false,
    itemId: null,
    name: null,
    qty: null,
    unitId: null,
    unitName: null,
  };
  general = {
    isSelected: false,
    name: null,
    id: 0,
  };
  parameterDrug = [];
  parameterBlood = [];
  parameterImplants = [];
  parameterCSSDEqipment = [];
  parameterGeneralEqipment = [];
  hrTime = [];
  minTime = [];
  amPmAry = ['AM', 'PM'];

  patientList$ = new Observable<any>();
  patientInput$ = new Subject<any>();

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    public fb: FormBuilder,
    private route: ActivatedRoute,
    private otRegisterService: OtRegisterService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.isAddNew = true;
    this.mainDateDisable = false;
    this.getTimeFormatKey().then(res => {
      this.setDefaultObj();
      this.createForm();
    });
    this.commonService.routeChanged(this.route);
  }

  setDefaultObj() {
    this.setDefaultObjPrescription();
    this.setDefaultObjBlood();
    this.setDefaultObjImplants();
    this.setDefaultObjCSSDEquipment();
  }

  setDefaultObjPrescription() {
    this.prescription = {
      isSelected: false,
      medicineId: null,
      name: null,
      qty: null,
      unitId: null,
      unitName: null,
      date: new Date(),
      time: null,
      hrTime: this.timeFormateKey === '12_hour' ? moment().format('hh') : moment().format('HH'),
      minTime: moment().format('m'),
      amPmTime: moment().format('a')
    };
  }

  setDefaultObjBlood() {
    this.blood = {
      isSelected: false,
      itemId: null,
      name: null,
      qty: null,
      unitId: null,
      unitName: null,
    };
  }

  setDefaultObjImplants() {
    this.implants = {
      isSelected: false,
      itemId: null,
      name: null,
      qty: null,
      unitId: null,
      unitName: null,
    };
  }

  setDefaultObjCSSDEquipment() {
    this.CSSDEqipment = {
      isSelected: false,
      itemId: null,
      name: null,
      qty: null,
      unitId: null,
      unitName: null,
    };
  }

  createForm() {
    this.checkListForm = this.fb.group({
      date: [new Date()],
      patientId: [null],
      patientData: [null],
      userId: [+this.authService.getLoggedInUserId()]
    });
    this.loadForm = true;
    this.otRegisterService.selectedRegisterDate = moment().format(this.dateFormat);
    this.loadPatientList();
    this.timeArrayGenrate();
  }

  clearForm() {
    this.checkListForm.patchValue({
      // date: new Date(),
      patientId: null,
      patientData: null,
      userId: +this.authService.getLoggedInUserId()
    });
    this.parameterBlood = [];
    this.parameterCSSDEqipment = [];
    this.parameterGeneralEqipment = []
    this.parameterDrug = [];
    this.parameterImplants = [];
    this.otRegisterService.selectedRegisterDate = moment().format(this.dateFormat);
  }

  onPatientChange(val) {
    if (val) {
      this.parameterBlood = [];
      this.parameterCSSDEqipment = [];
      this.parameterGeneralEqipment = []
      this.parameterDrug = [];
      this.parameterImplants = [];
      this.checkListForm.patchValue({
        patientId: val.patientInfo.patientId,
        patientData: val,
        userId: +this.authService.getLoggedInUserId()
      });
      this.getOtParametarList().then(resMas => {
        this.getetPreOTCheckListById().then(res => {
          if (res) {
            this.updateCheckListData(res);
          }
        });
      });
    } else {
      this.clearForm();
    }
  }

  updateCheckListData(res) {
    const appDate = new Date(res.appointmentDate);
    this.checkListForm.patchValue({
      patientId: res.patientId,
      patientData: {
        anaesthetistId: res.anaesthetistId,
        anaesthetistName: res.anaesthetistName,
        appointmentDate: appDate,
        appointmentId: res.appointmentId,
        checkListId: res.checkListId,
        endTime: res.endTime,
        procedureId: res.procedureId,
        procedureName: res.procedureName,
        roomId: res.roomId,
        roomName: res.roomName,
        specialityId: res.specialityId,
        specialityName: res.specialityName,
        startTime: res.startTime,
        surgeonId: res.surgeonId,
        surgeonName: res.surgeonName,
        patientInfo: {
          age: res.age,
          dob: res.dob,
          gender: res.gender,
          patientId: res.patientId,
          patientName: res.patientName,
          patImage : res.patImage,
          serviceType: res.serviceType,
          serviceTypeId: res.serviceTypeId,
          visitNo: res.visitNo,
          emailId: res.emailId,
          mobileNo: res.mobileNo,
          resAddress: res.resAddress,
        }
      },
      userId: res.userId ? res.userId : +this.authService.getLoggedInUserId()
    });
    this.generateParam(res);
  }

  generateParam(res) {
    //  drug
    _.map(res.parameterDrug, d => {
      const fIndx = _.findIndex(this.parameterDrug, m => {
        return m.medicineId === d.medicineId;
      });
      if (fIndx !== -1) {
        this.parameterDrug[fIndx].isSelected = true;
        this.parameterDrug[fIndx].date = d.medicineDateTime ? new Date(moment(new Date(d.medicineDateTime)).format('YYYY-MM-DD')) : new Date();
        this.parameterDrug[fIndx].hrTime = d.medicineDateTime ? (this.timeFormateKey === '12_hour' ?
          moment(new Date(d.medicineDateTime)).format('hh') :
          moment(new Date(d.medicineDateTime)).format('HH')) : moment(new Date(d.medicineDateTime)).format('hh');
        this.parameterDrug[fIndx].minTime = d.medicineDateTime ? moment(new Date(d.medicineDateTime)).format('m') : moment(new Date()).format('m');
        this.parameterDrug[fIndx].amPmTime = d.medicineDateTime ? moment(new Date(d.medicineDateTime)).format('a') : moment(new Date()).format('a');
        if (this.timeFormateKey === '12_hour') {
          this.parameterDrug[fIndx].time = this.parameterDrug[fIndx].hrTime + ':' + this.parameterDrug[fIndx].minTime + ':' + this.parameterDrug[fIndx].amPmTime;
        } else {
          this.parameterDrug[fIndx].time = this.parameterDrug[fIndx].hrTime + ':' + this.parameterDrug[fIndx].minTime;
        }
      } else {
        const obj = _.cloneDeep(this.prescription);
        obj.qty = d.dose;
        obj.name = d.medicineName;
        obj.medicineId = d.medicineId;
        obj.unitName = d.doseUnit;
        obj.unitId = d.doseUnitId;
        obj.isSelected = true;
        obj.date = d.medicineDateTime ? new Date(moment(new Date(d.medicineDateTime)).format('YYYY-MM-DD')) : new Date();
        obj.hrTime = d.medicineDateTime ? (this.timeFormateKey === '12_hour' ?
          moment(new Date(d.medicineDateTime)).format('hh') :
          moment(new Date(d.medicineDateTime)).format('HH')) : moment(new Date(d.medicineDateTime)).format('hh');
        obj.minTime = d.medicineDateTime ? moment(new Date(d.medicineDateTime)).format('m') : moment(new Date()).format('m');
        obj.amPmTime = d.medicineDateTime ? moment(new Date(d.medicineDateTime)).format('a') : moment(new Date()).format('a');
        if (this.timeFormateKey === '12_hour') {
          obj.time = obj.hrTime + ':' + obj.minTime + ':' + obj.amPmTime;
        } else {
          obj.time = obj.hrTime + ':' + obj.minTime;
        }
        this.parameterDrug.push(obj);
      }
    });
    //  Imaplants
    _.map(res.parameterImplants, d => {
      const fIndx = _.findIndex(this.parameterImplants, m => {
        return m.itemId === d.itemId;
      });
      if (fIndx !== -1) {
        this.parameterImplants[fIndx].isSelected = true;
      } else {
        const obj = _.cloneDeep(this.implants);
        obj.isSelected = true;
        obj.qty = d.qty;
        obj.name = d.itemName;
        obj.itemId = d.itemId;
        obj.unitName = d.unit;
        obj.unitId = d.unitId;
        this.parameterImplants.push(obj);
      }
    });
    //  Blood
    _.map(res.parameterBlood, d => {
      const fIndx = _.findIndex(this.parameterBlood, m => {
        return m.itemId === d.itemId;
      });
      if (fIndx !== -1) {
        this.parameterBlood[fIndx].isSelected = true;
      } else {
        const obj = _.cloneDeep(this.blood);
        obj.isSelected = true;
        obj.qty = d.qty;
        obj.name = d.itemName;
        obj.itemId = d.itemId;
        obj.unitName = d.unit;
        obj.unitId = d.unitId;
        this.parameterBlood.push(obj);
      }
    });
    //  CSSD
    _.map(res.parameterCSSDEquipment, d => {
      const fIndx = _.findIndex(this.parameterCSSDEqipment, m => {
        return m.itemId === d.itemId;
      });
      if (fIndx !== -1) {
        this.parameterCSSDEqipment[fIndx].isSelected = true;
      } else {
        const obj = _.cloneDeep(this.CSSDEqipment);
        obj.isSelected = true;
        obj.qty = d.qty;
        obj.name = d.itemName;
        obj.itemId = d.itemId;
        obj.unitName = d.unit;
        obj.unitId = d.unitId;
        this.parameterCSSDEqipment.push(obj);
      }
    });
    //  General
    _.map(res.parameterGeneralByID, d => {
      const fIndx = _.findIndex(this.parameterGeneralEqipment, m => {
        return m.name === d.value;
      });
      if (fIndx !== -1) {
        this.parameterGeneralEqipment[fIndx].isSelected = true;
      } else {
        const obj = _.cloneDeep(this.general);
        obj.name = d.value;
        obj.id = d.id;
        obj.isSelected = true;
        this.parameterGeneralEqipment.push(obj);
      }
    });
  }

  saveValue() {
    const formVal = this.checkListForm.getRawValue();
    const param = {
      appointmentId: formVal.patientData.appointmentId,
      patientId: formVal.patientId,
      visitNo: formVal.patientData.patientInfo.visitNo,
      serviceTypeId: formVal.patientData.patientInfo.serviceTypeId,
      nurseId: formVal.userId || this.authService.getLoggedInUserId(),
      remark: null,
      parameterDrug: this.getSelectedParam('medicine'),
      parameterBlood: this.getSelectedParam('blood'),
      parameterImplants: this.getSelectedParam('implants'),
      parameterCSSDEquipment: this.getSelectedParam('cssd'),
      parameterGeneral: this.getSelectedParam('genral'),
    }
    this.otRegisterService.savePreOTCheckList(param).subscribe(res => {
      this.setAlertMessage = {
        message: 'Value Updated',
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
      this.onPatientChange(null);
    });
  }

  getSelectedParam(type) {
    const ary = [];
    if (type === 'medicine') {
      _.map(this.parameterDrug, d => {
        const obj = {
          medicineId: d.medicineId,
          dose: d.qty,
          doseUnitId: d.unitId ? d.unitId : 0,
          medicineDateTime: null,
          // time: d.time
        }
        let dtTim = null;
        if (d.date) {
          dtTim = moment(d.date).format('YYYY-MM-DD');
          if (d.time) {
            dtTim = moment(d.date).format('YYYY-MM-DD') + ' ' + d.time;
          }
        }
        obj.medicineDateTime = dtTim;
        ary.push(_.cloneDeep(obj));
      });
    } else if (type === 'implants') {
      _.map(this.parameterImplants, d => {
        const obj = {
          itemId: d.itemId,
          qty: d.qty || 1,
          unitId: d.unitId ? d.unitId : 0,
        }
        ary.push(_.cloneDeep(obj));
      });
    } else if (type === 'blood') {
      _.map(this.parameterBlood, d => {
        const obj = {
          itemId: d.itemId,
          qty: d.qty,
          unitId: d.unitId ? d.unitId : 0,
        }
        ary.push(_.cloneDeep(obj));
      });
    } else if (type === 'cssd') {
      _.map(this.parameterCSSDEqipment, d => {
        const obj = {
          itemId: d.itemId,
          qty: d.qty,
          unitId: d.unitId ? d.unitId : 0,
        }
        ary.push(_.cloneDeep(obj));
      });
    } else if (type === 'genral') {
      _.map(this.parameterGeneralEqipment, d => {
        const obj = {
          id: d.id ? d.id : 0,
          value: d.name
        }
        ary.push(_.cloneDeep(obj));
      });
    }
    return ary;
  }

  getOtParametarList() {
    const promise = new Promise((resolve, reject) => {
      const formVal = this.checkListForm.getRawValue();
      const param = {
        roomId: (formVal.patientData && formVal.patientData.roomId) ? formVal.patientData.roomId : 0,
        specialityId: (formVal.patientData && formVal.patientData.specialityId) ? formVal.patientData.specialityId : 0,
        procedureId: (formVal.patientData && formVal.patientData.procedureId) ? formVal.patientData.procedureId : 0,
      }
      this.otRegisterService.getOTCheckListByPriority(param).subscribe(res => {
        if (res) {
          const val = res
          if (val.parameterImplants.length > 0) {
            _.map(val.parameterImplants, d => {
              const obj = _.cloneDeep(this.implants);
              obj.qty = d.qty;
              obj.name = d.itemName;
              obj.unitName = d.unit;
              obj.itemId = d.itemId;
              obj.unitId = d.unitId;
              this.parameterImplants.push(obj);
            });
          } else {
            this.parameterImplants = [];
          }
          if (val.parameterDrug.length > 0) {
            _.map(val.parameterDrug, d => {
              const obj = _.cloneDeep(this.prescription);
              obj.qty = d.dose;
              obj.name = d.medicineName;
              obj.medicineId = d.medicineId;
              obj.unitName = d.doseUnit;
              obj.unitId = d.doseUnitId;
              obj.date = d.medicineDateTime ? new Date(moment(new Date(d.medicineDateTime)).format('YYYY-MM-DD')) : new Date();
              obj.hrTime = d.medicineDateTime ? (this.timeFormateKey === '12_hour' ?
                moment(new Date(d.medicineDateTime)).format('hh') :
                moment(new Date(d.medicineDateTime)).format('HH')) : moment(new Date(d.medicineDateTime)).format('hh');
              obj.minTime = d.medicineDateTime ? moment(new Date(d.medicineDateTime)).format('m') : moment(new Date()).format('m');
              obj.amPmTime = d.medicineDateTime ? moment(new Date(d.medicineDateTime)).format('a') : moment(new Date()).format('a');
              if (this.timeFormateKey === '12_hour') {
                obj.time = obj.hrTime + ':' + obj.minTime + ':' + obj.amPmTime;
              } else {
                obj.time = obj.hrTime + ':' + obj.minTime;
              }
              this.parameterDrug.push(obj);
            });
          } else {
            this.parameterDrug = [];
          }
          if (val.parameterCSSDEquipment.length > 0) {
            _.map(val.parameterCSSDEquipment, d => {
              const obj = _.cloneDeep(this.CSSDEqipment);
              obj.qty = d.qty;
              obj.name = d.itemName;
              obj.unitName = d.unit;
              obj.itemId = d.itemId;
              obj.unitId = d.unitId;
              this.parameterCSSDEqipment.push(obj);
            });
          } else {
            this.parameterCSSDEqipment = [];
          }
          if (val.parameterBlood.length > 0) {
            _.map(val.parameterBlood, d => {
              const obj = _.cloneDeep(this.blood);
              obj.qty = d.qty;
              obj.name = d.itemName;
              obj.unitName = d.unit;
              obj.itemId = d.itemId;
              obj.unitId = d.unitId;
              this.parameterBlood.push(obj);
            });
          } else {
            this.parameterBlood = []
          }
          if (val.parameterGeneralByID.length > 0) {
            _.map(val.parameterGeneralByID, d => {
              const obj = _.cloneDeep(this.blood);
              obj.id = d.id;
              obj.name = d.value;
              this.parameterGeneralEqipment.push(obj);
            });
          } else {
            this.parameterGeneralEqipment = []
          }
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    return promise;
  }

  getetPreOTCheckListById() {
    const promise = new Promise((resolve, reject) => {
      const formVal = this.checkListForm.getRawValue();
      const param = {
        appointmentId: formVal.patientData.appointmentId,
        patientId: formVal.patienId,
        appointmentDate: formVal.date
      }
      this.otRegisterService.getetPreOTCheckListById(param).subscribe(res => {
        if (res) {
          resolve(res);
        } else {
          resolve(null);
        }
      });
    });
    return promise;
  }

  getTimeFormatKey(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.userId = +this.authService.getLoggedInUserId();
      this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId).subscribe(res => {
        this.timeFormateKey = res.time_format_key;
        if (this.timeFormateKey === '12_hour') {
          this.timeFormate = 'hh:mm A';
        } else {
          this.timeFormate = 'HH:mm';
        }
        resolve(this.timeFormate);
      });
    });
    return promise;
  }

  timeArrayGenrate() {
    if (this.timeFormateKey === '12_hour') {
      for (let i = 1; i < 13; i++) {
        this.hrTime.push(i < 10 ? '0' + i : i);
      }
    } else {
      for (let i = 0; i < 24; i++) {
        this.hrTime.push(i < 10 ? '0' + i : i);
      }
    }
    for (let i = 0; i < 60; i++) {
      this.minTime.push(i < 10 ? '0' + i : i);
    }
  }

  onTimeChange(from, value, indx) {
    if (!value) {
      if (from === 'hr') {
        this.parameterDrug[indx].hrTime = null;
      } else if (from === 'min') {
        this.parameterDrug[indx].minTime = null;
      } else if (from === 'ampm') {
        this.parameterDrug[indx].ampmTime = null;
      }
      return;
    }
    if (from === 'hr') {
      this.parameterDrug[indx].hrTime = value;
    } else if (from === 'min') {
      this.parameterDrug[indx].minTime = value;
    } else if (from === 'ampm') {
      this.parameterDrug[indx].ampmTime = value;
    }
    if (this.timeFormateKey === '12_hour') {
      this.parameterDrug[indx].time = this.parameterDrug[indx].hrTime + ':' + this.parameterDrug[indx].minTime + ':' + this.parameterDrug[indx].amPmTime;
    } else {
      this.parameterDrug[indx].time = this.parameterDrug[indx].hrTime + ':' + this.parameterDrug[indx].minTime;
    }
  }

  updateDate(val) {
    if (val) {
      this.checkListForm.patchValue({ date: val });
      this.otRegisterService.selectedRegisterDate = moment(val).format(this.dateFormat);
      this.loadPatientList();
    } else {
      this.checkListForm.patchValue({ date: new Date() });
      this.otRegisterService.selectedRegisterDate = moment().format(this.dateFormat);
      this.loadPatientList();
    }
    this.clearForm();
  }

  private loadPatientList(searchTxt?) {
    this.patientList$ = concat(
      this.otRegisterService.getOTPatientSchedule(searchTxt ? searchTxt : ''), // default items
      this.patientInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.otRegisterService.getOTPatientSchedule(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  openPopup() {
    const addUpdateData = {
      title: 'ADD',
    };
    const modalInstance = this.modalService.open(ParamMedicineComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: '',
        container: '#homeComponent',
        size: 'lg'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'yes') {
        if (result.data.parameterDrug.length > 0) {
          _.map(result.data.parameterDrug, m => {
            const obj = _.cloneDeep(this.prescription);
            obj.isSelected = true;
            obj.medicineId = m.medicineId;
            obj.name = m.name;
            obj.qty = m.qty;
            obj.unitId = m.unitId;
            obj.unitName = m.unitName;
            obj.date = new Date();
            obj.time = new Date();
            obj.hrTime = this.timeFormateKey === '12_hour' ? moment().format('hh') : moment().format('HH');
            obj.minTime = moment().format('m');
            obj.amPmTime = moment().format('a');
          });
        }
        if (result.data.parameterBlood.length > 0) {
          _.map(result.data.parameterBlood, m => {
            const obj = _.cloneDeep(this.blood);
            obj.isSelected = true;
            obj.itemId = m.itemId;
            obj.name = m.name;
            obj.qty = m.qty;
            obj.unitId = m.unitId;
            obj.unitName = m.unitName;
          });
        }
        if (result.data.parameterImplants.length > 0) {
          _.map(result.data.parameterImplants, m => {
            const obj = _.cloneDeep(this.implants);
            obj.isSelected = true;
            obj.itemId = m.itemId;
            obj.name = m.name;
            obj.qty = m.qty;
            obj.unitId = m.unitId;
            obj.unitName = m.unitName;
          });
        }
        if (result.data.parameterCSSDEquipment.length > 0) {
          _.map(result.data.parameterCSSDEquipment, m => {
            const obj = _.cloneDeep(this.CSSDEqipment);
            obj.isSelected = true;
            obj.itemId = m.itemId;
            obj.name = m.name;
            obj.qty = m.qty;
            obj.unitId = m.unitId;
            obj.unitName = m.unitName;
          });
        }
        if (result.data.parameterGeneralEquipment.length > 0) {
          _.map(result.data.parameterGeneralEquipment, m => {
            const obj = _.cloneDeep(this.general);
            obj.isSelected = true;
            obj.name = m.name;
            obj.id = 0;
          });
        }
        this.parameterDrug = this.parameterDrug.concat(result.data.parameterDrug);
        this.parameterBlood = this.parameterBlood.concat(result.data.parameterBlood);
        this.parameterImplants = this.parameterImplants.concat(result.data.parameterImplants);
        this.parameterCSSDEqipment = this.parameterCSSDEqipment.concat(result.data.parameterCSSDEquipment);
        this.parameterGeneralEqipment = this.parameterGeneralEqipment.concat(result.data.parameterGeneralEquipment);
      }
    });
    modalInstance.componentInstance.addUpdateData = addUpdateData;
  }

}

import { Constants } from './../../../config/constants';
import { IAlert } from './../../../public/models/AlertMessage';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientDashboardService } from './../../services/patient-dashboard.service';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-patient-discharge',
  templateUrl: './patient-discharge.component.html'
})
export class PatientDischargeComponent implements OnInit {
  patientDischargeForm: FormGroup;
  minDate = new Date();
  alertMsg: IAlert;
  encounterStatus = Constants.encounterStatus;
  isCalculateBedCharges: boolean = false;
  remark = null;
  todayDate = new Date();
  reasonType;
  timeArray = {
    hrs: [],
    min: [],
    amPm: ['AM', 'PM']
  };
  timeFormateKey;

  @Input() patientData: EncounterPatient;
  @Input() encounterNextStatus: string;

  reasonList = [];
  reasonTypeList = [];

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private patientDashboardService: PatientDashboardService) { }

  ngOnInit(): void {
    this.timeArrayGenrate();
    this.getReasonTypeList();
    this.patientDischargeForm = this.fb.group({
      dischargeDate: [new Date()],
      dateOfDeath: [new Date()],
      deathTimeHr: [null, Validators.required],
      deathTimeMin: [null, Validators.required],
      deathTimeAmPm: this.timeFormateKey === '12_hour' ? [null, Validators.required] : [null],
      reasonType: [null],
      reason: [null],
      // reasonDesc: [null],
      remark: ['']
    });
  }

  onUpdateEncounterStatus(): void {
    if (this.encounterNextStatus == this.encounterStatus.CancelDischarge) {
      this.cancelDischarge();
      return;
    }
    const rList = _.filter(this.reasonList, r => {
      return r.isSelected === true
    });
    const formData = this.patientDischargeForm.value;
    var dateTime;
    if(formData.dateOfDeath && formData.deathTimeHr && formData.deathTimeMin){
      var date = moment(this.patientDischargeForm.value.dateOfDeath).format('DD/MM/YYYY');
      var time = this.patientDischargeForm.value.deathTimeHr + ':'+this.patientDischargeForm.value.deathTimeMin;
      dateTime = moment(date +' '+time, 'DD-MM-YYYY hh:mm')
      // dateTime = moment(date + ' ' + time, 'DD/MM/YYYY HH:mm');
      dateTime = new Date(dateTime._d).toISOString();
      console.log(dateTime)
    }
    
    const reqParams = {
      serviceTypeId: this.patientData.serviceType.id,
      patientId: this.patientData.patientData.id,
      visitNo: this.patientData.visitNo,
      updatedStatus: this.encounterNextStatus,
      isCalculateBedCharges: this.isCalculateBedCharges,
      remark: this.patientDischargeForm.value.remark,
      dischargeTypeId: this.patientDischargeForm.value.reasonType,
      dischargeReasonId: _.map(rList, r => {
        return r.id;
      }),
      deceasedDateTime : dateTime//"2021-11-15T14:44:56.942Z",//dateTime
    };
    this.patientDashboardService.UpdateEncounterStatus(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.modal.close({
          //discharge_date: this.patientDischargeForm.value.dischargeDate,
          discharge_date: this.patientData.dischargeDate || new Date(),
          remark: this.patientDischargeForm.value.remark,
          encounterCurrentStatus: this.encounterNextStatus,
          formVal: this.patientDischargeForm.value
        });
      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  cancelDischarge() {
    const reqParams = {
      serviceTypeId: this.patientData.serviceType.id,
      patientId: this.patientData.patientData.id,
      visitNo: this.patientData.visitNo,
      updatedStatus: this.encounterNextStatus,
      isCalculateBedCharges: false,
      remark: this.remark,
      dischargeTypeId: null,
      dischargeReasonId: []
    };
    this.patientDashboardService.UpdateEncounterStatus(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.modal.close({
          //discharge_date: this.patientDischargeForm.value.dischargeDate,
          discharge_date: this.patientData.dischargeDate || new Date(),
          remark: this.patientDischargeForm.value.remark,
          encounterCurrentStatus: this.encounterNextStatus
        });
      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }
  onReasonTypeChange(reason) {
    if (reason) {
      this.patientDischargeForm.patchValue({
        reasonType: reason.id
      });
      this.getReasonList(reason.id);
    } else {
      this.patientDischargeForm.patchValue({
        reasonType: null
      });
      this.reasonList = [];
    }
  }

  updateListVal(i) {
    this.reasonList[i].isSelected = !this.reasonList[i].isSelected;
  }

  // onReasonChange(reason) {
  //   if (reason) {
  //     this.patientDischargeForm.patchValue({
  //       reason: reason.id
  //     });
  //   } else {
  //     this.patientDischargeForm.patchValue({
  //       reason: null
  //     });
  //   }
  // }

  getReasonTypeList() {
    this.patientDashboardService.getReasonTypeList().subscribe(res => {
      this.reasonTypeList = res;
    })
  }

  getReasonList(id) {
    this.patientDashboardService.getReasonList(id).subscribe(res => {
      this.reasonList = res;
    })
  }

  timeArrayGenrate() {
    if (this.timeFormateKey === '12_hour') {
      this.timeArray.hrs = [];
      for (let i = 0; i < 12; i++) {
        const time = (i < 10 ? '0' + i : i);
        this.timeArray.hrs.push(time);
      }
    } else {
      for (let i = 0; i < 24; i++) {
        const time = (i < 10 ? '0' + i : i);
        this.timeArray.hrs.push(time);
      }
    }
    for (let i = 0; i < 60; i++) {
      const time = (i < 10 ? '0' + i : i);
      this.timeArray.min.push(time);
    }
  }

}

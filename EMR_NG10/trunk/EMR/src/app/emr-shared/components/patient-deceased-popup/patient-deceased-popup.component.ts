import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { PublicService } from 'src/app/public/services/public.service';
import { CommonService } from 'src/app/public/services/common.service';
import { AuthService } from 'src/app/public/services/auth.service';
import * as moment from 'moment';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { PatientService } from 'src/app/public/services/patient.service';
import { isNumber } from '@ng-bootstrap/ng-bootstrap/util/util';

@Component({
  selector: 'app-patient-deceased-popup',
  templateUrl: './patient-deceased-popup.component.html',
  styleUrls: ['./patient-deceased-popup.component.scss']
})
export class PatientDeceasedPopupComponent implements OnInit {

  alertMsg: IAlert;
  patientId: any;
  loginUser: any;
  @Input() patientObj: EncounterPatient;
  deceasedPatientForm: FormGroup;
  submitted = false;
  timeArray = {
    hrs: [],
    min: [],
    amPm: ['AM', 'PM']
  };
  timeFormateKey;
  todayDate = new Date();
  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    public modal: NgbActiveModal,
    private patientService: PatientService,
    private commonService: CommonService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.loginUser = this.authService.getUserDetailsByKey('userInfo');
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.createForm();
    this.timeArrayGenrate();
  }

  createForm() {
    this.deceasedPatientForm = this.fb.group({
      dateOfDeath: [null, Validators.required],
      deathTimeHr: [null, Validators.required],
      deathTimeMin: [null, Validators.required],
      deathTimeAmPm: this.timeFormateKey === '12_hour' ? [null, Validators.required] : [null],
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

  saveDeceasedPatient() {
    this.submitted = true;
    if (this.deceasedPatientForm.invalid) {
      return;
    }
    const formObj = this.deceasedPatientForm.value;
    const time = formObj?.deathTimeHr + ":" + formObj?.deathTimeMin;
    const dateAndTime = new Date(moment(formObj?.dateOfDeath).format('YYYY/MM/DD') + ' ' + time);
    const param = {
      patUhiId: this.patientObj?.patientData?.patUhid,
      DeceaseDateTime: dateAndTime
    }
    this.patientService.saveDeceasedPatient(param).subscribe(res => {
      this.patientObj.dischargeType = {
        id: 1,
        name: 'EXPIRED',
        date: dateAndTime,
      }
      this.patientObj.status = this.patientObj.status !== Constants.encounterStatus.TreatmentIp ? this.patientObj.status : Constants.encounterStatus.MarkForDischarge;
      const patient = _.cloneDeep(this.patientObj);
      this.commonService.updateActivePatientDataList(patient);
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'navbar'
      };
      this.commonService.updateActivePatientList(obj);
      const alertMsg = {
        message: 'Deceased patient save successfully.',
        messageType: 'success',
        duration: Constants.ALERT_DURATION,
        type: 'close'
      };
      this.modal.close(alertMsg);
    })
  }
}

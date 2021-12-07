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
  selector: 'app-patient-tentative-discharge',
  templateUrl: './patient-tentative-discharge.component.html',
  styleUrls: ['./patient-tentative-discharge.component.scss']
})
export class PatientTentativeDischargeComponent implements OnInit {
  alertMsg: IAlert;
  patientId: any;
  loginUser: any;
  @Input() patientObj: EncounterPatient;
  numberOfDays: any;
  tentativeDate: any;

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    public modal: NgbActiveModal,
    private patientService: PatientService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.loginUser = this.authService.getUserDetailsByKey('userInfo');
    this.patientId = this.route.snapshot.paramMap.get('patientId');
  }

  updateTentativeDate() {
    this.numberOfDays = +this.numberOfDays
    if (this.numberOfDays && this.numberOfDays >= 1 && this.numberOfDays <= 1000) {
      this.tentativeDate = moment(new Date(), "DD-MM-YYYY").add(this.numberOfDays, 'days');
      this.tentativeDate = moment(this.tentativeDate["_d"]).format("DD-MM-YYYY");
    } else {
      this.tentativeDate = null;
    }
  }

  saveTentativeDischargeDate() {
    if (this.numberOfDays) {
      const param = {
        patientId: this.patientObj.patientData.uhid,
        tentativeDays: this.numberOfDays
      }
      this.patientService.UpdateDischargeTentativeDays(param).subscribe((response) => {
        if (response) {
          this.patientObj.tentativeDischargeDate = this.tentativeDate;
          const patient = _.cloneDeep(this.patientObj);
          this.commonService.updateActivePatientDataList(patient);
          const alertMsg = {
            message: 'Tentative date save successfully.',
            messageType: 'success',
            duration: Constants.ALERT_DURATION,
            type: 'close'
          };
          this.modal.close(alertMsg);
        }
      })
    } else {
      this.alertMsg = {
        message: 'Please enter tentative days.',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }

  }
}

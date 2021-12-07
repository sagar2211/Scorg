
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { Constants } from 'src/app/config/constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { ReferPatientComponent } from '@qms/qlist-lib';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { AuthService } from 'src/app/public/services/auth.service';
import { PatientDashboardService } from 'src/app/patient/services/patient-dashboard.service';
import { CommonService } from 'src/app/public/services/common.service';
import { ApplicationEntityConstants } from 'src/app/config/ApplicationEntityConstants';
import { PatientDischargeComponent } from 'src/app/patient/components/patient-discharge/patient-discharge.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard-patient-detail',
  templateUrl: './dashboard-patient-detail.component.html',
  styleUrls: ['./dashboard-patient-detail.component.scss']
})
export class DashboardPatientDetailComponent implements OnInit, OnDestroy {
  @ViewChild('select') select: NgSelectComponent;
  doctorname: string;
  img_path: string;
  patientId: any;
  locationId: number;
  userId: number;
  patientObj: EncounterPatient;
  alertMsg: IAlert;
  loginUserInfo: any;
  disableClicks: boolean;
  allowChangeStatus: boolean;
  handOverNurse: boolean;
  patientReferObj: any;
  encounterNextStatus: string;
  dischargeStatusList = [];

  $destroy = new Subject<any>();
  constructor(
    private authService: AuthService,
    private dashboardservice: PatientDashboardService,
    private commonService: CommonService,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.img_path = environment.IMG_PATH;
    this.userId = this.authService.getUserParentId();
    this.doctorname = Constants.EMR_IPD_USER_DETAILS.doctor_name;
    const locData = this.authService.getUserDetailsByKey('defualt_location');
    this.userId = Constants.EMR_IPD_USER_DETAILS.docId;
    this.locationId = Constants.EMR_IPD_USER_DETAILS.locationId;
    this.getpatientData();
    this.loginUserInfo = this.authService.getUserInfoFromLocalStorage();
    if (this.loginUserInfo.role_type === ApplicationEntityConstants.ADMIN
      || this.loginUserInfo.role_type === ApplicationEntityConstants.DOCTOR) {
      this.disableClicks = false;
    } else if (this.loginUserInfo.role_type === ApplicationEntityConstants.NURSE) {
      this.disableClicks = true;
      this.handOverNurse = true;
    }
    this.subcriptionEvents();
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.modalService.dismissAll();
  }

  getpatientData(patient?) {
    this.patientId = patient && patient.patientData ? patient.patientData.id : this.route.snapshot.params.patientId;
    this.patientObj = this.commonService.getActivePatintData(this.patientId);
    if (this.patientObj) {
      this.patientObj.tentativeDischargeDate = this.patientObj.tentativeDischargeDate ? moment(this.patientObj.tentativeDischargeDate).format("DD-MM-YYYY") : null;
      this.patientIsReferred();
    }
    this.allowChangeStatus = this.patientObj.type == 'ip' && this.patientObj.status != Constants.encounterStatus.ActualDischarge;
    this.setEncounterNextStatus();
  }

  setEncounterNextStatus() {
    this.dischargeStatusList = [];
    if (this.patientObj.type == 'ip') {
      this.encounterNextStatus = this.patientObj.status == Constants.encounterStatus.MarkForDischarge ? Constants.encounterStatus.SendForBiling
        : this.patientObj.status == Constants.encounterStatus.SendForBiling ? Constants.encounterStatus.DischargeApproved
          : this.patientObj.status == Constants.encounterStatus.DischargeApproved ? Constants.encounterStatus.ActualDischarge
            : Constants.encounterStatus.MarkForDischarge;

      if (this.encounterNextStatus === Constants.encounterStatus.MarkForDischarge) {
        this.dischargeStatusList.push(this.encounterNextStatus);
      } else if (this.encounterNextStatus !== Constants.encounterStatus.MarkForDischarge) {
        this.dischargeStatusList.push(this.encounterNextStatus);
        if(this.patientObj.dischargeType.id !== 3 && this.patientObj.dischargeType.id !== 1){
          this.dischargeStatusList.push(Constants.encounterStatus.CancelDischarge);
        }
      }
      this.encounterNextStatus = null;

      if (!this.disableClicks && this.patientObj.type === 'ip') {
        this.dischargeStatusList.push('TENTATIVE DISCHARGE');
      }
      if (!this.disableClicks && this.patientObj.type === 'ip') {
        this.dischargeStatusList.push('TRANSFER');
      }
      if (!this.disableClicks && this.patientObj.type === 'ip') {
        this.dischargeStatusList.push('HAND OVER');
      }
      if (this.handOverNurse) {
        this.dischargeStatusList.push('NURSING HAND OVER');
      }
      if (!this.disableClicks) {
        this.dischargeStatusList.push('REFER');
      }
    }
  }

  changeActionStatus(action) {
    if (!action) return;
    if (action === 'REFER') {
      this.getPatientReferPopup();
    } else {
      this.changeEncounterStatus(action);
    }
  }

  getPatientReferPopup(): void {
    let providerDetails: any;
    const loggedInUserId = this.loginUserInfo.user_id;
    providerDetails = _.find(this.loginUserInfo.provider_info, o => {
      return o.providerValueId === loggedInUserId;
    });
    const modalInstanceInfo = this.modalService.open(ReferPatientComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });
    const modelInstance = modalInstanceInfo.componentInstance as ReferPatientComponent;
    modelInstance.environmentDetails = environment;
    modelInstance.providerDetails = providerDetails;
    modelInstance.serviceTypeId = 1; // for IPD
    modelInstance.patientDetails = {
      pat_name: this.patientObj.patientData.name,
      pat_uhid: this.patientObj.patientData.id,
      pat_appointment_Id: this.patientObj.visitNo
    };
    modalInstanceInfo.result.then(() => {
      this.encounterNextStatus = null;
    }, (reason) => {
      if (reason !== 'Cancel click' && reason !== 'Cross click') {
        this.alertMsg = {
          message: reason.message,
          messageType: reason.messageType,
          duration: Constants.ALERT_DURATION
        };
        this.encounterNextStatus = null;
      }
    });
  }

  changeEncounterStatus(status?) {
    const modelInstance = this.modalService.open(PatientDischargeComponent, {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal new-modal',
      container: '#homeComponent'
      // size: 'sm'
    });
    modelInstance.result.then(result => {
      this.patientObj.dischargeDate = result.discharge_date;
      this.patientObj.status = result.encounterCurrentStatus;
      if (Constants.encounterStatus.CancelDischarge === status) {
        this.patientObj.status = Constants.encounterStatus.TreatmentIp;
      }
      this.setEncounterNextStatus();
      this.alertMsg = {
        message: 'Patient Status Update successfully',
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
      this.encounterNextStatus = null;

      // this.router.navigate(['/emr/dashboard/doctor']);
    }, () => {
      this.encounterNextStatus = null;
    });
    (modelInstance.componentInstance as PatientDischargeComponent).patientData = this.patientObj;
    (modelInstance.componentInstance as PatientDischargeComponent).encounterNextStatus = status || this.encounterNextStatus;
  }

  subcriptionEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }
  patientIsReferred() {
    this.patientReferObj = null;
    const params = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo,
    };
    return this.dashboardservice.checkPatientIsReferred(params).subscribe(res => {
      if (res.data) {
        this.patientReferObj = res.data;
        return this.patientReferObj;
      } else {
        return;
      }
    });
  }
}

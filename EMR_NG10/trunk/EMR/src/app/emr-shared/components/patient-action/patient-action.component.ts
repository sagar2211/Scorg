import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { Constants } from 'src/app/config/constants';
import { ApplicationEntityConstants } from 'src/app/config/ApplicationEntityConstants';
import { ReferPatientComponent } from '@qms/qlist-lib';
import { environment } from 'src/environments/environment';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { PatientDashboardService } from 'src/app/patient/services/patient-dashboard.service';
import { PatientDischargeComponent } from 'src/app/patient/components/patient-discharge/patient-discharge.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NursingHandoverComponent } from '../nursing-handover/nursing-handover.component';
import { PatientTransferComponent } from '../patient-transfer/patient-transfer.component';
import { PatientBedTransferComponent } from '../patient-bed-transfer/patient-bed-transfer.component';
import { PatientTentativeDischargeComponent } from '../patient-tentative-discharge/patient-tentative-discharge.component';
import { PatientDeceasedPopupComponent } from '../patient-deceased-popup/patient-deceased-popup.component';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-patient-action',
  templateUrl: './patient-action.component.html',
  styleUrls: ['./patient-action.component.scss']
})
export class PatientActionComponent implements OnInit, OnDestroy {
  @Input() public dischargeStatusList: Array<any>;
  encounterNextStatus: string;
  patientObj: EncounterPatient;
  disableClicks: boolean;
  handOverNurse: boolean;
  loginUserInfo: any;
  alertMsg: IAlert;
  patientId: any;
  allowChangeStatus: boolean;
  patientReferObj: any;
  $destroy = new Subject<any>();
  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private dashboardservice: PatientDashboardService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.loginUserInfo = this.authService.getUserInfoFromLocalStorage();
    if (this.loginUserInfo?.role_type === ApplicationEntityConstants.ADMIN
      || this.loginUserInfo?.role_type === ApplicationEntityConstants.DOCTOR) {
      this.disableClicks = false;
    } else if (this.loginUserInfo?.role_type === ApplicationEntityConstants.NURSE) {
      this.disableClicks = true;
      this.handOverNurse = true;
    }
    this.getpatientData();
    this.subcriptionEvents();
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }

  getpatientData(patient?) {
    this.patientId = patient && patient.patientData ? patient.patientData.id : this.route.snapshot.params.patientId;
    this.patientObj = this.commonService.getActivePatintData(this.patientId);
    if (this.patientObj) {
      this.patientIsReferred();
    }
    this.allowChangeStatus = this.patientObj.type == 'ip' && this.patientObj.status != Constants.encounterStatus.ActualDischarge;
    this.setEncounterNextStatus();
  }

  getPatientReferPopup(): void {
    let providerDetails: any;
    const loggedInUserId = this.loginUserInfo?.user_id;
    providerDetails = _.find(this.loginUserInfo?.provider_info, o => {
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
        if(this.patientObj.dischargeType.id !== 3 && this.patientObj.dischargeType.id !== 1){
          this.dischargeStatusList.push('PATIENT DECEASED');
        }
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
      console.log(this.dischargeStatusList)
    }
  }

  changeActionStatus(action) {
    if (!action) return;
    if (action === 'TENTATIVE DISCHARGE') {
      this.getPatientTentativeDischargePopup();
    } else if (action === 'PATIENT DECEASED') {
      this.getPatientDeceasedPopup();
    } else if (action === 'TRANSFER') {
      this.getPatientBedTranferPopup();
    } else if (action === 'HAND OVER') {
      this.getPatientDeptTranferPopup();
    } else if (action === 'NURSING HAND OVER') {
      this.getPatientHandOverNusrePopup();
    } else if (action === 'REFER') {
      this.getPatientReferPopup();
    } else {
      this.changeEncounterStatus(action);
    }
  }

  getPatientTentativeDischargePopup(): void {
    const modelInstance = this.modalService.open(PatientTentativeDischargeComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      size: 'lg modal-dialog-centered',
      container: '#homeComponent',
      windowClass: 'patient-tentative'
    });
    modelInstance.result.then((res) => {
      if (res.type === 'close') {
        this.alertMsg = {
          message: res.message,
          messageType: res.messageType,
          duration: Constants.ALERT_DURATION
        };
      }
      this.encounterNextStatus = null;
    }, reason => {
      this.alertMsg = {
        message: "Something Went Wrong.",
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      this.encounterNextStatus = null;
    });
    modelInstance.componentInstance.patientObj = this.patientObj;
  }

  getPatientDeceasedPopup(): void {
    const modelInstance = this.modalService.open(PatientDeceasedPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      size: 'lg modal-dialog-centered',
      container: '#homeComponent',
      windowClass: 'patient-tentative'
    });
    modelInstance.result.then((res) => {
      if (res.type === 'close') {
        this.alertMsg = {
          message: res.message,
          messageType: res.messageType,
          duration: Constants.ALERT_DURATION
        };
      }
      this.encounterNextStatus = null;
    }, reason => {
      this.alertMsg = {
        message: "Something Went Wrong.",
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      this.encounterNextStatus = null;
    });
    modelInstance.componentInstance.patientObj = this.patientObj;
  }

  getPatientBedTranferPopup(): void {
    const modelInstance = this.modalService.open(PatientBedTransferComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      container: '#homeComponent'
    });
    modelInstance.result.then((res) => {
      if (res.type === 'close') {
        this.alertMsg = {
          message: res.message,
          messageType: res.messageType,
          duration: Constants.ALERT_DURATION
        };
      }
      this.encounterNextStatus = null;
    }, reason => {
      if (reason) {
        this.alertMsg = {
          message: reason.message,
          messageType: reason.messageType,
          duration: Constants.ALERT_DURATION
        };
      }
      this.encounterNextStatus = null;
    });
    modelInstance.componentInstance.patientObj = this.patientObj;
  }

  getPatientDeptTranferPopup(): void {
    const modelInstance = this.modalService.open(PatientTransferComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      container: '#homeComponent'
    });
    modelInstance.result.then((res) => {
      if (res.type === 'close') {
        this.alertMsg = {
          message: res.message,
          messageType: res.messageType,
          duration: Constants.ALERT_DURATION
        };
      }
      this.encounterNextStatus = null;
    }, reason => {
      this.alertMsg = {
        message: "Something Went Wrong.",
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      this.encounterNextStatus = null;
    });
    modelInstance.componentInstance.patientObj = this.patientObj;
  }

  getPatientHandOverNusrePopup(): void {
    const modelInstance = this.modalService.open(NursingHandoverComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      container: '#homeComponent'
    });
    modelInstance.result.then((res) => {
      if (res.type === 'close') {
        this.alertMsg = {
          message: res.message,
          messageType: res.messageType,
          duration: Constants.ALERT_DURATION
        };
      }
      this.encounterNextStatus = null;
    }, reason => {
      this.alertMsg = {
        message: "Something Went Wrong.",
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      this.encounterNextStatus = null;
    });
    modelInstance.componentInstance.patientObj = this.patientObj;
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
      this.patientObj.dischargeDate = result?.discharge_date;
      this.patientObj.status = result?.encounterCurrentStatus;
      if (Constants.encounterStatus.CancelDischarge === status) {
        this.patientObj.dischargeType = {
          id : null,
          name : null,
          date : null
        }
        this.patientObj.status = Constants.encounterStatus.TreatmentIp;
        const patient = _.cloneDeep(this.patientObj);
        this.commonService.updateActivePatientList(patient);
      }
      if (result && result.formVal && result.formVal.reasonType === 3) {
        this.patientObj.dischargeType = {
          id: this.patientObj.dischargeType ? (this.patientObj.dischargeType.id || 1) : 1,
          name: this.patientObj.dischargeType ? (this.patientObj.dischargeType.name || 'EXPIRED') : 'EXPIRED',
          date: this.patientObj.dischargeType ? this.patientObj.dischargeType.date : null,
        }
        const patient = _.cloneDeep(this.patientObj);
        this.commonService.updateActivePatientDataList(patient);
        const obj = {
          type: 'add',
          data: patient,
          sourc: 'navbar'
        };
        this.commonService.updateActivePatientList(obj);
      }
      this.commonService.updateActivePatientDataList(this.patientObj);
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

  subcriptionEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }

}

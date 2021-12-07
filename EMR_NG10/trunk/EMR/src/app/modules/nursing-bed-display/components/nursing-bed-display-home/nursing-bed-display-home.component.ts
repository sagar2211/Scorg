import { Component, OnInit, Input, OnDestroy, ComponentFactoryResolver } from '@angular/core';
import { Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, catchError, map } from 'rxjs/operators';
import { AuthService } from 'src/app/public/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';
import { UsersService } from 'src/app/public/services/users.service';
import { environment } from 'src/environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { BedService } from 'src/app/modules/nursing/services/bed.service';
import { EmrOrderListComponent } from '../emr-order-list/emr-order-list.component';
import { HisServiceOrderComponent } from '../his-service-order/his-service-order.component';
import { PatientService } from 'src/app/public/services/patient.service';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { ConsentPartialViewComponent } from 'src/app/shared/consent-partial-view/consent-partial-view.component';

import { Constants } from 'src/app/config/constants';
import { ApplicationEntityConstants } from 'src/app/config/ApplicationEntityConstants';
import { ReferPatientComponent } from '@qms/qlist-lib';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { PatientDashboardService } from 'src/app/patient/services/patient-dashboard.service';
import { PatientDischargeComponent } from 'src/app/patient/components/patient-discharge/patient-discharge.component';
import { takeUntil } from 'rxjs/operators';
import { NursingHandoverComponent } from 'src/app/emr-shared/components/nursing-handover/nursing-handover.component';
import { PatientTransferComponent } from 'src/app/emr-shared/components/patient-transfer/patient-transfer.component';
import { PatientBedTransferComponent } from 'src/app/emr-shared/components/patient-bed-transfer/patient-bed-transfer.component';
import { PatientTentativeDischargeComponent } from 'src/app/emr-shared/components/patient-tentative-discharge/patient-tentative-discharge.component';
import { PatientDeceasedPopupComponent } from 'src/app/emr-shared/components/patient-deceased-popup/patient-deceased-popup.component';
import { MappingService } from 'src/app/public/services/mapping.service';

@Component({
  selector: 'app-nursing-bed-display-home',
  templateUrl: './nursing-bed-display-home.component.html',
  styleUrls: ['./nursing-bed-display-home.component.scss']
})
export class NursingBedDisplayHomeComponent implements OnInit, OnDestroy {
  initialDischargeStatusList = ['MARK FOR DISCHARGE', 'TENTATIVE DISCHARGE', 'PATIENT DECEASED', 'TRANSFER', 'HAND OVER', 'REFER'];
  dischargeStatusList = [];
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

  loadPage: boolean = false;
  patientList$ = new Observable<any>();
  patientInput$ = new Subject<any>();
  nursingStationList$ = new Observable<any>();
  nursingStationInput$ = new Subject<any>();
  filterObj = {
    patientId: null,
    patientData: null,
    nursingStation: [],
    bedStatus: 'All'
  }
  loadSource;
  isPartialLink: boolean;
  bedDisplayData = [];
  bedDisplayAllData = [];

  bedStatusArray = [
    {
      name: 'All',
      key: 'All'
    },
    {
      name: 'Occupied',
      key: 'O'
    },
    {
      name: 'Vacant',
      key: 'V'
    },
    {
      name: 'Reserved',
      key: 'R'
    },
    {
      name: 'Booked',
      key: 'B'
    },
    {
      name: 'Maintenance/Blocked Bed',
      key: 'M'
    },
  ];
  selectedPatientId: any;
  storesArray: any;
  selectedNursingStation: any;
  userId: any;
  constructor(
    private mappingService: MappingService,
    private router: Router,
    private authService: AuthService,
    private activeRoute: ActivatedRoute,
    private commonService: CommonService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
    private bedService: BedService,
    private modalService: NgbModal,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private dashboardservice: PatientDashboardService,
  ) { }

  ngOnInit(): void {
    this.loadPage = false;
    this.loginUserInfo = this.authService.getUserInfoFromLocalStorage();
    this.isPartialLink = this.router.url.indexOf('nursingBedDisplay') !== -1;
    this.userId = this.authService.getLoggedInUserId();
    if (this.isPartialLink) {
      this.authService.partialPageToken = this.activeRoute.snapshot.params.id;
      this.loadSource = this.activeRoute.snapshot.params.source || 'ENCOUNTER';
      const token = this.activeRoute.snapshot.params.userTokan;
      const appKey = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
      this.loginThroghSSO(token, appKey).then(res => {
        this.loadPage = true;
        this.loadDefaultApi();
      })
    } else {
      this.loadPage = true;
      this.loadDefaultApi();
    }

    if (this.loginUserInfo?.role_type === ApplicationEntityConstants.ADMIN
      || this.loginUserInfo?.role_type === ApplicationEntityConstants.DOCTOR) {
      this.disableClicks = false;
    } else if (this.loginUserInfo?.role_type === ApplicationEntityConstants.NURSE) {
      this.disableClicks = true;
      this.handOverNurse = true;
    }
    this.subcriptionEvents();
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }

  loadDefaultApi() {
    this.loginUserInfo = this.authService.getUserInfoFromLocalStorage();
    this.getPatientSearchData();
    this.getNursingStationList();
    this.getOccupiedBedDetail(true).then();
  }


  loginThroghSSO(token, appKey) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token, appKey).subscribe(res => {
        if (res.status_message === 'Success') {
          // console.log('Success', res);
          // localStorage.setItem('globals', JSON.stringify(res.data));
          const userObject = res.data;
          this.commonService.storeKeyValues = [];
          this.commonService.userListTempParams = null;
          this.commonService.getScheduleDataParams = null;
          this.userService.masterUserDetails = {};
          this.authService.redirectUrl = null;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          // this.router.navigate(['/app/user/userList']);
          resolve(true);
        } else if (res) {
          let loginPageUrl = environment.SSO_LOGIN_URL;
          loginPageUrl = environment.production && loginPageUrl ? loginPageUrl : window.location.origin;
          window.open(loginPageUrl, '_self');
          resolve(true);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        // this.redirectTo();
      });
  }

  loadBedFilterData() {
    this.getOccupiedBedDetail().then(res => {

    });
  }

  getOccupiedBedDetail(isCallFromInit?) {
    const promise = new Promise((resolve, reject) => {
      if (!isCallFromInit && this.filterObj.bedStatus && this.filterObj.nursingStation.length === 0 && !this.filterObj.patientId) {
        this.bedDisplayData = this.updateBedStatusFilter(this.bedDisplayAllData);

        resolve(this.bedDisplayData);
      } else {
        const param = {
          nursingStationId: this.filterObj.nursingStation,
          patientUhid: this.filterObj.patientId ? this.filterObj.patientId : '',

          date: moment().format('YYYY-MM-DD'),
          levelDataId: 0,
          bedChargeId: 0,
          bedCategoryId: 0,
          bedTypeId: [],
          bedClassId: 0,
          status: 'All',
          userId: this.loginUserInfo.user_id,
          showAvailableBed: true
        }
        this.bedService.getBedOccupiedList(param).subscribe(res => {
          _.map(res, d => {
            d.isShow = true;
            d.isExpand = true;
            _.map(d.bedData, b => {
              b.isShow = true;
            })
          });
          if (isCallFromInit) {
            this.bedDisplayAllData = res.map(a => ({ ...a }));
          }
          this.bedDisplayData = res.map(a => ({ ...a }));
          this.bedDisplayData = this.updateBedStatusFilter(this.bedDisplayData);
          const nursingStationId = this.authService.getUserInfoFromLocalStorage()?.nursingStationId;
          this.bedDisplayData = _.filter(this.bedDisplayData, itr => {
            return itr.nursingStationId === nursingStationId;
          })
          resolve(this.bedDisplayData);
        });
      }
    });
    return promise;
  }

  updateBedStatusFilter(bedDisplayData) {
    if (this.filterObj.bedStatus && this.filterObj.bedStatus !== 'All') {
      _.map(bedDisplayData, ns => {
        _.map(ns.bedData, b => {
          b.isShow = b.status === this.filterObj.bedStatus ? true : false;
        });
        const ifHaveIsShowTrue = _.filter(ns.bedData, b => {
          return b.isShow === true;
        });
        if (ifHaveIsShowTrue.length > 0) {
          ns.isShow = true;
        } else {
          ns.isShow = false;
        }
      });
    } else {
      _.map(bedDisplayData, ns => {
        ns.isShow = true;
        ns.isExpand = true;
        _.map(ns.bedData, b => {
          b.isShow = true;
        });
      });
    }
    return bedDisplayData.map(a => ({ ...a }));
  }

  onExpandCollapse(item) {
    item.isExpand = !item.isExpand;
  }

  getDischargeActions(patientData) {
    if (patientData.patientStatus === 'IP TREATMENT') {
      this.initialDischargeStatusList[0] = 'MARK FOR DISCHARGE';
    } else if (patientData.patientStatus === 'MARK FOR DISCHARGE') {
      this.initialDischargeStatusList[0] = 'SEND FOR BILLING';
      const iscancelAvailable = _.filter(this.initialDischargeStatusList, itr => {
        return (itr === "CANCELLED DISCHARGE")
      })
      if (iscancelAvailable.length === 0) {
        this.initialDischargeStatusList.splice(1, 0, "CANCELLED DISCHARGE");
      }
    } else if (patientData.patientStatus === 'SEND FOR BILLING') {
      this.initialDischargeStatusList[0] = 'DISCHARGE APPROVED';
      const iscancelAvailable = _.filter(this.initialDischargeStatusList, itr => {
        return (itr === "CANCELLED DISCHARGE")
      })
      if (iscancelAvailable.length === 0) {
        this.initialDischargeStatusList.splice(1, 0, "CANCELLED DISCHARGE");
      }
    } else if (patientData.patientStatus === 'DISCHARGE APPROVED') {
      this.initialDischargeStatusList[0] = 'ACTUAL DISCHARGE';
      const iscancelAvailable = _.filter(this.initialDischargeStatusList, itr => {
        return (itr === "CANCELLED DISCHARGE")
      })
      if (iscancelAvailable.length === 0) {
        this.initialDischargeStatusList.splice(1, 0, "CANCELLED DISCHARGE");
      }
    }
    return this.initialDischargeStatusList
  }

  onPatientChange(val) {
    if (val) {
      this.filterObj.patientId = val.patientId;
      this.filterObj.patientData = val;
    } else {
      this.filterObj.patientId = null;
      this.filterObj.patientData = null;
    }
  }

  onBedStatusChange(val) {
    if (val) {
      this.filterObj.bedStatus = val.key;
    } else {
      this.filterObj.bedStatus = 'All';
    }
  }

  onNursingStationChange(val) {

  }

  bookBed(bed) {
    console.log(bed);
  }

  showBedDetail(bed) {
    console.log(bed);
  }

  getStatusName(key) {
    const val = _.find(this.bedStatusArray, sts => {
      return sts.key === key;
    });
    return val.name;
  }

  openNotificationPopup(bed) {
    const modalInstance = this.modalService.open(NotificationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'notification-modal-popup',
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {

      }
    });
    modalInstance.componentInstance.bedData = bed;
  }

  getNursingStationList(searchTxt?) {
    this.mappingService.getNusringStationMappingByUserId(this.userId).subscribe(res => {
      if (res) {
        this.storesArray = res;
      }
      if (this.storesArray.length === 1) {
        this.selectedNursingStation = this.storesArray[0]
        this.authService.setNursingStationDetails(this.selectedNursingStation);
        this.router.navigate(['/nursingApp']);
      }
      if (!this.storesArray.length) {
        this.router.navigate(['/noNursingStation']);
      }
    });
    // this.nursingStationList$ = concat(
    //   this.bedService.getNursingStationList(searchTxt ? searchTxt : ''), // default items
    //   this.nursingStationInput$.pipe(
    //     distinctUntilChanged(),
    //     debounceTime(500),
    //     switchMap(term => this.bedService.getNursingStationList(term ? term : (searchTxt ? searchTxt : '')).pipe(
    //       catchError(() => of([]))
    //     ))
    //   )
    // );
  }

  getPatientSearchData(searchTxt?) {
    this.patientList$ = concat(
      this.commonService.getQuickPatientList(searchTxt ? searchTxt : ''), // default items
      this.patientInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.commonService.getQuickPatientList(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  updatePatientInService(patient: EncounterPatient) {
    patient.type = patient.serviceType.name.toLowerCase();
    patient.loadFrom = 'IP_NOTES';
    this.commonService.showHideMainMenuFromNavBar(false);
    this.commonService.setActivePatientList(patient, 'add');
    this.commonService.isPatientOpenFromNursingRoute = true;
    if (this.commonService.getActivePatientList(patient).length <= 5) {
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'doctor_dashboard'
      };
      this.commonService.updateActivePatientList(obj);
      // this.router.navigate(['/emr/patient/dashboard/', patient.patientData.id]);
    } else {
      console.log('Already Open 5 Patients');
    }
  }

  redirectOrderPage(patientData) {
    this.getPatientVisitData(patientData).subscribe(res => {
      this.updatePatientInService(res);
      this.commonService.patientNursingRoute = '/nursingApp/nursing/patient/orders/ordersList/' + patientData.uhid;
      // this.openPoup('emr');
      this.router.navigate(['/nursingApp/nursing/patient/orders/ordersList/', patientData.uhid]);
    });
  }

  openOrdersPopup(patientData) {
    this.getPatientVisitData(patientData).subscribe(res => {
      this.updatePatientInService(res);
      this.openPoup('emr', patientData);
    });
  }

  redirectServiceOrdersPage(patientData) {
    this.getPatientVisitData(patientData).subscribe(res => {
      this.updatePatientInService(res);
      this.commonService.patientNursingRoute = '/nursingApp/nursing/patient/other/service-order/' + patientData.uhid;
      this.router.navigate(['/nursingApp/nursing/patient/other/service-order/', patientData.uhid]);
      // this.openPoup('service_order');
    });
  }

  openServiceOrdersPopup(patientData) {
    this.getPatientVisitData(patientData).subscribe(res => {
      this.updatePatientInService(res);
      this.openPoup('service_order', patientData);
    });
  }

  openPatientIssuePopup(patientData) {
    // this.openPoup('emr');
  }

  openPatientConsentPopup(patientData) {
    this.openPoup('consent', patientData);
  }

  getPatientVisitData(patientData): Observable<any> {
    const param = {
      service_type_id: patientData.serviceTypeId,
      patient_id: patientData.uhid,
      visit_no: patientData.visitNo,
    };
    return this.patientService.getPatientDataViaVisitType(param).pipe(map(res => {
      if (res) {
        const pat = new EncounterPatient();
        pat.generateObject(res);
        return pat;
      }
    }));
  }

  openPoup(type, patientData) {
    patientData.id = patientData.uhid;
    let compName = null;
    if (type === 'emr') {
      compName = EmrOrderListComponent;
    } else if (type === 'service_order') {
      compName = HisServiceOrderComponent;
    } else if (type === 'consent') {
      compName = ConsentPartialViewComponent;
    }
    const modalInstance = this.modalService.open(compName,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'orders-modal-popup',
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {

      }
    });
    modalInstance.componentInstance.patientData = patientData;
  }

  getpatientData(patient?) {
    this.patientId = patient ? patient.uhid : this.route.snapshot.params.patientId;
    this.patientService.getPatientActiveVisitDetail(this.patientId).subscribe((response) => {

      this.patientObj = response[0];
      if (this.patientObj) {
        this.patientIsReferred();
      }
      this.allowChangeStatus = this.patientObj.type == 'ip' && this.patientObj.status != Constants.encounterStatus.ActualDischarge;
      this.setEncounterNextStatus();
    });

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
    }
  }

  changeActionStatus(action, patientData) {
    // this.getpatientData(patientData);
    // console.log(patientData)
    this.selectedPatientId = patientData.patId;
    if (!action) return;

    this.patientService.getPatientActiveVisitDetail(patientData?.uhid).subscribe((response) => {
      if (response) {
        this.patientObj = response[0];
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
    });
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
      this.alertMsg = {
        message: "Something Went Wrong.",
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
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

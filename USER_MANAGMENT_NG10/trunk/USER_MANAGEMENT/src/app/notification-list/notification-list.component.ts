import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonService } from '../public/services/common.service';
import { Constants, NotificationStatusConst } from 'src/app/config/constants';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { IAlert } from '../public/models/AlertMessage';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { NotificationListService } from '../public/services/notification_list';
import { AuthService } from '../public/services/auth.service';
import { UsersService } from '../public/services/users.service';
//import { EncounterPatient } from '../public/models/encounter-patient.model';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnChanges {
  notificationList = [];
  searchString: string;
  alertMsg: IAlert;
  pageNumber = 0;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  loadList: boolean;
  loadSource: string = 'notification_panel';
  isPartialLink: boolean = false;
  appList: any;
  patientId = null;

  constructor(
    private notificationListService: NotificationListService,
    private commonService: CommonService,
    //private patientService: PatientService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UsersService
  ) { }

  ngOnInit() {
    this.isPartialLink = this.router.url.indexOf('partial-notification-list') !== -1;
    if (this.isPartialLink) {
      this.authService.partialPageToken = this.activeRoute.snapshot.params.id;
      this.loadSource = this.activeRoute.snapshot.params.source || 'notification_panel';
      this.patientId = this.activeRoute.snapshot.params.patientId || null;
    }
    this.loadList = false;
    this.searchString = '';
    this.getAllNotificationList();
    this.getUserAssignedApplications();
    this.subjectFun();
  }

  getUserAssignedApplications() {
    const userId = this.authService.getLoggedInUserId();
    this.userService.getAssignedApplications(userId).subscribe(response => {
      this.appList = this.appList = _.filter(response, (o) => o.rights === true);
    });
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    //console.log(this.loadSource);
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getAllNotificationList()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.pageNumber = 0;
        this.getAllNotificationList();
      });
  }

  getAllNotificationList() {
    this.pageNumber = !this.searchString ? this.pageNumber + 1 : 1;
    const param = {
      search_keyword: this.searchString ? this.searchString : (this.patientId ? this.patientId : null),
      page_number: this.pageNumber,
      limit: 30,
      status_ids: []
    };
    // const module = this.commonService.selectedNavModule;
    // if (module !== 'emr') {
    //   param.status_ids = [NotificationStatusConst.ReferPatient];
    // }
    this.loadList = true;
    this.notificationListService.getAllNotificationList(param).subscribe(res => {
      const list = res.length ? _.map(res, n => { n.isActionPerformed = false; return n; }) : [];
      this.notificationList = !this.searchString ? this.notificationList.concat(list) : list;
    });
  }

  performActionBtnEvent(item, index) {
    this.notificationListService.updateNotificationAction(item.notification_id).subscribe(res => {
      if (res.data) {
        this.notificationList[index].isActionPerformed = true;
      } else {
        console.error('updateNotificationAction error:' + res.message);
        this.displayErrorMsg('Failed to save action', 'danger');
      }
    });
  }
  redirctPatient(item) {
    let applicationId = item.default_app_id;

    if (item.status_id == NotificationStatusConst.MarkForDischarge
      || item.status_id == NotificationStatusConst.SendForBiling
      || item.status_id == NotificationStatusConst.DischargeApproved
      || item.status_id == NotificationStatusConst.ActualDischarge) {
      const emrApp = _.find(this.appList, (o) => o.app_key == 'emr');
      applicationId = emrApp ? emrApp.app_id : applicationId;
    }

    const emrApp = _.find(this.appList, (o) => o.app_id == applicationId);
    if (emrApp) {
      let appUrl = emrApp.app_url.replace('#token#', this.authService.getAuthToken());
      if (emrApp.app_key == 'user_management' || emrApp.app_key == 'qms'
        || emrApp.app_key == 'emr' || emrApp.app_key == 'inventory') {
        appUrl = appUrl + '/' + item.notification_id;
      }
      else {
        appUrl = appUrl + '&notificationId=' + item.notification_id;
      }
      window.open(appUrl, '_blank');
    }
    //this.navigatePatient(item);
  }

  // redirctPatient(item) {
  //   const param = {
  //     service_type_id: item.service_type_id,
  //     patient_id: item.patient_id,
  //     visit_no: item.visit_no
  //   };
  //   this.patientService.getPatientDataViaVisitType(param).subscribe(res => {
  //     this.redirctPatientDashBoard(item, res);
  //   });
  // }

  // redirctPatientDashBoard(item, res) {
  //   const patData = this.patientService.generateEncounterPatientData([res]);
  //   this.navigateToPatient(patData[0], item);
  // }

  // navigateToPatient(patient: EncounterPatient, item) {
  //   patient.type = patient.serviceType.name.toLowerCase();
  //   this.commonService.setActivePatientList(patient, 'add');
  //   if (this.commonService.getActivePatientList(patient).length <= 5) {
  //     const obj = {
  //       type: 'add',
  //       data: patient,
  //       sourc: 'doctor_dashboard'
  //     };
  //     this.commonService.updateActivePatientList(obj);
  //     this.navigatePatient(item);
  //   } else {
  //     this.displayErrorMsg('Max 5 Patient Allowed', 'danger');
  //   }
  // }

  navigatePatient(item) {
    this.router.navigate([item.route_url]);
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }

}

import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { CommonService } from '../public/services/common.service';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../public/services/auth.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})

export class NotificationListComponent implements OnInit, OnDestroy {
  @Input() loadSource: string;
  $destroy: Subject<boolean> = new Subject();
  url: string;
  urlSafe: SafeResourceUrl;

  constructor(
    private commonService: CommonService,
    public sanitizer: DomSanitizer,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getSetUrl();
  }

  getSetUrl(): void {
    this.url = environment.notificationPartialUrl;
    this.url = this.url.replace('#token#', this.authService.getAuthToken());
    this.url = this.url.replace('#source#', this.loadSource);
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  myLoadEvent(): void { // after load iframe event is called
    if (this.url) {
      this.commonService.reportIframeLoaderNotify(false);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

}

// export class NotificationListComponent implements OnInit, OnChanges {
//   @Input() loadSource: string;
//   notificationList = [];
//   searchString: string;
//   alertMsg: IAlert;
//   pageNumber = 0;
//   subject: Subject<string> = new Subject();
//   ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
//   loadList: boolean;

//   constructor(
//     private notificationListService: NotificationListService,
//     private commonService: CommonService,
//     private patientService: PatientService,
//     private router: Router,
//   ) { }

//   ngOnInit() {
//     console.log(this.loadSource);
//     this.loadList = false;
//     this.searchString = '';
//     this.getAllNotificationList();
//     this.subjectFun();
//   }

//   ngOnChanges(): void {
//     //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
//     //Add '${implements OnChanges}' to the class.
//     console.log(this.loadSource);
//   }

//   subjectFun() {
//     // -- Subscribe to the subject, which is triggered from search input and when section clicked
//     // -- When the debounce time has passed, we call getAllNotificationList()
//     this.subject
//       .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
//       .subscribe(() => {
//         this.pageNumber = 0;
//         this.getAllNotificationList();
//       });
//   }

//   getAllNotificationList() {
//     this.pageNumber = !this.searchString ? this.pageNumber + 1 : 1;
//     const param = {
//       search_keyword: this.searchString ? this.searchString : null,
//       page_number: this.pageNumber,
//       limit: 30,
//       status_ids: []
//     };
//     const module = this.commonService.selectedNavModule;
//     if (module !== 'emr') {
//       param.status_ids = [Constants.notificationReferPatient];
//     }
//     this.loadList = true;
//     this.notificationListService.getAllNotificationList(param).subscribe(res => {
//       const list = res.length ? _.map(res, n => { n.isActionPerformed = false; return n; }) : [];
//       this.notificationList = !this.searchString ? this.notificationList.concat(list) : list;
//     });
//   }

//   performActionBtnEvent(item, index) {
//     this.notificationListService.updateNotificationAction(item.notification_id).subscribe(res => {
//       if (res.data) {
//         this.notificationList[index].isActionPerformed = true;
//       } else {
//         console.error('updateNotificationAction error:' + res.message);
//         this.displayErrorMsg('Failed to save action', 'danger');
//       }
//     });
//   }

//   redirctPatient(item) {
//     const param = {
//       service_type_id: item.service_type_id,
//       patient_id: item.patient_id,
//       visit_no: item.visit_no
//     };
//     this.patientService.getPatientDataViaVisitType(param).subscribe(res => {
//       this.redirctPatientDashBoard(item, res);
//     });
//   }

//   redirctPatientDashBoard(item, res) {
//     const patData = this.patientService.generateEncounterPatientData([res]);
//     this.navigateToPatient(patData[0], item);
//     // if (item.service_type_id === 1) {
//     //   const patData = this.patientService.generateIpdPatientData([res.ipd_data]);
//     //   this.navigateToPatient(patData[0], item);
//     // } else if (item.service_type_id === 2) {
//     //   const patData = new OpdPatient();
//     //   patData.generateObject(res.opd_data);
//     //   this.navigateToPatient(patData, item);
//     // }
//   }

//   navigateToPatient(patient: EncounterPatient, item) {
//     patient.type = patient.serviceType.name.toLowerCase();
//     this.commonService.setActivePatientList(patient, 'add');
//     if (this.commonService.getActivePatientList(patient).length <= 5) {
//       const obj = {
//         type: 'add',
//         data: patient,
//         sourc: 'doctor_dashboard'
//       };
//       this.commonService.updateActivePatientList(obj);
//       this.navigatePatient(item);
//     } else {
//       this.displayErrorMsg('Max 5 Patient Allowed', 'danger');
//     }
//   }

//   navigatePatient(item) {
//     this.router.navigate([item.route_url]);
//   }

//   displayErrorMsg(message: string, messageType: string): void {
//     this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
//   }

// }

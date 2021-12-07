import { Component, OnInit, Input } from '@angular/core';
import { NotificationListService } from '../../services/notification_list';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/services/common.service';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { PatientService } from 'src/app/modules/appointment/services/patient.service';
import { Router } from '@angular/router';
import { IAlert } from 'src/app/models/AlertMessage';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { OpdPatient } from 'src/app/models/opd-patient-modal';
import { IpdPatient } from 'src/app/models/ipd-patient.model';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  @Input() loadSource: string;
  notificationList = [];
  searchString: string;
  alertMsg: IAlert;
  pageNumber = 0;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  constructor(
    private notificationListService: NotificationListService,
    private commonService: CommonService,
    private patientService: PatientService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.searchString = '';
    this.subjectFun();
    this.getAllNotificationList();
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
      search_keyword: this.searchString ? this.searchString : null,
      page_number: this.pageNumber,
      limit: 30,
      status_ids: []
    };
    const module = this.commonService.selectedNavModule;
    if (module !== 'emr') {
      param.status_ids = [Constants.notificationReferPatient];
    }
    this.notificationListService.getAllNotificationList(param).subscribe(res => {
      const list = res.length ? _.map(res, n => { n.isActionPerformed = false; return n; }) : [];
      this.notificationList = !this.searchString ? this.notificationList.concat(list) : list;
    });
  }

  performActionBtnEvent(item, index) {
    this.notificationListService.updateNotificationAction(item.notification_id).subscribe(res => {
      this.notificationList[index].isActionPerformed = true;
    });
  }

  redirctPatient(item) {
    const param = {
      service_type_id: item.service_type_id,
      patient_id: item.patient_id,
      visit_no: item.visit_no
    };
    this.patientService.getPatientDataViaVisitType(param).subscribe(res => {
      this.redirctPatientDashBoard(item, res);
    });
  }

  redirctPatientDashBoard(item, res) {
    if (item.service_type_id === 1) {
      const patData = this.patientService.generateIpdPatientData([res.ipd_data]);
      this.navigateToPatient(patData[0], item);
    } else if (item.service_type_id === 2) {
      const patData = new OpdPatient();
      patData.generateObject(res.opd_data);
      this.navigateToPatient(patData, item);
    }
  }

  navigateToPatient(patient: IpdPatient | OpdPatient, item) {
    patient.type = patient.serviceType.name.toLowerCase();
    this.commonService.setActivePatientList(patient, 'add');
    if (this.commonService.getActivePatientList(patient).length <= 5) {
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'doctor_dashboard'
      };
      this.commonService.updateActivePatientList(obj);
      this.navigatePatient(item);
    } else {
      this.displayErrorMsg('Max 5 Patient Allowed', 'danger');
    }
  }

  navigatePatient(item) {
    this.router.navigate([item.route_url]);
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }

}

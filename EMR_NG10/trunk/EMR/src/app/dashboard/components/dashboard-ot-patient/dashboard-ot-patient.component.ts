import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import * as moment from 'moment';
import * as _ from 'lodash';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientService } from 'src/app/public/services/patient.service';
import { DashboardOtPatientInfoComponent } from '../dashboard-ot-patient-info/dashboard-ot-patient-info.component';
import { DashBoardService } from '../../services/dashboard.service';
import { ConsentPartialViewComponent } from 'src/app/shared/consent-partial-view/consent-partial-view.component';

@Component({
  selector: 'app-dashboard-ot-patient',
  templateUrl: './dashboard-ot-patient.component.html',
  styleUrls: ['./dashboard-ot-patient.component.scss']
})
export class DashboardOtPatientComponent implements OnInit {
  //@Input() loadSource: string;
  patientScheduleList = [];
  searchString: string;
  alertMsg: IAlert;

  selectedRoomId: any;
  roomList$ = new Observable<any>();
  roomListInput$ = new Subject<any>();
  roomList: Array<any> = [];

  filterDate: any = new Date();
  timeFormat: string = "HH:mm";
  //pageNumber = 0;
  subject: Subject<string> = new Subject();
  ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  loadList: boolean;

  constructor(private commonService: CommonService,
    private patientService: PatientService,
    private router: Router,
    private dashBoardService: DashBoardService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.searchString = '';
    this.commonService.getTimeFormatKey().then(res => {
      this.timeFormat = res;
      this.loadRoomList();
      this.getPatientOTScheduleList();
      this.subjectFun();
    });
  }

  subjectFun() {
    // -- Subscribe to the subject, which is triggered from search input and when section clicked
    // -- When the debounce time has passed, we call getAllNotificationList()
    this.subject
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        //this.pageNumber = 0;
        this.getPatientOTScheduleList();
      });
  }

  onRoomChange(event) {
    if (event) {
      this.selectedRoomId = event.roomId;
    } else {
      this.selectedRoomId = null;
    }
    this.getPatientOTScheduleList();
  }

  updateSelectedDate(val) {
    this.filterDate = new Date(val);
    this.getPatientOTScheduleList();
  }

  loadRoomList(searchTxt?) {
    this.roomList$ = concat(
      this.dashBoardService.getOTRoomBySearchKeyword(searchTxt ? searchTxt : ''), // default items
      this.roomListInput$.pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(term => this.dashBoardService.getOTRoomBySearchKeyword(term ? term : (searchTxt ? searchTxt : '')).pipe(
          catchError(() => of([]))
        ))
      )
    );
  }

  getPatientOTScheduleList() {
    const param = {
      searchKeyword: this.searchString ? this.searchString : null,
      roomId: this.selectedRoomId || 0,
      filterDate: new Date(moment(this.filterDate).format('YYYY-MM-DD'))
    };
    const timeFormat = this.timeFormat;
    this.patientService.getPatientOTScheduleList(param).subscribe((res) => {
      this.patientScheduleList = res;
      this.patientScheduleList.map(function (val) {
        val.startTime = moment(moment().format('YYYY-MM-DD') + ' ' + val.startTime).format(timeFormat);
        val.endTime = moment(moment().format('YYYY-MM-DD') + ' ' + val.endTime).format(timeFormat);
      });
      //this.patientScheduleList = !this.searchString ? this.patientScheduleList.concat(res) : res;
    });
  }

  showOTPatientInfo(appointmentInfo?) {
    const modalInstance = this.modalService.open(DashboardOtPatientInfoComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal add-edit-OT-patient-details',
        container: '#homeComponent',
        size: 'lg'
      });
    modalInstance.result.then((result) => {
      if (result === 'yes') {
        //this.getListData();
      }
    });
    modalInstance.componentInstance.appointmentInfo = _.cloneDeep(appointmentInfo);
  }

  redirctPatient(item) {
    this.patientService.getPatientActiveVisitDetail(item.patientInfo.patientId).subscribe(res => {
      if (res) {
        this.selectedPatient(res[0]);
      } else {
        this.displayErrorMsg('This patient has no IP/OP record.', 'danger');
      }
    });
  }

  selectedPatient(patient) {
    patient.type = patient.serviceType.name.toLowerCase();
    patient.loadFrom = 'OPERATIVE_NOTES';
    this.commonService.setActivePatientList(patient, 'add');
    if (this.commonService.getActivePatientList(patient).length <= 5) {
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'doctor_dashboard'
      };
      this.commonService.updateActivePatientList(obj);
      this.router.navigate(['/emr/patient/dashboard/', patient.patientData.id]);
    } else {
      this.displayErrorMsg('Max 5 Patient Allowed', 'danger');
    }
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }

  openPatientConsentPartialView(patient) {
    const patientData = {
      id: patient.patientInfo.patientId
    }
    const modalInstance = this.modalService.open(ConsentPartialViewComponent,
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

}

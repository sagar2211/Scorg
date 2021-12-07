import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { QueueService } from './../../../qms/services/queue.service';
import * as moment from 'moment';
import { IAlert } from 'src/app/models/AlertMessage';
import { AuthService } from 'src/app/services/auth.service';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { SlideInOutLogAnimation } from 'src/app/config/animations';
import { QmsQlistLibService, AppointmentBookLibComponent } from '@qms/qlist-lib';
import { environment } from 'src/environments/environment';
import { PatientAppointmentsDetailComponent } from 'src/app/shared/components/patient-appointments-detail/patient-appointments-detail.component';
import { PatientHistory } from 'src/app/modules/appointment/models/patient-history.model';
import { AppointmentHistory } from 'src/app/modules/appointment/models/appointment-history.model';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { AppointmentListModel } from 'src/app/modules/appointment/models/appointment.model';

@Component({
  selector: 'app-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.scss'],
  animations: [SlideInOutLogAnimation]
})
export class PatientHistoryComponent implements OnInit, OnChanges {

  @Input() patinetInfo;
  @Output() followUpDetails = new EventEmitter<any>();
  @Output() selectedAppointmentId = new EventEmitter<any>();
  patientHistory: PatientHistory;
  historyListByGroupYear: Array<{ year: string, data: Array<AppointmentHistory> }> = [];
  timeFormateKey = '';
  alertMsg: IAlert;
  PermissionsConstantsList: any = [];

  @Output() getAppointmentDataByEntity = new EventEmitter<any>();
  selectedPatient: any;

  constructor(
    private appointmentService: AppointmentService,
    private queueService: QueueService,
    private commonService: CommonService,
    private modelService: NgbModal,
    private authService: AuthService,
    private qmsQlistLibService: QmsQlistLibService
  ) { }

  ngOnInit() {
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    this.PermissionsConstantsList = PermissionsConstants;
    // this.appointmentService.$patAppointmentHistory.subscribe((res) => {
    this.qmsQlistLibService.$patAppointmentHistory.subscribe((res) => {
      if (res) {
        // res.appointmentTime = _.clone(this.convertTime(res.appointmentTime));
        // res.isDisable = moment(moment(res.appointmentDate).format('YYYY-MM-DD')).isSameOrAfter(moment().format('YYYY-MM-DD'));
        // const year = res.appointmentDate.getFullYear();
        // const indx = this.historyListByGroupYear.findIndex(h => +h.year === year);
        // if (indx !== -1) {
        //   const isexist = _.findIndex(this.historyListByGroupYear[indx].data, (o) => o.appointmentId === res.appointmentId);
        //   if (isexist !== -1) {
        //     this.historyListByGroupYear[indx].data[isexist] = res;
        //   }
        //   this.historyListByGroupYear[indx].data = _.orderBy(this.historyListByGroupYear[indx].data, ['appointmentDate'], ['desc']);

        // this.historyListByGroupYear[indx].data.unshift(res);
        // if (this.historyListByGroupYear[indx].data.length > 5) {
        //   this.historyListByGroupYear[indx].data.splice(this.historyListByGroupYear[indx].data.length - 1, 1);
        //   this.historyListByGroupYear[indx].data = _.orderBy(this.historyListByGroupYear[indx].data, ['appointmentDate'], ['desc']);
        // }
        // }
        this.getAppointmentHistory();
      }
    });
  }

  ngOnChanges() {
    this.getAppointmentHistory();
  }

  // getTimeFormatKey() {
  //   const userId = +this.authService.getLoggedInUserId();
  //   this.commonService.getQueueSettings(Constants.timeFormateKey, userId).subscribe(res => {
  //     this.timeFormateKey = res.time_format_key;
  //   });
  // }

  convertTime(timeVal) {
    let updateTimeVal = null;
    if (this.timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('hh:mm A');
    } else if (this.timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('HH:mm');
    }
    return updateTimeVal;
  }

  getAppointmentHistory(): void {
    if (this.patinetInfo) {
      // const entityId = entityId;
      // const entityValueId = entityValueId;
      // limitNo
      // currentpage
      this.appointmentService.getAppointmentHistoryByUhID(this.patinetInfo.pat_uhid).subscribe((res: PatientHistory) => {
        this.patientHistory = res;
        _.map(this.patientHistory.history, (t) => {
          t.isDisable = moment(moment(t.appointmentDate).format('YYYY-MM-DD')).isSameOrAfter(moment().format('YYYY-MM-DD'));
          t.appointmentTime = _.clone(this.convertTime(t.appointmentTime));
        });
        this.historyListByGroupYear = [];
        this.patientHistory.history = _.orderBy(this.patientHistory.history, ['appointmentDate'], ['desc']);
        const groupData = _.groupBy(this.patientHistory.history, (d) => d.appointmentDate.getFullYear());
        const props = Object.keys(groupData);
        props.forEach(p => {
          this.historyListByGroupYear.push({
            year: p,
            data: groupData[p]
          });
        });
        this.historyListByGroupYear = _.orderBy(this.historyListByGroupYear, ['year'], ['desc']);
      });
    } else {
      this.patientHistory = null;
      this.historyListByGroupYear = [];
    }
  }

  cancelAppointment(item) {
    const reqParams = {
      Appt_Id: item.appointmentId,
      Appt_Date: moment(item.appointmentDate).format('MM/DD/YYYY'), // MM/dd/yyyy
      Uhid: this.patinetInfo.pat_uhid,
      Remarks: ''
    };
    this.queueService.cancelBookedAppointment(reqParams).subscribe(res => {
      this.alertMsg = {
        message: 'Appointment cancelled Successfully.',
        messageType: 'success',
        duration: 3000
      };
      item.appointmentStatusId = 4;
      item.appointmentStatus = 'CANCELLED';
      item.appointmentDisplayStatus = 'CANCELLED';
    });
  }

  isShow(item, type): boolean {
    if (type === 'CANCEL') { // -- check condition for CANCEL buttons
      const dateCheck = moment(moment(item.appointmentDate).format('YYYY-MM-DD')).isSameOrAfter(moment().format('YYYY-MM-DD'));
      const apptStatus = ((item.appointmentStatus === 'TENTATIVE') || (item.appointmentStatus === 'CONFIRMED'));
      return dateCheck && apptStatus;
    } else if (type === 'FOLLOW_UP') { // -- check condition for FOLLOW UP buttons
      const apptStatus = (item.appointmentStatus === 'CONFIRMED' && item.queueStatus === 'COMPLETE');
      return apptStatus;
    } else if (type === 'BOOK') { // -- check condition for book
      const isConfirm = (item.appointmentStatus === 'CONFIRMED' && item.queueStatus === 'COMPLETE');
      const isCancel = (item.appointmentStatus === 'CANCELLED');
      return isConfirm || isCancel;
    } else {
      return false;
    }
  }

  onFollowUp(item: AppointmentHistory) {
    this.followUpDetails.next(item);
  }

  onSearchAppointmentDataByEntity(entity) {
    entity.isFromPatientAppointmentHistory = true;
    this.getAppointmentDataByEntity.emit(entity);
  }

  // -- reschedule appointment
  onReschedule(item, type: string) {
    let appointmentDetails: any = Object.assign(item, {
      entity_id: item.entityId,
      entity_value_id: item.entityValue[0].entityValueId,
      entity_value_name: item.entityValue[0].entityValueName,
      slot_id: item.slotId
    });

    appointmentDetails.slot_details = appointmentDetails;
    const appList = new AppointmentListModel();
    appList.generateObj(appointmentDetails);
    appointmentDetails = appList;
    appointmentDetails.entity_data = appointmentDetails.entity_data[0];
    appointmentDetails.entity_data.date = moment(item.appointmentDate).format('DD-MM-YYYY'); // moment().format('DD-MM-YYYY');

    const modalInstanceReschedule = this.modelService.open(AppointmentBookLibComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        container: '#homeComponent'
      });

    const modelInstance = modalInstanceReschedule.componentInstance as AppointmentBookLibComponent;
    modelInstance.patientData = {
      pat_name: this.patinetInfo.pat_name,
      pat_uhid: this.patinetInfo.pat_uhid,
      pat_gender: this.patinetInfo.pat_gender,
      pat_Age: this.patinetInfo.pat_age.toString(), // get age with appropriate unit as a string
      pat_mobileno: this.patinetInfo.pat_mobileno,
      pat_age_unit: this.patinetInfo.pat_age_unit,
      pat_dob: this.patinetInfo.pat_dob
    };
    modelInstance.selectedAppointementData = appointmentDetails;
    modelInstance.bookingData = item;
    modelInstance.source = type;
    modelInstance.environmentDetails = environment;
    modelInstance.loginUserDetails = this.authService.getUserInfoFromLocalStorage();
    modelInstance.timeFormatKey = this.timeFormateKey;
    modelInstance.appointmentDate = item.appointmentDate;
    modalInstanceReschedule.result.then((res) => {
      if (res === true) {
        // this.patientHistory = null;
        // this.historyListByGroupYear = [];
        const data = { source: 'rescheduleFromQuickBook' };
        this.commonService.bookAppEvent.next(data);
      }
    }, () => { });
  }

  showAppointmentHistory(appointmentId) {
    // const modalInstanceForAppointmentHistory = this.modelService.open(AppointmentHistoryComponent,
    //   {
    //     ariaLabelledBy: 'modal-basic-title',
    //     backdrop: 'static',
    //     keyboard: false,
    //     windowClass: 'custom-modal',
    //     size: 'lg',
    //     container: '#homeComponent'
    //   });
    // modalInstanceForAppointmentHistory.componentInstance.appointmentId = appointmentId;
    this.selectedAppointmentId.next(appointmentId);
    this.commonService.openCloselogSlider('open');
  }

  // For displaying Appointment Info
  showPatientAppointmentsDetails(item) {
    let appointmentDetails: any = Object.assign(item, {
      entity_id: item.entityId,
      entity_value_id: item.entityValue[0].entityValueId,
      entity_value_name: item.entityValue[0].entityValueName,
      slot_id: item.slotId
    });

    appointmentDetails.slot_details = appointmentDetails;
    const appList = new AppointmentListModel();
    appList.generateObj(appointmentDetails);
    appointmentDetails = appList;
    appointmentDetails.entity_data = appointmentDetails.entity_data[0];
    appointmentDetails.entity_data.date = moment(item.appointmentDate).format('DD-MM-YYYY');//moment().format('DD-MM-YYYY');
    const modalInstanceInfo = this.modelService.open(PatientAppointmentsDetailComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        container: '#homeComponent'
      });
    const modelInstance = modalInstanceInfo.componentInstance as PatientAppointmentsDetailComponent;
    modelInstance.patientData = {
      pat_name: this.patinetInfo.pat_name,
      pat_uhid: this.patinetInfo.pat_uhid,
      pat_gender: this.patinetInfo.pat_gender,
      pat_Age: this.patinetInfo.pat_age.toString(), // get age with appropriate unit as a string
      pat_mobileno: this.patinetInfo.pat_mobileno,
      pat_age_unit: this.patinetInfo.pat_age_unit,
      pat_dob: this.patinetInfo.pat_dob
    };
    modelInstance.selectedAppointementData = appointmentDetails;
    modelInstance.bookingData = item;
    modelInstance.timeFormatKey = this.timeFormateKey;
    modalInstanceInfo.result.then(() => { }, (reason) => {

    });
  }

  isAppointmentDataExist(date) {
    return moment(moment(date).format('YYYY-MM-DD')).isSameOrAfter(moment().format('YYYY-MM-DD'));
  }
}


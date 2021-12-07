import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { SliderlogDetails, LogDetailsModel, GroupLogDetailsModel } from 'src/app/shared/models/sliderlog-details';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.component.html',
  styleUrls: ['./appointment-history.component.scss']
})
export class AppointmentHistoryComponent implements OnInit {

  @Input() appointmentId: number;
  @Input() selectedPatUhid: any;
  pagination = { limit: 15, pageNo: 1 };
  notscrolly: boolean = true;
  apponitmentHistoryDetails: any = {};
  appointmentMasterLogList = [];
  constructor(
    private appointmentServcie: AppointmentService,
    public modal: NgbActiveModal,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    if (this.appointmentId || this.selectedPatUhid) {
      this.getAppointmentHistoryDetails();
    }
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   if (this.appointmentId) {
  //     this.getAppointmentHistoryDetails();
  //   }
  // }
  getpageInfo(event) {
    this.pagination.limit = event.limit;
    this.pagination.pageNo = event.pageNo;
    this.getAppointmentHistoryDetails();
  }

  getAppointmentHistoryDetails(): void {
    const params = {
      appt_id: this.appointmentId ? this.appointmentId : 0,
      uhid: this.selectedPatUhid ? this.selectedPatUhid.patUhid : '',
      limit_per_page: this.pagination.limit,
      current_page: this.pagination.pageNo
    }
    this.appointmentServcie.getAppointmentHistoryLog(params).subscribe(res => {
      this.notscrolly = false;
      if (res && res.appointment_details.length) {
        this.appointmentMasterLogList = this.appointmentMasterLogList.length > 0 ? this.appointmentMasterLogList.concat(res.appointment_details) : res.appointment_details;
        this.createAppointmentLogDisplayList();
      }
    });
  }
  createAppointmentLogDisplayList() {
    this.apponitmentHistoryDetails = {};
    const logDetails = new SliderlogDetails();
    const templogDetailsArray = [];
    logDetails.logtitile = this.appointmentId ? 'Appointment Log' : this.selectedPatUhid ? 'Patient History' : 'Appointment Log';
    logDetails.subtitle = this.selectedPatUhid ? this.selectedPatUhid.patName : '';
    _.map(this.appointmentMasterLogList, (scheduleList) => {
      const groupLogObject = new GroupLogDetailsModel();
      const groupDate = moment(scheduleList[0].AddDate).format('DD/MM/YYYY');
      const existingGroupingDate = _.findIndex(templogDetailsArray, (rec) => rec.groupDate === groupDate);
      if (existingGroupingDate === -1) {
        groupLogObject.groupDate = groupDate;
        groupLogObject.groupLogDetails = [];
      }
      _.map(scheduleList, (o) => {
        const logDetailsObject = new LogDetailsModel();
        logDetailsObject.description = o.LogDescription;
        logDetailsObject.action = o.Action;
        logDetailsObject.actionDispalyName = o.Appt_Status_DisplayName;
        logDetailsObject.updatedBy = o.Updated_By;
        logDetailsObject.updatedFor = o.Updated_For;
        logDetailsObject.date = moment(o.AddDate).format('DD/MM/YYYY');
        logDetailsObject.time = moment(o.AddDate).format('hh:mm A');
        existingGroupingDate === -1 ? groupLogObject.groupLogDetails.push(logDetailsObject) : templogDetailsArray[existingGroupingDate].groupLogDetails.push(logDetailsObject);

      });
      if (existingGroupingDate === -1) {
        templogDetailsArray.push(groupLogObject);
      }
    });
    logDetails.logDetailsList = _.orderBy(templogDetailsArray, ['groupDate'], ['desc']);
    this.apponitmentHistoryDetails = logDetails;
  }
  appOutSideClickEvent(event) {
    if (event && this.commonService.isOpen) {
      this.commonService.toggle(undefined);
    }
  }

}

import { DashBoardService } from './../../services/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import * as _ from 'lodash';



@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  appointmentData = {
    total_Confirmed: 0,
    total_noshow: 0,
    walkin_count: 0,
    total_empty: 0,
    total_count: 0,
    Empty_Percentage: 0,
    total_appointment_count: 0
  };
  patientRegistrationDetails = {
    todays_registration_count: 0,
    todays_registration_count_percent: 0,
    weekly_registration_count: 0,
    weekly_registration_count_percent: 0,
    weekly_registration_average: 0,

    todays_booking_count: 0,
    weekly_booking_count: 0,
    weekly_booking_average: 0,
    todays_booking_percent: 0,
    weekly_booking_percent: 0
  };
  opdStatsDetails = {
    ExtendedSlotsCount: 0,  // -- This is count[int]
    AbsentCount: 0,         // -- [This is %]
    LateServedCount: 0,     // -- [This is %]
    SkipCount: 0,           // -- [This is %]
    CancelledCount: 0,      // -- [This is %]
    EmptySlotsCount: 0,     // -- [This is %]
    SchExpiredCount: 0,     // -- This is count[int]
    SchWillExpireCount: 0   // -- This is count[int]
  };
  roomMappingcount: 0;
  roomMappingExpireCount: 0;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router,
    private dashboardService: DashBoardService
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.dashboardService.getTodaysAppointmentDetails().subscribe(res => {
      if (res) {
        this.appointmentData = res;
      }
    });
    this.dashboardService.getPatientBookingAndRegistrationDetails().subscribe(res => {
      if (res) {
        this.patientRegistrationDetails = res;
        if (res.todays_registration_count > 0) {
          this.patientRegistrationDetails.todays_registration_count_percent = (res.todays_registration_count / res.todays_booking_count);
        } else {
          this.patientRegistrationDetails.todays_registration_count_percent = 0;
        }
        if (res.weekly_registration_count > 0) {
          this.patientRegistrationDetails.weekly_registration_count_percent = (res.weekly_registration_count / res.weekly_booking_count);
        } else {
          this.patientRegistrationDetails.weekly_registration_count_percent = 0;
        }

        if ((this.patientRegistrationDetails.todays_booking_count &&
          this.patientRegistrationDetails.weekly_booking_average) &&
          (_.toNumber(this.patientRegistrationDetails.todays_booking_count)
            <= _.toNumber(this.patientRegistrationDetails.weekly_booking_average))) {
          this.patientRegistrationDetails.todays_booking_percent = _.toNumber((_.toNumber(this.patientRegistrationDetails.todays_booking_count)
            / _.toNumber(this.patientRegistrationDetails.weekly_booking_average) * 100).toFixed(2));
          this.patientRegistrationDetails.weekly_booking_percent = 100;
        } else if ((this.patientRegistrationDetails.todays_booking_count === 0 &&
          this.patientRegistrationDetails.weekly_booking_average)) {
          this.patientRegistrationDetails.weekly_booking_percent = 100;
          this.patientRegistrationDetails.todays_booking_percent = 0;
        } else if ((this.patientRegistrationDetails.todays_booking_count &&
          this.patientRegistrationDetails.weekly_booking_average) &&
          (_.toNumber(this.patientRegistrationDetails.todays_booking_count)
            >= _.toNumber(this.patientRegistrationDetails.weekly_booking_average))) {
          this.patientRegistrationDetails.todays_booking_percent = 100;
          this.patientRegistrationDetails.weekly_booking_percent =
            _.toNumber((_.toNumber(this.patientRegistrationDetails.weekly_booking_average)
              / _.toNumber(this.patientRegistrationDetails.todays_booking_count) * 100).toFixed(2));
        }

      }
    });
    this.dashboardService.getOPDstatsDetails().subscribe(res => {
      if (res) {
        this.opdStatsDetails = res;
      }
    });

    this.dashboardService.getRoommapstatsDetails().subscribe(res => {
      if (res.opdRoomMapStatsDetails) {
        this.roomMappingcount = res.opdRoomMapStatsDetails.RoomNotMappedCount;
        this.roomMappingExpireCount = res.opdRoomMapStatsDetails.RoomMapWillExpireCount;
      }
    });
  }
  getReport(reportName, flag?) {
    let src = '';
    const formDate = moment().format('MM/DD/YYYY');
    const toDate = moment().format('MM/DD/YYYY');
    this.commonService.setreportUrlParametes(src);
    src = '?fromdate=' + formDate + '&todate=' + toDate;
    if (flag === 'week') {
      const weekStart = moment().clone().startOf('week').format('MM/DD/YYYY');
      const weekEnd = moment().clone().endOf('week').format('MM/DD/YYYY');
      src = '?fromdate=' + weekStart + '&todate=' + weekEnd;
    }
    if (reportName === 'appointmentSummary') {
      this.router.navigate(['app/qms/reports/patientAppointmentTypeSummary']);
    } else if (reportName === 'serviceSummary') {
      this.router.navigate(['app/qms/reports/servicesSummary']);
    } else if (reportName === 'patientAppointment') {
      this.router.navigate(['app/qms/reports/patientAppointment']);
    } else if (reportName === 'patientMaster') {
      this.router.navigate(['app/qms/reports/patientMasterReport']);
    } else if (reportName === 'roomSectionMapping') {
      src = '?sectionname=All';
      this.router.navigate(['app/qms/reports/roomSectionMappingReport']);
    } else if (reportName === 'patientCancelledAppointment') {
      src = src + '&appstatus=cancelled';
      this.router.navigate(['app/qms/reports/patientAppointment']);
    } else if (reportName === 'patientNoShowAppointment') {
      src = src + '&appstatus=noshow';
      this.router.navigate(['app/qms/reports/patientAppointment']);
    } else if (reportName === 'emptySlot') {
     this.router.navigate(['app/qms/reports/serviceScheduleSummary']);
    } else if (reportName === 'patientSkip') {
      src = src + '&queuestatus=SKIP';
      this.router.navigate(['app/qms/reports/queueReport']);
    } else if (reportName === 'patientNotServed') {
      src = src + '&queuestatus=NOTSERVED';
      this.router.navigate(['app/qms/reports/queueReport']);
    }
    this.commonService.setreportUrlParametes(src);
  }

}

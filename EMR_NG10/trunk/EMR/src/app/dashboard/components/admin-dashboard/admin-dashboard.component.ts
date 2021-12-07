
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../public/services/common.service';
import * as moment from 'moment';
import { DashBoardService } from '../../services/dashboard.service';

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
    todays_booking_count_percent: 0,
    weekly_booking_average_percent: 0
  };
  opdStatsDetails = {
    ExtendedSlotsCount: 0,    // -- This is count[int]
    AbsentCount: 0,         // -- [This is %]
    LateServedCount: 0,     // -- [This is %]
    SkipCount: 0,           // -- [This is %]
    CancelledCount: 0,      // -- [This is %]
    EmptySlotsCount: 0      // -- [This is %]EmptySlotsCount
  };
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
          this.patientRegistrationDetails.weekly_registration_count_percent = 0
        }
      }
    });
    this.dashboardService.getOPDstatsDetails().subscribe(res => {
      if (res) {
        this.opdStatsDetails = res;
      }
    });
  }
  getAppointmentReport() {
    const formDate = moment().format('MM/DD/YYYY');
    const toDate = moment().format('MM/DD/YYYY');
    const src = '?fromdate=' + formDate + '&todate=' + toDate;
    this.router.navigate(['app/qms/reports/bookingReport', { path: src }]);
  }

}

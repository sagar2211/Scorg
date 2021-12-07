import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { FrontDeskDashboardData } from './../../qms/models/front-desk.model';
import { Observable, Subject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DashBoardService {

  constructor(private http: HttpClient) { }
  getFrontDeskDashboardData(userId, allowlapsedtime): Observable<FrontDeskDashboardData> {
    const param = {
      user_id: userId,
      is_lapsed_time: allowlapsedtime === 'YES' ? true : false
    };
    const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/getFrontDeskDashboardData`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        const fdDashboard = new FrontDeskDashboardData();
        fdDashboard.generateObject(res.data);
        return fdDashboard;
      } else {
        return null;
      }
    }));
  }

  getTodaysAppointmentDetails(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getTodaysAppointmentDetails`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.todays_appointments.length > 0) {
        return res.todays_appointments[0];
      } else {
        return null;
      }
    }));
  }

  getPatientBookingAndRegistrationDetails(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getTodaysBookingandRegistrationDetails`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.registrationCountDetails) {
        return res.registrationCountDetails;
      } else {
        return null;
      }
    }));
  }

  getOPDstatsDetails(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getOPDstatsDetails`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.opdStatsDetails) {
        return res.opdStatsDetails;
      } else {
        return null;
      }
    }));
  }

  getRoommapstatsDetails(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Dashboard/getOPDRoomMappedStatsDetails`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.opdRoomMapStatsDetails) {
        return res;
      } else {
        return null;
      }
    }));
  }

  getPatientTurnoutDetails(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getPatientTurnoutDetails`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.patientturnout_Details.length > 0) {
        return res.patientturnout_Details;
      } else {
        return null;
      }
    }));
  }

  getExpectedVsActualData(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getExpectedVsActualData`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getAppointmentTypeStats(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getAppointmentTypeStats`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getServiceStatsDetails(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getServiceStatsDetails`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.service_stats_details) {
        return res.service_stats_details;
      } else {
        return null;
      }
    }));
  }

  getServiceEfficiencyDetails(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/DashBoard/getServiceEfficiencyDetails`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.service_efficiency_details.length) {
        return res.service_efficiency_details;
      } else {
        return [];
      }
    }));
  }

  getOpdSlotDetails() {
    const url = `${environment.baseUrlAppointment}/Dashboard/getOPDSlotsOccupancy`;
    return this.http.get(url).pipe(map((response: any) => {
      if (response.status_message === 'Success' && response.status_code === 200) {
        return response.data;
      } else {
        return response.message;
      }
    }));
  }

  getTodaysApptSummery(param) {
    const url = `${environment.baseUrlAppointment}/DoctorDashboard/getTodaysAppointmentSummary`;
    return this.http.post(url, param).pipe(map((response: any) => {
      if (response.status_message === 'Success' && response.status_code === 200) {
        return response.todays_appointments;
      } else {
        return null;
      }
    }));
  }

  getApptWeeklyData(param) {
    const url = `${environment.baseUrlAppointment}/DoctorDashboard/getApptWeeklyData`;
    return this.http.post(url, param).pipe(map((response: any) => {
      if (response.status_message === 'Success' && response.status_code === 200) {
        return response.AppointmentData;
      } else {
        return null;
      }
    }));
  }

}

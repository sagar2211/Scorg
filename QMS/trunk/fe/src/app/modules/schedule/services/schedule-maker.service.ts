import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable, of, Subject } from 'rxjs';

@Injectable()
export class ScheduleMakerService {

  private updateHistoryDataAfterUpdateOnTimeSchedule = new Subject<any>();
  public $subcUpdateHistoryDataAfterUpdateOnTimeSchedule = this.updateHistoryDataAfterUpdateOnTimeSchedule.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  getActiveScheduleList(param) {
    const obj = {
      Limit_Per_Page: param.limit_per_page,
      Current_Page: param.current_page,
      Sort_Order: param.sort_order,
      Sort_Column: param.sort_column,
      Search_String: param.searchString,
      Entity_Id: param.selectedEntity,
      Entity_Value_Id: param.selectServiceProvider,
      Start_Date: param.startDate,
      End_Date: param.endDate,
      only_master_data: param.showOnlyNoSchedule
    };
    const reqUrl = environment.baseUrlAppointment + '/ScheduleConfig/getActiveScheduleConfigList';
    return this.http.post(reqUrl, obj).pipe(
      map((res: any) => {
        const entityList = [];
        if (res.status_code === 200 && res.status_message === 'Success' && res.active_schedules.length > 0) {
          return {
            data: this.generateActiveScheduleData(res.active_schedules),
            total_count: res.total_count
          };
        } else {
          return {
            data: [],
            total_count: 0
          };
        }
      })
    );
    // return of(this.entityDummyDataService.getActiveSchedulesArray().data);
  }

  saveEditTimeScheduleData(param) {
    const reqUrl = environment.baseUrlAppointment + '/ScheduleConfig/editAppointmentScheduleTime';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.config_id > 0) {
          return true;
        } else {
          return false;
        }
      })
    );
    // return of(this.entityDummyDataService.getActiveSchedulesArray().data);
  }

  getMoreData(param){
    const reqUrl = environment.baseUrlAppointment + '/ScheduleConfig/getScheduleTimeHistory';
    return this.http.post(reqUrl,param).pipe(map((res:any)=>{
      if(res.status_code===200){
        return res;
      }
    }));
  }

  generateActiveScheduleData(data) {
    const activeData = [];
    _.map(data, (val) => {
      const obj = {
        scheduleId: val.schedule_id,
        entity: {
          id: val.entity_id,
          name: val.entity_name,
          key: (val.entity_alias).toLowerCase()
        },
        provider: {
          id: val.entity_data_id,
          name: val.entity_data_name
        },
        activeSchedule: {
          startDate: val.start_date,
          endDate: val.end_date,
        },
        workingDays: val.week_off,
        status: val.entity_isactive
      };
      activeData.push(obj);
    });
    return activeData;
  }

  updateScheduleStatus(param) {
    const reqUrl = environment.baseUrlAppointment + '/ScheduleConfig/saveEntityActiveDeactive';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
    // return of(this.entityDummyDataService.getActiveSchedulesArray().data);
  }

  getLastAppointmentData(param): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Appointment/getLastAppointment?Entity_Id=${param.entity_id}&Entity_Value_Id=${param.entity_data_id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return false;
        }
      })
    );
    // return of(this.entityDummyDataService.getActiveSchedulesArray().data);
  }

  endAllSchedule(param): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/endSchedule`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return false;
        }
      })
    );
  }

  updateEndDateSchedule(param): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/editAppointmentScheduleEndDate`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res;
        } else {
          return false;
        }
      })
    );
  }

  updateAllHistoryData() {
    this.updateHistoryDataAfterUpdateOnTimeSchedule.next(true);
  }

  getschedulelog(param): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/getScheduleHistoryLogger`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

}

import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class EntitySettingsService {

  constructor(
    private http: HttpClient
  ) { }
  holidayList: Subject<object> = new Subject();
  public $holidayList = this.holidayList.asObservable();

  blockSlotList: Subject<object> = new Subject();
  public $blockSlotList = this.blockSlotList.asObservable();


  setHoildayListData(holidayData) {
    this.holidayList.next(holidayData);
  }
  setBlockSlotListData(blockListData) {
    this.blockSlotList.next(blockListData);
  }


  // getHolidayList(): Observable<any> {
  //   return this.holidayList.asObservable();
  // }

  saveBlockedAppointmentSettings(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/AppointmentBooking/blockAppointmentSlots';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
    // return of(this.entityDummyDataService.saveJointClinic());
  }

  checkAppointmentExistOrNot(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/AppointmentBooking/getAppointmentExist';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.is_appointment_exist;
      })
    );
    // return of(true);
  }

  saveDoctorHolidaySettings(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/ScheduleConfig/saveEntityHoliday';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getDoctorHolidaySettings(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/ScheduleConfig/getDoctorHolidayAndBlockSlotsList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getCancelAppointmentListOfDoctor(param: any): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/AppointmentBooking/getblockAppointmentSlots';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
          return res;
      })
    );
  }

  getDoctorBlockSettings(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + `/ScheduleConfig/getEntityBlockSlots?entity_id=${param.entity_id}&entityvalue_id=${param.entityvalue_id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  sendNotificationToPatient(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Patient/SendHolidayNotificationToPatients';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  updateEntityHolidaySetting(params): Observable<any> {
    let reqUrl = '';
    let param = {};
    if (_.toLower(params.block_type) === 'holiday') {
      reqUrl = environment.baseUrlAppointment + `/ScheduleConfig/editEntityHoliday`;
      param = {
        entity_holiday_id: params.id,
        is_active: !params.is_active,
        appointment_cancel_required: params.appointment_cancel_required
      };
    } else if (_.toLower(params.block_type) === 'block') {
      reqUrl = environment.baseUrlAppointment + `/ScheduleConfig/editEntityBlockSlots`;
      param = {
        entity_blockslot_id: params.id,
        is_active: !params.is_active,
        appointment_cancel_required: params.appointment_cancel_required
      };
    }
    return this.http.put(reqUrl, param).pipe(
      map((res: any) => {
        // if (res.status_code === 200 && res.status_message === 'Success' && res.message.length > 0) {
        return res;
        // }
      })
    );
  }
  updateEntityBlockSetting(params): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + `/ScheduleConfig/editEntityBlockSlots`;
    return this.http.put(reqUrl, params).pipe(
      map((res: any) => {
        // if (res.status_code === 200 && res.status_message === 'Success' && res.message.length > 0) {
        return res;
        // }
      })
    );
  }

  getRoleTypeIdFromProvidersArray(data) {
    const findProviderData = _.find(data.provider_info, pv => {
      return data.role_type === pv.providerTypeName;
    });
    if (_.isUndefined(findProviderData)) {
      return data.roletype_id;
    } else {
      return findProviderData.providerId;
    }
  }
}

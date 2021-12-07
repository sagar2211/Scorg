import { ApppointmentSuccessModel } from './../models/appointment-success.model';
import { EntityBasicInfoService } from './../../schedule/services/entity-basic-info.service';
import { AppointmentTimeSlots } from './../models/appointment-time-slot.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';


import { AppointmentListModel } from './../models/appointment.model';
import { AppointmentType } from './../../schedule/models/appointment-type.model';
import { environment } from './../../../../environments/environment';
import { SlotInfo } from './../models/slot-info.model';
import { Service } from './../../schedule/models/service.model';
import { PatientHistory } from './../models/patient-history.model';
import { AppointmentEntityInfoModel } from './../models/appointment-entity-info.model';
import { AppointmentHistory } from './../models/appointment-history.model';
import { CommonService } from 'src/app/services/common.service';
import { GetAppointmentListByEntity, GetAppointmentSlot } from './../../../models/all-api-service-request.model';
import { VisitType } from '../../schedule/models/visit-type.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  viitTypeMaster = [];


  patientInfo: Subject<object> = new Subject();
  public $patientInfo = this.patientInfo.asObservable();

  patAppointmentHistory: Subject<any> = new Subject<any>();
  public $patAppointmentHistory = this.patAppointmentHistory.asObservable();

  // To clear all form
  clearFormOnBookAppointment: Subject<any> = new Subject<any>();
  public $subClearFormOnBookAppointment = this.clearFormOnBookAppointment.asObservable();

  patientMasterData: Array<PatientHistory> = [];
  appointmentTypesByEntity: Array<{ entityId: number, entityValueId: number, typeList: Array<AppointmentType> }> = [];

  slotViewDetails: Subject<any> = new Subject<any>();
  public $slotViewDetailsPopClose = this.slotViewDetails.asObservable();

  constructor(
    private http: HttpClient,
    private entityBasicInfoService: EntityBasicInfoService,
    private commonService: CommonService
  ) { }

  slotViewclosepopup(msg: boolean) {
    this.slotViewDetails.next(msg);
  }

  getPatientList(limitTo: number, searchText: string): Observable<any> {
    const reqParams = {
      limit: limitTo,
      search_text: searchText
    };
    const reqUrl = environment.baseUrlAppointment + '/patient/getPatientData';
    return this.http.post(reqUrl, reqParams);
  }

  getAppointmentTypeByEntity(entityId, serviceProviderId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Appointment/getAppointmentTypesByEntity?Entity_Id=${entityId}&Entity_Value_Id=${serviceProviderId}`;
    if (this.getAppTypeListByEntity(entityId, serviceProviderId).length) {
      return of(this.getAppTypeListByEntity(entityId, serviceProviderId));
    } else {
      return this.http.get(reqUrl).pipe(map((res: any) => {
        const temp = [];
        if (res.Appointment_Types == null) {
          res.Appointment_Types = [];
        }
        res.Appointment_Types.forEach(element => {
          const appointment = new AppointmentType();
          appointment.generateObject(element);
          temp.push(appointment);
        });
        this.setAppTypeByEntityId(temp, entityId, serviceProviderId);
        return temp;
      }));
    }
  }

  getAppointmentListByEntity(reqParams: GetAppointmentListByEntity): Observable<any> {
    reqParams.start_time = this.commonService.convertTime('24_hour', reqParams.start_time);
    const reqUrl = `${environment.baseUrlAppointment}/appointment/getAppointmentListByEntity`;
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {
      if (r.status_message === 'Success') {
        if (r.appointment_data.length > 0) {
          r.appointment_data = _.sortBy(r.appointment_data, "entity_value_name");
        }
        const temp = [];
        r.appointment_data.forEach(element => {
          const app = new AppointmentListModel();
          app.generateObj(element);
          temp.push(app);
        });
        const obj = {
          appointment_List: temp,
          advanceBookingDays: r.arp_days
        };
        return obj;
      } else {
        return [];
      }
    }));
  }

  getAvailableAppointmentTimeSlot(reqParams: GetAppointmentSlot): Observable<AppointmentTimeSlots> {
    reqParams.start_time = this.commonService.convertTime('24_hour', reqParams.start_time);
    const reqUrl = `${environment.baseUrlAppointment}/Appointment/getAppointmentSlot`;
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {
      if (r.status_message === 'Success') {
        const appointmentSlots = new AppointmentTimeSlots();
        appointmentSlots.generateObject(r.entity_data);
        return appointmentSlots;
      } else {
        return null;
      }
    }));
  }

  setPatientInfo(patientInfo) {
    this.patientInfo.next(patientInfo);
  }

  clearAllFormsValue(val) {
    this.clearFormOnBookAppointment.next(val);
  }

  saveAppointmentBooking(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/saveAppointmentBooking`;
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {
      if (r.status_message === 'Success') {
        const res = new ApppointmentSuccessModel();
        res.generateObject(r);
        return res;
      } else {
        return null;
      }
    }));
  }

  getServiceProviderDetails($reqParams) {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/getScheduleInstructionsRuleData`;
    return this.http.post(reqUrl, $reqParams).pipe(map((r: any) => {
      return r;
    }));
  }

  getServiceList(entityId: number, serviceProviderId: number) {
    const reqUrl = `${environment.baseUrlAppointment}/Appointment/getService?entity_id=${entityId}&service_provider_id=${serviceProviderId}`;
    return this.http.get(reqUrl).pipe(map((r: any) => {
      const temp = [];
      if (r.status_message === 'Success') {
        r.service.forEach(element => {
          const service = new Service();
          service.generateObject(element);
          temp.push({ ...service });
        });
        return temp;
      } else {
        return temp;
      }
    }));
  }
  getEntityServices(entityId: number, serviceProviderId: number, searchText: string, slotID: number) {
    const reqUrl = `${environment.baseUrlAppointment}/ScheduleConfig/getEntityServices`;
    const reqParam = {
      entity_id: entityId,
      entity_value_id: serviceProviderId,
      search_text: searchText,
      app_slot_id: slotID
    };
    return this.http.post(reqUrl, reqParam).pipe(map((r: any) => {
      const temp = [];
      if (r.status_message === 'Success') {
        r.services_details.forEach(element => {
          const service = new Service();
          service.generateObject(element);
          temp.push({ ...service });
        });
        r.serviceList = temp;
        return r;
      } else {
        return r;
      }
    }));
  }
  getAppointmentHistoryByUhID(patUhId: number, limitNo?: number, currentpage?: number, entityId?: number, entityValueId?: number): Observable<PatientHistory> {
    const reqParam = {
      Uhid: patUhId,
      limit: limitNo,
      entity_id: entityId,
      entity_value_id: entityValueId,
      current_page: currentpage
    };
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/getAppointmentHistoryByUHID`;
    return this.http.post(reqUrl, reqParam).pipe(map((r: any) => {
      if (r.status_message === 'Success') {
        const pathistory = new PatientHistory();
        pathistory.generateObject(r.Appointment_Types);
        this.setPatientHistoryDataToLocal(pathistory);
        return pathistory;
      } else {
        return null;
      }
    }));
  }

  setPatientHistoryDataToLocal(pathistory: PatientHistory): void {
    let isDataExist = _.find(this.patientMasterData, (pm) => pm.uhid === pathistory.uhid);
    if (_.isUndefined(isDataExist)) {
      this.patientMasterData.push(pathistory);
    } else {
      isDataExist = { ...pathistory };
    }
  }

  getPatientHistoryDataFromLocal(uhid: number): PatientHistory {
    const indx = _.findIndex(this.patientMasterData, (pm: PatientHistory) => +pm.uhid === +uhid);
    if (indx !== -1) {
      const dt = { ...this.patientMasterData[indx] };
      return dt as PatientHistory;
    } else {
      return null;
    }
  }

  // -- merge booking data to patient appointment history
  prepaireBookingDataToAppHistory(patientData, appointmentData: AppointmentListModel, slotData: SlotInfo): void {
    const entityData = this.entityBasicInfoService.getEnityDetailsById(appointmentData.entity_id);
    const entity = appointmentData.entity_data as AppointmentEntityInfoModel;
    const indx = _.findIndex(this.patientMasterData, (pm: PatientHistory) => +pm.uhid === +patientData.pat_uhid);

    if (indx !== -1) {
      const appHistory = new AppointmentHistory();
      const data = this.patientMasterData[indx];
      const obj = {
        Appt_Id: slotData['id'],
        Entity_Id: appointmentData.entity_id,
        Appointment_Date: entity.date,
        appointmentTime: slotData.slotTime,
        entityName: entityData.name,
        entityValue: [],
        appt_status: slotData.appointmentStatus,
        appointmentDisplayStatus: slotData.appointmentDisplayStatus
      };
      if (entityData.id === 1) { // -- service provider
        obj.entityValue = [''];
      } else if (entityData.id === 2) { // -- doctor
        obj.entityValue = [{ entityValueId: appointmentData.entity_value_id, entity_value_name: appointmentData.entity_value_name }];
      } else { // - joint clinic
        obj.entityValue = [{ entityValueId: appointmentData.entity_value_id, entity_value_name: appointmentData.entity_value_name }];
      }
      appHistory.generateObject({ ...obj });
      this.patAppointmentHistory.next(appHistory); // send event to patient history component
      data.history.unshift(appHistory);
      if (data.history.length > 5) {
        data.history.splice(data.history.length - 1, 1);
        data.history = _.orderBy(data.history, ['appointmentDate'], ['desc']);
      }
    } else {

    }
  }

  // -- quick booking
  savePatientAppointmentinQueue(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/savePatientAppointmentinQueue`;
    return this.http.post(reqUrl, reqParams).pipe(map((r: any) => {
      if (r.status_message === 'Success') {
        const res = new ApppointmentSuccessModel();
        res.generateObject(r);
        return res;
      } else {
        return null;
      }
    }));
  }

  setAppTypeByEntityId(data, entityId, entityValueId): void {
    const indx = this.appointmentTypesByEntity.findIndex((a: any) => a.entityId === entityId && a.entityValueId === entityValueId);
    if (indx !== -1) {
      this.appointmentTypesByEntity[indx].typeList = data;
    } else {
      this.appointmentTypesByEntity.push({
        entityId, entityValueId, typeList: data
      });
    }
  }

  getAppTypeListByEntity(entityId, entityValueId): Array<AppointmentType> {
    const indx = this.appointmentTypesByEntity.findIndex((a: any) => a.entityId === entityId && a.entityValueId === entityValueId);
    if (indx !== -1) {
      return this.appointmentTypesByEntity[indx].typeList;
    } else {
      return [];
    }
  }

  confirmBulkBookedAppointment(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/confirmBulkBookedAppointment`;
    return this.http.post(reqUrl, reqParams);
  }

  updateAppointmentNotes(reqParams): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/updateAppointmentNotes`;
    return this.http.post(reqUrl, reqParams);
  }

  getServiceByAppointmentId(appointmentId): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/getServiceByAppointmentId?appointment_id=${appointmentId}`;
    return this.http.get(reqUrl).pipe(map((r: any) => {
      if (r.status_message === 'Success') {
        return r.ServiceByAppointmentId;
      } else {
        return null;
      }
    }));
  }

  getAppointmentHistoryLog(params) {
    const reqUrl = `${environment.baseUrlAppointment}/AppointmentBooking/getAppointmentHistoryLogger`;
    return this.http.post(reqUrl, params).pipe(map((r: any) => {
      if (r.status_message === 'Success') {
        return r.appointment_details;
      } else {
        return null;
      }
    }));
  }

  getVisitType(): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/Appointment/getVisitType`;
    if (this.viitTypeMaster.length) {
      return of(this.viitTypeMaster);
    } else {
      return this.http.get(reqUrl).pipe(map((r: any) => {
        if (r.status_message === 'Success') {
          const temp = [];
          r.visit_type_details.forEach(element => {
            const arr = new VisitType();
            arr.generateObject({ ...element });
            if (element.is_active) {
              temp.push(arr);
            }
          });
          this.viitTypeMaster = temp;
          return temp;
        } else {
          return null;
        }
      }));
    }
  }
}

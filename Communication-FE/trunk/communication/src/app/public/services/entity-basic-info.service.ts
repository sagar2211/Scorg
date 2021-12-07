import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Entity, Speciality, ServiceProvider, Doctor, JointClinic } from '@qms/qlist-lib';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ScheduleType } from '../models/schedule-type.model';
import { Service } from '../models/service.model';
import { UsersService } from './users.service';
import { AppointmentType } from 'src/app/modules/communication/models/appointment-type.model';


@Injectable({
  providedIn: 'root'
})
export class EntityBasicInfoService {
  entityList: Array<Entity> = [];
  appointmentTypeList: AppointmentType[] = [];
  scheduleTypelist: ScheduleType[] = [];
  specialityList: Speciality[] = [];
  activeScheduleDataForEdit = {};

  constructor(
    private http: HttpClient,
    // private entityDummyDataService: EntitityDummyDataService,
    private usersService: UsersService
  ) { }

  getAllEntityList(): Observable<Array<Entity>> {
    if (this.entityList.length === 0) {
      const reqUrl = environment.baseUrlAppointment + '/Appointment/getAppointmentEntity';
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          const entityList = [];
          if (res.status_code === 200 && res.status_message === 'Success' && res.appointment_entity.length > 0) {
            _.map(res.appointment_entity, (val, key) => {
              const entityData = new Entity();
              if (entityData.isObjectValid(val)) {
                val.entity_alias = val.entity_alias.toLowerCase();
                entityData.generateObject(val);
                entityList.push(entityData);
              }
            });
          }
          this.entityList = entityList;
          return entityList;
        })
      );
    } else {
      return of(this.entityList);
    }
  }

  getAllServiceProviderList(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Appointment/getAppointmentEntityData';
    const reqParam = {
      entity_id: param.id,
      limit: param.limit,
      speciality_id: param.specialityId || undefined,
      search_text: param.search_text || undefined,
    };
    return this.http.post(reqUrl, reqParam).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.entity_data.length > 0) {
          const data = [];
          _.map(res.entity_data, (val, key) => {
            if (_.toNumber(reqParam.entity_id) === 1) {
              const serviceProvider = new ServiceProvider();
              if (serviceProvider.isObjectValid(val)) {
                serviceProvider.generateObject(val);
                data.push(serviceProvider);
              }
            } else if (_.toNumber(reqParam.entity_id) === 2) {
              const doctor = new Doctor();
              if (doctor.isObjectValid(val)) {
                doctor.generateObject(val);
                data.push(doctor);
              }
            } else if (_.toNumber(reqParam.entity_id) === 3) {
              const jointClinic = new JointClinic();
              if (jointClinic.isObjectValid(val)) {
                jointClinic.generateObject(val);
                data.push(jointClinic);
              }
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
    // return of(this.entityDummyDataService.getServiceProviderListArray());
  }

  // getAllDoctorList(param): Observable<any> {
  //   return of(this.entityDummyDataService.getDoctorListArray());
  // }

  getAppointmentTypeList(param): Observable<any> {
    if (this.appointmentTypeList.length === 0) {
      const reqUrl = environment.baseUrlAppointment + '/Appointment/getAppointmentType';
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          const appointmentTypeList = [];
          if (res.status_code === 200 && res.status_message === 'Success' && res.appointment_type.length > 0) {
            _.map(res.appointment_type, (val, key) => {
              const appointmentType = new AppointmentType();
              if (appointmentType.isObjectValid(val)) {
                appointmentType.generateObject(val);
                appointmentTypeList.push(appointmentType);
              }
            });
          }
          this.appointmentTypeList = appointmentTypeList;
          return appointmentTypeList;
        })
      );
    } else {
      return of(this.appointmentTypeList);
    }
  }
  saveJointClinic(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/JointClinic/saveJointClinic';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.message.length > 0) {
          return res.message;
        }
      })
    );
  }

  getSelectJointClinicDoctorsList(param): Observable<any> {
    const reqUrl = `${environment.baseUrlAppointment}/JointClinic/getDoctorsOfJointClinic?id=${param.jointClinicId}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && !_.isEmpty(res.jointClinicDetail)) {
          return res.jointClinicDetail;
        }
      })
    );
  }

  getScheduleTypeList(): Observable<any> {
    if (this.scheduleTypelist.length === 0) {
      const reqUrl = environment.baseUrlAppointment + '/Appointment/getTokenType';
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          const scheduleTypelist = [];
          if (res.status_code === 200 && res.status_message === 'Success' && res.token_type.length > 0) {
            _.map(res.token_type, (val, key) => {
              const scheduleType = new ScheduleType();
              if (scheduleType.isObjectValid(val)) {
                scheduleType.generateObject(val);
                scheduleTypelist.push(scheduleType);
              }
            });
          }
          this.scheduleTypelist = scheduleTypelist;
          return scheduleTypelist;
        })
      );
    } else {
      return of(this.scheduleTypelist);
    }
  }

  getSpecialityListData(param): Observable<any> {
    param['limit'] = 200;
    return this.usersService.getSpecialities(param).pipe(
      map((res: any) => {
        return res.specialties;
      })
    );
  }

  checkJointClinicNameExist(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/JointClinic/checkDuplicateJointClinic';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          return res.message;
        }
      })
    );
  }

  // -- Get Entity details by Id like DOCTOR, JOINT CLINIC or SERVICE PROVIDER ETC
  getEnityDetailsById(id: number): any {
    const indx = _.findIndex(this.entityList, (e) => e.id === id);
    if (indx !== -1) {
      return this.entityList[indx];
    } else {
      return this.getAllEntityList().pipe(map((res: Array<Entity>) => {
        const i = _.findIndex(res, (e) => e.id === id);
        if (i !== -1) {
          return this.entityList[i];
        }
      }));
    }
  }

  // -- update joint clinic
  updateJointClinic(reqParams): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/JointClinic/editJointClinic';
    return this.http.put(reqUrl, reqParams);
  }
  getServiceListByNameArray(param): Observable<any> {
    const reqUrl = environment.baseUrlAppointment + '/Appointment/getServiceSearchByName';
    const reqParam = {
      entity_id: param.entity_id,
      service_provider_id: param.service_provider_id,
      search_text: param.search_text || '',
      limit: param.limit || 20
    };
    return this.http.post(reqUrl, reqParam).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success') {
          const serviceList = [];
          _.map(res.service, (val, index) => {
            const service = new Service();
            if (service.isObjectValid(val)) {
              service.generateObject(val);
              serviceList.push(service);
            }
          });
          return serviceList;
        } else {
          return [];
        }
      })
    );
  }

}

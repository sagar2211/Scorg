import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Roles } from '../models/roles';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Doctors } from '../models/doctors';
import { DoctorMapping } from '../models/doctor-mapping';

@Injectable({
  providedIn: 'root'
})
export class DoctorMappingService {
  docRoleMasterList = [];

  constructor(
    private http: HttpClient,
  ) { }

  getDoctorMappingList(param: any): Observable<any> {
    // const res = this.data;
    const reqUrl = environment.baseUrl + '/DoctorMapping/getMappedDoctorList';
    const doctorMappingModel = new DoctorMapping();
    const doctors: Array<DoctorMapping> = [];
    return this.http.post(reqUrl, param).pipe(
      // tslint:disable-next-line: no-shadowed-variable
      map((res: any) => {
        if (res.doctor_mapping_list.length > 0) {
          res.doctor_mapping_list.forEach((obj, index) => {
             // check if object is valid. If valid generate.
            //  obj.mapped_user.map(o => {
            //     o.mapping_from_date = o.mapping_from_date != null ? moment(o.mapping_from_date).format('DD/MM/YYYY') : null;
            //     o.mapping_to_date = o.mapping_to_date != null ? moment(o.mapping_to_date).format('DD/MM/YYYY') : null;
            // });
             doctorMappingModel.generateObject(obj);
             doctors.push(Object.assign({}, doctorMappingModel));
          });
        }
        res.doctor_mapping_list = doctors;
        return res;
      })
    );
  }

  getAllDoctorRoles(): Observable<any> {
    const reqUrl = environment.baseUrl + '/DoctorMapping/getAllDoctorRoles';
    const roleMastertModel = new Roles();
    const rolesMasterList: Array<Roles> = [];
    if (this.docRoleMasterList.length) {
      return of(this.docRoleMasterList);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          res.DoctorRoles.forEach((obj, index) => {
            if (roleMastertModel.isObjectValid(obj)) {
              roleMastertModel.generateObject(obj);
              rolesMasterList.push(Object.assign({}, roleMastertModel));
            }
          });
          res.rolesList = rolesMasterList;
          this.docRoleMasterList = res;
          return res;
        })
      );
    }
  }
  getDoctorList(param): Observable<any> {
    const reqUrl = `${environment.baseUrl}/DoctorMapping/getDoctors?department_id=${param.department_id}`;
    const doctorModel = new Doctors();
    const doctorModelList: Array<Doctors> = [];
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.DoctorList) {
          res.DoctorList.forEach((obj, index) => {
            doctorModel.generateObj(obj);
            doctorModelList.push(Object.assign({}, doctorModel));
          });
          res.doctorList = doctorModelList;
        } else {
          res.doctorList = [];
        }
        return res;
      })
    );
  }

  getDoctorMappingDetails(param): Observable<any> {
    const reqUrl = `${environment.baseUrl}/DoctorMapping/getMappedDoctors?doctor_id=${param}`;
    const doctorMappingModel = new DoctorMapping();
    const doctorMappingList: Array<DoctorMapping> = [];
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.doctor_mapping_list && res.doctor_mapping_list.mapped_user) {
          doctorMappingModel.generateObject(res.doctor_mapping_list);
          doctorMappingList.push(Object.assign({}, doctorMappingModel));
          res.doctormappinglist = doctorMappingList;
        } else {
          res.doctormappinglist = [];
        }
        return res;
      })
    );
  }

  saveDoctorMapping(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/DoctorMapping/saveDoctorMapping';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  updateDoctorMapping(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/DoctorMapping/editDoctorMapping';
    return this.http.put(reqUrl, param).pipe(
      map((res: any) => {
        console.log(param);
        return res;
      })
    );
  }
  getAllDoctorList(): Observable<any> {
    const reqUrl = environment.baseUrl + '/DoctorMapping/saveDoctorMapping';
    const doctorModel = new Doctors();
    const doctorModelList: Array<Doctors> = [];
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        res.DoctorList.forEach((obj, index) => {
          doctorModel.generateObj(obj);
          doctorModelList.push(Object.assign({}, doctorModel));
        });
        res.doctorList = doctorModelList;
        return res;
      })
    );
  }

  // doctor mapping list
  getDoctors(): Observable<any> {
    const reqUrl = environment.baseUrl + '/DoctorMapping/getDoctors';
    const doctorModel = new Doctors();
    const doctorModelList: Array<Doctors> = [];
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.DoctorList.length > 0) {
          res.DoctorList.forEach((obj, index) => {
            doctorModel.generateObj(obj);
            doctorModelList.push(Object.assign({}, doctorModel));
          });
          res.doctorList = doctorModelList;
        } else {
          res.doctorList = [];
        }
        return res;
      })
    );
  }
}

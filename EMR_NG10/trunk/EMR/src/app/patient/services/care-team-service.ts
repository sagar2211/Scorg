import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { CareTeamModel } from '../models/care-team/care-team-model';

@Injectable({providedIn: 'root'})
export class CareTeamService {
    constructor(
        private http: HttpClient
    ) { }

    getCareTeamDetails(serviceTypeId: number, patientId: string, visitNo: string): Observable<any> {
      const requestObj = {
        service_type_id: serviceTypeId,
        patient_id: patientId,
        visit_no: visitNo,
        care_team_data: []
      };
      const reqUrl = `${environment.dashboardBaseURL}/CareTeam/GetCareTeamDetails`;
      return this.http.post(reqUrl, requestObj).pipe(map((res: any) => {
            if (res.status_message === 'Success') {
                const temp = [];
                res.data.forEach(element => {
                    const careTeam = new CareTeamModel();
                    element.is_saved = true;
                    careTeam.generateObject(element);
                    temp.push({ ...careTeam });
                });
                return temp;
            } else {
                return [];
            }
        }));
    }

    SaveCareTeamDetails(serviceTypeId: number, patientId: string, visitNo: string, careTeamData: CareTeamModel[]): Observable<any> {
      const saveObj = {
          service_type_id: serviceTypeId,
          patient_id: patientId,
          visit_no: visitNo,
          care_team_data: []
        };
      saveObj.care_team_data = _.map(careTeamData, (element) => {
          return {
            user_id: element.userId,
            is_primary_doctor: element.isPrimaryDoctor,
            mapping_date: element.mappingDate
          };
        });

      const reqUrl = `${environment.dashboardBaseURL}/CareTeam/SaveCareTeamDetails`;
      return this.http.post(reqUrl, saveObj).pipe(map((res: any) => {
            return res;
        }));
    }


}

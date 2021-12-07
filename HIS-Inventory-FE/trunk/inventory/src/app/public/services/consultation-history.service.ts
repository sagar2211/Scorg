import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IcutempdataService } from './icutempdata.service';
import { environment } from 'src/environments/environment';
import { ScoreTemplateService } from './score-template.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultationHistoryService {
  masterHistoryData: any[] = [];
  historyDetailsByFormId: any[] = [];

  // for history filter popup
  patientHistoryFilterValue = [];
  // historyObj = {
  //   patientId: null,
  //   chartDateArray: [],
  //   careTeamList: [],
  //   componentList: []
  // };

  patientActiveFilterSet = [];
  // filterObj = {
  //   patientId: null,
  //   type: null,
  //   chartDateArray: [],
  //   careTeamList: [],
  //   componentList:[]
  // };

  patientDocumentDetailArray = [];
  constructor(
    private http: HttpClient,
    private icutempdataService: IcutempdataService,
    private scoretemplateService: ScoreTemplateService,
  ) { }

  generateTreeParentNode(treeData) {
    const treAry = [];
    _.map(treeData, (tre, pi) => {
      const treObj = {
        name: tre.serviceTypeName,
        id: 'node_' + pi,
        children: [],
        value: {
          type: 'node_1',
          data: tre,
          serviceType: tre.serviceTypeId,
          dateTime: null,
          visitNo: null,
        },
        isExpanded: pi === 0 ? true : false,
        isActive: false,
        isCollapsed: pi === 0 ? false : true,
        hasChildren: true,
      };
      _.map(tre.dateData, (dt, di) => {
        const treObjCh1 = {
          name: moment(dt.visitDate).format('YYYY-MM-DD hh:mm A'),
          id: 'node_' + pi + '_' + di,
          children: [],
          value: {
            type: 'node_2',
            data: dt,
            serviceType: tre.serviceTypeId,
            dateTime: moment(dt.visitDate).format('YYYY-MM-DD hh:mm A'),
            visitNo: dt.visitNo,
          },
          isExpanded: pi === 0 && di === 0 ? true : false,
          isActive: false,
          hasChildren: true,
          isCollapsed: pi === 0 && di === 0 ? false : true,
        };
        _.map(dt.categoryData, (ct, ci) => {
          if (ct.isHideCategory) {
            _.map(ct.documentData, (doc, doci) => {
              const treObjCh3 = {
                name: doc.documentName,
                id: 'node_' + pi + '_' + di + '_' + ci + '_' + doci,
                children: [],
                value: {
                  type: 'node_4',
                  data: doc,
                  serviceType: tre.serviceTypeId,
                  dateTime: moment(dt.visitDate).format('YYYY-MM-DD hh:mm A'),
                  visitNo: dt.visitNo,
                  hashId: 'tree' + '_right_' + tre.serviceTypeId + '_' + doc.documentType + '_' + dt.visitNo + '_' + doc.emrReferenceId
                },
                isActive: pi === 0 && di === 0 && ci === 0 && doci === 0 ? true : false,
              };
              treObjCh1.children.push(treObjCh3);
            });
          } else {
            const treObjCh2 = {
              name: ct.categoryName,
              id: 'node_' + pi + '_' + di + '_' + ci,
              children: [],
              value: {
                type: 'node_3',
                data: ct,
                serviceType: tre.serviceTypeId,
                dateTime: moment(dt.visitDate).format('YYYY-MM-DD hh:mm A'),
                visitNo: dt.visitNo,
              },
              isExpanded: pi === 0 && di === 0 && ci === 0 ? true : false,
              hasChildren: true,
              isCollapsed: pi === 0 && di === 0 && ci === 0 ? false : true,
              isActive: false,
            };
            _.map(ct.documentData, (doc, doci) => {
              const treObjCh3 = {
                name: doc.documentName,
                id: 'node_' + pi + '_' + di + '_' + ci + '_' + doci,
                children: [],
                value: {
                  type: 'node_4',
                  data: doc,
                  serviceType: tre.serviceTypeId,
                  dateTime: moment(dt.visitDate).format('YYYY-MM-DD hh:mm A'),
                  visitNo: dt.visitNo,
                  hashId: 'tree' + '_right_' + tre.serviceTypeId + '_' + doc.documentType + '_' + dt.visitNo + '_' + doc.emrReferenceId
                },
                isActive: pi === 0 && di === 0 && ci === 0 && doci === 0 ? true : false,
              };
              treObjCh2.children.push(treObjCh3);
            });
            treObjCh1.children.push(treObjCh2);
          }
        });
        if (dt.categoryData.length === 0) {
          treObjCh1['hasChildren'] = true;
          treObjCh1.children = null;
        }
        treObj.children.push(treObjCh1);
      });
      treAry.push(treObj);
    });
    return treAry;
  }

  // API for get history related data

  getActiveFilterDataById(patientId, type, isObser?: boolean) {
    const findDataIndx = _.findIndex(this.patientActiveFilterSet, data => {
      return (_.toNumber(data.patientId) === patientId && data.type === type);
    });
    if (findDataIndx !== -1) {
      return isObser ? of(this.patientActiveFilterSet[findDataIndx]) : this.patientActiveFilterSet[findDataIndx];
    } else {
      return isObser ? of(null) : null;
    }
  }

  setActiveFilterDataById(data) {
    const findDataIndx = _.findIndex(this.patientActiveFilterSet, dt => {
      return dt.patientId === data.patientId;
    });
    if (findDataIndx !== -1) {
      this.patientActiveFilterSet[findDataIndx] = data;
    } else {
      this.patientActiveFilterSet.push(data);
    }
  }

  getHistorDataByKey(patientId, key?: string, isObser?: boolean) {
    const findDataIndx = _.findIndex(this.patientHistoryFilterValue, data => {
      return data.patientId === patientId;
    });
    if (findDataIndx !== -1) {
      if (key) {
        return isObser ? of(this.patientHistoryFilterValue[findDataIndx][key]) : this.patientHistoryFilterValue[findDataIndx][key];
      } else {
        return isObser ? of(this.patientHistoryFilterValue[findDataIndx]) : this.patientHistoryFilterValue[findDataIndx];
      }
    } else {
      return isObser ? of(null) : null;
    }
  }

  setHistoryPatientData(patientId, key, data) {
    const findDataIndx = _.findIndex(this.patientHistoryFilterValue, dt => {
      return dt.patientId === patientId;
    });
    if (findDataIndx !== -1) {
      this.patientHistoryFilterValue[findDataIndx][key] = data;
    } else {
      const historyObj = {
        patientId: null,
        chartDateArray: [],
        careTeamList: []
      };
      historyObj.patientId = patientId;
      historyObj[key] = data;
      this.patientHistoryFilterValue.push(historyObj);
    }
  }

  getAllPatientVisitDates(param): Observable<any> {
    const data = this.getHistorDataByKey(param.patient_id, 'chartDateArray', false);
    if (data && data.length > 0) {
      return of(data);
    } else {
      const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitDates`;
      return this.http.post(reqUrl, param).pipe(map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          this.setHistoryPatientData(param.patient_id, 'chartDateArray', res.data);
          return res.data;
        } else {
          return [];
        }
      }));
    }
  }

  getAllPatientCareTeam(param): Observable<any> {
    const data = this.getHistorDataByKey(param.patient_id, 'careTeamList', false);
    if (data && data.length > 0) {
      return of(data);
    } else {
      const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitDoctors`;
      return this.http.post(reqUrl, param).pipe(map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          this.setHistoryPatientData(param.patient_id, 'careTeamList', res.data);
          return res.data;
        } else {
          return [];
        }
      }));
    }
  }

  getPatientVisitHistory(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitHistory`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getPatientVisitHistoryTreeNode(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientHistoryTree`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res;
      } else {
        return null;
      }
    }));
  }

  getPatientVisitTreeData(param): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientVisitTreeData`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getPatientDocumentDetails(param): Observable<any> {
    if (this.getPatientPatientDocument(param)) {
      return of(this.getPatientPatientDocument(param));
    }
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientDocumentDetails`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
        this.updatePatientPatientDocument(param, res.data);
        return res.data;
      } else {
        return [];
      }
    }));
  }

  updatePatientPatientDocument(param, resData) {
    const indx = _.findIndex(this.patientDocumentDetailArray, dt => {
      return dt.patientId === param.patientId
        && dt.visitNo === param.visitNo
        && dt.documentType === param.documentType
        && dt.dmsReferenceId === param.dmsReferenceId
        && dt.emrReferenceId === param.emrReferenceId
        && dt.serviceTypeId === param.serviceTypeId;
    });
    if (indx === -1) {
      const obj = {
        patientId: param.patientId,
        serviceTypeId: param.serviceTypeId,
        visitNo: param.visitNo,
        documentType: param.documentType,
        dmsReferenceId: param.dmsReferenceId,
        emrReferenceId: param.emrReferenceId,
        data: resData
      };
      this.patientDocumentDetailArray.push(obj);
    }
  }

  getPatientPatientDocument(param) {
    const indx = _.findIndex(this.patientDocumentDetailArray, dt => {
      return dt.patientId === param.patientId
        && dt.visitNo === param.visitNo
        && dt.documentType === param.documentType
        && dt.dmsReferenceId === param.dmsReferenceId
        && dt.emrReferenceId === param.emrReferenceId
        && dt.serviceTypeId === param.serviceTypeId;
    });
    if (indx !== -1) {
      return this.patientDocumentDetailArray[indx].data;
    } else {
      return null;
    }
  }

}

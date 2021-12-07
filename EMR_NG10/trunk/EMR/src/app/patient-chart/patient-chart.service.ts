import { map } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ExaminationTags } from './../public/models/examination-tags';
import { Constants } from '../config/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CopyPrescriptionChartListComponent } from './components/copy-prescription-chart-list/copy-prescription-chart-list.component';
import * as moment from 'moment';

@Injectable()
export class PatientChartService {
  consultationPatientChartMenuList = [];
  consultationPatientChartAllMenuList = [];
  faqTemplateList = [];
  public chartTypeList: Array<any> = [
    { key: 'CONSULTATION_CHART', label: 'Consultation Chart' },
    { key: 'FOLLOWUP_CHART', label: 'Followup Chart' },
    { key: 'DISCHARGE_CHART', label: 'Discharge Chart' },
    { key: 'SURGICAL_EMR', label: 'Surgical EMR' },
    { key: 'ANAESTHETIST_EMR', label: 'Anaesthetist EMR' },
    { key: 'NURSING_EMR', label: 'Nursing EMR' },
  ];

  patientVisitSectionArray = [];

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
  ) { }

  // getUserRoleTypeList(): Observable<any> {
  //     const reqUrl = `${environment.dashboardBaseURL}/emr/GetUserRoleTypeList`;
  //     return this.http.get(reqUrl).pipe(map((res: any) => {
  //         if (res.status_message === 'Success') {
  //             const temp = [];
  //             res.data.forEach(element => {
  //                 const role = new Role();
  //                 role.generateObject(element);
  //                 temp.push({ ...role });
  //             });
  //             return temp;
  //         } else {
  //             return [];
  //         }
  //     }));
  // }

  // getUsersList(reqParams: { search_keyword: string, dept_id: number, speciality_id: number, role_type_id: number, limit: number }): Observable<any> {
  //     const reqUrl = `${environment.dashboardBaseURL}/emr/GetUsersBySearchKeyword`;
  //     return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
  //         if (res.status_message === 'Success') {
  //             return res.data;
  //         } else {
  //             return [];
  //         }
  //     }));
  // }

  getPatientChartComponentList(serviceTypeId: number, specialityId: number): Observable<any> {
    const reqParams = {
      service_type_id: serviceTypeId,
      speciality_id: specialityId
    };
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/GetPatientChartComponentList`;
    return this.http.post(reqUrl, reqParams);
  }

  savePatientChart(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/SavePatientChart`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientChartList(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/GetPatientChartList`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientChartDetailsById(chartId: number): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/GetPatientChartDetailsById?chart_id=${chartId}`;
    return this.http.get(reqUrl);
  }

  deletePatientChart(chartId: number): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/DeletePatientChartById?chart_id=${chartId}`;
    return this.http.delete(reqUrl);
  }

  getPatientChartListForManageOrder(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/GetPatientChartListForManageOrder`;
    return this.http.post(reqUrl, reqParams);
  }

  savePatientChartOrder(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/SavePatientChartOrder`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientChartComponentsById(chartId: number): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/PatientChart/GetPatientChartComponentsById?ChartId=' + chartId;
    return this.http.get(reqUrl);
  }

  getConsultationPatientChart(reqParams): Observable<any> {
    if (this.consultationPatientChartAllMenuList.length > 0) {
      const data = _.find(this.consultationPatientChartAllMenuList, d => {
        return +d.req.user_id === +reqParams.user_id && d.req.chart_group === reqParams.chart_group;
      });
      if (data) {
        this.consultationPatientChartMenuList = data.data;
        return of(data.data);
      }
    }
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/GetConsultationPatientChart`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const obj = {
          req: reqParams,
          data: res.data
        };
        this.consultationPatientChartAllMenuList.push(obj);
        return this.consultationPatientChartMenuList = res.data;
      }
      return [];
    }));
  }

  getChartDetailsByChartId(chartId: number): any {
    return this.consultationPatientChartMenuList.find((c: any) => +c.chart_id === +chartId);
  }

  getFaqSectionTemplateList(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/Template/GetTemplateListById';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return this.faqTemplateList = res.data;
      }
      return [];
    }));
  }

  getLocalFaqSectionData(templateId): Observable<any> {
    // return of(this.faqTemplateList);
    const templateArray = _.filter(this.faqTemplateList, (template) => template.template_id === templateId);
    if (templateArray.length) {
      return of(_.cloneDeep(templateArray));
    }
    return of([]);
  }

  GetExaminationSuggestionList(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/Examination/GetExaminationSuggestionList';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const examData = [];
        _.forEach(res.data, (tag) => {
          const examType = new ExaminationTags();
          examType.generateObject(tag);
          // item = { ...examType };
          examData.push(examType);
        });
        return examData;
      }
      return [];
    }));
  }

  getPatientChartMapping(reqParams: any): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/GetPatientChartMapping`;
    return this.http.post(reqUrl, reqParams);
  }

  savePatientChartMapping(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/SavePatientChartMapping`;
    return this.http.post(reqUrl, reqParams);
  }

  saveAdviceFav(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/Advice/SaveAdviceFavoriteData';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }

  saveComplaintFav(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/Complaint/SaveComplaintsFavoriteData';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }

  saveDiagnosisFav(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/DiagnosisMaster/SaveDiagnosisFavoriteData';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }

  saveExaminationLabelFav(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/Examination/SaveExaminationFavoriteData';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }

  saveInvestigationFav(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/InvetigationMaster/SaveInvestigationFavoriteData';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }

  savePrescriptionFav(reqParams) {
    const reqUrl = environment.dashboardBaseURL + '/Medicine/SaveMedicineFavoriteData';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return true;
      }
      return false;
    }));
  }

  getPatientVisitSections(reqParams: { service_type_id: number, patient_id: string }): Observable<any> {
    const existsCacheData = this.getPatientVisitSectionsList(reqParams.service_type_id, reqParams.patient_id);
    if (existsCacheData) {
      return of(existsCacheData);
    }
    const reqUrl = environment.dashboardBaseURL + '/Patient/GetPatientVisitSections';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      this.updatePatientVisitSections(reqParams.service_type_id, reqParams.patient_id, res);
      return res;
    }));
  }

  updatePatientVisitSections(serviceTypeId, patientId, resData) {
    const indx = _.findIndex(this.patientVisitSectionArray, dt => {
      return dt.patientId === patientId && dt.serviceTypeId === serviceTypeId;
    });
    if (indx === -1) {
      const obj = {
        patientId,
        serviceTypeId,
        data: resData
      };
      this.patientVisitSectionArray.push(obj);
    }
  }

  getPatientVisitSectionsList(serviceTypeId, patientId) {
    const indx = _.findIndex(this.patientVisitSectionArray, dt => {
      return dt.patientId === patientId && dt.serviceTypeId === serviceTypeId;
    });
    if (indx !== -1) {
      return this.patientVisitSectionArray[indx].data;
    } else {
      return null;
    }
  }

  GetSuggestionConfiguration(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/GetSuggestionConfiguration`;
    return this.http.post(reqUrl, reqParams);
  }

  SaveSuggestionConfiguration(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/SaveSuggestionConfiguration`;
    return this.http.post(reqUrl, reqParams);
  }

  getSymanticTags(): Observable<any> {
    const reqUrl = `${environment.SNOWMED_SEMANTIC_TAG_URL}/descriptions/semantictags`;
    return this.http.get(reqUrl);
  }

  GetChartDocumentList(searchKeyword): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/PatientChart/GetChartDocumentTypeList`;
    const params = { searchKeyword, limit: '50' };
    return this.http.post(reqUrl, params);
  }

  chartList = [];

  getConsultationPatientChartList(patientObj, userInfo, ipChartGroup): Observable<any> {
    if (this.chartList.length > 0) {
      return of(this.chartList);
    }
    const serviceTypeId = patientObj ? patientObj.serviceType.id : 0;
    patientObj.isViewOnlyPat ? patientObj.isViewOnlyPat : false
    const req = {
      service_type_id: serviceTypeId,
      speciality_id: userInfo.speciality_id,
      role_type_id: userInfo.roletype_id,
      user_id: userInfo.user_id,
      chart_group: (serviceTypeId === Constants.ServiceType.IPD || serviceTypeId === Constants.ServiceType.ER) ? ipChartGroup : '',
      is_discharge_chart: patientObj.dischargeDate ? true : false,
      is_followup_chart: patientObj.isFollowupPatient || false,
      is_view_only: patientObj.isViewOnlyPat ? patientObj.isViewOnlyPat : false
    };
    return this.getConsultationPatientChart(req).pipe(map((res: any) => {
      if (res.length) {
        this.chartList = res;
        return res;
      } else {
        return []
      }
    }));
  }

  getPrescriptionChartList(patientObj, userInfo, ipChartGroup) {
    const promise = new Promise((resolve, reject) => {
      this.getConsultationPatientChartList(patientObj, userInfo, ipChartGroup).subscribe(res => {
        const prescriptonChartList = _.filter(res, d => {
          return d.chart_type === 'CONSULTATION_CHART' && (_.filter(d.chart_details, comp => {
            return comp.section_type === 'CONSULTATION_SECTION' && comp.section_key === 'prescription';
          })).length > 0;
        });
        resolve(prescriptonChartList);
      });
    });
    return promise;
  }

  openChartListPopupForApplyPrescription(chartList) {
    const promise = new Promise((resolve, reject) => {
      const modalInstance = this.modalService.open(CopyPrescriptionChartListComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false,
          size: 'xl',
          windowClass: 'visit-modal',
          container: '#homeComponent'
        });
      modalInstance.result.then((result) => {
        if (result.type === 'yes' && result.data.length > 0) {
          resolve(result.data);
        } else {
          resolve([]);
        }
      });
      modalInstance.componentInstance.chartList = chartList;
    });
    return promise;
  }

  getChartData(chart) {
    const chartAray = [];
    chart.map(d => {
      const obj = {
        patient_chart_id: d.chart_id,
        chart_detail_id: []
      };
      d.chart_details.map(com => {
        if (com.isSelected) {
          obj.chart_detail_id.push(com.chart_detail_id);
        }
      });
      if (obj.chart_detail_id.length > 0) {
        chartAray.push({ ...obj });
      }
    });
    return chartAray;
  }

  copyPrescriptionData(prescription, chart, patient, userInfo) {
    const promise = new Promise((resolve, reject) => {
      const prescriptionData = [];
      prescription.map(d => {
        const medObj = {
          tran_id: 0,
          type: {
            id: d.type && d.type.id ? d.type.id : 0,
            name: d.type && d.type.name ? d.type.name : null,
          },
          medicine: {
            id: d.medicine && d.medicine.id ? d.medicine.id : 0,
            medicine_name: d.medicine && d.medicine.medicine_name ? d.medicine.medicine_name : null,
            generic_name: d.medicine && d.medicine.generic_name ? d.medicine.generic_name : null,
          },
          start_date: new Date(moment().format('YYYY-MM-DD')),
          end_date: new Date(moment().add(d.days || 0, 'days').format('YYYY-MM-DD')),
          frequency: d.frequency || 1,
          freq_start_time: d.freq_start_time || '08:00 AM',
          meal_type_instruction: d.meal_type_instruction || null,
          frequency_schedule: d.frequency_schedule || '1-0-0',
          days: d.days || 1,
          sig: {
            id: d.sig && d.sig.id ? d.sig.id : 0,
            sig: d.sig && d.sig.sig ? d.sig.sig : 0,
          },
          dose: d.dose || null,
          route: d.route || null,
          qty: d.qty || null,
          language_id: d.language_id || 1,
          instruction: d.instruction || null,
          chart_detail_id: null
        };
        prescriptionData.push({ ...medObj });
      });
      const param = {
        visit_no: patient.visitNo,
        service_type_id: patient.serviceType ? patient.serviceType.id : 0,
        patient_id: patient.patientData.id,
        doctor_id: userInfo.user_id,
        patient_Chart_Ids: this.getChartData(chart),
        prescription_data: prescriptionData
      };
      const reqUrl = environment.dashboardBaseURL + '/Consultation/CopyPatientVisitPrescription';
      this.http.post(reqUrl, param).subscribe((res: any) => {
        if (res.status_message === 'Success') {
          resolve(res);
        } else {
          resolve(null);
        }
      });
    });
    return promise;
  }

  getPatientChartHistory(params): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Patient/GetPatientChartHistory`;
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return res;
    }));
  }

}

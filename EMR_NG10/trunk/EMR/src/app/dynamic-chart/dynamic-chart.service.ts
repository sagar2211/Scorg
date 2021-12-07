import { Subject, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { ChartData } from './../public/models/chart-data';
import * as moment from 'moment';

@Injectable()
export class DynamicChartService {
  patientChartData: any[] = [];
  activeChartInfo: any;
  suggestionPanelSettings = {
    isPin: false,
    suggestionIsShow: true
  };
  dirtyDataForQuestatusCheck = [];

  constructor(private http: HttpClient) { }

  public sendEventToSuggestion: Subject<{ sectionKeyName: string, action?: string, selectedData?: any, componentData?: any }> =
    new Subject<{ sectionKeyName: string, action?: string, selectedData?: any, componentData?: any }>();
  public $getEventFrmComponentSection = this.sendEventToSuggestion.asObservable();

  public sendEventToComponentSection: Subject<{ sectionKeyName: string, selectedSuggestion: any, action: string, selectedSuggestionIndx?: number, componentData?: any }> =
    new Subject<{ sectionKeyName: string, selectedSuggestion: any, action: string, selectedSuggestionIndx?: number, componentData?: any }>();
  public $getEventFrmSuggestion = this.sendEventToComponentSection.asObservable();

  public sendEventToParentChartContainer: Subject<{ source: string, content: any }> = new Subject<{ source: string, content: any }>();
  public $getEventFromChildComponent = this.sendEventToParentChartContainer.asObservable();

  activeChartDirtyFlagData = [];
  // get chart data from API
  getPatientChartData(chartKeys): Observable<any> {
    const reqParams = {
      service_type_id: this.activeChartInfo.serviceTypeId,
      patient_id: this.activeChartInfo.patientId,
      visit_no: this.activeChartInfo.visitNo,
      doctor_id: this.activeChartInfo.userId,
      patient_chart_id: this.activeChartInfo.chartId,
    };
    const reqUrl = `${environment.dashboardBaseURL}/Consultation/GetPatientVisit`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        // set chart data
        this.setChartData(chartKeys, res.data);
        return true;
      }
      return false;
    }));
  }

  setChartData(chartKeys, chartData) {
    const activeChartIndex = this.getActiveChartIndex();
    if (activeChartIndex === -1) {
      // set new chart data
      this.addNewChartData(chartKeys, chartData);
    } else {
      // update chart data
      if (chartData !== null && chartData.chart_data !== undefined) {
        this.patientChartData[activeChartIndex].visitDetailId = chartData.visit_detail_id;
        this.patientChartData[activeChartIndex].chartData = chartData.chart_data;
      }
    }
  }

  getActiveChartIndex() {
    return _.findIndex(this.patientChartData, (oldChart) => {
      return (oldChart.chartId === this.activeChartInfo.chartId &&
        oldChart.serviceTypeId === this.activeChartInfo.serviceTypeId &&
        oldChart.patientId === this.activeChartInfo.patientId &&
        oldChart.visitNo === this.activeChartInfo.visitNo &&
        oldChart.userId === this.activeChartInfo.userId);
    });
  }

  addNewChartData(chartKeys, allChartDetails?) {
    let chartData: any;
    const newChart = _.cloneDeep(this.activeChartInfo);
    if (!allChartDetails || allChartDetails === null) {
      const emptyChartData = {};
      _.forEach(chartKeys, (key) => {
        emptyChartData[key] = null;
      });
      chartData = emptyChartData;
      newChart['visitDetailId'] = 0;
    } else {
      chartData = !_.isUndefined(allChartDetails.chart_data) ? allChartDetails.chart_data : allChartDetails;
      newChart['visitDetailId'] = !_.isUndefined(allChartDetails.visit_detail_id) ? allChartDetails.visit_detail_id : 0;
    }
    newChart['chartData'] = chartData;
    const chartObj = new ChartData();
    chartObj.generateObject(newChart);
    this.patientChartData.push(chartObj);
  }

  setActiveChartInfo(chartInfo) {
    this.activeChartInfo = _.cloneDeep(chartInfo);
    this.activeChartDirtyFlagData = [];
  }

  getActiveChartInfo() {
    return _.cloneDeep(this.activeChartInfo);
  }

  updateLocalChartData(key, data, action, activeChartDetailId?) {
    const activeChartIndex = this.getActiveChartIndex();
    if (activeChartIndex !== -1) {
      switch (action) {
        case 'update':
          // update isDirty flag.
          let oldData = this.patientChartData[activeChartIndex].chartData[key];
          if (activeChartDetailId) {
            oldData = _.filter(this.patientChartData[activeChartIndex].chartData[key], (o) => {
              return (o && o.chart_detail_id === activeChartDetailId);
            });
          }

          // add/update dirty flag
          const dirtyObj = _.find(this.activeChartDirtyFlagData, (o) => o.chartKey === key);

          // Chart detail id added for duplicate component
          // if (activeChartDetailId) {
          //   dirtyObj = _.find(this.activeChartDirtyFlagData, (o) => o.chartKey === key && o.chartDetailId === activeChartDetailId);
          // }

          if (!_.isEmpty(data) && !_.isEqual(oldData, data)) {
            if (dirtyObj) {
              dirtyObj['isDirty'] = true;
            } else {
              const setDirtyObj = { chartKey: key, isDirty: true };
              this.activeChartDirtyFlagData.push(setDirtyObj);
            }
          }
          // else {
          //   if (dirtyObj) {
          //     dirtyObj['isDirty'] = (!_.isEmpty(data))false;
          //   }
          // }

          _.remove(this.patientChartData[activeChartIndex].chartData[key], (o) => {
            return (o && o.chart_detail_id === activeChartDetailId);
          });

          if (!(this.patientChartData[activeChartIndex].chartData[key]) || (this.patientChartData[activeChartIndex].chartData[key] === null)) {
            this.patientChartData[activeChartIndex].chartData[key] = [];
          }
          if(key === 'followup_date_detail'){
            this.patientChartData[activeChartIndex].chartData[key] = [];
          }
          this.patientChartData[activeChartIndex].chartData[key] = _.concat(this.patientChartData[activeChartIndex].chartData[key], data);
          break;
      }
    }
  }

  getChartDataByKey(key, returnObservable?, filterData?, chartDetailId?) {
    const activeChartIndex = this.getActiveChartIndex();
    if (activeChartIndex !== -1) {
      const res = _.filter(this.patientChartData[activeChartIndex].chartData[key], (o) => {
        return (o && o.chart_detail_id === chartDetailId);
      });
      if (filterData && res !== null && _.isArray(res)) {
        let filteredData = _.cloneDeep(res);
        filteredData = _.filter(filteredData, (item) => item[filterData.filterKey] === filterData.filterValue);
        return (returnObservable) ? of(filteredData) : filteredData;
      }
      return (returnObservable) ? of(res) : res;
    }
  }

  autoSaveChartData() {
    // console.log('in AUTOSAVE');
    // check with active dirty data
    const dirtyChartKeys = [];
    _.forEach(this.activeChartDirtyFlagData, (item) => {
      if (item.isDirty) {
        dirtyChartKeys.push(item.chartKey);
      }
    });
    if (dirtyChartKeys.length) {
      const reqParams = this.getActiveChartParamData(true, dirtyChartKeys);
      const reqUrl = `${environment.dashboardBaseURL}/Consultation/AutoSavePatientVisit`;
      return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
        if (res.status_message === 'Success') {
          // set chart data
          this.activeChartDirtyFlagData = [];
          return true;
        }
        return false;
      }));
    } else {
      return of(false);
    }
  }

  getActiveChartParamData(isAutosave, dirtyChartKeys) {
    const activeIndex = this.getActiveChartIndex();
    let saveChartDataObject: any = {};
    if (isAutosave && dirtyChartKeys.length > 0) {
      _.forEach(dirtyChartKeys, (chartKey) => {
        saveChartDataObject[chartKey] = this.patientChartData[activeIndex].chartData[chartKey];
      });
    } else if (!isAutosave) {
      saveChartDataObject = this.patientChartData[activeIndex].chartData;
    }
    const reqParams = {
      visit_detail_id: this.patientChartData[activeIndex].visitDetailId,
      service_type_id: this.patientChartData[activeIndex].serviceTypeId,
      patient_id: this.patientChartData[activeIndex].patientId,
      patient_name: this.activeChartInfo.patientName,
      visit_no: this.patientChartData[activeIndex].visitNo,
      visit_date: this.activeChartInfo.admissionDate || moment(this.activeChartInfo.appointmentDate, 'DD/MM/YYYY HH:mm a').toDate(),
      doctor_id: this.patientChartData[activeIndex].userId,
      consultation_duration: this.activeChartInfo.defaultTimePerPatient,
      is_followup_patient: false,
      // next_appointment: null,
      patient_chart_id: this.patientChartData[activeIndex].chartId,
      chart_data: saveChartDataObject
    };
    return reqParams;
  }

  checkForSaveDraftData() {
    const dirtyData = _.filter(this.activeChartDirtyFlagData, (o) => o.isDirty === true);
    return !!(dirtyData.length);
  }

  saveChartData(): Observable<any> {
    const reqParams = this.getActiveChartParamData(false, []);
    const reqUrl = `${environment.dashboardBaseURL}/Consultation/SavePatientVisit`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        this.activeChartDirtyFlagData = [];
        return { data: reqParams, status: true };
      } else {
        return { data: reqParams, status: false };
      }
    }));
  }

  discardAutoSaveData() {
    const activeIndex = this.getActiveChartIndex();
    const reqParams = {
      visit_detail_id: this.patientChartData[activeIndex].visitDetailId,
      service_type_id: this.patientChartData[activeIndex].serviceTypeId,
      patient_id: this.patientChartData[activeIndex].patientId,
      visit_no: this.patientChartData[activeIndex].visitNo,
      doctor_id: this.patientChartData[activeIndex].userId,
      patient_chart_id: this.patientChartData[activeIndex].chartId
    };
    const reqUrl = `${environment.dashboardBaseURL}/Consultation/DiscardPatientVisit`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        this.activeChartDirtyFlagData = [];
        this.patientChartData.splice(activeIndex, 1);
        return true;
      } else {
        return false;
      }
    }));
  }

  getSnowMedCtData(searchString): Observable<any> {
    const reqUrl = `http://172.16.100.71:8181/MAIN/concepts?activeFilter=true&term=${searchString}&offset=0&limit=50`;
    // const reqUrl =  `${environment.jsonPath}getSnowmedData.json`;
    return this.http.get(reqUrl).pipe(map(res => {
      return res;
    }));
  }

  savePateintVisitOrderSet(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Consultation/SavePatientVisitOrderset`;
    return this.http.post(reqUrl, reqParams);
  }

  getPatientVisitOrdersets(reqParams): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Consultation/GetPatientVisitOrdersets`;
    return this.http.post(reqUrl, reqParams);
  }

  deletePatientVisitOrderset(visitOrdersetId: number): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Consultation/DeletePatientVisitOrderset?visitOrdersetId=${visitOrdersetId}`;
    return this.http.get(reqUrl);
  }

  getPatientVisitOrdersetById(visitOrdersetId: number): Observable<any> {
    const reqUrl = `${environment.dashboardBaseURL}/Consultation/GetPatientVisitOrdersetById?visitOrdersetId=${visitOrdersetId}`;
    return this.http.get(reqUrl);
  }

  // -- check in doctor
  checknInDoctor(roomMappingId): Observable<any> {
    const reqParams = {
      room_mapping_id: roomMappingId
    };
    const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/entityCheckIn`;
    return this.http.post(reqUrl, reqParams);
  }


  getCheckInCheckOutStatus(roomMappingId: Array<string>, checkinDate): Observable<any> {
    const reqParams = {
      room_mapping_id: roomMappingId,
      checkin_date: checkinDate // --MM/DD/YYYY
    };
    const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/getCheckInCheckOutStatus`;
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.CheckinStatus) {
        // let response = null;
        // const checkOutScheduleList = _.filter(res.CheckinStatus, (o) => o.checkout_status === true || (o.is_resume === true && o.is_stop === false && o.checkout_status === false));
        if (res.CheckinStatus.length) {
          res.CheckinStatus = res.CheckinStatus[0].checkin_status;
        } else {
          res.CheckinStatus = false;
        }
        // else {
        //   const isCheckedIn = res.CheckinStatus.find((e: any) => e.checkin_status && !e.checkout_status && e.is_resume && !e.is_stop);
        //   if (isCheckedIn) {
        //     res.CheckinStatus = isCheckedIn;
        //   }
        // }
        return res;
      } else {
        return res;
      }
    }));
  }

  updateAppointmentQueueStatus(reqParams) {
    const dirtyChartKeys = [];
    _.forEach(this.dirtyDataForQuestatusCheck, (item) => {
      if (item.isDirty) {
        dirtyChartKeys.push(item.chartKey);
      }
    });
    // const patId = this.activeChartInfo.patientId;
    // const patData = this.commonService.getActivePatintData(patId);
    if ((dirtyChartKeys.length && reqParams.status_id === 4) || reqParams.status_id === 5) {
      const reqUrl = `${environment.baseUrlAppointment}/QueueTransaction/updateAppointmentQueue`;
      return this.http.put(reqUrl, reqParams).pipe(map((res: any) => {
        if (res.status_message === 'Success') {
          this.dirtyDataForQuestatusCheck = [];
          return true;
        }
        return false;
      }));
    } else {
      return of(false);
    }
  }

}

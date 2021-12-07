import { HistoryService } from './../../history.service';
import { map } from 'rxjs/operators';
import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subject, Observable, of, forkJoin } from 'rxjs';
import { CommonService } from './../../../public/services/common.service';
import { ConsultationHistoryService } from './../../../public/services/consultation-history.service';
import * as _ from 'lodash';
import { ScoreTemplateService } from '../../../public/services/score-template.service';
import { PatientChartService } from '../../../patient-chart/patient-chart.service';
import * as moment from 'moment';

@Component({
  selector: 'app-history-right-section',
  templateUrl: './history-right-section.component.html',
  styleUrls: ['./history-right-section.component.scss']
})
export class HistoryRightSectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedFilter;
  @Input() slectedSec;
  currentSec: string;
  patientId: string;
  patientObj: any;
  destroy$ = new Subject<any>();
  documentPath = null;
  documentData = null;
  documentType = null;
  chartComponentList = [];
  componentKeysList = [];
  patientFilterData: any;
  patientcomponentList = [];
  scrollDocumentArray = [];
  currentIndex = null;
  bgPrcIndx: number;
  chartDataComponentArray = [];
  showLoader: boolean;
  constructor(
    private commonService: CommonService,
    private historyService: HistoryService,
    private consultationHistoryService: ConsultationHistoryService,
    private scoretemplateService: ScoreTemplateService,
    private patientChartService: PatientChartService,
  ) { }

  ngOnInit() {
    this.getpatientData();
    this.getComponentList();
    this.currentSec = this.slectedSec;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnChanges() {
    this.showLoader = false;
    this.currentSec = this.slectedSec;
    if (this.selectedFilter && this.currentSec) {
      this.showLoader = true;
      this.patientFilterData = this.historyService.getPatientHistoryFilter(this.patientId);
      this.createDocumentArray().subscribe(res => {
        const param = {
          patientId: this.patientId,
          serviceTypeId: this.currentSec['value'].serviceType,
          visitNo: this.currentSec['value'].visitNo,
          documentType: this.currentSec['value'].data.documentType,
          dmsReferenceId: this.currentSec['value'].data.dmsReferenceId,
          emrReferenceId: this.currentSec['value'].data.emrReferenceId
        };
        const chkIndx = _.findIndex(this.scrollDocumentArray, doc => {
          return doc.documentType === param.documentType
            && doc.visitNo === param.visitNo
            && doc.serviceType === param.serviceTypeId
            && ('tree_' + doc.hashId) === this.currentSec['value'].hashId
            && moment(doc.selectedDate).isSame(moment(this.currentSec['value'].dateTime));
        });
        if (this.scrollDocumentArray[chkIndx].isDataLoaded) {
          this.showLoader = false;
          document.querySelector('#' + this.scrollDocumentArray[chkIndx].hashId).scrollIntoView({ behavior: 'smooth' });
          return;
        }
        this.bgPrcIndx = 1;
        this.getPatientNodeData(param, 'onChange');
        this.getDocumentDataInBackgroundProcess();
      });
    }
    if (this.currentSec && !this.selectedFilter) {
      this.patientFilterData = this.historyService.getPatientHistoryFilter(this.patientId);
      const param = {
        patientId: this.patientId,
        serviceTypeId: this.currentSec['value'].serviceType,
        visitNo: this.currentSec['value'].visitNo,
        documentType: this.currentSec['value'].data.documentType,
        dmsReferenceId: this.currentSec['value'].data.dmsReferenceId,
        emrReferenceId: this.currentSec['value'].data.emrReferenceId
      };
      const chkIndx = _.findIndex(this.scrollDocumentArray, doc => {
        return doc.documentType === param.documentType
          && doc.visitNo === param.visitNo
          && doc.serviceType === param.serviceTypeId
          && ('tree_' + doc.hashId) === this.currentSec['value'].hashId
          && moment(doc.selectedDate).isSame(moment(this.currentSec['value'].dateTime));
      });
      if (this.scrollDocumentArray[chkIndx].isDataLoaded) {
        document.querySelector('#' + this.scrollDocumentArray[chkIndx].hashId).scrollIntoView({ behavior: 'smooth' });
        this.showLoader = false;
        return;
      }
      // this.getPatientNodeData(param, 'onChange');
      this.showLoader = false;
    }
  }

  getpatientData(patient?) {
    this.patientObj = null;
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  getPatientNodeData(param, callFrom) {
    this.consultationHistoryService.getPatientDocumentDetails(param).subscribe(res => {
      this.documentPath = null;
      this.documentData = null;
      if (res.documentData && param.documentType === 'CUSTOM_CHART') {
        const forkArray = [];
        _.map(this.documentData, dt => {
          dt.isExpand = true;
        });
        _.forEach(this.documentData, (chart, index) => {
          _.forEach(chart.chart_data.score_template_detail, (element) => {
            element = this.scoretemplateService.getCalTemplateValue(element);
          });
          chart.chartComponentList = chart.chart_components;
        });
        this.documentType = _.cloneDeep(param.documentType);
        this.updateDocumentArray('bg_process').subscribe(res1 => {

        });
        _.map(res.documentData, dt => {
          dt.isExpand = true;
        });
        this.documentPath = res.documentPath;
        this.documentData = res.documentData;
        _.forEach(res.documentData, chart => {
          _.forEach(chart.chart_data.score_template_detail, (element) => {
            element = this.scoretemplateService.getCalTemplateValue(element);
          });
        });
        this.documentType = _.clone(param.documentType);
        this.showLoader = false;
        this.updateDocumentArray(callFrom).subscribe();
      } else {
        this.documentPath = _.clone(res.documentPath);
        this.documentData = _.clone(res.documentData);
        this.documentType = _.clone(this.currentSec['value'].data.documentType);
        this.showLoader = false;
        this.updateDocumentArray(callFrom).subscribe();
      }
    });
  }

  updateDocumentArray(callFrom): Observable<any> {
    this.scrollDocumentArray = _.filter(this.scrollDocumentArray, doc => {
      return moment(doc.selectedDate).isSame(moment(this.currentSec['value'].dateTime))
        && doc.serviceType === this.currentSec['value'].serviceType;
    });
    if (callFrom === 'onChange') {
      const chkIndx = _.findIndex(this.scrollDocumentArray, doc => {
        return doc.documentType === this.currentSec['value'].data.documentType
          && doc.visitNo === this.currentSec['value'].visitNo
          && doc.serviceType === this.currentSec['value'].serviceType
          && ('tree_' + doc.hashId) === this.currentSec['value'].hashId
          && moment(doc.selectedDate).isSame(moment(this.currentSec['value'].dateTime));
      });
      if (chkIndx !== -1) {
        this.currentIndex = chkIndx;
        this.scrollDocumentArray[chkIndx].documentPath = _.clone(this.documentPath);
        this.scrollDocumentArray[chkIndx].documentData = _.clone(this.documentData);
        this.scrollDocumentArray[chkIndx].isDataLoaded = true;
      }
      setTimeout(() => {
        document.querySelector('#' + this.scrollDocumentArray[this.currentIndex].hashId).scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    } else if (callFrom === 'onScroll') {
      this.scrollDocumentArray[this.currentIndex].documentPath = _.clone(this.documentPath);
      this.scrollDocumentArray[this.currentIndex].documentData = _.clone(this.documentData);
      this.scrollDocumentArray[this.currentIndex].isDataLoaded = true;
      this.historyService.scrollToNodeIntree(this.scrollDocumentArray[this.currentIndex].hashId);
    } else {
      const indx = _.clone(this.bgPrcIndx);
      if (this.scrollDocumentArray[indx]) {
        this.scrollDocumentArray[indx].documentPath = _.clone(this.documentPath);
        this.scrollDocumentArray[indx].documentData = _.clone(this.documentData);
        this.scrollDocumentArray[indx].isDataLoaded = true;
      }
    }
    return of(true);
  }

  createDocumentArray(): Observable<any> {
    if (this.selectedFilter && this.selectedFilter.length > 0) {
      if (this.scrollDocumentArray.length > 0 && moment(this.scrollDocumentArray[0].selectedDate).isSame(moment(this.selectedFilter[0].value.dateTime))) {
        return of(this.scrollDocumentArray);
      }
      this.scrollDocumentArray = [];
      this.currentIndex = 0;
      this.bgPrcIndx = 1;
      _.map(this.selectedFilter, dtp => {
        if (dtp.children && dtp.children.length > 0) {
          _.map(dtp.children, dtc => {
            const obj1 = {
              documentPath: null,
              documentData: null,
              documentType: dtc.value.data.documentType,
              documentName: dtc.value.data.documentName,
              selectedDate: dtc.value.dateTime,
              visitNo: dtc.value.visitNo,
              serviceType: dtc.value.serviceType,
              dmsReferenceId: dtc.value.data.dmsReferenceId,
              emrReferenceId: dtc.value.data.emrReferenceId,
              isDataLoaded: false,
              hashId: 'right_' + dtc.value.serviceType + '_' + dtc.value.data.documentType + '_' + dtc.value.visitNo + '_' + dtc.value.data.emrReferenceId
            };
            this.scrollDocumentArray.push(obj1);
          });
        } else {
          const obj2 = {
            documentPath: null,
            documentData: null,
            documentType: dtp.value.data.documentType,
            documentName: dtp.value.data.documentName,
            selectedDate: dtp.value.dateTime,
            visitNo: dtp.value.visitNo,
            serviceType: dtp.value.serviceType,
            dmsReferenceId: dtp.value.data.dmsReferenceId,
            emrReferenceId: dtp.value.data.emrReferenceId,
            isDataLoaded: false,
            hashId: 'right_' + dtp.value.serviceType + '_' + dtp.value.data.documentType + '_' + dtp.value.visitNo + '_' + dtp.value.data.emrReferenceId
          };
          this.scrollDocumentArray.push(obj2);
        }
      });
    }
    return of(this.scrollDocumentArray);
  }

  getComponentList() {
    const data = this.consultationHistoryService.getHistorDataByKey(this.patientObj.patientData.id, 'componentList', false);
    if (data && data.length > 0) {
      return of(this.patientcomponentList = data);
    } else {
      const req = {
        service_type_id: this.patientObj.serviceType.id,
        patient_id: this.patientObj.patientData.id
      };
      this.patientChartService.getPatientVisitSections(req).subscribe((res: any) => {
        if (res.status_message === 'Success' && res.data.length) {
          this.consultationHistoryService.setHistoryPatientData(this.patientObj.patientData.id, 'componentList', res.data);
          return this.patientcomponentList = res.data;
        }
      });
    }
  }

  getComponentNameByKey(key, history): string {
    const indx = this.componentKeysList.findIndex((c: any) => c.chartId === history.patient_chart_id);
    if (indx !== -1) {
      const dt = this.componentKeysList[indx].data.find(c => c.section_key === key);
      if (dt) {
        return (this.componentKeysList[indx].data.find(c => c.section_key === key)).section_name;
      } else {
        return null;
      }
    }
  }

  isSvgExist(dataList, svgName, svgType): boolean {
    let isExist;
    if (svgType === 'humanBody' || svgType === 'footExamine') {
      isExist = _.find(dataList, (o) => o.svg_name === svgName);
    } else {
      isExist = _.find(dataList, (o) => o.svg_type === svgType);
    }
    if (!_.isUndefined(isExist)) {
      return true;
    } else {
      return false;
    }
  }

  updateFilterObject(obj, type, indx) {
    const param = _.cloneDeep(this.patientFilterData);
    if (type === 'date') {
      param['startDate'] = null;
      param['endDate'] = null;
    } else if (type === 'docType' || type === 'serviceType') {
      param[type].splice(indx, 1);
    }
    this.patientFilterData = param;
    this.historyService.setPatientHistoryFilter(this.patientId, param);
  }

  onScrollGetData(data) {
    // console.log(data, 'onscroll');
    // if (this.scrollDocumentArray.length > (this.currentIndex + 1)) {
    //   this.currentIndex = _.cloneDeep(this.currentIndex + 1);
    //   const param = {
    //     patientId: this.patientId,
    //     serviceTypeId: this.scrollDocumentArray[this.currentIndex].serviceType,
    //     visitNo: this.scrollDocumentArray[this.currentIndex].visitNo,
    //     documentType: this.scrollDocumentArray[this.currentIndex].documentType,
    //     dmsReferenceId: this.scrollDocumentArray[this.currentIndex].dmsReferenceId,
    //     emrReferenceId: this.scrollDocumentArray[this.currentIndex].emrReferenceId
    //   };
    //   this.getPatientNodeData(param, 'onScroll');
    // }
  }

  getDocumentDataInBackgroundProcess() {
    if (this.scrollDocumentArray.length > this.bgPrcIndx) {
      if (!this.scrollDocumentArray[this.bgPrcIndx].isDataLoaded) {
        const param = {
          patientId: this.patientId,
          serviceTypeId: this.scrollDocumentArray[this.bgPrcIndx].serviceType,
          visitNo: this.scrollDocumentArray[this.bgPrcIndx].visitNo,
          documentType: this.scrollDocumentArray[this.bgPrcIndx].documentType,
          dmsReferenceId: this.scrollDocumentArray[this.bgPrcIndx].dmsReferenceId,
          emrReferenceId: this.scrollDocumentArray[this.bgPrcIndx].emrReferenceId
        };
        this.getPatientNodeDataForBgProcess(param).then(res => {
          if (this.scrollDocumentArray.length > this.bgPrcIndx) {
            this.bgPrcIndx = this.bgPrcIndx + 1;
            this.getDocumentDataInBackgroundProcess();
          } else {
            // console.log(this.scrollDocumentArray, 'sdfsfdsd');
          }
        });
      }
    }
  }

  getPatientNodeDataForBgProcess(param): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.consultationHistoryService.getPatientDocumentDetails(param).subscribe(res => {
        this.documentPath = res.documentPath;
        this.documentData = res.documentData;
        if (res.documentData && param.documentType === 'CUSTOM_CHART') {
          const forkArray = [];
          _.map(this.documentData, dt => {
            dt.isExpand = true;
          });
          _.forEach(this.documentData, (chart, index) => {
            _.forEach(chart.chart_data.score_template_detail, (element) => {
              element = this.scoretemplateService.getCalTemplateValue(element);
            });
            chart.chartComponentList = chart.chart_components;
          });
          this.documentType = _.cloneDeep(param.documentType);
          this.updateDocumentArray('bg_process').subscribe(res1 => {
            resolve(true);
          });
        } else {
          this.documentType = _.cloneDeep(this.currentSec['value'].data.documentType);
          this.updateDocumentArray('bg_process').subscribe(res2 => {
            resolve(true);
          });
        }
      });
    });
    return promise;
  }

  onSectionChange(cd) {
    // console.log(cd, cd);
  }

}

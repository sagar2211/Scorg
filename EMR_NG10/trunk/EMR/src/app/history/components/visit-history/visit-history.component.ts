import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisitHistoryFilterComponent } from '../visit-history-filter/visit-history-filter.component';
import { Subject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonService } from './../../../public/services/common.service';
import { ConsultationHistoryService } from './../../../public/services/consultation-history.service';
import { ScoreTemplateService } from './../../../public/services/score-template.service';
import { PatientChartService } from '../../../patient-chart/patient-chart.service';
import { HistoryService } from './../../history.service';

@Component({
  selector: 'app-visit-history',
  templateUrl: './visit-history.component.html',
  styleUrls: ['./visit-history.component.scss']
})
export class VisitHistoryComponent implements OnInit, OnDestroy {

  patientId: any;
  destroy$ = new Subject<any>();
  patientObj: any;
  appliedHistoryFilter: any;
  historyData = [];
  pagingInfo = {
    pageNo: 1, limit: 10, sortOrder: 'desc'
  };
  chartComponentList = [];
  selectedChartId: number;
  componentKeysList = [];
  patientcomponentList = [];
  sortKeyList: any = [{ key: 'doctor_name', name: 'Doctor' },
  { key: 'consultation_datetime', name: 'Date' }];
  selectedSortkey: any = '';
  selectedSortType = true; // true asc, false  desc

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private consultationHistoryService: ConsultationHistoryService,
    private historyService: HistoryService,
    private scoretemplateService: ScoreTemplateService,
    public patientChartService: PatientChartService,
  ) { }

  ngOnInit() {
    this.getpatientData();
    this.getComponentList();
    this.getAppliedFilterData();
    this.commonService.updateHistoryTabHideShow('visit');
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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

  getAppliedFilterData() {
    this.appliedHistoryFilter = this.consultationHistoryService.getActiveFilterDataById(this.patientId, 'visit');
    this.getVisitHistory();
  }

  orderByHistory(event) {
    if (event) {
      this.pagingInfo.sortOrder = this.selectedSortType ? 'asc' : 'desc';
      this.getVisitHistory();
    }
  }

  getVisitHistory(from?) {
    const param = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientId,
      dates: this.appliedHistoryFilter && this.appliedHistoryFilter.chartDateArray.length > 0 ?
        _.map(this.appliedHistoryFilter.chartDateArray, dt => {
          return dt.date;
        }) : [],
      doctor_ids: this.appliedHistoryFilter && this.appliedHistoryFilter.careTeamList.length ?
        _.map(this.appliedHistoryFilter.careTeamList, dt => {
          return dt.user_id;
        }) : [],
      // section_keys: this.appliedHistoryFilter && this.appliedHistoryFilter.componentList.length ?
      //   _.map(this.appliedHistoryFilter.componentList, dt => {
      //     return dt.section_name;
      //   }) : [],
      section_data: this.appliedHistoryFilter && this.appliedHistoryFilter.componentList.length ?
        _.map(this.appliedHistoryFilter.componentList, dt => {
          return { section_key: dt.section_key, chart_detail_ids: dt.chart_detail_ids };
        }) : [],
      page_number: this.pagingInfo.pageNo > 0 ? this.pagingInfo.pageNo : 1,
      sort_column: this.selectedSortkey ? this.selectedSortkey : '',
      sort_order: this.pagingInfo.sortOrder,
      limit: this.pagingInfo.limit
    };
    this.historyService.getPatientVisitHistory(param).subscribe(res => {
      if (res.length) {
        this.historyData = from === 'onScroll' ? this.historyData.concat(res) : res;
      } else {
        this.historyData = from === 'onScroll' ? this.historyData : [];
      }
      this.pagingInfo.pageNo = (this.pagingInfo.pageNo - 1) > 0 ? this.pagingInfo.pageNo - 1 : 1;
      if (from !== 'onScroll') {
        this.onExpand(this.historyData[0], 0);
      }
    });
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  updateFilterObject(item, type, index) {
    if (type === 'date') {
      this.appliedHistoryFilter.chartDateArray.splice(index, 1);
    }
    if (type === 'careTeam') {
      this.appliedHistoryFilter.careTeamList.splice(index, 1);
    }
    if (type === 'section') {
      this.appliedHistoryFilter.componentList.splice(index, 1);
    }
    this.consultationHistoryService.setActiveFilterDataById(this.appliedHistoryFilter);
    this.getVisitHistory();
  }

  openFilterPopup() {
    const messageDetails = {
      modalTitle: 'Filter',
      patientObj: this.patientObj,
      appliedFilter: this.appliedHistoryFilter,
      type: 'visit'
    };
    const modalInstance = this.modalService.open(VisitHistoryFilterComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'visit-modal',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.getAppliedFilterData();
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  onExpand(history, index): void {
    const isExpand = _.clone(!this.historyData[index].isExpand);
    if (isExpand && history.chart_data === null) {
      this.getPatientVisitHistoryDetailsById(history).subscribe(res => {
        this.historyData[index].chart_data = _.clone(res.chart_data);
        this.historyData[index].chartComponentList = _.clone(res.chart_components);
        if (!isExpand) {
          this.historyData[index].isExpand = _.clone(isExpand);
          return;
        }
        this.historyData[index].isExpand = _.clone(isExpand);
        this.chartComponentList = res.chart_components;
      });
    } else {
      if (!isExpand) {
        this.historyData[index].isExpand = _.clone(isExpand);
        return;
      }
      this.historyData[index].isExpand = _.clone(isExpand);
      this.chartComponentList = _.clone(this.historyData[index].chartComponentList);
    }
  }

  getPatientVisitHistoryDetailsById(history): Observable<any> {
    const reqParams = {
      visit_detail_id: history.visit_detail_id,
      // section_keys: this.appliedHistoryFilter && this.appliedHistoryFilter.componentList.length ?
      //   _.map(this.appliedHistoryFilter.componentList, dt => {
      //     return dt.section_name;
      //   }) : [],
      section_data: this.appliedHistoryFilter && this.appliedHistoryFilter.componentList.length ?
        _.map(this.appliedHistoryFilter.componentList, dt => {
          return { section_key: dt.section_key, chart_detail_ids: dt.chart_detail_ids };
        }) : [],
    };
    return this.historyService.getPatientVisitHistoryDetailsById(reqParams).pipe(map(res => {
      return res;
    }));
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

  returnSvgNo(svgName): string {
    switch (svgName) {
      case ('headFlag' || 'headzoomFlag'):
        return svgName === 'headFlag' ? '13' : '13_x';
        break;
      case ('svgFrontFlag' || 'FrontzoomFlag'):
        return svgName === 'svgFrontFlag' ? '11' : '11_x';
        break;
      case ('svgBackFlag' || 'BackzoomFlag'):
        return svgName === 'svgBackFlag' ? '12' : '12_x';
        break;
      case ('rightFlag' || 'rightzoomFlag'):
        return svgName === 'rightFlag' ? '15' : '15_x';
        break;
      case ('leftFlag' || 'leftzoomFlag'):
        return svgName === 'leftFlag' ? '14' : '14_x';
        break;
      case 'light_touchFlag':
        return 'light_touch_checkup';
        break;
    }
  }

  onScroll() {
    this.pagingInfo.pageNo += 1;
    this.getVisitHistory('onScroll');
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

  // generateCustomTemplateSummary(array): any {
  //   const tags: Array<{ value: any, name: string }> = [];
  //   const templates = _.uniqBy(array, 'template_id');
  //   templates.forEach(template => {
  //     const forms = _.uniqBy(array.filter(a => a.template_id === template.template_id), 'form_id');
  //     forms.forEach(form => {
  //       let tag = form.form_summary_heading;
  //       const queGroups = _.uniqBy(array.filter(a => a.form_id === form.form_id), 'que_group_id');
  //       queGroups.forEach(queGroup => {
  //         tag += `\n ${queGroup.que_group_heading}`;
  //         const questions = _.uniqBy(array.filter(a => a.que_group_id === queGroup.que_group_id), 'question_id');
  //         questions.forEach(question => {
  //           // var objAnswers = get unique answers by que id from array;
  //           const objStorySeting = question.story_setting;
  //           let storyTag = objStorySeting.replace('#Title#', 'Mr.').replace('#PatientName#', this.patientObj.patientData.name);

  //           const answers = array.filter(a => a.question_id === question.question_id);
  //           answers.forEach(answer => {
  //             const replaceTag = ('#Answer' + answer.answer_row_id + '#');
  //             storyTag = storyTag.replace(replaceTag, answer.answer_text);
  //           });

  //           // remaining Answer tags need to remove
  //           if (storyTag.indexOf('#Answer') !== -1) {
  //             for (let i = 1; i < 50; i++) {
  //               const replaceTag = ('#Answer' + i + '#');
  //               storyTag = storyTag.replace(replaceTag, '');
  //             }
  //           }

  //           tag += '\n ' + storyTag;
  //         });
  //         tags.push({ value: tag, name: template.template_name });
  //       });
  //     });
  //   });
  //   return tags;
  // }

}

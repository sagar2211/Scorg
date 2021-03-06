import { EncounterPatient } from './../../public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DischargeSummaryFilterComponent } from './../discharge-summary-filter/discharge-summary-filter.component';
import { DischargeSummaryService } from './../discharge-summary.service';
import { CommonService } from './../../public/services/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from './../../config/constants';
import { IAlert } from './../../public/models/AlertMessage';
import { AddUpdateDischargeTemplateComponent } from '../add-update-discharge-template/add-update-discharge-template.component';
import { AuthService } from 'src/app/public/services/auth.service';
import { OrderService } from 'src/app/public/services/order.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-discharge-summary',
  templateUrl: './discharge-summary.component.html',
  styleUrls: ['./discharge-summary.component.scss']
})
export class DischargeSummaryComponent implements OnInit, OnDestroy {

  dischargeSummary = [];
  dischargeSummaryListByChart = [];
  dischargeSummaryListByChartClone = [];
  dischargeSummaryFilter: any;
  isFilterApplied = false;
  patientObj: EncounterPatient;
  patientId: any;
  // dischargeSummaryData = [];
  alertMsg: IAlert;
  printChartData: any = null;
  setTemplateDisabled = true;
  defaultComponentList: any[] = [];
  timeFormateKey: string;
  timeArray = []
  dischargeDate;
  dischargeTime = {
    // hrTime: null,
    // minTime: null,
    // amPmTime: null,
    time: null
  };
  allOrderDataClone: any;
  allOrderData = [];
  isSummerySaved: boolean;
  duration: any;
  constructor(
    private commonService: CommonService,
    private orderService: OrderService,
    private dischargeSummaryService: DischargeSummaryService,
    private modalService: NgbModal,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.isSummerySaved = false;
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    this.getpatientData();
    this.dischargeSummaryFilter = this.dischargeSummaryService.getActiveFilterDataById(this.patientId, 'dischargesummary');
    this.getDischargeSummery();

    this.timeArrayGenrate();
    // this.dischargeSummaryData = ['Javascript', 'Typescript'];
  }

  listOrderChanged(event) {
    // console.log(event);
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
  }

  getAppliedFilterData() {
    this.dischargeSummaryFilter = this.dischargeSummaryService.getActiveFilterDataById(this.patientId, 'dischargesummary');
    if (!this.dischargeSummaryFilter || this.dischargeSummaryFilter === null) {
      this.getComponentList();
    } else {
      this.getPatientVisitAllHistory();
    }
    //this.filterOrderList();
  }

  timeArrayGenrate() {
    if (this.timeFormateKey === '12_hour') {
      this.timeArray = this.genrate12HRtimearray();
    } else {
      for (let i = 0; i < 24; i++) {
        const time = (i < 10 ? '0' + i : i) + ':' + '00';
        const time1 = (i < 10 ? '0' + i : i) + ':' + '30';
        this.timeArray.push(time);
        this.timeArray.push(time1);
      }
    }
    this.updateValuesForDischarge();
  }

  genrate12HRtimearray() {
    const x = 30; //minutes interval
    const times = []; // time array
    let tt = 0; // start time
    const ap = ['AM', 'PM']; // AM-PM

    //loop to increment the time and push results in array
    for (var i = 0; tt < 24 * 60; i++) {
      var hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
      var mm = (tt % 60); // getting minutes of the hour in 0-55 format
      times[i] = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + ' ' + ap[Math.floor(hh / 12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
      tt = tt + x;
    }
    return times;
  }

  updateValuesForDischarge() {
    this.dischargeDate = new Date(moment(this.patientObj.actualDischargeDate).format('YYYY-MM-DD'));
    if (this.timeFormateKey === '12_hour') {
      this.dischargeTime.time = moment(this.patientObj.actualDischargeDate).format('hh:mm a');
    } else {
      this.dischargeTime.time = moment(this.patientObj.actualDischargeDate).format('HH:mm');
    }
  }

  onTimeChange(value) {
    if (value) {
      this.dischargeTime.time = value;
    } else {
      if (this.timeFormateKey === '12_hour') {
        this.dischargeTime.time = moment(this.patientObj.actualDischargeDate).format('hh:mm a');
      } else {
        this.dischargeTime.time = moment(this.patientObj.actualDischargeDate).format('HH:mm');
      }
    }
    this.updateActivePatientData();
  }

  openFilterPopup() {
    const messageDetails = {
      modalTitle: 'Filter',
      patientObj: this.patientObj,
      appliedFilter: this.dischargeSummaryFilter,
      type: 'dischargesummary'
    };
    const modalInstance = this.modalService.open(DischargeSummaryFilterComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'visit-modal'
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        if (this.isSummerySaved) {
          this.dischargeSummaryFilter = this.dischargeSummaryService.getActiveFilterDataById(this.patientId, 'dischargesummary');
          this.getAppliedFilterDataForSavedSummery();
          //this.filterOrderList();
        } else {
          this.getAppliedFilterData();
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
    const date1 = moment(this.patientObj.admissionDate);
    const date2 = moment(this.patientObj.actualDischargeDate);
    const days = date2.diff(date1, 'days');
    this.duration = days + ' Day(s)';
    this.dischargeSummaryFilter = this.dischargeSummaryService.getActiveFilterDataById(this.patientId, 'dischargesummary');
  }

  updateFilterObject(item, type, index) {
    if (type === 'date') {
      this.dischargeSummaryFilter.chartDateArray.splice(index, 1);
    }
    if (type === 'careTeam') {
      this.dischargeSummaryFilter.careTeamList.splice(index, 1);
    }
    if (type === 'section') {
      this.dischargeSummaryFilter.componentList.splice(index, 1);
    }
    this.dischargeSummaryService.setActiveFilterDataById(this.dischargeSummaryFilter);
    this.getPatientVisitAllHistory();
  }

  getPatientVisitAllHistory() {
    this.isFilterApplied = false;
    if (!this.dischargeSummaryFilter || (this.dischargeSummaryFilter
      && (this.dischargeSummaryFilter.careTeamList.length === 0 && this.dischargeSummaryFilter.chartDateArray.length === 0
        && this.dischargeSummaryFilter.componentList.length === 0 && this.dischargeSummaryFilter.filteredChartList.length === 0
        && this.dischargeSummaryFilter.showOptionList.length === 0))) {
          this.dischargeSummaryListByChart = [];
          // if only order list filter is applied in this case prepare orderd data only
          if (this.dischargeSummaryFilter && this.dischargeSummaryFilter.showOrderList.length) {
            this.isFilterApplied = true;
            const objOrderSummaryList = [];
            this.filterOrderList(objOrderSummaryList);
            this.prepareSummaryData(objOrderSummaryList);
          }
          return;
    }

    this.isFilterApplied = true;
    const chartIdArray = this.dischargeSummaryFilter && this.dischargeSummaryFilter.filteredChartList.length > 0 ?
      _.map(this.dischargeSummaryFilter.filteredChartList, dt => {
        return dt.chart.patient_chart_id;
      }) : [];
    const chartIds = chartIdArray;
    const param = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientId,
      dates: this.dischargeSummaryFilter && this.dischargeSummaryFilter.chartDateArray.length > 0 ?
        _.map(this.dischargeSummaryFilter.chartDateArray, dt => {
          return dt.date;
        }) : [],
      doctor_ids: this.dischargeSummaryFilter && this.dischargeSummaryFilter.careTeamList.length ?
        _.map(this.dischargeSummaryFilter.careTeamList, dt => {
          return dt.user.user_id;
        }) : [],
      section_keys: this.dischargeSummaryFilter && this.dischargeSummaryFilter.componentList.length > 0 ?
        _.map(this.dischargeSummaryFilter.componentList, dt => {
          return dt.section.section_key;
        }) : [],
      chart_ids: chartIds,
      // page_number: 1,
      // limit: 10,
      visit_no: this.patientObj.visitNo
    };

    // remove api side filter if chart and component both filters applied
    if (param.chart_ids.length > 0 && param.section_keys.length > 0) {
      param.chart_ids = [];
      param.section_keys = [];
    }

    this.dischargeSummaryService.getPatientVisitAllHistory(param).subscribe(res => {
      let chartData = [];
      const objSummaryList = [];
      this.dischargeSummary = [];
      if (res && res.length) {
        const tempSummary = res;
        _.map(tempSummary, ts => {
          const chartDate = moment(ts.consultation_datetime).format('DD-MM-YYYY HH:mm');
          const chartDocName = ts.doctor_name;
          const visitData = [];

          if (this.dischargeSummaryFilter && this.dischargeSummaryFilter.showOptionList.length) {
            this.dischargeSummaryFilter.showOptionList.forEach(element => {
              if (element.value === 'date') {
                visitData.push(chartDate);
              } else { // user
                visitData.push(chartDocName);
              }
            });
          } else {
            // visitData.push(chartDate);
          }
          // visitData.push(chartDocName);
          if (ts.chart_data) {
            // const tempChartData = ts.chart_data;
            chartData = [];
            _.map(ts.chart_data, (cVal, cKey) => { // cKey all sectoion name
              if (cKey === 'allergy_detail' && cVal && cVal.length) {
                this.pushComponentData('allergies', '', cVal, cKey, chartData);
              } else if (cKey === 'advice_detail' && cVal) {
                this.pushComponentData('advice', 'advice', cVal, cKey, chartData);
              } else if (cKey === 'annotation_detail' && cVal.length) {

              } else if (cKey === 'attachment_detail' && cVal.length) {

              } else if (cKey === 'pain_scale' && cVal && cVal.length) {
                this.pushComponentData('pain_scale', 'patient_pain_scale', cVal, cKey, chartData);
              } else if (cKey === 'relief_scale' && cVal && cVal.length) {
                this.pushComponentData('relief_scale', 'patient_relief_scale', cVal, cKey, chartData);
              } else if (cKey === 'complaint_detail' && cVal.length) {
                this.pushComponentData('complaints', 'complaint_name', cVal, cKey, chartData);
              } else if (cKey === 'diagnosis_detail' && cVal.length) {
                this.pushComponentData('diagnosis', 'diagnosis', cVal, cKey, chartData);
              } else if (cKey === 'followup_date_detail' && cVal.length) {
                this.pushComponentData('followup_date', 'next_appointment', cVal, cKey, chartData);
              } else if (cKey === 'vitals_detail' && cVal.length) {
                this.pushComponentData('vitals', '', cVal, cKey, chartData);
              } else if (cKey === 'prescription_detail' && cVal.length) {
                this.pushComponentData('prescription', '', cVal, cKey, chartData);
              } else if (cKey === 'investigation_detail' && cVal.length) {
                this.pushComponentData('investigation', '', cVal, cKey, chartData);
                this.pushComponentData('lab_investigation', '', cVal, cKey, chartData);
                this.pushComponentData('radiology_investigation', '', cVal, cKey, chartData);
              } else if (cKey === 'custom_template_detail' && cVal) {
                const tabular_summary = cVal.tabular_summary;
                this.pushComponentData('', '', tabular_summary, cKey, chartData);
                const template_summary = cVal.template_summary;
                this.pushComponentData('', '', template_summary, 'custom_template_summary', chartData);
              } else if (cKey === 'examination_detail' && cVal.length) {
                this.pushComponentData('', '', cVal, cKey, chartData);
              } else if (cKey === 'score_template_detail' && cVal.length) {
                this.pushComponentData('', '', cVal, cKey, chartData);
              } else if (cKey === 'chart_date_detail' && cVal.length) {
                this.pushComponentData('chart_date_time', '', cVal, cKey, chartData);
              } else if (cKey === 'chart_user_detail' && cVal.length) {
                this.pushComponentData('chart_user', '', cVal, cKey, chartData);
              }
            });
            if (chartData.length) {
              const dd: any = {
                visitData,
                chartData
              };
              if (this.dischargeSummaryFilter) {
                const indx = this.dischargeSummaryFilter.filteredChartList.findIndex((d: any) => {
                  return d.chart.patient_chart_id === ts.patient_chart_id;
                });
                if (indx !== -1) {
                  dd.chartId = this.dischargeSummaryFilter.filteredChartList[indx].chart.patient_chart_id;
                  dd.chartName = this.dischargeSummaryFilter.filteredChartList[indx].chart.chart_name;
                  objSummaryList.push(dd);
                } else {
                  if (this.dischargeSummaryFilter.componentList) {
                    const componentListFilter = this.dischargeSummaryFilter.componentList;
                    const chartComponentData = _.filter(chartData, (objChart) => {
                      return _.find(componentListFilter, (d) => {
                        return _.intersectionWith(d.section.chart_detail_ids, objChart.chartDetailIds, _.isEqual).length ? true : false;
                        // return d.section.section_type == objChart.sectionType && d.section.section_ref_id == objChart.sectionRefId
                        //      && d.section.section_name.trim().toUpperCase() == objChart.label.trim().toUpperCase();
                      });
                    });
                    if (chartComponentData.length) {
                      dd.chartData = chartComponentData;
                      dd.chartId = -1;
                      dd.chartName = '';
                      objSummaryList.push(dd);
                    }
                  } else {
                    dd.chartId = -1;
                    dd.chartName = '';
                    objSummaryList.push(dd);
                  }
                }
              } else {
                dd.chartId = -1; // -- putt dummy chart id for merge all section in one array
                dd.chartName = '';
                objSummaryList.push(dd);
              }
            }
          } else {
            console.log('No Chart Data found');
          }
        });
        this.filterOrderList(objSummaryList);
        this.prepareSummaryData(objSummaryList);
      }

      // Add order list data into discharge summary


    });
  }

  prepareSummaryData(obj) {
    this.dischargeSummaryListByChart = [];
    let mainObj: any;
    _.map(obj, (val, key) => {
      _.map(val.chartData, (listVal, listKey) => {
        mainObj = {
          label: '',
          visitorData: [],
          sectionKey: '',
          investigation_type: '',
          sectionType: '',
          sectionRefId: '',
          chartDetailIds: []
        };
        const newVisitData = { visitor: val.visitData, summaryData: listVal.val };

        mainObj.label = listVal.label;
        mainObj.sectionKey = listVal.sectionKey;
        mainObj.investigation_type = listVal.investigation_type;
        mainObj.sectionType = listVal.sectionType;
        mainObj.sectionRefId = listVal.sectionRefId;
        mainObj.chartDetailIds = listVal.chartDetailIds;
        mainObj.visitorData.push(newVisitData);

        const indx = this.dischargeSummaryListByChart.findIndex(d => d.chartId === val.chartId);
        if (indx !== -1) { // && val.chartId !== -1
          const summerIndx = _.findIndex(this.dischargeSummaryListByChart[indx].summery, (o) => o.label === listVal.label);
          if (summerIndx !== -1) {
            if (newVisitData.visitor.length) {
              this.dischargeSummaryListByChart[indx].summery[summerIndx].visitorData.push(newVisitData);
            } else {
              let existingKeySummeryData = this.dischargeSummaryListByChart[indx].summery[summerIndx].visitorData[0].summaryData;
              existingKeySummeryData = existingKeySummeryData.concat(newVisitData.summaryData);
              this.dischargeSummaryListByChart[indx].summery[summerIndx].visitorData[0].summaryData = _.uniq(existingKeySummeryData);
            }
          } else {
            this.dischargeSummaryListByChart[indx].summery.push(mainObj);
          }
        } else {
          this.dischargeSummaryListByChart.push({
            chartName: val.chartName,
            chartId: val.chartId,
            summery: [mainObj]
          });
        }

        // --- for save perpose
        const dsIndex = _.findIndex(this.dischargeSummary, (o) => o.label === listVal.label);
        if (dsIndex !== -1) {
          const visitorData = [...this.dischargeSummary[dsIndex].visitorData];
          visitorData.push({ ...newVisitData });
        } else {
          this.dischargeSummary.push({ ...mainObj });
        }
      });
    });
    this.dischargeSummaryListByChart = _.orderBy(this.dischargeSummaryListByChart, ['chartName'], ['asc']);
    const firstRecord = this.dischargeSummaryListByChart.shift();
    this.dischargeSummaryListByChart.push(firstRecord);
    if (this.dischargeSummaryListByChart.length) {
      this.setTemplateDisabled = false;
    }
    // // apply filters for components
    // if (this.dischargeSummaryFilter && this.dischargeSummaryFilter !== null) {
    //   const summery_list = _.cloneDeep(this.dischargeSummaryListByChart);
    //   _.map(this.dischargeSummaryListByChart, (chart, index) => {
    //     if (chart.chartName === '') {
    //       const newSummeryData = [];
    //       _.forEach(chart.summery, (summery, key) => {
    //         if (!summery || summery === undefined) {
    //           return;
    //         }
    //         const findIndex = _.findIndex(this.dischargeSummaryFilter.componentList, comp => comp.section.section_name === summery.label);
    //         if (findIndex !== -1) {
    //           newSummeryData.push(summery);
    //         }
    //       });
    //       chart.summery = newSummeryData;
    //     }
    //   });
    // }
  }

  saveDischargeSummery(): void {
    const dischargedList = [];
    this.dischargeSummaryListByChart.forEach(dischargeSummery => {
      if (dischargeSummery.chartId !== -1) {
        // chart data save as json with section key as chart_data with chartId
        const temp = {
          investigation_type: '',
          section_key: 'chart_data_' + dischargeSummery.chartId,
          label: dischargeSummery.chartName,
          visit_data: [],
          chart_data: [],
          chart_json: dischargeSummery.summery
        };
        const dsIndex = _.findIndex(dischargedList, (o) => o.label === dischargeSummery.chartName);
        if (dsIndex !== -1) {
          dischargedList[dsIndex].visit_data = dischargedList[dsIndex].visit_data.concat(temp.visit_data);
          dischargedList[dsIndex].chart_data = dischargedList[dsIndex].chart_data.concat(temp.chart_data);
          dischargedList[dsIndex].chart_json = dischargedList[dsIndex].chart_json.concat(temp.chart_json);
        } else {
          dischargedList.push(temp);
        }
      } else {
        dischargeSummery.summery.forEach(sum => {
          const temp = {
            investigation_type: sum.investigation_type,
            section_key: sum.sectionKey,
            label: sum.label,
            visit_data: [],
            chart_data: [],
            chart_json: []
          };
          sum.visitorData.forEach(data => {
            temp.visit_data = data.visitor;
            temp.chart_data = sum.sectionKey === 'custom_template_detail' ? [] : data.summaryData;
            temp.chart_json = sum.sectionKey === 'custom_template_detail' ? data.summaryData : [];
          });
          // dischargedList.push(temp);c
          const dsIndex = _.findIndex(dischargedList, (o) => o.label === sum.label);
          if (dsIndex !== -1) {
            dischargedList[dsIndex].visit_data = dischargedList[dsIndex].visit_data.concat(temp.visit_data);
            dischargedList[dsIndex].chart_data = dischargedList[dsIndex].chart_data.concat(temp.chart_data);
            dischargedList[dsIndex].chart_json = dischargedList[dsIndex].chart_json.concat(temp.chart_json);
          } else {
            dischargedList.push(temp);
          }
        });
      }
    });
    _.map(this.allOrderData, odr => {
      const temp = {
        investigation_type: odr.dataDisplayType,
        section_key: odr.type,
        label: odr.name,
        chart_data: odr.data,
        visit_data: [],
        chart_json: odr.dataOrder
      };
      dischargedList.push(_.cloneDeep(temp));
    });

    const reqParams = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo,
      discharge_data: dischargedList,
      actualDischargeDate: new Date(moment(this.dischargeDate).format('YYYY-MM-DD') + ' ' + this.dischargeTime.time)
    };
    // return;
    this.dischargeSummaryService.saveDischargeSummery(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.alertMsg = {
          messageType: 'success',
          message: res.message,
          duration: Constants.ALERT_DURATION
        };
        // this.getPatientChartData();
        this.printChartData = null;
        this.printChartData = {
          patientData: this.patientObj,
          chartData: this.dischargeSummaryListByChart,
          ordersData: this.allOrderData,
          // chartComponent: this.patientChartService.getChartDetailsByChartId(this.chartId)
        };
      } else {
        this.alertMsg = {
          messageType: 'danger',
          message: res.message,
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  updateDischargeDate(val) {
    this.dischargeDate = val;
    this.updateActivePatientData();
  }

  updateActivePatientData() {
    this.patientObj.actualDischargeDate = moment(this.dischargeDate).format('YYYY-MM-DD') + ' ' + this.dischargeTime.time
    const patient = _.cloneDeep(this.patientObj);
    this.commonService.updateActivePatientDataList(patient);
  }

  generateCustomScoreTemplateSummary(array): any {
    const tags: Array<{ value: any, name: string }> = [];
    array = _.isObject(array) ? [array] : array;
    array.forEach(template => {
      if (template === undefined) {
        return;
      }
      let questionString = '';
      _.map(template.question_list, (question, key) => {
        questionString += `\n ${key + 1}. ${question.question_name}`;
        question.answer_option_list.forEach(ansOption => {
          if (+question.selected_optionValue === ansOption.options_value) {
            questionString += `\n ${ansOption.option_label} - ${question.selected_optionValue}`;
          }
        });
      });
      let noteString = '';
      questionString += `\n Note:`;
      _.map(template.summary_options, (summary, skey) => {
        let summaryOperator = '';
        if (summary.summary_operator !== 'In Between') {
          summaryOperator = summary.summary_operator === '>' ? 'greater than' :
            summary.summary_operator === '<' ? 'less than' :
              summary.summary_operator === '>=' ? 'or greater' :
                summary.summary_operator === '<=' ? 'or less' :
                  summary.summary_operator === '=' ? 'equal' : '';
          noteString += 'If Your Score is ' + summary.summary_value + ' ' + summaryOperator + ' ' + summary.summary_text;
        } else if (summary.summary_operator !== 'In Between') {
          noteString += 'If Your Score is ' + summary.summary_max_value + 'between' + summary.summary_min_value + ' ' + summary.summary_text;
        }
        questionString += `\n ${skey + 1}. ${noteString}`;
      });
      const summaryText = template.template_calc_Type === 'sum' ? 'Total score is'
        : template.template_calc_Type === 'average' ? 'Average Score is' : '';
      questionString += `\n ${summaryText + ' - ' + template.templatecalcvalue}`;
      tags.push({ value: questionString, name: template.chart_section_name });
    });
    return tags;
  }

  generateCustomTemplateSummary(array): any {
    const tags: Array<{ value: any, name: string }> = [];
    const templates = _.uniqBy(array, 'template_id');
    templates.forEach(template => {
      const forms = _.uniqBy(array.filter(a => a.template_id === template.template_id), 'form_id');
      forms.forEach(form => {
        let tag = '<b>' + form.form_summary_heading + '</b>';
        const queGroups = _.uniqBy(array.filter(a => a.form_id === form.form_id), 'que_group_id');
        queGroups.forEach(queGroup => {
          tag += `\n ` + (queGroup.que_group_heading ? ('<br /> ' + queGroup.que_group_heading) : '');
          const questions = _.uniqBy(array.filter(a => a.que_group_id === queGroup.que_group_id), 'question_id');
          questions.forEach(question => {
            // var objAnswers = get unique answers by que id from array;
            const objStorySeting = question.story_setting;
            let storyTag = objStorySeting.replace('#Title#', 'Mr.').replace('#PatientName#', this.patientObj.patientData.name);

            const answers = array.filter(a => a.question_id === question.question_id);
            if (storyTag !== '') {
              answers.forEach(answer => {
                const replaceTag = ('#Answer' + answer.answer_row_id + '#');
                storyTag = storyTag.replace(replaceTag, answer.answer_text);
              });
            } else {
              answers.forEach(answer => {
                storyTag += ' ' + answer.answer_text;
              });
            }
            // remaining Answer tags need to remove
            if (storyTag.indexOf('#Answer') !== -1) {
              for (let i = 1; i < 50; i++) {
                const replaceTag = ('#Answer' + i + '#');
                storyTag = storyTag.replace(replaceTag, '');
              }
            }
            if (storyTag && storyTag !== null && storyTag !== '') {
              tag += '\n <br /> > ' + storyTag;
            }
          });
        });
        tags.push({ value: tag, name: template.chart_section_name });
      });
    });
    return [...tags];
  }

  getDischargeSummery(): void {
    const req = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo
    };
    this.dischargeSummaryService.getDischargeSummary(req).subscribe(res => {
      this.dischargeSummaryListByChart = [];
      this.allOrderData = [];
      this.allOrderDataClone = [];
      if (res.length) {
        this.isSummerySaved = true;
        res.forEach((val: any) => {
          const chartCompObj = {
            chartId: -1, chartName: '', summery: []
          };
          // check for chart data by section key as chart_data with chartId
          const chartDetail = val.section_key.split('chart_data_');
          if (chartDetail.length === 2) {
            chartCompObj.chartId = chartDetail[1];
            chartCompObj.chartName = val.label;
            chartCompObj.summery = val.chart_json;
          } else {
            const mainObj = {
              label: '',
              visitorData: [],
              sectionKey: '',
              investigation_type: ''
            };
            const newVisitData = {
              visitor: val.visit_data,
              summaryData: val.section_key === 'custom_template_detail' ? val.chart_json : val.chart_data
            };
            mainObj.label = val.label;
            mainObj.sectionKey = val.section_key;
            mainObj.investigation_type = val.investigation_type;
            mainObj.visitorData.push(newVisitData);
            chartCompObj.summery.push(mainObj);
          }
          this.dischargeSummaryListByChart.push(chartCompObj);
        });
        this.dischargeSummaryListByChartClone = _.clone(this.dischargeSummaryListByChart);
        this.getAppliedFilterDataForSavedSummery();
        // this.allOrderDataClone = {};
        // _.map(this.allOrderData, odr => {
        //   this.allOrderDataClone[odr.type] = odr.dataOrder;
        // });
      } else {
        this.isSummerySaved = false;
        this.getAllOrdersList();
        this.getComponentList().subscribe((res) => {
          this.getPatientVisitAllHistory();
          // this.getAppliedFilterData();
        });
      }
    });
  }

  preview(): void {
    this.printChartData = null;
    this.printChartData = {
      patientData: this.patientObj,
      chartData: this.dischargeSummaryListByChart,
      ordersData: this.allOrderData,
      // chartComponent: this.patientChartService.getChartDetailsByChartId(this.chartId)
    };
  }

  getComponenetData(dataList, chartDetailId) {
    const chartDetailData = _.filter(dataList, (o) =>
      o.chart_detail_id === chartDetailId
    );
    return chartDetailData;
  }

  pushComponentData(sectionKey, fieldName, cVal, cKey, chartData) {
    let dataResult = [];
    const sectionType = (cKey === 'custom_template_detail' || cKey === 'custom_template_summary') ? 'CUSTOM_TEMPLATES' :
      (cKey === 'examination_detail') ? 'EXAMINATION_HEADS' :
        (cKey === 'score_template_detail') ? 'SCORE_TEMPLATES' : '';

    // const compList = (!this.dischargeSummaryFilter || this.dischargeSummaryFilter === null) ? this.defaultComponentList : this.dischargeSummaryFilter.componentList;
    const compList = this.defaultComponentList;
    if (sectionType !== '') {
      dataResult = _.filter(compList, (o) => {
        return o.section.section_type === sectionType;
      });
    } else {
      dataResult = _.filter(compList, (o) => {
        return o.section.section_key === sectionKey;
      });
    }
    _.forEach(dataResult, (r) => {
      _.forEach(r.section.chart_detail_ids, (chartId) => {
        const dataIndex = cVal.findIndex((index) => index.chart_detail_id === chartId);
        const dataArray = _.filter(cVal, val => {
          return val.chart_detail_id === chartId;
        });
        if (dataIndex > -1) {
          if (cKey === 'advice_detail' || cKey === 'complaint_detail' || cKey === 'diagnosis_detail'
          || cKey === 'followup_date_detail' || cKey === 'pain_scale' || cKey === 'relief_scale') {
            const newArray = [];
            _.map(dataArray, v => {
              if (v[fieldName]) { newArray.push(v[fieldName] + ''); }
            });
            chartData.push({ label: r.section.section_name, val: newArray, sectionKey: cKey,
              sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id,
              chartDetailIds: r.section.chart_detail_ids });
          } else if (cKey === 'vitals_detail') {
            const newArray = [];
            _.map(dataArray, v => {
              const str = `${v.vital_name}(${v.vital_text})`;
              newArray.push(str);
            });
            chartData.push({ label: r.section.section_name, val: newArray, sectionKey: cKey, sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids });
          } else if (cKey === 'prescription_detail') {
            const newArray = [];
            _.map(dataArray, v => {
              const invVal = `${v.medicine.medicine_name}(${v.type.name})`;
              newArray.push(invVal);
            });
            chartData.push({ label: r.section.section_name, val: newArray, sectionKey: cKey, sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids });
          } else if (cKey === 'allergy_detail') {
            const temp = [];
            _.map(dataArray, (aVal: any) => {
              if (aVal.allergy_type === 'Medicine Allergy') {
                temp.push(aVal.medicine_name + ' (' + aVal.remarks + ')');
              } else {
                temp.push(aVal.allergy_type + ' (' + aVal.remarks + ')');
              }
            });
            chartData.push({ label: 'Allergy Detail', val: temp, sectionKey: cKey, sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids });
          } else if (cKey === 'investigation_detail') {
            const labInvArray = [];
            const radioInvArray = [];
            const mixInvArray = [];
            _.map(dataArray, investigation => {
              if (investigation.source === 'lab_investigation') {
                const invVal = investigation.investigation + (investigation.comment ? '(' + investigation.comment + ')' : '');
                // const invVal = investigation.investigation_type + ': ' + investigation.investigation + ' (' + investigation.comment + ')';
                labInvArray.push(invVal);
              } else if (investigation.source === 'radiology_investigation') {
                const invVal = investigation.investigation + (investigation.comment ? '(' + investigation.comment + ')' : '');
                radioInvArray.push(invVal);
              } else if (investigation.source === Constants.investigationKey) {
                const invVal = investigation.investigation + (investigation.comment ? '(' + investigation.comment + ')' : '');
                mixInvArray.push(invVal);
              }
            });
            if (radioInvArray.length) { chartData.push({ label: r.section.section_name, val: radioInvArray, sectionKey: cKey, investigation_type: 'Radiology', sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids }); }
            if (labInvArray.length) { chartData.push({ label: r.section.section_name, val: labInvArray, sectionKey: cKey, investigation_type: 'Lab', sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids }); }
            if (mixInvArray.length) { chartData.push({ label: r.section.section_name, val: mixInvArray, sectionKey: cKey, investigation_type: null, sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids }); }
          } else if (cKey === 'custom_template_detail') {
            const tags = dataArray; // cVal; changed by sagar 15/07/2021
            tags.forEach(t => {
              chartData.push({ label: t.chart_section_name, val: [t], sectionKey: cKey, sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids });
            });
          } else if (cKey === 'custom_template_summary') {
            const tags = this.generateCustomTemplateSummary(dataArray);
            tags.forEach(t => {
              chartData.push({
                label: t.name, val: [t.value],
                sectionKey: cKey, sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids
              });
            });
          } else if (cKey === 'examination_detail') {
            _.map(dataArray, (comp: any) => {
              chartData.push({ label: comp.chart_section_name, val: [comp.examination_text], sectionKey: cKey, sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids });
            });
          } else if (cKey === 'score_template_detail') {
            _.map(dataArray, v => {
              const tags = this.generateCustomScoreTemplateSummary(v);
              tags.forEach(t => {
                chartData.push({
                  label: t.name, val: [t.value],
                  sectionKey: cKey, sectionType: r.section.section_type, sectionRefId: r.section.section_ref_id, chartDetailIds: r.section.chart_detail_ids
                });
              });
            });
          } else if (cKey === 'chart_date_detail') {
            const temp = [];
            let chart_date = null;
            _.map(dataArray, (v, i) => {
              const data = v;
              if (i === 0) {
                chart_date = (data.chart_date) ? moment(data.chart_date).format('YYYY-MM-DD HH:mm:ss') : 'Chart Date Time';
              }
              temp.push(data.chart_date);
            });
            chartData.push({
              label: chart_date,
              val: temp, sectionKey: cKey,
              sectionType: r.section.section_type,
              sectionRefId: r.section.section_ref_id,
              chartDetailIds: r.section.chart_detail_ids
            });
          } else if (cKey === 'chart_user_detail') {
            const temp = [];
            let user_full_name = null;
            _.map(dataArray, (v, i) => {
              const data = v;
              if (i === 0) {
                user_full_name = (data.user_full_name) ? data.user_full_name : 'Chart User'
              }
              temp.push(v.user_full_name);
            });
            chartData.push({
              label: user_full_name,
              val: temp, sectionKey: cKey,
              sectionType: r.section.section_type,
              sectionRefId: r.section.section_ref_id,
              chartDetailIds: r.section.chart_detail_ids
            });
          }
        }
      });
    });
  }

  openSetTempatePopup(): any {
    if (this.setTemplateDisabled) {
      this.alertMsg = {
        messageType: 'danger',
        message: 'Please Choose Chart OR Component From Filter',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    // const messageDetails = {
    //   modalTitle: 'Filter',
    //   filters: {orderBy: this.orderByRecords, approvedBy: this.approvedByRecords}
    // };
    const modalInstance = this.modalService.open(AddUpdateDischargeTemplateComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'add-edit-order-set-modal'
      });
    modalInstance.result.then((result) => {
      if (result) {
        this.alertMsg = {
          message: 'Template Saved Successfully',
          messageType: 'success',
          duration: 3000
        };
      }
    });
    const formattedData = this.prepareDataForTemplateDisplay();
    modalInstance.componentInstance.templateData = formattedData;
    // modalInstance.componentInstance.serviceType = this.patientObj.serviceType;
  }

  prepareDataForTemplateDisplay(): any {
    if (!this.dischargeSummaryListByChart.length) {
      return null;
    }
    const chartArray = [];
    const componentArray = [];
    // filter
    _.forEach(this.dischargeSummaryFilter.filteredChartList, (chartFilter) => {
      const chartObj = {
        chartName: chartFilter.chart.chart_name,
        chartId: chartFilter.chart.patient_chart_id
      };
      chartArray.push(chartObj);
    });
    _.forEach(this.dischargeSummaryListByChart, (ds) => {
      if (ds.chartName === '') {
        if (ds.summery.length) {
          _.forEach(ds.summery, (summaryItems) => {
            const componentObj = {
              sectionName: summaryItems.label,
              sectionType: summaryItems.sectionType,
              sectionRefId: summaryItems.sectionRefId,
              sectionKey: summaryItems.sectionKey,
              chartDetailIds: summaryItems.chartDetailIds,
              displayType: (summaryItems.dataDisplayType === 'bullet' || summaryItems.dataDisplayType === 'comma') ? summaryItems.dataDisplayType : 'Not Selected',
            };
            componentArray.push(componentObj);
            // const compListObject = _.find(this.dischargeSummaryFilter.componentList, (o) => )
          });
        }
      }
    });
    return { charts: chartArray, components: componentArray };
  }

  getComponentList(): Observable<any> {
    return this.dischargeSummaryService.getPatientChartComponentList(this.patientObj.patientData.id, this.patientObj.serviceType.id, this.patientObj.visitNo,  0).pipe(map((res: any) => {
      this.updateComponentData(res);
      // return res.data;
    }));
  }

  updateComponentData(res): void {
    const arrayData = _.map(res, d => {
      return { isChecked: false, section: d };
    });
    this.defaultComponentList = _.cloneDeep(arrayData);
  }

  getAllOrdersList() {
    const params = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo
    };
    this.orderService.getOrderDetailsByIpdId(params, true).subscribe(res => {
      this.allOrderDataClone = _.cloneDeep(res);
      // this.filterOrderList(); // on load not shown any order data without filter..
    });
  }

  filterOrderList(objSummaryList: any) {
    if (this.dischargeSummaryFilter && this.dischargeSummaryFilter.showOrderList.length > 0) {
      _.map(this.dischargeSummaryFilter.showOrderList, d => {
        if (this.allOrderDataClone[d.value].length > 0) {
          const name = d.value.substring(0, d.value.indexOf('Orders'));
          const chartData = [];
          chartData.push({
            label: this.orderNamecapitalize(name) + ' Orders',
            val: this.getOrderData(this.allOrderDataClone[d.value], d.value),
            sectionKey:  d.value,
            sectionType: 'service_order',
            sectionRefId: -1,
            chartDetailIds: [-1]
          });
          const dd: any = {
            visitData: [],
            chartData,
            chartId: -1,
            chartName: ''
          };
          objSummaryList.push(dd);
        }
      });
    }
    return objSummaryList;

    // this.allOrderData = [];
    // if (this.dischargeSummaryFilter && this.dischargeSummaryFilter.showOrderList.length > 0) {
    //   _.map(this.dischargeSummaryFilter.showOrderList, d => {
    //     if (this.allOrderDataClone[d.value].length > 0) {
    //       const name = d.value.substring(0, d.value.indexOf('Orders'));
    //       const obj = {
    //         type: d.value,
    //         dataOrder: this.allOrderDataClone[d.value],
    //         data: this.getOrderData(this.allOrderDataClone[d.value], d.value),
    //         name: this.orderNamecapitalize(name) + ' Orders',
    //         isShow: false,
    //         dataDisplayType: null
    //       };
    //       this.allOrderData.push(_.cloneDeep(obj));
    //     }
    //   });
    // }
    // without filter not shown in orders data - SagarJ 16/07/2021
    // else {
    //   const keys = Object.keys(this.allOrderDataClone);
    //   _.map(keys, k => {
    //     if (this.allOrderDataClone[k].length > 0) {
    //       const name = k.substring(0, k.indexOf('Orders'));
    //       const obj = {
    //         type: k,
    //         dataOrder: this.allOrderDataClone[k],
    //         data: this.getOrderData(this.allOrderDataClone[k], k),
    //         name: this.orderNamecapitalize(name) + ' Orders',
    //         isShow: false,
    //         dataDisplayType: null
    //       };
    //       this.allOrderData.push(_.cloneDeep(obj));
    //     }
    //   })
    // }
  }

  getOrderData(data, type) {
    const dataArray = [];
    if (type === 'medicineOrders') {
      _.map(data, d => {
        dataArray.push(_.cloneDeep(d.medicineObj.name));
      });
    } else {
      _.map(data, d => {
        dataArray.push(_.cloneDeep(d.name));
      });
    }
    // else if (type === 'dietOrders') {
    //   _.map(data, d => {
    //     dataArray.push(_.cloneDeep(d.name));
    //   });
    // } else if (type === 'instructionOrders') {
    //   _.map(data, d => {
    //     dataArray.push(_.cloneDeep(d.name));
    //   });
    // } else if (type === 'labOrders') {
    //   _.map(data, d => {
    //     dataArray.push(_.cloneDeep(d.name));
    //   });
    // } else if (type === 'radiologyOrders') {
    //   _.map(data, d => {
    //     dataArray.push(_.cloneDeep(d.name));
    //   });
    // } else if (type === 'nursingOrders') {
    //   _.map(data, d => {
    //     dataArray.push(_.cloneDeep(d.name));
    //   });
    // } else if (type === 'serviceOrders') {
    //   _.map(data, d => {
    //     dataArray.push(_.cloneDeep(d.name));
    //   });
    // }
    return dataArray;
  }

  orderNamecapitalize(name) {
    if (typeof name !== 'string') {
      return '';
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getAppliedFilterDataForSavedSummery() {
    // apply filters for components
    if (this.dischargeSummaryFilter && this.dischargeSummaryFilter !== null) {
      const summery_list = _.cloneDeep(this.dischargeSummaryListByChartClone);
      _.map(summery_list, (chart, index) => {
        if (chart.chartName === '') {
          const newSummeryData = [];
          _.forEach(chart.summery, (summery, key) => {
            if (!summery || summery === undefined) {
              return;
            }
            if (this.dischargeSummaryFilter.componentList.length > 0) {
              const findIndex = _.findIndex(this.dischargeSummaryFilter.componentList, comp => comp.section.section_name === summery.label);
              if (findIndex !== -1) {
                newSummeryData.push(summery);
              }
            } else {
              newSummeryData.push(summery);
            }
          });
          chart.summery = newSummeryData;
        }
      });
      this.isFilterApplied = true;
      this.dischargeSummaryListByChart = summery_list;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dischargeSummaryListByChart, event.previousIndex, event.currentIndex);
  }

}

import { AuthService } from './../../../public/services/auth.service';
import { CommonService } from './../../../public/services/common.service';
import { Component, OnInit, Input, OnChanges, forwardRef } from '@angular/core';
import * as _ from 'lodash';
import { environment } from './../../../../environments/environment';
import { Constants } from './../../../config/constants';
import { ModifyCustomTemplateData } from './../../../shared/pipes/modify-custom-template-data';
import { VitalsDataService } from './../../../public/services/vitals-data.service';
import { ScoreTemplateService } from './../../../public/services/score-template.service';
import { PatientChartService } from 'src/app/patient-chart/patient-chart.service';
import { IAlert } from 'src/app/public/models/AlertMessage';

@Component({
  selector: 'app-all-components-data-display',
  templateUrl: './all-components-data-display.component.html',
  styleUrls: ['./all-components-data-display.component.scss']
})
export class AllComponentsDataDisplayComponent implements OnInit, OnChanges {
  @Input() chartData: any;
  @Input() chartComponentList: any;
  @Input() public source: string;
  @Input() vitalsList: Array<any>;
  @Input() chartDetails: any;
  @Input() showCopyIcon = true;

  setAlertMessage: IAlert;
  printChartDataList: Array<any> = [];
  chartInfo = null;
  chartSectionData = null;
  patientObj: any;
  patientId: any;
  specialtyId: number;
  serviceTypeId: number;
  vitalDataList = [];
  public fileServePath = environment.FILE_SERVER_IMAGE_URL;

  constructor(
    private modifyCustomTemplateData: ModifyCustomTemplateData,
    private vitalsDataService: VitalsDataService,
    private scoretemplateService: ScoreTemplateService,
    private commonService: CommonService,
    private patientChartService: PatientChartService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // console.log(this.chartData, this.chartComponentList);
    // this.chartInfo = this.chartData;
    // this.chartSectionData = this.chartInfo.chart_data || this.chartInfo.chartData;
    // if (this.chartSectionData) {
    //   this.updateObjectSequenceWise();
    // }
  }

  ngOnChanges() {
    // console.log(this.chartData, this.chartComponentList);
    this.chartInfo = this.chartData;
    this.chartComponentList = this.chartComponentList || this.chartInfo.chart_components;
    this.chartSectionData = this.chartInfo.chart_data || this.chartInfo.chartData;
    this.getpatientData();
    if (this.patientObj.isViewOnlyPat) {
      this.showCopyIcon = false;
    }
    if (this.vitalsList) {
      if (this.chartSectionData) {
        this.updateObjectSequenceWise();
      }
    }
  }

  getAllVitalsDataList() {
    if (this.serviceTypeId && this.specialtyId) {
      const param = {
        service_type_id: this.serviceTypeId,
        speciality_id: this.specialtyId
      };
      this.vitalsDataService.getConsultationVitalsList(param).subscribe(res => {
        this.vitalDataList = res;
        _.map(this.vitalDataList, dt => {
          dt.vital.value = null;
          dt.isUsedInFormula = false;
          dt.tooltip = '';
          dt.color = null;
          dt.vitalFormulaId = null;
          if (dt.clubbedVital) {
            dt.clubbedVital.value = null;
            dt.clubbedVitalData.tooltip = '';
            dt.clubbedVitalData.color = null;
          }
        });
        this.updateObjectSequenceWise(this.vitalDataList);
      });
    }
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
    const userObj = this.authService.getUserInfoFromLocalStorage();
    this.specialtyId = userObj.speciality_id;
    this.serviceTypeId = this.patientObj.serviceType.id;
    if (!this.vitalsList) {
      if (this.chartSectionData) {
        this.getAllVitalsDataList();
      }
    }
  }


  updateObjectSequenceWise(vitalsList?): void {
    this.printChartDataList = [];
    const chartCompList = _.orderBy(this.chartComponentList, 'sequence');
    _.map(chartCompList, comp => {
      const chartTempData = {};
      let chartSelectedData = null;
      if (comp.section_key === 'image_annotation' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.annotation_detail) {
          const selectedData = this.getComponenetData(this.chartSectionData.annotation_detail, comp.chart_detail_id);
          chartSelectedData = selectedData;
        }
      } else if (comp.section_key === 'human_body' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.pain_body_details) {
          chartSelectedData = this.getComponenetData(this.chartSectionData.pain_body_details, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'allergies' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.allergy_detail
          && this.chartSectionData.allergy_detail.length) {
          const selectedData = this.getComponenetData(this.chartSectionData.allergy_detail, comp.chart_detail_id);
          if (selectedData.length > 0 && selectedData[0].is_allergy_selected !== 'no_select') {
            chartSelectedData = selectedData[0].allergy_data;
          }
          // chartSelectedData = {
          //   allergy: this.chartSectionData.allergy_detail.is_allergy_selected,
          //   data: this.chartSectionData.allergy_detail.allergy_data
          // };
        }
      } else if (comp.section_key === 'foot_examination' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.pain_foot_details) {
          chartSelectedData = this.getComponenetData(this.chartSectionData.pain_foot_details, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'advice' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.advice_detail) {
          const selectedData = this.getComponenetData(this.chartSectionData.advice_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }
      } else if (comp.section_key === 'complaints' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.complaint_detail) {
          chartSelectedData = this.getComponenetData(this.chartSectionData.complaint_detail, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'diagnosis' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.diagnosis_detail) {
          chartSelectedData = this.getComponenetData(this.chartSectionData.diagnosis_detail, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'pain_scale' && comp.section_type === 'CONSULTATION_SECTION') {
        if ((this.chartSectionData.pain_scale !== null
          || this.chartSectionData.pain_scale !== '')
          && this.chartSectionData.pain_scale.length) {
          const selectedData = this.getComponenetData(this.chartSectionData.pain_scale, comp.chart_detail_id);
          chartSelectedData = selectedData.length > 0 ? selectedData[0].patient_pain_scale : null;
        }
      } else if (comp.section_key === 'investigation' && comp.section_type === 'CONSULTATION_SECTION') {
        const invData = _.filter(this.chartSectionData.investigation_detail, dt => {
          return dt.source === comp.section_key;
        });
        if (invData.length > 0) {
          // chartSelectedData = invData;
          chartSelectedData = this.getComponenetData(invData, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'lab_investigation' && comp.section_type === 'CONSULTATION_SECTION') {
        const invData = _.filter(this.chartSectionData.investigation_detail, dt => {
          return dt.source === comp.section_key;
        });
        if (invData.length > 0) {
          // chartSelectedData = invData;
          chartSelectedData = this.getComponenetData(invData, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'radiology_investigation' && comp.section_type === 'CONSULTATION_SECTION') {
        const invData = _.filter(this.chartSectionData.investigation_detail, dt => {
          return dt.source === comp.section_key;
        });
        if (invData.length > 0) {
          // chartSelectedData = invData;
          chartSelectedData = this.getComponenetData(invData, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'prescription' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.prescription_detail) {
          chartSelectedData = this.getComponenetData(this.chartSectionData.prescription_detail, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'vitals' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.vitals_detail && this.chartSectionData.vitals_detail.length > 0) {
          const selectedData = this.getComponenetData(this.chartSectionData.vitals_detail, comp.chart_detail_id);
          chartSelectedData = this.vitalsDataService.getVitalsDisplay(selectedData, vitalsList);
        }
      } else if (comp.section_key === 'pain_relief' && comp.section_type === 'CONSULTATION_SECTION') {
        if ((this.chartSectionData.relief_scale !== null
          || this.chartSectionData.relief_scale !== '')
          && this.chartSectionData.relief_scale.length) {
          // chartSelectedData = this.chartSectionData.relief_scale.patient_relief_scale;
          const selectedData = this.getComponenetData(this.chartSectionData.relief_scale, comp.chart_detail_id);
          chartSelectedData = selectedData.length > 0 ? selectedData[0].patient_relief_scale : null;
        }
      } else if (comp.section_key === 'attachment' && comp.section_type === 'CONSULTATION_SECTION') {
        // if (this.chartSectionData.attachment_detail && this.chartSectionData.attachment_detail.length > 0) {
        //   const listAttachment = this.getComponenetData(this.chartSectionData.attachment_detail, comp.chart_detail_id);
        //   const attachmentData = _.map(listAttachment, item => {
        //     if (this.isImage(item)) {
        //       item.file_type = 'img';
        //     } else {
        //       item.file_type = 'pdf';
        //     }
        //     return item;
        //   });
        // }
      } else if (comp.section_type === 'EXAMINATION_HEADS') {
        const exmData = _.filter(this.chartSectionData.examination_detail, exm => {
          return exm.examination_head_id === comp.section_ref_id;
        });
        if (exmData.length > 0) {
          // chartSelectedData = exmData;
          chartSelectedData = this.getComponenetData(exmData, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'followup_date' && comp.section_type === 'CONSULTATION_SECTION') {
        // chartSelectedData = this.chartSectionData.followup_date_detail;
        if (this.chartSectionData.followup_date_detail.length) {
          const selectedData = this.getComponenetData(this.chartSectionData.followup_date_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }

      } else if (comp.section_type === 'CUSTOM_TEMPLATES') {
        // if data not in dispay format
        let templateData = _.cloneDeep(this.chartSectionData.custom_template_detail);
        if (templateData.template_summary == undefined
          && templateData.tabular_summary == undefined) {
          templateData = this.formatCustomTemplateData(templateData, comp);
        }

        // chartSelectedData = this.chartSectionData.custom_template_detail;
        let temp = this.getComponenetData(templateData.tabular_summary, comp.chart_detail_id);
        const list = _.filter(templateData.template_summary, exm => {
          return exm.template_id === comp.section_ref_id;
        });
        if (list.length > 0 || temp.length > 0) {
          const modifyTemplateData = this.modifyCustomTemplateData.transform(list);
          chartSelectedData = {
            tabular_summary: temp,
            template_summary: modifyTemplateData
          };
        } else {
          return;
        }
      } else if (comp.section_type === 'SCORE_TEMPLATES') {
        comp.section_key = comp.section_type;
        const list = this.getComponenetData(this.chartSectionData.score_template_detail, comp.chart_detail_id);

        // const list = this.printData.chartData.chart_data.score_template_detail;
        if (list.length) {
          // const findTemplateObj = _.find(_.clone(this.scoretemplateService.scoreTemplateList), (o) => o.score_template_id === list[0].template_id);
          // if (!_.isUndefined(findTemplateObj)) {
          //     _.forEach(findTemplateObj.question_list, (o) => { o.selected_optionValue = ''; });
          //     _.forEach(list, (r) => {
          //         const questionObj = _.find(findTemplateObj.question_list, (q) => q.question_id === r.question_id);
          //         questionObj.selected_optionValue = +r.answer_text;
          //     });
          //     chartSelectedData = [this.scoretemplateService.getCalTemplateValue(_.clone(findTemplateObj))];
          // }

          // -- vikram
          // list.forEach(templateObj => {
          //   this.scoretemplateService.getCalTemplateValue(_.clone(templateObj));
          // });
          chartSelectedData = list;
        }
      } else if (comp.section_key === 'chart_date_time' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.chart_date_detail.length) {
          const selectedData = this.getComponenetData(this.chartSectionData.chart_date_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }
      } else if (comp.section_key === 'chart_user' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.chart_user_detail.length) {
          const selectedData = this.getComponenetData(this.chartSectionData.chart_user_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }
      } else if (comp.section_key === 'chart_user' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.chartSectionData.chart_user_detail.length) {
          const selectedData = this.getComponenetData(this.chartSectionData.chart_user_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }
      }
      if (chartSelectedData) {
        chartTempData['data'] = chartSelectedData;
        chartTempData['secType'] = comp.section_key;
        chartTempData['secMasterType'] = comp.section_type;
        chartTempData['displayName'] = comp.section_name;
        chartTempData['chartVisitId'] = this.chartInfo.visit_detail_id;
        chartTempData['chartVisitNo'] = this.chartInfo.visit_no;
        chartTempData['chartVisitDate'] = this.chartInfo.visit_date;
        this.printChartDataList.push(_.cloneDeep(chartTempData));
      }
    });
    // return of(this.printChartDataList);
  }

  // this function is useful from custom chart when data is not saved
  // then reform the data in required fromat
  formatCustomTemplateData = function (templateData, comp) {
    let result = {
      tabular_summary: [],
      template_summary: []
    }
    // get non tabular template data first..
    result.template_summary = _.filter(templateData, obj => {
      return obj.template_id === comp.section_ref_id
        && (obj.display_format == "horizantal" || obj.section_group_format == "horizantal");
    });

    // get tabular template data and create in required format..
    const array = _.filter(templateData, obj => {
      return obj.template_id === comp.section_ref_id
        && (obj.display_format == "tabular" || obj.section_group_format == "tabular");
    });

    let templates = _.uniqBy(array, v => [v.template_id, v.form_id].join());
    let data = [];
    templates.forEach(template => {
      let chartObj = {
        chart_detail_id: template.chart_detail_id,
        chart_section_name: template.chart_section_name || template.form_name,
        visit_detail_Id: template.visit_detail_id || template.chart_detail_id,
        form_id: template.form_id,
        form_summary_heading: template.form_summary_heading || template.form_name,
        table_data: []
      };

      const queGroupData = _.filter(array, obj => {
        return obj.template_id == template.template_id && obj.form_id == template.form_id;
      });
      const queGroups = _.uniqBy(queGroupData, v => [v.que_group_id].join());
      queGroups.forEach(queGroup => {
        let formObj = {
          que_group_id: queGroup.que_group_id,
          que_group_name: queGroup.que_group_name,
          question_heading: queGroup.que_group_heading,
          table_head: [],
          que_list: []
        }

        // add question data here
        const queData = _.filter(array, obj => {
          return obj.template_id == template.template_id && obj.form_id == chartObj.form_id
            && obj.que_group_id == formObj.que_group_id;
        });

        // add table heading data here
        let ansGroupHeads = [];
        ansGroupHeads = (queData[0] && queData[0].section_tabular_headingData) ? queData[0].section_tabular_headingData : _.uniqBy(queData, v => [v.ans_group_key].join());
        ansGroupHeads.forEach(element => {
          let headObj = {
            ans_group_key: element.ans_group_key || element.answer_group_heading,
            ans_group_heading: element.ans_group_heading || element.answer_group_heading
          }
          formObj.table_head.push(headObj);
        });

        // add table heading data here
        const questions = _.uniqBy(queData, v => [v.question_id].join());
        questions.forEach(que => {
          let queObj = {
            question_id: que.question_id,
            question_text: que.question_text,
            answer_list: []
          }

          // add answer data here
          const queAnsData = _.filter(array, obj => {
            return obj.template_id == template.template_id && obj.form_id == chartObj.form_id
              && obj.que_group_id == formObj.que_group_id && obj.question_id == que.question_id;
          });
          queAnsData.forEach(ans => {
            let ansObj = {
              ans_group_key: ans.ans_group_key,
              answer_id: ans.answer_id,
              answer_text: ans.answer_text
            }
            queObj.answer_list.push(ansObj);
          });
          // add qus data into table
          formObj.que_list.push(queObj);
        });
        // add form table data
        chartObj.table_data.push(formObj);
      });
      result.tabular_summary.push(chartObj);
    })
    return result;
  }

  getComponenetData(dataList, chartDetailId) {
    const chartDetailData = _.filter(dataList, (o) =>
      o.chart_detail_id === chartDetailId
    );
    return chartDetailData;
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

  replaceString(stringValue): void {
    return (stringValue.replace(/\n/g, '<br>'));
  }

  copyPrescription(prescription) {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    const chartList = this.patientChartService.getPrescriptionChartList(this.patientObj, userInfo, 'IP_NOTES');
    chartList.then(res => {
      if (res && res['length'] === 1) {
        // apply directly pprescription
        this.patientChartService.copyPrescriptionData(prescription, res, this.patientObj, userInfo).then(pres => {
          if (pres) {
            this.setAlertMessage = {
              message: 'Prescription Copied in Selected charts',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      } else if (res && res['length'] > 1) {
        // open Popup and show chart List
        this.patientChartService.openChartListPopupForApplyPrescription(res).then(chart => {
          if (chart && chart['length'] > 0) {
            this.patientChartService.copyPrescriptionData(prescription, chart, this.patientObj, userInfo).then(pres => {
              if (pres) {
                this.setAlertMessage = {
                  message: 'Prescription Copied in Selected charts',
                  messageType: 'success',
                  duration: Constants.ALERT_DURATION
                };
              }
            });
          }
        });
      } else if (res && res['length'] === 0) {
        // no chart List, show alert
        this.setAlertMessage = {
          message: 'No Chart Available',
          messageType: 'Danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

}

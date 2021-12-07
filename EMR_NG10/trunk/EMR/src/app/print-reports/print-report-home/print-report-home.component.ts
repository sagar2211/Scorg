import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ModifyCustomTemplateData } from 'src/app/shared/pipes/modify-custom-template-data';
import { Observable, of } from 'rxjs';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { ScoreTemplateService } from './../../public/services/score-template.service';
import { ComponentsService } from './../../public/services/components.service';
import { AuthService } from './../../public/services/auth.service';
import { VitalsDataService } from './../../public/services/vitals-data.service';
import { CommonService } from 'src/app/public/services/common.service';
import * as printJS from 'print-js';
import * as moment from 'moment';

@Component({
  selector: 'app-print-reports',
  templateUrl: './print-report-home.component.html',
  styleUrls: ['./print-report-home.component.scss']
})
export class PrintReportHomeComponent implements OnInit, OnChanges {
  @ViewChild('printDivHtml', { static: false }) printDivHtml: ElementRef;
  @ViewChild('printChartData', { static: false }) printChartData: ElementRef;
  @ViewChild('printDischargeSummery', { static: false }) printDischargeSummery: ElementRef;
  @Input() printData: any;
  @Input() printType: string;

  printHeader: [] = [];
  printBody: [] = [];
  printHeading;
  printDate = new Date();
  isPrintDataLoad: boolean;
  userInfo = null;
  userSig = null;

  printChartDataList = [];
  chartPatientData: any;
  fileServePath = environment.FILE_SERVER_IMAGE_URL;

  constructor(
    private vitalsDataService: VitalsDataService,
    private authService: AuthService,
    private componentsService: ComponentsService,
    private modifyCustomTemplateData: ModifyCustomTemplateData,
    private scoretemplateService: ScoreTemplateService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.printBody = [];
    this.printHeader = null;
    this.printHeading = null;
    this.isPrintDataLoad = false;
    this.printChartDataList = [];
    this.chartPatientData = null;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    if (this.userInfo && this.userInfo.role_type && this.userInfo.role_type === 'DOCTOR') {
      this.userSig = 'Dr. ' + this.userInfo.user_name;
    } else {
      this.userSig = 'Dr. ' + this.userInfo.user_name;
    }
  }

  ngOnChanges(): void {
    if (!this.printType) {
      this.printType = 'appointment';
    }
    this.generatePrint();
  }

  generatePrint() {
    this.printBody = [];
    this.printHeader = null;
    this.printHeading = null;
    this.isPrintDataLoad = false;
    this.printChartDataList = [];
    this.chartPatientData = null;
    if (this.printType === 'appointment') {
      this.printAppointmentList();
    } else if ((this.printType === 'chart' || this.printType === 'discharge_summery') && this.printData && this.printData.patientData) {
      // console.log(this.printData.patientData);
      this.printChart();
    }
  }

  updateObjectSequenceWise(vitalsList?): Observable<any> {
    const chartCompList = _.orderBy(this.printData.chartComponent.chart_details, 'sequence');
    _.map(chartCompList, comp => {
      const chartTempData = {};
      let chartSelectedData = null;
      if (comp.section_key === 'image_annotation' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.annotation_detail) {
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.annotation_detail, comp.chart_detail_id);
          chartSelectedData = selectedData;
        }
      } else if (comp.section_key === 'human_body' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.pain_body_details) {
          chartSelectedData = this.getComponenetData(this.printData.chartData.chart_data.pain_body_details, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'allergies' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.allergy_detail
          && this.printData.chartData.chart_data.allergy_detail.length) {
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.allergy_detail, comp.chart_detail_id);
          if (selectedData[0].is_allergy_selected !== 'no_select') {
            chartSelectedData = selectedData[0].allergy_data;
          }
          // chartSelectedData = {
          //   allergy: this.printData.chartData.chart_data.allergy_detail.is_allergy_selected,
          //   data: this.printData.chartData.chart_data.allergy_detail.allergy_data
          // };
        }
      } else if (comp.section_key === 'foot_examination' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.pain_foot_details) {
          chartSelectedData = this.getComponenetData(this.printData.chartData.chart_data.pain_foot_details, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'advice' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.advice_detail) {
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.advice_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }
      } else if (comp.section_key === 'complaints' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.complaint_detail) {
          chartSelectedData = this.getComponenetData(this.printData.chartData.chart_data.complaint_detail, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'diagnosis' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.diagnosis_detail) {
          chartSelectedData = this.getComponenetData(this.printData.chartData.chart_data.diagnosis_detail, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'pain_scale' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.pain_scale && this.printData.chartData.chart_data.pain_scale.length) {
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.pain_scale, comp.chart_detail_id);
          chartSelectedData = selectedData[0].patient_pain_scale;
        }
      } else if (comp.section_key === 'lab_investigation' && comp.section_type === 'CONSULTATION_SECTION') {
        const invData = _.filter(this.printData.chartData.chart_data.investigation_detail, dt => {
          return dt.source === comp.section_key;
        });
        if (invData.length > 0) {
          // chartSelectedData = invData;
          invData.map(d => {
            d.dateDisplay = moment(d.date, 'YYYY/MM/DD').format('DD/MM/YYYY');
          })
          chartSelectedData = this.getComponenetData(invData, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'investigation' && comp.section_type === 'CONSULTATION_SECTION') {
        const invData = _.filter(this.printData.chartData.chart_data.investigation_detail, dt => {
          return dt.source === comp.section_key;
        });
        if (invData.length > 0) {
          // chartSelectedData = invData;
          invData.map(d => {
            d.dateDisplay = moment(d.date, 'YYYY/MM/DD').format('DD/MM/YYYY');
          })
          chartSelectedData = this.getComponenetData(invData, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'radiology_investigation' && comp.section_type === 'CONSULTATION_SECTION') {
        const invData = _.filter(this.printData.chartData.chart_data.investigation_detail, dt => {
          return dt.source === comp.section_key;
        });
        if (invData.length > 0) {
          // chartSelectedData = invData;
          invData.map(d => {
            d.dateDisplay = moment(d.date, 'YYYY/MM/DD').format('DD/MM/YYYY');
          })
          chartSelectedData = this.getComponenetData(invData, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'prescription' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.prescription_detail) {
          chartSelectedData = this.getComponenetData(this.printData.chartData.chart_data.prescription_detail, comp.chart_detail_id);
          _.map(chartSelectedData, (d, i) => {
            d.rowNo = i + 1;
          });
        }
      } else if (comp.section_key === 'vitals' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.vitals_detail) {
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.vitals_detail, comp.chart_detail_id);
          chartSelectedData = this.vitalsDataService.getVitalsDisplay(selectedData, vitalsList);
        }
      } else if (comp.section_key === 'pain_relief' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.relief_scale && this.printData.chartData.chart_data.relief_scale.length) {
          // chartSelectedData = this.printData.chartData.chart_data.relief_scale.patient_relief_scale;s
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.relief_scale, comp.chart_detail_id);
          chartSelectedData = selectedData[0].patient_relief_scale;
        }
      } else if (comp.section_key === 'attachment' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.attachment_detail && this.printData.chartData.chart_data.attachment_detail.length > 0) {
          const listAttachment = this.getComponenetData(this.printData.chartData.chart_data.attachment_detail, comp.chart_detail_id);
          const attachmentData = _.map(listAttachment, item => {
            if (this.isImage(item)) {
              item.file_type = 'img';
            } else {
              item.file_type = 'pdf';
            }
            return item;
          });
        }
      } else if (comp.section_type === 'EXAMINATION_HEADS') {
        const exmData = _.filter(this.printData.chartData.chart_data.examination_detail, exm => {
          return exm.examination_head_id === comp.section_ref_id;
        });
        if (exmData.length > 0) {
          // chartSelectedData = exmData;
          chartSelectedData = this.getComponenetData(exmData, comp.chart_detail_id);
        }
      } else if (comp.section_key === 'followup_date' && comp.section_type === 'CONSULTATION_SECTION') {
        // chartSelectedData = this.printData.chartData.chart_data.followup_date_detail;
        if (this.printData.chartData.chart_data.followup_date_detail && this.printData.chartData.chart_data.followup_date_detail.length) {
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.followup_date_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }

      } else if (comp.section_type === 'CUSTOM_TEMPLATES' && this.printData.chartData.chart_data.custom_template_detail) {
        // chartSelectedData = this.printData.chartData.chart_data.custom_template_detail;
        const filteredList = this.getComponenetData(this.printData.chartData.chart_data.custom_template_detail, comp.chart_detail_id);
        const list = _.filter(filteredList, exm => {
          return exm.template_id === comp.section_ref_id;
        });
        if (list.length > 0) {
          chartSelectedData = this.modifyCustomTemplateData.transform(list);
        } else {
          return;
        }
      } else if (comp.section_type === 'SCORE_TEMPLATES') {
        comp.section_key = comp.section_type;
        // const list = this.getComponenetData(this.printData.chartData.chart_data.score_template_detail, comp.chart_detail_id);
        // chartSelectedData = list;

        const list = this.getComponenetData(this.printData.chartData.chart_data.score_template_detail, comp.chart_detail_id);
        const findTemplateObj = _.find(_.clone(this.scoretemplateService.scoreTemplateList), (o) => list.length && o.score_template_id === list[0].template_id);
        if (!_.isUndefined(findTemplateObj)) {
          _.forEach(findTemplateObj.question_list, (o) => { o.selected_optionValue = ''; });
          _.forEach(list, (r) => {
            const questionObj = _.find(findTemplateObj.question_list, (q) => q.question_id === r.question_id);
            questionObj.selected_optionValue = r.answer_text;
          });
          chartSelectedData = [this.scoretemplateService.selectOption(_.clone(findTemplateObj))];
        } else {
          chartSelectedData = [];
        }
      } else if (comp.section_key === 'chart_date_time' && comp.section_type === 'CONSULTATION_SECTION') {
        // chartSelectedData = this.printData.chartData.chart_data.followup_date_detail;
        if (this.printData.chartData.chart_data.chart_date_detail && this.printData.chartData.chart_data.chart_date_detail.length) {
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.chart_date_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }
      } else if (comp.section_key === 'chart_user' && comp.section_type === 'CONSULTATION_SECTION') {
        if (this.printData.chartData.chart_data.chart_user_detail && this.printData.chartData.chart_data.chart_user_detail.length) {
          const selectedData = this.getComponenetData(this.printData.chartData.chart_data.chart_user_detail, comp.chart_detail_id);
          chartSelectedData = selectedData[0];
        }
      }
      if (chartSelectedData || ((comp.section_key === 'pain_scale' || comp.section_key === 'pain_relief') && chartSelectedData !== null)) {
        chartTempData['data'] = chartSelectedData;
        chartTempData['secType'] = comp.section_type === 'CUSTOM_TEMPLATES' ?
          comp.section_type : (comp.section_type === 'EXAMINATION_HEADS' ?
            comp.section_type : comp.section_key);
        chartTempData['secMasterType'] = comp.section_type;
        chartTempData['displayName'] = comp.section_name;
        chartTempData['chartVisitId'] = this.printData.chartData.visit_detail_id;
        chartTempData['chartVisitNo'] = this.printData.chartData.visit_no;
        chartTempData['chartVisitDate'] = this.printData.chartData.visit_date;
        chartTempData['main_chart_name'] = this.printData.chartComponent.chart_name;
        this.printChartDataList.push(_.cloneDeep(chartTempData));
      }
    });
    return of(this.printChartDataList);
  }

  getComponenetData(dataList, chartDetailId) {
    const chartDetailData = _.filter(dataList, (o) =>
      o.chart_detail_id === chartDetailId
    );
    return chartDetailData;
  }

  isImage(item) {
    if (item && item.file_name.split('.')[1].toUpperCase() !== 'PDF') {
      return true;
    } else {
      return false;
    }
  }

  getPrintA4() {
    let printContents = null;
    let css = null;
    if (this.printType === 'appointment') {
      css = 'a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}:focus{outline:0}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:" ";content:none}table{border-collapse:collapse;border-spacing:0}[hidden]{display:none}html{font-size:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}a:focus{outline:thin dotted}a:active,a:hover{outline:0}img{border:0;-ms-interpolation-mode:bicubic}figure{margin:0}form{margin:0}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0;white-space:normal}table{border-collapse:collapse;border-spacing:0}button,html,input,select,textarea{color:#222}::-moz-selection{background:#b3d4fc;text-shadow:none}::selection{background:#b3d4fc;text-shadow:none}img{vertical-align:middle}fieldset{border:0;margin:0;padding:0}textarea{resize:vertical}.chromeframe{margin:.2em 0;background:#ccc;color:#000;padding:.2em 0}body{position:relative;width:21cm;margin:0 auto;color:#001028;background:#fff;font-size:12px;font-family:Roboto,sans-serif}.clearfix:after{content:"";display:table;clear:both}img{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none}h1{border-top:1px solid #ddd;border-bottom:1px solid #ddd;color:#636363;line-height:1.4em;font-weight:400;text-align:center;background:url(repeat.png)}h1.repeat{font-size:2.4em}h1.next-app{color:#2b2b2b;font-size:1.7em;padding:5px 0}h6{color:#5d6975}h5 small,h6 small{font-size:75%}a{color:#5d6975;text-decoration:underline}ul{line-height:1.2}table{width:100%;border-spacing:0;border-collapse:collapse;border:1px solid transparent}table td.left{text-align:left!important}table.table-bordered th{padding:5px 10px;color:#5d6975;white-space:nowrap;font-weight:400}table.table-bordered th .headeing{color:#001028}table.table-bordered td{padding:10px;text-align:right}table.table-bordered{border:1px solid #ddd}table.table-bordered tr:nth-child(2n-2) td{background:#f5f5f5}table.table-bordered td,table.table-bordered th{text-align:center;border:1px solid #ddd}table.table-bordered tbody .header{width:85px}table.table-bordered tbody .header{vertical-align:middle;background-color:#f5f5f5}.label{color:#5d6975;font-size:1.4em;}.label small{font-size:.7em}.font-weight-600{font-weight:600}.bg-light{background-color:#f5f5f5}#name{height:70px}#name .left-side{float:left}#name .left-side .name,#name .right-side .date{font-size:2em}#name .left-side .id,#name .right-side .id{font-size:1.2em}#name .left-side span,#name .right-side span{color:#5d6975;font-size:.9em}#name .right-side{float:right;text-align:right}#name .left-side p{white-space:nowrap;line-height:1.2}#prescription table .desc,#prescription table .service{vertical-align:top;text-align:left!important}#prescription table .desc{width:400px}#prescription table .unit{text-align:center;font-size:1.2em}#prescription table .unit h5{border-bottom:1px solid #d4d4d4}#face .table-bordered tbody tr td,#foot .table-bordered tbody tr td,#human-body .table-bordered tbody tr td,#image-annotation .table-bordered tbody tr td{width:50%}#footer .dr-sign{height:50px;font-size:1.4em;text-align:right}#footer p{color:#5d6975;width:100%;height:10px;border-top:1px solid #d4d4d4;padding:8px 0;text-align:center}@media print{@page{size:21cm 29.7cm;}}';
      printContents = this.printDivHtml.nativeElement.innerHTML;
    } else if (this.printType === 'chart') {
      // css = '.score_Absent{fill:red}.score_Normal{fill:green}.score_Reduced{fill:orange}.score_no{fill:#fff}.score1{fill:green}.score2{fill:#61b000}.score3{fill:#c0e000}.score4{fill:#fff500}.score5{fill:#ffdb00}.score6{fill:#ffc200}.score7{fill:#ffa900}.score8{fill:#ff7900}.score9{fill:#ff4200}.score10{fill:#ff0800}.score_Blank{stroke:#413d3d;fill:#b5b5b5}.page-header,.page-header-space,.page-footer,.page-footer-space{height:150px}.page-footer{position:fixed;bottom:0;width:100%;border-top:1px solid #000;background:#fff;z-index:1}.page-header{position:fixed;top:0;width:100%;border-bottom:1px solid #000;background:#fff;z-index:1}.page{page-break-after:always;padding:2px 0}@page{margin:20mm}@media print{thead{display:table-header-group}tfoot{display:table-footer-group}button{display:none}body{margin:0}}';
      css = '@import url(https://fonts.googleapis.com/css?family=Roboto&display=swap);.score_Absent{fill:red}.score_Normal{fill:green}.score_Reduced{fill:orange}.score_no{fill:#fff}.score1{fill:green}.score2{fill:#61b000}.score3{fill:#c0e000}.score4{fill:#fff500}.score5{fill:#ffdb00}.score6{fill:#ffc200}.score7{fill:#ffa900}.score8{fill:#ff7900}.score9{fill:#ff4200}.score10{fill:#ff0800}.score_Blank{stroke:#413d3d;fill:#b5b5b5}a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font:inherit;vertical-align:baseline}:focus{outline:0}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:"";content:none}table{border-collapse:collapse;border-spacing:0}[hidden]{display:none}html{line-height:1;font-size:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}body{width:100%;color:#606060;margin:0 auto;font-size:12px;max-width:800px;position:relative;font-family:Roboto,sans-serif}a:focus{outline:thin dotted}a:active,a:hover{outline:0}img{border:0;vertical-align:middle;user-select:none;pointer-events:none;-ms-user-select:none;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-ms-interpolation-mode:bicubic}figure{margin:0}form{margin:0}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0;white-space:normal}fieldset{border:0;margin:0;padding:0}.chromeframe{margin:.2em 0;background:#ccc;color:#000;padding:.2em 0}.dark{color:#202020}.page-footer,.page-header,.t-foot,.t-head{height:120px;max-width:800px;width:100%;background-color:#fff}.page-footer,.t-foot{height:30px !important;}.page-footer h5{padding-top:10px;text-align:right}.page-footer,.page-header{position:fixed}.page-header{top:0;border-bottom:1px solid #ddd}.page-footer{bottom:0;border-top:1px solid #ddd}.clearfix:after{content:"";display:table;clear:both}.info .left-side{float:left;padding-left:4px}.info .left-side .name,.info .right-side .date-time{color:#202020;font-size:1.6em}.info .left-side .extra-info,.info .right-side .extra-info{font-size:1.2em;margin-bottom:2px}.info .left-side span,.info .right-side span{color:#202020;font-size:.9em}.info .right-side{float:right;text-align:right;padding-right:4px}.info .left-side p,.info .right-side p{line-height:1.2;white-space:nowrap}.content{padding:6px 0}.content .page{page-break-after:always}h5{font-size:1.2em;margin-bottom:2px}h5,h6{color:#202020;}h5 small,h6 small,p small{font-size:11px}a{color:#202020;text-decoration:underline}ul{line-height:1.2}table{width:100%;border-spacing:0;margin-bottom:-1px}table td.left{text-align:left!important}table.table-bordered-2{min-height:5px;}table.table-bordered th{padding:5px 10px;white-space:nowrap;font-weight:400}table.table-bordered td{padding:10px;text-align:right}table.table-bordered{border:1px solid #ddd}table.table-bordered tr:nth-child(2n-2) td{background:#f7f7f7}table.table-bordered td,table.table-bordered th{text-align:center;border:1px solid #ddd}table.table-bordered tbody .header{width:85px; word-break: break-all;}table.table-bordered tbody .header{vertical-align:middle;background-color:#f7f7f7}.label{color:#202020;font-size:1.4em;margin:10px 0 2px}.label small{font-size:.7em}.prescription table .desc,.prescription table .service{vertical-align:top;text-align:left!important}.prescription table .desc{width:400px}.prescription table .unit{text-align:center;font-size:1.2em}.prescription table .unit h6{margin-bottom:2px;border-bottom:1px solid #d4d4d4}.vital-list{display:flex;flex-direction:row;flex-wrap:wrap;box-sizing:border-box;max-width:750px;margin:auto}.vital-item{width:calc(20% + 1px);margin-top:-1px;margin-left:-1px;border:1px solid #d4d4d4;box-sizing:border-box;text-align:center}.p-7{padding:7px}.vital-header{background-color:#f7f7f7;margin: 0 1px}@media print{@page{size:21cm 29.7cm;margin:.5cm}html,body{height: 99.9%;border:0;margin:0}thead{display:table-header-group}tfoot{display:table-footer-group}}';
      printContents = this.printChartData.nativeElement.innerHTML;
    } else if (this.printType === 'discharge_summery') {
      css = '@import url(https://fonts.googleapis.com/css?family=Roboto&display=swap);.score_Absent{fill:red}.score_Normal{fill:green}.score_Reduced{fill:orange}.score_no{fill:#fff}.score1{fill:green}.score2{fill:#61b000}.score3{fill:#c0e000}.score4{fill:#fff500}.score5{fill:#ffdb00}.score6{fill:#ffc200}.score7{fill:#ffa900}.score8{fill:#ff7900}.score9{fill:#ff4200}.score10{fill:#ff0800}.score_Blank{stroke:#413d3d;fill:#b5b5b5}a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font:inherit;vertical-align:baseline}:focus{outline:0}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:"";content:none}table{border-collapse:collapse;border-spacing:0}[hidden]{display:none}html{line-height:1;font-size:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}body{width:100%;color:#606060;margin:0 auto;font-size:12px;max-width:800px;position:relative;font-family:Roboto,sans-serif}a:focus{outline:thin dotted}a:active,a:hover{outline:0}img{border:0;vertical-align:middle;user-select:none;pointer-events:none;-ms-user-select:none;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-ms-interpolation-mode:bicubic}figure{margin:0}form{margin:0}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0;white-space:normal}fieldset{border:0;margin:0;padding:0}.chromeframe{margin:.2em 0;background:#ccc;color:#000;padding:.2em 0}.dark{color:#202020}.page-footer,.page-header,.t-foot,.t-head{height:120px;max-width:800px;width:100%;background-color:#fff}.page-footer,.t-foot{height:30px !important}.page-footer h5{padding-top:10px;text-align:right}.page-footer,.page-header{position:fixed}.page-header{top:0;border-bottom:1px solid #ddd}.page-footer{bottom:0;border-top:1px solid #ddd}.clearfix:after{content:"";display:table;clear:both}.info .left-side{float:left;padding-left:4px}.info .left-side .name,.info .right-side .date-time{color:#202020;font-size:1.6em}.info .left-side .extra-info,.info .right-side .extra-info{font-size:1.2em;margin-bottom:2px}.info .left-side span,.info .right-side span{color:#202020;font-size:.9em}.info .right-side{float:right;text-align:right;padding-right:4px}.info .left-side p,.info .right-side p{line-height:1.2;white-space:nowrap}.content{padding:6px 0}.content .page{page-break-after:always}h5{font-size:1.2em;margin-bottom:2px}h5,h6{color:#202020;}h5 small,h6 small,p small{font-size:11px}a{color:#202020;text-decoration:underline}ul{line-height:1.2}table{width:100%;border-spacing:0;margin-bottom:-1px}table td.left{text-align:left!important}table.table-bordered-2{min-height:5px;}table.table-bordered th{padding:5px 10px;white-space:nowrap;font-weight:400}table.table-bordered td{padding:10px;text-align:right}table.table-bordered{border:1px solid #ddd}table.table-bordered tr:nth-child(2n-2) td{background:#f7f7f7}table.table-bordered td,table.table-bordered th{text-align:center;border:1px solid #ddd}table.table-bordered tbody .header{width:85px; word-break: break-all;}table.table-bordered tbody .header{vertical-align:middle;background-color:#f7f7f7}.label{color:#202020;font-size:1.4em;margin:10px 0 2px}.label small{font-size:.7em}.prescription table .desc,.prescription table .service{vertical-align:top;text-align:left!important}.prescription table .desc{width:400px}.prescription table .unit{text-align:center;font-size:1.2em}.prescription table .unit h6{margin-bottom:2px;border-bottom:1px solid #d4d4d4}.vital-list{display:flex;flex-direction:row;flex-wrap:wrap;box-sizing:border-box;max-width:750px;margin:auto}.vital-item{width:calc(20% + 1px);margin-top:-1px;margin-left:-1px;border:1px solid #d4d4d4;box-sizing:border-box;text-align:center}.p-7{padding:7px}.vital-header{background-color:#f7f7f7;margin: 0 1px}@media print{@page{size:21cm 29.7cm;margin:.5cm}html,body{height: 99.9%;border:0;margin:0}thead{display:table-header-group}tfoot{display:table-footer-group}}';
      printContents = this.printDischargeSummery.nativeElement.innerHTML;
    }
    console.log(css);
    console.log(printContents);
    const frame1 = document.createElement('iframe');
    frame1.name = "frame1";
    frame1.style.position = "absolute";
    frame1.style.top = "-1000000px";
    document.body.appendChild(frame1);
    const frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument['document'] ? frame1.contentDocument['document'] : frame1.contentDocument;

    frameDoc.document.open();
    // if (this.printType === 'chart') {
    //   frameDoc.document.write('<html><head>' +
    //     '<link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">' +
    //     '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">' +
    //     '<style type="text/css" media="print">' + css + '</style>' +
    //     '</head>' +
    //     '<body>' + printContents + '</body>' +
    //     '</html>');
    // } else {
    //   frameDoc.document.write('<html><head><link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet"><style type="text/css" media="print">' + css + '</style></head><body>' + printContents + '</body></html>');
    // }
    frameDoc.document.write('<html><head><link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet"><style type="text/css" media="print">' + css + '</style></head><body>' + printContents + '</body></html>');
    // frameDoc.document.write(res);
    frameDoc.document.close();
    window.frames["frame1"].focus();
    setTimeout(function () {
      window.frames["frame1"].print();
    }, 1000);
    setTimeout(function () {
      document.body.removeChild(frame1);
    }, 1000);

    this.printChartDataList = [];
    // });
  }

  printAppointmentList() {
    this.printBody = [];
    this.printHeader = null;
    this.printHeading = null;
    const data = this.printData;
    if (data && data.bodyData && data.bodyData.length) {
      this.isPrintDataLoad = true;
      this.printHeader = data.headerColumn;
      this.printBody = data.bodyData;
      this.printHeading = data.printHeading;
      this.printDate = data.date ? new Date(data.date) : new Date();
      setTimeout(() => {
        this.getPrintA4();
      }, 1000);
    }
  }

  printChart() {
    this.chartPatientData = this.printData.patientData;

    if (this.printType === 'discharge_summery') {
      this.prepairePrintDataOfDischarge().subscribe(res => {
        setTimeout(() => {
          this.getPrintA4();
        }, 1000);
      });
    } else {
      const checkVital = _.findIndex(this.printData.chartComponent.chart_details, comp => {
        return comp.section_key === 'vitals';
      });
      if (checkVital !== -1) {
        const userInfo = this.authService.getUserInfoFromLocalStorage();
        const param = {
          service_type_id: this.printData.chartData.service_type_id,
          speciality_id: userInfo.speciality_id
        };
        this.vitalsDataService.getConsultationVitalsList(param).subscribe(vitalsList => {
          this.updateObjectSequenceWise(vitalsList).subscribe(res => {
            setTimeout(() => {
              this.getPrintA4();
            });
          });
        });
      } else {
        this.updateObjectSequenceWise().subscribe(res => {
          setTimeout(() => {
            this.getPrintA4();
          }, 1000);
        });
      }
    }
  }

  modifyAge(val: string): string {
    let updateString = '';
    if (val) {
      const split = val.split(' ');
      if (_.toLower(split[1]) === _.toLower('YEAR(S)')) {
        updateString = split[0] + ' Yrs';
      } else {
        updateString = split[0] + split[1].charAt(0);
      }
    }
    return updateString;
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

  replaceString(stringValue) {
    return (stringValue.replace(/\n/g, '<br>'));
  };

  prepairePrintDataOfDischarge(): Observable<any> {
    const chartList = this.printData.chartData;
    _.map(chartList, cl => {
      _.map(cl.summery, comp => {

        let chartData = [];
        let visitData = [];
        _.map(comp.visitorData, vd => {
          chartData = vd.summaryData;
          visitData = vd.visitor;
        });
        const chartTempData: any = {};
        chartTempData.data = chartData;
        chartTempData.visitData = visitData;
        chartTempData.visitorData = comp.visitorData;
        chartTempData.secType = this.componentsService.getSectionKeyByChartKey(comp.sectionKey, comp.investigation_type);
        chartTempData.secMasterType = chartTempData.secType === 'examination_label' ? 'EXAMINATION_HEADS' : 'CONSULTATION_SECTION';
        chartTempData.displayName = comp.label;
        chartTempData.dataDisplayType = comp.dataDisplayType;
        chartTempData.sectionKey = comp.sectionKey;
        // to show fixed vital structure
        if (chartTempData.sectionKey === 'vitals_detail'
          && chartTempData.secType === 'vitals'
          && chartTempData.secMasterType === 'CONSULTATION_SECTION') {
          chartTempData.vitalData = [];
          chartTempData.data.map(str => {
            const val = str.substring(str.indexOf("(") + 1, str.indexOf(")"));
            const label = str.substring(0, str.indexOf("("));
            const obj = {
              val: val ? val : null,
              label: label ? label : str
            };
            chartTempData.vitalData.push(_.cloneDeep(obj));
          });
        }
        const indx = this.printChartDataList.findIndex(p => p.chartId === cl.chartId);
        if (indx !== -1 && cl.chartId !== -1) {
          this.printChartDataList[indx].summeryData.push({ ...chartTempData });
        } else {
          this.printChartDataList.push({
            chartName: cl.chartName,
            chartId: cl.chartId,
            summeryData: [{ ...chartTempData }]
          });
        }
      });
    });
    return of(this.printChartDataList);
  }


}

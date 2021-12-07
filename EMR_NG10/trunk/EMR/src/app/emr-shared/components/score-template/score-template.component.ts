import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from './../../../public/services/common.service';
import { ScoreTemplateService } from './../../../public/services/score-template.service';
import { AuthService } from './../../../public/services/auth.service';
import { DynamicChartService } from '../../../dynamic-chart/dynamic-chart.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-score-template',
  templateUrl: './score-template.component.html',
  styleUrls: ['./score-template.component.scss']
})
export class ScoreTemplateComponent implements OnInit {
  section = '';
  scoreTemplateList = [];
  patientId: any;
  userId: number;
  activeTabName = 'form';
  activeSectionId: number;
  patientDetail: any;
  isPanelOpen: boolean;
  selectedTemplate: any = {};
  @Input() public componentInfo: any;
  chartDetailId: number;

  constructor(
    private scoretemplateService: ScoreTemplateService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    private dyanamicChartService: DynamicChartService
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.userId = +this.authService.getLoggedInUserId();
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    //this.getScoreTemplateList();
    this.getScoreTemplateListById(this.componentInfo.section_ref_id);
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
    // const patient = this.commonService.getLastActivePatient();
  }
  getScoreTemplateLocalData() {
    this.dyanamicChartService.getChartDataByKey('score_template_detail', true, null, this.chartDetailId).subscribe(result => {
      if ((_.isArray(result) && result.length)) {
        _.forEach(result, (r) => {
          const findTemplateObj = _.find(this.scoreTemplateList, (o) => o.score_template_id === r.template_id);
          if (!_.isUndefined(findTemplateObj)) {
            const questionObj = _.find(findTemplateObj.question_list, (q) => q.question_id === r.question_id);
            questionObj.selected_optionValue = r.answer_text;
            this.optionValueOnChange(findTemplateObj);
          }
        });
      }
    });
  }
  getScoreTemplateList() {
    const params = {
      speciality_id: 0,
      service_type_id: 1,
      search_keyword: '',
      is_active: true,
      sort_order: '',
      sort_column: '',
      page_number: 1,
      limit: 10
    };
    this.scoretemplateService.getScoreTemplateList(params).subscribe(result => {
      this.scoreTemplateList = result.data;
      this.getScoreTemplateListById(this.componentInfo.section_ref_id);
    });
  }
  optionValueOnChange(selectedtemplate) {
    this.scoretemplateService.selectOption(selectedtemplate);
  }
  prepareAndSaveLocalTransData() {
    const transactionData = [];
    _.forEach(this.scoreTemplateList, (template) => {
      const obj = {
        chart_detail_id: this.componentInfo.chart_detail_id,
        template_id: template.score_template_id,
        question_id: 0,
        answer_id: 0,
        answer_text: ''
      };
      _.forEach(template.question_list, (q) => {
        const findaansObj = _.find(q.answer_option_list, (o) => o.options_value === q.selected_optionValue.toString());
        obj.question_id = q.question_id;
        obj.answer_id = !_.isUndefined(findaansObj) ? findaansObj.answer_id : 0;
        obj.answer_text = q.selected_optionValue ? q.selected_optionValue.toString() : '';
        if (obj.answer_id !== 0 && q.selected_optionValue) {
          transactionData.push(_.clone(obj));
        }
      });
    });
    this.dyanamicChartService.updateLocalChartData('score_template_detail', transactionData, 'update', this.chartDetailId);
  }
  panelChange(event): void {
    this.isPanelOpen = event.nextState;
  }
  loadScoreTemplate(section): void {
    this.selectedTemplate = section;
    const eventObj = {
      source: 'scoreTemplate',
      content: { scoreComponentInstance: this, openPopup: true }
    };
    this.dyanamicChartService.sendEventToParentChartContainer.next(eventObj);

    // this.getScoreTemplateListById();
  }

  closePopup() {
    const eventObj = {
      source: 'scoreTemplate',
      content: { scoreComponentInstance: undefined, openPopup: false }
    };
    this.dyanamicChartService.sendEventToParentChartContainer.next(eventObj);
  }

  getScoreTemplateListById(templateIds: any): void {
    // const templateIds = this.scoreTemplateList.map(r => r.score_template_id);
    const reqParams = {
      template_ids: [templateIds]
    };
    this.scoretemplateService.getScoreTemplateListById(reqParams).subscribe(res => {
      // console.log(res);
      if (res.status_message === 'Success') {
        this.scoreTemplateList = res.data;
        // selectedTemplate = res.data[0];
        // this.selectedTemplate = selectedTemplate;

        // const indx = this.scoreTemplateList.findIndex(s => s.score_template_id === selectedTemplate.score_template_id);
        // if (indx !== -1) {
        //   this.scoreTemplateList[indx] = selectedTemplate;
        // }

        _.map(this.scoreTemplateList, (template) => {
          template.templatecalcvalue = '';
          _.map(template.question_list, (o) => {
            o.selected_optionValue = '';
          });
        });
        this.getScoreTemplateLocalData();

        // const eventObj = {
        //   source: 'scoreTemplate',
        //   content: { scoreComponentInstance: this, openPopup: true }
        // };
        // this.dyanamicChartService.sendEventToParentChartContainer.next(eventObj);
      }
    });
  }

  getScoreTemplateListByIdCopy(selectedTemplate): void {
    // console.log(selectedTemplate);
    const reqParams = {
      template_ids: [selectedTemplate.score_template_id]
    };
    this.scoretemplateService.getScoreTemplateListById(reqParams).subscribe(res => {
      // console.log(res);
      if (res.status_message === 'Success') {
        selectedTemplate = res.data[0];
        this.selectedTemplate = selectedTemplate;

        const indx = this.scoreTemplateList.findIndex(s => s.score_template_id === selectedTemplate.score_template_id);
        if (indx !== -1) {
          this.scoreTemplateList[indx] = selectedTemplate;
        }

        _.map(this.scoreTemplateList, (template) => {
          template.templatecalcvalue = '';
          _.map(template.question_list, (o) => {
            o.selected_optionValue = '';
          });
        });
        this.getScoreTemplateLocalData();

        const eventObj = {
          source: 'scoreTemplate',
          content: { scoreComponentInstance: this, openPopup: true }
        };
        this.dyanamicChartService.sendEventToParentChartContainer.next(eventObj);
      }
    });
  }


}

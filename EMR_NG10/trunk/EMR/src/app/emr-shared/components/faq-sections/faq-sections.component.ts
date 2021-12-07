import { Component, Input, OnInit, ViewChildren, OnChanges, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { FaqSectionsService } from '../../../public/services/faq-sections.service';
import { forkJoin, of } from 'rxjs';
import { PublicService } from '../../../public/services/public.service';
import { ConsultationService } from '../../../public/services/consultation.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../public/services/auth.service';
import { PatientChartService } from '../../../patient-chart/patient-chart.service';
import { DynamicChartService } from '../../../dynamic-chart/dynamic-chart.service';
import { CommonService } from '../../../public/services/common.service';
import { ConsultationSectionFormSettingService } from '../../../public/services/consultation-section-form-setting.service';

@Component({
  selector: 'app-faq-sections',
  templateUrl: './faq-sections.component.html',
  styleUrls: ['./faq-sections.component.scss']
})
export class FaqSectionsComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChildren('getFaqCategoryInstance') getFaqCategoryInstance;

  @Input() faqSectionDisplaySetting = 'unClubbed'; // values = clubbed, unClubbed, openForm
  @Input() source: string;
  @Input() showOnlySummary = false;
  @Input() templateId: number;
  @Input() public componentInfo: any;

  section = '';
  faqSectionList = [];
  faqSummaryObject = [];
  patientFaqSectionList = [];
  patientId: any;
  userId: number;
  activeTabName = 'form';
  activeSectionId: number;
  localSectionData = [];
  selectedForm: any;
  @Input() tempSectionId: number;
  @Input() summaryContentLoaded = false;
  content: any;
  patientDetail: any;
  chartDetailId: number;
  constructor(
    private faqSectionService: FaqSectionsService,
    private csFormService: ConsultationSectionFormSettingService,
    private publicService: PublicService,
    private consultationService: ConsultationService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    private patientChartService: PatientChartService,
    private dynamicChartService: DynamicChartService
  ) {
  }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.userId = +this.authService.getLoggedInUserId();
    // this.getFaqSectionDisplaySetting();
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.getFaqSectionList(this.tempSectionId);
    this.getAllFaqRelatedData(true, 0);
    const patient = this.commonService.getLastActivePatient();
    this.patientDetail = {
      salutation: 'Mr',
      patient_name: patient.patientData.name
    };
  }

  ngOnChanges(changes) {
    this.getFaqSectionList(this.tempSectionId);
    this.getAllFaqRelatedData(true, 0);
  }

  trackByFunction = (index, item) => {
    if (!item) { return null; }
    return index;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.showOnlySummary) {
        if (this.showOnlySummary && this.faqSectionList.length) {
          this.setLocalSectionData(this.faqSectionList, 'summary');
          this.showSummary(this.faqSectionList[0], 0);
          // this.summaryContentLoaded = true;
        }
      }
    }, 300);
  }

  setLocalSectionData(faqData, activeTabKey?) {
    const self = this;
    _.forEach(faqData, (o, key) => {
      const obj = {
        activeTabName: (activeTabKey) ? activeTabKey : 'form',
        sectionIndex: key
      };
      // console.log('setLocalSectionData');
      // console.log(obj);
      self.localSectionData[key] = obj;
    });
  }

  getFaqSectionList(tempSectionId?) {
    let formId = this.publicService.getActiveFormId();
    if (!_.isUndefined(this.source)) {
      if (this.source == 'initial_assessment') {
        formId = -1;
      }
    }
    if (this.templateId !== undefined) {
      this.patientChartService.getLocalFaqSectionData(this.templateId).subscribe(result => {
        this.prepareFaqSectionListData(result);
      });
    } else {
      this.csFormService.getFaqSectionList(formId, this.userId, false).subscribe(result => {
        this.prepareFaqSectionListData(result);
      });
    }
  }

  prepareFaqSectionListData(result) {
    const faqSections = [];
    const forkJoins = [];
    _.forEach(result, (o) => {
      forkJoins.push(this.faqSectionService.getSectionById(o.template_id));
      if (o.is_Active === true) {
        faqSections.push(o);
      }
    });
    forkJoin(forkJoins).subscribe((res: Array<any>) => {
      _.forEach(faqSections, (o, i) => {
        o.sectionData = res[i];
      });
      this.faqSectionList = faqSections;
      // console.log(this.faqSectionList, 'this.faqSectionList');
      if (this.faqSectionDisplaySetting === 'openForm') {
        this.setLocalSectionData(this.faqSectionList);
        // this.selectedForm = this.faqSectionList.length && this.faqSectionList[0].form_data.length ? this.faqSectionList[0].form_data[0] : null;
        // this.menuClicked(this.faqSectionList[0]);
      }
    });
  }

  getAllFaqRelatedData(callOnLoad, isCopyOpd) {
    // on page load do not load server data if pateint opd already exists
    // if (!patientExistingOpd.isServerDataLoaded || !callOnLoad ) {
    const self = this;

    // check if data is availabel in local for current form id. If avail, return that else call API.
    // const patientFaqInputs = this.consultationService.getConsultationFormDataByKey(this.patientId, 'PatientFaqInputs');
    let patientFaqInputs;
    if (!_.isUndefined(this.source) && this.source === 'history_section') {
      patientFaqInputs = this.consultationService.getTempHistoryFaqData();
    } else {
      patientFaqInputs = this.consultationService.getConsultationFormDataByKey(this.patientId, 'PatientFaqInputs');
    }

    // if (!patientFaqInputs) {
    //   this.patientFaqSectionList = patientFaqInputs;
    // } else {
    // used when first time form/page loads.
    const filterDetail = { filterKey: 'template_id', filterValue: this.templateId };
    this.dynamicChartService.getChartDataByKey('custom_template_detail', true, filterDetail, this.chartDetailId).subscribe(answersData => {
      const answerList = (!_.isUndefined(isCopyOpd) && isCopyOpd || (answersData == null || !_.isArray(answersData))) ? [] : answersData;
      _.map(answerList, (ans) => {
        ans.answer_id = (!ans.answer_id || ans.answer_id === null || ans.answer_id === undefined || ans.answer_id === 0) ? ans.answer_text : ans.answer_id;
      });
      const allSections = _.uniqBy(answerList, 'template_id');
      const forkJoins = [];
      if (answerList.length > 0 && allSections.length > 0) {
        _.map(allSections, (secAns) => {
          forkJoins.push(self.faqSectionService.getSectionById(secAns.template_id));
        });

        forkJoin(forkJoins).subscribe(data => {
          const allFaqList = this.faqSectionService.createLocalFaqStory(data);
          const faqInputs = this.faqSectionService.mergeAndCreateFaqStory(allFaqList, answerList, this.faqSectionService.patientDetail, this.faqSummaryObject);
          // this.consultationService.setConsultationFormData(this.patientId, 'PatientFaqInputs', faqInputs);
          // const opdQuestionsData = self.faqSectionService.creatFaqQueAnswerServerData(faqInputs);
          // category.faqSummaryObject = self.faqSectionService.createFaqSummaryObject(opdQuestionsData, self.patientDetail);

          this.patientFaqSectionList = faqInputs;
        }, err => {
        }, () => {
        });
        // $q.all(promises).then(function (data) {
        //   var allFaqList = OpdService.createLocalFaqStory(data);
        //   var faqInputs = OpdService.mergeAndCreateFaqStory(allFaqList, answerList, opd.patientDetail, opd.faqSummaryObject);
        //   OpdService.setOpdObject("faqInputs", angular.copy(faqInputs));
        //   deferred.resolve();
        // });
      } else {
        // var faqInputs=[];
        // OpdService.setOpdObject("faqInputs", angular.copy(faqInputs));
        // deferred.resolve();
      }
    }, error => {
      return of('faq data load error'); // reject
    });
    // }
    return of(true);
  }

  ngCopy(obj): Object {
    return Object.assign({}, obj);
  }

  getSectionDataForOpenForm(section, category) {
    const newSection = _.clone(section);
    const catData = [];
    catData.push(_.cloneDeep(category));
    newSection.form_data = catData;
    return newSection;
  }

  showSummary(section, sectionIndex) {
    const self = this;
    const faqSummaryData = [];
    const content = _.filter(this.getFaqCategoryInstance._results, (o) => {
      return o.compInstance.sectionId == section.template_id;
    });
    _.forEach(content, (o, key) => {
      self.getFaqCategoryInstance._results[key].compInstance.showFaqSummary();
      const obj = {
        faqCurrentSectionCategoryList: o.compInstance.faqCurrentSectionCategoryList,
        sectionId: section.template_id,
        templateSummaryNotExists: o.compInstance.templateSummaryNotExists
      };
      faqSummaryData.push(obj);
    });
    this.localSectionData[sectionIndex]['summaryData'] = faqSummaryData;
    return faqSummaryData;
  }

  menuClicked(section) {
    this.publicService.componentSectionClicked({
      sectionKeyName: 'faq_section',
      faqSubSectionList: section.form_data,
      faqSectionName: section.template_name
    }); // -- to update suggestion list
  }

  changeFaqSectionCategory(event) {
    this.selectedForm = event;
  }

}

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FaqSectionsService } from './../../../../public/services/faq-sections.service';
import * as _ from 'lodash';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ConsultationService } from './../../../../public/services/consultation.service';
import { PublicService } from './../../../../public/services/public.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from './../../../../public/services/common.service';
import { SlideInOutAnimation } from 'src/app/config/animations';
import { DynamicChartService } from '../../../../dynamic-chart/dynamic-chart.service';

@Component({
  selector: 'app-faq-categories',
  templateUrl: './faq-categories.component.html',
  styleUrls: ['./faq-categories.component.scss'],
  animations: [SlideInOutAnimation]

})
export class FaqCategoriesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sectionData;
  @Input() patientFaqSectionList;
  @Input() faqSectionDisplaySetting;
  @Input() allSectionList;
  @Input() public componentInfo: any;
  @Input() isPreview = false;

  faqCurrentSection: any = [];
  faqCurrentSectionCategoryList = [];
  faqCurrentSectionQueGroup: any = [];
  originalfaqInputs: any = [];
  template_id: number;
  patientDetail: any;
  loadFaqForm = false;
  helpFlag = false;
  faqSetting: any;
  faqTemplateList: any;
  popupSetting = {
    activeSecGroup: '',
    showFaqQuestions: true,
  };
  templateSummaryNotExists: any;
  sectionId = 0;
  sectionName: string;
  categoryId: any;
  categoryName: string;
  setAlertMessage;
  patientId: any;
  compInstance = this;
  activeTabName = 'form'; // 2 values: form, summary. Default is form
  destroy$ = new Subject();
  activeSubSection: any = {};
  patientObj: any;
  popupLoaded = false;
  animationState = 'out';
  compoInstance = this;
  isPanelOpen: boolean;
  chartDetailId: number;

  constructor(
    private faqSectionService: FaqSectionsService,
    private modalService: NgbModal,
    private consultationService: ConsultationService,
    private publicService: PublicService,
    private commonService: CommonService,
    private dyanamicChartService: DynamicChartService
  ) { }

  ngOnInit() {
    if (!this.isPreview) {
      this.chartDetailId = this.componentInfo.chart_detail_id;
      this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
    }
    this.getpatientData();
    if (this.faqSectionDisplaySetting === 'unClubbed' || this.faqSectionDisplaySetting === 'openForm') {
      this.loadFaqCategories(this.sectionData);
      this.mapSuggestionFlag();
      if (this.faqSectionDisplaySetting === 'openForm' || this.isPreview) {
        this.activeSubSection = this.faqCurrentSectionCategoryList[0];
        this.loadFaqSectionFromUnclubbed(this.activeSubSection, false, true);
      }
    }
    // this.patientFaqSectionList = this.faqSectionService.getFaqSectionData('PatientFaqInputs');
    this.copyOrigionalObject();
    this.loadFaqSummaryObject();
    this.subcriptionOfEvents();
  }

  getpatientData() {
    const patient = this.commonService.getLastActivePatient();
    this.patientDetail = {
      salutation: 'Mr',
      patient_name: (this.isPreview) ? 'Patient Name' : patient.patientData.name
    };
    this.patientId = (this.isPreview) ? 0 : +patient.patientData.id;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (_.isUndefined(this.faqSetting)) {
      this.faqTemplateList = this.allSectionList;
    }
    this.loadFaqSummaryObject();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  // used for unclubbed view to display categories
  loadFaqCategories(section) {
    const self = this;
    this.sectionId = this.sectionData.template_id;
    if (!section) {
      return false;
    }
    const category = self.faqSectionService.createLocalSectionStory([section]);
    this.faqCurrentSection = _.cloneDeep(category);
    if (_.isUndefined(self.faqCurrentSectionCategoryList)) {
      self.faqCurrentSectionCategoryList = [];
    }

    const faqCatIndex = _.findIndex(self.faqCurrentSectionCategoryList, (o) => {
      return o.sectionId == section.template_id;
    });
    if (faqCatIndex === -1) {
      const currentSection = _.uniqBy(self.faqCurrentSection, 'categoryId');
      _.map(currentSection, (ct) => {
        self.faqCurrentSectionCategoryList.push(ct);
      });
    }
  }

  copyOrigionalObject() {
    this.originalfaqInputs = _.cloneDeep(this.patientFaqSectionList);
  }

  loadFaqSummaryObject() {
    const self = this;
    _.map(this.faqCurrentSectionCategoryList, (category) => {
      const faqCurrentSectionCategory = _.filter(self.patientFaqSectionList, (o) => {
        return o.categoryId == category.categoryId;
      });
      const opdQuestionsData = self.faqSectionService.creatFaqQueAnswerServerData(faqCurrentSectionCategory);
      category.faqSummaryObject = self.faqSectionService.createFaqSummaryObject(opdQuestionsData, self.patientDetail);
    });
  }

  loadFaqSectionFromUnclubbed(section, skipPopup, openForm?) {
    this.changeFaqSectionFromPopup(section, skipPopup, 'unclubbed', openForm);
  }

  changeFaqSectionFromPopup(section, skipPopup, source?, openForm?) {
    section.template_id = section.template_id || section.sectionId;
    // faqCtrl.checkFaqSectionDirty(true);

    this.faqSectionService.getSectionById(section.template_id).subscribe(dt => {
      const result = dt;
      let category = this.faqSectionService.createLocalFaqStory([result]);

      const answerList = [];
      const faqSummaryObject = [];
      category = this.faqSectionService.mergeAndCreateFaqStory(category, answerList, this.patientDetail, faqSummaryObject);

      const faqIndex = _.findIndex(this.patientFaqSectionList, (x: any) => x.sectionId == section.template_id);
      if (faqIndex === -1) {
        _.map(category, (ct) => {
          this.patientFaqSectionList.push(ct);
        });
      }
      this.faqCurrentSection = _.cloneDeep(category);

      const faqCatIndex = _.findIndex(this.faqCurrentSectionCategoryList, x => x.sectionId == section.template_id);
      if (faqCatIndex === -1) {
        const currentSection = _.uniqBy(this.faqCurrentSection, 'categoryId');
        if (_.isUndefined(this.faqCurrentSectionCategoryList)) {
          this.faqCurrentSectionCategoryList = [];
        }
        _.map(currentSection, (ct) => {
          this.faqCurrentSectionCategoryList.push(ct);
        });
      }

      if (!_.isUndefined(category)) {
        if (this.faqSetting) {
          // this.initControllerFAQPreview(category);
        } else {
          const activeCategorySectiondata: any = null;
          const skipPopup2 = _.isUndefined(skipPopup) ? true : skipPopup;
          if (source && source == 'unclubbed') {
            category = _.find(category, { 'categoryId': section.categoryId });
          }
          if (_.isUndefined(category)) {
            return;
          }
          this.showFaqSectionQuestions(category, activeCategorySectiondata, skipPopup2);
        }
        this.checkTemplateSummaryExists();
        if (openForm) {
          this.loadFaqForm = true;
        } else {
          if (!this.faqSetting && !skipPopup && !this.isPreview) {
            this.popupLoaded = true;
            const eventObj = {
              source: 'faqSection',
              content: { faqComponentInstance: this, openPopup: true }
            };
            this.dyanamicChartService.sendEventToParentChartContainer.next(eventObj);
            // const modelInstance = this.modalService.open(FaqPopupComponent, {
            //   backdrop: 'static',
            //   keyboard: false,
            //   size: 'lg',
            //   windowClass: 'custom-modal'
            // });
            // modelInstance.componentInstance.faqSection = this;
            // modelInstance.result.then(res => { }, reason => { });
          }
        }
      }
    });
  }

  showFaqSectionQuestions(category, activeCategorySectiondata, skipPopup?) { //  openPopUp
    this.helpFlag = false;
    if (!_.isUndefined(category) && category.categoryId) {
      this.sectionId = category.sectionId;
      this.sectionName = category.sectionName;
      this.categoryId = category.categoryId;
      this.categoryName = category.categoryName;
    } else {
      this.sectionId = this.faqCurrentSection[0].sectionId;
      this.sectionName = this.faqCurrentSection[0].sectionName;
      this.categoryId = this.faqCurrentSection[0].categoryId;
      this.categoryName = this.faqCurrentSection[0].categoryName;
    }

    if (!activeCategorySectiondata && true) { // && $scope.opd
      const sectionList = _.find(this.patientFaqSectionList, (o) => o.template_id == this.sectionId);
      if (sectionList) {
        const activeCategory = _.find(sectionList.form_data, (o) => o.form_id == this.categoryId);
        if (activeCategory) {
          activeCategorySectiondata = activeCategory.que_group_data;
        }
      }
    }

    _.map(this.patientFaqSectionList, (value, key) => {
      _.map(activeCategorySectiondata, (sdVal, sdKey) => {
        if (value.sectionGroupId == sdVal.question_group_id) {
          value.summary_merge = sdVal.summary_merge;
        }
      });
    });

    if (this.categoryId) {
      this.faqCurrentSection = _.filter(this.patientFaqSectionList, (o) => o.categoryId == this.categoryId);
    }


    // set story setting dirty default false / set placeholder if empty for dropdown / textbox / textarea / select
    _.map(this.faqCurrentSection, (question) => {
      question.showStorySetting = false;
      _.map(question.answerModelArray, (answerRowData) => {
        _.map(answerRowData, (ansGroup) => {
          if ((ansGroup.ansControlKey === 'dropdown_list' || ansGroup.ansControlKey === 'multi_select')) {
            ansGroup.ansGroupPlaceholder = '-- Select --';
            if (ansGroup.answerIsDynamic && ansGroup.answerIsSearchByKey) {
              this.getAnswerOptionDataBySearchKey(ansGroup);
            }
          } else if ((ansGroup.ansControlKey === 'input_box' || ansGroup.ansControlKey === 'text_area') && ansGroup.ansGroupPlaceholder === '') {
            ansGroup.ansGroupPlaceholder = 'Enter..';
          } else if (ansGroup.ansGroupPlaceholder === '-') {
            ansGroup.ansGroupPlaceholder = '';
          }
        });
      });
    });

    // create question group list
    this.faqCurrentSectionQueGroup = [];
    const queGroupList = _.uniqBy(this.faqCurrentSection, 'sectionGroupId');
    _.map(queGroupList, (group, index) => {
      const repeatAnsGroupExists = _.find(this.faqCurrentSection, (o) => {
        return o.sectionGroupId == group.sectionGroupId && o.repeatAnsGroup == true;
      });
      const groupObject = {
        sectionGroupId: group.sectionGroupId,
        sectionGroupName: group.sectionGroupName,
        sectionGroupFormat: group.sectionGroupFormat,
        sectionQuestionHeading: group.sectionQuestionHeading || 'Feedback',
        sectionTabularHeadingCount: group.sectionTabularHeadingData.length,
        sectionTabularHeadingData: group.sectionTabularHeadingData,
        repeatAnsGroupExists: !_.isUndefined(repeatAnsGroupExists)
      };
      this.faqCurrentSectionQueGroup.push(groupObject);
    });

    // show first question group on popup
    if (this.faqCurrentSectionQueGroup.length > 0) {
      this.popupSetting.activeSecGroup = this.faqCurrentSectionQueGroup[0].sectionGroupId;
    }

    const opdQuestionsData = this.faqSectionService.creatFaqQueAnswerServerData(this.faqCurrentSection);
    const categories = _.find(this.faqCurrentSectionCategoryList, (o) => o.categoryId == this.categoryId);
    categories.faqSummaryObject = this.faqSectionService.createFaqSummaryObject(opdQuestionsData, this.patientDetail);

    // setTimeout(function () {
    //   const container = angular.element(document.getElementById('faq_popup_container'));
    //   container.scrollTopAnimated(0, 1000);
    // }, 200);
  }

  getAnswerOptionDataBySearchKey(ansObj, searchKeyword = "") {
    this.faqSectionService.getAnswerDataBySearchKeyword(ansObj, searchKeyword).subscribe(result => {
      const options = [];
      _.map(result, (val) => {
        const tempObj = {
          ans_id: val.id,
          answer_text: val.name,
          id: +val.id
        }
        options.push(tempObj);
      });
      ansObj.optionsData = options;
    });
  }

  checkTemplateSummaryExists(list?) {
    list = list ? list : this.faqCurrentSectionCategoryList;
    const summaryExists = _.find(list, (category) => {
      return category.sectionId == this.sectionId
        && _.isArray(category.faqSummaryObject)
        && category.faqSummaryObject.length > 0;
    });
    this.templateSummaryNotExists = _.isUndefined(summaryExists);
  }

  showFaqSummary() {
    this.popupSetting.showFaqQuestions = false;
    this.checkTemplateSummaryExists(this.faqCurrentSectionCategoryList);
  }
  // --create copy of any objects
  ngCopy(data): any {
    if (_.isArray(data)) {
      return _.map(data, x => Object.assign({}, x));
    } else {
      return Object.assign({}, data);
    }
  }

  setFaqQuestionFlag() {
    this.popupSetting.showFaqQuestions = true;
  }

  changeFaqSectionCategory(category) {
    if (this.faqSetting) {
      this.initControllerFAQPreview(category);
    } else {
      // let activeCategorySectiondata: any;
      this.showFaqSectionQuestions(category, false, true);
    }
  }

  initControllerFAQPreview(category) {
    const self = this;
    this.template_id = _.cloneDeep(this.faqSetting.activeSection);
    this.sectionId = this.template_id;

    this.categoryId = !_.isUndefined(category) ? category.categoryId : _.cloneDeep(this.faqSetting.activeCategoryObject.form_id);
    this.categoryName = !_.isUndefined(category) ? category.categoryName : _.cloneDeep(this.faqSetting.activeCategoryObject.form_name);

    this.patientDetail = {
      salutation: 1,
      patient_name: 'Dummy Patient'
    };
    const allFaqList = _.cloneDeep(this.faqSetting.AllQuestionset);
    const answerList = [];
    const faqSummaryObject = [];
    this.patientFaqSectionList = this.faqSectionService.mergeAndCreateFaqStory(allFaqList, answerList, this.patientDetail, faqSummaryObject);

    if (!_.isUndefined(this.template_id)) {
      this.faqCurrentSection = _.filter(this.patientFaqSectionList, (o) => {
        return o.sectionId == self.sectionId
          && o.categoryId == self.categoryId;
      });

      this.faqCurrentSectionCategoryList = _.uniqBy(self.patientFaqSectionList, 'categoryId');
      const categoryData = _.cloneDeep(self.faqCurrentSection[0]);
      // faqCtrl.faqCurrentSectionCategoryList = [];
      // faqCtrl.faqCurrentSectionCategoryList.push(category);
      const activeCategorySectiondata = this.faqSetting.activeCategoryObject.que_group_data;
      self.showFaqSectionQuestions(categoryData, activeCategorySectiondata);
    }
  }

  clearAllAnswer(sectionGroupId) {
    const self = this;
    // faqCtrl.checkFaqSectionDirty(true); // called for clubbed view to remove dirty
    if (this.categoryId) {
      let localStoryList = this.faqCurrentSection;
      if (sectionGroupId) {
        localStoryList = _.filter(this.faqCurrentSection, (o) => { return o.sectionGroupId == sectionGroupId; });
      }
      this.faqSectionService.clearFaqQueAnswerData(localStoryList);
      let opdQuestionsData = this.faqSectionService.creatFaqQueAnswerServerData(this.faqCurrentSection);
      const category = _.find(this.faqCurrentSectionCategoryList, (o) => {
        return o.categoryId == self.faqCurrentSection[0].categoryId;
      });
      category.faqSummaryObject = this.faqSectionService.createFaqSummaryObject(opdQuestionsData, this.patientDetail);

      // visible question if parent question condition true?
      opdQuestionsData = this.faqSectionService.creatFaqQueAnswerServerData(this.patientFaqSectionList);
      this.faqSectionService.visibleFaqChildQueAndAnsGroup(this.patientFaqSectionList, opdQuestionsData);
      // update local data
      if (!this.isPreview) {
        this.prepareLocalDataForSave(opdQuestionsData);
      }
    }
  }

  toggleStorySetting(question) {
    if (_.isUndefined(question.showStorySetting)) {
      question.c = false;
    }
    question.showStorySetting = !question.showStorySetting;
    if (question.showStorySetting) {
      question.dirtyStorySetting = _.cloneDeep(question.storySetting);
    } else {
      question.dirtyStorySetting = '';
    }
  }

  visibleFaqChildQueAndAnsGroup(question, answer) {
    // var opdQuestionsData = OpdService.creatFaqQueAnswerServerData(faqCtrl.faqCurrentSection)
    // faqCtrl.faqCurrentSection = OpdService.mergeAndCreateFaqStory(faqCtrl.faqCurrentSection, opdQuestionsData, null,null);
    const self = this;
    if (answer.ansControlKey == 'input_box' || answer.ansControlKey == 'text_area') {
      return;
    }

    // show dependant child question
    if (answer.ansControlKey == 'check_box') {
      _.map(answer.optionsData, (option) => {
        const checkChildQueExists = _.filter(self.faqCurrentSection, (o) => {
          return o.parentQue == question.questionId
            && o.parentQueAnsGroup == answer.ansGroup
            && o.parentQueAnsGroupOption == option.answer_key;
        });
        _.map(checkChildQueExists, (que) => {
          que.visible = que.parentQueAnsGroupOptionAnsId == option.selectedAns;
          if (!que.visible) {
            que.answerModelArray[0].selectedAns = _.isArray(que.answerModelArray[0].selectedAns) ? [] : '';
            _.map(que.answerModelArray[0].optionsData, (o) => {
              o.selectedAns = '';
            });
            self.visibleFaqChildQueAndAnsGroup(que, que.answerModelArray[0]);
          }
        });
      });
    } else {
      // other than check box
      const checkChildQueExists = _.filter(self.faqCurrentSection, (o) => {
        return o.parentQue == question.questionId && o.parentQueAnsGroup == answer.ansGroup;
      });
      _.map(checkChildQueExists, (que) => {
        if (answer.ansControlKey == 'multi_select' && _.isArray(answer.selectedAns)) {
          que.visible = !_.isUndefined(_.find(answer.selectedAns, { id: que.parentQueAnsGroupOptionAnsId }));
        } else {
          que.visible = que.parentQueAnsGroupOptionAnsId == answer.selectedAns;
        }
        if (!que.visible) {
          que.answerModelArray[0].selectedAns = _.isArray(que.answerModelArray[0].selectedAns) ? [] : '';
          _.map(que.answerModelArray[0].optionsData, (option) => {
            option.selectedAns = '';
          });
          self.visibleFaqChildQueAndAnsGroup(que, que.answerModelArray[0]);
        }
      });
    }

    // show dependant child answer group of same question
    if (answer.ansControlKey == 'check_box') {
      _.map(answer.optionsData, (option) => {
        const checkChildQueExists = _.filter(question.answerModelArray[0], (o) => {
          return o.ansParentGroup == answer.ansGroup
            && o.ansParentOption == option.answer_key;
        });
        _.map(checkChildQueExists, (ans) => {
          ans.visible = ans.ansParentOptionAnsId == option.selectedAns;
          if (!ans.visible) {
            ans.selectedAns = _.isArray(ans.selectedAns) ? [] : '';
            _.map(ans.optionsData, (o) => {
              o.selectedAns = '';
            });
            self.visibleFaqChildQueAndAnsGroup(question, ans);
          }
        });
      });
    } else {
      // other than check box
      const checkChildQueExists = _.filter(question.answerModelArray[0], (o) => {
        return o.ansParentGroup == answer.ansGroup;
      });
      _.map(checkChildQueExists, (ans) => {
        if (answer.ansControlKey == 'multi_select' && _.isArray(answer.selectedAns)) {
          ans.visible = !_.isUndefined(_.find(answer.selectedAns, { id: ans.ansParentOptionAnsId }));
        } else {
          ans.visible = ans.ansParentOptionAnsId == answer.selectedAns;
        }
        if (!ans.visible) {
          ans.selectedAns = _.isArray(ans.selectedAns) ? [] : '';
          _.map(ans.optionsData, (option) => {
            option.selectedAns = '';
          });
          self.visibleFaqChildQueAndAnsGroup(question, ans);
        }
      });
    }
  }

  faqAnswerOnChange(question, answer) {
    const self = this;
    self.visibleFaqChildQueAndAnsGroup(question, answer);

    const opdQuestionsData = self.faqSectionService.creatFaqQueAnswerServerData(self.faqCurrentSection);

    const category = _.find(self.faqCurrentSectionCategoryList, (o) => {
      return o.categoryId == self.faqCurrentSection[0].categoryId;
    });
    category.faqSummaryObject = self.faqSectionService.createFaqSummaryObject(opdQuestionsData, self.patientDetail);
    const allOpdQuestionsData = self.faqSectionService.creatFaqQueAnswerServerData(this.patientFaqSectionList);
    if (!this.isPreview) {
      this.prepareLocalDataForSave(allOpdQuestionsData);
    }
  }

  faqAddAnswerRow(question, answerRowData) {
    const questionCopy = _.cloneDeep(question);
    this.faqSectionService.clearFaqQueAnswerData([questionCopy]);
    question.answerModelArray.push(questionCopy.answerModelArray[0]);
  }

  faqRemoveAnswerRow(question, answerRowDataIndex) {
    const self = this;
    question.answerModelArray.splice(answerRowDataIndex, 1);
    // update summary data
    let opdQuestionsData = this.faqSectionService.creatFaqQueAnswerServerData(this.faqCurrentSection);
    const category = _.find(this.faqCurrentSectionCategoryList, (o) => {
      return o.categoryId == self.faqCurrentSection[0].categoryId;
    });
    category.faqSummaryObject = this.faqSectionService.createFaqSummaryObject(opdQuestionsData, self.patientDetail);

    // visible question if parent question condition true?
    opdQuestionsData = self.faqSectionService.creatFaqQueAnswerServerData(self.patientFaqSectionList);
    if (!this.isPreview) {
      this.prepareLocalDataForSave(opdQuestionsData);
    }
    self.faqSectionService.visibleFaqChildQueAndAnsGroup(self.patientFaqSectionList, opdQuestionsData);
  }

  addTagToStory(question, storyKey) {
    question.dirtyStorySetting += ' ' + storyKey;
  }

  addAnswerTagToStory(question, ansGroupIndex) {
    question.dirtyStorySetting += ' #Answer' + (ansGroupIndex + 1) + '#';
  }

  saveStorySetting() {
    // save multiple story setting to api
    const self = this;
    const faqQuesStorySettings = [];
    _.map(self.faqCurrentSection, (question) => {
      if (question.showStorySetting && question.dirtyStorySetting != question.storySetting) {
        const storySettingObject = {
          template_id: question.sectionId,
          question_id: question.questionId,
          que_story_setting: question.dirtyStorySetting
        };
        question.storySetting = _.cloneDeep(question.dirtyStorySetting);
        faqQuesStorySettings.push(storySettingObject);
      }
    });
    if (faqQuesStorySettings.length > 0) {
      this.faqSectionService.updateFAQStorySetting(self.faqTemplateList, faqQuesStorySettings)
        .subscribe(result => {
          if (result) {
            this.setAlertMessage = {
              message: 'Story Setting Saved Successfully.',
              messageType: 'success',
              duration: 3000
            };
            // when call from setting
            if (this.faqSetting) {
              // store for active section question list
              _.map(faqQuesStorySettings, (storyQue) => {
                const queExists = _.find(self.faqSetting.AllQuestionset, (o) => {
                  return o.questionId == storyQue.question_id;
                });
                if (queExists) {
                  queExists.storySetting = _.cloneDeep(storyQue.que_story_setting);
                }
              });
              // store for all section question list
              _.map(faqQuesStorySettings, (storyQue) => {
                const sectionExists = _.find(self.faqSetting.sectionWiseData, (o) => {
                  return o.template_id == self.sectionId;
                });
                if (sectionExists) {
                  const categoryExists = _.find(sectionExists.form_data, (o) => {
                    return o.form_id == self.categoryId;
                  });
                  if (categoryExists) {
                    _.map(categoryExists.que_group_data, (questionGroup) => {
                      const queExists = _.find(questionGroup.qus_n_ans, (o) => {
                        return o.question_id == storyQue.question_id;
                      });
                      if (queExists) {
                        queExists.que_story_setting = _.cloneDeep(storyQue.que_story_setting);
                      }
                    });
                  }
                }
              });
            }

            // update question story in master setting of consultataion page
            self.faqSectionService.getSectionById(self.sectionId).subscribe(res => {
              const faqServerData = [res]; // [0].data.data;
              // store for all section question list
              _.map(faqQuesStorySettings, (storyQue) => {
                const sectionExists = _.find(faqServerData, (o) => {
                  return o.template_id == self.sectionId;
                });

                if (sectionExists) {
                  const categoryExists = _.find(sectionExists.form_data, (o) => {
                    return o.form_id == self.categoryId;
                  });
                  if (categoryExists) {
                    _.map(categoryExists.que_group_data, (questionGroup) => {
                      const queExists = _.find(questionGroup.qus_n_ans, (o) => {
                        return o.question_id == storyQue.question_id;
                      });
                      if (queExists) {
                        queExists.que_story_setting = _.cloneDeep(storyQue.que_story_setting);
                      }
                    });
                  }
                }
              });
            }, (error) => {
            });
          } else {
            this.setAlertMessage = {
              message: 'Failed to save story setting.',
              messageType: 'danger',
              duration: 3000
            };
          }
        });
    } else {
      this.setAlertMessage = {
        message: 'Story Setting Saved Successfully.',
        messageType: 'success',
        duration: 3000
      };
    }

    const opdQuestionsData = self.faqSectionService.creatFaqQueAnswerServerData(self.faqCurrentSection);
    const category = _.find(self.faqCurrentSectionCategoryList, (o) => {
      return o.categoryId == self.faqCurrentSection[0].categoryId;
    });
    category.faqSummaryObject = self.faqSectionService.createFaqSummaryObject(opdQuestionsData, self.patientDetail);
  }

  clearStorySetting(question) {
    question.dirtyStorySetting = '';
  }

  cancelStorySetting(question) {
    question.dirtyStorySetting = '';
    question.showStorySetting = false;
  }

  makeFaqDirty() {
    const self = this;
    const clonedOrigionalObject = this.faqSectionService.creatFaqQueAnswerServerData(_.cloneDeep(self.originalfaqInputs));

    const currentObject = this.faqSectionService.creatFaqQueAnswerServerData(_.cloneDeep(self.patientFaqSectionList));
    _.map(clonedOrigionalObject, (o) => {
      delete o.story_setting;
    });
    _.map(currentObject, (o) => {
      delete o.story_setting;
    });

    if (!_.isEqual(currentObject, clonedOrigionalObject)) {
      // mark dirty object.
      // OpdHelperService.markDirtyObject("faqInputs",true);
    }
  }

  checkFaqSectionDirty(checkOnClose) {
    const self = this;
    if (checkOnClose) {
      if (!this.faqCurrentSectionCategoryList || this.faqCurrentSectionCategoryList.length == 0) {
        return false;
      }
      // var closedsection = _.unique(faqCtrl.faqCurrentSectionCategoryList, "sectionId");
      const dirtySectionIndex = _.findIndex(self.faqTemplateList, { 'template_id': self.sectionId });
      const isDirty = _.find(self.faqCurrentSectionCategoryList, (category) => {
        return _.isArray(category.faqSummaryObject)
          && category.faqSummaryObject.length > 0 && category.sectionId == self.sectionId;
      });
      if (dirtySectionIndex !== -1) {
        this.faqTemplateList[dirtySectionIndex].isDirty = !_.isUndefined(isDirty);
      }
    } else {
      const allSections = _.cloneDeep(this.consultationService.getConsultationFormDataByKey(this.patientId, 'PatientFaqInputs'));
      const opdQuestionsData = this.faqSectionService.creatFaqQueAnswerServerData(allSections);

      _.map(this.faqTemplateList, (section) => {
        const isDirty = _.find(opdQuestionsData, (category) => {
          return category.template_id == section.template_id;
        });
        section.isDirty = !_.isUndefined(isDirty);
      });
    }
  }

  closeFaqPopup() { // do not change scope
    this.popupLoaded = false;
    if (this.faqSetting) {
      this.faqSetting.modalInstancePreview.close();
    } else {
      this.makeFaqDirty();
      this.checkFaqSectionDirty(true);
    }
    this.dyanamicChartService.sendEventToParentChartContainer.next({ source: 'faqSection', content: { openPopup: false } });
  }

  beforeChange($event) {
    // console.log(this.activeTabName);
    $event.preventDefault();
  }

  menuClicked($event) {
    this.publicService.componentSectionClicked({
      sectionKeyName: 'faq_section',
      faqSubSectionList: this.faqCurrentSectionCategoryList,
      faqSectionName: this.sectionData.template_name
    }); // -- to update suggestion list
  }

  subcriptionOfEvents() {
    // -- event subscribed if any suggestion list is updated
    const subscription = this.publicService.listenEventFromSuggList.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.key == this.sectionData.template_name) {
        this.activeSubSection = data.data;
        this.loadFaqSectionFromUnclubbed(this.activeSubSection, false, true);
      }
    });
  }

  mapSuggestionFlag() {
    _.map(this.faqCurrentSectionCategoryList, (o, index) => {
      o['checked'] = (index == 0);
    });
  }

  trackByFunction = (index, item) => {
    if (!item) { return null; }
    return index;
  }

  prepareLocalDataForSave(answerData) {
    const answerArray = _.cloneDeep(answerData);
    _.map(answerArray, (answer) => {
      answer.answer_id = (answer.answer_id === answer.answer_text) ? 0 : answer.answer_id;
      answer.chart_detail_id = this.chartDetailId;
      // delete answer.question_text;
      // delete answer.control_key;
      // delete answer.form_id;
      // delete answer.form_name;
      // delete answer.question_group_id;
      // delete answer.question_group_name;
      // delete answer.section_group_format;
      delete answer.summary_merge;
      delete answer.repeat_ans;
      delete answer.order_by_grp_key;
      delete answer.order_by;
      // delete answer.section_tabular_headingData;
    });
    this.dyanamicChartService.updateLocalChartData('custom_template_detail', answerArray, 'update', this.chartDetailId);
  }

  panelChange(event: NgbPanelChangeEvent): void {
    this.isPanelOpen = event.nextState;
  }

  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }

}

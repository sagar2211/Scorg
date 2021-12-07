import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { environment } from './../../../environments/environment';
import { map } from 'rxjs/operators';
import { PublicService } from './public.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ConsultationService } from './consultation.service';
import { AuthService } from '../../public/services/auth.service';

interface Array<T> {
  remove(o: T): Array<T>;
}

@Injectable({
  providedIn: 'root'
})
export class FaqSectionsService {
  faqSectionList = [];
  masterCopyofFaqSectionDetails: any[] = [];
  faqSectionFormData = [];
  answerFaqGroupList = [
    {
      groupId: 'grp1',
      groupName: 'Answer Group 1'
    },
    {
      groupId: 'grp2',
      groupName: 'Answer Group 2'
    },
    {
      groupId: 'grp3',
      groupName: 'Answer Group 3'
    },
    {
      groupId: 'grp4',
      groupName: 'Answer Group 4'
    },
    {
      groupId: 'grp5',
      groupName: 'Answer Group 5'
    },
    {
      groupId: 'grp6',
      groupName: 'Answer Group 6'
    },
    {
      groupId: 'grp7',
      groupName: 'Answer Group 7'
    },
    {
      groupId: 'grp8',
      groupName: 'Answer Group 8'
    },
    {
      groupId: 'grp9',
      groupName: 'Answer Group 9'
    },
    {
      groupId: 'grp10',
      groupName: 'Answer Group 10'
    }];

  patientDetail = {
    salutation: 1,
    patient_name: 'Dummy Patient'
  };

  constructor(private http: HttpClient,
    private _publicService: PublicService,
    private _consultationService: ConsultationService,
    private authService: AuthService
  ) {
  }

  getPatientSectionHistoryDetail(): Observable<any> {
    const patientId = this._consultationService.getPatientObj('patientId');
    const activeFormPatientsSectionData = this._consultationService.getConsultationFormDataByKey(patientId, 'PatientSectionHistoryDetail');
    if (activeFormPatientsSectionData) {
      return of(activeFormPatientsSectionData);
    } else {
      // CAll to API by form id.
      const reqUrl = environment.STATIC_JSON_URL + 'faq_section.json';
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          const result = res.getPatientSectionHistoryDetail.data.history_data;
          return this._consultationService.setConsultationFormData(patientId, 'PatientSectionHistoryDetail', result);
        })
      );
    }
  }

  templateSectionData = [];

  getSectionById(id): Observable<any> {
    const tempData = _.findIndex(this.templateSectionData, d => {
      return d.id === id;
    });
    if (tempData !== -1) {
      return of(this.templateSectionData[tempData].data);
    } else {
      const reqUrl = environment.dashboardBaseURL + '/Template/GetTemplateById?template_id=' + id;
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          res.data.template_id = id;
          const result = res.data;
         const obj = {
            id: id,
            data: result
          };
          this.templateSectionData.push(_.cloneDeep(obj));
          return _.cloneDeep(result);
        })
      );
    }
  }

  createLocalFaqStory(sectionServiceData) {
    const answerGroupList = _.map(this.answerFaqGroupList, x => Object.assign(x));

    // map option key to all option data
    _.map(sectionServiceData, template => {
      _.map(template.form_data, category => {
        _.map(category.que_group_data, section => {
          _.map(section.qus_n_ans, question => {
            _.map(question.ans_list, (answerGroup, i) => {
              _.map(answerGroup.option_list, (answer, index) => {
                answer.ans_id = answer.id;
                answer.answer_key = answer.answer_key || (Math.random() + '').replace('.', '');
                answer.option = index + 1;
                answer.answer_key = answer.answer_key;
              });
            });
          });
        });
      });
    });

    // create question list from all template
    const questionList = [];
    _.map(sectionServiceData, template => {
      _.map(template.form_data, category => {
        _.map(category.que_group_data, section => {
          _.map(section.qus_n_ans, question => {
            questionList.push(question);
          });
        });
      });
    });

    const allQuestionSet = [];
    _.map(sectionServiceData, template => {
      _.map(template.form_data, category => {
        _.map(category.que_group_data, sectionGroup => {
          _.map(sectionGroup.qus_n_ans, question => {
            const questionObject: any = {
              sectionId: template.template_id,
              sectionKey: template.template_key,
              is_generic: template.is_generic,
              sectionName: template.template_name,

              categoryId: category.form_id,
              categoryName: category.form_name,
              categorySummary: category.form_summary,
              categoryDescription: category.form_description,

              sectionGroupId: sectionGroup.question_group_id,
              sectionGroupName: sectionGroup.question_group_name,
              sectionGroupFormat: sectionGroup.display_format,
              sectionQuestionHeading: sectionGroup.question_heading || 'Feedback',
              sectionTabularHeadingCount: sectionGroup.tabular_headings_data.length,
              sectionTabularHeadingData: sectionGroup.tabular_headings_data,

              lastUsed: question.last_used,
              usedNumber: question.used_number,
              questionId: question.question_id,
              questionText: question.question_text,
              questionControlSize: question.question_control_size || 12,
              parentQue: '', // question.parent_que_id,
              parentQueName: '-',
              parentQueAnsGroup: '', // question.parent_que_group,
              parentQueAnsGroupName: '-',
              parentQueAnsGroupOption: '', // question.parent_que_group_option,
              parentQueAnsGroupOptionName: '-',
              repeatAnsGroup: sectionGroup.summary_merge == 1 ? false : (question.repeat_ans == 1 ? true : false),
              orderByAnsGroup: sectionGroup.summary_merge == 1 ? '' : (question.order_by_grp_key || ''),
              orderBy: sectionGroup.summary_merge == 1 ? '' : (question.order_by == 1 ? true : false),

              storySetting: question.que_story_setting || '',
              showStorySetting: false,
              dirtyStorySetting: '',
              summary_merge: sectionGroup.summary_merge || '0',
              answerModelArray: []
            };

            // set parent que
            const questionExists = _.find(questionList, (o) => o.question_id == question.parent_que_id);

            if (!_.isUndefined(questionExists)) {
              questionObject.parentQue = questionExists.question_id;
              questionObject.parentQueName = questionExists.question_text;
              // set parent que ans group
              const groupExists = _.find(questionExists.ans_list, (o) => o.group_key == question.parent_que_group);
              const groupNameExists = _.find(answerGroupList, (o) => o.groupId == question.parent_que_group);
              if (!_.isUndefined(groupExists) && !_.isUndefined(groupNameExists)) {
                questionObject.parentQueAnsGroup = question.parent_que_group;
                questionObject.parentQueAnsGroupName = groupNameExists.groupName;

                // set parent que ans group option
                question.parent_que_group_option = question.parent_que_group_option || '';
                const answerExists = _.find(groupExists.option_list, (o) => {
                  return o.answer_key == question.parent_que_group_option;
                });
                if (!_.isUndefined(answerExists)) {
                  questionObject.parentQueAnsGroupOption = question.parent_que_group_option;
                  questionObject.parentQueAnsGroupOptionAnsId = answerExists.ans_id;
                  questionObject.parentQueAnsGroupOptionName = answerExists.answer_text + ' (Option ' + answerExists.option + ')';
                }
              }
            }

            const answerRowData = [];
            _.map(question.ans_list, function (answerGroup, index) {
              const answerObject: any = {
                ansGroup: answerGroup.group_key,
                ansGroupName: '',
                ansGroupLabel: (answerGroup.group_label !== null && answerGroup.group_label !== '0') ? answerGroup.group_label : '',
                ansGroupControlSize: answerGroup.control_size || 12,
                ansGroupPlaceholder: answerGroup.group_placeholder || '',
                ansControlId: answerGroup.control_id,
                ansControlKey: answerGroup.control_key,
                ansControlName: answerGroup.control_name,
                ansParentGroup: '', // answerGroup.parent_group_key,
                ansParentGroupName: '-',
                ansParentOption: '', // answerGroup.parent_group_option,
                ansParentOptionName: '-',
                answerTextShow: true,
                optionsData: [],
                answerIsDynamic: answerGroup.is_dynamic_options,
                answerIsSearchByKey: answerGroup.is_search_by_keyword,
                answerDbQuery: answerGroup.db_query
              };

              // set group name
              const groupNameExists = _.find(answerGroupList, (o) => o.groupId == answerGroup.group_key);
              if (!_.isUndefined(groupNameExists)) {
                answerObject.ansGroupName = groupNameExists.groupName;
              }

              // set answer group parent group name
              const parentGroupExists = _.find(question.ans_list, (o) => o.group_key == answerGroup.parent_group_key);
              const parentGroupNameExists = _.find(answerGroupList, (o) => o.groupId == answerGroup.parent_group_key);
              if (!_.isUndefined(parentGroupExists) && !_.isUndefined(parentGroupNameExists)) {
                answerObject.ansParentGroup = parentGroupNameExists.groupId;
                answerObject.ansParentGroupName = parentGroupNameExists.groupName;

                // set answer group parent group option name
                answerGroup.parent_group_option = answerGroup.parent_group_option || '';
                const answerExists = _.find(parentGroupExists.option_list, (o) => o.answer_key == answerGroup.parent_group_option);
                if (!_.isUndefined(answerExists)) {
                  answerObject.ansParentOption = answerExists.answer_key;
                  answerObject.ansParentOptionAnsId = answerExists.id;
                  answerObject.ansParentOptionName = answerExists.answer_text + ' (Option ' + answerExists.option + ')';
                }
              }

              _.map(answerGroup.option_list, (answer) => {
                const answers = {
                  ans_id: answer.id + '',
                  answer_text: answer.answer_text,
                  id: answer.id,
                  label: answer.answer_text,
                  option: answer.option,
                  optionName: answer.answer_text + ' (Option ' + (answer.option) + ')',
                  answer_key: answer.answer_key,
                  answer_control_size: answer.answer_control_size ? answer.answer_control_size : 3,
                };
                answerObject.optionsData.push(answers);
              });

              // hide option answer_text in tabular view for radio / checkbox
              // if answer heading text and option text are same and length equal to one
              if (questionObject.sectionGroupFormat == 'tabular'
                && (answerObject.ansControlKey == 'check_box'
                  || answerObject.ansControlKey == 'radio')
                && answerObject.optionsData.length == 1) {
                if (questionObject.sectionTabularHeadingData[index]
                  && questionObject.sectionTabularHeadingData[index].answer_group_heading
                  && (answerObject.optionsData[0].answer_text.toLowerCase() ==
                    questionObject.sectionTabularHeadingData[index].answer_group_heading.toLowerCase())) {
                  answerObject.answerTextShow = false;
                }
              }

              answerRowData.push(answerObject);
            });

            questionObject.answerModelArray.push(answerRowData);

            // delete tabular answer groups which are greater than tablur column count
            if (questionObject.sectionGroupFormat == 'tabular') {
              if (questionObject.sectionTabularHeadingCount == 0) {
                // questionObject.sectionGroupFormat == "horizontal";
              } else {
                if (questionObject.answerModelArray[0].length > questionObject.sectionTabularHeadingCount) {
                  questionObject.answerModelArray[0].splice(questionObject.sectionTabularHeadingCount, questionObject.answerModelArray[0].length - questionObject.sectionTabularHeadingCount);
                }
              }
            }

            // label show for andwer group or not
            const labelAdded = _.find(questionObject.answerModelArray[0], (answer) => {
              return answer.ansGroupLabel != '' && (answer.ansControlKey == 'input_box'
                || answer.ansControlKey == 'text_area' || answer.ansControlKey == 'dropdown_list');
            });
            questionObject.ansGroupLabelShow = !_.isUndefined(labelAdded);

            allQuestionSet.push(questionObject);
          });
        });
      });
    });
    return allQuestionSet;
  }

  mergeAndCreateFaqStory(localStorySettings, opdQueData, patientDetail, summaryObject) {
    let opdQuesData: any = [];
    opdQuesData = _.isArray(opdQueData) ? opdQueData : [];

    // merge story
    _.map(localStorySettings, (question) => {
      // check repeated question answer groups exists
      const queAnswerRowExists = _.uniqBy(_.filter(opdQuesData, (o) => {
        return o.question_id == question.questionId;
      }), 'answer_row_id');

      // add repeated question answer groups
      if (queAnswerRowExists.length > 1) {
        // remove existing greater than one row
        _.remove(question.answerModelArray, (v, k) => k > 0);
        // add repeat answer row, answer avail for
        _.map(queAnswerRowExists, (v, k) => {
          if (k > 0) {
            question.answerModelArray.push(_.cloneDeep(question.answerModelArray[0]));
          }
        });
      }

      _.map(question.answerModelArray, (answerRowData, answerRowDataIndex) => {
        _.map(answerRowData, (answerGroup) => {
          if (answerGroup.ansControlKey != 'check_box') {
            const answerExists = _.filter(opdQuesData, (o) => {
              return o.question_id == question.questionId
                && o.answer_row_id == answerRowDataIndex + 1
                && o.ans_group_key == answerGroup.ansGroup;
            });
            answerGroup.selectedAns = answerGroup.ansControlKey != 'multi_select' ? '' : [];

            if (answerExists.length > 0 && answerGroup.ansControlKey != 'multi_select') {
              if (answerGroup.ansControlKey == 'datepicker') {
                const getFaqDateControlAns = new Date(answerExists[0].answer_id); // ).format("YYYY-MM-DD");
                answerGroup.selectedAns = getFaqDateControlAns;
              } else {
                answerGroup.selectedAns = _.cloneDeep(answerExists[0].answer_id + '');
              }
            } else if (answerExists.length > 0 && answerGroup.ansControlKey == 'multi_select') {
              _.map(answerExists, (ans) => {
                const option = { id: ans.answer_id + '' };
                answerGroup.selectedAns.push(_.cloneDeep(option));
              });
            }
          } else if (answerGroup.ansControlKey == 'check_box') {
            _.map(answerGroup.optionsData, (option) => {
              const answerExists = _.find(opdQuesData, (o) => {
                return o.question_id == question.questionId
                  && o.answer_row_id == answerRowDataIndex + 1
                  && o.ans_group_key == answerGroup.ansGroup
                  && o.answer_id == option.ans_id;
              });
              option.selectedAns = '';
              if (!_.isUndefined(answerExists)) {
                option.selectedAns = _.cloneDeep(answerExists.answer_id + '');
              }
            });
          }
        });
      });
    });

    // visible question if parent question condition true?
    this.visibleFaqChildQueAndAnsGroup(localStorySettings, opdQuesData);

    // rearrage question as per parent - child relation
    localStorySettings = this.rerrageFaqQuestionOrder(localStorySettings);

    const opdQuestionsData = this.creatFaqQueAnswerServerData(localStorySettings);
    summaryObject = _.isArray(summaryObject) ? [] : summaryObject;
    summaryObject.splice(0);
    summaryObject = this.createFaqSummaryObject(opdQuestionsData, patientDetail);
    return _.cloneDeep(localStorySettings);
  }

  visibleFaqChildQueAndAnsGroup(localStorySettings, opdQuestionsData) {
    // visible question if parent question condition true?
    _.map(localStorySettings, question => {
      question.visible = true;
      if (question.parentQue != '' && question.parentQueAnsGroup != '' && question.parentQueAnsGroupOption != '') {
        const answerExists = _.find(opdQuestionsData, (o) => {
          return o.question_id == question.parentQue
            && o.ans_group_key == question.parentQueAnsGroup
            && o.answer_id == question.parentQueAnsGroupOptionAnsId;
        });
        question.visible = !_.isUndefined(answerExists);
      }
      // visible answer group if parent answer group condition true?
      _.map(question.answerModelArray, (answerRowData, answerRowDataIndex) => {
        _.map(answerRowData, (answerGroup) => {
          answerGroup.visible = true;
          if (answerGroup.ansParentGroup != '' && answerGroup.ansParentOption != '') {
            const answerExists = _.find(opdQuestionsData, (o) => {
              return o.question_id == question.questionId
                && o.answer_row_id == answerRowDataIndex + 1
                && o.ans_group_key == answerGroup.ansParentGroup
                && o.answer_id == answerGroup.ansParentOptionAnsId;
            });
            answerGroup.visible = !_.isUndefined(answerExists);
          }
        });
      });
    });
  }

  rerrageFaqQuestionOrder(localStorySettings) {
    const faqReArrangedList = [];
    const self = this;
    // check one by one to add question with arrange order
    _.map(localStorySettings, (question) => {
      // rearrange answer groups
      self.rearrageFaqQuestionAnsOrder(question);

      if (question.parentQue == '') {
        // if no parent question
        const checkAlreadyExists = _.find(faqReArrangedList, o => o.questionId == question.questionId);
        if (_.isUndefined(checkAlreadyExists)) {
          faqReArrangedList.push(question);
        }
      } else if (question.parentQue != '') {
        // if parent question
        const parentQueAlreadyAddedOrNot = _.find(faqReArrangedList, o => o.questionId == question.parentQue);
        if (!_.isUndefined(parentQueAlreadyAddedOrNot)) {
          const checkAlreadyExists = _.find(faqReArrangedList, o => o.questionId == question.questionId);
          if (_.isUndefined(checkAlreadyExists)) {
            faqReArrangedList.push(question);
          }
        } else {
          const parentQue = _.find(localStorySettings, o => o.questionId == question.parentQue);
          if (!_.isUndefined(parentQue)) {
            const findDt = _.find(faqReArrangedList, o => o.questionId == parentQue.questionId);
            if (_.isUndefined(findDt)) {
              faqReArrangedList.push(parentQue);
            }

            const checkAlreadyExists = _.find(faqReArrangedList, o => o.questionId == question.questionId);
            if (_.isUndefined(checkAlreadyExists)) {
              faqReArrangedList.push(question);
            }
          }
        }
      }
    });
    return faqReArrangedList;
  }

  rearrageFaqQuestionAnsOrder(question) {
    // question.answerModelArray = _.sortBy(question.answerModelArray, 'ansParentGroup');

    const faqReArrangedList = [];
    _.map(question.answerModelArray, (answerRowData, answerRowDataIndex) => {
      const rearrangeAnwerRowData = [];
      _.map(answerRowData, (answer) => {
        if (answer.ansParentGroup == '') { // if no parent group
          const checkAlreadyExists = _.find(rearrangeAnwerRowData, (o) => o.ansGroup == answer.ansParentGroup);
          if (_.isUndefined(checkAlreadyExists)) {
            rearrangeAnwerRowData.push(answer);
          }
        } else if (answer.ansParentGroup != '') { // if parent question
          const parentQueAlreadyAddedOrNot_Index = _.findIndex(rearrangeAnwerRowData, (o) => o.ansGroup == answer.ansParentGroup);
          if (parentQueAlreadyAddedOrNot_Index != -1) {
            const checkAlreadyExists = _.find(rearrangeAnwerRowData, (o) => o.ansGroup == answer.ansGroup);
            if (_.isUndefined(checkAlreadyExists)) {
              // update insert idex if already any child ans added
              const lastIndex = _.findLastIndex(rearrangeAnwerRowData, (o) => o.ansParentGroup == answer.ansParentGroup);
              const pushIndex = (lastIndex != -1) ? lastIndex : parentQueAlreadyAddedOrNot_Index;
              rearrangeAnwerRowData.splice(pushIndex + 1, 0, answer);
            }
          } else {
            const parentQue = _.findIndex(question.answerModelArray[0], (o) => o.ansGroup == answer.ansParentGroup);
            if (!_.isUndefined(parentQue)) {
              const findDt = _.find(rearrangeAnwerRowData, (o) => o.ansGroup == parentQue.ansGroup);
              if (_.isUndefined(findDt)) {
                rearrangeAnwerRowData.push(parentQue);
              }
              const checkAlreadyExists = _.find(rearrangeAnwerRowData, (o) => o.ansGroup == answer.ansGroup);
              if (_.isUndefined(checkAlreadyExists)) {
                rearrangeAnwerRowData.push(answer);
              }
            }
          }
        }
      });
      faqReArrangedList.push(rearrangeAnwerRowData);
    });
    question.answerModelArray.splice(0);
    _.map(faqReArrangedList, (o) => {
      question.answerModelArray.push(o);
    });
  }


  createLocalSectionStory(sectionServiceData) {
    const allQuestionSet = [];
    _.map(sectionServiceData, (template) => {
      _.map(template.form_data, (category) => {
        _.map(category.que_group_data, (sectionGroup) => {

          const questionObject = {
            sectionId: template.template_id,
            sectionKey: template.template_key,
            is_generic: template.is_generic,
            sectionName: template.template_name,

            categoryId: category.form_id,
            categoryName: category.form_name,
            categorySummary: category.form_summary,
            categoryDescription: category.form_description,

            sectionGroupId: sectionGroup.question_group_id,
            sectionGroupName: sectionGroup.question_group_name,
            sectionGroupFormat: sectionGroup.display_format,
            sectionQuestionHeading: sectionGroup.question_heading || 'Feedback',
            sectionTabularHeadingCount: sectionGroup.tabular_headings_data.length,
            sectionTabularHeadingData: sectionGroup.tabular_headings_data,

            repeatAnsGroup: false,
            orderByAnsGroup: '',
            orderBy: false,

            showStorySetting: false,
            dirtyStorySetting: '',
            summary_merge: sectionGroup.summary_merge || '0',
            answerModelArray: []
          };

          allQuestionSet.push(questionObject);
        });
      });
    });
    return allQuestionSet;
  }

  creatFaqQueAnswerServerData(localStorySettings) {
    const opdQuestionsData = [];
    const self = this;
    _.map(localStorySettings, (question) => {
      _.map(question.answerModelArray, (answerRowData, answerRowDataIndex) => {
        _.map(answerRowData, (answerGroup) => {
          if (answerGroup.ansControlKey == 'check_box') {
            _.map(answerGroup.optionsData, (option) => {
              if (option.selectedAns && !_.isUndefined(option.selectedAns) && option.selectedAns != '') {
                const ansDataObject = {
                  question_id: question.questionId,
                  template_id: question.sectionId,
                  template_name: question.sectionName,
                  question_text: question.questionText,//delete
                  answer_row_id: answerRowDataIndex + 1,
                  ans_group_key: answerGroup.ansGroup,
                  control_key: answerGroup.ansControlKey,//delete
                  answer_id: option.selectedAns,
                  answer_text: option.answer_text,
                  story_setting: question.storySetting,
                  form_id: question.categoryId,//delete
                  form_name: question.categoryName,//delete
                  question_group_id: question.sectionGroupId,//delete
                  question_group_name: question.sectionGroupName,//delete
                  section_group_format: question.sectionGroupFormat,//delete
                  summary_merge: question.summary_merge,//delete
                  repeat_ans: question.repeatAnsGroup,//delete
                  order_by_grp_key: question.orderByAnsGroup,//delete
                  order_by: question.orderBy,//delete
                  section_tabular_headingData: question.sectionTabularHeadingData,//delete
                  // question_heading:question.sectionQuestionHeading,
                };
                opdQuestionsData.push(ansDataObject);
              }
            });
          } else if (answerGroup.ansControlKey == 'multi_select') {
            _.map(answerGroup.selectedAns, (option) => {
              if (option.id && !_.isUndefined(option.id) && option.id != '') {
                const answer = self.getFaqAnswerFromOptions(answerGroup.optionsData, option.id);
                const ansDataObject = {
                  question_id: question.questionId,
                  template_id: question.sectionId,
                  template_name: question.sectionName,
                  question_text: question.questionText,
                  answer_row_id: answerRowDataIndex + 1,
                  ans_group_key: answerGroup.ansGroup,
                  control_key: answerGroup.ansControlKey,
                  answer_id: option.id,
                  answer_text: answer,
                  story_setting: question.storySetting,
                  form_id: question.categoryId,
                  form_name: question.categoryName,
                  question_group_id: question.sectionGroupId,
                  question_group_name: question.sectionGroupName,
                  section_group_format: question.sectionGroupFormat,
                  summary_merge: question.summary_merge,
                  repeat_ans: question.repeatAnsGroup,
                  order_by_grp_key: question.orderByAnsGroup,
                  order_by: question.orderBy,
                  section_tabular_headingData: question.sectionTabularHeadingData,
                  // question_heading:question.sectionQuestionHeading,
                };
                opdQuestionsData.push(ansDataObject);
              }
            });
          } else if (answerGroup.selectedAns && !_.isUndefined(answerGroup.selectedAns) && answerGroup.selectedAns != '') {
            let answer = '';
            if (answerGroup.ansControlKey == 'input_box' || answerGroup.ansControlKey == 'text_area' || answerGroup.ansControlKey == 'datepicker') {
              if (answerGroup.ansControlKey == 'datepicker') {
                const selectedDate = moment(answerGroup.selectedAns).format('YYYY-MM-DD');
                answer = selectedDate;
              } else {
                answer = answerGroup.selectedAns;
              }
            } else {
              answer = self.getFaqAnswerFromOptions(answerGroup.optionsData, answerGroup.selectedAns);
            }
            const ansDataObject = {
              question_id: question.questionId,
              template_id: question.sectionId,
              template_name: question.sectionName,
              question_text: question.questionText,
              answer_row_id: answerRowDataIndex + 1,
              ans_group_key: answerGroup.ansGroup,
              control_key: answerGroup.ansControlKey,
              answer_id: (answerGroup.ansControlKey === 'datepicker') ? null : answerGroup.selectedAns,
              answer_text: answer,
              story_setting: question.storySetting,
              form_id: question.categoryId,
              form_name: question.categoryName,
              question_group_id: question.sectionGroupId,
              question_group_name: question.sectionGroupName,
              section_group_format: question.sectionGroupFormat,
              summary_merge: question.summary_merge,
              repeat_ans: question.repeatAnsGroup,
              order_by_grp_key: question.orderByAnsGroup,
              order_by: question.orderBy,
              section_tabular_headingData: question.sectionTabularHeadingData,
              // question_heading:question.sectionQuestionHeading,
            };
            opdQuestionsData.push(ansDataObject);
          }
        });
      });
    });
    return opdQuestionsData;
  }

  createFaqSummaryObject(opdQuestionsData, patientDetail) {
    // var answerSetting = "Summary of  #Title#  #PatientName# #Answer#";
    const self = this;
    const summaryObject = [];
    // create story for non merge questions first
    const questions = _.cloneDeep(_.uniqBy(opdQuestionsData, 'question_id'));

    const AllQuestionObjectForSummary = [];
    // add answers to question
    _.map(questions, (que) => {
      const questionObject = {
        question_id: que.question_id,
        story_setting: que.story_setting,
        question_text: que.question_text,
        question_group_name: que.question_group_name,
        question_group_id: que.question_group_id,
        answer_group: []
      };
      const questionData = _.filter(opdQuestionsData, { question_id: que.question_id });
      self.orderByAnswerRowData(questionData);
      const ansRowData = _.cloneDeep(_.uniqBy(questionData, 'answer_row_id'));
      if (!_.isUndefined(ansRowData)) {
        _.map(ansRowData, (ansRow) => {
          const questionAnsData = _.filter(opdQuestionsData, (o) => {
            return o.question_id == que.question_id
              && o.answer_row_id == ansRow.answer_row_id;
          });
          const questionGroupData = _.cloneDeep(_.uniqBy(questionAnsData, 'ans_group_key'));

          if (!_.isUndefined(questionGroupData)) {
            const answerGroupRowData = [];
            _.map(questionGroupData, (answerGroup) => {
              const ansGroupObject = {
                ans_group_key: answerGroup.ans_group_key,
                answer_data: []
              };
              const groupAnsData = _.filter(questionAnsData, { ans_group_key: answerGroup.ans_group_key });
              _.map(groupAnsData, (answer) => {
                const answerData = {
                  answer_id: answer.answer_id,
                  answer_text: answer.answer_text
                };
                ansGroupObject.answer_data.push(_.cloneDeep(answerData));
              });
              answerGroupRowData.push(ansGroupObject);
            });
            questionObject.answer_group.push(answerGroupRowData);
          }
        });
      }

      AllQuestionObjectForSummary.push(questionObject);
    });

    const nonMergeQuestionsForSummary = _.filter(AllQuestionObjectForSummary, (summaryQueObject) => {
      return _.find(opdQuestionsData, (queObject) => {
        return queObject.question_id == summaryQueObject.question_id
        // && queObject.summary_merge == '0';
      });
    });

    _.map(nonMergeQuestionsForSummary, (question) => {
      _.map(question.answer_group, (answerGroupRowData) => {
        let story_setting = question.story_setting || '';
        if (story_setting.toString().trim() == '') {
          _.map(answerGroupRowData, (ansGroup, index) => {
            story_setting += ' ' + ansGroup.ans_group_key.toLowerCase().replace('grp', '#Answer') + '#';
          });
        }
        const storyList = [];
        const storyObject = [];
        const storyDataObject = [];
        let groupSectionHeading = '';
        self.splitStorySettingByExpression(story_setting, storyList);

        _.map(storyList, (storySetting) => {
          const expressionIndex = {
            first: storySetting.indexOf('{{'),
            last: storySetting.indexOf('}}')
          };
          storySetting = storySetting.replace('{{', '').replace('}}', '');
          let storySplit = _.cloneDeep(storySetting.trim().split(' '));
          const storyAnswer = { keyExists: false, dataExists: false };

          _.map(storySplit, (storyWord, index) => {
            const firstIndex = storyWord.indexOf('#');
            const lastIndex = storyWord.lastIndexOf('#');
            const currentStoryTag = storyWord.substring(firstIndex + 1, lastIndex);

            if (firstIndex != -1 && currentStoryTag != -1 && self.supportedStoryTags(currentStoryTag)) {
              if (currentStoryTag.toLowerCase().indexOf('answer') != -1 && answerGroupRowData.length > 0) {
                storyAnswer.keyExists = true;
                storySplit[index] = self.concatFaqAnswerArrayWithString(answerGroupRowData, currentStoryTag.toLowerCase());
                if (storySplit[index]) {
                  storyAnswer.dataExists = true;
                }
              } else if (currentStoryTag.toLowerCase().indexOf('patientname') != -1) {
                storySplit[index] = patientDetail.patient_name;
              } else if (currentStoryTag.toLowerCase().indexOf('title') != -1) {
                storySplit[index] = self.getSalutation(patientDetail.salutation);
              } else {
                storySplit[index] = '';
              }
            }
          });
          // remove trailing dash
          const storyStr = storySplit.join(' ').trim();
          storySplit = storyStr.split(' ');
          storySplit[storySplit.length - 1] = (storySplit[storySplit.length - 1] === '-') ? '' : storySplit[storySplit.length - 1];
          groupSectionHeading = question.question_group_name == '-' ? ' ' : question.question_group_name;

          if (summaryObject.length > 0) {
            const iscatIndex = _.findIndex(summaryObject, function (o) {
              return o.sectionGroupId == question.question_group_id;
            });
            if (iscatIndex != -1) {
              groupSectionHeading = '';
            }
          }

          if (storyAnswer.keyExists && storyAnswer.dataExists) {
            storyDataObject.push(storySplit.join(' '));
          } else if (!storyAnswer.keyExists) {
            storyDataObject.push(storySplit.join(' '));
          } else if (expressionIndex.first == -1 && expressionIndex.last == -1) {
            storyDataObject.push(storySplit.join(' '));
          }
        });
        if (storyDataObject.length > 0) {
          storyObject.push({ 'category': groupSectionHeading, 'sectionGroupId': question.question_group_id, 'storyData': storyDataObject.join(' ') });
          _.map(storyObject, (storyObj, index) => {
            if (typeof (storyObj) == 'object') {
              summaryObject.push(storyObj);
            } else {
              summaryObject.push(storyObj);
            }
          });
        } else {
          summaryObject.push(storyObject.join(' '));
        }
      });
    });

    return summaryObject;
    // create story for merged questions here

    const mergeQuestions = _.cloneDeep(_.filter(opdQuestionsData, (o) => {
      return o.summary_merge == '1';
    }));

    const sectionGroupData = _.uniqBy(mergeQuestions, 'question_group_id');

    _.map(sectionGroupData, (sgVal, sgIndex) => {
      _.map(sgVal.section_tabular_headingData, (stgVal, stgIndex) => {
        const groupQuestion = _.filter(AllQuestionObjectForSummary, (summaryQueObject) => {
          return _.find(opdQuestionsData, (queObject) => {
            return queObject.question_id == summaryQueObject.question_id
              && queObject.summary_merge == '1'
              && queObject.question_group_id == sgVal.question_group_id
              && queObject.ans_group_key == stgVal.answer_group_key;
          });
        });
        const storyObject = [];
        const tabularQuestionText = [];
        let groupSectionName = '';
        let getQuestionText: any = {};
        _.map(groupQuestion, (que) => {
          const currentAnswerStoryTag = _.cloneDeep(stgVal.answer_group_key).replace('grp', 'answer');
          const story = self.concatFaqAnswerArrayWithString(que.answer_group, currentAnswerStoryTag.toLowerCase());
          getQuestionText = _.find(opdQuestionsData, (o) => {
            return o.question_id == que.question_id;
          });
          stgVal.questionText = getQuestionText.question_text;
          // storyObject.push(story);

          tabularQuestionText.push(getQuestionText.question_text);
          groupSectionName = getQuestionText.question_group_name == '-' ? '  ' : getQuestionText.question_group_name;

          // storyObject.push({'category':getQuestionText.question_group_name,'storyData':getQuestionText.question_text});
          // storyObject.join('. ');

        });
        if (tabularQuestionText.length > 0) {
          tabularQuestionText.unshift(stgVal.answer_group_heading + '-');
          const questionsetData = tabularQuestionText.join('. ');
          // storyObject.push({'category':groupSectionName,'storyData':questionsetData});
          if (summaryObject.length > 0) {
            const catIndex = _.findIndex(summaryObject, (o) => {
              return o.sectionGroupId == getQuestionText.question_group_id;
            });
            if (catIndex != -1) {
              groupSectionName = '';
            }
          }

          summaryObject.push({ 'category': groupSectionName, 'sectionGroupId': getQuestionText.question_group_id, 'storyData': questionsetData });

          _.map(summaryObject, (sVal, sIndex) => {
            sVal.storyData = sVal.storyData.replace('-.', '-');
          });
        }

      });
    });


    return summaryObject; // _.sortBy(summaryObject,function(o){return o.sectionGroupId});
  }

  getFaqAnswerFromOptions(optionsData, ansId) {
    let answer = '';
    const answerOption = _.find(optionsData, (o) => {
      return o.ans_id == ansId;
    });
    if (!_.isUndefined(answerOption)) {
      answer = answerOption.answer_text;
    }
    return answer;
  }

  orderByAnswerRowData(questionData) {
    // check ans data exists && setting avail for order by..
    const self = this;
    let returnData = [];
    if (questionData.length > 0 && questionData[0].repeat_ans && questionData[0].order_by_grp_key) {
      const questionDataCloned = _.cloneDeep(questionData);
      const orderByAnsGroup = questionData[0].order_by_grp_key;
      const orderBy = questionData[0].order_by ? 'asc' : 'desc';
      let orderByKey = 'answer_text';

      const orderByAnswerData = _.filter(questionData, (o) => {
        return o.ans_group_key == orderByAnsGroup;
      });

      if (orderByAnswerData.length > 0) {
        orderByKey = orderByAnswerData[0].control_key == 'datepicker' ? 'answer_id' : 'answer_text';
      }

      const orderChanged = _.orderBy(orderByAnswerData, [orderByKey], [orderBy]);
      const uniqRowIds = _.uniqBy(orderChanged, 'answer_row_id');

      _.map(uniqRowIds, (rowData) => {
        const answerData = _.filter(questionDataCloned, (o) => {
          return o.answer_row_id == rowData.answer_row_id;
        });
        returnData = _.concat(returnData, answerData);
      });

      // check any thing missing row_id
      const whichDataNotAdded = _.filter(questionDataCloned, (ans) => {
        return _.isUndefined(_.find(uniqRowIds, (row) => {
          return row.answer_row_id == ans.answer_row_id;
        }));
      });
      returnData = _.cloneDeep(_.concat(returnData, whichDataNotAdded));

      questionData.splice(0);
      questionData.push.apply(questionData, returnData);
    }

  }

  supportedStoryTags(tag) {
    if (tag == 'Answer' || tag == 'Answer1' || tag == 'Answer2' || tag == 'Answer3'
      || tag == 'Answer4' || tag == 'Answer5' || tag == 'Answer6'
      || tag == 'Answer7' || tag == 'Answer8' || tag == 'Answer9'
      || tag == 'Answer10') {
      return true;
    } else if (tag == 'PatientName') {
      return true;
    } else if (tag == 'Title') {
      return true;
    }
    return false;
  }

  splitStorySettingByExpression(strorySetting, storyList, flag?) {
    if (!flag) {
      const strorySplit = strorySetting.split('{{');
      const strorySplitIndex = strorySetting.indexOf('{{');
      storyList.push(strorySplit[0]);

      if (strorySplit[1] && strorySplitIndex != -1) {
        this.splitStorySettingByExpression(strorySetting.slice(strorySplitIndex + 2).trim(), storyList, 'end');
      }
    } else if (flag == 'end') {
      const strorySplit = strorySetting.split('}}');
      const strorySplitIndex = strorySetting.indexOf('}}');
      storyList.push((strorySplitIndex != -1 ? '{{' : '') + strorySplit[0] + (strorySplitIndex != -1 ? '}}' : ''));

      if (strorySplit[1] && strorySplitIndex != -1) {
        this.splitStorySettingByExpression(strorySetting.slice(strorySplitIndex + 2).trim(), storyList);
      }
    }
  }

  concatFaqAnswerArrayWithString(answerObject, answerKey) {
    const groupKey = answerKey.replace('answer', 'grp');
    const answer = _.find(answerObject, { ans_group_key: groupKey });
    let data = '';
    if (answer) {
      _.map(answer.answer_data, (obj, index) => {
        data += (index != 0 ? ', ' : '') + obj.answer_text;
      });
    }
    return data;
  }

  getSalutation(details) {
  }

  // setFaqSectionData(data, key, push?) {
  //   const index = this.checkFaqDataExistForActiveForm();
  //   if (index == -1) {
  //     const obj = {};
  //     obj['formId'] = this._publicService.activeFormId;
  //     obj[key] = data;
  //     this.faqSectionFormData.push(obj);
  //   } else {
  //     if (push) {
  //       if (this.faqSectionFormData[index][key] == undefined) {
  //         this.faqSectionFormData[index][key] = [];
  //       }
  //       this.faqSectionFormData[index][key].push(data);
  //     } else {
  //       this.faqSectionFormData[index][key] = data;
  //     }
  //   }
  // }

  checkFaqDataExistForActiveForm() {
    const self = this;
    const index = _.findIndex(self.faqSectionFormData, (o) => {
      return o.formId == self._publicService.activeFormId;
    });
    return index;
  }

  clearFaqQueAnswerData(localStorySettings) {
    _.map(localStorySettings, (question) => {
      // remove repeated data...
      _.remove(question.answerModelArray, (n) => {
        return n > 0;
      });
      _.map(question.answerModelArray, (answerRowData) => {
        _.map(answerRowData, (answerGroup) => {
          if (answerGroup.ansControlKey == 'check_box') {
            _.map(answerGroup.optionsData, (option) => {
              if (option.selectedAns && !_.isUndefined(option.selectedAns) && option.selectedAns != '') {
                option.selectedAns = '';
              }
            });
          } else if (answerGroup.ansControlKey == 'multi_select') {
            _.map(answerGroup.selectedAns, (option) => {
              if (option.id && !_.isUndefined(option.id) && option.id != '') {
                option.id = '';
              }
            });
          } else if (answerGroup.selectedAns && !_.isUndefined(answerGroup.selectedAns) && answerGroup.selectedAns != '') {
            answerGroup.selectedAns = '';
          }
        });
      });
    });
  }

  updateFAQStorySetting(faqSectionList, questionStoryData): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Template/SaveTemplateQuestionStory';
    const param = {
      templateId: questionStoryData[0]['template_id'],
      questionId: questionStoryData[0]['question_id'],
      queStorySetting: questionStoryData[0]['que_story_setting']
    };
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
    // const self = this;
    // const url = '/PageSetting/updateFAQStorySetting';
    // const params = questionStoryData;
    // const template_id = questionStoryData.length > 0 ? questionStoryData[0].template_id : -1;
    // const sectionExists = _.find(faqSectionList, (section) => {
    //   return section.template_id == template_id;
    // });
    // return of(true);
  }

  ngCopy(data): any {
    if (_.isArray(data)) {
      return _.map(data, x => Object.assign({}, x));
    } else {
      return Object.assign({}, data);
    }
  }

  getAnswerDataBySearchKeyword(obj, searchKeyword): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/Template/GetAnswerOptionList';
    const param = {
      dbQuery: obj.answerDbQuery || obj.dbQuery,
      searchKeyword: searchKeyword,
      isSearchByKeyword: obj.answerIsSearchByKey || obj.isSearchByKeyword
    };
    if (_.isUndefined(param.dbQuery) || param.dbQuery === null || param.dbQuery === '') {
      console.error("DbQuery not defined for Dynamic Dropdown:", obj);
      return of([]);
    }
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      return res.data;
    }));
  }
}

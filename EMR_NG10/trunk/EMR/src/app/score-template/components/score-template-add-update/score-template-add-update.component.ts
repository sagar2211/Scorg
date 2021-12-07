import { ScoreTemplateService } from './../../../public/services/score-template.service';
import { map, findIndex } from 'rxjs/operators';
import { MappingService } from './../../../public/services/mapping.service';
import { Observable } from 'rxjs';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import { Field, Value } from './../../../gereratefaqtemplates/faqmodel';
import { Router, ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/config/constants';
import { IAlert } from './../../../public/models/AlertMessage';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-score-template-add-update',
  templateUrl: './score-template-add-update.component.html',
  styleUrls: ['./score-template-add-update.component.scss']
})
export class ScoreTemplateAddUpdateComponent implements OnInit {

  scoreTemplateAction = {
    type: 'add',
    data: null
  };
  setAlertMessage: IAlert;
  loadForm: boolean;

  serviceType$ = new Observable<any>();
  speciality$ = new Observable<any>();
  serviceList: Array<any> = [];
  specialityList: Array<any> = [];
  scoreTemplateDataSelected = {
    scoreTemplateId: 0,
    selectedServiceType: null,
    selectedSpeciality: null,
    templateName: null,
    templateSummaryText: '',
    summaryData: []
  };

  optionSizeList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


  scoreTemplateSummaryObj = {
    summary_id: 0,
    summary_value: 0,
    summary_operator: '',
    summary_text: '',
    summary_min_value: 0,
    summary_max_value: 0,
    errors: {summary_operator: false, summary_value: false, summary_text: false, summary_min_value: false, summary_max_value: false}
  };

  fieldModels: Array<Field> = [
    {
      type: 'radio',
      icon: 'fa-list-ul',
      label: 'Question label_1',
      formulaValue: '',
      formulaKey: '',
      formulaValueArray: [],
      name: 'Q_1',
      values: [
        {
          label: 'Option 1',
          value: '1',
          optionSize: 4,
        },
        {
          label: 'Option 2',
          value: '2',
          optionSize: 4,
        }
      ]
    },
    {
      type: 'paragraph',
      icon: 'fa-paragraph',
      label: 'Summary text',
      formulaValue: '',
      formulaKey: '',
      placeholder: 'Type your formula to display here only',
      formulaValueArray: [],
      formulaSelectedTextForSqrt: '',
      hiddenFormulaText: '',
      isFormulaSqrt: false,
      name: 'Summary_1',
      isFormulaValid: false
    }
  ];

  value: Value = {
    label: '',
    value: '',
    ansId: 0,
    optionSize: 4
  };

  modelFields: Array <Field> = [];
  model: any = {
    name: 'App name...',
    description: 'App Description...',
    theme: {
      bgColor: 'ffffff',
      textColor: '555555',
      bannerImage: ''
    },
    attributes: this.modelFields
  };

  scoreTemplateSaveObj = {
    score_template_id: 0,
    service_type_id: 0,
    speciality_id: 0,
    template_name: '',
    question_list: [
      {
        question_id: 0,
        question_name: '',
        question_row_size: 0,
        option_type: '',
        formula_value: '',
        formula_key: '',
        answer_option_list: [
          {
            answer_id: 0,
            option_label: '',
            option_row_size: 0,
            options_value: 0
          }
        ]
      }
    ],
    summary_options: [
      {
        summary_id: 0,
        summary_value: 0,
        summary_operator: '',
        summary_text: '',
        summary_min_value: 0,
        summary_max_value: 0,
      }
    ],
  };

  errorObj: any = {};
  editScoreTemplateId: number;
  questionNameList = [];
  operatorList = ['+', '-', '*', '/', '(  )', '√', 'x²'];
  separators = ['\\\+', '-', '\\\(', '\\\)', '\\*', '/', '√', 'x²'];
  formulaError: boolean;

  currentSelectedOperator = '';

  prevArray = [];
  currentArrray = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationModalService: NgbModal,
    private mappingService: MappingService,
    private scoreTemplateService: ScoreTemplateService,
    private commonService: CommonService,
  ) {
   }

  ngOnInit() {
    this.loadForm = true;
    this.serviceType$ = this.mappingService.getServiceTypeList().pipe(map(res => {
      this.serviceList = res;
      return res;
    }));
    const specialityParams = {
      search_string: '',
      page_number: 1,
      limit: 100
    };
    this.speciality$ = this.mappingService.getSpecialityList(specialityParams).pipe(map(res => {
      this.specialityList = res;
      return res;
    }));

    this.editScoreTemplateId = this.route.snapshot.params.id ? +this.route.snapshot.params.id : null;
    if (this.editScoreTemplateId) {
      this.getScoreTemplateDetails().subscribe(res => {
      });
    } else {
      // this.scoreTemplateDataSelected.summaryData.push(_.cloneDeep(this.scoreTemplateSummaryObj));
      this.scoreTemplateDataSelected.selectedServiceType = 1;
    }
    this.commonService.routeChanged(this.route);
  }
  getScoreTemplateDetails(): Observable<any> {
    return this.scoreTemplateService.getScoreTemplateById(this.editScoreTemplateId).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        this.updateData(res.data);
      }
      return res;
    }));
  }
  updateData(data) {
    this.scoreTemplateDataSelected.scoreTemplateId = data.score_template_id;
    this.scoreTemplateDataSelected.selectedServiceType = data.service_type_id;
    this.scoreTemplateDataSelected.selectedSpeciality = data.speciality_id;
    this.scoreTemplateDataSelected.templateName = data.template_name;
    _.map(data.question_list, (o) => {
      const tempQuestion = {} as Field;
      tempQuestion.label = o.question_name;
      tempQuestion.type = o.option_type;
      tempQuestion.id = o.question_id;
      tempQuestion.name = o.formula_key; // o.option_type + '_' + o.question_id;
      tempQuestion.formulaValue = o.formula_value ? o.formula_value : '';
      tempQuestion.isFormulaSqrt = false;
      // tempQuestion.formulaValueArray = [];
      // if (tempQuestion.formulaValue) {
      //   tempQuestion.formulaValueArray =  JSON.parse(o.formula_key);
      // }
      tempQuestion.formulaKey = o.formula_key ? o.formula_key : o.formula_key;
      tempQuestion.formulaSelectedTextForSqrt = o.formula_key;
      // const questionsInFormula = o.formula_value.split(new RegExp(this.separators.join('|'), 'g'));
      tempQuestion.values = [];
      _.map(o.answer_option_list, (ans) => {
        const tempQuesAns = {} as Value;
        tempQuesAns.ansId = ans.answer_id;
        tempQuesAns.label = ans.option_label;
        tempQuesAns.value = ans.options_value;
        tempQuesAns.optionSize = ans.option_row_size;
        tempQuestion.values.push(tempQuesAns);
      });
      if (o.option_type !== 'paragraph') {
        this.questionNameList.push({ label: o.question_name, name: o.formula_key });
      }
      this.model.attributes.push(tempQuestion);
    });

  }
  selectValueConfirm(typ: string) {
    if (typ === 'Ok') {
    } else {
      this.router.navigate(['emr/scoreTemplate/list']);
    }
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  onDragStart(event: DragEvent) {
    console.log('drag started', JSON.stringify(event, null, 2));
  }

  onDragEnd(event: DragEvent) {
    console.log('drag ended', JSON.stringify(event, null, 2));
  }

  onDragCanceled(event: DragEvent) {
    console.log('drag cancelled', JSON.stringify(event, null, 2));
  }

  onDragged( item: any, list: any[], effect: DropEffect ) {
    if (effect === 'move') {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }

  onDragover(event: DragEvent) {
    console.log('dragover', JSON.stringify(event, null, 2));
  }

  onDrop(event: DndDropEvent, list?: any[], isCopy?: boolean) {
    if (event.data && list.length <= 0 && event.data.type === 'paragraph' ) {
      const msgData = {msg: 'More than one question should be added for score summary!', class: 'danger'};
      this.notifyAlertMessage(msgData);
      return;
    }
    if (isCopy) {
      const tempCopyQuestion = {
        type: event.data ? event.data.type : event.type,
        label: event.data ? 'Question' : 'Summary text',
        formulaValue: '',
        formulaKey: '',
        formulaValueArray: [],
        name: '',
        values: event.data ? [
          {
            label: 'Option 1',
            value: '1'
          },
          {
            label: 'Option 2',
            value: '2'
          }
        ] : []
      };
      event.data = _.clone(tempCopyQuestion);
      this.addAndCopyQuestion(event, list, isCopy);
    } else if (list && (event.dropEffect === 'copy' || event.dropEffect === 'move')) {
      this.addAndCopyQuestion(event, list, false);
    }
  }

  addAndCopyQuestion(event, list, isCopy) {
    // event.data.label = this.changeQuestionName(event.data, list);
    let num = 0;
    if (event.dropEffect === 'copy' || isCopy) {
      let isNameExist: any;
      do {
        isNameExist = list.find(s => s.label === event.data.label);
        if (isNameExist) {
          if (event.data.label.includes('_')) {
            num = +(event.data.label.split('_')[1]);
          }
          if (event.data.type !== 'paragraph') {
            event.data.label = 'Question label_' + (num + 1);
          } else {
            event.data.label = 'Summary text_' + (num + 1);
            event.data.placeholder = 'Type your formula to display here only';
          }
        }
      } while (isNameExist);

      // event.data.name = event.data.type + '-' + new Date().getTime();
      let numForName = 0;
      let isKeyNameExist: any;
      do {
        isKeyNameExist = list.find(s => s.name === event.data.name);
        if (isKeyNameExist) {
          if (event.data.name.includes('_')) {
            numForName = +(event.data.name.split('_')[1]);
          }
          if (event.data.type !== 'paragraph') {
            event.data.name = 'Q_' + (numForName + 1);
          } else {
            event.data.name = 'Summary_' + (numForName + 1);
          }
        }
      } while (isKeyNameExist);



      event.data.formulaKey =  event.data.name;
      event.data.formulaValue = '';
    }

    let index = event.index;
    if (typeof index === 'undefined') {
      index = list.length;
    }
    list.splice(index, 0, event.data);
    if (event.data.type !== 'paragraph') {
      this.questionNameList.push({ label: event.data.label, name: event.data.name });
    }
  }

  addValue(values) {
    values.push(this.value);
    this.value = { label: '', value: '', ansId: 0, optionSize: 1 };
  }

  removeField(i) {
    if (this.isQuestionUsedInFormula(i)) {
      const msgData = {msg: 'Question is used in summary formula!', class: 'danger'};
      this.notifyAlertMessage(msgData);
    } else {
      this.loadConfirmationPopup(i, 'delete');
    }

  }

  onBlurQuestion(item, list: any) {
    if (list.length && item.label) {
      const nameFind = this.questionNameList.find(o => o.name === item.name);
      if (nameFind) {
        _.map(list, (o) => {
          if (o.type === 'paragraph') {
            const formulaQIndex = o.formulaValueArray.findIndex(q => q === nameFind.label);
            if (formulaQIndex !== -1) {
              o.formulaValueArray.splice(formulaQIndex, 1, item.label);
              o.formulaValue = o.formulaValueArray.join('');
            }
          }
        });
        this.questionNameList.find(o => o.name === item.name).label = item.label;
      }
      const listFind = list.filter(o => o.label === item.label);
      if (listFind.length > 1) {
        const msgData = {msg: 'Question name should not be same!', class: 'danger'};
        this.notifyAlertMessage(msgData);
        item.label = this.changeQuestionName(item, list);
      }
    } else if (item.label === '') {
      const msgData = {msg: 'Question name should not be empty!', class: 'danger'};
      this.notifyAlertMessage(msgData);
      // item.label = this.changeQuestionName(item, list);
    }
  }

  onBlurOptions(item, optionList: any, isFor: string, isNew: boolean) {
    if (isNew) {
      if (isFor === 'label' && optionList.length) {
        const filterOptions = optionList.filter(o => o.label === item.label);
        if (filterOptions.length) {
          const msgData = {msg: 'Option should not be same!', class: 'danger'};
          this.notifyAlertMessage(msgData);
        }
      } else if (isFor === 'value' && optionList.length) {
        const filterOptions = optionList.filter(o => o.value === item.value);
        if (filterOptions.length) {
          const msgData = {msg: 'Option value should not be same!', class: 'danger'};
          this.notifyAlertMessage(msgData);
        }
      }
    } else {
      if (isFor === 'label' && optionList.length) {
        const filterOptions = optionList.filter(o => o.label === item.label);
        if (filterOptions.length > 1) {
          const msgData = {msg: 'Option should not be same!', class: 'danger'};
          this.notifyAlertMessage(msgData);
        }
      } else if (isFor === 'value' && optionList.length) {
        const filterOptions = optionList.filter(o => o.value === item.value);
        if (filterOptions.length > 1) {
          const msgData = {msg: 'Option value should not be same!', class: 'danger'};
          this.notifyAlertMessage(msgData);
        }
      }
    }

  }

  changeQuestionName(item, list) {
    let questionName = '';
    let num = 0;
    if (item.label.includes('_')) {
      num = +(item.label.split('_')[1]);
    }
    questionName = 'Q_' + (num + 1);
    return questionName;
  }

  onSubmit() {
    let valid = true;
    const validationArray = JSON.parse(JSON.stringify(this.model.attributes));
    validationArray.reverse().forEach(field => {
      console.log(field.label + '=>' + field.required + '=>' + field.value);
      if (field.required && !field.value && field.type !== 'checkbox') {
        const msgData = {msg: 'Please enter ' + field.label, class: 'danger'};
        this.notifyAlertMessage(msgData);
        valid = false;
        return false;
      }
      if (field.required && field.regex) {
        const regex = new RegExp(field.regex);
        if (regex.test(field.value) === false) {
          const msgData = {msg: field.errorText, class: 'danger'};
          this.notifyAlertMessage(msgData);
          valid = false;
          return false;
        }
      }
    });
    if (!valid) {
      return false;
    }
    console.log('Save', this.model);
    const input = new FormData;
    input.append('formId', this.model._id);
    input.append('attributes', JSON.stringify(this.model.attributes));
  }

  loadConfirmationPopup(index, action) {
    const modalTitleobj = 'Confirmation Required';
    const modalBodyobj = (action === 'delete') ? 'Are you sure you want to delete this control?' :
      'All existing controls will be overwritten. Are you sure you want to continue?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        if (action === 'delete') {
          const questionData = this.model.attributes[index];
          const nameFindIndex = this.questionNameList.findIndex(o => o.name === questionData.name);
          if (nameFindIndex !== -1) {
            this.questionNameList.splice(nameFindIndex, 1);
          }
          this.model.attributes.splice(index, 1);

        } else {
          // this.getSetOrderSetDetails(orderSetItem, action);
        }
      }
      if (result === 'cancel click') {
        return;
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  saveScoreTemplate() {
    let tempObj: any = {};
    if (this.scoreTemplateDataSelected.scoreTemplateId === 0) {
      tempObj = _.clone({ ...this.scoreTemplateSaveObj });
    }
    if (this.checkSaveObjectValid()) {
      tempObj.score_template_id = this.scoreTemplateDataSelected.scoreTemplateId;
      tempObj.template_name = this.scoreTemplateDataSelected.templateName;

      tempObj.service_type_id = this.scoreTemplateDataSelected.selectedServiceType;
      tempObj.speciality_id = this.scoreTemplateDataSelected.selectedSpeciality ? this.scoreTemplateDataSelected.selectedSpeciality : 0;

      const questionList = [];
      _.map(this.modelFields, (o) => {
        const tempQuestionList = {
          question_id: o.id ? o.id : 0,
          question_name: '',
          question_row_size: 0,
          option_type: '',
          formula_value: '',
          formula_key: '',
          answer_option_list: [
            {
              answer_id: 0,
              option_label: '',
              option_row_size: 0,
              options_value: 0
            }
          ]
        };
        // _.map(tempObj.question_list, (obj) => {

        tempQuestionList.option_type = o.type;
        tempQuestionList.question_name = o.label;
        tempQuestionList.formula_key = o.name;
        if (o.type === 'paragraph' && o.formulaSelectedTextForSqrt) {
          tempQuestionList.formula_value = o.formulaValue; //= o.formulaValueArray.join('');
          tempQuestionList.formula_key =  o.formulaSelectedTextForSqrt; // JSON.stringify(o.formulaValueArray);
        }

        tempQuestionList.answer_option_list = [];
        _.map(o.values, (ansVal) => {
          const answerOptionObj = {
            answer_id: ansVal.ansId ? ansVal.ansId : 0,
            option_label: ansVal.label,
            option_row_size: ansVal.optionSize,
            options_value: ansVal.value
          };
          tempQuestionList.answer_option_list.push(answerOptionObj);
        });
        // });
        questionList.push(tempQuestionList);
      });
      tempObj.question_list = questionList;
      this.scoreTemplateService.addScoreTemplate(tempObj).subscribe((res: any) => {
        if (res.status_message === 'Success') {
          const alertMsg = {
            msg: 'Data saved successfully.',
            class: 'success',
          };
          this.notifyAlertMessage(alertMsg);
          this.router.navigate(['emr/scoreTemplate/list']);
        } else {
          const alertMsg = {
            msg: res.message,
            class: 'danger',
          };
          this.notifyAlertMessage(alertMsg);
        }
      });
    }
    // else {
    //   this.scoreTemplateDataSelected.templateName === '' ?
    // }

  }

  cancelScoreTemplate() {
    this.router.navigate(['emr/scoreTemplate/list']);
  }

  checkSaveObjectValid() {
    let returnVal = true;
    this.errorObj.templateName = '';
    this.errorObj.serviceType = '';
    if (!this.scoreTemplateDataSelected.selectedServiceType) {
      this.errorObj.serviceType = 'Please select service type.';
      returnVal = false;
    } else if (!this.scoreTemplateDataSelected.templateName) {
      this.errorObj.templateName = 'Please enter template name.';
      returnVal = false;
    } else if (!this.modelFields.length) {
      const msgData = { msg: 'Please add atleast one question.', class: 'danger' };
      this.notifyAlertMessage(msgData);
      returnVal = false;
    } else if (this.modelFields.length) {
      this.modelFields.forEach(o => {
        if (o.type === 'radio' && !o.label) {
          o.toggle = true;
          const msgData = { msg: 'Please enter question text..', class: 'danger' };
          this.notifyAlertMessage(msgData);
          returnVal = false;
          return false;
        } else if (o.type === 'paragraph' && !o.formulaValue) {
          o.toggle = true;
          const msgData = { msg: 'Please enter formula for summary text.', class: 'danger' };
          this.notifyAlertMessage(msgData);
          returnVal = false;
          return false;
        } else if (o.type === 'paragraph' && o.formulaValue && o.formulaSelectedTextForSqrt) {
          try {
            eval(o.formulaSelectedTextForSqrt.split('Q_').join(''));
          } catch (e) {
            if (e instanceof SyntaxError) {
              const msgData = { msg: 'Invalid formula!.', class: 'danger' };
              this.notifyAlertMessage(msgData);
              o.toggle = true;
              returnVal = false;
              return false;
            }
          }
        } else if (o.type === 'radio') {
          const answerDataIsValid = o.values && o.values.length > 0 && _.find(o.values, function(x) { return x.label && x.value; });
          if (!answerDataIsValid) {
            o.toggle = true;
            const msgData = { msg: 'Please enter answer text & value..', class: 'danger' };
            this.notifyAlertMessage(msgData);
            returnVal = false;
            return false;
          }
        }
      });
    }
    return returnVal;
  }

  addDataToFormula(item, selectedValue, type) {
    // const formulaTagArray = [];

    if (type === 'operator') {
      this.currentSelectedOperator = selectedValue;
      if (selectedValue === 'x²') {
        item.isFormulaSqrt = true;
        // item.formulaValueArray.selectedValue = '²';
        selectedValue = '';
      } else if (selectedValue === '√') {
        item.isFormulaSqrt = true;
        selectedValue = '';
      } else if (selectedValue === '(  )') {
        item.isFormulaSqrt = true;
        selectedValue = '';
      }
      // item.formulaValueArray.push(selectedValue);
      if (item.formulaValue) {
        item.formulaValue += selectedValue;
      } else {
        item.formulaValue = selectedValue;
      }
    } else {
      // item.formulaValueArray.push(selectedValue.label);
      if (item.formulaValue) {
        item.formulaValue += selectedValue.name;
        selectedValue = selectedValue.name;
      } else {
        item.formulaValue = selectedValue.name;
        selectedValue = selectedValue.name;
      }
    }
    if (item.formulaSelectedTextForSqrt && (item.formulaSelectedTextForSqrt.includes('Math.sqrt') || item.formulaSelectedTextForSqrt.includes('Math.pow'))) {
      item.formulaSelectedTextForSqrt = item.formulaSelectedTextForSqrt += (selectedValue ? selectedValue : selectedValue.name ? selectedValue.name : '');
    } else {
      item.formulaSelectedTextForSqrt = _.clone(item.formulaValue);
    }
    this.checkFormulaIsValid(item);
  }

  addingTag(tag, item) {
    item.formulaValue = item.formulaValueArray.join('');
  }

  removeTag(tag, item) {
    item.formulaValue = item.formulaValueArray.join('');
  }

  addSqrtInFormula(event, item){

    const sPos = event.selectionStart;
    const ePos = event.selectionEnd;
    if (sPos === ePos) {
      return;
    }
    const textData = item.formulaSelectedTextForSqrt;
    let mathSquareStart = '';
    let mathSquareEnd = '';
    if (this.currentSelectedOperator === 'x²') {
      mathSquareStart = 'Math.pow(';
      mathSquareEnd = ',2)';

    } else if (this.currentSelectedOperator === '√') {
      mathSquareStart = 'Math.sqrt(';
      mathSquareEnd = ')';

    } else if (this.currentSelectedOperator === '(  )') {
      mathSquareStart = '(';
      mathSquareEnd = ')';
    }
    // const sOutput = [textData.slice(0, sPos), mathSquareStart, textData.slice(sPos,ePos)].join('') + mathSquareEnd;
    const sOutput = [textData.slice(0, sPos), mathSquareStart, textData.slice(sPos, ePos), mathSquareEnd].join('') + textData.slice(ePos);
    const tempOutput = [textData.slice(0, sPos), mathSquareStart, textData.slice(sPos, ePos), mathSquareEnd].join('') + textData.slice(ePos);

    item.formulaSelectedTextForSqrt = item.hiddenFormulaText = sOutput;
    this.changeFormula(item);
    item.isFormulaSqrt = false;
  }

  changeFormula(item) {
    const textData = item.formulaSelectedTextForSqrt;
    item.formulaValue =  textData.replace(new RegExp('Math.sqrt', 'g'), '√');
    item.formulaValue = item.formulaValue.replace(new RegExp('Math.pow', 'g'), '');
    item.formulaValue = item.formulaValue.replace(new RegExp(',2\\\)', 'g'), ')²');
  }

  isQuestionUsedInFormula(index) {
    const questionData = this.model.attributes[index];
    let isQuestionUsed = false;
    // console.log(this.separators.join('|'));
    _.map(this.model.attributes, (o) => {
      if (o.formulaValue) {
        const questionsInFormula = o.formulaValue.split(new RegExp(this.separators.join('|'), 'g'));
        console.log(questionsInFormula);
        const qFindIndex = questionsInFormula.findIndex(q => q === questionData.label);
        if (qFindIndex !== -1) {
          isQuestionUsed = true;
          return;
        }
      }
    });
    return isQuestionUsed;
  }

  showCalculatedFormulaValue(item, selectedValue) {
    item.answerSelected = selectedValue;
    const summaryFilter = this.model.attributes.filter(sf => sf.type === 'paragraph');
    const questionFilter = this.model.attributes.filter(qf => qf.type === 'radio');

    _.map(summaryFilter, (sf) => {
      sf.formulaKeyValue = _.clone(sf.formulaSelectedTextForSqrt);
      _.map(questionFilter, (qf) => {
        if (qf.answerSelected) {
          sf.formulaKeyValue = sf.formulaKeyValue.split(qf.name).join(qf.answerSelected);
        }
      });
      try {
        sf.answerSelected = eval(sf.formulaKeyValue);
      } catch (e) {

      }
    });
  }

  checkFormulaIsValid(item) {
    try {
      eval(item.formulaSelectedTextForSqrt.split('Q_').join(''));
      item.isFormulaValid = true;
    } catch (e) {
      if (e instanceof SyntaxError) {
        item.isFormulaValid = false;
      }
    }
  }
}

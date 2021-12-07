import { IAnsOption, IControl } from './../../faqmodel';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DndDropEvent, DropEffect } from 'ngx-drag-drop';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControlSettingComponent } from '../form-control-setting/form-control-setting.component';
import { FaqService } from '../../faq.service';
import { Constants } from 'src/app/config/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { FaqSectionsService } from 'src/app/public/services/faq-sections.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  success = false;
  isFormSubmitted = false;
  alertMsg: IAlert;
  templateData: any;
  formControlsModel: Array<IControl> = [
    {
      type: 'quePanel',
      icon: 'fa fa-list-alt',
      className: 'form-control',
      controlName: 'Qustion',
    },
    {
      type: 'text',
      icon: 'fa-font',
      className: 'form-control',
      controlName: 'Textbox',
      ansGroupKey: '',
      controlKey: 'input_box',
      parentAnsGroupKey: '',
      parentAnsGroupOption: '',
      groupPlaceHolder: 'Enter text',
      groupLabel: '',
      colWidth: 12
    },
    {
      type: 'date',
      icon: 'fa-calendar',
      className: 'form-control',
      controlName: 'Date',
      controlKey: 'datepicker',
      ansGroupKey: '',
      parentAnsGroupKey: '',
      parentAnsGroupOption: '',
      groupPlaceHolder: 'Date',
      groupLabel: '',
      colWidth: 12
    },
    {
      type: 'textarea',
      icon: 'fa-text-width',
      controlName: 'Textarea',
      controlKey: 'text_area',
      ansGroupKey: '',
      parentAnsGroupKey: '',
      parentAnsGroupOption: '',
      groupPlaceHolder: 'Textarea',
      groupLabel: '',
      colWidth: 12
    },
    {
      type: 'checkbox',
      icon: 'fa-list',
      controlName: 'Checkbox',
      controlKey: 'check_box',
      ansGroupKey: '',
      parentAnsGroupKey: '',
      parentAnsGroupOption: '',
      groupPlaceHolder: '',
      groupLabel: '',
      colWidth: 12,
      optionList: [
        {
          answerText: 'Option 1',
          answerKey: this.faqService.getRandomNumber(),
          colWidth: 3
        },
        {
          answerText: 'Option 2',
          answerKey: this.faqService.getRandomNumber(),
          colWidth: 3
        }
      ]
    },
    {
      type: 'radio',
      icon: 'fa-list-ul',
      controlName: 'Radio',
      controlKey: 'radio',
      ansGroupKey: '',
      parentAnsGroupKey: '',
      parentAnsGroupOption: '',
      groupPlaceHolder: '',
      groupLabel: 'Label',
      colWidth: 12,
      optionList: [
        {
          answerText: 'Option 1',
          answerKey: this.faqService.getRandomNumber(),
          colWidth: 3
        },
        {
          answerText: 'Option 2',
          answerKey: this.faqService.getRandomNumber(),
          colWidth: 3
        }
      ]
    },
    {
      type: 'select',
      icon: 'fa-bars',
      controlName: 'Select',
      className: 'form-control',
      controlKey: 'dropdown_list',
      ansGroupKey: '',
      parentAnsGroupKey: '',
      parentAnsGroupOption: '',
      groupPlaceHolder: 'Select',
      groupLabel: 'Label',
      colWidth: 12,
      isDynamicOptions: 'false',
      isSearchByKeyword: 'false',
      selectDynamicTypeHeadList: [],
      dbQuery: '',
      optionList: [
        {
          answerText: 'Option 1',
          answerKey: this.faqService.getRandomNumber(),
          colWidth: 12
        },
        {
          answerText: 'Option 2',
          answerKey: this.faqService.getRandomNumber(),
          colWidth: 12
        },
        {
          answerText: 'Option 3',
          answerKey: this.faqService.getRandomNumber(),
          colWidth: 12
        }
      ]
    },
  ];

  formModel: any = {
    formId: '0',
    formName: '',
    formDescription: '',
    formSummary: '',
    isActive: true,
    queGroupData: []
  };

  constructor(
    private faqSectionService: FaqSectionsService,
    private modalService: NgbModal,
    private faqService: FaqService,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.formModel.formId = +this.route.snapshot.params.id;
    this.formModel.formId = this.formModel.formId < 0 ? 0 : this.formModel.formId;
    this.formModel.queGroupData.push(this.faqService.defaultQueGroupObj());
    if (!_.isUndefined(this.route.snapshot.queryParams.data)) {
      this.templateData = JSON.parse(this.route.snapshot.queryParams.data);
      // console.log('this.templateData', this.templateData);
      this.formModel.templateId = this.templateData.template_id;
    }
    if (this.formModel.formId > 0) {
      this.getTemplateFormById(this.formModel.formId);
    }
  }

  showFaqTemplateList() {
    this.router.navigate([`emr/faqTemplates/list`]);
  }
  getTemplateFormById(formId: number) {
    this.faqService.getTemplateFormById(formId).subscribe(res => {
      if (res.status_code === 200 && res.data) {
        _.map(res.data.queGroupData, qg => {
          _.map(qg.questionPanel, qp => {
            _.map(qp.answerData, ad => {
              if (ad.type === 'select') {
                ad.isSearchByKeyword = ad.isSearchByKeyword.toString();
                ad.isDynamicOptions = ad.isDynamicOptions.toString();
                if (ad.isDynamicOptions == 'true') {
                  this.getAnswerOptionDataBySearchKey(ad, '');
                }
              }
            });
          });
        });
        this.formModel = res.data;
      }
    });
  }
  saveTemplateForm() {
    // console.log(this.formModel);
    this.isFormSubmitted = true;
    if (!this.formModel.formName
      || !this.formModel.formDescription
      || !this.formModel.formSummary
      || !this.formModel.queGroupData
      || this.formModel.queGroupData.length === 0) {
      this.alertMsg = {
        message: 'Please add valid form data!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return false;
    }

    // save form data
    const questionList = _.flatten(_.map(this.formModel.queGroupData, (o) => o.questionPanel));
    if (questionList.length === 0) {
      this.alertMsg = {
        message: 'Please add valid question data!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return false;
    }
    this.formModel.templateId = this.templateData.template_id;
    this.faqService.saveTemplateForm(this.formModel).subscribe(res => {
      if (res.status_code === 200 && res.data > 0) {
        this.alertMsg = {
          message: 'Template Form Saved Successfully!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.showFaqTemplateList();
      } else {
        this.alertMsg = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }
  getAnswerOptionDataBySearchKey(ansObj, searchKeyword = '') {
    this.faqSectionService.getAnswerDataBySearchKeyword(ansObj, searchKeyword).subscribe(resultList => {
      const array = [];
      _.map(resultList, dt => {
        array.push(_.cloneDeep({ answerText: dt.name, asnwerKey: dt.id }));
      });
      ansObj.dynamicList = array;
    });
  }

  onDragStart(event: DragEvent): void {
    // console.log('drag started', JSON.stringify(event, null, 2));
  }
  onDragEnd(event: DragEvent): void {
    // console.log('drag ended', JSON.stringify(event, null, 2));
  }
  onDraggableCopied(event: DragEvent): void {
    // console.log('draggable copied', JSON.stringify(event, null, 2));
  }
  onDraggableLinked(event: DragEvent): void {
    // console.log('draggable linked', JSON.stringify(event, null, 2));
  }
  onDragCanceled(event: DragEvent): void {
    // console.log('drag cancelled', JSON.stringify(event, null, 2));
  }
  onDragover(event: DragEvent): void {
    // console.log('dragover', JSON.stringify(event, null, 2));
  }

  // Drag Drop Events
  onQueGroupPanelDragged(item: any, list: any[], effect: DropEffect): void {
    if (effect === 'move') {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }
  onQueGroupPanelDrop(event: DndDropEvent, list?: any[]): void {
    // console.log('onQueGroupPanelDrop: ' + event.dropEffect);
    if (event.data.type !== 'quePanel') {
      return;
    }
    if (list && (event.dropEffect === 'copy' || event.dropEffect === 'move')) {
      const pannelObject = _.cloneDeep(this.faqService.defaultQueObj());
      if (event.dropEffect === 'copy') {
        pannelObject.pannelId = event.data.type + '-' + this.faqService.getRandomNumber();
      }
      let index = event.index;
      if (typeof index === 'undefined') {
        index = list.length;
      }
      const obj = event.dropEffect === 'move' ? event.data : pannelObject;
      list.splice(index, 0, _.cloneDeep(obj));
    }
  }
  onQuePanelDragged(item: any, list: any[], effect: DropEffect): void {
    // console.log('onQuePanelDragged: ' + effect);
    if (effect === 'move') {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }
  onQuePanelDrop(event: DndDropEvent, qusGrp, list?: any[], ansGroupIndex?) {
    // console.log('onQuePanelDrop: ' + event.dropEffect);
    if (event.data.type === 'quePanel') {
      return;
    }
    if ((typeof ansGroupIndex !== 'undefined') && list.length === qusGrp.tabularHeadingsData.length) {
      return;
    }
    if (list && (event.dropEffect === 'copy' || event.dropEffect === 'move')) {
      let cpyObj: any;
      if (event.dropEffect === 'copy') {
        cpyObj = _.cloneDeep(_.find(this.formControlsModel, (f) => f.type === event.data.type));
        cpyObj.name = cpyObj.type + '-' + this.faqService.getRandomNumber();
        if (event.data.type !== 'queGroupPanel') {
          cpyObj.ansGroupKey = 'grp-' + this.faqService.getRandomNumber();
        }
      }
      let index = qusGrp.displayFormat != 'tabular' ? event.index : list.length;
      if (typeof index === 'undefined') {
        index = list.length;
      }
      const obj = event.dropEffect === 'move' ? event.data : cpyObj;
      list.splice(index, 0, _.cloneDeep(obj));
    }
  }
  onAnsGroupDragged(item: any, list: any[], effect: DropEffect) {
    // console.log('onAnsGroupDragged: ' + effect);
    if (effect === 'move') {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
  }

  removeField(list, i, flag?, parent?) {
    list.splice(i, 1);
    if (!list.length && flag === 'queGroup') {
      list.push(this.faqService.defaultQueGroupObj());
    } else if (!list.length && flag === 'qustion' && parent && parent.displayFormat === 'tabular') {
      list.push(this.faqService.defaultQueObj());
    }
  }

  editFormControlSetting(formControl, controlType?, formControlList?) {
    const modalInstance = this.modalService.open(FormControlSettingComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'xl',
      container: '#homeComponent'
    });
    modalInstance.componentInstance.formControl = formControl;
    modalInstance.componentInstance.formControlType = controlType;
    modalInstance.componentInstance.formControlList = formControlList;
    modalInstance.result.then((result) => {
      if (result) {
        formControl = result;
      }
    }, () => {

    });
  }

  addQusGroup(list, index) {
    list.splice(index + 1, 0, this.faqService.defaultQueGroupObj());
  }
  copyQusGroup(list, item, index) {
    let cloneObj = _.cloneDeep(item);
    cloneObj.queGroupId = 0;
    cloneObj.queGroupTempId = this.faqService.getRandomNumber();
    list.splice(index + 1, 0, cloneObj);
  }
  addQustion(list, item, index) {
    list.questionPanel.splice(index + 1, 0, this.faqService.defaultQueObj());
  }
  copyQustion(list, item, index) {
    let cloneObj = _.cloneDeep(item);
    cloneObj.questionId = 0;
    cloneObj.questionTempId = this.faqService.getRandomNumber();
    list.questionPanel.splice(index + 1, 0, cloneObj);
  }
  copyAnswerGroup(list, item, index) {
    let cloneObj = _.cloneDeep(item);
    cloneObj.ansGroupKey = 'grp-' + this.faqService.getRandomNumber();
    if (cloneObj.optionList) {
      _.map(cloneObj.optionList, (o) => { o.answerKey = this.faqService.getRandomNumber(); });
    }
    list.answerData.splice(index + 1, 0, cloneObj);
  }

  toggleValue(item) {
    item.selected = !item.selected;
  }

  updateIndexOfPanel(indx, mvTyp) {
    if (mvTyp === 'up' && indx > 0) {
      const tmp = this.formModel.queGroupData[indx - 1];
      this.formModel.queGroupData[indx - 1] = this.formModel.queGroupData[indx];
      this.formModel.queGroupData[indx] = tmp;
    } else if (indx < this.formModel.queGroupData.length - 1) {
      const tmp = this.formModel.queGroupData[indx + 1];
      this.formModel.queGroupData[indx + 1] = this.formModel.queGroupData[indx];
      this.formModel.queGroupData[indx] = tmp;
    }
  }

  updateIndexForQus(grpIndx, indx, mvTyp) {
    if (mvTyp === 'up' && indx > 0) {
      const tmp = this.formModel.queGroupData[grpIndx].questionPanel[indx - 1];
      this.formModel.queGroupData[grpIndx].questionPanel[indx - 1] = this.formModel.queGroupData[grpIndx].questionPanel[indx];
      this.formModel.queGroupData[grpIndx].questionPanel[indx] = tmp;
    } else if (indx < this.formModel.queGroupData[grpIndx].questionPanel.length - 1) {
      const tmp = this.formModel.queGroupData[grpIndx].questionPanel[indx + 1];
      this.formModel.queGroupData[grpIndx].questionPanel[indx + 1] = this.formModel.queGroupData[grpIndx].questionPanel[indx];
      this.formModel.queGroupData[grpIndx].questionPanel[indx] = tmp;
    }
  }

  updateIndexForAns(grpIndx, qusIndx, indx, mvTyp) {
    if (mvTyp === 'up' && indx > 0) {
      const tmp = this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData[indx - 1];
      this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData[indx - 1] = this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData[indx];
      this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData[indx] = tmp;
    } else if (indx < this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData.length - 1) {
      const tmp = this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData[indx + 1];
      this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData[indx + 1] = this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData[indx];
      this.formModel.queGroupData[grpIndx].questionPanel[qusIndx].answerData[indx] = tmp;
    }
  }

}

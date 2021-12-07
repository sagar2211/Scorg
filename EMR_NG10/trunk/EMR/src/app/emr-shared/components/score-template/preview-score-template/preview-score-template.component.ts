import { filter, findIndex } from 'rxjs/operators';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';


@Component({
  selector: 'app-preview-score-template',
  templateUrl: './preview-score-template.component.html',
  styleUrls: ['./preview-score-template.component.scss']
})
export class PreviewScoreTemplateComponent implements OnInit {
  selectedTemplate: any;
  @Input() parentComponetInstance: any;
  @Input() isShowAllTemplate: boolean = false;
  @Input() selectTemplate: any;
  modal = null;

  constructor(
    //public modal: NgbActiveModal,
  ) { }

  ngOnInit() {
    if (this.isShowAllTemplate) {
      this.selectedTemplate = this.selectTemplate;
    } else {
      this.selectedTemplate = this.parentComponetInstance.selectedTemplate;
    }
  }

  changTemplateSectionFromPopup(template) {
    this.selectedTemplate = template;
  }

  clearAllAnsOptions() {
    _.map(this.selectedTemplate.question_list, (q) => {
      q.selected_optionValue = '';
    });
    this.selectedTemplate.templatecalcvalue = '';
    this.parentComponetInstance.prepareAndSaveLocalTransData();
  }

  closePopup() {
    this.parentComponetInstance.modelInstance.close();
  }

  // selectOption(question) {
  //   _.map(this.selectedTemplate.question_list, (q) => {
  //     if (q.option_type === 'paragraph') {
  //       const formulaArray = JSON.parse(q.formula_key);
  //       if (formulaArray.length) {
  //         const qfilterData = formulaArray.filter(fq => fq === question.question_name);
  //         qfilterData.forEach(element => {
  //           const qIndex = formulaArray.findIndex(fq => fq === question.question_name);
  //           if (qIndex !== -1) {
  //             formulaArray.splice(qIndex, 1, question.selected_optionValue);
  //           }
  //         });
  //         const formulaString = formulaArray.join('');
  //         q.selected_optionValue = eval(formulaString);
  //       }
  //     }
  //   });
  // }

  convertToInt(value) {
    return value.selected_optionValue1 = _.clone(value.selected_optionValue).toString();
  }

  selectOption(question) {
    const summaryFilter = this.selectedTemplate.question_list.filter(sf => sf.option_type === 'paragraph');
    const questionFilter = this.selectedTemplate.question_list.filter(qf => qf.option_type === 'radio');

    _.map(summaryFilter, (sf) => {
      sf.formulaKeyValue = _.clone(sf.formula_key);
      _.map(questionFilter, (qf) => {
        if (qf.selected_optionValue) {
          sf.formulaKeyValue = sf.formulaKeyValue.split(qf.formula_key).join(qf.selected_optionValue);
        }
      });
      try {
        sf.selected_optionValue = eval(sf.formulaKeyValue);
      } catch (e) {

      }
    });
  }
}

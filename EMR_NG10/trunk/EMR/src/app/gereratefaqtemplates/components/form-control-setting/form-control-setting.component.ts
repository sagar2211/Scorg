import { Component, OnInit, Input } from '@angular/core';
import { IAnsOption } from '../../faqmodel';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { FaqService } from '../../faq.service';
import { Observable, Subject, of, concat } from 'rxjs';
import { distinctUntilChanged, tap, switchMap, catchError, map } from 'rxjs/operators';
import { FaqSectionsService } from 'src/app/public/services/faq-sections.service';

@Component({
  selector: 'app-form-control-setting',
  templateUrl: './form-control-setting.component.html',
  styleUrls: ['./form-control-setting.component.scss']
})
export class FormControlSettingComponent implements OnInit {
  value: IAnsOption = {
    answerText: '',
    answerKey: this.faqService.getRandomNumber(),
    colWidth: 12
  };
  ansGroupColumnHeading = '';
  columnwidthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  // tabularAnswerGroupCountList = [1, 2, 3, 4, 5];

  @Input() formControl: any;
  @Input() formControlType: any;
  @Input() formControlList: any;
  frmControlName: any;
  cloneFormControl: any;

  parentQueList = [];
  parentQueAnsGroupList = [];
  parentQueAnsGroupOptionList = [];

  parentAnsGroupList = [];
  parentAnsOptionList = [];

  selectDynamicTypeHeadList = new Observable<any>();
  selectDynamicListInput$ = new Subject<string>();
  loadingData = false;

  constructor(
    public modal: NgbActiveModal,
    private faqService: FaqService,
    private faqSectionService: FaqSectionsService
  ) { }

  ngOnInit() {
    //this.selectDynamicTypeHeadList = new Observable<any>();

    this.cloneFormControl = _.cloneDeep(this.formControl);
    this.frmControlName = this.formControlType === 'queGroup' ? 'Question Group' :
      this.formControlType === 'qustion' ? 'Question' :
        this.formControlType === 'ansGroup' ? 'Answer Group' : 'Component';

        if (this.formControlType === 'qustion') {
          this.formControl.parentQueTempId = this.formControl.parentQueTempId ? this.formControl.parentQueTempId : '';
          this.formControl.parentAnsGroupKey = this.formControl.parentAnsGroupKey ? this.formControl.parentAnsGroupKey : '';
          this.formControl.parentAnsGroupOption = this.formControl.parentAnsGroupOption ? this.formControl.parentAnsGroupOption : '';
          this.makeParentQusGroupList();
        }
        if (this.formControlType === 'ansGroup') {
          this.formControl.parentGroupKey = this.formControl.parentGroupKey ? this.formControl.parentGroupKey : '';
          this.formControl.parentGroupOption = this.formControl.parentGroupOption ? this.formControl.parentGroupOption : '';
          this.makeparentAnsGroupList();
          this.makeParentAnsOptionList(this.formControl.parentAnsGroupKey);
        }

        if (this.formControl.type === 'select') {
          this.loadSelectDynamiclist();
        }
  }

  makeParentQusGroupList() {
    let parQusArray = [];
    _.map(_.cloneDeep(this.formControlList.queGroupData), (control, inx) => {
      parQusArray = parQusArray.length > 0 ? parQusArray.concat(control.questionPanel) : control.questionPanel;
    });
    const indx = _.findIndex(parQusArray, dt => {
      return +dt.questionTempId === +this.formControl.questionTempId;
    });
    if (indx !== -1) {
      parQusArray.splice(indx, 1);
    }
    this.parentQueList = _.cloneDeep(parQusArray);
    if (this.formControl.parentQueTempId) {
      this.onParentQueChange(this.formControl.parentQueTempId, true);
    }
    // console.log(parQusArray, 'parQusArray');
  }

  makeparentAnsGroupList() {
    if (this.formControlType === 'ansGroup') {
      _.map(_.cloneDeep(this.formControlList), (control, inx) => {
        if (control.ansGroupKey !== this.formControl.ansGroupKey) {
          const ansoptObj = {
            ansGroupKey: control.ansGroupKey,
            ansGroup: 'Answer Group' + (inx + 1)
          };
          this.parentAnsGroupList.push(ansoptObj);
        }
      });
    }
  }
  makeParentAnsOptionList(parentAnsGroupKey) {
    const parentAnsGroup = _.find(_.cloneDeep(this.formControlList), (o) => o.ansGroupKey !== parentAnsGroupKey);
    if (parentAnsGroup) {
      _.map(parentAnsGroup.optionList, (option, inx) => {
        const ansoptObj = {
          optionValue: option.value,
          optionLabel: option.label
        };
        this.parentAnsOptionList.push(ansoptObj);
      });
    }
  }

  addAnsGroupHeading(tabularHeadingsData) {
    const answerGroupKey = 'grp-' + this.faqService.getRandomNumber();
    if (this.ansGroupColumnHeading) {
      tabularHeadingsData.push({id: 0, answerGroupKey: answerGroupKey, answerGroupHeading: this.ansGroupColumnHeading });
      this.ansGroupColumnHeading = '';
    }
  }

  onParentQueChange(parQue, callGrp?) {
    if (!parQue) {
      return;
    }
    const indx = _.findIndex(this.parentQueList, dt => {
      return +dt.questionTempId === +parQue;
    });
    this.parentAnsGroupList = _.cloneDeep(this.parentQueList[indx].answerData);
    if (callGrp) {
      this.onParentAnsGroupChange(this.formControl.parentAnsGroupKey);
    }
  }

  onParentAnsGroupChange(parentAnsGroup) {
    if (!parentAnsGroup) {
      return;
    }
    const indx = _.findIndex(this.parentAnsGroupList, dt => {
      return dt.ansGroupKey === parentAnsGroup;
    });
    if (this.formControlType === 'qustion') {
      this.parentAnsOptionList = _.cloneDeep(this.parentAnsGroupList[indx].optionList);
    } else {
      this.parentAnsOptionList = _.cloneDeep(this.formControl.optionList ? this.formControl.optionList : []);
    }
  }

  onParentAnsGroupOptionChange(parentAnsGroupOption) {
    if (!parentAnsGroupOption) {
      return;
    }
    const indx = _.findIndex(this.parentAnsOptionList, dt => {
      return dt.answerKey === parentAnsGroupOption;
    });
    // this.formControl.parentAnsGroupOption = parentAnsGroupOption;
  }

  addAnsGroupOption(optionList) {
    optionList.push(this.value);
    this.value = { answerText: '', answerKey: this.faqService.getRandomNumber(), colWidth: 12 };
  }

  saveControlSetting(item) {
    if (this.formControlType === 'queGroup'
      && this.formControl.displayFormat === 'tabular'
      && !this.formControl.questionPanel.length) {
      this.formControl.questionPanel.push(this.faqService.defaultQueObj());
    }
    this.modal.close(item);
  }
  cancelControlSetting() {
    _.extend(this.formControl, this.cloneFormControl);
    this.modal.close(this.formControl);
  }

  toggleRepeatAns(item) {
    item.repeatAns = !item.repeatAns;
  }
  onOrderByAnsGroupChange(ansGroupKey) {
    this.formControl.orderByAnsGroupKey = ansGroupKey;
  }
  toggleOrderBy(item) {
    item.orderBy = !item.orderBy;
  }

  toggleValue(item) {
    item.selected = !item.selected;
  }

  private loadSelectDynamiclist(searchTxt?) {
    this.selectDynamicTypeHeadList = concat(
      this.getAnswerOptionDataBySearchKey(searchTxt), // default items
      this.selectDynamicListInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.loadingData = true),
        switchMap(term => this.getAnswerOptionDataBySearchKey(term).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.loadingData = false)
        ))
      )
    );
  }

  getAnswerOptionDataBySearchKey(searchKeyword="") : Observable<any> {
    return this.faqSectionService.getAnswerDataBySearchKeyword(this.formControl,searchKeyword).pipe(map(resultList => {
      const array = [];
      _.map(resultList, dt => {
        array.push(_.cloneDeep({ answerText: dt.name, asnwerKey: dt.id }));
      });
      this.formControl.dynamicList = array;
      return array;
    }));
  }

  // getAnswerOptionDataBySearchKey(searchKey?): Observable<any> {
  //   if (searchKey) {
  //     const param = {
  //       dbQuery: this.formControl.dbQuery, //"select EXAM_ID as id, EXAM_NAME as name from [dbo].[EXAMINATION_MASTER]",
  //       searchKeyword: searchKey,
  //       isSearchByKeyword: this.formControl.isSearchByKeyword
  //     };
  //     return this.faqService.getAnswerOptionList(param).pipe(map(resultList => {
  //       return resultList;
  //     }));
  //   } else {
  //     return of([]);
  //   }
  // }
}

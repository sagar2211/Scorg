import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { ExaminationLabelsService } from './../../../public/services/examination-labels.service';

@Component({
  selector: 'app-exmination-type',
  templateUrl: './exmination-type.component.html',
  styleUrls: ['./exmination-type.component.scss']
})
export class ExminationTypeComponent implements OnInit, OnChanges {
  @Output() selectedexaminationTypeValueObj = new EventEmitter<any>();
  @Input() disableExaminationType;
  @Input() setValue;
  valueList: [] = [];
  loadForm: boolean;
  isNgSelectTypeHeadDisabled: boolean;
  examinationTypeForm: FormGroup;
  compInstance = this;
  constructor(
    private fb: FormBuilder,
    private examinationLabelsService: ExaminationLabelsService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.generateDataForForm();
  }

  ngOnChanges() {
    this.generateDataForForm();
  }

  getAllExaminationTypeList(searchKey?): Observable<any> {
    if (!_.isEmpty(this.compInstance.examinationTypeForm.controls.examinationTypeVal.value
      && this.compInstance.valueList.length > 0)) {
      return of([]);
    }
    return this.compInstance.examinationLabelsService.getExaminationTypeList().pipe(map((res: any) => {
      this.valueList = [];
      if (res.length > 0) {
        this.valueList = res;
      }
      return this.valueList;
    }));
  }

  generateDataForForm() {
    if (this.disableExaminationType) {
      this.isNgSelectTypeHeadDisabled = true;
    } else {
      this.isNgSelectTypeHeadDisabled = false;
    }
    if (!this.loadForm) {
      this.createForm();
    } else {
      this.examinationTypeForm.patchValue({ examinationTypeVal: this.setValue });
    }
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const basicForm = {
      examinationTypeVal: [null, Validators.required],
    };
    this.examinationTypeForm = this.fb.group(basicForm);
    this.loadForm = true;
    if (!_.isEmpty(this.setValue)) {
      this.examinationTypeForm.patchValue({ examinationTypeVal: this.setValue });
    }
  }

  selectValue(e) {
    if (e === '') {
      return;
    }
    const isTrue = typeof e === 'object';
    if (isTrue) {
      this.examinationTypeForm.controls.examinationTypeVal.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
      this.selectedexaminationTypeValueObj.emit(e);
    } else {
      this.examinationTypeForm.controls.examinationTypeVal.patchValue(null);
      this.selectedexaminationTypeValueObj.emit(null);
    }
  }

}

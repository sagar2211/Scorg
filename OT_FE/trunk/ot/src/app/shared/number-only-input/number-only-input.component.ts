import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-number-only-input',
  templateUrl: './number-only-input.component.html',
  styleUrls: ['./number-only-input.component.scss']
})
export class NumberOnlyInputComponent implements OnInit, OnChanges {
  numberForm: FormGroup;

  @Input() inputVal: number;
  @Input() disable: boolean;
  @Input() maxLength: number;
  @Input() minVal: number;
  @Input() maxVal: number;
  @Input() placeholder: string;
  @Input() color: string;
  @Input() valueType: string;
  @Output() numberChange = new EventEmitter<any>();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.minVal = this.minVal ? this.minVal : null;
    this.maxVal = this.minVal ? this.maxVal : null;
    this.maxLength = this.maxLength ? this.maxLength : null;
    this.maxLength = this.maxLength ? this.maxLength : null;
    this.color = this.color ? this.color : null;
    this.valueType = this.valueType ? this.valueType : 'all';
    this.numberForm = this.fb.group({
      numberVal: ['']
    });
    this.disabledSelectedData();
    this.setInitialVal();
  }

  ngOnChanges() {
    if (this.numberForm) {
      this.setInitialVal();
      this.disabledSelectedData();
    }
  }

  disabledSelectedData() {
    if (this.disable) {
      this.numberForm.get('numberVal').disable();
    } else {
      this.numberForm.get('numberVal').enable();
    }
  }

  setInitialVal(): void {
    this.minVal = this.minVal ? this.minVal : null;
    this.maxVal = this.minVal ? this.maxVal : null;
    this.maxLength = this.maxLength ? this.maxLength : null;
    this.placeholder = this.placeholder ? this.placeholder : null;
    this.color = this.color ? this.color : null;
    this.valueType = this.valueType ? this.valueType : 'all';
    this.numberForm.patchValue({
      numberVal: this.inputVal ? this.inputVal : null
    });
  }

  checkValueIsValidOrNot() {
    const numValue = this.numberForm.get('numberVal');
    let updateNumber = null;
    if (_.isNumber(numValue.value)) {
      if (numValue.value <= 0) {
        updateNumber = null;
      } else {
        updateNumber = numValue.value;
      }
    } else {
      updateNumber = null;
    }
    if (this.minVal && this.minVal > updateNumber) {
      updateNumber = null;
    }
    if (this.maxVal && this.maxVal < updateNumber) {
      updateNumber = null;
    }
    if (this.maxLength && this.maxLength < _.toString(updateNumber).length) {
      const stringArray = Array.from(_.toString(updateNumber));
      stringArray.splice((stringArray.length - 1), 1);
      updateNumber = _.toNumber(stringArray.join(''));
    }
    if (this.valueType === 'decimal') {
      updateNumber = _.toString(numValue.value).replace(/[^-0-9\.]/g, '');
    }
    if (this.valueType === 'number') {
      updateNumber = _.toString(numValue.value).replace(/[^-0-9]/g, '');
    }
    this.numberForm.patchValue({
      numberVal: updateNumber
    });
    this.numberChange.emit(updateNumber);
  }

}

import { NgbDateCustomParserFormatter } from './../services/dateformat';
import { Component, OnInit, Output, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]

})
export class DatePickerComponent implements OnInit, OnChanges {
  dpFrm: FormGroup;
  minDt: { year: number, month: number, day: number };
  maxDt: { year: number, month: number, day: number };
  minDateObj = { year: 2018, month: 12, day: 2 };

  @Input() inputDate: Date;
  @Input() min: Date;
  @Input() max: Date;
  @Input() makeDisabled: boolean;
  @Input() disable: boolean;
  @Output() dateChange = new EventEmitter<any>();
  @Input() readOnly = true;
  @Output() statusCheck = new EventEmitter<any>();
  @Input() isClear = false;

  constructor(
    private fb: FormBuilder,
    ) { }

  ngOnInit() {
    if (this.min) {
      this.minDt = { year: this.min.getFullYear(), month: (this.min.getMonth()) + 1, day: this.min.getDate() };
    } else {
      this.minDt = {year: 1990, month: 1, day: 1};
    }
    if (this.max) {
      this.maxDt = { year: this.max.getFullYear(), month: (this.max.getMonth()) + 1, day: this.max.getDate() };
    }
    this.dpFrm = this.fb.group({
      selectedDate: ['']
    });
    this.disabledSelectedData();
    this.setInitialVal();
  }
  onDateInputChange() {
    const isValidDate = moment(this.dpFrm.value.selectedDate, 'DD/MM/YYYY', true).isValid();
    const time = '00:01';
    const tempDate = moment(moment(this.dpFrm.value.selectedDate, 'DD/MM/YYYY')).format('YYYY-MM-DD');
    const dateObject = new Date(tempDate + ' ' + time);
    if (!!!this.readOnly && isValidDate) {
      this.dpFrm.patchValue({
        selectedDate: dateObject
      });
      this.dateChange.emit(dateObject);
    }
    this.statusCheck.emit(this.dpFrm);
  }

  setInitialVal(): void {
    if (this.min) {
      this.minDt = { year: this.min.getFullYear(), month: (this.min.getMonth()) + 1, day: this.min.getDate() };
    } else {
      this.minDt = {year: 1900, month: 1, day: 1};
    }
    if (this.max) {
      this.maxDt = { year: this.max.getFullYear(), month: (this.max.getMonth()) + 1, day: this.max.getDate() };
    }
    this.dpFrm.patchValue({
      selectedDate: this.inputDate ? this.inputDate : null
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.dpFrm) {
      this.setInitialVal();
      this.disabledSelectedData();
    }
  }

  // -- fire the event when date select
  onDateSelect($event): void {
    // let dt = null;
    // if ($event) {
    //   dt = new Date($event.year, $event.month - 1, $event.day, new Date().getHours(), new Date().getMinutes());
    // } else {
    //   dt = $event;
    // }
    const dt = $event ? new Date($event.year, $event.month - 1, $event.day, new Date().getHours(), new Date().getMinutes()) : null;
    this.dateChange.emit(dt);
  }

  disabledSelectedData() {
    if (this.makeDisabled) {
      this.dpFrm.get('selectedDate').disable();
    } else {
      this.dpFrm.get('selectedDate').enable();
    }
  }

}

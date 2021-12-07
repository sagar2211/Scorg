import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-date-picker2',
  templateUrl: './date-picker2.component.html',
  styleUrls: ['./date-picker2.component.scss']
})
export class DatePicker2Component implements OnInit, OnChanges {
  @Input() pickerType; // inline/popup
  @Input() selectedDate; //
  @Input() customTodayClass; // string
  @Input() dateFormat; // default 'DD/MM/YYYY'
  @Input() dateMin; // format 'DD/MM/YYYY'
  @Input() dateMax; // format 'DD/MM/YYYY'
  @Input() datePickerDisable; // true/false
  @Input() daysDisabled; // [0,6] 0-sunday 6- saturday
  @Input() datesDisabled; // ['DD/MM/YYYY', 'DD/MM/YYYY']
  @Input() datesReadOnly; // true/false
  @Input() customDateClass; // { date: 'DD/MM/YYYY', classes: ['bg-warning'] }
  @Output() dateChange = new EventEmitter<any>();


  datePattern = /^(?: (?: 31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
  showPickerType: string;
  dateCustomClasses: DatepickerDateCustomClasses[];
  myForm: FormGroup;
  dateCustomConfig;
  selectedMinDate: Date;
  selectedMaxDate: Date;
  disableDatePicker: boolean;
  readOnlyDatePicker: boolean;
  loadForm: boolean;
  disableDaysArray: number[];
  disableDatesArray: Date[];  
  dateWithCustomClass = [];
  title: string;
  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.showPickerType = this.pickerType ? this.pickerType : 'popup';
    this.dateCustomConfig = {
      dateInputFormat: 'DD/MM/YYYY',
      customTodayClass: '',
      showWeekNumbers: false
    };
    this.selectedMinDate = new Date();
    this.selectedMaxDate = null;
    this.disableDatePicker = false;
    this.readOnlyDatePicker = false;
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.customDateClass) {
      this.dateWithCustomClass = [];
      this.updateDateValues();
    }
  }

  updateDateValues() {
    if (this.loadForm) {
      if (this.pickerType) {
        this.showPickerType = this.pickerType;
      }
      if (this.customTodayClass) {
        this.dateCustomConfig.customTodayClass = this.customTodayClass;
      }
      if (this.datesReadOnly) {
        this.readOnlyDatePicker = this.datesReadOnly;
      }
      if (this.dateFormat) {
        this.dateCustomConfig.dateInputFormat = this.dateFormat;
      }
      if (this.dateMin) {
        this.selectedMinDate = new Date(this.convertDate(this.dateMin));
      }
      if (this.dateMax) {
        this.selectedMaxDate = new Date(this.convertDate(this.dateMax));
      }
      if (this.datePickerDisable) {
        this.disableDatePicker = this.datePickerDisable;
      }
      if (this.daysDisabled && this.daysDisabled.length > 0) {
        this.disableDaysArray = this.daysDisabled;
      }
      if (this.datesDisabled && this.datesDisabled.length > 0) {
        _.map(this.datesDisabled, (dt) => {
          this.disableDatesArray.push(new Date(this.convertDate(dt)));
        });
      }
      if (this.customDateClass && this.customDateClass.length > 0) {
        _.map(this.customDateClass, (dt) => {
          const obj = {
            date: new Date(this.convertDate(dt.date)),
            classes: dt.classes,
            title: dt.title
          };
          this.dateWithCustomClass.push(obj);
        });
      }
    }
  }

  createForm() {
    this.myForm = this.formBuilder.group({
      date: [new Date()]
    });
    this.loadForm = true;
    this.updateSelecedDate();
    if (this.pickerType === 'inline') {
      this.updateDateValues();
    }
  }

  updateSelecedDate() {
    if (!_.isUndefined(this.selectedDate) && this.selectedDate.toString().match(this.datePattern)) {
      this.myForm.patchValue({ date: new Date(this.convertDate(this.selectedDate)) });
    }
  }

  onDateValueChange(value): void {
    this.title = '';
    const timestamp = Date.parse(value);
    if (_.isNaN(timestamp) === false) {
      let dateToCheck = moment(value).format(this.dateCustomConfig.dateInputFormat)
      this.dateWithCustomClass.forEach(el => {
        if(moment(el.date).format(this.dateCustomConfig.dateInputFormat) === dateToCheck) {
          this.title = el.title
        }
      })
      this.dateChange.emit(moment(value).format(this.dateCustomConfig.dateInputFormat));
    } else {
      this.myForm.patchValue({ date: null });
      this.dateChange.emit(null);
    }
    if (this.pickerType === 'inline') {
      this.updateDateValues();
    }
  }

  convertDate(value) {
    return value.split('/').reverse().join('-');
  }


}

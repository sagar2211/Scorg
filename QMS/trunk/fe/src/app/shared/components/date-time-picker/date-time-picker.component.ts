import { Component, OnInit, Input, forwardRef, ViewChild, AfterViewInit, Injector, Self, Type, InjectionToken, Output, EventEmitter } from '@angular/core';
import { NgbTimeStruct, NgbDateStruct, NgbPopoverConfig, NgbPopover, NgbDatepicker, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DateTimeModel } from './date-time.model';
import { noop } from 'rxjs';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [
    DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ]
})
export class DateTimePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  @Input() dateString: string;

  @Input() inputDatetimeFormat = 'dd/M/yyyy H:mm:ss';
  @Input() maxInputDatetime: NgbDateStruct;
  @Input() minInputDatetime: NgbDateStruct;
  @Input() hourStep = 1;
  @Input() minuteStep = 15;
  @Input() secondStep = 30;
  @Input() seconds = true;
  @Input() showCalenderOnly = false;
  @Input() disabled = false;
  @Input() placeholder;
  @Output() outputDateTime = new EventEmitter<any>();
  public showTimePickerToggle = false;

  public datetime: DateTimeModel = new DateTimeModel();
  public time = { hour: 0, minute: 0, second: 0 };
  private firstTimeAssign = true;

  @ViewChild(NgbDatepicker, { static: false }) dp: NgbDatepicker;

  @ViewChild(NgbPopover, { static: false })
  private popover: NgbPopover;

  private onTouched: () => void = noop;
  private onChange: (_: any) => void = noop;

  public ngControl: NgControl;
  today = this.calendar.getToday();
  private inj: Injector = Injector.create(
    {
      providers:
        [{ provide: NgControl, useValue: NgControl }]
    });
  constructor(
    private config: NgbPopoverConfig,
    private calendar: NgbCalendar,
    private datePipe: DatePipe) {
    config.autoClose = 'outside';
    config.placement = 'auto';
    // setTimeout(()=> this.ngControl = this.inj.get(NgControl));
  }

  ngOnInit(): void {
    this.ngControl = this.inj.get(NgControl);
    this.datetime.hour = 0;
    this.datetime.minute = 0;
  }

  ngAfterViewInit(): void {
    if (this.popover) {
      this.popover.hidden.subscribe($event => {
        this.showTimePickerToggle = false;
      });
    }
  }

  writeValue(newModel: string) {
    if (newModel) {
      this.datetime = this.datetime ? this.datetime : DateTimeModel.fromLocalString(newModel);
      this.datetime = Object.assign(this.datetime, DateTimeModel.fromLocalString(newModel));
      this.dateString = newModel;
      this.setDateStringModel();
    } else {
      if (newModel == null) {
        this.datetime = DateTimeModel.fromLocalString(null);
        this.dateString = '';
        return;
      }
      this.datetime = new DateTimeModel();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleDateTimeState($event) {
    this.showTimePickerToggle = !this.showTimePickerToggle;
    $event.stopPropagation();
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange($event: any) {
    const value = $event.target.value;
    const dt = DateTimeModel.fromLocalString(value);

    if (dt) {
      this.datetime = dt;
      this.setDateStringModel();
    } else if (value.trim() === '') {
      this.datetime = new DateTimeModel();
      this.dateString = '';
      this.onChange(this.dateString);
    } else {
      this.onChange(value);
    }
  }

  onDateChange($event: any | NgbDateStruct, dp: NgbDatepicker) {
    if ($event.year) {
      $event = `${$event.year}-${$event.month}-${$event.day}`;
    }

    const date = DateTimeModel.fromLocalString($event);

    if (!date) {
      this.dateString = this.dateString;
      return;
    }

    if (!this.datetime) {
      this.datetime = date;
    }

    this.datetime.year = date.year;
    this.datetime.month = date.month;
    this.datetime.day = date.day;

    dp.navigateTo({ year: this.datetime.year, month: this.datetime.month });
    this.setDateStringModel();
    this.passDateTime();
  }

  onTimeChange(event: NgbTimeStruct) {
    this.datetime.hour = event ? event.hour : 0;
    this.datetime.minute = event ? event.minute : 0;
    this.datetime.second = event ? event.second : 0;

    this.setDateStringModel();
    this.passDateTime();
  }

  setDateStringModel() {
    this.dateString = this.datetime.toString();

    if (!this.firstTimeAssign) {
      this.onChange(this.dateString);
    } else {
      // Skip very first assignment to null done by Angular
      if (this.dateString !== null) {
        this.firstTimeAssign = false;
      }
    }
  }

  inputBlur($event) {
    this.onTouched();
  }

  passDateTime() {
    this.outputDateTime.emit(this.datePipe.transform(this.dateString, this.inputDatetimeFormat));
  }
}

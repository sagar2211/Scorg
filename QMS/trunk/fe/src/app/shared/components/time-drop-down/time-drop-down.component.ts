import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EntitityCommonDataService } from '../../../modules/schedule/services/entitity-common-data.service';
import * as moment from 'moment';
import * as _ from 'lodash';


@Component({
  selector: 'app-time-drop-down',
  templateUrl: './time-drop-down.component.html',
  styleUrls: ['./time-drop-down.component.scss']
})
export class TimeDropDownComponent implements OnInit, OnChanges {

  timeDropdownForm: FormGroup;
  hoursArray = [];

  @Input() timeFormat;
  @Input() selectedValue;
  @Input() minuteValue;
  @Output() selectedItem = new EventEmitter<any>();
  @Input() startTime;
  @Input() serviceTime;
  @Input() hoursList: Array<string> = [];
  @Input() isCurrentTime;
  @Input() disableSelection;
  @Input() isEntireDay;

  constructor(
    private entityCommonDataService: EntitityCommonDataService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.filterTimeArrayOnCurrentTime();
    this.hoursArray = this.hoursList.length ? this.hoursList : this.hoursArray;
    this.timeDropdownForm = this.fb.group({
      selectedItem: [{}]
    });
    this.patchDefaultValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.startTime || changes.hoursList) {
      this.hoursArray = this.hoursList.length ? this.hoursList : this.hoursArray;
    }
    if (changes.isCurrentTime) {
      this.filterTimeArrayOnCurrentTime();
    }
    if (changes.selectedValue && changes.selectedValue.currentValue) {
      if (this.timeDropdownForm) {
        this.patchDefaultValue();
      } else {
        this.timeDropdownForm = this.fb.group({
          selectedItem: [{}]
        });
        this.patchDefaultValue();
      }
    }
    if (this.selectedValue == null && this.timeDropdownForm) {
      this.timeDropdownForm.patchValue({
        selectedItem: null
      });
    }
  }

  filterTimeArrayOnCurrentTime(): void {
    const checkMinData = this.minuteValue ? true : false;

    if (this.timeFormat === '12_hour') {
      this.hoursArray = this.entityCommonDataService.createHoursList12HourFormat(checkMinData);
    }
    if (this.timeFormat === '24_hour') {
      this.hoursArray = this.entityCommonDataService.createHoursList24HourFormat(checkMinData);
    }
    if (this.isEntireDay) {
      this.hoursArray[0] = 'Entire Day';
    }
    const timeFormat = this.timeFormat === '24_hour' ? 'HH:mm' : 'hh:mm A';
    const hoursFromArray = [];
    if (this.isCurrentTime) {
      _.map(this.hoursArray, (t) => {
        // const currentTime = moment().format(timeFormat);
        if (moment(moment(), timeFormat).isBefore(moment(t, timeFormat))) {
          hoursFromArray.push(t);
        }
      });
    }
    this.hoursArray = hoursFromArray.length ? hoursFromArray : this.hoursArray;
  }

  patchDefaultValue(): void {
    this.timeDropdownForm.patchValue({
      selectedItem: this.selectedValue
    });
  }

  onSelectItem(e) {
    this.selectedItem.emit(e);
  }


}

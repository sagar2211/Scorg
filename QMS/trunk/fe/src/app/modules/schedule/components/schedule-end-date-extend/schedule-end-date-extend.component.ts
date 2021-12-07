import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ScheduleMakerService } from '../../services/schedule-maker.service';
import { Constants } from 'src/app/config/constants';
import * as moment from 'moment';
import * as _ from 'lodash';
import { IAlert } from 'src/app/models/AlertMessage';
import { EntitityCommonDataService } from '../../services/entitity-common-data.service';

@Component({
  selector: 'app-schedule-end-date-extend',
  templateUrl: './schedule-end-date-extend.component.html',
  styleUrls: ['./schedule-end-date-extend.component.scss']
})
export class ScheduleEndDateExtendComponent implements OnInit {
  @Input() messageDetails: any;
  minDate;
  endDate;
  alertMsg: IAlert;
  constructor(
    public modal: NgbActiveModal,
    private scheduleMakerService: ScheduleMakerService,
    private entitityCommonDataService: EntitityCommonDataService,
  ) { }

  ngOnInit() {
    this.minDate = this.messageDetails.scheduleData.endDate ? this.messageDetails.scheduleData.endDate : new Date(this.messageDetails.scheduleData.startDate);
    this.endDate = null;
    console.log(this.entitityCommonDataService.entityScheduleObject);
  }

  checkInFutureScheduleEndDateExist() {
    let status = false;
    const scheduledata = _.filter(this.entitityCommonDataService.entityScheduleObject.scheduleData, dt => {
      return (this.messageDetails.scheduleData.formId !== dt.formId &&
        ((moment(dt.startDate).isAfter(moment(this.endDate)) ||
          moment(dt.endDate).isAfter(moment(this.endDate))
        ))
      );
    });
    if (scheduledata.length > 0) {
      const checkData = _.filter(scheduledata, dt => {
        return (moment(this.endDate).isBetween(moment(dt.startDate), moment(dt.endDate), null, '[]'));
      });
      if (checkData.length > 0) {
        status = true;
      } else {
        status = false;
      }
    } else {
      status = false;
    }
    const betweenEndDatsSchedule = _.filter(this.entitityCommonDataService.entityScheduleObject.scheduleData, dt => {
      return (this.messageDetails.scheduleData.formId !== dt.formId &&
        ((moment(dt.startDate).isBetween(moment(this.messageDetails.scheduleData.endDate), moment(this.endDate), null, '[]'))
          || ((moment(dt.endDate).isBetween(moment(this.messageDetails.scheduleData.endDate), moment(this.endDate), null, '[]')))
        ));
    });
    if (betweenEndDatsSchedule.length > 0) {
      status = true;
    } else {
      status = false;
    }
    return status;
  }

  updateEndDate() {
    // console.log(this.endDate);
    // console.log(this.messageDetails.scheduleData);
    if (!_.isDate(this.endDate)) {
      this.alertMsg = {
        message: 'Please Select End Date!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    if (moment(moment(this.endDate).format('YYYY-MM-DD')).isSameOrBefore(moment(this.minDate))) {
      this.alertMsg = {
        message: 'Selected End date should be after current End Date!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    // first check dateconflict with other
    let dateOverLap = false;
    _.map(this.entitityCommonDataService.entityScheduleObject.scheduleData, dt => {
      if (this.messageDetails.scheduleData.formId !== dt.formId &&
        ((moment(this.endDate).isBetween(moment(dt.startDate), moment(dt.endDate), null, '[]')))) {
        dateOverLap = true;
      }
    });
    if (!dateOverLap && this.checkInFutureScheduleEndDateExist()) {
      dateOverLap = true;
    }
    if (dateOverLap) {
      this.alertMsg = {
        message: 'Date Overlapping Future Schedule',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const param = {
      entity_id: this.messageDetails.entity_id,
      entity_value_id: this.messageDetails.entity_value_id,
      time_main_id: this.messageDetails.scheduleData.formId,
      new_end_date: moment(this.endDate).format(Constants.apiDateFormate)
    };
    this.scheduleMakerService.updateEndDateSchedule(param).subscribe(res => {
      if (res) {
        this.scheduleMakerService.updateAllHistoryData();
        this.alertMsg = {
          message: 'End Date Updated',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        setTimeout(() => {
          this.modal.close('ok');
        }, Constants.ALERT_DURATION);
      } else {
        this.alertMsg = {
          message: 'Something Went Wrong',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

}

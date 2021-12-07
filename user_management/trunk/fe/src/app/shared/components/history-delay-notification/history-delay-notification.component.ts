import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-history-delay-notification',
  templateUrl: './history-delay-notification.component.html',
  styleUrls: ['./history-delay-notification.component.scss']
})
export class HistoryDelayNotificationComponent implements OnInit {
  @Input() historyData: any;
  @Input() timeFormateKey: string;
  @Input() historyDate: Date;
  historyDateString: string;
  constructor() { }

  ngOnInit() {
    this.historyDateString = moment(this.historyDate).format('MM/DD/YYYY');
    if (this.historyData && this.historyData.Data.length > 0) {
      _.forEach(this.historyData.Data, (history) => {
        history.from_time = this.convertTime(history.from_time);
        history.to_time = this.convertTime(history.to_time);
      });
    }
  }

  convertTime(timeVal) {
    let updateTimeVal = null;
    if (this.timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('h:mm A');
    } else if (this.timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('H:mm');
    }
    return updateTimeVal;
  }


}

import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { NursingReportService } from './../../../public/services/nursing-report.service';
import * as moment from 'moment';

@Component({
  selector: 'app-dibetic-chart-row-data',
  templateUrl: './dibetic-chart-row-data.component.html',
  styleUrls: ['./dibetic-chart-row-data.component.scss']
})
export class DibeticChartRowDataComponent implements OnInit {
  @Input() messageDetails: any;
  reportRowData: any;
  selectedInsulinType: any;
  insulinTypeList = [];
  hoursArray = [];
  minuteArray = [];
  timeAry = ['AM', 'PM'];
  timeFormateKey: string;
  timeFormate: string;
  showAmPm: boolean;
  hourTime: string;
  minuteTime: string;
  timeAmPm: string;
  selectedDate: any;
  constructor(
    public modal: NgbActiveModal,
    private nursingReportService: NursingReportService,
  ) { }

  ngOnInit() {
    this.showAmPm = false;
    this.selectedDate = moment(this.messageDetails.selectedDate).format('DD/MM/YYYY');
    this.timeFormateKey = this.messageDetails.timeFormateKey;
    this.timeFormate = this.messageDetails.timeFormate;
    this.insulinTypeList = this.nursingReportService.insulinTypeList;
    this.reportRowData = _.cloneDeep(this.messageDetails.selectedData);
    this.selectedInsulinType = this.reportRowData.insulinType ? this.reportRowData.insulinType.id : null;
    this.getHrsMinArray();
  }

  selectValueConfirm(typ: string) {
    const obj = {
      selectedValue: null,
      type: typ
    };
    if (typ === 'Ok') {
      obj.selectedValue = this.reportRowData;
      this.modal.close(obj);
    } else {
      this.modal.close(obj);
    }
  }

  updateInsType() {
    this.reportRowData.insulinType = _.find(this.insulinTypeList, ins => {
      return ins.id === this.selectedInsulinType;
    });
  }

  getHrsMinArray() {
    const currentTime = moment(moment().format('YYYY-MM-DD') + ' ' + this.reportRowData.time);
    if (this.timeFormateKey === '12_hour') {
      this.showAmPm = true;
      this.hoursArray = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      this.hourTime = moment(currentTime).format('hh');
      this.minuteTime = moment(currentTime).format('mm');
      this.timeAmPm = moment(currentTime).format('A');
    } else {
      this.hoursArray = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
      this.hourTime = moment(currentTime).format('HH');
      this.minuteTime = moment(currentTime).format('mm');
    }
    this.minuteArray = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
    for (let i = 10; i < 60; i++) {
      this.minuteArray.push(_.toString(i));
    }
  }

  updateTime(type) {
    if (this.timeFormateKey === '12_hour') {
      this.reportRowData.time = moment(moment().format('YYYY-MM-DD') + ' ' + this.hourTime + ':' + this.minuteTime + ' ' + this.timeAmPm).format(this.timeFormate);
    } else {
      this.reportRowData.time = moment(moment().format('YYYY-MM-DD') + ' ' + this.hourTime + ':' + this.minuteTime).format(this.timeFormate);
    }
  }

}

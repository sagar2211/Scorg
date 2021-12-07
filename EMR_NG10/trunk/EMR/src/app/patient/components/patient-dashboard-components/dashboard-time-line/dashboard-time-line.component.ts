import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IAlert } from './../../../../public/models/AlertMessage';
import { PatientService } from './../../../../public/services/patient.service';
import { CommonService } from './../../../../public/services/common.service';
import { Constants } from './../../../../config/constants';

@Component({
  selector: 'app-dashboard-time-line',
  templateUrl: './dashboard-time-line.component.html',
  styleUrls: ['./dashboard-time-line.component.scss']
})
export class DashboardTimeLineComponent implements OnInit, OnDestroy {
  @Input() patientId: any;
  timeLineData: object = {};
  patientObj: EncounterPatient;
  todayDate: Date;
  currentHourStart: number;
  currentHourEnd: number;
  hoursList: Array<{ hr: number, date: Date }> = [];
  hoursListOfMeridiem: Array<string> = [];
  destroy$ = new Subject<boolean>();
  fromDate: Date;
  toDate: Date;
  dateList: Array<Date>;
  alertMsg: IAlert;

  @ViewChild('timeLineScroller', { static: false }) timeLineScroller: ElementRef;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private patientService: PatientService) { }

  ngOnInit() {
    this.fromDate = moment().subtract(1, 'days').toDate();
    this.toDate = new Date();
    this.dateList = [this.fromDate, this.toDate];
    this.currentHourStart = _.toNumber(moment().format('k'));
    this.currentHourEnd = 0;
    this.todayDate = new Date();

    this.getpatientData();
    this.getPatientDashboardTimelineData();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
      this.getPatientDashboardTimelineData();
    });
  }

  navigate(navigateURL) {
    if (navigateURL) {
      this.router.navigate([navigateURL, this.patientId]);
    }
  }

  checkHrsIsExist(item, key): boolean {
    if (this.timeLineData && this.timeLineData[key] && (this.timeLineData[key].length)) {
      const indx = this.timeLineData[key].findIndex(t => {
        return _.toNumber(moment(t).format('k')) === item.hr && moment(moment(t).format('YYYY-MM-DD')).isSame(moment(item.date).format('YYYY-MM-DD'));
      });
      if (indx !== -1) {
        return true;
      } else {
        return false;
      }
      // return (this.timeLineData[key].findIndex(t => _.toNumber(moment(t).format('k')) === hour)) !== -1 ? true : false;
    }
    return false;
  }

  onHerizontalScrollEvent(): void {
    // return;
    this.fromDate = moment(this.fromDate).subtract(1, 'days').toDate();
    this.toDate = this.fromDate;

    if (moment(moment(this.toDate).format('YYYY-MM-DD')).isAfter(moment(this.patientObj.admissionDate).format('YYYY-MM-DD'))) {
      this.dateList.unshift(this.fromDate);
      this.getPatientDashboardTimelineData(true);
    } else {
      this.alertMsg = {
        message: 'No records found...',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  getPatientDashboardTimelineData(isScroll?): void {
    const param = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
      from_date: this.fromDate,
      to_date: this.toDate
    };
    this.patientService.getPatientDashboardTimelineData(param).subscribe(res => {
      const myDiv = this.timeLineScroller.nativeElement;
      let scrollWidth = myDiv.scrollWidth;
      if (isScroll) {
        this.generateHours(this.toDate);
        scrollWidth = 200;
      } else {
        this.generateHours(this.toDate);
        this.generateHours(this.fromDate);
        scrollWidth = myDiv.scrollWidth;
        // this.hoursList = _.orderBy(this.hoursList, ['date'], ['asc']);
      }
      this.updateTimeLineData(res);
      this.hoursList = _.orderBy(this.hoursList, ['date'], ['asc']);
      setTimeout(() => {
        myDiv.scrollLeft = scrollWidth;
        myDiv.scrollIntoView({behavior: "smooth"});
      });
    });
  }

  // -- generate hours and maridadina
  generateHours(date): void {
    for (let i = 1; i <= 24; i++) {
      this.hoursList.push({
        hr: i, date
      });
      this.hoursListOfMeridiem.push(moment(i, ['H']).format('h A'));
    }
  }

  setCurrentTimeBgColor(hours): boolean {
    return ((this.currentHourStart === hours.hr) && moment(moment(this.todayDate).format('YYYY-MM-DD')).isSame(moment(hours.date).format('YYYY-MM-DD')));
  }

  // -- merge date of initial and pagination data...
  updateTimeLineData(data): void {
    const keys = Object.keys(data);
    keys.forEach(k => {
      if (this.timeLineData.hasOwnProperty(k)) {
        data[k] = data[k] ? data[k] : [];
        this.timeLineData[k] = this.timeLineData[k].concat(data[k]);
      } else {
        this.timeLineData[k] = data[k] ? [...(data[k] as Array<any>)] : [];
      }
    });
  }

  onWheel(event): void {
    const myDiv = this.timeLineScroller.nativeElement;
    // let isCall = true;
    if (myDiv.scrollLeft <= 0) {
      this.onHerizontalScrollEvent();
      myDiv.scrollLeft = 200;
      // isCall = false;
    }

  }

}

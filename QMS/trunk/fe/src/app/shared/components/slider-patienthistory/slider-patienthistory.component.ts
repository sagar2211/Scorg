import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { PatientHistory } from 'src/app/modules/appointment/models/patient-history.model';
import { AppointmentHistory } from 'src/app/modules/appointment/models/appointment-history.model';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from 'src/app/config/constants';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-slider-patienthistory',
  templateUrl: './slider-patienthistory.component.html',
  styleUrls: ['./slider-patienthistory.component.scss']
})
export class SliderPatienthistoryComponent implements OnInit {
  @Input() selectedPatUhid: any;
  @Input() selectedProviderDetais: any;
  patientHistory = new PatientHistory();
  timeFormateKey = '';
  scrollDistance = 2;
  scrollUpDistance = 2;
  throttle = 300;
  pagination = { limit: 15, pageNo: 1 };
  historyListByGroupYear = [];
  notscrolly: boolean = true;


  constructor(
    private appointmentService: AppointmentService,
    private commonService: CommonService,
    private authService: AuthService,

  ) { }

  ngOnInit() {
    if (this.selectedPatUhid && this.selectedProviderDetais) {
      this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
      this.patientHistory.history = new Array<AppointmentHistory>();
      this.selectedPatUhid.pat_uhid = this.selectedPatUhid.patUhid;
      this.getAppointmentHistory();
    }
  }
  onScrollDown() {
    if (this.notscrolly) {
      this.notscrolly = false;
      this.pagination.pageNo = this.pagination.pageNo + 1;
      this.getAppointmentHistory();
    }
  }

  getAppointmentHistory(): void {
    const entityId = this.selectedProviderDetais.providerId;
    const entityValueId = this.selectedProviderDetais.providerValueId;
    const limitNo = this.pagination.limit;
    const currentpage = this.pagination.pageNo;
    this.appointmentService.getAppointmentHistoryByUhID(this.selectedPatUhid.pat_uhid, limitNo, currentpage, entityId, entityValueId).subscribe((res: PatientHistory) => {
      const temppatientHistoryArray = res.history.length ? res.history : [];
      if (temppatientHistoryArray.length) {
        this.notscrolly = true;
        _.map(temppatientHistoryArray, (t) => {
          t.appointmentTime = _.clone(this.convertTime(t.appointmentTime));
        });
        this.patientHistory.history = this.patientHistory.history.length > 0 ? this.patientHistory.history.concat(temppatientHistoryArray) : temppatientHistoryArray;
        this.createGroupWiseList();
      } else {
        this.notscrolly = true;
      }
    });
  }

  createGroupWiseList() {
    this.historyListByGroupYear = [];
    this.patientHistory.history = _.orderBy(this.patientHistory.history, ['appointmentDate'], ['desc']);
    const groupDataYear = _.groupBy(this.patientHistory.history, (d) => d.appointmentDate.getFullYear());
    const yearprops = Object.keys(groupDataYear);
    yearprops.forEach(p => {
      const groupData = _.groupBy(groupDataYear[p], (d) => moment(d.appointmentDate, 'DD-MMM-YYYY').format('DD/MM/YYYY'));
      const Dateprops = Object.keys(groupData);
      const gDate = [];
      Dateprops.forEach(d => {
        gDate.push({
          Date: d,
          data: groupData[d]
        });
      });
      this.historyListByGroupYear.push({
        year: p,
        apphistory: gDate
      });
    });
  }
  convertTime(timeVal) {
    let updateTimeVal = null;
    if (this.timeFormateKey === '12_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('hh:mm A');
    } else if (this.timeFormateKey === '24_hour' && timeVal) {
      updateTimeVal = moment(moment().format('YYYY-MM-DD') + ' ' + timeVal).format('HH:mm');
    }
    return updateTimeVal;
  }
  onClose(): void {
    this.commonService.openCloselogSlider('close');
  }

}

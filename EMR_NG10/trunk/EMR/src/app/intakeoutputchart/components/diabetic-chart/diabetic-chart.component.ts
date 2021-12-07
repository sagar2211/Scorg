import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAlert } from './../../../public/models/AlertMessage';
import { CommonService } from './../../../public/services/common.service';
import { Constants } from 'src/app/config/constants';
import { AuthService } from './../../../public/services/auth.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NursingReportService } from '../../../public/services/nursing-report.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DibeticChartRowDataComponent } from '../dibetic-chart-row-data/dibetic-chart-row-data.component';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-diabetic-chart',
  templateUrl: './diabetic-chart.component.html',
  styleUrls: ['./diabetic-chart.component.scss']
})
export class DiabeticChartComponent implements OnInit, OnDestroy {
  alertMsg: IAlert;
  defaultChartDataObject = {
    time: new Date(),
    urineAcitone: null,
    glucometryBsl: null,
    glucometryPrandialStatus: null,
    insulinType: null,
    insulinDose: null,
    insulinRoute: null,
    remark: null,
  };

  defaultChartDayObject = {
    date: new Date(),
    chartData: [],
    isExpanded: false,
    isDataLoaded: false,
    urineAcitoneSum: 0,
    glucometryBslSum: 0,
    glucometryPrandialStatusSum: 0,
    insulinDoseSum: 0,
  };

  grandTotalSum = {
    urineAcitoneSum: 0,
    glucometryBslSum: 0,
    glucometryPrandialStatusSum: 0,
    insulinDoseSum: 0,
  };

  chartDataArray = [];
  chartDayArray = [];
  chartGrandTotal = null;

  userId: number;
  timeFormateKey: string;
  timeFormate: string;
  userInfo: any;
  patientObj: EncounterPatient;
  dateCheckFormat: string;
  destroy$ = new Subject<any>();
  insulinTypeList = [];
  loadChart: boolean;

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    private nursingReportService: NursingReportService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.loadChart = false;
    this.insulinTypeList = this.nursingReportService.insulinTypeList;
    this.dateCheckFormat = 'YYYY/MM/DD';
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getTimeFormatKey().then(res => {
      this.getpatientData();
    });
    this.subcriptionOfEvents();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  getTimeFormatKey(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.userId = +this.authService.getLoggedInUserId();
      this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId).subscribe(res => {
        this.timeFormateKey = res.time_format_key;
        if (this.timeFormateKey === '12_hour') {
          this.timeFormate = 'hh:mm A';
        } else {
          this.timeFormate = 'HH:mm';
        }
        resolve(this.timeFormate);
      });
    });
    return promise;
  }

  getpatientData(patient?) {
    this.patientObj = null;
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.generateChartByAdmittedDate();
  }

  generatDefaulteChartTimeData() {
    const chartDataArray = [];
    const chrtRowData = _.cloneDeep(this.defaultChartDataObject);
    // for (let i = 0; i < 24; i++) {
    //   chrtRowData.time = moment(moment().format('YYYY-MM-DD') + ' ' + '0' + i + ':00').format(this.timeFormate);
    //   chartDataArray.push(_.cloneDeep(chrtRowData));
    // }
    chrtRowData.time = moment().format(this.timeFormate);
    chartDataArray.push(_.cloneDeep(chrtRowData));
    return chartDataArray;
  }

  generateChartByAdmittedDate() {
    const patAdmittedDate = moment(moment(this.patientObj.admissionDate).format(this.dateCheckFormat));
    const diffDays = moment().diff(patAdmittedDate, 'days');
    const defaultChartDayObject = _.cloneDeep(this.defaultChartDayObject);
    for (let i = diffDays; i >= 0; i--) {
      defaultChartDayObject.date = new Date(moment(moment(patAdmittedDate).add(i, 'days')).format(this.dateCheckFormat));
      if (i === diffDays) {
        defaultChartDayObject.chartData = this.generatDefaulteChartTimeData();
      } else {
        defaultChartDayObject.chartData = [];
      }
      this.chartDayArray.push(_.cloneDeep(defaultChartDayObject));
    }
    this.getDiabeticChartSummaryData();
  }

  getChardDataForSelectedDate(chartData, indx) {
    if (this.chartDayArray[indx].isDataLoaded) {
      this.chartDayArray[indx].isExpanded = !this.chartDayArray[indx].isExpanded;
      return;
    }
    const param = {
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
      reportDate: moment(chartData.date).format(this.dateCheckFormat)
    };
    this.nursingReportService.getDiabeticChartData(param).subscribe(res => {
      if (res.length > 0) {
        this.chartDayArray[indx].chartData = [];
        this.updateDayData(res, chartData, indx);
        this.chartDayArray[indx].isExpanded = true;
        this.chartDayArray[indx].isDataLoaded = true;
      } else {
        this.chartDayArray[indx].isExpanded = true;
        this.chartDayArray[indx].isDataLoaded = true;
      }
      this.loadChart = true;
    });
  }

  getDiabeticChartSummaryData() {
    const param = {
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
    };
    this.nursingReportService.getDiabeticChartSummary(param).subscribe(res => {
      if (res.length > 0) {
        this.updateTotalData(res);
      } else {
        this.grandTotalSum.urineAcitoneSum = 0;
        this.grandTotalSum.glucometryBslSum = 0;
        this.grandTotalSum.glucometryPrandialStatusSum = 0;
        this.grandTotalSum.insulinDoseSum = 0;
        this.getChardDataForSelectedDate(this.chartDayArray[0], 0);
      }
    });
  }

  selectOptionType(selectedValue: any, parInx, childInx, type): any {
    // if (this.userInfo.role_type === ApplicationEntityConstants.NURSE) {
    const messageDetails = {
      modalTitle: 'Select Values',
      selectedData: _.cloneDeep(selectedValue),
      timeFormateKey: this.timeFormateKey,
      timeFormate: this.timeFormate,
      selectedDate: this.chartDayArray[parInx].date
    };
    const modalInstance = this.modalService.open(DibeticChartRowDataComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'lg',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'Ok') {
        if (type === 'update') {
          this.chartDayArray[parInx].chartData[childInx] = result.selectedValue;
        } else {
          this.chartDayArray[parInx].chartData.push(result.selectedValue);
        }
        this.chartDayArray[parInx].urineAcitoneSum = this.getSumOfTotal(this.chartDayArray[parInx].chartData, 'urineAcitone');
        this.chartDayArray[parInx].glucometryBslSum = this.getSumOfTotal(this.chartDayArray[parInx].chartData, 'glucometryBsl');
        this.chartDayArray[parInx].glucometryPrandialStatusSum = this.getSumOfTotal(this.chartDayArray[parInx].chartData, 'glucometryPrandialStatus');
        this.chartDayArray[parInx].insulinDoseSum = this.getSumOfTotal(this.chartDayArray[parInx].chartData, 'insulinDose');
        this.calculateSumValue();
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
    // }
  }

  saveAllDatesReportData(reportData) {
    const param = {
      patientId: this.patientObj.patientData.id,
      visitNo: this.patientObj.visitNo,
      user_id: this.userId,
      reportDate: moment(reportData.date).format(this.dateCheckFormat),
      reportData: []
    };
    _.map(reportData.chartData, dt => {
      const rowData = {
        reportTime: moment(moment(reportData.date).format(this.dateCheckFormat) + ' ' + dt.time).toDate(),
        urineAcetone: dt.urineAcitone ? dt.urineAcitone : null,
        glucometryBSL: dt.glucometryBsl ? dt.glucometryBsl : null,
        glucometryPrandialStatus: dt.glucometryPrandialStatus ? dt.glucometryPrandialStatus : null,
        insulinType: dt.insulinType ? dt.insulinType.id : null,
        insulinDose: dt.insulinDose ? dt.insulinDose : null,
        insulinRoute: dt.insulinRoute ? dt.insulinRoute : null,
        remark: dt.remark ? dt.remark : null,
      };
      param.reportData.push(_.cloneDeep(rowData));
    });
    this.nursingReportService.saveDiabeticChartData(param).subscribe(res => {
      if (res) {
        this.alertMsg = {
          message: 'Chart Updated Successfully!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.alertMsg = {
          message: 'Something Went Wrong',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  updateDayData(res, chartData, indx) {
    _.map(res, getData => {
      const chrtDataObject = _.clone(this.defaultChartDataObject);
      const insType = _.find(this.insulinTypeList, ins => {
        return ins.id === getData.insulinType;
      });
      chrtDataObject.urineAcitone = getData.urineAcetone;
      chrtDataObject.glucometryBsl = getData.glucometryBSL;
      chrtDataObject.glucometryPrandialStatus = getData.glucometryPrandialStatus;
      chrtDataObject.insulinType = insType ? insType : null;
      chrtDataObject.insulinDose = getData.insulinDose;
      chrtDataObject.insulinRoute = getData.insulinRoute;
      chrtDataObject.remark = getData.remark;
      chrtDataObject.time = moment(getData.reportTime).format(this.timeFormate);
      this.chartDayArray[indx].chartData.push(_.clone(chrtDataObject));
    });
  }

  addNewTime(parInx) {
    const rowData = this.generatDefaulteChartTimeData();
    this.selectOptionType(rowData[0], parInx, this.chartDayArray[parInx].chartData.length, 'add');
    // this.chartDayArray[parInx].chartData.push(_.clone(rowData[0]));
  }

  updateTotalData(res) {
    _.map(res, dt => {
      const dbDate = moment(dt.reportDate).format(this.dateCheckFormat);
      const chrtIndx = _.findIndex(this.chartDayArray, chrt => {
        return moment(chrt.date).isSame(moment(dbDate));
      });
      if (chrtIndx !== -1) {
        this.chartDayArray[chrtIndx].urineAcitoneSum = dt.urineAcetoneTotal;
        this.chartDayArray[chrtIndx].glucometryBslSum = dt.glucometryBSLTotal;
        this.chartDayArray[chrtIndx].glucometryPrandialStatusSum = dt.glucometryPrandialStatusTotal;
        this.chartDayArray[chrtIndx].insulinDoseSum = dt.insulinDoseTotal;
      }
    });
    this.getChardDataForSelectedDate(this.chartDayArray[0], 0);
    this.calculateSumValue();
  }

  calculateSumValue() {
    this.grandTotalSum.urineAcitoneSum = this.getSumOfTotal(this.chartDayArray, 'urineAcitoneSum');
    this.grandTotalSum.glucometryBslSum = this.getSumOfTotal(this.chartDayArray, 'glucometryBslSum');
    this.grandTotalSum.glucometryPrandialStatusSum = this.getSumOfTotal(this.chartDayArray, 'glucometryPrandialStatusSum');
    this.grandTotalSum.insulinDoseSum = this.getSumOfTotal(this.chartDayArray, 'insulinDoseSum');
  }

  getSumOfTotal(array, key) {
    return (_.sumBy(array, key));
  }

  deleteRowValue(reportRowData, parInx, childInx) {
    const modalTitleobj = 'Delete';
    const modalBodyobj = 'Do you want to delete this Row?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.chartDayArray[parInx].chartData.splice(childInx, 1);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }
}

import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IFluidChartDefaultRow } from './../../../public/models/fluid-chart-default-row.model';
import { IfluidChartDataObject } from './../../../public/models/ifluid-chart-data-object.model';
import { CommonService } from './../../../public/services/common.service';
import { AuthService } from './../../../public/services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NursingReportService } from './../../../public/services/nursing-report.service';
import { IAlert } from './../../../public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { IntakeOutputSelectionComponent } from '../intake-output-selection/intake-output-selection.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApplicationEntityConstants } from './../../../config/ApplicationEntityConstants';

@Component({
  selector: 'app-intake-output',
  templateUrl: './intake-output.component.html',
  styleUrls: ['./intake-output.component.scss']
})
export class IntakeOutputComponent implements OnInit, OnDestroy {
  defaultInputObject: IFluidChartDefaultRow = {
    intakeTime: null,
    intakeIvFluidName: null,
    intakeIvFluidQty: null,
    intakeRtFeedName: null,
    intakeRtFeedQty: null,
    outputRTQty: null,
    outputUrineQty: null,
    outputDrainQty: null,
    fluidBal: null
  };

  defaultChartDataObject: IfluidChartDataObject = {
    chartDate: new Date(),
    isExpanded: false,
    chartData: [],
    intakeIivFluidQtyTotal: 0,
    intakeRtFeedQtyTotal: 0,
    intakeTotal: 0,
    outputRTQtyTotal: 0,
    outputUrineQtyTotal: 0,
    outputDrainQtyTotal: 0,
    outputTotal: 0,
    outputFluidBalTotal: 0
  };

  allDateTotalData = {
    intakeIivFluidQtyTotalAllDate: 0,
    intakeRtFeedQtyTotalAllDate: 0,
    intakeTotalAllDate: 0,
    outputRTQtyTotalAllDate: 0,
    outputUrineQtyTotalAllDate: 0,
    outputDrainQtyTotalAllDate: 0,
    outputTotalAllDate: 0,
    outputFluidBalTotalAllDate: 0
  };

  alertMsg: IAlert;
  intakeOutputChartData: IfluidChartDataObject[];
  userInfo: any;
  patientObj: EncounterPatient;
  destroy$ = new Subject<any>();
  dateCheckFormat: string;
  timeFormateKey: string;
  timeFormate: string;
  userId: number;

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    private nursingReportService: NursingReportService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.dateCheckFormat = 'YYYY/MM/DD';
    this.intakeOutputChartData = [];
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getpatientData();
    this.getTimeFormatKey();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getTimeFormatKey() {
    this.userId = +this.authService.getLoggedInUserId();
    this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId).subscribe(res => {
      this.timeFormateKey = res.time_format_key;
      if (this.timeFormateKey === '12_hour') {
        this.timeFormate = 'hh:mm A';
      } else {
        this.timeFormate = 'HH:mm';
      }
    });
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

  generateChartByAdmittedDate() {
    const patAdmittedDate = moment(moment(this.patientObj.admissionDate).format(this.dateCheckFormat));
    const diffDays = moment().diff(patAdmittedDate, 'days');
    const defaultChartDataObject = _.cloneDeep(this.defaultChartDataObject);
    for (let i = diffDays; i >= 0; i--) {
      defaultChartDataObject.chartDate = new Date(moment(moment(patAdmittedDate).add(i, 'days')).format(this.dateCheckFormat));
      this.intakeOutputChartData.push(_.cloneDeep(defaultChartDataObject));
    }
    this.getChartDateWiseSummery();
  }

  getChartDateWiseSummery() {
    const param = {
      patient_id: this.patientObj.patientData.id,
      ipd_id: this.patientObj.visitNo,
    };
    this.nursingReportService.getIntakeOutputSummeryData(param).subscribe(res => {
      if (res.length > 0) {
        this.updateSummeryData(res);
      }
    });
  }

  updateSummeryData(res) {
    _.map(res, dt => {
      const findIndx = _.findIndex(this.intakeOutputChartData, chrt => {
        return moment(moment(dt.report_date).format(this.dateCheckFormat))
          .isSame(moment(moment(chrt.chartDate).format(this.dateCheckFormat)));
      });
      if (findIndx !== -1) {
        this.intakeOutputChartData[findIndx].intakeIivFluidQtyTotal = dt.total_intake_iv_fluid_qty;
        this.intakeOutputChartData[findIndx].intakeRtFeedQtyTotal = dt.total_intake_rt_feed_qty;
        this.intakeOutputChartData[findIndx].intakeTotal = dt.total_intake;
        this.intakeOutputChartData[findIndx].outputRTQtyTotal = dt.total_output_r_t_qty;
        this.intakeOutputChartData[findIndx].outputUrineQtyTotal = dt.total_output_urine_qty;
        this.intakeOutputChartData[findIndx].outputDrainQtyTotal = dt.total_output_drain_qty;
        this.intakeOutputChartData[findIndx].outputTotal = dt.total_output;
        this.intakeOutputChartData[findIndx].outputFluidBalTotal = dt.total_fluid_balance;
      }
    });
    this.calculateAllDateSumData();
  }

  getChardDataForSelectedDate(chartData, indx) {
    if (chartData.chartData.length === 0) {
      const param = {
        patient_id: this.patientObj.patientData.id,
        ipd_id: this.patientObj.visitNo,
        report_date: moment(chartData.chartDate).format(this.dateCheckFormat),
      };
      this.nursingReportService.getIntakeOutputDateWiseData(param).subscribe(res => {
        if (res.length > 0) {
          this.generatSavedChartTimeData(res, indx);
          this.intakeOutputChartData[indx].isExpanded = !this.intakeOutputChartData[indx].isExpanded;
        } else {
          this.generatDefaulteChartTimeData(chartData, indx);
        }
      });
    } else {
      this.intakeOutputChartData[indx].isExpanded = !this.intakeOutputChartData[indx].isExpanded;
    }
  }

  generatDefaulteChartTimeData(chartData, indx) {
    const chrtRowData = _.cloneDeep(this.defaultInputObject);
    for (let i = 0; i < 24; i++) {
      chrtRowData.intakeTime = moment(moment().format('YYYY-MM-DD') + ' ' + '0' + i + ':00').format(this.timeFormate);
      this.intakeOutputChartData[indx].chartData.push(_.cloneDeep(chrtRowData));
    }
    this.intakeOutputChartData[indx].isExpanded = !this.intakeOutputChartData[indx].isExpanded;
  }

  generatSavedChartTimeData(chartRowData, indx) {
    _.map(chartRowData, dt => {
      const rowData = _.cloneDeep(this.defaultInputObject);
      const defaultInputObject = {
        intakeTime: moment(dt.intake_time).format(this.timeFormate),
        intakeIvFluidName: [],
        intakeIvFluidQty: dt.intake_iv_fluid_qty,
        intakeRtFeedName: [],
        intakeRtFeedQty: dt.intake_rt_feed_qty,
        outputRTQty: dt.output_r_t_qty,
        outputUrineQty: dt.output_urine_qty,
        outputDrainQty: dt.output_drain_qty,
        fluidBal: dt.fluid_balance,
      };
      _.map(dt.intake_iv_fluid_name_array, nd => {
        defaultInputObject.intakeIvFluidName.push({ ...nd });
      });
      _.map(dt.intake_rt_feed_name_array, nd => {
        defaultInputObject.intakeRtFeedName.push({ ...nd });
      });
      // if (!dt.intake_iv_fluid_Id) {
      //   defaultInputObject.intakeIvFluidName = null;
      // }
      // if (!dt.intake_rt_feed_id) {
      //   defaultInputObject.intakeRtFeedName = null;
      // }
      this.intakeOutputChartData[indx].chartData.push(_.cloneDeep(defaultInputObject));
    });
    this.calculateAllDateSumData();
  }

  saveAllDatesReportData(reportData) {
    const param = {
      patient_id: this.patientObj.patientData.id,
      ipd_id: this.patientObj.visitNo,
      user_id: this.userId,
      report_date: moment(reportData.chartDate).format(this.dateCheckFormat),
      report_data: []
    };
    _.map(reportData.chartData, dt => {
      const rowData = {
        intake_time: moment(param.report_date + ' ' + dt.intakeTime),
        // intake_iv_fluid_id: dt.intakeIvFluidName ? dt.intakeIvFluidName.id : null,
        intake_iv_fluid_name_array: dt.intakeIvFluidName ? dt.intakeIvFluidName : [],
        intake_iv_fluid_qty: dt.intakeIvFluidQty,
        // intake_rt_feed_id: dt.intakeRtFeedName ? dt.intakeRtFeedName.id : null,
        intake_rt_feed_name_array: dt.intakeRtFeedName ? dt.intakeRtFeedName : [],
        intake_rt_feed_qty: dt.intakeRtFeedQty,
        output_r_t_qty: dt.outputRTQty,
        output_urine_qty: dt.outputUrineQty,
        output_drain_qty: dt.outputDrainQty,
        fluid_balance: dt.fluidBal
      };
      param.report_data.push(_.cloneDeep(rowData));
    });
    this.nursingReportService.saveIntakeOutputDateWiseData(param).subscribe(res => {
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

  selectOptionType(selectedValue: any, parInx, childInx): any {
    // this.userInfo.role_type === ApplicationEntityConstants.NURSE
    if (true) {
      const messageDetails = {
        modalTitle: 'Select Values',
        selectedData: _.cloneDeep(selectedValue),
      };
      const modalInstance = this.modalService.open(IntakeOutputSelectionComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: false,
          windowClass: 'custom-modal intake-modal',
          size: 'lg',
          container: '#homeComponent'
        });
      modalInstance.result.then((result) => {
        if (result.type === 'Ok') {
          this.selectValueFromPopup(result.selectedValue, parInx, childInx);
        }
      });
      modalInstance.componentInstance.messageDetails = messageDetails;
    }
  }

  selectValueFromPopup(e: any, parInx, childInx): any {
    this.intakeOutputChartData[parInx]['chartData'][childInx] = e;
    this.updateChartDataDateWise(this.intakeOutputChartData[parInx]);
  }

  updateChartDataDateWise(chartData) {
    chartData.intakeIivFluidQtyTotal = 0;
    chartData.intakeRtFeedQtyTotal = 0;
    chartData.outputDrainQtyTotal = 0;
    chartData.outputRTQtyTotal = 0;
    chartData.outputUrineQtyTotal = 0;
    chartData.intakeTotal = 0;
    chartData.outputTotal = 0;
    chartData.outputFluidBalTotal = 0;
    _.each(chartData.chartData, (val: any, key: number) => {
      chartData.intakeIivFluidQtyTotal = (chartData.intakeIivFluidQtyTotal ? chartData.intakeIivFluidQtyTotal : 0) + (val.intakeIvFluidQty ? val.intakeIvFluidQty : 0);
      chartData.intakeRtFeedQtyTotal = (chartData.intakeRtFeedQtyTotal ? chartData.intakeRtFeedQtyTotal : 0) + (val.intakeRtFeedQty ? val.intakeRtFeedQty : 0);
      chartData.outputDrainQtyTotal = (chartData.outputDrainQtyTotal ? chartData.outputDrainQtyTotal : 0) + (val.outputDrainQty ? val.outputDrainQty : 0);
      chartData.outputRTQtyTotal = (chartData.outputRTQtyTotal ? chartData.outputRTQtyTotal : 0) + (val.outputRTQty ? val.outputRTQty : 0);
      chartData.outputUrineQtyTotal = (chartData.outputUrineQtyTotal ? chartData.outputUrineQtyTotal : 0) + (val.outputUrineQty ? val.outputUrineQty : 0);
    });
    chartData.intakeTotal = (chartData.intakeIivFluidQtyTotal ? chartData.intakeIivFluidQtyTotal : 0) + (chartData.intakeRtFeedQtyTotal ? chartData.intakeRtFeedQtyTotal : 0);
    chartData.outputTotal = (chartData.outputDrainQtyTotal ? chartData.outputDrainQtyTotal : 0)
      + (chartData.outputRTQtyTotal ? chartData.outputRTQtyTotal : 0)
      + (chartData.outputUrineQtyTotal ? chartData.outputUrineQtyTotal : 0);
    chartData.outputFluidBalTotal = chartData.intakeTotal - chartData.outputTotal;
    _.map(this.intakeOutputChartData, (val: any, key: number) => {
      if (moment(moment(chartData.chartDate).format('YYYY-MM-DD')).isSame(moment(val.chartDate).format('YYYY-MM-DD'))) {
        val = chartData;
      }
    });
    this.calculateAllDateSumData();
  }

  calculateAllDateSumData() {
    this.allDateTotalData = {
      intakeIivFluidQtyTotalAllDate: this.getSumOfTotal(this.intakeOutputChartData, 'intakeIivFluidQtyTotal'),
      intakeRtFeedQtyTotalAllDate: this.getSumOfTotal(this.intakeOutputChartData, 'intakeRtFeedQtyTotal'),
      intakeTotalAllDate: this.getSumOfTotal(this.intakeOutputChartData, 'intakeTotal'),
      outputRTQtyTotalAllDate: this.getSumOfTotal(this.intakeOutputChartData, 'outputRTQtyTotal'),
      outputUrineQtyTotalAllDate: this.getSumOfTotal(this.intakeOutputChartData, 'outputUrineQtyTotal'),
      outputDrainQtyTotalAllDate: this.getSumOfTotal(this.intakeOutputChartData, 'outputDrainQtyTotal'),
      outputTotalAllDate: this.getSumOfTotal(this.intakeOutputChartData, 'outputTotal'),
      outputFluidBalTotalAllDate: this.getSumOfTotal(this.intakeOutputChartData, 'outputFluidBalTotal')
    };
  }

  getSumOfTotal(array, key) {
    return (_.sumBy(array, key));
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }


}

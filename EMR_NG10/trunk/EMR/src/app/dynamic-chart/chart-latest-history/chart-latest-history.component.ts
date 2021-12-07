import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientChartService } from 'src/app/patient-chart/patient-chart.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { DynamicChartService } from '../dynamic-chart.service';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
@Component({
  selector: 'app-chart-latest-history',
  templateUrl: './chart-latest-history.component.html',
  styleUrls: ['./chart-latest-history.component.scss']
})
export class ChartLatestHistoryComponent implements OnInit {

  @Output() applyOrderToChart = new EventEmitter<any>();
  setAlertMessage: IAlert;
  patientId: any;
  chartData;
  patientObj: EncounterPatient;
  userInfo: any;
  userId: number;
  chartId: number;
  isHistoryLoad = false;
  allHistoryShow = false;
  historyData;
  sectionKeyArray = [
    'lab_investigation',
    'prescription',
    'radiology_investigation',
    'investigation',
    'allergies',
    'diagnosis',
    'complaints'
  ];
  selectedKeyArray = [];
  constructor(
    private activeRoute: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
    private dynamicChartService: DynamicChartService,
    private patientChartService: PatientChartService,
    private ngbModal: NgbModal,
  ) { }

  ngOnInit(): void {
    this.initCall();
  }

  initCall() {
    this.isHistoryLoad = false;
    this.chartId = this.dynamicChartService.getActiveChartInfo().chartId;
    this.chartData = this.patientChartService.getChartDetailsByChartId(this.chartId);;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.getpatientData();
    this.userId = +this.authService.getLoggedInUserId();
    // console.log(this.chartData);
    this.getHistoryData();
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  getHistoryData() {
    const parm = {
      patient_id: this.patientId,
      chart_id: this.chartId,
      section_keys: this.getSelectedSection()
    }
    this.patientChartService.getPatientChartHistory(parm).subscribe(res => {
      this.isHistoryLoad = true;
      this.historyData = res.data.length > 0 ? res.data : [];
      _.map(this.historyData, (d, i) => {
        d.isExpanded = i === 0 ? true : false;
      });
      // console.log(res);
    });
  }

  getSelectedSection() {
    const comp = _.filter(this.chartData.chart_details, d => {
      return _.includes(this.sectionKeyArray, d.section_key);
    });
    // console.log(comp);
    const keyAry = _.map(comp, d => {
      return d.section_key;
    });
    this.selectedKeyArray = keyAry;
    return keyAry;
  }

  applyToChart(item): void {
    const modalBodyobj = 'Do you want to override this Chart';
    const messageDetails = {
      modalTitle: 'Apply',
      modalBody: modalBodyobj
    };
    const modalInstance = this.ngbModal.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        const keys = Object.keys(item.chart_data);
        this.selectedKeyArray.forEach(k => {
          if (k === 'lab_investigation' || k === 'radiology_investigation' || k === 'investigation') {
            this.dynamicChartService.updateLocalChartData('investigation_detail', item.chart_data.investigation_detail, 'update');
          } else if (k === 'prescription') {
            this.dynamicChartService.updateLocalChartData('prescription_detail', item.chart_data.prescription_detail, 'update');
          } else if (k === 'allergies') {
            this.dynamicChartService.updateLocalChartData('allergy_detail', item.chart_data.allergy_detail, 'update');
          } else if (k === 'diagnosis') {
            this.dynamicChartService.updateLocalChartData('diagnosis_detail', item.chart_data.diagnosis_detail, 'update');
          } else if (k === 'complaints') {
            this.dynamicChartService.updateLocalChartData('complaint_detail', item.chart_data.complaint_detail, 'update');
          }
        });
        this.applyOrderToChart.emit();
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

}

import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientDasgboardTimelineFilterComponent } from '../patient-dasgboard-timeline-filter/patient-dasgboard-timeline-filter.component';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import * as _ from 'lodash';
import { PatientService } from 'src/app/public/services/patient.service';
import { PatientDashboardService } from 'src/app/patient/services/patient-dashboard.service';
import { AuthService } from 'src/app/public/services/auth.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { VitalsDataService } from 'src/app/public/services/vitals-data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DashboardFilesPopupComponent } from '../dashboard-files-popup/dashboard-files-popup.component';
import { PatientChartService } from 'src/app/patient-chart/patient-chart.service';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-patient-dasgboard-timeline',
  templateUrl: './patient-dasgboard-timeline.component.html',
  styleUrls: ['./patient-dasgboard-timeline.component.scss']
})
export class PatientDasgboardTimelineComponent implements OnInit, OnDestroy {

  patientObj: EncounterPatient;
  patientId: any;
  alertMsg: IAlert;
  dashboardDataList = null;
  vitalDataList = [];
  $destroy: Subject<boolean> = new Subject();
  public fileServePath = environment.FILE_SERVER_IMAGE_URL;
  setAlertMessage: IAlert;
  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private patientService: PatientService,
    private patientChartService: PatientChartService,
    private patientDashboardService: PatientDashboardService,
    private authService: AuthService,
    private vitalsDataService: VitalsDataService,
  ) { }

  ngOnInit(): void {
    this.getpatientData();
    this.subcriptionEvents();
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  openFIlter() {
    const modalInstance = this.modalService.open(PatientDasgboardTimelineFilterComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'visit-modal',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      if (result.type === 'update') {
        const sectionData = [];
        _.map(result.data, dt => {
          sectionData.push({
            sectionName: dt.sectionName,
            sectionKey: dt.sectionKey,
            sectionType: dt.sectionType,
            chartDetailIds: dt.chartDetailIds,
          })
        });
        this.getPatientDashboardData(sectionData);
        // console.log(result);
      }
    });
    modalInstance.componentInstance.messageDetails = null;
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
    this.getDashboardSectionSetting();
  }

  getDashboardSectionSetting() {
    const loginUser = this.authService.getUserInfoFromLocalStorage();
    const param = {
      userId: loginUser.user_id,
      key: ['dashboard_section_setting' + this.patientObj.type]
    };
    this.patientDashboardService.getUserSetting(param).subscribe(res => {
      const settingData = (res && res.length > 0 && res[0].value) ? res[0].value : [];
      if (typeof (settingData) !== 'string' && settingData.length > 0) {
        this.patientDashboardService.setFilterData(this.patientId, settingData);
        this.getPatientDashboardData(settingData);
      }
    });
  }

  getPatientDashboardData(sectionData) {
    const param = {
      service_type_id: this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo,
      sectionData: sectionData ? sectionData : []
    };
    this.patientService.getCustomPatientDashboardData(param).subscribe(res => {
      this.dashboardDataList = null;
      if (res) {
        this.createSectionData(res);
      }
    });
  }

  createSectionWiseDataArray(res) {
    const keysList = Object.keys(res);
    const dataArray = [];
    _.map(keysList, ky => {
      const obj = {
        sectionType: ky,
        data: [],
      }
      if (ky !== 'customTemplateDetail') {
        dataArray.push(this.generateSectionWiseSubData(res[ky], res, ky, obj));
      } else {
        obj.sectionType = ky + '_template_summary';
        dataArray.push(this.generateSectionWiseSubData(res[ky].template_summary, res, ky, obj));
        const obj1 = {
          sectionType: ky,
          data: [],
        }
        obj1.sectionType = ky + '_tabular_summary';
        dataArray.push(this.generateSectionWiseSubData(res[ky].tabular_summary, res, ky, obj1));
      }
    });
    this.dashboardDataList = dataArray;
    // console.log(dataArray);
  }

  generateSectionWiseSubData(resKy, res, ky, obj) {
    const nameWiseList = _.groupBy(resKy, 'section_name');
    _.map(nameWiseList, (n, k) => {
      const objSection = {
        sectionName: k,
        sectionData: []
      };
      const dateWiseList = _.groupBy(n, date => {
        return new Date(moment(date.consultation_date).format('YYYY-MM-DD'));
      });
      _.map(dateWiseList, (dt, key) => {
        let aryData = dt;
        if (ky === 'vitalsDetail' && res.vitalsDetail.length > 0) {
          aryData = this.vitalsDataService.getVitalsDisplay(dt, this.vitalDataList);
        }
        const objDate = {
          date: key,
          data: aryData
        };
        objSection.sectionData.push(_.cloneDeep(objDate));
      });
      obj.data.push(_.cloneDeep(objSection));
    });
    // dataArray.push(_.cloneDeep(obj));
    return obj;
  }

  createSectionData(res) {
    if (res.vitalsDetail.length > 0) {
      this.getAllVitalsDataList().then(dt => {
        this.createSectionWiseDataArray(res);
      });
    } else {
      this.createSectionWiseDataArray(res);
    }

  }

  getExtension(filename) {
    const parts = filename.split('.');
    return (parts[parts.length - 1]).toLowerCase();
  }

  openFile(data, type) {
    // console.log(data, type);
    const obj = {
      fileData: data,
      fileType: type
    }
    const modalInstance = this.modalService.open(DashboardFilesPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'visit-modal',
        container: '#homeComponent'
      });
    modalInstance.result.then((result) => {
      // console.log(result);
    });
    modalInstance.componentInstance.fileData = obj;
  }

  isSvgExist(dataList, svgName, svgType): boolean {
    let isExist;
    if (svgType === 'humanBody' || svgType === 'footExamine') {
      isExist = _.find(dataList, (o) => o.svg_name === svgName);
    } else {
      isExist = _.find(dataList, (o) => o.svg_type === svgType);
    }
    if (!_.isUndefined(isExist)) {
      return true;
    } else {
      return false;
    }
  }

  getAllVitalsDataList() {
    const promise = new Promise((resolve, reject) => {
      const loginUser = this.authService.getUserInfoFromLocalStorage();
      const param = {
        service_type_id: this.patientObj.serviceType.id,
        speciality_id: loginUser.speciality_id
      };
      this.vitalsDataService.getConsultationVitalsList(param).subscribe(res => {
        this.vitalDataList = res;
        _.map(this.vitalDataList, dt => {
          dt.vital.value = null;
          dt.isUsedInFormula = false;
          dt.tooltip = '';
          dt.color = null;
          dt.vitalFormulaId = null;
          if (dt.clubbedVital) {
            dt.clubbedVital.value = null;
            dt.clubbedVitalData.tooltip = '';
            dt.clubbedVitalData.color = null;
          }
        });
        resolve(res.data);
      });
    });
    return promise;
  }

  subcriptionEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }

  copyPrescription(prescription) {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    const chartList = this.patientChartService.getPrescriptionChartList(this.patientObj, userInfo, 'IP_NOTES');
    chartList.then(res => {
      if (res && res['length'] === 1) {
        // apply directly pprescription
        this.patientChartService.copyPrescriptionData(prescription, res, this.patientObj, userInfo).then(pres => {
          if (pres) {
            this.setAlertMessage = {
              message: 'Prescription Copied in Selected charts',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      } else if (res && res['length'] > 1) {
        // open Popup and show chart List
        this.patientChartService.openChartListPopupForApplyPrescription(res).then(chart => {
          if (chart && chart['length'] > 0) {
            this.patientChartService.copyPrescriptionData(prescription, chart, this.patientObj, userInfo).then(pres => {
              if (pres) {
                this.setAlertMessage = {
                  message: 'Prescription Copied in Selected charts',
                  messageType: 'success',
                  duration: Constants.ALERT_DURATION
                };
              }
            });
          }
        });
      } else if (res && res['length'] === 0) {
        // no chart List, show alert
        this.setAlertMessage = {
          message: 'No Chart Available',
          messageType: 'Danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }
}

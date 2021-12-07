import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultationService } from './../../../public/services/consultation.service';
import { IcutempdataService } from './../../../public/services/icutempdata.service';
import { OrderService } from './../../../public/services/order.service';
import { PublicService } from './../../../public/services/public.service';
import { AuthService } from './../../../public/services/auth.service';
import { PatientDashboardService } from '../../../patient/services/patient-dashboard.service';
import { Constants } from 'src/app/config/constants';
import { CommonService } from './../../../public/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IcuFlowSheetService } from './../../../public/services/icu-flow-sheet.service';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';

@Component({
  selector: 'app-icu-flow-sheet',
  templateUrl: './icu-flow-sheet.component.html',
  styleUrls: ['./icu-flow-sheet.component.scss']
})
export class IcuFlowSheetComponent implements OnInit, OnDestroy {
  userId: number;
  patientId: any;
  medicineDetails = [];
  selectedDate: Date;
  todayDate: Date;
  annotationImage: any;
  patientObj: EncounterPatient;
  patientDataObj: EncounterPatient;
  destroy$ = new Subject<any>();

  constructor(
    private router: Router,
    private consultationService: ConsultationService,
    private icutempdataservice: IcutempdataService,
    private route: ActivatedRoute,
    private patientDashboardService: PatientDashboardService,
    private orderService: OrderService,
    private publicService: PublicService,
    private authService: AuthService,
    private commonService: CommonService,
    private icuFlowSheetService: IcuFlowSheetService,
  ) { }

  patientVitals = [];
  vitalsList: Array<any> = this.icutempdataservice.vitalsList;
  date = null;
  timeList: Array<any> = [];
  ngOnInit() {
    this.getpatientData();
    this.userId = Constants.EMR_IPD_USER_DETAILS.docId; // this.authService.getUserId();
    this.selectedDate = new Date();
    this.icuFlowSheetService.setIcuFlowSheetSelectedDate(this.selectedDate);
    this.todayDate = new Date();
    this.patientVitals = this.icutempdataservice.icuTempData.vitalsSheetData;
    this.date = new Date();
    if (_.isUndefined(this.icutempdataservice.icuTempData.vitalsSheetData.length)) {
      this.patientVitals = this.icutempdataservice.icuTempData.vitalsSheetData['data'];
    } else {
      this.patientVitals = this.icutempdataservice.icuTempData.vitalsSheetData;
    }
    const PatientData = _.find(this.patientVitals, patientData => {
      return patientData.patientId.toString() === this.patientId.toString();
    });
    if (this.patientVitals.length === 0) {
      this.icutempdataservice.getVitalsSheetData().subscribe(dt => {
        this.patientVitals = dt.data;
        // .checkDataExist();
      });
    }
    for (let index = 0; index <= 9; index++) {
      const time = moment().subtract(index, 'hours').format('HH.00');
      this.timeList.push(time);
      this.timeList = _.orderBy(this.timeList, (o: any) => {
        if (o !== 'name') {
          return o;
        }
      }, ['asc']);
    }
    this.timeList.unshift('name');
    if (_.isUndefined(PatientData)) {
      this.checkDataExist();
    }
    this.ShowtVitalsData();
    this.getAnnotationImage();
    this.subcriptionOfEvents();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  scrollToElement($element): void {
    $element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  }

  checkDataExist() {
    const self = this;
    const SelectedDate = moment(new Date(self.date)).format('YYYY-MM-DD');
    const PatientData = _.find(self.patientVitals, patientData => {
      return patientData.patientId === self.patientId;
    });
    if (PatientData) {
      const findIndex = _.findIndex(PatientData.dateWiseVitals, findObj => {
        return findObj.date === SelectedDate;
      });
      if (findIndex !== -1) {
        this.ShowtVitalsData();
      } else {
        PatientData.dateWiseVitals.push({ 'date': SelectedDate, 'vitalsData': {} });
        const emptyVitalData = _.find(PatientData.dateWiseVitals, patientVData => {
          return patientVData.date === SelectedDate;
        });
        if (emptyVitalData) {
          _.map(self.timeList, tk => {
            if (tk !== 'name') {
              emptyVitalData.vitalsData[tk] = {};
              _.map(self.vitalsList, nk => {
                emptyVitalData.vitalsData[tk][nk.name] = '';
              });
            }
          });
        }
        this.ShowtVitalsData();
      }

    } else {
      self.patientVitals.push({ 'patientId': self.patientId, 'dateWiseVitals': [{ 'date': SelectedDate, 'vitalsData': self.icutempdataservice.dummyVitalData }] });
      const newPatientData = _.find(self.patientVitals, patientData => {
        return patientData.patientId === self.patientId;
      });
      const emptyVitalData = _.find(newPatientData.dateWiseVitals, patientVData => {
        return patientVData.date === SelectedDate;
      });
      // if (emptyVitalData) {
      //   _.map(self.timeList, tk => {
      //     if (tk !== 'name') {
      //       emptyVitalData.vitalsData[tk] = {};
      //       _.map(self.vitalsList, nk => {
      //         emptyVitalData.vitalsData[tk][nk.name] = '';
      //       });
      //     }
      //   });
      // }
      this.ShowtVitalsData();
    }

  }

  showAssessmentPage() {
    const appKey = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
    if (appKey === 'nursing') {
      this.router.navigate(['/nursingApp/nursing/patient/icu_flow_sheet/assessment_chart/', this.patientId]);
    } else {
      this.router.navigate(['/emr/patient/icu_flow_sheet/assessment_chart/', this.patientId]);
    }
  }

  ShowtVitalsData() {

    const self = this;
    const vitalNameKeys = this.getAllKeys();
    _.map(self.patientVitals, o => {
      if (self.patientId === o.patientId) {
        const SelectedDate = moment(new Date(self.date)).format('YYYY-MM-DD');
        const findVital = _.find(o.dateWiseVitals, findObj => {
          return findObj.date === SelectedDate;
        });
        const vitalsDate = moment(new Date(findVital.date)).format('YYYY-MM-DD');
        if (findVital) {
          const vitalTimeKeys = Object.keys(findVital.vitalsData);
          if (vitalTimeKeys.length > 0) {
            _.map(vitalTimeKeys, tk => {
              _.map(vitalNameKeys, nk => {
                const setObj = _.find(self.vitalsList, dispVitals => {
                  return dispVitals.name === nk;
                });
                if (_.isUndefined(findVital.vitalsData[tk][nk])) {
                  setObj[tk] = '';
                } else {
                  // if (setObj.type === 'string') {
                  //   setObj[tk] = '';
                  // } else {
                  setObj[tk] = findVital.vitalsData[tk][nk]; // !== '' ? findVital.vitalsData[tk][nk] : (Math.round(Math.random() * (150 - 10) + 10) + 10).toString();
                  // }
                }
              });
            });
          } else {
            _.map(self.timeList, tk => {
              if (tk !== 'name') {
                self.vitalsList = _.map(self.vitalsList, nk => {
                  nk[tk] = '';
                  return nk;
                });
              }
            });
          }
          self.vitalsList = _.cloneDeep(self.vitalsList);
        }
      }
    });
  }

  getAllKeys() {
    const keys = [];
    _.forEach(this.vitalsList, (value) => {
      keys.push(value.name);
    });
    return keys;
  }

  getColorCode(rangeObj, head) {
    let setColor = 'green';
    if (!_.isUndefined(head) && !_.isUndefined(rangeObj) && !_.isUndefined(rangeObj[head]) && rangeObj[head] !== '' && rangeObj.type !== 'string') {
      const val = +rangeObj[head];
      if (_.isUndefined(rangeObj['range'])) {
        return setColor;
      }
      const NormalMin = +rangeObj['range']['normal'].min;
      const NormalMax = +rangeObj['range']['normal'].max;
      const NormalColor = rangeObj['range']['normal'].color;
      const ModrateMin = +rangeObj['range']['modrate'].min;
      const ModrateMax = +rangeObj['range']['modrate'].max;
      const ModrateColor = rangeObj['range']['modrate'].color;
      const SevereMin = +rangeObj['range']['severe'].min;
      const SevereMax = +rangeObj['range']['severe'].max;
      const SevereColor = rangeObj['range']['severe'].color;

      if (val >= NormalMin && val <= NormalMax) {
        setColor = NormalColor;
      } else if (val >= ModrateMin && val <= ModrateMax) {
        setColor = ModrateColor;
      } else if (val >= SevereMin && val <= SevereMax) {
        setColor = SevereColor;
      }
    }
    return setColor;
  }

  redirectToVitalSheet() {
    let navigateURL = '/emr/patient/icu/icu_vital_sheet/';
    const appKey = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
    if (appKey === 'nursing') {
      navigateURL = '/nursingApp/nursing/patient/icu/icu_vital_sheet/';
    }
    this.router.navigate([navigateURL, this.patientId], { skipLocationChange: true, queryParams: { from: 'icu_flow_sheet' } });
  }

  redirectToVitalGraph() {
    let navigateURL = '/emr/patient/icu/icu_vital_graph/';
    const appKey = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
    if (appKey === 'nursing') {
      navigateURL = '/nursingApp/nursing/patient/icu/icu_vital_graph/';
    }
    this.router.navigate([navigateURL, this.patientId], { skipLocationChange: true, queryParams: { from: 'icu_flow_sheet' } });
  }

  getMedicineOrdersData() {
    this.patientDashboardService.getPatientDetailsByPatId(this.patientId).subscribe(r => {
      const params = {
        serviceTypeId: this.patientDataObj.serviceType.id,
        patientId: this.patientId,
        visitNo: this.patientDataObj.visitNo
      };
      this.orderService.getOrderDetailsByIpdId(params).subscribe(result => {
        const data = this.orderService.getOrderData('medicineOrders', true);
        this.medicineDetails = data;
      });
    });
  }

  updateSelectedDate(date, type) {
    // const sDate = moment(moment(this.selectedDate).format('YYYY-MM-DD'));
    // const tDate = moment(moment(this.todayDate).format('YYYY-MM-DD'));
    // if (sDate.isSame(tDate)) {

    // }
    if (type === 'add') {
      this.selectedDate = new Date(moment(date).add(1, 'day').format('YYYY-MM-DD'));
    } else {
      this.selectedDate = new Date(moment(date).subtract(1, 'day').format('YYYY-MM-DD'));
    }
    this.icuFlowSheetService.setIcuFlowSheetSelectedDate(this.selectedDate);
    this.getpatientData();
  }

  getAnnotationImage() {
    const reqParams = {
      userId: this.userId,
      patientId: this.patientId,
      ipdId: this.patientDataObj.visitNo,
      fileName: ''
    };
    this.publicService.getAnnotationImage(reqParams).subscribe(res => {
      this.annotationImage = res[0];
    });
  }

  // onBodyImage() {
  //   this.router.navigate(['dashboard/patientDashboard/imageAnotation/', 'ipd', this.patientId]);
  // }

  navigate(navigateURL) {
    const appKey = this.authService.getActiveAppKey() === 'EMR' ? 'emr' : 'nursing';
    if (appKey === 'nursing') {
      navigateURL = '/nursingApp/nursing/patient/icu_flow_sheet/' + navigateURL + '/';
    } else {
      navigateURL = '/emr/patient/icu_flow_sheet/' + navigateURL + '/';
    }
    this.router.navigate([navigateURL, this.patientId], { skipLocationChange: true, queryParams: { from: 'icu_flow_sheet' } });
  }

  getIcuFlowSheetData() {
    const param = {
      patient_id: this.patientId,
      opd_id: this.patientDataObj.visitNo,
      date: this.selectedDate,
      key: [
        Constants.icuFlowSheetHandOverParamLog,
        'events_references_pending_investigations',
        'special_instructions',
        'dialysis_orders',
        'references_visiting_consultant_advice',
        'plan_of_care',
        'cultures',
        'events',
        Constants.icuFlowSheetBslValue,
        Constants.icuFlowSheetSofaScore,
        Constants.icuFlowSheetPupilSize,
        Constants.icuFlowSheetPainScale,
        Constants.icuFlowSheetAssessmentChart,
      ],
    };
    this.icuFlowSheetService.getKeyWiseData(param).subscribe(res => {
      // console.log(res);
      this.patientObj = this.commonService.getLastActivePatient();
    });
  }

  getpatientData(patient?) {
    this.patientObj = null;
    this.patientDataObj = null;
    if (patient) {
      this.patientDataObj = patient;
    } else {
      this.patientDataObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientDataObj.patientData.id;
    this.getIcuFlowSheetData();
    this.getMedicineOrdersData();
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }

}

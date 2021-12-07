import { EncounterPatient } from './../../../public/models/encounter-patient.model';
import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MarMedicine } from './../../../public/models/mar-medicine';
import { environment } from 'src/environments/environment';
import { MarService } from '../../../patient/services/mar.service';
import { AuthService } from './../../../public/services/auth.service';
import { MedicineOrders } from './../../../public/models/medicine-orders';
import { CommonService } from './../../../public/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Constants } from 'src/app/config/constants';
import { IAlert } from './../../../public/models/AlertMessage';

@Component({
  selector: 'app-mar',
  templateUrl: './mar.component.html',
  styleUrls: ['./mar.component.scss']
})
export class MarComponent implements OnInit, OnDestroy, OnChanges {
  loadEditableChart: boolean;
  marData: {
    'medicineDetails': Array<MarMedicine>,
    'PatientId': string,
    'minDate': Date,
    'maxDate': Date,
    noOfDaysToContinue?: Array<{ day: string, date: string }>
  };
  medicineDays: any = [];
  completedDoses: any[];
  patientId: string;
  imageUrl = environment.IMG_PATH;
  medicineGivenTypeVal: string;
  medicineGivenTypeComment: string;
  selectedMedicine: any;
  selectedMedicineDay: any;
  selectedNoOfTimesInDay: any;
  todayDate: string;
  incompleteMedicineObjects: any = [];
  isFormDisable: boolean;
  user_roleType: string;

  alertMsg: IAlert;
  patientObj: EncounterPatient;
  dateCheckFormat: string;
  userInfo: any;
  destroy$ = new Subject<any>();
  chartOptionList = [];
  showButton: boolean;


  constructor(
    private marService: MarService,
    private commonService: CommonService,
    private modalService: NgbModal,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.dateCheckFormat = 'YYYY-MM-DD';
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.todayDate = moment().format('DD-MM-YYYY');
    this.user_roleType = _.toLower(this.userInfo.role_type);
    this.loadEditableChart = _.toLower(this.userInfo.role_type) !== 'nurse' ? false : true;
    this.showButton = true;
    this.getDataMarChart();
    this.subcriptionOfEvents();
  }

  ngOnChanges() {
    this.dateCheckFormat = 'YYYY-MM-DD';
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.todayDate = moment().format('DD-MM-YYYY');
    this.user_roleType = _.toLower(this.userInfo.role_type);
    this.loadEditableChart = _.toLower(this.userInfo.role_type) !== 'nurse' ? false : true;
    this.showButton = true;
    this.getDataMarChart();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getDataMarChart() {
    this.isFormDisable = !this.loadEditableChart;
    this.getpatientData();
    this.getMarChartAllOptionList();
    this.getMarChartData();
  }

  getPatientsMarDetails(marData?) {
    this.marService.getPatientsCompletedDoses(this.patientId).subscribe(result => {
      this.completedDoses = result;
      this.marService.getMarDetailsForPatients(this.patientId).subscribe(result => {
        result.medicineDetails.forEach((medicine: MarMedicine) => {
          if (!medicine.medicine.endDate) {
            medicine.medicine.endDate = medicine.addDaysToGivenDate(medicine.medicine.startDate, medicine.medicine.duration);
          }
          medicine.noOfDaysToContinue = this.getDatesBetweenStartAndEndDate(medicine.medicine.startDate, medicine.medicine.endDate)
          const completeDose = _.find(this.completedDoses, { patientId: this.patientId, medicineId: medicine.id })
          medicine.completedDoses = completeDose;
        });
        _.remove(result.medicineDetails, itr => {
          return (moment(moment(itr.medicine.endDate).format(this.dateCheckFormat)).isBefore(moment(moment().format(this.dateCheckFormat))))
        })
        this.marData = result;
        this.getMinMaxDate();
        this.marData.noOfDaysToContinue = this.getDatesBetweenStartAndEndDate(this.marData.minDate, this.marData.maxDate);
        if (marData) {
          this.updateMarChartData(marData);
        }
      });
    });
  }

  getMinMaxDate() {
    const medicines: Array<MarMedicine> = _.map(this.marData.medicineDetails, 'medicine');
    const startDates: Array<Date> = _.map(medicines, 'startDate');
    let endDates: Array<Date> = _.map(medicines, 'endDate');
    const minDate = _.min(startDates);
    if (!endDates[0]) {
      this.marData.medicineDetails.forEach((marMedicine: MarMedicine) => {
        marMedicine.medicine.endDate = marMedicine.addDaysToGivenDate(marMedicine.medicine.startDate, marMedicine.medicine.duration);
      });
    }
    endDates = _.map(medicines, 'endDate');
    // const minDate = _.min(startDates);
    const maxDate = _.max(endDates);
    this.marData.maxDate = maxDate;
    this.marData.minDate = minDate;
  }

  isDoseAlreadyGiven(medicineId, day, doseinDay) {
    // const medicines = _.map(this.marData.medicineDetails, 'medicine');
    const medicine = _.find(this.marData.medicineDetails, { id: medicineId });
    const dose = medicine.completedDoses && _.find(medicine.completedDoses.doseDetails, { 'doseInDay': doseinDay.time, 'medicineDay': day.date });
    if (dose) {
      return dose.admisterDetails.marCode;
    } else {
      return '';
    }
  }

  getPatientsCompletedDoses() {
    this.marService.getPatientsCompletedDoses(this.patientId).subscribe(result => {
      this.completedDoses = result;
    });
  }

  getMarChartAllOptionList() {
    this.marService.getMarChartOptionList().subscribe(result => {
      this.chartOptionList = result;
    });
  }

  getDatesBetweenStartAndEndDate(startDate, endDate) {
    const sDate = moment(startDate, 'DD-MM-YYYY');
    const eDate = moment(endDate, 'DD-MM-YYYY');

    const now = sDate;
    const dates: { day: string, date: string }[] = new Array<{ day: string, date: string }>();

    while (now.isBefore(eDate) || now.isSame(eDate)) {
      dates.push({ day: now.format('D'), date: now.format('DD-MM-YYYY') });
      now.add(1, 'days');
    }
    return dates;
  }

  updateDoes(medicine: MarMedicine, medicineDay, noOfTimesInDay, isValidDose: boolean, admisterDetails?) {
    if (isValidDose) {
      admisterDetails = _.isUndefined(admisterDetails) ? { 'marCode': 'T', 'commnet': '' } : admisterDetails;
      this.marService.updateMedicineDoseGivenToPatient(this.patientId, medicine.id,
        {
          'doseInDay': noOfTimesInDay.time,
          'medicineDay': medicineDay.date,
          'admisterDetails': admisterDetails
        }
      );
      this.getPatientsMarDetails();
    } else {
      return;
    }
  }

  isValidDoseDate(date: string, medicine: MarMedicine): boolean {
    if (_.find(medicine.noOfDaysToContinue, { date: date })) {
      return true;
    } else {
      return false;
    }
  }

  open(content, medicine, medicineDay, noOfTimesInDay) {
    this.selectedMedicine = medicine;
    this.selectedMedicineDay = medicineDay;
    this.selectedNoOfTimesInDay = noOfTimesInDay;
    this.medicineGivenTypeVal = 'T';
    this.medicineGivenTypeComment = '';
    if (medicine.completedDoses && medicine.completedDoses.doseDetails) {
      const admisterDoseDetails = _.find(medicine.completedDoses.doseDetails, { 'doseInDay': noOfTimesInDay.time, medicineDay: medicineDay.date });
      if (admisterDoseDetails) {
        this.medicineGivenTypeVal = admisterDoseDetails.admisterDetails.marCode;
        this.medicineGivenTypeComment = admisterDoseDetails.admisterDetails.commnet;
      }
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', keyboard: false, centered: true, windowClass: 'mar-medicine-model' }).result.then((result) => {

    }, (reason) => {

    });
  }

  applySelectedValToMedicine(medicine, medicineDay, noOfTimesInDay) {
    if (medicine.completedDoses && medicine.completedDoses.doseDetails) {
      let admisterDoseDetails = _.find(medicine.completedDoses.doseDetails, { 'doseInDay': noOfTimesInDay.time, medicineDay: medicineDay.date });
      if (admisterDoseDetails) {
        admisterDoseDetails.admisterDetails.marCode = this.medicineGivenTypeVal;
        admisterDoseDetails.admisterDetails.commnet = this.medicineGivenTypeComment;
      } else {
        this.updateDoes(medicine, medicineDay, noOfTimesInDay, true);
        admisterDoseDetails = _.find(medicine.completedDoses.doseDetails, { 'doseInDay': noOfTimesInDay.time, medicineDay: medicineDay.date });
        admisterDoseDetails.admisterDetails.marCode = this.medicineGivenTypeVal;
        admisterDoseDetails.admisterDetails.commnet = this.medicineGivenTypeComment;
      }
    } else {
      this.updateDoes(medicine, medicineDay, noOfTimesInDay, true);
      const admisterDoseDetails = _.find(medicine.completedDoses.doseDetails, { 'doseInDay': noOfTimesInDay.time, medicineDay: medicineDay.date });
      if (admisterDoseDetails) {
        admisterDoseDetails.admisterDetails.marCode = this.medicineGivenTypeVal;
        admisterDoseDetails.admisterDetails.commnet = this.medicineGivenTypeComment;
      }
    }
    this.modalService.dismissAll();
  }

  getpatientData(patient?) {
    this.patientObj = null;
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  getMarChartData() {
    const param = {
      patient_id: this.patientId,
      ipd_id: this.patientObj.visitNo,
      ongoing: this.loadEditableChart
    };
    this.marService.getPatientMarChartData(param).subscribe(result => {
      const patientMedicines = [];
      // if (result.medicineData.length <= 0) { return; }
      result.medicineData.forEach((medicineOrder: MedicineOrders) => {
        let medicineObj: MarMedicine = null;
        if (medicineOrder.invalidObjectMessage === '') {
          medicineObj = this.marService.generateMarMedicineObject(medicineOrder.medicineObj);
          if (medicineObj.isValid) {
            medicineObj.orderId = medicineOrder.id;
            medicineObj.orderTempId = medicineOrder.tempId;
            patientMedicines.push(medicineObj);
            this.marService.removeInvalidMedicines(this.patientId, medicineObj);
          }
        } else {
          medicineObj = new MarMedicine();
          medicineObj.generatInvalidObject(medicineOrder.medicineObj);
          medicineObj.orderId = medicineOrder.id;
          medicineObj.orderTempId = medicineOrder.tempId;
          // medicineOrder.medicineObj.generatInvalidObject(medicineOrder.medicineObj);
          this.marService.updateInvalidMarMedicines(this.patientId, medicineObj);
        }
      });
      this.incompleteMedicineObjects = this.marService.getIncompleteMedicineObjects(this.patientId);
      this.marService.setMarDetailsForPatients(this.patientId, patientMedicines);
      this.getPatientsMarDetails(result.resData);
    });
  }

  saveMarChartData() {
    const param = {
      patient_id: this.patientId,
      ipd_id: this.patientObj.visitNo,
      user_id: this.userInfo.user_id,
      mar_chart_data: this.generateSaveData(this.marData.medicineDetails)
    };
    this.marService.savePatientMarChartData(param).subscribe(res => {
      if (res) {
        this.alertMsg = {
          message: 'Chart Updated Successfully!',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  generateSaveData(marData) {
    const chartData = [];
    _.map(marData, md => {
      if (!_.isUndefined(md.completedDoses) && md.completedDoses.doseDetails.length > 0) {
        const cData = {
          medicine_order_detail_id: md.orderId,
          chart_date: null,
          freqData: []
        };
        _.map(md.completedDoses.doseDetails, dd => {
          cData.chart_date = moment(dd.medicineDay, 'DD-MM-YYYY').format(this.dateCheckFormat);
          const fData = {
            freq: dd.doseInDay,
            status: dd.admisterDetails.marCode,
            comment: dd.admisterDetails.commnet
          };
          cData.freqData.push(_.cloneDeep(fData));
        });
        chartData.push(_.cloneDeep(cData));
      }
    });
    return chartData;
  }

  updateMarChartData(marData) {
    _.map(this.marData.medicineDetails, chrtData => {
      const findChartData = _.find(marData, chrtFnd => {
        return chrtFnd.id === chrtData.orderId && chrtFnd.mar_chart_data.length > 0;
      });
      if (findChartData && _.isUndefined(chrtData.completedDoses)) {
        chrtData.completedDoses = {
          patientId: this.patientId,
          medicineId: chrtData.medicine.id,
          doseDetails: []
        };
        _.map(findChartData.mar_chart_data, cd => {
          _.map(cd.freqData, fd => {
            const fData = {
              doseInDay: fd.freq,
              medicineDay: moment(cd.chart_date).format('DD-MM-YYYY'),
              admisterDetails: {
                marCode: fd.status,
                commnet: fd.comment
              }
            };
            chrtData.completedDoses.doseDetails.push(fData);
            const medDay = {
              day: moment(cd.chart_date).format('DD'),
              date: moment(cd.chart_date).format('DD-MM-YYYY')
            };
            const noOfTmDay = _.find(chrtData.frequncyTime, fq => {
              return fq.time === fd.freq;
            });
            this.marService.updateMedicineDoseGivenToPatientOnLoad(this.patientId, chrtData.medicine.id,
              {
                'doseInDay': noOfTmDay.time,
                'medicineDay': medDay.date,
                'admisterDetails': fData.admisterDetails
              }
            );
          });
        });
      }
    });
  }

  getAllMedicineFlagUpdate() {
    this.loadEditableChart = false;
    this.showButton = false;
    this.getDataMarChart();
  }

  getOngoingMedicineFlagUpdate() {
    this.loadEditableChart = true;
    this.showButton = true;
    this.getDataMarChart();
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }

}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';
import { MarMedicine } from './../../public/models/mar-medicine';
import { Medicine } from './../../public//models/medicine';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MedicineOrders } from './../../public//models/medicine-orders';

@Injectable({
  providedIn: 'root'
})
export class MarService {
  medicineDosesGivenToPatients: any = [];
  medicineDetails: Array<MarMedicine> = [];
  incompleteMedicineDetails: [{ 'patientId': string, 'medicines': Array<MarMedicine> }] = [{
    'patientId': '',
    'medicines': Array<MarMedicine>()
  }];
  patientMedicalDetails: any = {
    'medicineDetails': [{
      patientId: '',
      medicineDetails: Array<MarMedicine>()
    }]
  };

  chartOptionList = [];

  constructor(
    private http: HttpClient
  ) { }

  getMarDetailsForPatients(patientId): Observable<any> {
    const patientMedicine = _.find(this.patientMedicalDetails.medicineDetails, { 'patientId': patientId });
    if (patientMedicine) {
      return of(patientMedicine);
    }
    return of(null);

  }


  setMarDetailsForPatients(patientId, marMedicineDetails: Array<MarMedicine>) {
    const patientMedicine = _.find(this.patientMedicalDetails.medicineDetails, { 'patientId': patientId });
    if (patientMedicine) {
      patientMedicine.medicineDetails = marMedicineDetails;
    } else {
      this.patientMedicalDetails.medicineDetails.push({
        patientId: patientId,
        medicineDetails: marMedicineDetails
      });
    }
  }

  generateMarMedicineObject(medicine: Medicine) {
    return this.getMarMedicineObject(medicine);
  }

  getMarMedicineObject(medObject: Medicine) {
    // return medObject;
    const marMedicine = new MarMedicine();
    marMedicine.generateObject(medObject);
    return marMedicine;
    // if (marMedicine.isObjectValid(medObject)) {

    // } else {
    //   return marMedicine;
    // }
  }

  updateMedicineDoseGivenToPatient(patientId, medicineId, doseDetails) {
    const medicineDoseDetails = {
      'patientId': patientId,
      'medicineId': medicineId,
      'doseDetails': []
    };
    const patientMedicineDose = _.find(this.medicineDosesGivenToPatients, { 'patientId': patientId, 'medicineId': medicineId });
    if (patientMedicineDose) {
      const isPresent = _.find(patientMedicineDose.doseDetails, { doseInDay: doseDetails.doseInDay, medicineDay: doseDetails.medicineDay });
      if (isPresent) {
        _.remove(patientMedicineDose.doseDetails, { doseInDay: doseDetails.doseInDay, medicineDay: doseDetails.medicineDay })
      } else {
        patientMedicineDose.doseDetails.push(doseDetails);
      }
    } else {
      medicineDoseDetails.doseDetails.push(doseDetails);
      this.medicineDosesGivenToPatients.push(medicineDoseDetails);
    }
  }
  getPatientsCompletedDoses(patientId): Observable<any> {
    const patientMedicineDose = _.filter(this.medicineDosesGivenToPatients, (m) => m.patientId === patientId);
    return of(patientMedicineDose);
  }
  addDaysToGivenDate(date, daysToAdd) {
    const sDate = moment(date, 'DD-MM-YYYY');
    sDate.add(daysToAdd, 'days');
    return sDate;
  }
  getDatesBetweenStartAndEndDate(startDate, endDate) {
    const sDate = moment(startDate, 'DD-MM-YYYY');
    const eDate = moment(endDate, 'DD-MM-YYYY');

    const now = sDate;
    const dates = [];

    while (now.isBefore(eDate) || now.isSame(eDate)) {
      dates.push(now.format('D'));
      now.add(1, 'days');
    }
    return dates;
  }
  convertFrequencyToMar(medicine: any) {
    const frequency = medicine.FreqSchedule !== '' ? medicine.FreqSchedule : medicine.genericFreq;
    const splitFre = frequency.indexOf('-') > -1 ? frequency.split('-') : frequency;
    const doseFre = [];
    const onlyNumber = [];
    if (splitFre.length > 1) {
      splitFre.forEach((fre, index) => {
        if (!isNaN(fre)) {
          onlyNumber.push(fre);
        }

      });
      onlyNumber.forEach((no, index) => {
        if (no === 1) {
          const obj = { color: this.getColor(index + 1), 'time': index + 1 };
          doseFre.push(obj);
        }
      });
    }
    return doseFre;
  }

  getColor(index) {
    if (index === 1) {
      return 'orange';
    } else if (index === 2) {
      return 'blue';
    } else if (index === 3) {
      return 'green';
    } else if (index === 4) {
      return 'lightblue';
    } else if (index === 5) {
      return 'pink';
    } else if (index === 6) {
      return 'yellow';
    } else if (index === 7) {
      return 'purple';
    } else if (index === 8) {
      return 'pink';
    } else if (index === 9) {
      return 'limeyellow';
    }
  }
  convertDurationToDays(duration) {
    const days = !isNaN(duration) ? (duration * 1) : null;
    if (days != null) {
      return days;
    }
    // const durationText = duration.toLowerCase();
    const durationSplit: any = duration.split(' ');
    if (isNaN(durationSplit[0])) {
      return 1;
    }
    if (durationSplit.length > 1 && !(durationSplit[1].length > 1)) {
      return 1;
    }
    const duration_splt = durationSplit[0];
    const timeFrame = durationSplit[1].toLowerCase();

    switch (timeFrame) {
      case 'days' || 'day':
        return duration_splt;
      case 'week' || 'weeks':
        return duration_splt * 7;
      case 'year' || 'years':
        return duration_splt * 365;
      case 'month' || 'months':
        return duration_splt * 30;
      default:
        return 1;
    }
  }
  getColorForFrequency(noOfTImes) {

  }
  getIncompleteMedicineObjects(patientId: string) {
    return _.find(this.incompleteMedicineDetails, { patientId: patientId }) ? _.find(this.incompleteMedicineDetails, { patientId: patientId }).medicines : [];
  }
  updateInvalidMarMedicines(patientId: string, medicine: MarMedicine) {
    const patient: { 'patientId': string, 'medicines': Array<MarMedicine> } = _.find(this.incompleteMedicineDetails, { patientId: patientId });
    if (!patient) {
      this.incompleteMedicineDetails.push({ 'patientId': patientId, medicines: [medicine] });
    } else {
      const med = _.find(patient.medicines, { id: medicine.id });
      if (!med) {
        patient.medicines.push(medicine);
      }
    }
  }
  removeInvalidMedicines(patientId: string, medicine: MarMedicine) {
    const patient: { 'patientId': string, 'medicines': Array<MarMedicine> } = _.find(this.incompleteMedicineDetails, { patientId: patientId });
    if (patient) {
      const med = _.find(patient.medicines, { id: medicine.id });
      if (med) {
        _.remove(patient.medicines, { id: medicine.id })
      }
    }
  }

  getPatientMarChartData(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/MarChart/GetPatientMarChartData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          const data = {
            medicineData: this.generateMedicineObject(res.data),
            resData: res.data
          };
          return data;
          // return res.data;
        } else {
          const data = {
            medicineData: [],
            resData: []
          };
          return data;
        }
      })
    );
  }

  savePatientMarChartData(param: any): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/MarChart/SavePatientMarChartData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
          return res.data;
        } else {
          return false;
        }
      })
    );
  }

  generateMedicineObject(data) {
    const list = [];
    _.map(data, dt => {
      const medcine = new MedicineOrders();
      medcine.generateObject(dt);
      list.push(medcine);
    });
    return list;
  }

  updateMedicineDoseGivenToPatientOnLoad(patientId, medicineId, doseDetails) {
    const medicineDoseDetails = {
      'patientId': patientId,
      'medicineId': medicineId,
      'doseDetails': []
    };
    const patientMedicineDose = _.find(this.medicineDosesGivenToPatients, { 'patientId': patientId, 'medicineId': medicineId });
    if (patientMedicineDose) {
      patientMedicineDose.doseDetails.push(doseDetails);
    } else {
      medicineDoseDetails.doseDetails.push(doseDetails);
      this.medicineDosesGivenToPatients.push(medicineDoseDetails);
    }
  }

  getMarChartOptionList(): Observable<any> {
    const reqUrl = environment.dashboardBaseURL + '/MarChart/GetMarChartStatusList';
    if (this.chartOptionList.length > 0) {
      return of(this.chartOptionList);
    } else {
      return this.http.get(reqUrl).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.status_message === 'Success' && res.data) {
            this.chartOptionList = res.data;
            return res.data;
          } else {
            return false;
          }
        })
      );
    }
  }

}

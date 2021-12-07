
import * as moment from 'moment';
import { Medicine } from './medicine';
import * as _ from 'lodash';
export class MarMedicine {
  id: any;
  medicine: Medicine;
  frequncyTime?: Array<{ color: string, time: number }>;
  noOfDaysToContinue?: Array<{ day: string, date: string }>;
  completedDoses: any[];
  isExpanded: boolean;
  isValid: boolean;
  orderTempId: number;
  orderId: number;

  constructor() {
    this.medicine = new Medicine();
  }

  isObjectValid(obj: any) {
    return this.isValid = this.medicine.isObjectValid(obj);
    // return this.isValid = obj.hasOwnProperty('medicineId') ? obj.hasOwnProperty('medicineName') ? obj.hasOwnProperty('startDateTime') ?
    //     ((obj.hasOwnProperty('FreqSchedule') && obj.FreqSchedule !=== '') || (obj.hasOwnProperty('genericFreq') && obj.genericFreq !=== '')) ?
    //         obj.hasOwnProperty('ShortName') ? (obj.hasOwnProperty('genericDuration') && obj.genericDuration !=== '') ? true : false : false : false : false : false : false;

  }
  generateObject(obj: any): void {
    this.medicine = obj;
    this.isValid = true;
    // this.medicine.generateObject(obj);
    this.id = this.medicine.id;
    this.convertFrequencyToMar(obj);
    this.isExpanded = true;
    this.orderId = null;
    this.orderTempId = null;
  }
  generatInvalidObject(obj: any) {
    this.medicine.generatInvalidObject(obj);
    this.id = this.medicine.id;
    // if (obj.hasOwnProperty('medicineId') && obj.hasOwnProperty('medicineName')) {
    //     this.id = obj.medicineId;
    //     this.name = obj.medicineName;
    // }
  }
  convertFrequencyToMar(medicine: any): void {
    const frequency = medicine.frequencySchedule !== '' ? medicine.frequencySchedule : medicine.frequency;
    const splitFre = frequency.indexOf('-') > -1 ? frequency.split('-') : frequency;
    const doseFre: { color: string, time: number }[] = new Array<{ color: string, time: number }>();
    const onlyNumber = [];
    if (splitFre.length > 1 && isNaN(splitFre)) {
      splitFre.forEach((fre) => {
        if (!isNaN(fre)) {
          onlyNumber.push(fre);
        }
      });
      onlyNumber.forEach((no, index) => {
        if (_.toNumber(no) === 1) {
          const obj = { color: this.getColor(index + 1), 'time': index + 1 };
          doseFre.push(obj);
        }
      });
    } else {
      for (let i = 0; i < splitFre; i++) {
        const obj = { color: this.getColor(i + 1), 'time': i + 1 };
        doseFre.push(obj);
      }
    }
    this.frequncyTime = doseFre;
  }

  getColor(index: number): string {
    if (index === 1) {
      return '#ffc107'; // orang
    } else if (index === 2) {
      return '#007bff'; // blue
    } else if (index === 3) {
      return '#20c997'; // green
    } else if (index === 4) {
      return '#93dbf3'; // lightblue
    } else if (index === 5) {
      return '#ffd9df'; // pink
    } else if (index === 6) {
      return '#ffe082'; // yellow
    } else if (index === 7) {
      return '#bb0bbb'; // purple
    } else if (index === 8) {
      return '#17a2b8'; // cyan
    } else if (index === 9) {
      return '#ff5969'; // red
    } else if (index === 10) {
      return '#6c757d'; // Grey
    } else if (index === 11) {
      return '#49a9a0'; // green shade
    } else if (index === 11) {
      return '#6c757d'; // Dark Grey
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

  addDaysToGivenDate(date, daysToAdd): Date {
    const sDate = moment(date, 'DD-MM-YYYY');
    sDate.add(daysToAdd, 'days');
    return sDate.toDate();
  }


}

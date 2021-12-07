
import * as moment from 'moment';
import { IMedicineTypes } from './iprescription';
import { MedicineSig } from './medicine-sig';
import { MedicineRoute } from './medicine-route';

export class Medicine {
  name: string;
  id: string;
  startDate: Date;
  endDate?: Date;
  dose: any;
  frequency: string;
  type: IMedicineTypes;
  sig?: MedicineSig;
  instruction?: string;
  duration: number;
  route: MedicineRoute;
  genricName: string;
  frequencySchedule: string; // ex - 1-0-1
  isObjGenerated?: boolean;
  isValid?: boolean;
  freqStartTime?: string;
  mealTypeInstruction?: string;
  languageId?: string;
  isFav: boolean;
  constructor(name?: string, id?: string, startDate?: Date, endDate?: Date, dose?: string, frequency?: string, type?: IMedicineTypes, sig?: MedicineSig,
              instruction?: string, duration?: number, route?: MedicineRoute, genricName?: string, frequencySchedule?: string, valid?: boolean, freqStartTime?: string, mealTypeInstruction?: string,
              languageId?: string, isFav?: boolean) {
    this.name = name;
    this.id = id;
    this.startDate = startDate;
    this.endDate = this.addDaysToGivenDate(startDate, 3);
    this.dose = dose;
    this.frequency = frequency || '1';
    this.type = type;
    this.sig = sig;
    this.instruction = instruction;
    this.duration = duration;
    this.route = route;
    this.genricName = genricName;
    this.frequencySchedule = frequencySchedule;
    this.isValid = valid;
    this.freqStartTime = freqStartTime;
    this.mealTypeInstruction = mealTypeInstruction;
    this.languageId = languageId || '1';
    this.isFav = isFav;
  }

  isObjectValid(obj: any) {
    if (!obj) { return; }
    this.isObjGenerated = this.isModelKeysAreExist(obj);
    this.isValid = (obj['id']) && (obj['Name'] || obj['name']) ? true : false;
    return obj.hasOwnProperty('id') && (obj.hasOwnProperty('Name') || obj.hasOwnProperty('name')) ? true : false;

    // const isTrue = obj['id'] && (obj['Name'] || obj['name']) && obj['duration'] ? true : false;
    // const stat = obj.hasOwnProperty('id') && obj.hasOwnProperty('Name') && obj.hasOwnProperty('MedicineTypeID') && obj.hasOwnProperty('duration') ? true : false;
    // this.isValid = !!(isTrue && stat);
    // return stat;

  }

  generateObject(obj: any, fromWhere?: string): any {
    let sDate = new Date();
    if (obj.startDateTime) {
      sDate = new Date(obj.startDateTime);
    } else if (obj.startDate) {
      sDate = new Date(obj.startDate);
    }
    this.id = obj.id;
    this.name = (obj.medicineName || obj.Name || obj.name);
    this.type = fromWhere ? obj.medicineType : obj.type ? new IMedicineTypes(obj.type.id, obj.type.shortName, obj.type.name, obj.type.doseUnit) : null;
    // this.type = (obj.ShortName !=== '' ? obj.ShortName : obj.medicineTypeName) || obj.medicineType;
    this.genricName = (obj.genricName || obj.genric_name);
    this.sig = obj.sig ? new MedicineSig(obj.sig.id, obj.sig.sig) : null;
    this.instruction = obj.genericRemarks || null;
    this.duration = (obj.genericDuration && obj.genericDuration.duration ? obj.genericDuration.duration : null) || obj.duration || 1;
    this.route = obj.route ? new MedicineRoute(obj.route.id, obj.route.name) : null;
    this.dose = obj.dose || null;
    this.startDate = sDate;
    this.frequencySchedule = (obj.FreqSchedule || obj.frequencySchedule) ? (obj.FreqSchedule || obj.frequencySchedule) : '1-0-0';
    this.endDate = this.startDate && obj.duration ? this.addDaysToGivenDate(this.startDate, (obj.duration - 1)) : null;
    this.frequency = obj.frequency || '1';
    this.isValid = (this.id && this.name && this.type) ? true : false;
    this.freqStartTime = obj.freqStartTime || '08:00 AM';
    this.mealTypeInstruction = obj.mealTypeInstruction || obj.meal_type_instruction || '';
    this.languageId = obj.language_id || '1';
    this.isFav = obj.suggestion_flag && obj.suggestion_flag === 'user_fav' ? true : false;
  }

  generatInvalidObject(obj: any) {
    if (obj.hasOwnProperty('medicineId') && obj.hasOwnProperty('medicineName')) {
      this.id = obj.medicineId;
      this.name = obj.medicineName;
    } else if (obj.hasOwnProperty('id') && obj.hasOwnProperty('name')) {
      this.id = obj.id;
      this.name = obj.name;
    }
  }

  addDaysToGivenDate(date, daysToAdd): Date {
    const sDate = moment(date, 'DD-MM-YYYY');
    sDate.add(daysToAdd, 'days');
    return sDate.toDate();
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

  isModelKeysAreExist(obj): boolean {
    if (!obj) { return; }
    const props = Object.keys(obj);
    for (const o of props) {
      if (!(new Medicine()).hasOwnProperty(o) && !(o === 'isObjGenerated')) { return false; }
    }
    return true;
  }
}

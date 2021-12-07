import { MedicineGenericFrequencyMaster } from './medicine-frequency-master.model';
import { MedicineSig } from './medicine-sig';
import { MedicineDoseUnitMaster } from './medicine-dose-unit-master.model';
import { MedicineRoute } from './medicine-route';
import { MedicineGenericRemarkMaster } from './medicine-generic-remark-master.model';
import { MedicineLanguageMaster } from './medicine-language-master.model';
import { Medicine } from './medicine';
import { PrescriptionViewType } from '../enums/prescription-view-type.enum';

export class PatientPrescriptionData {
    // medicine Type
    typeId: Number;
    typeName: String;
    typeShortName: String;
    // medicine name
    medicineName: String;
    genricName: String;
    medicineId: Number;
    medicineNameObj: Medicine;
    // medicine view type
    doseViewType: PrescriptionViewType;
    // Remark / Instruction
    genericRemarks: MedicineGenericRemarkMaster;
    genericRemarksEnglish: String;
    genericRemarksHindi: String;
    genericRemarksMarathi: String;
    instruction: String;
    instructionsEnglish: String;
    instructionsHindi: String;
    instructionsMarathi: String;
    instrOverwrite: Boolean;
    // BLD Time
    morningTime: String;
    morningVal: String;
    lunchTime: String;
    lunchVal: String;
    dinnerTime: String;
    dinnerVal: String;
    // Dose
    genericDose: any;
    dosage: String;
    dosageUnit: MedicineDoseUnitMaster;
    // Freq
    genericFreq: MedicineGenericFrequencyMaster;
    freq: String;
    freqSchedule: String;
    // Duration
    genericDuration: any;
    duration: Number;
    // Tappring
    tapering: Boolean;
    taperedFromDate: Date;
    taperedToDate: Date;
    // other Val
    sig: MedicineSig;
    route: MedicineRoute;
    selectedLanguage: MedicineLanguageMaster;
    quantity: Number;
    administrate: Boolean;

    isObjectValid(obj: any, type: PrescriptionViewType) {
        if (type == 0) {
            return obj.hasOwnProperty('typeId')
                && obj.hasOwnProperty('typeShortName')
                && obj.hasOwnProperty('typeName')
                && obj.hasOwnProperty('medicineName')
                && obj.hasOwnProperty('medicineId')
                && obj.hasOwnProperty('genricName')
                && obj.hasOwnProperty('medicineNameObj')
                && obj.hasOwnProperty('duration')
                && obj.hasOwnProperty('dosage')
                && obj.hasOwnProperty('dosageUnit')
                && obj.hasOwnProperty('morningTime')
                && obj.hasOwnProperty('morningVal')
                && obj.hasOwnProperty('lunchTime')
                && obj.hasOwnProperty('lunchVal')
                && obj.hasOwnProperty('dinnerTime')
                && obj.hasOwnProperty('dinnerVal')
                && obj.hasOwnProperty('instructionsEnglish')
                && obj.hasOwnProperty('instructionsHindi')
                && obj.hasOwnProperty('instructionsMarathi')
                && obj.hasOwnProperty('instruction') ? true : false;
        } else if (type == 1) {
            return obj.hasOwnProperty('typeId')
                && obj.hasOwnProperty('typeShortName')
                && obj.hasOwnProperty('typeName')
                && obj.hasOwnProperty('medicineName')
                && obj.hasOwnProperty('medicineId')
                && obj.hasOwnProperty('genricName')
                && obj.hasOwnProperty('medicineNameObj')
                && obj.hasOwnProperty('duration')
                && obj.hasOwnProperty('dosage')
                && obj.hasOwnProperty('dosageUnit')
                && obj.hasOwnProperty('morningTime')
                && obj.hasOwnProperty('morningVal')
                && obj.hasOwnProperty('lunchTime')
                && obj.hasOwnProperty('lunchVal')
                && obj.hasOwnProperty('dinnerTime')
                && obj.hasOwnProperty('dinnerVal')
                && obj.hasOwnProperty('instructionsEnglish')
                && obj.hasOwnProperty('instructionsHindi')
                && obj.hasOwnProperty('instructionsMarathi')
                && obj.hasOwnProperty('instruction') ? true : false;
        } else if (type == 2) {
            return obj.hasOwnProperty('typeId')
                && obj.hasOwnProperty('typeShortName')
                && obj.hasOwnProperty('typeName')
                && obj.hasOwnProperty('medicineName')
                && obj.hasOwnProperty('medicineId')
                && obj.hasOwnProperty('genricName')
                && obj.hasOwnProperty('medicineNameObj')
                && obj.hasOwnProperty('quantity')
                && obj.hasOwnProperty('freq')
                && obj.hasOwnProperty('freqSchedule')
                && obj.hasOwnProperty('duration')
                && obj.hasOwnProperty('dosage')
                && obj.hasOwnProperty('dosageUnit')
                && obj.hasOwnProperty('dinnerVal')
                && obj.hasOwnProperty('instructionsEnglish')
                && obj.hasOwnProperty('instructionsHindi')
                && obj.hasOwnProperty('instructionsMarathi')
                && obj.hasOwnProperty('instruction') ? true : false;
        }
    }

    generateObject(obj: any) {
        // medicine Type
        this.typeId = obj.typeId;
        this.typeName = obj.typeName;
        this.typeShortName = obj.typeShortName;
        // medicine name
        this.medicineName = obj.medicineName;
        this.genricName = obj.genricName;
        this.medicineId = obj.medicineId;
        this.medicineNameObj = obj.medicineNameObj;
        // medicine view type
        this.doseViewType = obj.doseViewType;;
        // Remark / Instruction
        this.genericRemarks = obj.genericRemarks;
        this.genericRemarksEnglish = obj.genericRemarksEnglish;
        this.genericRemarksHindi = obj.genericRemarksHindi;
        this.genericRemarksMarathi = obj.genericRemarksMarathi;
        this.instruction = obj.instruction;
        this.instructionsEnglish = obj.instructionsEnglish;
        this.instructionsHindi = obj.instructionsHindi;
        this.instructionsMarathi = obj.instructionsMarathi;
        this.instrOverwrite = obj.instrOverwrite;
        // BLD Time
        this.morningTime = obj.morningTime;
        this.morningVal = obj.morningVal;
        this.lunchTime = obj.lunchTime;
        this.lunchVal = obj.lunchVal;
        this.dinnerTime = obj.dinnerTime;
        this.dinnerVal = obj.dinnerVal;
        // Dose
        this.genericDose = obj.genericDose;
        this.dosage = obj.dosage;
        this.dosageUnit = obj.dosageUnit;
        // Freq
        this.genericFreq = obj.genericFreq;
        this.freq = obj.freq;
        this.freqSchedule = obj.freqSchedule;
        // Duration
        this.genericDuration = obj.genericDuration;
        this.duration = obj.duration;
        // Tappring
        this.tapering = obj.tapering;
        this.taperedFromDate = obj.taperedFromDate;
        this.taperedToDate = obj.taperedToDate;
        // other Val
        this.sig = obj.sig;
        this.route = obj.route;
        this.selectedLanguage = obj.selectedLanguage;
        this.quantity = obj.quantity;;
        this.administrate = obj.administrate;
    }
}

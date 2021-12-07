import { MedicineSig } from './medicine-sig';

export class MedicineMasterData {
  sig: MedicineSig[];
  doseUnit: {id: number; dose_unit: string; }[];
  remark_hindi?: any[];
  remark_marathi?: any[];
  frequency: {id: number; frequency: string}[];
  duration: {id: number; duration: string}[];
  dose: {id: number; dose: string}[];
  route: {id: number; route: string}[];
  remark_english?: {id: number; remark: string}[];

  constructor() {}

  isObjectValid(obj: any) {
    return obj.hasOwnProperty('sig') ? obj.hasOwnProperty('doseUnit') ? obj.hasOwnProperty('remark_hindi') ?
        (obj.hasOwnProperty('remark_marathi') || obj.hasOwnProperty('frequency')) ?
            obj.hasOwnProperty('duration') ? obj.hasOwnProperty('dose') ? obj.hasOwnProperty('route') ?
             obj.hasOwnProperty('remark_english') ? true : false : false : false : false : false : false : false : false;
  }

}

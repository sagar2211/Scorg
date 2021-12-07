
export class Vitals {
  name: string;
  key: string;
  id: string;
  vitalType: string;
  clubbedVitalId: number;
  formulaVitalsId: number[];

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('vital_id')) && (obj.hasOwnProperty('vital_key')) &&
      (obj.hasOwnProperty('vital_name')) ? true : false;
  }

  generateObject(obj: any, isFromSuggestion?) {
    this.id = obj.vital_id || obj.id || null;
    this.key = obj.vital_key || obj.key || null;
    this.name = obj.vital_name || obj.name || null;
    this.clubbedVitalId = obj.clubbed_vital_id || obj.clubbedVitalId || null;
    this.formulaVitalsId = obj.formula_vitals_id || obj.formulaVitalsId || [];
    this.vitalType = obj.vital_type || obj.vitalType || null;
  }

}


export class VitalCategory {
  category: string;
  id: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('category_id')) && (obj.hasOwnProperty('category_name')) ? true : false;
  }

  generateObject(obj: any, isFromSuggestion?) {
    this.id = obj.category_id || obj.id || null;
    this.category = obj.category_name || obj.category || null;
  }

}

export class VitalMapped {
  vital: Vitals;
  id: number;
  sequence: number;
  clubbedVital: Vitals;
  isClubbed: boolean;
  isUsedInFormula: boolean;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('id')) && (obj.hasOwnProperty('sequence')) ? true : false;
  }

  generateObject(obj: any, isFromSuggestion?) {
    this.id = obj.id || null;
    this.sequence = obj.sequence || null;
    if (obj.vital) {
      this.vital = this.generateVitalObj(obj.vital);
    } else {
      this.vital = this.generateVitalObj(obj);
    }
    if (obj.isClubbed) {
      this.clubbedVital = this.generateVitalObj(obj.clubbedVital);
    } else {
      this.clubbedVital = null;
    }
    this.isClubbed = obj.isClubbed || false;
    this.isUsedInFormula = obj.isUsedInFormula || false;
  }

  generateVitalObj(obj) {
    const vtl = new Vitals();
    vtl.generateObject(obj);
    return vtl;
  }

}

export class VitalSave {
  vital_name: string;
  vital_id: number; // save transection id
  vital_text: any; // vital value
  chart_detail_id: number;

  generateObject(obj: any) {
    this.vital_id = obj.vital_id || null;
    this.vital_name = obj.vital_name;
    this.vital_text = obj.vital_text || null;
    this.chart_detail_id = obj.chart_detail_id || null;
  }

}

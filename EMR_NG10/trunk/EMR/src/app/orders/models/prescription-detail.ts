export class PrescriptionDetails {
  tran_id: number;
  type: {
    id: number,
    name: string
  };
  medicine: {
    id: number,
    medicine_name: string;
    generic_name: string
  };
  start_date: Date;
  end_date: Date;
  frequency: number;
  frequency_schedule: string;
  freq_start_time: string;
  meal_type_instruction: string;
  days: string;
  sig: {
    id: number,
    sig: string
  };
  dose: {
    id: number;
    dose: string
  };
  dose_unit: {
    id: number;
    dose_unit: string
  };
  route: {
    id: number;
    name: string
  };
  qty: string;
  language_id: number;
  instruction: {
    id: number;
    instruction: string
  };
  duration?: string;
}

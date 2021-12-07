import { DietOrder } from './diet-order';
import { LabOrders } from './lab-order';
import { MedicineOrders } from './medicine-orders';
import { NursingOrder } from './nursing-order';
import { RadiologyOrder } from './radiology-orders';

// -- store opd or ipd and order related values
export class PatientConsultationDetails {
  doctorId: number;
  patientId: number;
  locationId: number;
  ipdId: number;
  formData: Array<any>;
  medicineOrders: Array<MedicineOrders>;
  nursingOrders: Array<NursingOrder>;
  radiologyOrders: Array<RadiologyOrder>;
  labOrders: Array<LabOrders>;
  dietOrders: Array<DietOrder>;

  constructor(doctorId?: number, locationId?: number, patientId?: number, ipdId?: number) {
    this.doctorId = +doctorId;
    this.locationId = +locationId;
    this.patientId = +patientId;
    this.ipdId = ipdId;
    this.formData = [];
  }


}

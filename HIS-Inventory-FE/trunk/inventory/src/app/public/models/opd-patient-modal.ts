import { Patient } from './patient.model';
// import { QAppointments } from './../../qms/models/q-entity-appointment-details';
import { ServiceType } from './service-type.model';
// import { QAppointments } from '@qms/qlist-lib';

export class OpdPatient {
  patientData: Patient;
  type: string;
  serviceType: ServiceType;
  appointmentDate: string;
  appointmentId: number;
  isViewOnlyPat: boolean;

  generateObject(obj): void {
    this.patientData = this.generatePatientObj(obj);
    this.type = 'opd';
    this.appointmentDate = obj.appointment_date || null;
    this.appointmentId = obj.appointment_id || null;
    this.isViewOnlyPat = obj.is_view_only || null;
    this.serviceType = this.generateServiceObj({
        service_type_id : 2, display_name: 'OPD'
    });
  }

  generatePatientObj(obj): Patient {
    const patData = new Patient();
    patData.generateObject(obj);
    return patData;
  }

  generateServiceObj(obj): ServiceType {
    const service = new ServiceType();
    service.generateObject(obj);
    return service;
  }
}


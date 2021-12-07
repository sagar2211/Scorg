import { Entity } from './entity.model';
import { Doctor } from './doctor.model';
import { Service } from './service.model';
import { JointClinic } from './joint-clinic.model';
import { AppointmentType } from './appointment-type.model';
import { ScheduleType } from './schedule-type.model';
import { Speciality } from './speciality.model';

export class EntityBasicInfo {
    selectedEntity: Entity;
    selectedServiceProvider: Service;
    selectedDoctor: Doctor;
    selectedJointClinic: JointClinic;
    selectedAppointmentTypes: AppointmentType[];
    selectedScheduleType: ScheduleType;
    parallelBookingAllow: boolean;
    parallelBookingValue: number;
    advanceBookingDays: number;
    tokenValue: string;
    selectedSpeciality: Speciality;
    formId: number;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('selectedEntity')
            && obj.hasOwnProperty('selectedServiceProvider')
            && obj.hasOwnProperty('selectedDoctor')
            && obj.hasOwnProperty('selectedJointClinic')
            && obj.hasOwnProperty('selectedAppointmentTypes')
            && obj.hasOwnProperty('selectedScheduleType')
            && obj.hasOwnProperty('parallelBookingAllow')
            && obj.hasOwnProperty('parallelBookingValue')
            && obj.hasOwnProperty('advanceBookingDays')
            && obj.hasOwnProperty('selectedSpeciality')
            && obj.hasOwnProperty('tokenValue') ? true : false;
    }

    generateObject(obj: any) {
        this.selectedEntity = obj.selectedEntity;
        this.selectedServiceProvider = obj.selectedServiceProvider;
        this.selectedDoctor = obj.selectedDoctor;
        this.selectedJointClinic = obj.selectedJointClinic;
        this.selectedAppointmentTypes = obj.selectedAppointmentTypes;
        this.selectedScheduleType = obj.selectedScheduleType;
        this.parallelBookingAllow = obj.parallelBookingAllow;
        this.parallelBookingValue = obj.parallelBookingValue;
        this.tokenValue = obj.tokenValue;
        this.selectedSpeciality = obj.selectedSpeciality;
        this.advanceBookingDays = obj.advanceBookingDays;
        this.formId = obj.formId || null;
    }
}

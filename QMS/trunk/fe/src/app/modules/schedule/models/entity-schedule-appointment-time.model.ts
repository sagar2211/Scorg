import { AppointmentType } from './appointment-type.model';
import { WeekDays } from './week-days.model';

export class EntityScheduleAppointmentTime {
    appointmentType: AppointmentType;
    startTime: String;
    endTime: String;
    subFormStatus: Boolean;
    allowAppointments: Boolean;
    selectedDays: WeekDays[];
    formId: number;
    endTimeHoursList:string[]

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('appointmentType')
            && obj.hasOwnProperty('startTime')
            && obj.hasOwnProperty('endTime')
            && obj.hasOwnProperty('subFormStatus')
            && obj.hasOwnProperty('allowAppointments')
            && obj.hasOwnProperty('selectedDays') ? true : false;
    }

    generateObject(obj: any) {
        this.appointmentType = obj.appointmentType;
        this.startTime = obj.startTime;
        this.endTime = obj.endTime;
        this.subFormStatus = obj.subFormStatus;
        this.selectedDays = obj.selectedDays;
        this.allowAppointments = obj.allowAppointments;
        this.formId = obj.formId || null;
        this.endTimeHoursList = obj.endTimeHoursList || [];
    }
}

import { WeekDays } from './week-days.model';
import { EntityScheduleAppointmentTime } from './entity-schedule-appointment-time.model';

export class EntitySchedule {
    startDate: Date;
    endDate: Date;
    mainFormStatus: boolean;
    appointmentTypeTimeArray: EntityScheduleAppointmentTime[];
    weekOffDays: WeekDays[];
    formId: number;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('startDate')
            && obj.hasOwnProperty('endDate')
            && obj.hasOwnProperty('mainFormStatus')
            && obj.hasOwnProperty('appointmentTypeTimeArray')
            && obj.hasOwnProperty('weekOffDays') ? true : false;
    }

    generateObject(obj: any) {
        this.startDate = obj.startDate;
        this.endDate = obj.endDate;
        this.mainFormStatus = obj.mainFormStatus;
        this.appointmentTypeTimeArray = obj.appointmentTypeTimeArray;
        this.weekOffDays = obj.weekOffDays;
        this.formId = obj.formId || null;
    }
}

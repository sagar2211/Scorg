export class EntityRule {
    timePerPatient: number;
    appointmentTimeSlot: number;
    formId: number;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('timePerPatient')
            && obj.hasOwnProperty('appointmentTimeSlot') ? true : false;
    }

    generateObject(obj: any) {
        this.timePerPatient = obj.timePerPatient;
        this.appointmentTimeSlot = obj.appointmentTimeSlot;
        this.formId = obj.formId || null;
    }
}

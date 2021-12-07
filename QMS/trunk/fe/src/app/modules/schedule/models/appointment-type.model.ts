export class AppointmentType {
    id: number;
    name: string;
    isSelected: boolean;

    isObjectValid(obj: any) {
        return (obj.hasOwnProperty('appt_id') || obj.hasOwnProperty('id'))
            && (obj.hasOwnProperty('appt_name') || obj.hasOwnProperty('name')) ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.appt_id || obj.id || obj.Appt_id;
        this.name = obj.appt_name || obj.name || obj.Appt_Name;
        this.isSelected = obj.isSelected || false;
    }

}

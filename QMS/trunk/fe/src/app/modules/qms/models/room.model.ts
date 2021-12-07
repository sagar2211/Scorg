import * as _ from 'lodash';

export class Room {
    id: number;
    location: string;
    name: string;
    incharge: string;
    isActive: string;

    isObjectValid(obj: any) {
        return (obj.hasOwnProperty('room_id') || obj.hasOwnProperty('id'))
            && (obj.hasOwnProperty('room_name') || obj.hasOwnProperty('name')) ? true : false;
    }

    generateObject(obj: any) {
        this.id = obj.room_id || obj.id;
        this.name = obj.room_name || obj.name;
        this.location = obj.room_location || obj.location;
        this.incharge = obj.RoomIncharge || obj.incharge || null;
        this.isActive = !_.isUndefined(obj.room_isactive) ? obj.room_isactive : obj.isActiv;
    }

}

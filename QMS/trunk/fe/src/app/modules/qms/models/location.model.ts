import * as _ from 'lodash';

export class LocationModel {
  id: number;
  name: string;
  isActive: string;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('location_id') || obj.hasOwnProperty('id'))
    && (obj.hasOwnProperty('location_name') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.location_id || obj.id;
    this.name = obj.location_name || obj.name;
    this.isActive = !_.isUndefined(obj.is_active) ? obj.is_active : obj.isActiv;
  }

}

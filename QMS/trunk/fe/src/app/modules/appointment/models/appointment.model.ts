import * as _ from 'lodash';
import { AppointmentEntityInfoModel } from './appointment-entity-info.model';

export class AppointmentListModel {
  'config_id': number;
  'entity_id': number;
  'entity_name'?: string;
  'entity_value_id': number;
  'entity_value_name': string;
  'entity_data'?: Array<AppointmentEntityInfoModel> | AppointmentEntityInfoModel;
  'time_subdetail_id': string;
  'token_type': string;
  'default_time_per_patient': number;
  // added for Parallel Booking
  'parallel_booking_allow': boolean;
  'parallel_max_patients': number;
  'slot_id': number;
  generateObj(obj) {
    this.config_id = obj.config_id;
    this.entity_id = obj.entity_id;
    this.entity_name = obj.entity_name;
    this.entity_value_id = obj.entity_value_id;
    this.entity_value_name = obj.entity_value_name;
    this.entity_data = (obj.appt_type_details || obj.slot_details) ? this.generateEntityData(obj.appt_type_details || obj.slot_details) : [];
    this.time_subdetail_id = obj.time_subdetail_id;
    this.token_type = obj.token_type;
    this.default_time_per_patient = obj.default_time_per_patient;
    this.parallel_booking_allow = obj.is_allow_booking || false;
    this.parallel_max_patients = obj.max_allow_booking || 0;
    this.slot_id = obj.slot_id;
  }

  generateEntityData(list) {
    list = _.isArray(list) ? list : [list];
    const temp = [];
    list.forEach(element => {
      const appEntityObj = new AppointmentEntityInfoModel();
      appEntityObj.generateObj(element);
      temp.push(appEntityObj);
    });
    return temp;
  }
}

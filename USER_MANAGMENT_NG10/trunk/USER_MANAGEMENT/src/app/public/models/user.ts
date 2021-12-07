import { Applicationlist } from './applicationlist';
import { DoctorCodes } from './doctor-codes';
import { Roles } from './roles';
import * as moment from 'moment';

export class User {
   // tslint:disable-next-line: ban-types
   'id': number;
   'title_id': number;
   'name': string;
   'user_id': number;
   'email': string;
   'role_name': string;
   'mobile_number': number;
   'is_active': boolean;
   'status': string;
   'created_on': string;
   'first_name': string;
   'middle_name': string;
   'last_name': string;
   'alternate_number': number;
   'role_type_id': number;
   'primary_role': number;
   'primary_role_name': string;
   'specialty_id': number;
   'login_id': string;
   'specialty_name': string;
   'applications_list': Applicationlist[];
   'additional_privileges_list': Array<Roles>;
   'assigned_doctors_list': Array<DoctorCodes>;
   'user_gender': string;
   'is_deleted': boolean;
   'role_type_name': string;
   'created_by': string;
   'user_department': string;
   'user_designation': string;
   'default_application_name': string;

   isObjectValid(obj: any) {
     return  obj.hasOwnProperty('user_id')
       && obj.hasOwnProperty('email')
       && obj.hasOwnProperty('role_name')
       && obj.hasOwnProperty('mobile_number') ? true : false;
   }

   generateObject(obj: any) {
     this.id = obj.id ? obj.id : '';
     this.title_id = obj.title_id;
     this.name = obj.name ? obj.name : obj.first_name + ' ' + obj.middle_name + ' ' + obj.last_name;
     this.user_id = obj.user_id;
     this.email = obj.email;
     this.mobile_number = obj.mobile_number;
     this.is_active = obj.is_active;
     this.status = obj.status;
     this.created_on = obj.created_on ? obj.created_on : moment().format('DD/MM/YYYY');
     this.first_name = obj.first_name;
     this.middle_name = obj.middle_name;
     this.last_name =  obj.last_name;
     this.alternate_number = obj.alternate_number;
     this.login_id = obj.login_id;
     this.primary_role = obj.primary_role;
     this.primary_role_name = obj.primary_role_name;
     this.role_type_id = obj.role_type_id;
     this.role_name = obj.role_name;
     this.specialty_id = obj.specialty_id;
     this.specialty_name = obj.specialty_name;
     this.applications_list = obj.applications_list;
     this.additional_privileges_list = obj.additional_privileges_list;
     this.assigned_doctors_list = obj.assigned_doctors_list;
     this.user_gender = obj.user_gender;
     this.is_deleted = obj.is_deleted;
     this.role_type_name = obj.role_type_name;
     this.created_by = obj.created_by;
     this.user_department = obj.user_department;
     this.user_designation = obj.user_designation;
     this.default_application_name = obj.default_application_name;
   }
}

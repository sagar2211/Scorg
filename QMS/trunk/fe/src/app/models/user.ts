import { Applicationlist } from './applicationlist';
import { DoctorCodes } from './doctor-codes';
import { Roles } from './roles';
import * as moment from 'moment';

export class User {
   // tslint:disable-next-line: ban-types
   'id': Number;
   'title_id': Number;
   'name': String;
   'user_id': Number;
   'email': String;
   'role_name': String;
   'mobile_number': Number;
   'is_active': boolean;
   'status': String;
   'created_on': String;
   'first_name': String;
   'middle_name': String;
   'last_name': String;
   'alternate_number': Number;
   'role_type_id': Number;
   'primary_role': Number;
   'primary_role_name':String;
   'specialty_id': Number;
   'login_id': string;
   'specialty_name':String;
   'applications_list': Applicationlist[];
   'additional_privileges_list': Array<Roles>;
   'assigned_doctors_list': Array<DoctorCodes>;
   'user_gender':String;
   'is_deleted':boolean;
   'role_type_name':String;
   'created_by':String;
   'user_department':String;
   'user_designation':String;

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
   }
}

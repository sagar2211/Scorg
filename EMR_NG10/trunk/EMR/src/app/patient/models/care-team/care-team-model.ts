export class CareTeamModel {
  userId: number;
  userName: string;
  isPrimaryDoctor: string;
  mappingDate: Date;
  designationId: number;
  designation: string;
  deptId: number;
  deptName: string;
  specialityId: number;
  specialityName: string;
  isSaved: boolean;

  generateObject(obj: any): void {
    this.userId = obj.user_id || obj.userId;
    this.userName = obj.user_name || obj.userName;
    this.isPrimaryDoctor = obj.is_primary_doctor || obj.isPrimaryDoctor;
    this.mappingDate = (obj.mapping_date ? new Date(obj.mapping_date) : obj.mappingDate);
    this.designationId = obj.designation_id || obj.designationId;
    this.designation = obj.designation || obj.designation;
    this.deptId = obj.dept_id || obj.deptId;
    this.deptName = obj.dept_name || obj.deptName;
    this.specialityId = obj.speciality_id || obj.specialityId;
    this.specialityName = obj.speciality_name || obj.specialityName;
    this.isSaved = obj.is_saved || obj.isSaved || false;
  }
}

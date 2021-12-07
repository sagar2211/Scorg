export class EmployeeModel {
  employeeId: number;
  employeeName: string;

  constructor() { }

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('EmpId') && obj.EmpId) ? true : false;
  }
  generateObject(obj: any): void {
    obj = obj ? obj : {};

    this.employeeId = obj.EmpId;
    this.employeeName = obj.EmpFullname;
  }
}

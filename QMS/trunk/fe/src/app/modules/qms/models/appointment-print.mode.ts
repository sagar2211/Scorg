export class AppointmentPrint {
  slotTime: string;
  patName: string;
  patType: string;
  remark: string;
  patUhid: string;
  patGender: string;
  patDob: any;
  patAge: string;
  patContact: string;
  appTakenBy: string;
  appointmentRemark: string;
  visitType: string;

  generateObject(obj) {
    this.slotTime = obj.slotTime;
    this.patName = obj.patName;
    this.patType = obj.patType;
    this.remark = obj.remark;
    this.patUhid = obj.patUhid;
    this.patGender = obj.patGender;
    this.patDob = obj.patDob;
    this.patAge = obj.patAge;
    this.patContact = obj.patContact;
    this.appTakenBy = obj.appTakenBy;
    this.appointmentRemark = obj.appointmentRemark;
    this.visitType = obj.visitType;
  }
}

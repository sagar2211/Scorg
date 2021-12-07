export class Patient {
  address: string;
  city: string;
  country: string;
  state: string;
  age: number;
  alternateNo: number;
  bloodGroup: string;
  dob: Date;
  emailId: string;
  gender: string;
  id: string;
  isActive: boolean;
  maritalStatus: string;
  mobileNo: number;
  name: string;
  nationality: string;
  title: string;
  uhid: string;

  // for opd
  patType: string;
  patTypeDisplayName: string;
  patTypeId: number;
  patUhid: string;

  generateObject(obj) {
    this.address = obj.Pat_address || null;
    this.city = obj.Pat_city || null;
    this.country = obj.Pat_country || null;
    this.state = obj.Pat_state || null;
    this.age = obj.pat_age || obj.patAge || obj.age;
    this.alternateNo = obj.pat_alternateno || null;
    this.bloodGroup = obj.pat_bloodgroup || null;
    this.dob = new Date(obj.pat_dob || obj.patDob) || null;
    this.emailId = obj.pat_emailid || null;
    this.gender = obj.pat_gender || obj.gender || obj.patGender;
    this.id = obj.pat_id || obj.patientId || obj.patUhid || obj.pat_uhid;
    this.isActive = obj.pat_isactive || null;
    this.maritalStatus = obj.pat_maritalstatus || null;
    this.mobileNo = obj.pat_mobileno || obj.contactNo || obj.patMobileNo;
    this.name = obj.pat_name || obj.patientName || obj.patName;
    this.nationality = obj.pat_nationality || null;
    this.title = obj.pat_title || obj.patTitle || null;
    this.uhid = obj.pat_uhid || null;

    this.patType = obj.patType || null;
    this.patTypeDisplayName = obj.patTypeDisplayName || null;
    this.patTypeId = obj.patTypeId || null;
    this.patUhid = obj.patUhid || null;
  }

}

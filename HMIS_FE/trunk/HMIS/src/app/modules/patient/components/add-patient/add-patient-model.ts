import * as moment from "moment";

export class AddPatientModel{
    PatIsUnknown : boolean;
    PatId : any;
    PatUhid : any;
    assignUhid : boolean;
    PatTtlId: number;
    PatFirstname: string;
    PatMiddlename: string;
    PatLastname: string;
    PatFullname: String;
    PatFullnameCaptilize : String;
    PatLocalname : String;
    PatientEncounterStatus : any;
    PatImage : any;
    PatFatherTtlId: number;
    PatFatherFirstname: string;
    PatFatherMiddlename: string;
    PatFatherLastname: string;
    PatGender: string;
    PatBldId: number;
    PatDob: string;
    PatAge: number;
    PatAguId: string;
    PatNnlId: number
    PatMaritalstatus: string;
    PatIsempdependant: boolean;
    PatEmpCode: string;
    PatAttendRspId: string;
    PatMobileno: string;
    PatAlternateno: string;
    PatEmailid: string;
    PatPhoneno: string;
    PatPrmnaddress1: string;
    PatPrmncntId: number;
    PatPrmnstaId: number;
    PatPrmnctyId: number;
    PatPrmnPincode: string;
    PatIssameaddress : boolean;
    PatResaddress1 : string;
    PatRescntId : number;
    PatResstaId : number;
    PatResctyId : number;
    PatResPincode : string;
    PatRlgId : number;
    PatOcpId : number;
    PatAnnualincome :any;
    PatLngId : number;
    PatAdharno : string;
    PatPanno : string
    PatRemarks : string;
    PatIsactiveBool : boolean;
    PatIsliveBool : boolean;
    PatType : any;
    isUpdateUhid : boolean;
    

    generateObject(obj: any, patientInfo, encounterInfo, uhid?): void {
        this.PatId = patientInfo ? patientInfo.PatId : null,
        this.PatUhid = patientInfo ? patientInfo?.PatUhid : (uhid != "0" ? uhid : null),
        this.PatTtlId= obj.title ? obj.title : null;
        this.PatFirstname= obj.firstname;
        this.PatMiddlename= obj.middlename;
        this.PatLastname= obj.lastname;
        this.PatFullname = obj?.firstname + " " + obj?.middlename + " " + obj?.lastname;
        this.PatFullnameCaptilize = (obj?.firstname + " " + obj?.middlename + " " + obj?.lastname).toUpperCase();
        this.PatLocalname = patientInfo ? patientInfo?.PatLocalname : '';
        this.PatientEncounterStatus = encounterInfo ? encounterInfo.status : false;
        this.PatImage = obj.PatImage;
        this.PatFatherTtlId = obj.title ? obj.father_title : null;
        this.PatFatherFirstname = obj.fatherfirstname;
        this.PatFatherMiddlename = obj.fathermiddlename;
        this.PatFatherLastname = obj.fatherlastname;
        this.PatGender= obj.gender ? obj.gender : null;
        this.PatDob= obj.dob ? moment(obj.dob).format("DD/MM/YYYY") : null;
        this.PatAge= obj.age;
        this.PatMaritalstatus= obj.marital_status;
        this.PatNnlId= obj.nationality ? obj.nationality : null;
        this.PatPrmnaddress1 = obj.permanent_address;
        this.PatPrmncntId= obj.country ? obj.country : null;
        this.PatPrmnstaId= obj.state ? obj.state : null;
        this.PatPrmnctyId= obj.city ? obj.city : null;
        this.PatPrmnPincode= obj.pincode;
        this.PatIssameaddress= obj.present_address_checkbox || false;
        this.PatResaddress1 = obj.present_address;
        this.PatRescntId= obj.present_country ? obj.present_country : null;
        this.PatResstaId= obj.present_state ? obj.present_state : null;
        this.PatResctyId= obj.present_city ? obj.present_city : null;
        this.PatResPincode= obj.present_pincode;
        this.PatPanno = obj.idententy_2;
        this.PatAdharno = obj.idententy_1;
        this.PatBldId= obj.bloodgroup ? obj.bloodgroup : null;
        this.PatAnnualincome= obj.annual_income;
        this.PatAguId= obj.age_unit ? obj.age_unit : null;
        this.PatRlgId= obj.religion ? obj.religion : null;
        this.PatOcpId= obj.occupation ? obj.occupation : null;
        this.PatLngId = obj.language ? obj.language : null;
        this.PatMobileno= obj.mobile;
        this.PatAlternateno  = obj.alternate_number;
        this.PatPhoneno  = obj.phone_number;
        this.PatIsempdependant= obj.staff_dependent_checkbox || false;
        this.PatEmpCode= obj.staff_dependent;
        this.PatAttendRspId= obj.relation ? obj.relation : null;
        this.PatEmailid = obj.email;
        this.PatRemarks = obj.remarks;
        this.PatIsactiveBool = obj.isActive || false;
        this.PatIsliveBool = obj.isAlive || false;
        this.PatType = obj.patType || false;
        this.isUpdateUhid = obj.isUpdateUhid || false;
    }
}
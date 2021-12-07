import * as moment from 'moment';
export class PatientData {
  id?: number;
  patientName?: string;
  address?: string;
  doctor?: [];
  color?: string;
  gender: any;
  patImage:any;
  mobileNo: any;
  age: any;
  email: any;

  generateObject(obj: any) {
    this.id = obj.patientInfo.patientId;
    this.patientName = obj.patientInfo.patientName;
    this.address = obj.patientInfo.resAddress;
    this.gender = obj.patientInfo.gender;
    this.patImage = obj.patientInfo.patImage;
    this.mobileNo = obj.patientInfo.mobileNo;
    this.age = obj.patientInfo.age;
    this.doctor = obj.userData;
    this.email = obj.patientInfo.emailId;
  }
}

export class TheatreData {
  text?: string;
  id?: number;
  startTime?: number;
  endTime?: number;
  weekOff?: object;
  isCurrentDayWeekOff?: boolean;
  colorCode: string

  generateObject(obj: any) {
    this.id = obj.roomId;
    this.text = obj.roomDesc;
    this.startTime = obj.startTime;
    this.endTime = obj.endTime;
    this.weekOff = obj.weekOff;
    this.isCurrentDayWeekOff = obj.isCurrentDayWeekOff || false;
    this.colorCode = obj.colorCode || null;
  }
}

export class Data {
  theatreId?: number;
  patientId?: number;
  startDate?: Date;
  endDate?: Date;
  appointmentDate?: Date;
  appointmentId?: number;
  procedureId?: number;
  procedureName?: string;
  specialityId?: number;
  specialityName?: string;
  statusId?: number;
  statusName?: string;
  userData?: [];
  patientInfo?: any;
  note?: any;
  primarySergeon: any;
  primaryAnaesthetist: any;
  disabledDrag: boolean;
  outOfTimeCell: boolean;
  weekOff: boolean;
  colorCode: string;
  generateObject(obj: any, otList?) {
    this.theatreId = obj.roomId;
    this.patientId = obj.patientInfo.patientId;
    this.startDate = obj.startTime;
    this.endDate = obj.endTime;
    this.appointmentDate = obj.appointmentDate;
    this.appointmentId = obj.appointmentId;
    this.procedureId = obj.procedureId;
    this.procedureName = obj.procedureName;
    this.specialityId = obj.specialityId;
    this.specialityName = obj.specialityName;
    this.statusId = obj.statusId;
    this.statusName = obj.statusName;
    this.userData = obj.userData;
    this.patientInfo = obj.patientInfo;
    this.note = obj.note;
    this.primarySergeon = this.getSergeon(obj);
    this.primaryAnaesthetist = this.getAnaesthetist(obj);
    this.disabledDrag = this.checkDisable(obj);
    this.outOfTimeCell = this.checkoutOfTimeCell(obj, otList);
    this.weekOff = this.checkweekOff(obj, otList);
    this.colorCode = this.getColor(obj, otList);
  }

  getSergeon(val) {
    const dt = val.userData.find(d => {
      return d.type === 'PRIMARY' && d.userGroup === 'SURGEON';
    });
    return dt ? dt.userName : null;
  }

  getAnaesthetist(val) {
    const dt = val.userData.find(d => {
      return d.type === 'PRIMARY' && d.userGroup === 'ANAESTHETIST';
    });
    return dt ? dt.userName : null;
  }

  checkDisable(obj) {
    return moment().isSameOrAfter(moment(obj.startTime));
  }

  checkoutOfTimeCell(cellData, otList) {
    const ot = otList.find(d => {
      return d.id === cellData.roomId
    });
    const dayName = moment(cellData.startTime).format('dddd').toLowerCase();
    if (!ot.weekOff[dayName]) {
      const sTime = moment(moment(cellData.startTime).format('YYYY/MM/DD') + ' ' + ot.startTime);
      const eTime = moment(moment(cellData.startTime).format('YYYY/MM/DD') + ' ' + ot.endTime);
      if (moment(cellData.startTime).isBetween(sTime, eTime, undefined, '[]')) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  checkweekOff(cellData, otList) {
    const ot = otList.find(d => {
      return d.id === cellData.roomId
    });
    const dayName = moment(cellData.startTime).format('dddd').toLowerCase();
    return ot.weekOff[dayName];
  }

  getColor(cellData, otList) {
    const ot = otList.find(d => {
      return d.id === cellData.roomId
    });
    return ot.colorCode;
  }
}

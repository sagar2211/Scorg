import { AppointmentHistory } from './appointment-history.model';
export class PatientHistory {
  name: string;
  uhid: string;
  history: Array<AppointmentHistory>;

  generateObject(obj) {
    this.name = obj.Pat_Name;
    this.uhid = obj.Pat_UHID;
    this.history = this.generateHistory(obj.History_Details);
  }

  generateHistory(array): Array<AppointmentHistory> {
    const temp = [];
    array.forEach(element => {
      const appHistory = new AppointmentHistory();
      appHistory.generateObject({...element});
      temp.push(appHistory);
    });
    return temp;
  }

}

import { environment } from './../../environments/environment';

export class ReportConstants {
  public static AddPatientCommonView = `${environment.HIS_Add_PatientCommon_API}/Patient/Registration`;
  public static PostServiceOrderPartialUrl = `${environment.HIS_Add_PatientCommon_API}/ServiceOrder/ServiceOrderDetails`;
}

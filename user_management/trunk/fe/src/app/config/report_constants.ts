import { environment } from './../../environments/environment';

export class ReportConstants {
  // Patient Appointment
  public static PatientAppointment = `${environment.REPORT_API}/QMSReport/PatientAppointment`;
  // Patient Appointment Type Summary
  public static PatientAppointmentTypeSummary = `${environment.REPORT_API}/QMSReport/PatientAppointmentTypeSummary`;
  // Queue Report
  public static QueueReport = `${environment.REPORT_API}/QMSReport/QueueReport`;
  // Patient Appointment History
  public static PatientAppointmentHistory = `${environment.REPORT_API}/QMSReport/PatientAppointmentHistoryReport`;
  // Service Schedule Summary
  public static ServiceScheduleSummary = `${environment.REPORT_API}/QMSReport/ServiceScheduleSummary`;
  // Service Summary;
  public static ServiceSummary = `${environment.REPORT_API}/QMSReport/ServicesSummaryReport`;
  //public static AddPatientCommonView = `${environment.HIS_Add_PatientCommon_API}/Patient/Registration`;
  public static AddPatientCommonView = `${environment.HIS_FE_APP_URL}patient/patientRegistration`;
  public static AddPatientListView = `${environment.HIS_FE_APP_URL}patient/patientList`;

}

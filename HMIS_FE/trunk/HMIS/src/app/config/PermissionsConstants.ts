export class ApplicationConstants {
  public static readonly Registration: string = 'registration';
  public static readonly IPD: string = 'ipd';
  public static readonly OPD: string = 'opd';
  public static readonly Emergency: string = 'emergency';
  public static readonly Billing: string = 'billing';
  public static readonly insurance: string = 'insurance';
  public static readonly admin: string = 'admin';
  public static readonly EnquieryDesk: string = 'enquiry-desk';
  public static readonly DoctorDesk: string = 'emr';
  public static readonly Nursing: string = 'nursing';
  public static readonly QMS: string = 'qms';
  public static readonly Appointment: string = 'apppointment';
  public static readonly LIS: string = 'lis';
  public static readonly RIS: string = 'ris';
  public static readonly OT: string = 'ot';
}

export class PermissionsConstants {
  public static readonly USER_MGMT_MENU: string = 'UserMgmt';
  public static readonly QMS_APP_MENU: string = 'QMS';
  public static readonly DEVLOPMENT_PERMISSION: string = 'DEVLOPMENT_PERMISSION';

  // QMS HOME/Dashbord related permissions
  public static readonly ADMIN_DASHBOARD = 'Admin Dashboard';
  public static readonly CALL_CENTER_DASHBOARD = 'Call Center Dashboard';
  public static readonly DOCTORDASHBOARD = 'DoctorDashboard';
  public static readonly FRONTDESK = 'Front Desk';

  // patient Master -- complete
  public static readonly View_PatientMaster = "Patient - View";
  public static readonly Add_PatientMaster = "Patient - Create";
  public static readonly Update_PatientMaster = "Patient - Update";
  public static readonly Delete_PatientMaster = "Patient - Delete";

  // Admin Dashboard -- completed
  public static readonly View_Admin_Dashboard = "Admin Dashboard - View";
  // public static readonly Update_Admin_Dashboard = "Update - Admin Dashboard";
  // public static readonly Search_Admin_Dashboard = "Search - Admin Dashboard";
  // public static readonly Delete_Admin_Dashboard = "Delete - Admin Dashboard";
  // public static readonly Add_Admin_Dashboard = "Add - Admin Dashboard";

  public static readonly Application_Settings_View = "Application Settings - View";
  public static readonly Application_Settings_Update = "Application Settings - Update";

  // Patient Bill
  public static readonly Report_PatientBill = "PatientBill - Rport";
  public static readonly View_PatientBill = "PatientBill - View";
  public static readonly Create_PatientBill = "PatientBill - Create";
  public static readonly Update_PatientBill = "PatientBill - Update";
  public static readonly Delete_PatientBill = "PatientBill - Delete";
  public static readonly EditBillAfterFinal_PatientBill = "PatientBill - EditBillAfterFinal";
  public static readonly EditBillAfterSettle_PatientBill = "PatientBill - EditBillAfterSettle";
  public static readonly Cancel_PatientBill = "PatientBill - Cancel";
  public static readonly Verify_PatientBill = "PatientBill - Verify";
  public static readonly DischargeApprove_PatientBill = "PatientBill - Discharge Approve";

}

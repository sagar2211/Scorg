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
  public static readonly HMIS: string = 'hmis';
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


  public static readonly View_Patient_Appointment = "Patient Appointment - View";
  public static readonly View_Patient_Appointment_History = "Patient Appointment History - View";
  public static readonly View_Patient_Appointment_Summary = "Patient Appointment Summary - View";
  public static readonly View_Patient_Feedback_Settings = "Patient Feedback Settings - View";
  public static readonly update_Patient_Feedback_Settings = "Patient Feedback Settings - Update";
  public static readonly View_Mapped_Doctor_List = "Mapped Doctor List - View";
  public static readonly View_EntityUser = "EntityUser - View";
  public static readonly View_Manage_All_Appointments = "Manage All Appointments - View";
  public static readonly View_Access_All_Appointments = "Access All Appointments - View";
  public static readonly View_App_Settings = "App Settings - View";
  public static readonly View_Quick_Book_Appointment = "Quick Book Appointment - View";
  public static readonly Add_Doctor_Mapping = "Doctor Mapping - Add";
  public static readonly Update_Doctor_Mapping = "Doctor Mapping - Update";
  // front Desk
  public static readonly View_Front_Desk = "Front Desk - View"; // dashboard frontdesk user
  public static readonly View_Front_Desk_Queue = "Front Desk - Front Desk Queue";
  public static readonly View_Front_Desk_manageCalendar = "Front Desk - Manage Calendar";

  //frontDesk entity mapping
  public static readonly View_Front_Desk_Entity_Mapping = "Front Desk Entity Mapping - View"; // mapping
  public static readonly Add_Front_Desk_Entity_Mapping = "Front Desk Entity Mapping - Add"; // mapping
  public static readonly Update_Front_Desk_Entity_Mapping = "Front Desk Entity Mapping - Update"; // mapping

  // calender
  public static readonly Calendar_View_Print = "Calendar View - Print";
  public static readonly Calendar_View_Drag_Drop = "Calendar View - Drag/Drop";
  public static readonly Calendar_View_Book_Appointment = "Calendar View - Book Appointment";
  public static readonly View_Calendar_View = "Calendar View - View";
  // manage Calender
  public static readonly View_Manage_Calendar = "Manage Calendar - View";
  public static readonly Manage_Calendar_addholidaySetting = "Manage Calendar - Add_HolidaySetting"
  public static readonly Manage_Calendar_addblockSetting = "Manage Calendar - Add_BlockSetting"
  public static readonly Manage_Calendar_Update = "Manage Calendar - Update"

  // Manage Appointment
  public static readonly View_Manage_Appointment = "Manage Appointment - View";
  public static readonly Manage_Appointment_Reschedule = "Manage Appointment - Reschedule"
  public static readonly Manage_Appointment_confirm = "Manage Appointment - Confirm"
  public static readonly Manage_Appointment_ConfirmAll = "Manage Appointment - Confirm All"
  public static readonly Manage_Appointment_cancel = "Manage Appointment - Cancel"
  public static readonly Manage_Appointment_cancelAll = "Manage Appointment - Cancel All"
  public static readonly Manage_Appointment_history = "Manage Appointment - History"
  public static readonly Manage_Appointment_delayNotification = "Manage Appointment - Delay Notification"
  public static readonly Manage_Appointment_print = "Manage Appointment - Print"
  public static readonly Manage_Appointment_Delete = "Manage Appointment - Delete"
  public static readonly Manage_Appointment_Delete_All = "Manage Appointment - Delete All"

  // Queue
  public static readonly View_Queue = "Queue - View";
  public static readonly Queue_skip = "Queue - Skip";
  public static readonly Queue_call = "Queue - Call";
  public static readonly Queue_complete = "Queue - Complete";
  public static readonly Queue_In_Consultation = "Queue - InConsultation";
  public static readonly Queue_Not_Present = "Queue - Not Present";
  public static readonly Queue_Edit_Appointment = "Queue - Edit Appointment";
  public static readonly Queue_Appointment_History = "Queue - Appointment History";
  public static readonly Queue_Book_Appointment = "Queue - Book Appointment";
  public static readonly Queue_Extend_Hour = "Queue - Extend Hour";
  public static readonly Queue_Print = "Queue - Print";
  public static readonly Queue_Delay_Notification = "Queue - Delay Notification";
  public static readonly Queue_CheckIn_CheckOut = "Queue - CheckIn_CheckOut";
  public static readonly View_Queue_Settings = "Queue Settings - View";
  // public static readonly View_Queue_AllAccess = "QueueAllAccess - View"; // need to separate
  public static readonly Update_Queue_Settings = "Queue Settings - Update";


  public static readonly View_Queue_Summary = "Queue Summary - View";
  public static readonly Add_Queue_Summary = "Queue Summary - Add";
  public static readonly Delete_Queue_Summary = "Queue Summary - Delete";
  public static readonly Search_Queue_Summary = "Queue Summary - Search";
  public static readonly Update_Queue_Summary = "Queue Summary - Update";

  // patient Master -- complete
  public static readonly View_PatientMaster = "PatientMaster - View";
  public static readonly Add_PatientMaster = "PatientMaster - Add";
  public static readonly Update_PatientMaster = "PatientMaster - Update";
  // public static readonly Delete_PatientMaster = "Delete - PatientMaster";
  // public static readonly Search_PatientMaster = "Search - PatientMaster";

  // user -- complete
  public static readonly View_UserMaster = "UserMaster - View";
  public static readonly Update_UserMaster = "UserMaster - Update";
  public static readonly Add_UserMaster = "UserMaster - Add";
  public static readonly Delete_UserMaster = "UserMaster - Delete";
  public static readonly UserMaster_Force_Logout = "UserMaster - Force Logout";
  public static readonly Active_Inactive_User_Master = "UserMaster - Active/Inactive";
  public static readonly Reset_Password_User_Master = "UserMaster - Reset Password";

  // Role Permission
  public static readonly View_RolePermission = "RolePermission - View";
  public static readonly Update_RolePermission = "RolePermission - Update";
  public static readonly Delete_RolePermission = "RolePermission - Delete";
  // public static readonly Search_RolePermission = "Search - RolePermission";
  // public static readonly Add_RolePermission = "Add - RolePermission";

  // Role Master
  public static readonly Add_RoleMaster = "RoleMaster - Add";
  public static readonly View_RoleMaster = "RoleMaster - View";
  public static readonly Delete_RoleMaster = "RoleMaster - Delete";
  public static readonly Update_RoleMaster = "RoleMaster - Update";
  // public static readonly Search_RoleMaster = "Search - RoleMaster";

  // schedule
  public static readonly View_Schedule = "Schedule - View";
  public static readonly Add_Schedule = "Schedule - Add";
  public static readonly Update_Schedule = "Schedule - Update";
  public static readonly Add_TimeSchedule = "TimeSchedule - Add";
  public static readonly Active_InActive_Schedule = "Schedule - Active/Inactive";


  public static readonly Schedule_Time_Extend = "Schedule Time - Extend";
  public static readonly Schedule_Time_End = "Schedule Time - End";
  public static readonly Schedule_Time_Add_New_Time_Slot = "Schedule Time - Add New Time Slot";
  public static readonly Schedule_Time_Edit = "Schedule Time - Update";
  public static readonly Schedule_Time_Delete = "Schedule Time - Delete";
  // public static readonly Schedule_Time_View_Only = "Schedule Time - View Only";

  // Service Summary
  public static readonly View_Service_Summary = "Service Summary - View";
  public static readonly Update_Service_Summary = "Service Summary - Update";
  public static readonly Search_Service_Summary = "Service Summary - Search";
  public static readonly Delete_Service_Summary = "Service Summary - Delete";
  public static readonly Add_Service_Summary = "Service Summary - Add";

  // Admin Dashboard -- completed
  public static readonly View_Admin_Dashboard = "Admin Dashboard - View";
  // public static readonly Update_Admin_Dashboard = "Update - Admin Dashboard";
  // public static readonly Search_Admin_Dashboard = "Search - Admin Dashboard";
  // public static readonly Delete_Admin_Dashboard = "Delete - Admin Dashboard";
  // public static readonly Add_Admin_Dashboard = "Add - Admin Dashboard";

  // call center
  public static readonly View_Call_Center_Dashboard = "Call Center Dashboard - View";
  public static readonly View_Call_Center_View = "Call Center View - View";
  public static readonly Call_Center_View_Book_Appointment = "Call Center View - Book Appointment";
  public static readonly Call_Center_View_Calendar_View = "Call Center View - Calender View";
  public static readonly Call_Center_View_Slot_View = "Call Center View - Slot View";
  // public static readonly Call_Center_View_Reschedule = "Call Center View - Reschedule";
  public static readonly Call_Center_View_History = "Call Center View - History";
  public static readonly recheck_book_appointment = "Recheck - Book Appointment";

  // Appointment
  // public static readonly View_Appointment = "Appointment - View";
  // public static readonly Update_Appointment = "Appointment - Update";
  // public static readonly Search_Appointment = "Appointment - Search";
  // public static readonly Delete_Appointment = "Appointment - Delete";
  // public static readonly Add_Appointment = "Appointment - Add";

  // Display Fild Setting -- completed
  public static readonly View_Display_Field_Settings = "Display Field Settings - View";
  public static readonly Update_Display_Field_Settings = "Display Field Settings - Update";
  // public static readonly Search_Display_Field_Settings = "Search - Display Field Settings";
  // public static readonly Delete_Display_Field_Settings = "Delete - Display Field Settings";
  // public static readonly Add_Display_Field_Settings = "Add - Display Field Settings";

  // Display Status Setting  -- completed
  public static readonly View_Display_Status_Settings = "Display Status Settings - View";
  public static readonly Update_Display_Status_Settings = "Display Status Settings - Update";
  // public static readonly Search_Display_Status_Settings = "Search - Display Status Settings";
  // public static readonly Delete_Display_Status_Settings = "Delete - Display Status Settings";
  // public static readonly Add_Display_Status_Settings = "Add - Display Status Settings";

  // Reception view
  public static readonly View_Receptionist_View = "Receptionist View - View";
  public static readonly Update_Receptionist_View = "Receptionist View - Update";
  public static readonly Search_Receptionist_View = "Receptionist View - Search";
  public static readonly Delete_Receptionist_View = "Receptionist View -Delete";
  public static readonly Add_Receptionist_View = "Receptionist View - Add";

  // Reminder setting
  public static readonly Update_Reminder_Settings = "Reminder Settings - Update";
  public static readonly View_Reminder_Settings = "Reminder Settings - View";


  // Reports
  public static readonly View_Reports = "Reports - View"
  public static readonly Update_Reports = "Reports - Update";
  public static readonly Search_Reports = "Reports - Search";
  public static readonly Delete_Reports = "Reports - Delete";
  public static readonly Add_Reports = "Reports - Add";

  // Room Entity Mapping
  public static readonly View_Room_Entity_Mapping = "Room Entity Mapping - View";
  public static readonly Update_Room_Entity_Mapping = "Room Entity Mapping - Update";
  // public static readonly Search_Room_Entity_Mapping = "Search - Room Entity Mapping";
  // public static readonly Delete_Room_Entity_Mapping = "Delete - Room Entity Mapping";
  public static readonly Add_Room_Entity_Mapping = "Room Entity Mapping - Add";

  // Room Master
  public static readonly View_Room_Master = "Room Master - View";
  public static readonly Update_Room_Master = "Room Master - Update";
  // public static readonly Search_Room_Master = "Search - Room Master";
  // public static readonly Delete_Room_Master = "Delete - Room Master";
  public static readonly Add_Room_Master = "Room Master - Add";

  // Room Section Mapping
  public static readonly View_Room_Section_Mapping = "Room Section Mapping - View";
  public static readonly Update_Room_Section_Mapping = "Room Section Mapping - Update";
  public static readonly Add_Room_Section_Mapping = "Room Section Mapping - Add";
  public static readonly Delete_Room_Section_Mapping = "Room Section Mapping - Delete"

  // Section Master
  public static readonly View_Section_Master = "Section Master - View";
  public static readonly Add_Section_Master = "Section Master - Add";
  public static readonly Update_Section_Master = "Section Master - Update";
  public static readonly copy_url_display_master = "Section Master - Copy Display URL";
  public static readonly section_master_room_mapping = "Section Master - Room Mapping";
  public static readonly Delete_Section_Master ="Section Master - Delete";


  // Section Mapping Details
  public static readonly View_Section_Mapping_Details = "Section Mapping Details - View";

  // Set Feedback Template
  public static readonly View_Set_Feedback_Template = "Set Feedback Template - View";
  public static readonly Update_Set_Feedback_Template = "Set Feedback Template - Update";
  // public static readonly Search_Set_Feedback_Template = "Search - Set Feedback Template";
  // public static readonly Delete_Set_Feedback_Template = "Delete - Set Feedback Template";
  // public static readonly Add_Set_Feedback_Template = "Add - Set Feedback Template";

  public static readonly Update_Slot_Color_Settings = "Slot Color Settings - Update";
  public static readonly View_Slot_Color_Settings = "Slot Color Settings - View";
  // sms report
  public static readonly View_SMS_Report = "SMS Report - View";
  public static readonly Update_SMS_Report = "SMS Report - Update";
  public static readonly Search_SMS_Report = "SMS Report - Search";
  public static readonly Delete_SMS_Report = "SMS Report - Delete";
  public static readonly Add_SMS_Report = "SMS Report - Add";
  //   Template Mapping
  public static readonly Add_Template_Mapping = "Template Mapping - Add";
  public static readonly Update_Template_Mapping = "Template Mapping - Update";
  public static readonly View_Template_Mapping = "Template Mapping - View";
  //   Templates
  public static readonly View_Templates = "Templates - View";
  public static readonly Update_Templates = "Templates - Update";
  public static readonly Add_Templates = "Templates - Add";
  //  Time Format Settings
  public static readonly View_Time_Format_Settings = "Time Format Settings - View";
  public static readonly Update_Time_Format_Settings = "Time Format Settings - Update";
  public static readonly My_Profile_Change_Password = "My Profile - Change Password";
  public static readonly Update_My_Profile = "My Profile - Update";
  // Event Communication
  public static readonly Event_Communication_Setting_View = "Event Communication Setting - View";
  public static readonly Event_Communication_Setting_Update = "Event Communication Setting - Update";

  public static readonly Appointment_Slot_Setting_View = "Appointment Slot Setting - View";
  public static readonly Appointment_Slot_Setting_Update = "Appointment Slot Setting - Update";

  public static readonly Location_Master_View = "Location Master - View";
  public static readonly Location_Master_Update = "Location Master - Update";
  public static readonly Location_Master_Add = "Location Master - Add";

  public static readonly Appointment_Slotwise_MIS_Report_View = "Appointment Slotwise MIS Report - View";
  public static readonly Email_SMS_Transaction_Report_View = "Email SMS Transaction Report - View";
  public static readonly Entity_Holiday_Report_View = "Entity Holiday Report - View";
  public static readonly Patient_Appointment_View = "Patient Appointment - View";
  public static readonly Patient_Appointment_History_View = "Patient Appointment History - View";
  public static readonly Patient_Appointment_Type_Summary_View = "Patient Appointment Type Summary - View"
  public static readonly Patient_Master_Report_View = "Patient Master Report - View";
  public static readonly Queue_Report_View = "Queue Report - View";
  public static readonly Room_Entity_Mapping_Report_View = "Room Entity Mapping Report - View";
  public static readonly Room_Section_Mapping_Report_View = "Room Section Mapping Report - View";
  public static readonly Service_Schedule_Summary_View = "Service Schedule Summary - View";
  public static readonly Service_Summary_View = "Service Summary - View";
  public static readonly User_Activity_Report_View = "User Activity Report - View";
  public static readonly User_Login_Log_Report_View = "User Login Log Report - View"

  public static readonly Application_Settings_View = "Application Settings - View";
  public static readonly Application_Settings_Update = "Application Settings - Update";
  public static readonly Delete_Location_Master = "Location Master - Delete";
  public static readonly Delete_Room_Master ="Room Master - Delete";
  public static readonly Delete_Room_Entity_Mapping ="Room Entity Mapping - Delete";

  // Doctor Dashboard -- completed
  //public static readonly Doctor_Dashboard_View = "DoctorDashboard - View";

  // EMR - Application All Permission
  public static readonly Doctor_Dashboard_View = 'Doctor Dashboard - View';
  public static readonly Nurse_Dashboard_View = 'Nurse Dashboard - View';
  public static readonly Admin_Dashboard_View = 'Admin Dashboard - View';
  public static readonly Dashboard_Appointment_Patient_View = 'Dashboard Appointment Patient - View';
  public static readonly Dashboard_Admitted_Patient_View = 'Dashboard Admitted Patient - View';
  public static readonly Dashboard_OT_Schedule_View = 'Dashboard OT Schedule - View';
  public static readonly Dashboard_Pending_Task_View = 'Dashboard Pending Task - View';
  public static readonly Global_Patient_Search_View = 'Global Patient Search - View';
  public static readonly Patient_View = 'Patient - View';
  public static readonly Patient_Add = 'Patient - Add';
  public static readonly Dept_Ward_Mapping_View = 'Dept Ward Mapping - View';
  public static readonly Dept_Ward_Mapping_Search = 'Dept Ward Mapping - Search';
  public static readonly Dept_Ward_Mapping_Add = 'Dept Ward Mapping - Add';
  public static readonly Dept_Ward_Mapping_Update = 'Dept Ward Mapping - Update';
  public static readonly Dept_Ward_Mapping_Delete = 'Dept Ward Mapping - Delete';
  public static readonly Dept_Ward_Mapping_Active_Inactive = 'Dept Ward Mapping - Active_Inactive';
  public static readonly RMO_Dept_Mapping_View = 'RMO Dept Mapping - View';
  public static readonly RMO_Dept_Mapping_Search = 'RMO Dept Mapping - Search';
  public static readonly RMO_Dept_Mapping_Add = 'RMO Dept Mapping - Add';
  public static readonly RMO_Dept_Mapping_Update = 'RMO Dept Mapping - Update';
  public static readonly RMO_Dept_Mapping_Delete = 'RMO Dept Mapping - Delete';
  public static readonly RMO_Dept_Mapping_Active_Inactive = 'RMO Dept Mapping - Active_Inactive';
  public static readonly Speciality_Dept_Mapping_View = 'Speciality Dept Mapping - View';
  public static readonly Speciality_Dept_Mapping_Search = 'Speciality Dept Mapping - Search';
  public static readonly Speciality_Dept_Mapping_Add = 'Speciality Dept Mapping - Add';
  public static readonly Speciality_Dept_Mapping_Update = 'Speciality Dept Mapping - Update';
  public static readonly Speciality_Dept_Mapping_Delete = 'Speciality Dept Mapping - Delete';
  public static readonly Speciality_Dept_Mapping_Active_Inactive = 'Speciality Dept Mapping - Active_Inactive';
  public static readonly Nurse_Ward_Mapping_View = 'Nurse Ward Mapping - View';
  public static readonly Nurse_Ward_Mapping_Search = 'Nurse Ward Mapping - Search';
  public static readonly Nurse_Ward_Mapping_Add = 'Nurse Ward Mapping - Add';
  public static readonly Nurse_Ward_Mapping_Update = 'Nurse Ward Mapping - Update';
  public static readonly Nurse_Ward_Mapping_Delete = 'Nurse Ward Mapping - Delete';
  public static readonly Nurse_Ward_Mapping_Active_Inactive = 'Nurse Ward Mapping - Active_Inactive';
  public static readonly RMO_Doctor_Mapping_View = 'RMO Doctor Mapping - View';
  public static readonly RMO_Doctor_Mapping_Search = 'RMO Doctor Mapping - Search';
  public static readonly RMO_Doctor_Mapping_Add = 'RMO Doctor Mapping - Add';
  public static readonly RMO_Doctor_Mapping_Update = 'RMO Doctor Mapping - Update';
  public static readonly RMO_Doctor_Mapping_Delete = 'RMO Doctor Mapping - Delete';
  public static readonly RMO_Doctor_Mapping_Active_Inactive = 'RMO Doctor Mapping - Active_Inactive';
  public static readonly Medicine_Favorite_View = 'Medicine Favorite - View';
  public static readonly Diagnosis_Favorite_View = 'Diagnosis Favorite - View';
  public static readonly Complaint_Favorite_View = 'Complaint Favorite - View';
  public static readonly Radio_Investigation_Favorite_View = 'Radio Investigation Favorite - View';
  public static readonly Lab_Investigation_Favorite_View = 'Lab Investigation Favorite - View';
  public static readonly Nursing_Favorite_View = 'Nursing Favorite - View';
  public static readonly Diet_favorite_View = 'Diet favorite - View';
  public static readonly Vitals_View = 'Vitals - View';
  public static readonly Vitals_Search = 'Vitals - Search';
  public static readonly Vitals_Add = 'Vitals - Add';
  public static readonly Vitals_Update = 'Vitals - Update';
  public static readonly Vitals_Delete = 'Vitals - Delete';
  public static readonly Vitals_Active_Inactive = 'Vitals - Active_Inactive';
  public static readonly Vital_Mapping_View = 'Vital Mapping - View';
  public static readonly Vital_Mapping_Search = 'Vital Mapping - Search';
  public static readonly Vital_Mapping_Add = 'Vital Mapping - Add';
  public static readonly Vital_Mapping_Update = 'Vital Mapping - Update';
  public static readonly Vital_Mapping_Delete = 'Vital Mapping - Delete';
  public static readonly Vital_Mapping_Active_Inactive = 'Vital Mapping - Active_Inactive';
  public static readonly Patient_Chart_View = 'Patient Chart - View';
  public static readonly Patient_Chart_Search = 'Patient Chart - Search';
  public static readonly Patient_Chart_Add = 'Patient Chart - Add';
  public static readonly Patient_Chart_Update = 'Patient Chart - Update';
  public static readonly Patient_Chart_Delete = 'Patient Chart - Delete';
  public static readonly Patient_Chart_Active_Inactive = 'Patient Chart - Active_Inactive';
  public static readonly Patient_Menu_Builder_View = 'Patient Menu Builder - View';
  public static readonly Patient_Menu_Builder_Add = 'Patient Menu Builder - Add';
  public static readonly FAQ_Template_View = 'FAQ Template - View';
  public static readonly FAQ_Template_Search = 'FAQ Template - Search';
  public static readonly FAQ_Template_Add = 'FAQ Template - Add';
  public static readonly FAQ_Template_Update = 'FAQ Template - Update';
  public static readonly FAQ_Template_Delete = 'FAQ Template - Delete';
  public static readonly FAQ_Template_Active_Inactive = 'FAQ Template - Active_Inactive';
  public static readonly Score_Template_View = 'Score Template - View';
  public static readonly Score_Template_Search = 'Score Template - Search';
  public static readonly Score_Template_Add = 'Score Template - Add';
  public static readonly Score_Template_Update = 'Score Template - Update';
  public static readonly Score_Template_Delete = 'Score Template - Delete';
  public static readonly Score_Template_Active_Inactive = 'Score Template - Active_Inactive';
  public static readonly Examination_Label_View = 'Examination Label - View';
  public static readonly Examination_Label_Search = 'Examination Label - Search';
  public static readonly Examination_Label_Add = 'Examination Label - Add';
  public static readonly Examination_Label_Update = 'Examination Label - Update';
  public static readonly Examination_Label_Delete = 'Examination Label - Delete';
  public static readonly Examination_Label_Active_Inactive = 'Examination Label - Active_Inactive';
  public static readonly Prescription_Template_View = 'Prescription Template - View';
  public static readonly Suggestion_Configuration_View = 'Suggestion Configuration - View';
  public static readonly OT_Room_View = 'OT Room - View';
  public static readonly OT_Room_Search = 'OT Room - Search';
  public static readonly OT_Room_Add = 'OT Room - Add';
  public static readonly OT_Room_Update = 'OT Room - Update';
  public static readonly OT_Room_Delete = 'OT Room - Delete';
  public static readonly OT_Room_Active_Inactive = 'OT Room - Active_Inactive';
  public static readonly Patient_Schedule_View = 'Patient Schedule - View';
  public static readonly Patient_Schedule_Add = 'Patient Schedule - Add';
  public static readonly Patient_Schedule_Update = 'Patient Schedule - Update';
  public static readonly Patient_Schedule_Delete = 'Patient Schedule - Delete';
  public static readonly OT_Register_View = 'OT Register - View';
  public static readonly OT_Register_Add = 'OT Register - Add';
  public static readonly OT_Register_Update = 'OT Register - Update';
  public static readonly OT_Register_Delete = 'OT Register - Delete';
  public static readonly OT_Parameter_View = 'OT Parameter - View';
  public static readonly OT_Parameter_Search = 'OT Parameter - Search';
  public static readonly OT_Parameter_Add = 'OT Parameter - Add';
  public static readonly OT_Parameter_Update = 'OT Parameter - Update';
  public static readonly OT_Parameter_Delete = 'OT Parameter - Delete';
  public static readonly OT_Parameter_Active_Inactive = 'OT Parameter - Active_Inactive';
  public static readonly OT_Check_List_View = 'OT Check List - View';
  public static readonly OT_Check_List_Search = 'OT Check List - Search';
  public static readonly OT_Check_List_Add = 'OT Check List - Add';
  public static readonly OT_Check_List_Update = 'OT Check List - Update';
  public static readonly OT_Check_List_Delete = 'OT Check List - Delete';
  public static readonly OT_Check_List_Active_Inactive = 'OT Check List - Active_Inactive';
  public static readonly Patient_Consultaion_View = 'Patient Consultaion - View';
  public static readonly Patient_Consultaion_Search = 'Patient Consultaion - Search';
  public static readonly Patient_Consultaion_Add = 'Patient Consultaion - Add';
  public static readonly Patient_Consultaion_Update = 'Patient Consultaion - Update';
  public static readonly Patient_Consultaion_Delete = 'Patient Consultaion - Delete';
  public static readonly Patient_Consultaion_Active_Inactive = 'Patient Consultaion - Active_Inactive';
  public static readonly IP_Notes_View = 'IP Notes - View';
  public static readonly Operative_Notes_View = 'Operative Notes - View';
  public static readonly Discharge_Notes_View = 'Discharge Notes - View';
  public static readonly Patient_Transfer_View = 'Patient Transfer - View';
  public static readonly Patient_Handover_View = 'Patient Handover - View';
  public static readonly Patient_Refer_View = 'Patient Refer - View';
  public static readonly Patient_Discharge_View = 'Patient Discharge - View';
  public static readonly Notification_View = 'Notification - View';
  public static readonly Notification_Complete = 'Notification - Complete';
  public static readonly Nursing_Bed_Display = 'Nursing Bed Display';
  public static readonly Nursing_Station_To_Nurse_Mapping = 'Nursing Station To Nurse Mapping';
  public static readonly Death_Rigister = 'Death Rigister';
  public static readonly MLC = 'MLC';
  public static readonly Discharge = 'Discharge';

}

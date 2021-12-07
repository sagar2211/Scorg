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

  // Doctor Dashboard -- completed
  public static readonly View_DoctorDashboard = "DoctorDashboard - View";

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

}

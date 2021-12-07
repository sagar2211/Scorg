
export class Constants {

  // -- for alert notifications
  public static ALERT_DURATION = 3000;
  // -- times format
  public static MORNING = { startTime: '12:00 AM', endTime: '11:59 AM' };
  public static NOON = { startTime: '12:00 PM', endTime: '04:59 PM' };
  public static EVENING = { startTime: '5:00 PM', endTime: '11:59 PM' };

  public static INTERVAL_TIME = 2000; // ms
  // ----------------------------  Que Seeting Key List ----------------

  // patient field setting for display and masking data for component field-setting
  public static readonly patientFieldSettingKey: string = 'patient_field_setting';
  // doctor field setting for display and masking data for component doctor-field-setting
  public static readonly doctorFieldSettingKey: string = 'doctor_field_setting';
  // Queue Display setting for display Type component doctor-field-setting
  public static readonly queueDisplaySettingKey: string = 'queue_display_setting';
  // Queue Skip setting for avilable slot and skip minutes
  public static readonly queueSkipSettingKey: string = 'queue_skip_setting';
  // Queue Skip readonly setting for avilable slot and skip minutes
  public static readonly timeFormateKey: string = 'time_format_key';
  public static readonly displayStatusSetting: string = 'display_status_setting';
  // Patient Feedback Sent setting
  public static readonly feedbackSendKey: string = 'send_feedback_patient';
  public static readonly QLIST_FILTER: string = 'queue_filter_setting';
  // public static readonly CALENDAR_FILTER: string = 'queue_filter_setting';
  public static readonly DEFAULT_LANDING_PAGE: string = 'default_landing_page';
  public static readonly calendarViewSetting: string = 'calendar_view_setting';
  public static readonly allowLapsedTimeBooking: string = 'appointment_slots_setting';
  public static readonly slotColorSetting: string = 'slot_color_setting';
  public static readonly qmsBeSettingKey: string = 'QMS_BE_SETTINGS';
  public static readonly qmsBeReportSettingKey: string = 'QMS_BE_SETTINGS_REPORTS';
  public static readonly EMR_DOC_DASHBOARD_FAV_TAB_SETTING: string = 'EMR_DOC_DASH_FAV_TAB_SETTING';
  public static readonly SUGGESTION_PANEL_SETTING: string = 'suggestion_panel_setting';
  public static readonly appointmentprioritySetting: string = 'appointment_priority_setting';

  // -------------------------------- Que Seeting Key List ----------------

  // class array list for holiday calender highlight
  public static readonly holidayDateCustomClass = ['text-white', 'bg-danger'];
  public static readonly blockSlotCustomClass = ['text-white', 'bg-blockblue'];

  // class array list for custom holiday calender highlight
  public static readonly customBlockColorClass = 'customBlockColor';
  public static readonly customHolidayColorClass = 'customHolidayColor';

  public static readonly passedDateCustomClass = ['text-white', 'bg-primary'];
  // class name today highligt custom class
  public static readonly todayDateCustomClass = '';

  public static frontdeskroletypeId = 6;
  public static entitytypeserviceproviderId = 1;
  public static entitytypedoctorId = 2;
  public static entitytypejointclinicId = 3;


  public static APP_TYPES_COLOR_CODES: Map<number, string> = new Map<number, string>([
    [1, '#3F51B5'], // -- PRIVILEGE
    [2, '#2dce89'], // -- FREE
    [3, '#E3724B'], // -- EMERGENCY
    [4, '#7b807d'], // -- ROUTINE
    [5, '#bdbd0a'], // -- MINOR ILLNESS
    [6, '#d8506b'], // -- LATE EVENING SURGERY
    [7, '#11cdef'] // -- DENTISTS
  ]);

  public static readonly appointmentStausArray = [
    { id: 1, name: 'TENTATIVE' },
    { id: 2, name: 'CONFIRMED' },
    { id: 3, name: 'RESCHEDULE' },
    { id: 4, name: 'CANCELLED' },
    { id: 5, name: 'ABSENT' },
    { id: 6, name: 'COMPLETE' },
    { id: 7, name: 'NOTSERVED' }
  ];
  public static readonly queueStausArray = [
    { id: 1, name: 'NEXT' },
    { id: 2, name: 'CALLING' },
    { id: 3, name: 'ABSENT' },
    { id: 4, name: 'INCONSULTATION' },
    { id: 5, name: 'COMPLETE' },
    { id: 6, name: 'ONHOLD' },
    { id: 7, name: 'SKIP' },
    { id: 8, name: 'NOTSERVED' }
  ];

  // Section Template Grid Type Array
  public static readonly sectionTemplateGridTypeArray = [
    {
      id: 1,
      name: 'Blank Devide Template',
      key: 'grid_template_1',
      small_img_path: './assets/img/section-templates/Blank-grid.png',
      big_img_path: './assets/img/placeholder-image.jpg',
      isGridTemplateEnabled: false
    },
    {
      id: 2,
      name: 'Horizontal Devide Template',
      key: 'grid_template_2',
      small_img_path: './assets/img/section-templates/horizontal.png',
      big_img_path: './assets/img/placeholder-image.jpg',
      isGridTemplateEnabled: false
    },
    {
      id: 3,
      name: 'Vertical Devide Template',
      key: 'grid_template_3',
      small_img_path: './assets/img/section-templates/vertical.png',
      big_img_path: './assets/img/placeholder-image.jpg',
      isGridTemplateEnabled: false
    },
    {
      id: 4,
      name: 'Squre Devide Template',
      key: 'grid_template_4',
      small_img_path: './assets/img/section-templates/square.png',
      big_img_path: './assets/img/placeholder-image.jpg',
      isGridTemplateEnabled: false
    }
  ];
  // Section Template Type Array
  public static readonly sectionTemplateTypeArray = [
    {
      id: 1,
      name: 'Doctor, Calling, Queue Patient List Template',
      key: 'display_template_2',
      small_img_path: './assets/img/section-templates/doctor_calling_queue.png',
      big_img_path: './assets/img/placeholder-image.jpg',
    },
    {
      id: 2,
      name: 'Doctor, Calling Patient List Template',
      key: 'display_template_1',
      small_img_path: './assets/img/section-templates/doctor_calling.png',
      big_img_path: './assets/img/placeholder-image.jpg',
    },
    {
      id: 3,
      name: 'Doctor, Queue Patient List Bottom Template',
      key: 'display_template_3',
      small_img_path: './assets/img/section-templates/doctor_queue_bottom.png',
      big_img_path: './assets/img/placeholder-image.jpg',
    },
    {
      id: 4,
      name: 'Doctor, Queue Patient List Side Template',
      key: 'display_template_4',
      small_img_path: './assets/img/section-templates/doctor_queue_side.png',
      big_img_path: './assets/img/placeholder-image.jpg',
    },
    {
      id: 5,
      name: 'Doctor, Calling, Next Patient List Template',
      key: 'display_template_5',
      small_img_path: './assets/img/section-templates/doctor_calling_next.png',
      big_img_path: './assets/img/placeholder-image.jpg',
    },
    {
      id: 6,
      name: 'Doctor, Calling, Next, Queue Patient List Template',
      key: 'display_template_6',
      small_img_path: './assets/img/section-templates/doctor_calling_next_queue.png',
      big_img_path: './assets/img/placeholder-image.jpg',
    },
    {
      id: 7,
      name: 'Calling Template',
      key: 'display_template_7',
      small_img_path: './assets/img/section-templates/calling.png',
      big_img_path: './assets/img/placeholder-image.jpg',
    },
    {
      id: 8,
      name: 'Calling Template',
      key: 'display_template_8',
      small_img_path: './assets/img/section-templates/room-queue.png',
      big_img_path: './assets/img/room-queue.jpg',
    },
    {
      id: 9,
      name: 'Doctor Room Calling Next',
      key: 'display_template_9',
      small_img_path: './assets/img/section-templates/template9.png',
      big_img_path: './assets/img/room-queue.jpg',
    }
  ];

  // Section Doctor Fields Selection Array
  public static readonly sectionDoctorFieldSelectionArray = [
    {
      id: 1,
      key: 'name',
      name: 'Name',
      isSelected: false
    },
    {
      id: 2,
      key: 'speciality',
      name: 'Specility',
      isSelected: false
    },
    {
      id: 3,
      key: 'profile_image',
      name: 'Profile Image',
      isSelected: false
    },
    {
      id: 4,
      key: 'room_list',
      name: 'Room Name',
      isSelected: false
    },
  ];

  // Section Queue Fields Selection Array
  public static readonly sectionQueueFieldSelectionArray = [
    {
      id: 1,
      key: 'name',
      name: 'Name',
      isSelected: false
    },
    {
      id: 2,
      key: 'token',
      name: 'Token',
      isSelected: false
    },
    {
      id: 3,
      key: 'contact',
      name: 'Contact Number',
      isSelected: false
    },
    {
      id: 4,
      key: 'wait_time',
      name: 'Wait Time',
      isSelected: false
    },
  ];
  // Section Calling Fields Selection Array
  public static readonly sectionCallingFieldSelectionArray = [
    {
      id: 1,
      key: 'name',
      name: 'Name',
      isSelected: false
    },
    {
      id: 2,
      key: 'token',
      name: 'Token',
      isSelected: false
    },
    {
      id: 3,
      key: 'contact',
      name: 'Contact Number',
      isSelected: false
    },
    {
      id: 4,
      key: 'room_name',
      name: 'Room Name',
      isSelected: false
    },
  ];
  // Section Next Fields Selection Array
  public static readonly sectionNextFieldSelectionArray = [
    {
      id: 1,
      key: 'name',
      name: 'Name',
      isSelected: false
    },
    {
      id: 2,
      key: 'token',
      name: 'Token',
      isSelected: false
    },
    {
      id: 3,
      key: 'contact',
      name: 'Contact Number',
      isSelected: false
    },
  ];

  // ----------------------------  Feed Template Set For ----------------

  public static readonly feedbackTemplateSetFor = [
    {
      id: 1,
      key: 'hospital',
      name: 'Hospital',
      isSelected: false
    },
    {
      id: 2,
      key: 'department',
      name: 'Department',
      isSelected: false
    },
    {
      id: 3,
      key: 'entity',
      name: 'Provider',
      isSelected: false
    },
    {
      id: 4,
      key: 'appointment_type',
      name: 'Appointment Type',
      isSelected: false
    }
  ];

  // ----------------------------  Feed Template Set For ----------------


  // ----------------------------  Reminder Setting Set For ----------------

  public static readonly reminderSettingsFor = [
    {
      id: 1,
      key: 'hospital',
      name: 'Hospital',
      isSelected: false
    },
    {
      id: 2,
      key: 'department',
      name: 'Department',
      isSelected: false
    },
    {
      id: 3,
      key: 'entity',
      name: 'Entity',
      isSelected: false
    },
    {
      id: 4,
      key: 'appointment_type',
      name: 'Appointment Type',
      isSelected: false
    }
  ];

  // ----------------------------   Reminder Setting Set For ----------------

  public static readonly apiDateFormate = 'MM/DD/YYYY';

  public static readonly apiTimeFormate = 'HH:mm';

  // ------------------- Parallel max patient book in single time slot ------------------------
  public static readonly maxParallelPatientBook = 2;

  // ------------------- Entity Rule Array List ------------------------
  public static readonly defaultTimePerPatientArray = [5, 10, 15, 20, 30, 60];

  public static readonly appointmentTimeSlotArray = [30, 60, 90, 120];

  public static readonly CALLING_LIMIT = 2;

  // -------------------Appopintment Print Array List ------------------------
  public static readonly APPOINTMENT_PRINT_HEAD_LIST = ['No', 'Time', 'Type', 'UHID', 'Name', 'Sex', 'Age', 'Mobile', 'Visit Type', 'Taken By', 'Remark'];

  public static readonly DEFAULT_LANDING_SETTING_PATH = '/app/qms/settings/settings_menu/timeFormate';

  public static readonly EMR_IPD_USER_DETAILS = {
    docId: 2800,
    type: 'ip',
    patientId: 772336,
    locationId: 8,
    hospitalId: 8,
    doctor_name: 'Siya Rao',
    specialityInfo: {
      specialityId: '9',
      specialityName: 'Speciality 2'
    },
    departmentInfo: {
      departmentId: '5',
      departmentName: 'Haematology'
    },
    ipd_id: 100,
    addmittedPatientData: [
      {
        'ipdId': '30',
        'hospital_pat_id': '253370',
        'hospital_location_id': '178',
        'admission_date': '2019-04-25 13:20:29',
        'discharge_date': null,
        'ward': null,
        'bed_no': null,
        'date_created': '2019-04-25 13:20:29',
        'created_by': null,
        'primary_doc_id': '3119',
        'id': '772373',
        'doc_id': '3119',
        'patient_name': 'HIMANSHU PAHARIYA',
        'patient_fname': 'HIMANSHU',
        'patient_mname': '',
        'patient_lname': 'PAHARIYA',
        'patient_gender': 'MALE',
        'patient_email': '',
        'patient_phon': '7058195844',
        'patient_phone_code': '101',
        'patient_alt_phon': null,
        'age': '',
        'blood_group': null,
        'patient_dob': '',
        'patient_add1': null,
        'patient_add2': null,
        'patient_city': null,
        'patient_area': null,
        'patient_state': null,
        'patient_country': null,
        'patient_pin': null,
        'reference_id': null,
        'temp_reference_id': null,
        'salutation': '1',
        'referred_doctor_id': '30130',
        'relation': 'son',
        'outstanding_amount': null,
        'is_referred': '0',
        'is_dead': '0',
        'death_date': null,
        'death_reason': null,
        'pan_number': null,
        'aadhaar_number': null,
        'source': null,
        'paperless_patient_id': null,
        'modified_by': '3122',
        'creation_date': '2019-04-11 11:20:49',
        'last_updation_date': '2019-06-14 15:54:55',
        'is_deleted': '0',
        'password': 'e267d2d9dade02e9558498f6e43987e2',
        'mobile_token': null,
        'web_token': null,
        'lastloginTime': null,
        'last_logout_time': null,
        'last_activity_time': null,
        'patient_origin': null,
        'auth_facebook_token': null,
        'auth_gmail_token': null,
        'profile_photo': null,
        'myrescribe_pat_id': null,
        'age_last_update': null,
        'opt_out_status': '0',
        'opt_out_date': null,
        'opt_out_comment': null,
        'patient_id': '772373',
        'ref_name': '',
        'ref_email': '',
        'ref_contact': '',
        'ref_doc_id': null,
        'referred_type_id': '1',
        'ref_patient_id': null,
        'ref_description': '',
        'city_name': null,
        'city_id': null,
        'area_name': null,
        'blood_group_name': null,
        'registerFor': null,
        'reference_creation_date': '2019-04-11 11:20:48',
        'state_name': null,
        'country_name': null
      },
      {
        'ipdId': '39',
        'hospital_pat_id': '253369',
        'hospital_location_id': '178',
        'admission_date': '2019-04-26 15:26:23',
        'discharge_date': null,
        'ward': null,
        'bed_no': null,
        'date_created': '2019-04-26 15:26:23',
        'created_by': null,
        'primary_doc_id': '3119',
        'id': '772372',
        'doc_id': '3119',
        'patient_name': 'VISHAL VISHAL',
        'patient_fname': 'VISHAL',
        'patient_mname': '',
        'patient_lname': 'VISHAL',
        'patient_gender': 'MALE',
        'patient_email': '',
        'patient_phon': '9763130904',
        'patient_phone_code': '101',
        'patient_alt_phon': null,
        'age': '35',
        'blood_group': null,
        'patient_dob': '',
        'patient_add1': null,
        'patient_add2': null,
        'patient_city': null,
        'patient_area': null,
        'patient_state': null,
        'patient_country': null,
        'patient_pin': null,
        'reference_id': null,
        'temp_reference_id': null,
        'salutation': '1',
        'referred_doctor_id': '30129',
        'relation': 'other',
        'outstanding_amount': null,
        'is_referred': '0',
        'is_dead': '0',
        'death_date': null,
        'death_reason': null,
        'pan_number': null,
        'aadhaar_number': null,
        'source': null,
        'paperless_patient_id': null,
        'modified_by': '3122',
        'creation_date': '2019-04-11 11:18:43',
        'last_updation_date': '2019-06-14 15:55:39',
        'is_deleted': '0',
        'password': 'e267d2d9dade02e9558498f6e43987e2',
        'mobile_token': null,
        'web_token': null,
        'lastloginTime': null,
        'last_logout_time': null,
        'last_activity_time': null,
        'patient_origin': null,
        'auth_facebook_token': null,
        'auth_gmail_token': null,
        'profile_photo': null,
        'myrescribe_pat_id': null,
        'age_last_update': null,
        'opt_out_status': '0',
        'opt_out_date': null,
        'opt_out_comment': null,
        'patient_id': '772372',
        'ref_name': '',
        'ref_email': '',
        'ref_contact': '',
        'ref_doc_id': null,
        'referred_type_id': '1',
        'ref_patient_id': null,
        'ref_description': '',
        'city_name': null,
        'city_id': null,
        'area_name': null,
        'blood_group_name': null,
        'registerFor': null,
        'reference_creation_date': '2019-04-11 11:18:43',
        'state_name': null,
        'country_name': null
      }
    ],
    localStorageData: { "authToken": "$1$zx6KH8fo$RHGWbu0kCmez7y/U0EkY20", "userId": "3104", "userInfo": { "id": "2825", "doctor_name": "Meenakumari", "role_type": null, "doc_email": "meena@gmail.com" }, "userRolesData": [{ "role_id": "1", "role_key": "doctor", "display_name": "Doctor" }, { "role_id": "3", "role_key": "admin", "display_name": "Admin" }], "locationData": [{ "hospital_id": "119", "hospital_name": "PD HINDUJA", "location_id": "148", "location_name": "Mahim", "address": "Rohini West Metro, Swarn Jayanti Park, Sector 10, Rohini, Delhi, India", "street_name": null, "landmark": null, "city_name": "Mumbai" }, { "hospital_id": "119", "hospital_name": "PD HINDUJA", "location_id": "149", "location_name": "Rohini", "address": "Rohini Silver Screens, Koyambedu, Chennai, Tamil Nadu, India", "street_name": null, "landmark": null, "city_name": "New Delhi" }, { "hospital_id": "141", "hospital_name": "Appointment test Hospital", "location_id": "178", "location_name": "Overlapping", "address": "Rohini, New Delhi, Delhi, India", "street_name": null, "landmark": null, "city_name": "Pune" }, { "hospital_id": "141", "hospital_name": "Appointment test Hospital", "location_id": "179", "location_name": "Non Overlapping", "address": "Rohini Sector 9, Sector 9, Rohini, Delhi, India", "street_name": null, "landmark": null, "city_name": "Pune Cantonment" }], "fileGlobalUrl:": "https://s3.ap-south-1.amazonaws.com/drrescribeattachments", "userLoggedIn": true, "departmentInfo": { "departmentId": "5", "departmentName": "Haematology" }, "specialityInfo": { "specialityId": "9", "specialityName": "Speciality 2" }, "defualt_location": { "hospital_id": "119", "hospital_name": "PD HINDUJA", "location_id": "148", "location_name": "Mahim", "address": "Rohini West Metro, Swarn Jayanti Park, Sector 10, Rohini, Delhi, India", "street_name": null, "landmark": null, "city_name": "Mumbai" }, "defualt_hospital": { "hospital_id": "119", "hospital_name": "PD HINDUJA", "location_id": "148", "location_name": "Mahim", "address": "Rohini West Metro, Swarn Jayanti Park, Sector 10, Rohini, Delhi, India", "street_name": null, "landmark": null, "city_name": "Mumbai" }, "defualt_role": { "role_id": "2", "role_key": "receptionist", "display_name": "Nurse" }, "userParentId": "3104" }
  };
  public static readonly LANGUAGE_LIST = [{ 'name': 'English', 'id': '1' }, { 'name': 'Hindi', 'id': '2' }, { 'name': 'Marathi', 'id': '3' }];

  public static readonly EMR_DEFAULT_REQ_HEADERS = {
    'Auth-Key': 'simplerestapi',
    'Client-Service': 'qms-client',
    'User-ID': '2800',
    'Parent-ID': '2800',
    'Authorization-Token': '$1$5peD9ler$N/5GHZNAOGNw9hUFTqOsh/',
    'Hospital-ID': '8',
    'Location-ID': '8'
  };

  public static radioInvestigationKey = 'Radiology';
  public static labInvestigationKey = 'Lab';
  public static investigationKey = 'investigation';
  public static icuFlowSheetHandOverParamLog = 'icu_flow_sheet_hand_over_param_log';
  public static icuFlowSheetBslValue = 'icu_flow_sheet_bsl_freq_value';
  public static icuFlowSheetSofaScore = 'icu_flow_sheet_sofa_score_value';
  public static icuFlowSheetPupilSize = 'icu_flow_sheet_pupil_size_value';
  public static icuFlowSheetPainScale = 'icu_flow_sheet_pain_scale_value';
  public static icuFlowSheetAssessmentChart = 'icu_flow_sheet_assessment_chart_value';
  public static careTeam = 'care_team_data';
  public static patientDiagnosisData = 'patient_diagnosis_data';
  public static printSettingArray = [
    {
      name: 'Bullet',
      key: 'bullet'
    },
    {
      name: 'Comma',
      key: 'comma'
    },
    {
      name: 'Pipe',
      key: 'pipe'
    }
  ];
  public static examinationSaveSettingArray = [
    {
      name: 'No Master Save',
      key: 'no_master_save'
    },
    {
      name: 'Auto Master Save',
      key: 'auto_master_save'
    },
    {
      name: 'Manually Master Save',
      key: 'manually_master_save'
    },
  ];
  public static notificationIpdRound = 1;
  public static notificationLabReport = 2;
  public static notificationApproveOrder = 3;
  public static notificationDischargePatient = 4;
  public static notificationReferPatient = 5;
  public static notificationTransferPatient = 6;
  public static ServiceType = { IPD: 1, OPD: 2, ER: 3, DAYCARE: 4 };

  // Patient Encounter status
  public static readonly encounterStatus = {
    MarkForDischarge: "MARK FOR DISCHARGE",
    SendForBiling: "SEND FOR BILLING",
    DischargeApproved: "DISCHARGE APPROVED",
    ActualDischarge: "ACTUAL DISCHARGE"
  }

  public static readonly userRoleType = {
    superAdmin: {
      id: 1,
      name: 'SUPER ADMIN',
      key: 'super_admin'
    },
    admin: {
      id: 2,
      name: 'ADMIN',
      key: 'admin'
    },
    doctor: {
      id: 3,
      name: 'DOCTOR',
      key: 'doctor'
    },
    nurse: {
      id: 4,
      name: 'NURSE',
      key: 'nurse'
    },
    teleCaller: {
      id: 5,
      name: 'TELE CALLER',
      key: 'tele_caller'
    },
    frontDesk: {
      id: 6,
      name: 'FRONT DESK',
      key: 'front_desk'
    },
    serviceOperator: {
      id: 7,
      name: 'SERVICE OPERATOR',
      key: 'service_operator'
    },
    assistantSurgeon: {
      id: 0,
      name: 'ASSISTANT SURGEON',
      key: 'assistant_surgeon'
    },
    surgeon: {
      id: 0,
      name: 'SURGEON',
      key: 'surgeon'
    },
    anaesthetist: {
      id: 0,
      name: 'ANAESTHETIST',
      key: 'anaesthetist'
    },
    scrubNurse: {
      id: 0,
      name: 'SCRUB NURSE',
      key: 'scrub_nurse'
    },
  }

  public static readonly calendarViewSettingForOt: string = 'calendar_view_setting_for_ot';
  public static readonly otUserGrpName = {
    surgeon: 'SURGEON',
    anaesthetist: 'ANAESTHETIST',
    scrub_nurse: 'SCRUB_NURSE'
  };

  public static readonly otUserGrpType = {
    primary: 'PRIMARY',
    additional: 'ADDITIONAL',
    assistant: 'ASSISTANT'
  };

}

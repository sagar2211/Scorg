
import { Injectable, Output, EventEmitter } from '@angular/core';
import { PermissionsConstants } from '../shared/constants/PermissionsConstants';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {

  constructor(
  ) { }

  sideMenuListAppointment = [
    {
      linkKey: 'manage ',
      name: 'Manage ',
      isActive: false,
      cssClass: 'icon-calendar-day',
      permission: [
        PermissionsConstants.View_Manage_Appointment,
        PermissionsConstants.View_Manage_All_Appointments,
      ],
      children: [
        {
          linkKey: 'appointments/list/appointmentsList',
          name: 'Manage Appointments',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-manage-appointment',
          isVisible: true,
          permission: PermissionsConstants.View_Manage_Appointment
        },
        {
          linkKey: 'appointments/listfd/fduserappointmentsList',
          name: 'Manage All Appointments',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-manage-all-appointment',
          isVisible: true,
          permission: PermissionsConstants.View_Manage_All_Appointments
        },
      ]
    },
    {
      linkKey: 'book',
      name: 'Book',
      isActive: false,
      cssClass: 'icon-calendar-day',
      permission: [
        PermissionsConstants.View_Call_Center_View,
        PermissionsConstants.View_Quick_Book_Appointment
      ],
      children: [
        {
          linkKey: 'appointments/search/searchAppointment',
          name: 'Call Center View',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-user-headset',
          isVisible: true,
          permission: PermissionsConstants.View_Call_Center_View
        },
        {
          linkKey: 'appointments/book/quickbookappointment',
          name: 'Quick Book Appointments',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-apt-status',
          isVisible: true,
          permission: PermissionsConstants.View_Quick_Book_Appointment
        }
      ]
    },
    {
      linkKey: 'calendar',
      name: 'Calendar',
      isActive: false,
      cssClass: 'icon-calendar-day',
      permission: [
        PermissionsConstants.View_Manage_Calendar,
        PermissionsConstants.View_Calendar_View
      ],
      children: [
        {
          linkKey: 'appointments/settings/entitySettings',
          name: 'Manage Calendar',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-manage-calender',
          isVisible: true,
          permission: PermissionsConstants.View_Manage_Calendar
        },
        {
          linkKey: 'appointments/calendarUser/calendar',
          name: 'Calendar View',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-calendar-alt',
          isVisible: true,
          permission: PermissionsConstants.View_Calendar_View
        }
      ]
    },
    {
      linkKey: 'patient',
      name: 'Patients',
      isActive: false,
      cssClass: 'icon-users',
      permission: [PermissionsConstants.Add_PatientMaster,
      PermissionsConstants.View_PatientMaster
      ],
      children: [
        {
          linkKey: 'appointments/patient/addPatient',
          name: 'Add Patient',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-user-plus',
          isVisible: true,
          permission: PermissionsConstants.Add_PatientMaster
        },
        {
          linkKey: 'appointments/patient/patientList',
          name: 'Patient List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-users',
          isVisible: true,
          permission: PermissionsConstants.View_PatientMaster
        },
        // {
        //   linkKey: 'appointments/patient/referpatientList',
        //   name: 'Refer Patient List',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-users',
        //   isVisible: !_.isUndefined(_.find(this.userInfo.assigenedApplication, (o) => o.app_name === 'EMR' && o.rights === true)) ? true : false,
        //   permission: PermissionsConstants.View_PatientMaster
        // }
      ]
    },
    {
      linkKey: 'reports',
      name: 'Reports',
      isActive: false,
      cssClass: 'icon-reports',
      permission: [PermissionsConstants.View_Reports],
      children: []
    }
  ];


  sideMenuListQms = [
    {
      linkKey: '',
      name: 'Home',
      isActive: false,
      cssClass: 'icon-home',
      permission: [PermissionsConstants.View_Admin_Dashboard,
      PermissionsConstants.View_DoctorDashboard,
      PermissionsConstants.View_Call_Center_Dashboard,
      PermissionsConstants.View_Front_Desk
      ],
      children: [
        {
          linkKey: 'dashboard/admin',
          name: 'Admin Dashboard',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-queue-setting',
          isVisible: true,
          permission: PermissionsConstants.View_Admin_Dashboard
        },
        {
          linkKey: 'dashboard/doctor',
          name: 'Doctor Dashboard',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-user-md',
          isVisible: true,
          permission: PermissionsConstants.View_DoctorDashboard
        },
        // {
        //   linkKey: 'dashboard/callCenter',
        //   name: 'Call Center Dashboard',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-user-headset',
        //   isVisible: true,
        //   permission: PermissionsConstants.View_Call_Center_Dashboard
        // },
        {
          linkKey: 'dashboard/frontDesk',
          name: 'Front Desk Dashboard',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-front-desk-dashboard',
          isVisible: true,
          permission: PermissionsConstants.View_Front_Desk
        },
        // {
        //   linkKey: 'entityUser',
        //   name: 'Entity User',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-dashboard',
        //   isVisible: true,
        //   permission: PermissionsConstants.View_EntityUser
        // }
      ]
    },
    {
      linkKey: 'scheduleSetting',
      name: 'Schedule',
      isActive: false,
      cssClass: 'icon-clipboard-list',
      permission: [PermissionsConstants.Add_Schedule,
      PermissionsConstants.View_Schedule,
      PermissionsConstants.View_Front_Desk_Entity_Mapping,
        //PermissionsConstants.Add_Front_Desk_Entity_Mapping,
      ],
      children: [
        {
          linkKey: 'schedule/addScheduleMaster',
          name: 'Add Schedule',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-notes-medical',
          isVisible: true,
          permission: PermissionsConstants.Add_Schedule
        },
        {
          linkKey: 'schedule/activeScheduleList',
          name: 'Schedule List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-clipboard-list-check',
          isVisible: true,
          permission: PermissionsConstants.View_Schedule
        },
        {
          linkKey: 'schedule/updateTimeSchedule',
          name: 'Update Time Schedule',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-link',
          isVisible: false,
          permission: PermissionsConstants.Add_TimeSchedule
        },
        {
          linkKey: 'mapping/frontDeskentityMappingList',
          name: 'Front Desk Provider Mappings',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-front-desk-mapping',
          isVisible: true,
          permission: PermissionsConstants.View_Front_Desk_Entity_Mapping
        },
        {
          linkKey: 'mapping/frontDeskentityMapping',
          name: 'Add Front Desk Provider Mappings',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-front-desk-mapping',
          isVisible: false,
          permission: PermissionsConstants.Add_Front_Desk_Entity_Mapping
        }
      ]
    },
    {
      linkKey: 'queueSetting',
      name: 'Settings',
      isActive: false,
      cssClass: 'icon-queue-setting',
      permission: [PermissionsConstants.View_Room_Master,
      PermissionsConstants.View_Section_Master,
      // PermissionsConstants.Add_Section_Master,
      // PermissionsConstants.Update_Section_Master,
      PermissionsConstants.View_Room_Section_Mapping,
      // PermissionsConstants.Add_Room_Section_Mapping,
      PermissionsConstants.View_Room_Entity_Mapping,
      // PermissionsConstants.Update_Room_Entity_Mapping,
      // PermissionsConstants.Add_Room_Entity_Mapping,
      PermissionsConstants.View_Queue_Settings,
      PermissionsConstants.View_Time_Format_Settings,
      PermissionsConstants.View_Patient_Feedback_Settings,
      PermissionsConstants.View_Set_Feedback_Template,
      PermissionsConstants.View_Display_Field_Settings,
      PermissionsConstants.View_Templates,
      PermissionsConstants.View_Template_Mapping,
      PermissionsConstants.View_Reminder_Settings,
      PermissionsConstants.View_Display_Status_Settings,
      PermissionsConstants.View_Slot_Color_Settings,
      PermissionsConstants.View_App_Settings,
      PermissionsConstants.View_Section_Mapping_Details
      ],
      children: [
        {
          linkKey: 'room/roomList',
          name: 'Room Master',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-room',
          isVisible: true,
          permission: PermissionsConstants.View_Room_Master
        },
        {
          linkKey: 'location/locationList',
          name: 'Location Master',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-room',
          isVisible: true,
          permission: PermissionsConstants.Location_Master_View
        },
        {
          linkKey: 'section/sectionList',
          name: 'Section Master',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-chart-pie-alt',
          isVisible: true,
          permission: PermissionsConstants.View_Section_Master
        },
        {
          linkKey: 'section/addSection',
          name: 'Add Section',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-link',
          isVisible: false,
          permission: PermissionsConstants.Add_Section_Master
        },
        {
          linkKey: 'section/updateSection',
          name: 'Add Section',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-link',
          isVisible: false,
          permission: PermissionsConstants.Update_Section_Master
        },
        {
          linkKey: 'roomSection/roomSectionMapList',
          name: 'Room Section Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-room-section-map',
          isVisible: true,
          permission: PermissionsConstants.View_Room_Section_Mapping
        },
        {
          linkKey: 'roomSection/addRoomSectionMapping',
          name: 'Add Section Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-link',
          isVisible: false,
          permission: PermissionsConstants.Add_Room_Section_Mapping
        },
        {
          linkKey: `mapping/sectionDoctorMapping`,
          name: 'Section Mapping Details',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon fa-fw icon-room-section-map mr-1',
          isVisible: true,
          permission: PermissionsConstants.View_Section_Mapping_Details
        },
        {
          linkKey: 'entityRoom/entityRoomMapList',
          name: 'Room Provider Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-link',
          isVisible: true,
          permission: PermissionsConstants.View_Room_Entity_Mapping
        },
        {
          linkKey: 'entityRoom/updateEntityRoomMap',
          name: 'Room Provider Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-link',
          isVisible: false,
          permission: PermissionsConstants.Update_Room_Entity_Mapping
        },
        {
          linkKey: 'entityRoom/entityRoomMap',
          name: 'Add Provider Room',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-entity-room-map',
          isVisible: false,
          permission: PermissionsConstants.Add_Room_Entity_Mapping
        },
        // {
        //   linkKey: 'queueDisplaySettings',
        //   name: 'Display Settings',
        //   isActive: false,
        //   cssClass: 'icon-tv'
        // },
        // {
        //   linkKey: 'templates',
        //   name: 'Templates',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-templates',
        //   isVisible: true,
        //   permission: PermissionsConstants.View_Templates
        // },
        // {
        //   linkKey: 'templateMapping',
        //   name: 'Templates Mapping',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-templates-mapping',
        //   isVisible: true,
        //   permission: PermissionsConstants.View_Template_Mapping
        // },
        {
          linkKey: 'settings/settings_menu',
          name: 'Settings',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-cogs',
          isVisible: true,
          permission: PermissionsConstants.View_App_Settings
        },
      ]
    },
    {
      linkKey: 'appointments',
      name: 'Queue',
      isActive: false,
      cssClass: 'icon-calendar-day',
      permission: [PermissionsConstants.View_Queue,
      PermissionsConstants.View_Manage_Calendar,
      ],
      children: [
        {
          linkKey: 'qList',
          name: 'Queue List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-queue-list',
          isVisible: true,
          permission: PermissionsConstants.View_Queue
        },
        {
          linkKey: 'appointments/settings/entitySettings',
          name: 'Manage Calendar',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-manage-calender',
          isVisible: true,
          permission: PermissionsConstants.View_Manage_Calendar
        }
      ]
    },
    {
      linkKey: 'patient',
      name: 'Patients',
      isActive: false,
      cssClass: 'icon-users',
      permission: [PermissionsConstants.Add_PatientMaster,
      PermissionsConstants.View_PatientMaster
      ],
      children: [
        {
          linkKey: 'patient/addPatient',
          name: 'Add Patient',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-user-plus',
          isVisible: true,
          permission: PermissionsConstants.Add_PatientMaster
        },
        {
          linkKey: 'patient/patientList',
          name: 'Patient List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-users',
          isVisible: true,
          permission: PermissionsConstants.View_PatientMaster
        },
        // {
        //   linkKey: 'patient/referpatientList',
        //   name: 'Refer Patient List',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-users',
        //   isVisible: !_.isUndefined(_.find(this.userInfo.assigenedApplication, (o) => o.app_name === 'EMR' && o.rights === true)) ? true : false,
        //   permission: PermissionsConstants.View_PatientMaster
        // }
      ]
    },
    {
      linkKey: 'reports',
      name: 'Reports',
      isActive: false,
      cssClass: 'icon-reports',
      permission: [PermissionsConstants.View_Reports],
      children: []
    }
  ];

  redirecToLanding(permissionName, menuList) {
    let obj = {
      link: null,
      redirect: false
    }
    let loopRun = true;
    _.map(menuList, (main, mi) => {
      _.map(main.children, (child, ci) => {
        if (child.permission && child.permission === permissionName && loopRun) {
          loopRun = false;
          obj.redirect = true;
          obj.link = child.linkKey;
        }
      })
    });
    return obj;
  }
}


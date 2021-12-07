
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {

  constructor(
    private route: Router,
  ) { }

  sideMenuListEmr = [
    {
      linkKey: 'home',
      name: 'Home',
      isActive: false,
      cssClass: 'icon-home',
      permission: [
        PermissionsConstants.Admin_Dashboard_View,
        PermissionsConstants.Doctor_Dashboard_View
      ],
      children: [
        {
          linkKey: 'dashboard/doctor',
          name: 'Doctor Dashboard',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-user-md',
          isVisible: true,
          permission: PermissionsConstants.Doctor_Dashboard_View
        },
        {
          linkKey: 'dashboard/admin',
          name: 'Admin Dashboard',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-queue-setting',
          isVisible: true,
          permission: PermissionsConstants.Admin_Dashboard_View
        },
        // {
        //   linkKey: 'dashboard/nurse',
        //   name: 'Nurse Dashboard',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-front-desk-dashboard',
        //   isVisible: true,
        //   permission: PermissionsConstants.Nurse_Dashboard_View
        // },
      ]
    },
    {
      linkKey: 'patients',
      name: 'Patients',
      isActive: false,
      cssClass: 'icon-patients',
      permission: [
        PermissionsConstants.Patient_Add,
        PermissionsConstants.Patient_View
      ],
      children: [
        {
          linkKey: 'patientData/patientList',
          name: 'Patient List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.Patient_View
        },
        {
          linkKey: 'patientData/addPatient',
          name: 'Add Patient',
          isActive: false,
          isFavourite: false,
          cssClass: 'fa-plus',
          isVisible: true,
          permission: PermissionsConstants.Patient_Add
        }
      ]
    },
    {
      linkKey: 'orders',
      name: 'Order',
      isActive: false,
      cssClass: 'icon-emr-orders',
      permission: [
        PermissionsConstants.Doctor_Dashboard_View
      ],
      children: [
        {
          linkKey: 'service-order',
          name: 'Service Order',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-emr-orders',
          isVisible: true,
          permission: PermissionsConstants.Doctor_Dashboard_View
        }
      ]
    },
    // {
    //   linkKey: 'reports',
    //   name: 'Reports',
    //   isActive: false,
    //   cssClass: 'icon-reports',
    //   permission: [
    //     PermissionsConstants.Doctor_Dashboard_View
    //   ],
    //   children: [
    //     {
    //       linkKey: 'reports/report1',
    //       name: 'Report 1',
    //       isActive: false,
    //       isFavourite: false,
    //       cssClass: 'icon-reports',
    //       isVisible: true,
    //       permission: PermissionsConstants.Doctor_Dashboard_View
    //     },
    //     {
    //       linkKey: 'reports/report2',
    //       name: 'Report 2',
    //       isActive: false,
    //       isFavourite: false,
    //       cssClass: 'icon-reports',
    //       isVisible: true,
    //       permission: PermissionsConstants.Doctor_Dashboard_View
    //     },
    //   ]
    // }
  ];
  sideMenuListNursing = [
    {
      linkKey: 'home',
      name: 'Nursing',
      isActive: false,
      cssClass: 'icon-nurse',
      permission: [
      ],
      children: [
        {
          linkKey: 'nursingBed/display',
          name: 'Nursing Bed Display',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-bed',
          isVisible: true,
          permission: null
        }
      ]
    },
    {
      linkKey: 'patients',
      name: 'Patients',
      isActive: false,
      cssClass: 'icon-patients',
      permission: [
        PermissionsConstants.Patient_Add,
        PermissionsConstants.Patient_View
      ],
      children: [
        {
          linkKey: 'patientData/patientList',
          name: 'Patient List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.Patient_Add
        },
        {
          linkKey: 'patientData/addPatient',
          name: 'Add Patient',
          isActive: false,
          isFavourite: false,
          cssClass: 'fa-plus',
          isVisible: true,
          permission: PermissionsConstants.Patient_View
        }
      ]
    },
    {
      linkKey: 'mapping',
      name: 'Mapping',
      isActive: false,
      cssClass: 'icon-masters',
      permission: [],
      children: [
        {
          linkKey: 'nurseMapping/nursingStationMapping',
          name: 'Nursing Station To Nurse Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-masters',
          isVisible: true,
          permission: null
        }
      ]
    },
    {
      linkKey: 'deathRegister',
      name: 'Death Rigister',
      isActive: false,
      cssClass: 'icon-reports',
      permission: [

      ],
      children: [
        {
          linkKey: 'deathRegister/list',
          name: 'List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-reports',
          isVisible: true,
          permission: null
        },
        {
          linkKey: 'deathRegister/addPatient',
          name: 'Add',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-reports',
          isVisible: true
        }
      ]
    },
    {
      linkKey: 'mlc',
      name: 'MLC',
      isActive: false,
      cssClass: 'icon-reports',
      permission: [

      ],
      children: [
        {
          linkKey: 'mlc/list',
          name: 'List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-reports',
          isVisible: true,
          permission: null
        },
        {
          linkKey: 'mlc/addPatient',
          name: 'Add',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-reports',
          isVisible: true
        }
      ]
    },
    // {
    //   linkKey: 'settings',
    //   name: 'Settings',
    //   isActive: false,
    //   cssClass: 'icon-cogs',
    //   permission: [],
    //   children: [
    //     {
    //       linkKey: 'nurseSettings/settingOne',
    //       name: 'Setting 1',
    //       isActive: false,
    //       isFavourite: false,
    //       cssClass: 'icon-cogs',
    //       isVisible: true,
    //       permission: null
    //     }
    //   ]
    // },
  ];
  sideMenuListDischarge = [
    {
      linkKey: 'discharge',
      name: 'Discharge',
      isActive: false,
      cssClass: 'icon-discharge',
      permission: [],
      children: [
        {
          linkKey: 'summery/patientDischarge',
          name: 'Discharge Summary List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-discharge',
          isVisible: true,
          // permission: PermissionsConstants.OT_Parameter_View
        },
        // {
        //   linkKey: 'summery/patientDischargeList',
        //   name: 'Patient Discharge List',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-discharge',
        //   isVisible: true,
        //   // permission: PermissionsConstants.OT_Parameter_View
        // }
      ]
    }
  ];
  sideMenuListEmrSetting = [
    {
      linkKey: 'chart',
      name: 'Chart',
      isActive: false,
      cssClass: 'icon-cogs',
      permission: [
        PermissionsConstants.Patient_Chart_View,
        PermissionsConstants.Patient_Chart_Add
      ],
      children: [
        {
          linkKey: 'charts/patient-chart-list',
          name: 'Chart List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.Patient_Chart_View
        },
        {
          linkKey: 'charts/patient-chart/-1',
          name: 'Add Chart',
          isActive: false,
          isFavourite: false,
          cssClass: 'fa-plus',
          isVisible: true,
          permission: PermissionsConstants.Patient_Chart_Add
        }
      ]
    },

    {
      linkKey: 'masters',
      name: 'Masters',
      isActive: false,
      cssClass: 'icon-masters',
      permission: [PermissionsConstants.Dept_Ward_Mapping_View,
      PermissionsConstants.RMO_Dept_Mapping_View,
      PermissionsConstants.Speciality_Dept_Mapping_View,
      PermissionsConstants.Nurse_Ward_Mapping_View,
      PermissionsConstants.RMO_Doctor_Mapping_View,
      PermissionsConstants.Medicine_Favorite_View,
      PermissionsConstants.Diagnosis_Favorite_View,
      PermissionsConstants.Complaint_Favorite_View,
      PermissionsConstants.Radio_Investigation_Favorite_View,
      PermissionsConstants.Lab_Investigation_Favorite_View,
      PermissionsConstants.Vitals_View,
      PermissionsConstants.Vitals_Add,
      PermissionsConstants.Vital_Mapping_View,
      PermissionsConstants.Vital_Mapping_Add
      ],
      children: [
        {
          linkKey: 'mapping/departmentToWard',
          name: 'Department To Ward Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-masters',
          isVisible: true,
          permission: PermissionsConstants.Dept_Ward_Mapping_View
        },
        {
          linkKey: 'mapping/userToDepartment',
          name: 'RMO To Department Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-masters',
          isVisible: true,
          permission: PermissionsConstants.RMO_Dept_Mapping_View
        },
        // {
        //   linkKey: 'mapping/specialityToDepartment',
        //   name: 'Specility To Department Mapping',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-masters',
        //   isVisible: true,
        //   permission: PermissionsConstants.Speciality_Dept_Mapping_View
        // },
        {
          linkKey: 'mapping/rmoToDoctor',
          name: 'RMO To Doctor Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-masters',
          isVisible: true,
          permission: PermissionsConstants.RMO_Doctor_Mapping_View
        },
        // {
        //   linkKey: 'favorites/medicine',
        //   name: 'Medicine Favorites',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-masters',
        //   isVisible: true,
        //   permission: PermissionsConstants.Medicine_Favorite_View
        // },
        // {
        //   linkKey: 'favorites/diagnosis',
        //   name: 'Diagnosis Favorites',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-masters',
        //   isVisible: true,
        //   permission: PermissionsConstants.Diagnosis_Favorite_View
        // },
        // {
        //   linkKey: 'favorites/complaints',
        //   name: 'Complaints Favorites',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-masters',
        //   isVisible: true,
        //   permission: PermissionsConstants.Complaint_Favorite_View
        // },
        // {
        //   linkKey: 'favorites/radioInvestigation',
        //   name: 'Radio Investigation Favorites',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-masters',
        //   isVisible: true,
        //   permission: PermissionsConstants.Radio_Investigation_Favorite_View
        // },
        // {
        //   linkKey: 'favorites/labInvestigation',
        //   name: 'Lab Investigation Favorites',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-masters',
        //   isVisible: true,
        //   permission: PermissionsConstants.Lab_Investigation_Favorite_View
        // },
        {
          linkKey: 'vitals/masterList',
          name: 'Vitals Master List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.Vitals_View
        },
        {
          linkKey: 'vitals/addMaster',
          name: 'Add Vitals Master',
          isActive: false,
          isFavourite: false,
          cssClass: 'fa-plus',
          isVisible: true,
          permission: PermissionsConstants.Vitals_Add
        },
        {
          linkKey: 'vitals/mappingList',
          name: 'Vitals Mapping List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.Vital_Mapping_View
        },
        {
          linkKey: 'vitals/addMapping',
          name: 'Add Vitals Mapping',
          isActive: false,
          isFavourite: false,
          cssClass: 'fa-plus',
          isVisible: true,
          permission: PermissionsConstants.Vital_Mapping_Add
        }
      ]
    },
    {
      linkKey: 'patient_menu',
      name: 'Patient Menu',
      isActive: false,
      cssClass: 'icon-cogs',
      permission: [
        PermissionsConstants.Patient_Menu_Builder_View
      ],
      children: [
        {
          linkKey: 'charts/patient-menu-builder',
          name: 'Patient Menu Builder',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-patients',
          isVisible: true,
          permission: PermissionsConstants.Patient_Menu_Builder_View
        },

      ]
    },
    {
      linkKey: 'templats',
      name: 'Templates Builder',
      isActive: false,
      cssClass: 'icon-cogs',
      permission: [
        PermissionsConstants.FAQ_Template_View,
        PermissionsConstants.Score_Template_View,
        PermissionsConstants.Score_Template_Add
      ],
      children: [
        {
          linkKey: 'faqTemplates/list',
          name: 'FAQ Template List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-list',
          isVisible: true,
          permission: PermissionsConstants.FAQ_Template_View
        },
        {
          linkKey: 'scoreTemplate/list',
          name: 'Score Template',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-desktop',
          isVisible: true,
          permission: PermissionsConstants.Score_Template_View
        },
        {
          linkKey: 'scoreTemplate/template/add',
          name: 'Add Score Template',
          isActive: false,
          isFavourite: false,
          cssClass: 'fa-plus',
          isVisible: true,
          permission: PermissionsConstants.Score_Template_Add
        }
      ]
    },
    {
      linkKey: 'examination',
      name: 'Examination',
      isActive: false,
      cssClass: 'icon-cogs',
      permission: [
        PermissionsConstants.Examination_Label_View
      ],
      children: [
        {
          linkKey: 'examinationLabel/list',
          name: 'Examination Label',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-cogs',
          isVisible: true,
          permission: PermissionsConstants.Examination_Label_View
        },
      ]
    },
    // {
    //   linkKey: 'prescription',
    //   name: 'Prescription',
    //   isActive: false,
    //   cssClass: 'icon-cogs',
    //   permission: [
    //     PermissionsConstants.Prescription_Template_View,
    //   ],
    //   children: [
    //     {
    //       linkKey: 'prescriptionTemplate/list',
    //       name: 'Prescription Template',
    //       isActive: false,
    //       isFavourite: false,
    //       cssClass: 'icon-cogs',
    //       isVisible: true,
    //       permission: PermissionsConstants.Prescription_Template_View
    //     },
    //     {
    //       linkKey: 'prescriptionTemplate/template/add',
    //       name: 'Add Prescription Template',
    //       isActive: false,
    //       isFavourite: false,
    //       cssClass: 'fa-plus',
    //       isVisible: true,
    //       permission: PermissionsConstants.Prescription_Template_View
    //     },
    //   ]
    // },
    {
      linkKey: 'settings',
      name: 'Settings',
      isActive: false,
      cssClass: 'icon-cogs',
      permission: [],
      children: [
        {
          linkKey: 'suggestionConfiguration/suggestionSetting',
          name: 'Suggestions Configuration',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-cogs',
          isVisible: true,
          permission: PermissionsConstants.Suggestion_Configuration_View
        },
        {
          linkKey: 'ordersSettings/statusSetting',
          name: 'Order Status Setting',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-cogs',
          isVisible: true,
          permission: null
        },
      ]
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

  redirectTo(userPermission, userInfo, key, loginFor, nursingStationId) {
    let menuList = [];
    if (key.toLowerCase() === 'emr') {
      key = 'DOCTOR DESK';
      menuList = this.sideMenuListEmr;
    } else if (key.toLowerCase() === 'emr-settings') {
      key = 'EMR SETTINGS';
      menuList = this.sideMenuListEmrSetting;
    } else if (key.toLowerCase() === 'nursing') {
      key = 'NURSING';
      menuList = this.sideMenuListNursing;
    } else if (key.toLowerCase() === 'discharge') {
      key = 'DISCHARGE';
      menuList = this.sideMenuListDischarge;
    }
    const appData = _.find(userInfo.assigenedApplication, d => {
      return d.app_name === key;
    });
    if (loginFor.toUpperCase() === 'EMR') {
      if (appData && appData.primary_permission && _.find(userPermission, (o) => o === appData.primary_permission.name)) {
        const check = this.redirecToLanding(appData.primary_permission.name, menuList);
        if (check.link && check.redirect) {
          this.route.navigate(['/emr/' + check.link]);
        } else {
          this.route.navigate(['/emr/welcome']);
        }
      } else {
        this.route.navigate(['/emr/welcome']);
      }
    } else if (loginFor.toUpperCase() === 'NURSING') {
      if (!nursingStationId) {
        this.route.navigate(['/selectNursingStation']);
      } else if (appData && appData.primary_permission && _.find(userPermission, (o) => o === appData.primary_permission.name)) {
        const check = this.redirecToLanding(appData.primary_permission.name, menuList);
        if (check.link && check.redirect) {
          this.route.navigate(['/nursingApp/' + check.link]);
        } else {
          this.route.navigate(['/nursingApp/nursing/welcome']);
        }
      } else {
        this.route.navigate(['/nursingApp/nursing/welcome']);
      }
    } else if (loginFor.toUpperCase() === 'DISCHARGE') {
      if (appData && appData.primary_permission && _.find(userPermission, (o) => o === appData.primary_permission.name)) {
        const check = this.redirecToLanding(appData.primary_permission.name, menuList);
        if (check.link && check.redirect) {
          this.route.navigate(['/dischargeApp/discharge/' + check.link]);
        } else {
          this.route.navigate(['/dischargeApp/discharge/welcome']);
        }
      } else {
        // this.route.navigate(['/dischargeApp/discharge/welcome']);
        this.route.navigate(['/dischargeApp/discharge/summery/patientDischarge']);
      }
    } else if ((loginFor).toLowerCase() === 'emr-settings') {
      if (appData && appData.primary_permission && _.find(userPermission, (o) => o === appData.primary_permission.name)) {
        const check = this.redirecToLanding(appData.primary_permission.name, menuList);
        if (check.link && check.redirect) {
          this.route.navigate(['/emrSettingsApp/settings/' + check.link]);
        } else {
          this.route.navigate(['/emrSettingsApp/settings/welcome']);
        }
      } else {
        this.route.navigate(['/emrSettingsApp/settings/welcome']);
      }
    }
  }

}


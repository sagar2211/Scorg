// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'http://172.16.100.203:85/user-api/api',
  baseUrlAppointment: 'http://172.16.100.203:85/qms-api/api',
  dashboardBaseURL: 'http://172.16.100.203:85/emr-api/api',
  jsonPath: 'http://172.16.100.203:85/assets/JSON/',
  appointmentsUrl: 'http://172.16.100.203:85/qms-api/appointments/#/entitySchedule/',
  baseUrlAppointmentForDisplayTemplate9: 'http://172.16.100.203:85/hosted-service/api',
  tvDisplayUrl: 'http://172.16.100.203:85/hosted-service/notificationHub',
  appointmentHubUrl: 'http://172.16.100.203:85/hosted-service/appointmentHub',
  charServerUrl: 'http://172.16.100.203:85/hosted-service/ChatHub',
  notificationUrl: 'http://172.16.100.203:85/hosted-service/userNotificationHub',
  limitDataToGetFromServer: 100,
  REPORT_API: 'http://172.16.100.203:85/qms-report',
  LoginLogoUrl: 'http://172.16.100.203:85/file-server/HospitalImage/',
  EMR_BaseURL: 'http://drrescribe.com/medsonit-be',
  STATIC_JSON_URL: '/assets/JSON/',
  IMG_PATH: '/assets/images',
  FILE_SERVER_IMAGE_URL: 'http://172.16.100.203:85/file-server',
  SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
  SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
  HIS_Add_PatientCommon_API:'http://172.16.100.203:85/hmis-web',
  HIS_FE_APP_URL: 'http://172.16.100.203:85/hmis-fe/#/',
  SSO_LOGIN_URL: '',
  notificationPartialUrl: 'http://172.16.100.203:85/user-web/#/partial-notification-list/#token#'
};

// export const environment = {
//   production: false,
//   baseUrl: 'http://172.16.100.203:75/api',
//   baseUrlAppointment: 'http://172.16.100.203:76/api',
//   dashboardBaseURL: 'http://172.16.100.203:90/api',
//   jsonPath: './../assets/JSON/',
//   appointmentsUrl: 'http://localhost:4201/#/getSetToken/',
//   tvDisplayUrl: 'http://172.16.100.203:57/notificationHub',
//   appointmentHubUrl: 'http://172.16.100.203:57/appointmentHub',
//   charServerUrl: 'http://172.16.100.203:57/ChatHub',
//   notificationUrl: 'http://172.16.100.203:93/notificationHub',
//   limitDataToGetFromServer: 100,
//   REPORT_API: 'http://172.16.100.212:55',
//   LoginLogoUrl: 'http://172.16.100.203:56/HospitalImage/',
//   EMR_BaseURL: 'http://drrescribe.com/medsonit-be',
//   STATIC_JSON_URL: '../assets/JSON/',
//   IMG_PATH: '../assets/images',
//   baseUrlAppointmentForDisplayTemplate9: 'http://172.16.100.203:57/api',
//   FILE_SERVER_IMAGE_URL: 'http://172.16.100.203:92',
//   SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
//   SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
//   HIS_Add_PatientCommon_API:'http://172.16.100.203:191',
//   HIS_FE_APP_URL: 'http://172.16.100.203:75/hmis-fe/#/',
//   SSO_LOGIN_URL: '',
//   notificationPartialUrl: 'http://172.16.100.203:75/user-management/#/partial-notification-list/#token#'
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

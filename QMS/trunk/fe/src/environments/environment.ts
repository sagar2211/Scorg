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
  IMG_PATH: './assets/images',
  FILE_SERVER_IMAGE_URL: 'http://172.16.100.203:85/file-server',
  SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
  SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
  HIS_Add_PatientCommon_API:'http://172.16.100.203:85/hmis-web',
  HIS_FE_APP_URL: 'http://172.16.100.203:85/hmis-fe/#/',
  SSO_LOGIN_URL: '',
  notificationPartialUrl: 'http://172.16.100.203:85/user-web/#/partial-notification-list/#token#'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


// export const environment = {
//   production: false,
//   baseUrl: 'http://172.16.100.203:88/user-api/api',
//   baseUrlAppointment: 'http://172.16.100.203:88/qms-api/api',
//   dashboardBaseURL: 'http://172.16.100.203:88/emr-api/api',
//   jsonPath: 'http://172.16.100.203:88/assets/JSON/',
//   appointmentsUrl: 'http://172.16.100.203:88/qms-api/appointments/#/entitySchedule/',
//   baseUrlAppointmentForDisplayTemplate9: 'http://172.16.100.203:88/hosted-service/api',
//   tvDisplayUrl: 'http://172.16.100.203:88/hosted-service/notificationHub',
//   appointmentHubUrl: 'http://172.16.100.203:88/hosted-service/appointmentHub',
//   charServerUrl: 'http://172.16.100.203:88/hosted-service/ChatHub',
//   notificationUrl: 'http://172.16.100.203:88/hosted-service/userNotificationHub',
//   limitDataToGetFromServer: 100,
//   REPORT_API: 'http://172.16.100.203:88/qms-report',
//   LoginLogoUrl: 'http://172.16.100.203:88/file-server/HospitalImage/',
//   EMR_BaseURL: 'http://drrescribe.com/medsonit-be',
//   IMG_PATH: './assets/images',
//   FILE_SERVER_IMAGE_URL: 'http://172.16.100.203:88/file-server',
//   SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
//   SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
//   HIS_Add_PatientCommon_API:'http://172.16.100.203:88/hmis-web',
//   HIS_FE_APP_URL: 'http://172.16.100.203:88/hmis-fe/#/',
//   SSO_LOGIN_URL: '',
//   notificationPartialUrl: 'http://172.16.100.203:88/user-web/#/partial-notification-list/#token#'
// };

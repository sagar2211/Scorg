// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
//   baseUrl: 'http://172.16.100.203:85/user-api/api',
//   baseUrlAppointment: 'http://172.16.100.203:85/qms-api/api',
//   dashboardBaseURL: 'http://172.16.100.203:85/emr-api/api',
//   baseUrlPharma: 'http://172.16.100.203:85/pharma-api/api',
//   jsonPath: './assets/JSON/',
//   userNotificationUrl: 'http://172.16.100.203:85/hosted-service/userNotificationHub',
//   limitDataToGetFromServer: 100,
//   REPORT_API: 'http://172.16.100.203:85/qms-report',
//   LoginLogoUrl: 'http://172.16.100.203:85/file-server/HospitalImage/',
//   EMR_BaseURL: 'http://drrescribe.com/medsonit-be',
//   STATIC_JSON_URL: './assets/JSON/',
//   IMG_PATH: './assets/images',
//   FILE_SERVER_IMAGE_URL: '/file-server',
//   SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
//   SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
//   SSO_LOGIN_URL: '',
//   HIS_WEB_APP_URL: 'http://172.16.100.203:85/hmis-web',
//   HIS_FE_APP_URL: 'http://172.16.100.203:85/hmis-fe',
//   // HIS_FE_APP_URL: 'http://localhost:4200',
//   notificationPartialUrl: 'http://172.16.100.203:85/user-web/#/partial-notification-list/#token#/#source#/#patientId#',
//   consentPartialUrl: 'http://172.16.100.203:85/user-web/#/partialConsentFrom/#token#/#patientId#/#source#',
//   calendarPartialUrl: 'http://172.16.100.203:85/user-web/#/partialCalendar/#token#/#patientId#/#source#',
// };


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
export const environment = {
  production: false,
  baseUrl: 'http://172.16.100.203:88/user-api/api',
  baseUrlAppointment: 'http://172.16.100.203:88/qms-api/api',
  dashboardBaseURL: 'http://172.16.100.203:88/emr-api/api',
  baseUrlPharma: 'http://172.16.100.203:88/pharma-api/api',
  jsonPath: './assets/JSON/',
  userNotificationUrl: 'http://172.16.100.203:88/hosted-service/userNotificationHub',
  limitDataToGetFromServer: 100,
  REPORT_API: 'http://172.16.100.203:88/qms-report',
  LoginLogoUrl: 'http://172.16.100.203:88/file-server/HospitalImage/',
  EMR_BaseURL: 'http://drrescribe.com/medsonit-be',
  STATIC_JSON_URL: './assets/JSON/',
  IMG_PATH: './assets/images',
  FILE_SERVER_IMAGE_URL: '/file-server',
  SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
  SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
  SSO_LOGIN_URL: '',
  HIS_WEB_APP_URL: 'http://172.16.100.203:88/hmis-web',
  HIS_FE_APP_URL: 'http://172.16.100.203:88/hmis-fe',
  notificationPartialUrl: 'http://172.16.100.203:88/user-web/#/partial-notification-list/#token#/#source#/#patientId#',
  consentPartialUrl: 'http://172.16.100.203:88/user-web/#/partialConsentFrom/#token#/#patientId#/#source#',
  calendarPartialUrl: 'http://172.16.100.203:88/user-web/#/partialCalendar/#token#/#patientId#/#source#',
};
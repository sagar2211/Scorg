// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'http://172.16.100.203:85/user-api/api',
  dashboardBaseURL: 'http://172.16.100.203:85/emr-api/api',
  baseUrlAppointment: 'http://172.16.100.203:85/qms-api/api',
  jsonPath: './assets/JSON/',
  //userNotificationUrl: 'http://172.16.100.203:85/hosted-service/userNotificationHub',
  userNotificationUrl: 'http://172.16.100.203:57/userNotificationHub',
  limitDataToGetFromServer: 100,
  ALERT_DURATION: 3000,
  LoginLogoUrl: 'http://172.16.100.203:85/file-server/HospitalImage/',
  SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
  SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
  SSO_LOGIN_URL: '',
  API_FOR_PDF: 'http://172.16.100.203:85/hmis-report/api',
  HIMS_API: 'http://172.16.100.203:85/hmis-web/api',
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
//   dashboardBaseURL: 'http://172.16.100.203:88/emr-api/api',
//   baseUrlAppointment: 'http://172.16.100.203:88/qms-api/api',
//   jsonPath: './assets/JSON/',
//   //userNotificationUrl: 'http://172.16.100.203:88/hosted-service/userNotificationHub',
//   userNotificationUrl: 'http://172.16.100.203:57/userNotificationHub',
//   limitDataToGetFromServer: 100,
//   ALERT_DURATION: 3000,
//   LoginLogoUrl: 'http://172.16.100.203:88/file-server/HospitalImage/',
//   SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
//   SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
//   SSO_LOGIN_URL: '',
//   API_FOR_PDF: 'http://172.16.100.203:88/hmis-report/api',
//   HIMS_API: 'http://172.16.100.203:88/hmis-web/api',
// };
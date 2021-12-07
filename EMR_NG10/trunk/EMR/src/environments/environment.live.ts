// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  baseUrl: '/user-api/api',
  baseUrlAppointment: '/qms-api/api',
  dashboardBaseURL: '/emr-api/api',
  baseUrlPharma: '/pharma-api/api',
  jsonPath: './assets/JSON/',
  userNotificationUrl: '/hosted-service/userNotificationHub',
  limitDataToGetFromServer: 100,
  REPORT_API: '/qms-report',
  LoginLogoUrl: '/file-server/HospitalImage/',
  EMR_BaseURL: 'http://drrescribe.com/medsonit-be',
  STATIC_JSON_URL: './assets/JSON/',
  IMG_PATH: './assets/images',
  FILE_SERVER_IMAGE_URL: '/file-server',
  SNOWMED_URL: 'http://172.16.100.71:8181/browser/MAIN',
  SNOWMED_SEMANTIC_TAG_URL: 'http://172.16.100.71:8181/MAIN',
  SSO_LOGIN_URL: '/user-web',
  HIS_WEB_APP_URL: '/hmis-web',
  HIS_FE_APP_URL: '/hmis-fe',
  notificationPartialUrl: '/user-web/#/partial-notification-list/#token#/#source#/#patientId#',
  consentPartialUrl: '/user-web/#/partialConsentFrom/#token#/#patientId#/#source#',
  calendarPartialUrl: '/user-web/#/partialCalendar/#token#/#patientId#/#source#',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

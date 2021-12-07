import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
// import { Provider } from '../shared/models/provider';
import { Constants } from './../../config/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  unAuthoErrorMsg: any;
  // public $unAuthoErrorMsg = this.unAuthoErrorMsg.asObservable();
  redirectUrl: string;
  constructor(private http: HttpClient) { }

  login(loginObj): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserIdentity/Login';
    return this.http.post(reqUrl, loginObj).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  logout(): Observable<any> {
    const params = {
      user_id: this.getLoggedInUserId()
    };
    const reqUrl = environment.baseUrl + '/UserIdentity/Logout';
    return this.http.put(reqUrl, params).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  setCookie(cname, cvalue, exdays = 365): void {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    //document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    document.cookie = cname + "=" + cvalue + ";path=/";
  }

  getCookie(cname): any {
      let name = cname + "=";
      let ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  }

  deleteCookie(cname): void {
      let cookie = this.getCookie(cname);
      if (cookie != "") {
          document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
  }

  storeLoginInfo(userInfo): void {
    const global = {
      auth_token: userInfo.auth_token,
      user_id: userInfo.id,
      userLoggedIn: true,
      role_type: userInfo.roletype_tag,
      user_name: userInfo.name,
      role_name: userInfo.role_name,
      roletype_id: userInfo.roletype_id,
      primary_role_id: userInfo.role_id,
      // provider_info: userInfo.provider_details ? this.getProviderDetails(userInfo.provider_details) : [],
      user_key: userInfo.user_id,
      session_expire_minutes: userInfo.session_expire_minutes,
      speciality_id: userInfo.speciality_id,
      speciality_name: userInfo.speciality_name,
      assigenedApplication: userInfo.assigenedApplication,
      dept_id: 88,
      dept_name: 'OBESITY SURGERY',
      default_application_id: userInfo.default_application_id,
      defaultServiceCenterId: userInfo.defaultServiceCenterId,
      assignedServiceCenter: userInfo.assignedServiceCenter,
      // storeId: 1
      // isAppintmentConfirmOnBooking: userInfo.auto_appt_confirm_flag
    };
    localStorage.setItem('globals', JSON.stringify(global));
    this.setCookie('auth_token', userInfo.auth_token);
  }

  // getProviderDetails(providerDetails) {
  //   return providerDetails.map((provider) => {
  //     return new Provider(provider);
  //   });
  // }

  isUserLoggedIn() {
    return this.isLoggedIn() ? JSON.parse(localStorage.getItem('globals')).userLoggedIn : null;
  }

  getAuthToken() {
    //return this.isLoggedIn() ? JSON.parse(localStorage.getItem('globals')).auth_token : null;
    return this.isLoggedIn() ? this.getCookie('auth_token') : null;
  }

  isLoggedIn(): boolean {
    return !!(localStorage.getItem('globals'));
  }

  getLoggedInUserId(): any {
    return this.isLoggedIn() ? JSON.parse(localStorage.getItem('globals')).user_id : null;
  }

  getUserInfoFromLocalStorage(): any {
    return JSON.parse(localStorage.getItem('globals'));
  }

  setSessionUnAuthoError(sessionMessage): void {
    sessionStorage.setItem('UnAuthoError', sessionMessage);
  }
  getSessionUnAuthoError(): string {
    return !!(sessionStorage.getItem('UnAuthoError')) ? sessionStorage.getItem('UnAuthoError') : '';
  }

  resetUserPassword(confirmPassword, userId): Observable<any> {
    const param = {
      password: confirmPassword,
      user_id: userId
    };
    const reqUrl = environment.baseUrl + '/UserIdentity/resetPassword';
    return this.http.put(reqUrl, param).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  // forceLogout(param): Observable<any> {
  //   const reqUrl = environment.baseUrl + '/UserIdentity/forceLogout';
  //   return this.http.put(reqUrl, param).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }

  getAppDefaultPassword(): Observable<any> {
    const reqUrl = environment.baseUrl + '/UserIdentity/getApplicationDefaultPassword';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  matchConfirmPassword(group: FormGroup) {
    const newPass = group.value.new_password;
    const confirmPass = group.value.confirm_password;
    return newPass === confirmPass ? null : { isMatchPassword: false };
  }

  // forgotPassword(reqObj) {
  //   const reqUrl = environment.baseUrl + '/ForgotPassword/ForgotPassword';
  //   return this.http.post(reqUrl, reqObj).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }

  validateTokenToResetPassword(token: any) {
    const reqUrl = environment.baseUrl + '/ForgotPassword/ValidateToken';
    return this.http.post(reqUrl, token).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  ResetForgottedPassword(reqObj) {
    const reqUrl = environment.baseUrl + '/ForgotPassword/ResetForgotPassword';
    return this.http.post(reqUrl, reqObj).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  changePassword(reqObj) {
    const reqUrl = environment.baseUrl + '/UserIdentity/changePassword';
    return this.http.put(reqUrl, reqObj).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  issessionExpire(reqObj) {
    const reqUrl = `${environment.baseUrl}/AuthorizeApp/GetUserId?token=${reqObj}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getUserSessionDetail(reqObj) {
    const reqUrl = `${environment.baseUrl}/UserRegistration/getUserDetails?token=${reqObj}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  setUnAuthoError(error) {
    this.unAuthoErrorMsg = error;
  }

  getDefaultTimeFormatKey() {
    return JSON.parse(localStorage.getItem('globals')).timeFormat;
  }

  getUserId(): any {
    return JSON.parse(localStorage.getItem('globals')).userId;
  }

  getUserParentId() {
    return localStorage.getItem('globals') ? JSON.parse(localStorage.getItem('globals')).userParentId : null;
  }

  loginThroghSSO(token): Observable<any> {
    const reqParams = {
      token, appKey: 'inventory'
    };
    const reqUrl = `${environment.baseUrl}/UserIdentity/LoginThroughSSO`;
    return this.http.post(reqUrl, reqParams).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAppDetailsByAppId(appId: number): any {
    const list = JSON.parse(localStorage.getItem('globals')).assigenedApplication;
    return list.find(l => l.app_id === appId);
  }
  getAppDetailsByAppKey(appKey: string): any {
    const list = JSON.parse(localStorage.getItem('globals')).assigenedApplication;
    return list.find(l => l.app_key === appKey && l.rights === true);
  }
  getAppIdByAppKey(appKey: string): any {
    const appDetails = this.getAppDetailsByAppKey(appKey);
    return appDetails ? appDetails.app_id : 0;
  }

  getLoginStoreId(): any {
    return JSON.parse(localStorage.getItem('globals')).storeId;
  }

  getLoginStoreName(): any {
    return JSON.parse(localStorage.getItem('globals')).storeName;
  }

  getLoginDepartmentId(): any {
    return JSON.parse(localStorage.getItem('globals')).dept_id;
  }

  getLoginDepartmentName(): any {
    return JSON.parse(localStorage.getItem('globals')).dept_name;
  }

  setStoreDetails(storeDetails): any {
    const localData = JSON.parse(localStorage.getItem('globals'));
    localData.storeId = storeDetails.storeId;
    localData.storeName = storeDetails.storeName;
    localStorage.setItem('globals', JSON.stringify(localData));
  }

  getActiveAppKey() {
    const appKey = JSON.parse(sessionStorage.getItem('loginFor')) || 'PHARMACY';
    return appKey.toUpperCase();
  }
}

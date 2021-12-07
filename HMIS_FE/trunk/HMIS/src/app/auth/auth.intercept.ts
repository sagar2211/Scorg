import { retry, catchError, tap } from 'rxjs/operators';
import { AuthService } from './../public/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { CommonService } from './../public/services/common.service';
import { Constants } from '../config/constants';

@Injectable({ providedIn: 'root' })
export class AuthIntercept implements HttpInterceptor {
  private skipAunthorizedAlerts = false;

  constructor(
    public activRoute: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    private commonService: CommonService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let reqCloned: any;
    // const heads = {
    //   'Authorization-Token': this.authService.getAuthToken()
    // };
    reqCloned = req.clone();
    // -- vikram
    if (this.unAuthorizedReq()) {
      reqCloned = req.clone();
    } else {
      if (this.getHostName(req.url) === 'drrescribe.com') {
        reqCloned = req.clone({
          setHeaders: Constants.EMR_DEFAULT_REQ_HEADERS
        });
      } else {
        if ((this.router.url !== '/') || this.authService.getAuthToken()) {
          reqCloned = req.clone({
            setHeaders: {
              auth_token: this.authService.getAuthToken()
            }
          });
        }
      }
    }

    // const isLoginApi = reqCloned.url.includes('/UserIdentity/Login');
    // const isDisplayApi = reqCloned.url.includes('/QueueTransaction/getlivePatientQueue');
    // const isLoggedIn = this.authService.isLoggedIn();
    // if (isLoggedIn) {
    // if ((this.router.url !== '/') && (!isLoginApi) && (!isDisplayApi)) {
    //   // if ((this.router.url !== '/') && (this.router.url !== '/login')) {
    //   reqCloned = req.clone({
    //     setHeaders: {
    //       auth_token: this.authService.getAuthToken()
    //       // 'User-ID': this.authService.getUserId(),
    //       // 'Authorization-Token': this.authService.getAuthToken(),
    //       // 'Hospital-ID': this.authService.getUserDetailsByKey('defualt_hospital').hospital_id,
    //       // 'Location-ID': this.authService.getUserDetailsByKey('defualt_location').location_id,
    //       // 'Parent-ID': this.authService.getUserDetailsByKey('userParentId')
    //     }
    //   });
    // }
    // }
    //  else {
    //   this.router.navigate(['/login']);
    // }
    return next.handle(reqCloned).pipe(
      retry(1),
      tap(event => {
        if (event instanceof HttpResponse) {
          if (event.body.status_code === 401) {
            if (!this.skipAunthorizedAlerts) {
              this.skipAunthorizedAlerts = true;
              // window.alert('Unauthorized acces or token is expired');
              this.authService.setUnAuthoError('Session is expired');
              this.skipAunthorizedAlerts = false;
              // this.router.navigate(['/login']);
              this.authService.setSessionUnAuthoError('Session is expired');
              this.commonService.clearUserSessionData();
            }
          }
          // else if (event.body.status_code === 400) {
          //   this.commonService.commonErrorEvent(true);
          // }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          // client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        // window.alert(errorMessage);
        this.commonService.commonErrorEvent(true);
        // this.setUnAuthoError({errorMsg: errorMessage});
        return throwError(errorMessage);
      })
    );
  }

  unAuthorizedReq(): boolean {
    const unAuthorizedReq = ['login', 'display/displayList', 'forgotpassword', 'resetforgotpassword/:id', 'external/book-appointment', 'LoginThroughSSO', 'hmis/patient/dynamic-chart/']; // -- give state url
    let isUnAuthorize = false;
    if (unAuthorizedReq.some(v => this.router.url.includes(v))) {
      if (this.authService.isLoggedIn()) { // this.router.url === '/login' &&
        isUnAuthorize = false;
      } else {
        isUnAuthorize = true;
      }
    }
    return isUnAuthorize;
  }

  getHostName(url): string {
    try {
      const hostNameObj = new URL(url);
      return hostNameObj.hostname;
    } catch (_) {
      return '';
    }
  }
}

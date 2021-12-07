import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationListService {
  docRoleMasterList = [];

  constructor(
    private http: HttpClient,
  ) { }

  getAllNotificationList(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/Notification/GetUserNotificationList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  getNotificationById(notificationId: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/Notification/GetNotificationById/' + notificationId;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res.data;
      })
    );
  }

  getNotificationCount(param: any): Observable<any> {
    const reqUrl = environment.baseUrl + '/Notification/GetUserNotificationCount';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        return res.data.notification_count;
      })
    );
  }

  checkNewNotificationAlert(param: any): Observable<any> {
    // const res = this.data;
    const reqUrl = environment.baseUrl + '/Notification/CheckNewNotificationAlert';
    return this.http.post(reqUrl, param).pipe(
      // tslint:disable-next-line: no-shadowed-variable
      map((res: any) => {
        return res;
      })
    );
  }

  updateNotificationAction(id: any): Observable<any> {
    const reqUrl = `${environment.baseUrl}/Notification/SaveNotificationAction/${id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

}

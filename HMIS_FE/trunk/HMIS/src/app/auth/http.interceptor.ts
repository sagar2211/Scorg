import { finalize, tap } from 'rxjs/operators';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonService } from './../public/services/common.service';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class LoadingIndicatorInterceptor implements HttpInterceptor {

  constructor(
    private commonService: CommonService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // emit onStarted event before request execution
    this.commonService.onStarted(req);
    return next
      .handle(req).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            status = 'succeeded';
          }
          // error => status = 'failed'
        }),
        // emit onFinished event after request execution
        finalize(() => {
          // each Api call session timer should be restart.
          this.commonService.sessionTimeOutEvent(true);
          this.commonService.onFinished(req);
        }),
      );
  }
}

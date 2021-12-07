import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from '../public/services/common.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { AuthService } from '../public/services/auth.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  $destroy: Subject<boolean> = new Subject();
  isOpenNotificaton = true;
  url: string;
  urlSafe: SafeResourceUrl;

  constructor(
    private commonService: CommonService,
    public sanitizer: DomSanitizer,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getSetUrl();
    this.commonService.$changeEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isOpenNotificaton = res.title === 'Notification' && res.isOpen ? true : false;
    });
  }

  getSetUrl(): void {
    this.url = environment.notificationPartialUrl;
    this.url = this.url.replace('#token#', this.authService.getAuthToken());
    this.url = this.url.replace('#source#', 'notification_panel');
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  myLoadEvent(): void { // after load iframe event is called
    if (this.url) {
      this.commonService.reportIframeLoaderNotify(false);
    }
  }

  closeNotification(): void {
    this.commonService.toggle('Notification');
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

}

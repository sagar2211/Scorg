import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  $destroy: Subject<boolean> = new Subject();
  isOpenNotificaton: boolean = true;
  url: string;
  urlSafe: SafeResourceUrl;

  constructor(
    private commonService: CommonService,
    private router: Router,
    public sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/app/emr')) {
          console.log('emr mod');
        } else {
          console.log('no emr mod');
        }
      }
    });
  }

  ngOnInit() {
    this.getSetUrl();
    this.commonService.$changeEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isOpenNotificaton = res.title === 'Notification' && res.isOpen ?  true : false;
    });
  }

  getSetUrl(): void {
    this.url = environment.notificationPartialUrl;
    this.url = this.url.replace('#token#', this.authService.getAuthToken());
    this.url = this.url.replace('#source#', 'notification_panel');
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  myLoadEvent(): void { // after load iframe event is called
    if (this.url) {
      this.commonService.reportIframeLoaderNotify(false);
    }
  }

  closeNotification() {
    this.commonService.toggle('Notification');
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

}

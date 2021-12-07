import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { CommonService } from '../public/services/common.service';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../public/services/auth.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})

export class NotificationListComponent implements OnInit, OnDestroy {
  @Input() loadSource: string;
  @Input() patientId: string = null;
  $destroy: Subject<boolean> = new Subject();
  url: string;
  urlSafe: SafeResourceUrl;

  constructor(
    private commonService: CommonService,
    public sanitizer: DomSanitizer,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getSetUrl();
  }

  getSetUrl(): void {
    this.url = environment.notificationPartialUrl;
    this.url = this.url.replace('#token#', this.authService.getAuthToken());
    this.url = this.url.replace('#source#', this.loadSource);
    if (this.patientId) {
      this.url = this.url.replace('#patientId#', this.patientId);
    } else {
      this.url = this.url.replace('#patientId#', null);
    }
    this.url = this.url + '?v1=' + new Date().getTime();
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  myLoadEvent(): void { // after load iframe event is called
    if (this.url) {
      this.commonService.reportIframeLoaderNotify(false);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

}

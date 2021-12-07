import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from '../public/services/common.service';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  $destroy: Subject<boolean> = new Subject();
  isOpenNotificaton = true;

  constructor(
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.commonService.$changeEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isOpenNotificaton = res.title === 'Notification' && res.isOpen ? true : false;
    });
  }
  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  closeNotification(): void {
    this.commonService.toggle('Notification');
  }

}

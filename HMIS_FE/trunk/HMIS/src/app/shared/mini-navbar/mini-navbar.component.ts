import {IAlert} from '../../public/models/AlertMessage';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, forkJoin, interval, Subject } from 'rxjs';
import {CommonService} from '../../public/services/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Constants } from 'src/app/config/constants';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mini-navbar',
  templateUrl: './mini-navbar.component.html',
  styleUrls: ['./mini-navbar.component.scss']
})
export class MiniNavbarComponent implements OnInit {
  currentUrl;
  currentConstants;
  subscription: Subscription;
  @ViewChild('filterContainer', { static: false, read: ViewContainerRef }) filterContainerRef: ViewContainerRef;
  @ViewChild('p', { static: false }) public ngbPopover: NgbPopover;
  @ViewChild('addSectionPopover', { static: false }) public ngbAddSectionPopover: NgbPopover;
  url: string;
  isDirectAddAppointment = false;
  ngbPopoverIsOpen = false;
  ngbAddSectionPopoverIsOpen = false;
  checkInStatus: string;
  $destroy: Subject<boolean> = new Subject();
  userId: number;
  alertMsg: IAlert;
  startDate: Date;
  userpermissions: any;
  constructor(
    public router: Router,
    public activatedroute: ActivatedRoute,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.url = this.currentUrl.split('/')[this.currentUrl.split('/').length - 1];
    this.setCurrentNavAndPopup();
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.url = this.currentUrl.split('/')[this.currentUrl.split('/').length - 1];
        this.commonService.isAddButtonDisable = false;
        this.setCurrentNavAndPopup();
      }
    });
    this.commonService.$bookEventFromQlistForFdUser.pipe().subscribe(res => {
    });
    this.commonService.$recieveFilterEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.dateFlag) {
        this.startDate = new Date();
      } else {
        this.startDate = res.data.startDate;
      }
    });
  }

  redirectTo(): void {
    if (this.currentConstants && this.currentConstants.redirectTo && this.currentConstants.redirectTo !== '') {
      this.router.navigate([this.currentConstants.redirectTo]);
    } else {
      this.commonService.ConstantNav.isShowAddPopup = !this.commonService.ConstantNav.isShowAddPopup;
      if (this.commonService.ConstantNav.isShowAddPopup) {
        this.commonService.isAddButtonDisable = true;
      } else {
        this.commonService.isAddButtonDisable = false;
      }
      this.commonService.setPopupFlag(this.commonService.ConstantNav.isShowAddPopup, false, this.currentUrl);
    }
  }

  setCurrentNavAndPopup() {
    this.subscription = this.commonService.$activatedRouteChange.subscribe((obj: ActivatedRoute) => {
      this.currentConstants = (obj.snapshot.data && obj.snapshot.data.breadCrumInfo) ? obj.snapshot.data.breadCrumInfo : '';
    });
  }

  showfilterPopup() {
    this.commonService.ConstantNav.isShowFilter = !this.commonService.ConstantNav.isShowFilter;
    if (this.url === 'role' && this.commonService.ConstantNav.isShowAddPopup) {
      this.commonService.setPopupFlag(true, this.commonService.ConstantNav.isShowFilter);
    } else {
      this.commonService.setPopupFlag(false, this.commonService.ConstantNav.isShowFilter);
    }
  }
  checkUrlForentitySetting(url) {
    if (url.includes('entitySettings?entity_id')) {
      this.url = 'entitySettings';
    } else if (url === 'entitySettings') {
      this.url = url;
    }
    return url === 'entitySettings' ? true : false;
  }
  getFilterDate($event) {
    this.startDate = $event;
  }

  showHideAddSectionPopOver() {
    // // -- vikram
    // setTimeout(() => {
    //   const url = this.currentUrl.split('/')[3];
    //   this.loadComponent(url);
    // });
    if (this.url.includes('entitySettings?entity_id')) {
      this.url = 'entitySettings';
    }
    if (this.url === 'qList' || this.url === 'calendar' || this.url === 'entitySettings') {
      if (this.ngbAddSectionPopover.isOpen()) {
        this.ngbAddSectionPopoverIsOpen = false;
        this.ngbAddSectionPopover.close();
      } else {
        this.ngbAddSectionPopoverIsOpen = true;
        this.ngbAddSectionPopover.open();
      }
      this.commonService.ConstantNav.isShowAddPopup = !this.commonService.ConstantNav.isShowAddPopup;
      this.commonService.setPopupFlag(this.commonService.ConstantNav.isShowAddPopup, false);
      return;
    } else {
      this.redirectTo(); // changes temporary saroj
    }
  }

}

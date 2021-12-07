import { takeUntil } from 'rxjs/operators';
import { IAlert } from '../../public/models/AlertMessage';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, Subject } from 'rxjs';
import { CommonService } from '../../public/services/common.service';
import * as _ from 'lodash';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-mini-navbar',
  templateUrl: './mini-navbar.component.html',
  styleUrls: ['./mini-navbar.component.scss']
})
export class MiniNavbarComponent implements OnInit {
  currentUrl;
  currentConstants;
  subscription: Subscription;
  ConstantNav = { isShowAddPopup: false, isShowFilter: false };
  showPopup = false;
  @ViewChild('filterContainer', { static: false, read: ViewContainerRef }) filterContainerRef: ViewContainerRef;
  @ViewChild('p', { static: false }) public ngbPopover: NgbPopover;
  @ViewChild('addSectionPopover', { static: false }) public ngbAddSectionPopover: NgbPopover;
  url: string;
  isDirectAddAppointment = false;
  ngbPopoverIsOpen = false;
  ngbAddSectionPopoverIsOpen = false;
  checkInStatus: string;
  providerDetails = null;
  providers = null;
  userInfo: any = null;
  $destroy: Subject<boolean> = new Subject();
  userId: number;
  alertMsg: IAlert;
  selectedScheduleIdFromQlist = null;
  currentUserSchedule = null;
  selectedSchedule = null;
  allowLapsedTimeSlotBooking = false;
  startDate: Date;
  userpermissions: any;

  constructor(
    public router: Router,
    public activatedroute: ActivatedRoute,
    public commonService: CommonService,
  ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.url = this.currentUrl.split('/')[this.currentUrl.split('/').length - 1];
    this.setCurrentNavAndPopup();
    // this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    // this.userpermissions = this.qmsQlistLibService.getpermissionList(this.commonService.getuserpermissionForlib());
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.url = this.currentUrl.split('/')[this.currentUrl.split('/').length - 1];
        this.commonService.isAddButtonDisable = false;
        this.setCurrentNavAndPopup();
      }
    });
    this.commonService.$recieveFilterEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.dateFlag) {
        this.startDate = new Date();
      } else {
        this.startDate = res.data.startDate;
      }
    });
  }

  redirectTo() {
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
    // this.currentConstants = _.find(Constants.BreadcrumMiniNavList, (o) => {
    //   return o.current === this.currentUrl;
    // });
    if (this.url !== 'fduserappointmentsList' && this.url !== 'quickbookappointment' && this.url !== 'calendar') {
      this.commonService.setCurrentSelectedProvider(null);
      this.commonService.manageAppointmentFilterData = null;
    }
    if (this.url !== 'searchAppointment') {
      this.commonService.currentSelectedEntity = null;
    }
    this.subscription = this.commonService.$activatedRouteChange.subscribe((obj: ActivatedRoute) => {
      this.currentConstants = (obj.snapshot.data && obj.snapshot.data.breadCrumInfo) ? obj.snapshot.data.breadCrumInfo : '';
    });
  }

  showfilterPopup() {
    if (this.url.includes('appointmentsList?entity_id')) {
      this.url = 'appointmentsList';
    }
    if (this.url === 'qList' || this.url === 'calendar' || this.url === 'appointmentsList' || this.url === 'fduserappointmentsList') {
      if (this.ngbPopover.isOpen()) {
        this.ngbPopoverIsOpen = false;
        this.ngbPopover.close();
      } else {
        this.ngbPopoverIsOpen = true;
        this.ngbPopover.open();
      }
      return;
    }

    this.commonService.ConstantNav.isShowFilter = !this.commonService.ConstantNav.isShowFilter;
    if (this.url === 'role' && this.commonService.ConstantNav.isShowAddPopup) {
      this.commonService.setPopupFlag(true, this.commonService.ConstantNav.isShowFilter);
    } else {
      this.commonService.setPopupFlag(false, this.commonService.ConstantNav.isShowFilter);
    }
  }

  showHideAddSectionPopOver() {
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

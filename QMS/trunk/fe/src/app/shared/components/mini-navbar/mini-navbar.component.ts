import { IAlert } from './../../../models/AlertMessage';
import { AuthService } from 'src/app/services/auth.service';
import { AppointmentBookComponent } from './../appointment-book/appointment-book.component';
import { SlotInfo } from 'src/app/modules/appointment/models/slot-info.model';
import { QueueService } from './../../../modules/qms/services/queue.service';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, forkJoin, interval, Subject } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AppointmentListModel } from 'src/app/modules/appointment/models/appointment.model';
import { Constants } from 'src/app/config/constants';
import { QmsQlistLibService, AppointmentBookLibComponent } from '@qms/qlist-lib';
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
  appointmentSlotOrder: string;
  currentAvailableSlot: SlotInfo = null;
  currentAvailableSlotInfo: any;
  timeFormateKey = '';
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
    private queueService: QueueService,
    private modalService: NgbModal,
    private authService: AuthService,
    private qmsQlistLibService: QmsQlistLibService
  ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.url = this.currentUrl.split('/')[this.currentUrl.split('/').length - 1];
    this.setCurrentNavAndPopup();
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat;
    this.userpermissions = this.qmsQlistLibService.getpermissionList(this.commonService.getuserpermissionForlib());
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.url = this.currentUrl.split('/')[this.currentUrl.split('/').length - 1];
        this.commonService.isAddButtonDisable = false;
        this.setCurrentNavAndPopup();
      }
    });
    this.qmsQlistLibService.checkInStatus.subscribe(res => {
      this.checkInStatus = res.toString();
    });

    this.commonService.$bookEventFromQlistForFdUser.pipe().subscribe(res => {
      this.showHideAddSectionPopOverForQlist('fduser');
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
    // // -- vikram
    // setTimeout(() => {
    //   const url = this.currentUrl.split('/')[3];
    //   this.loadComponent(url);
    // });

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

    // if (this.currentConstants.route === '/app/user/role') {
    //   this.ConstantNav.isShowFilter = this.commonService.ConstantNav.isShowFilter;
    //   this.showPopup = true;
    // } else {
    //   this.showPopup = false;
    // }

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

    // if (this.currentConstants.route === '/app/user/role') {
    //   this.ConstantNav.isShowFilter = this.commonService.ConstantNav.isShowFilter;
    //   this.showPopup = true;
    // } else {
    //   this.showPopup = false;
    // }
  }

  // showActivePopup() {
  //   this.commonService.$addPopupEvent.subscribe(popup => {
  //     if (popup) {
  //       this.ConstantNav.isShowAddPopup = popup.isShowAddPopup;
  //       this.ConstantNav.isShowFilter = popup.isShowFilterPopup;
  //     } else {
  //       // clear messages when empty message received
  //       this.ConstantNav.isShowAddPopup = false;
  //       this.ConstantNav.isShowFilter = false;
  //     }
  //   });
  // }

  showHideAddSectionPopOverForQlist(source?) {
    if (this.url === 'qList' || source === 'fduser') {
      this.userId = +this.authService.getLoggedInUserId();
      const param = [
        {
          tag_name: Constants.queueSkipSettingKey,
          tag_question: null,
        },
        {
          tag_name: Constants.allowLapsedTimeBooking,
          tag_question: null,
        }
      ];
      if (!this.appointmentSlotOrder || !this.allowLapsedTimeSlotBooking) {
        this.commonService.getQueueSettingsForMultiple(param).subscribe(res => {
          _.map(res, (v) => {
            if (v.tag_name.toUpperCase() === Constants.queueSkipSettingKey.toUpperCase() && v.tag_value) {
              this.appointmentSlotOrder = JSON.parse(v.tag_value).available_slot;
            }
            if (v.tag_name.toUpperCase() === Constants.allowLapsedTimeBooking.toUpperCase() && v.tag_value) {
              this.allowLapsedTimeSlotBooking = (v.tag_value === 'YES') ? true : false;
            }
          });
          this.getImmediateAvailableSlot();
        });
      } else {
        this.getImmediateAvailableSlot();
      }
    } else {
      this.showHideAddSectionPopOver();
    }
  }

  getImmediateAvailableSlot() {
    this.providerDetails = this.qmsQlistLibService.getCurrentSelectedProvider();
    this.selectedScheduleIdFromQlist = this.qmsQlistLibService.getScheduleTimeDetailId();
    this.currentUserSchedule = this.qmsQlistLibService.getCurrentSchedules();
    this.selectedSchedule = _.find(this.currentUserSchedule, { formId: this.selectedScheduleIdFromQlist });
    if (!this.providerDetails) {
      return;
    }
    const reqParams = {
      entityId: this.providerDetails.providerId,
      entityValueId: this.providerDetails.providerValueId,
      serviceId: 0,
      appTypeId: this.selectedSchedule ? this.selectedSchedule.appointmentType.id : 0,
      sortingType: this.appointmentSlotOrder,
      lapsedTimeSlot: false, // this.url === 'frontDesk' ? this.allowLapsedTimeSlotBooking,
      timeDetailId: this.selectedSchedule ? this.selectedSchedule.scheduleTimeDetailId : 0
    };
    this.queueService.getSingleAppointmentSlotByEntity(reqParams).subscribe(res => {
      this.currentAvailableSlot = res;
      this.currentAvailableSlotInfo = { ...this.currentAvailableSlot };
      const slotinfo = new SlotInfo();
      slotinfo.generateObj(this.currentAvailableSlot);
      this.currentAvailableSlot = slotinfo;
      this.currentAvailableSlot.slotTime = _.clone(this.commonService.convertTime(this.timeFormateKey, this.currentAvailableSlot.slotTime));
      if (this.currentAvailableSlot && this.currentAvailableSlot.slotTime) {
        this.bookAppointment();
      } else {
        // this.alertMsg = {
        //   message: 'Slot not available!',
        //   messageType: 'warning',
        //   duration: Constants.ALERT_DURATION
        // };
        const data = { source: 'bookAppointment', errorMsg: 'Slot not available!' };
        this.commonService.bookAppEvent.next(data);
      }

    });
  }

  bookAppointment() {
    // let appointmentDetails = Object.assign(this.currentAvailableSlotInfo, {
    //   entity_id: this.url === this.providerDetails.providerId,
    //   entity_value_id: this.url === this.providerDetails.providerValueId
    // });
    let appointmentDetails = Object.assign(this.currentAvailableSlotInfo, {
      entity_id: this.url === 'frontDesk' && this.providers ? this.providers.providerId : this.providerDetails.providerId,
      entity_value_id: this.url === 'frontDesk' && this.providers ? this.providers.providerValueId : this.providerDetails.providerValueId
    });
    appointmentDetails.slot_details = appointmentDetails;
    const appList = new AppointmentListModel();
    const isIndex = _.findIndex(this.currentUserSchedule, (s) => {
      const slottime = moment(moment().format('YYYY-MM-DD') + ' ' + this.commonService.convertTime(this.timeFormateKey, appointmentDetails.appt_time));
      const startTime = moment(moment().format('YYYY-MM-DD') + ' ' + this.commonService.convertTime(this.timeFormateKey, s.startTime));
      const endTime = moment(moment().format('YYYY-MM-DD') + ' ' + this.commonService.convertTime(this.timeFormateKey, (s.endTime === '00:00' || s.endTime === '12:00 AM') ? '23:59' : s.endTime));
      return slottime.isSameOrAfter(startTime) && slottime.isBefore(endTime);
    });
    appList.generateObj(appointmentDetails);
    const appType = isIndex !== -1 ? this.currentUserSchedule[isIndex] : null;
    if (appType) {
      appList.entity_data[0].start_time = this.commonService.convertTime(this.timeFormateKey, appointmentDetails.slot_time_from);
      appList.entity_data[0].end_time = this.commonService.convertTime(this.timeFormateKey,
        (appointmentDetails.slot_time_to === '00:00:00' || appointmentDetails.slot_time_to === '12:00 AM') ? '23:59' : appointmentDetails.slot_time_to);
    }
    appointmentDetails = appList;
    appointmentDetails.entity_data = appointmentDetails.entity_data[0];
    appointmentDetails.entity_data.date = new Date();
    const modalInstance = this.modalService.open(AppointmentBookLibComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
        windowClass: 'custom-modal',
        container: '#homeComponent'
      });
    modalInstance.componentInstance.patientData = null;
    modalInstance.componentInstance.selectedAppointementData = appointmentDetails;
    modalInstance.componentInstance.slotDetails = this.currentAvailableSlot;
    modalInstance.componentInstance.source = 'queue';
    modalInstance.componentInstance.sourcePopup = 'queue';
    modalInstance.componentInstance.environment = environment;
    modalInstance.componentInstance.lapsedTimeSlotValue = this.allowLapsedTimeSlotBooking;

    modalInstance.result.then((res: any) => {
      if (res.bookingData !== null) {
        const data = { source: 'bookAppointment' };
        this.commonService.bookAppEvent.next(data);
        // this.getQueueAppointmentSlots();
      }
    }, () => { });
  }

}

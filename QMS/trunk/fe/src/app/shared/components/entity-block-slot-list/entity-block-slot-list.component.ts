import { takeUntil } from 'rxjs/operators';
import { Subscription, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/models/AlertMessage';
import { EntitySettingsService } from 'src/app/modules/appointment/services/entity-settings.service';
import { CommonService } from 'src/app/services/common.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-entity-block-slot-list',
  templateUrl: './entity-block-slot-list.component.html',
  styleUrls: ['./entity-block-slot-list.component.scss']
})
export class EntityBlockSlotListComponent implements OnInit, OnDestroy {

  shoBlockSlotCalendar: boolean;
  holidayDateCustomClass;
  passedDatesCustomeClass;
  page = {
    size: 1, // The number of elements in the page
    totalElements: 1, // The total number of elements
    totalPages: 1, // The total number of pages
    pageNumber: 1, // The current page number
  };
  userInfo: any;
  swapColumns = false;
  showUserListFilter = false;
  externalPaging = false;
  alertMsg: IAlert;
  blockSlotList: any[] = [];
  timeFormateKey: string;
  todayDate: Date;
  // loadForm: boolean;
  reorderable = true;
  modalService: NgbModal;
  userId: number;
  subscription: Subscription;
  $destroy: Subject<boolean> = new Subject();
  @Input() public selectedUserFromFrontDeskToList: any;
  @Input() public isFromFrontDesk = false;
  constructor(
    private confirmationModalService: NgbModal,
    private entitySettingsService: EntitySettingsService,
    public commonService: CommonService,
    private authService: AuthService,
    private route: ActivatedRoute,
    ) {
    this.modalService = confirmationModalService;
   }

  ngOnInit() {
    // const twoDaysAhead = new Date();
    // twoDaysAhead.setDate(new Date().getDate() - 1 );

    this.todayDate = new Date();
    // this.getTimeFormatKey();
    this.shoBlockSlotCalendar = false;
    this.holidayDateCustomClass = [];
    if (!_.isUndefined(this.route.snapshot.queryParams.entity_id)) {
      this.userInfo = {};
      this.userInfo.roletype_id = + this.route.snapshot.queryParams.entity_id;
      this.userInfo.user_id = + this.route.snapshot.queryParams.provider_id;
    } else if (this.isFromFrontDesk) {
      this.userInfo = {};
      this.userInfo.roletype_id = + this.selectedUserFromFrontDeskToList.entity_id;
      this.userInfo.user_id = + this.selectedUserFromFrontDeskToList.entity_value_id;
    } else {
      this.userId = this.authService.getLoggedInUserId();
      this.userInfo = this.authService.getUserInfoFromLocalStorage();
    }
    // this.onFormChanges();
    this.getDoctorBlockSlot();
    this.subscribeEvents();
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }

  subscribeEvents(): void {
    this.entitySettingsService.$blockSlotList.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      if (res) {
        this.shoBlockSlotCalendar = false;
        this.getDoctorBlockSlot();
      }
    });
  }

  getSelectedDate(dateVal) {
    console.log(dateVal);
  }
  convertDate(value) {
    return value.split('/').reverse().join('-');
  }

  onSortChanged(row) {

  }

  onSetPage(row) {

  }

  getDoctorBlockSlot() {
    const params = {
      entity_id: this.userInfo.roletype_id,
      entityvalue_id: this.userInfo.user_id
    };
    this.entitySettingsService.getDoctorBlockSettings(params).subscribe(res => {
      this.blockSlotList = (!_.isUndefined(res.EntityBlockSlots_Data) && res.EntityBlockSlots_Data.length) ?
      !_.isUndefined(res.EntityBlockSlots_Data[0].slot_data) ? res.EntityBlockSlots_Data[0].slot_data : [] : [];
      this.page.totalElements = this.blockSlotList.length;
      console.log('Block slot list');
      console.log(moment);
      if (this.blockSlotList.length) {
        _.map(this.blockSlotList, (v) => {
          const dateAry = this.enumerateDaysBetweenDates(moment(this.convertDate(v.from_date)), moment(this.convertDate(v.to_date)));
          v.from_date = v.from_date + ' ' + v.from_time; // moment(v.from_time, 'hh:mm:ss').format('h:mm A');
          v.to_date = v.to_date + ' ' + v.to_time; // moment(v.to_time, 'hh:mm:ss').format('h:mm A');
          _.map(dateAry, (dt) => {
            const obj = {
              date: dt,
              classes: Constants.holidayDateCustomClass
            };
            this.holidayDateCustomClass.push(obj);
          });
        });
      }
      this.shoBlockSlotCalendar = true;
    });
    // this.holidayDateCustomClass.push({ date: '06/01/2020', classes: Constants.passedDateCustomClass});
  }

  loadConfirmationPopup(row, type) {
    const modalTitleobj = (row.is_active) ? 'Inactive' : 'Active';
    const modalBodyobj = 'Do you want to mark block slot status from ' + row.from_date + ' to ' + row.to_date + ' as ' + modalTitleobj + ' ?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.updateEntityBlockStatus(row);
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  updateEntityBlockStatus(row): void {
    const obj = {
      entity_blockslot_id: row.id,
      is_active: !row.is_active
    };

    this.entitySettingsService.updateEntityBlockSetting(obj).subscribe(result => {
      if (result.status_message === 'Success') {
        _.map(this.blockSlotList, (holiday) => {
          if (holiday.id === row.id) {
            holiday.is_active = !holiday.is_active;
          }
        });
        this.alertMsg = {
          message: 'Block Status Changed Successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else if (result.status_message === 'Error' && result.message === 'date and timeslot is overlapping') {
        this.alertMsg = {
          message: 'Date and timeslot is Overlapping.',
          messageType: 'danger',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Something went Wrong',
          messageType: 'danger',
          duration: 3000
        };
      }
    }, error => {
      console.log(`Error while update user status ${error}`);
    });
  }

  editHolidayRow(row) {
  }

  enumerateDaysBetweenDates(startDate, endDate) {
    const now = startDate.clone();
    const dates = [];
    while (now.isSameOrBefore(endDate)) {
      dates.push(now.format('DD/MM/YYYY'));
      now.add(1, 'days');
    }
    return dates;
  }
}

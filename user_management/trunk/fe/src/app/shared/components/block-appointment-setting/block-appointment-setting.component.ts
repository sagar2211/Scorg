import { Constants } from 'src/app/config/constants';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { AppointmentTimeSlots } from 'src/app/modules/appointment/models/appointment-time-slot.model';
import { Entity } from 'src/app/modules/schedule/models/entity.model';
import { IAlert } from 'src/app/models/AlertMessage';
import { EntitityCommonDataService } from 'src/app/modules/schedule/services/entitity-common-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { EntityBasicInfoService } from 'src/app/modules/schedule/services/entity-basic-info.service';
import { EntitySettingsService } from 'src/app/modules/appointment/services/entity-settings.service';

@Component({
  selector: 'app-block-appointment-setting',
  templateUrl: './block-appointment-setting.component.html',
  styleUrls: ['./block-appointment-setting.component.scss']
})
export class BlockAppointmentSettingComponent implements OnInit {
  blockAppoitmentSettingForm: FormGroup;
  hoursList: Array<string>;
  userId: number;
  slotIds: any[] = [];
  blockedSlotList = [];
  unBlockedSlotList = [];
  slotData: AppointmentTimeSlots;
  entityList: Array<Entity> = [];
  searchParams: any;
  alertMsg: IAlert;
  userInfo;
  @Input() public selectedUserFromFrontDeskToList: any;
  @Input() public isFromFrontDesk = false;
  @Input() timeFormatkey: string;
  submitted = false;
  isStartTimeEmpty = false;
  isEndTimeEmpty = false;
  isCurrentTimeFlag = true;
  minDate: Date;
  hoursToArray = [];
  timeFormat = 'HH:mm';
  constructor(
    private fb: FormBuilder,
    private entityCommonDataService: EntitityCommonDataService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private entityBasicInfoService: EntityBasicInfoService,
    private entitySettingsService: EntitySettingsService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private modelService: NgbModal,
  ) {
  }

  ngOnInit() {
    this.minDate = new Date();
    this.createForm();
    this.getHoursListFromTimeFormatKey();
    if (!_.isUndefined(this.route.snapshot.queryParams.provider_id)) {
      this.userInfo = {};
      this.userInfo.roletype_id = + this.route.snapshot.queryParams.entity_id;
      this.userId = + this.route.snapshot.queryParams.provider_id;
    } else if (this.isFromFrontDesk) {
      this.userInfo = {};
      this.userInfo.roletype_id = + this.selectedUserFromFrontDeskToList.entity_id;
      this.userId = + this.selectedUserFromFrontDeskToList.entity_value_id;
    } else {
      this.userId = this.authService.getLoggedInUserId();
      this.userInfo = this.authService.getUserInfoFromLocalStorage();
      // get entity id regarding this user if not find then roletype id using as it is
      this.userInfo.roletype_id = this.entitySettingsService.getRoleTypeIdFromProvidersArray(this.userInfo);
    }
    // this.getAllEntityList();
    this.timeFormat = this.timeFormatkey === '24_hour' ? 'HH:mm' : 'hh:mm A';
  }

  createForm() {
    this.blockAppoitmentSettingForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [null],
      blockType: ['block_time', Validators.required],
      blockFromTime: [null, Validators.required],
      blockToTime: [null, Validators.required],
      blockedSlots: [null],
      remark: [''],
      isCancelAppointment: [true]
    });
  }

  onDateChange(controlName, $event): void {
    const patchDate = {};
    patchDate[controlName] = $event;
    this.blockAppoitmentSettingForm.patchValue(patchDate);
  }

  getHoursListFromTimeFormatKey(): void {
    if (this.timeFormatkey === '24_hour') {
      this.hoursList = this.entityCommonDataService.createHoursList24HourFormat();
    } else {
      this.hoursList = this.entityCommonDataService.createHoursList12HourFormat();
    }
  }

  getValidateTotimeList() {
    this.hoursToArray = [];
    let temphoursArray = [];
    if (this.timeFormatkey === '12_hour') {
      temphoursArray = this.entityCommonDataService.createHoursList12HourFormat(true);
    } else if (this.timeFormatkey === '24_hour') {
      temphoursArray = this.entityCommonDataService.createHoursList24HourFormat(true);
    }
    if (this.blockAppoitmentSettingForm.value.blockFromTime) {
      if (moment(this.blockAppoitmentSettingForm.value.blockFromTime, this.timeFormat).isSame(moment(this.blockAppoitmentSettingForm.value.blockToTime, this.timeFormat))) {
        this.blockAppoitmentSettingForm.get('blockFromTime').setErrors({ key: true }); // form status change to INVAID by change staus of fromTime fromTime;
      }
      const sTime = this.blockAppoitmentSettingForm.value.blockFromTime;
      _.map(temphoursArray, (t) => {
        if (moment(t, this.timeFormat).isSameOrAfter(moment(sTime, this.timeFormat))) {
          this.hoursToArray.push(t);
        }
      });
    } else {
      this.hoursToArray = temphoursArray;
    }
  }
  setAndValidateDates($event): void {
    this.blockAppoitmentSettingForm.patchValue({ blockFromTime: null });
    this.blockAppoitmentSettingForm.patchValue({ blockToTime: null });
    this.blockAppoitmentSettingForm.patchValue({ fromDate: $event });
    this.isCurrentTimeFlag = moment(moment(this.blockAppoitmentSettingForm.value.blockFromTime).format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD')) ? true : false;
    this.getValidateTotimeList();
  }
  startHourValidator(val) {
    this.isStartTimeEmpty = false;
    this.submitted = true;
    this.blockAppoitmentSettingForm.patchValue({ blockFromTime: val });
    if (this.blockAppoitmentSettingForm.value.blockFromTime === '' || this.blockAppoitmentSettingForm.value.blockFromTime === null) {
      this.isStartTimeEmpty = true;
      this.submitted = false;
    } else if (this.blockAppoitmentSettingForm.value.blockFromTime &&
      ((moment(this.blockAppoitmentSettingForm.value.blockFromTime, this.timeFormat).isAfter(moment(this.blockAppoitmentSettingForm.value.blockToTime, this.timeFormat)))
        || (moment(this.blockAppoitmentSettingForm.value.blockFromTime, this.timeFormat).isSame(moment(this.blockAppoitmentSettingForm.value.blockToTime, this.timeFormat))))) {
      this.blockAppoitmentSettingForm.get('blockFromTime').setErrors({ blockFromTime: true });
    } else {
      this.blockAppoitmentSettingForm.get('blockFromTime').setErrors(null);
    }
    this.getValidateTotimeList();
  }
  // -- set validator to blockToTime control
  endHourValidator(val): void {
    this.isEndTimeEmpty = false;
    this.submitted = true;
    this.blockAppoitmentSettingForm.patchValue({ blockToTime: val });
    const startTime = moment(this.blockAppoitmentSettingForm.value.blockFromTime, this.timeFormat);
    if (this.blockAppoitmentSettingForm.value.blockFromTime === '' || this.blockAppoitmentSettingForm.value.blockFromTime === null) {
      this.isEndTimeEmpty = true;
      this.submitted = false;
    } else if (this.blockAppoitmentSettingForm.value.blockFromTime &&
      ((moment(this.blockAppoitmentSettingForm.value.blockToTime, this.timeFormat).isBefore(startTime))
        || (moment(this.blockAppoitmentSettingForm.value.blockToTime, this.timeFormat).isSame(startTime)))) {
      this.blockAppoitmentSettingForm.get('blockToTime').setErrors({ blockToTime: true });
    } else {
      this.blockAppoitmentSettingForm.get('blockFromTime').setErrors(null);
    }
  }

  setBlockTypeValidator() {
    if (this.blockAppoitmentSettingForm.value.blockType === 'block_time') {
      this.blockAppoitmentSettingForm.get('blockFromTime').setValidators([Validators.required]);
      this.blockAppoitmentSettingForm.get('blockToTime').setValidators([Validators.required]);
      // remove required validation from block slots
      this.blockAppoitmentSettingForm.get('blockedSlots').setErrors(null);
    } else {
      this.blockAppoitmentSettingForm.get('blockedSlots').setValidators([Validators.required]);
      // remove required validation from block from and to time
      this.blockAppoitmentSettingForm.get('blockFromTime').setErrors(null);
      this.blockAppoitmentSettingForm.get('blockToTime').setErrors(null);
    }
  }



  addRemoveSlotIds(slotDetails) {
    if (slotDetails.isBlocked) {
      this.blockedSlotList.push(slotDetails.slotId);
      this.patchBlockedSlotData();
    } else {
      const index = _.findIndex(this.blockedSlotList, (slotId) => slotId === slotDetails.slotId);
      if (index !== -1) {
        this.blockedSlotList.splice(index, 1);
      }
    }
  }

  getAllEntityList() {
    this.entityBasicInfoService.getAllEntityList().subscribe(res => {
      if (res.length > 0) {
        this.entityList = res;
        const entityData = _.find(this.entityList, (o) => o.key === 'doctor');
        this.getSlots(entityData);
      }
    });
  }

  patchBlockedSlotData() {
    const patchDateControl = {};
    patchDateControl[''] = this.blockedSlotList;
    this.blockAppoitmentSettingForm.patchValue(patchDateControl);
  }

  getSlots(entityData) {
    this.searchParams = {
      entity_id: entityData.id,
      // entity_value_id: this.userId,
      entity_value_id: this.userId,
      appointment_type_id: null,
      service_id: 0,
      date: (moment(this.blockAppoitmentSettingForm.value.fromDate, ['DD/MM/YYYY']).format('MM/DD/YYYY')),
      start_time: null
    };

    this.appointmentService.getAvailableAppointmentTimeSlot(this.searchParams).subscribe((res: AppointmentTimeSlots) => {
      this.slotData = res;
      if (this.slotData && !_.isUndefined(this.slotData.subTimeSlots)) {
        _.map(this.slotData.subTimeSlots, (subSlot) => {
          _.map(subSlot.slots, (slot) => {
            if (slot.isBlocked) {
              this.blockedSlotList.push(slot.slotId);
            }
          });
        });
        this.patchBlockedSlotData();
      }
    });
  }

  saveSetting() {
    if (this.blockAppoitmentSettingForm.valid) {
      const requestParams = {
        entity_id: this.userInfo.roletype_id,
        entity_value_id: this.userId,
        from_date: (moment(this.blockAppoitmentSettingForm.value.fromDate, ['DD/MM/YYYY']).format(Constants.apiDateFormate)),
        to_date: (this.blockAppoitmentSettingForm.value.toDate == null) ?
          (moment(this.blockAppoitmentSettingForm.value.fromDate, ['DD/MM/YYYY']).format(Constants.apiDateFormate)) :
          (moment(this.blockAppoitmentSettingForm.value.toDate, ['DD/MM/YYYY']).format(Constants.apiDateFormate)),
        Block_type: this.blockAppoitmentSettingForm.value.blockType,
        Slot_id: this.blockAppoitmentSettingForm.value.blockedSlots == null ? [] : this.blockAppoitmentSettingForm.value.blockedSlots,
        block_from_time: (this.blockAppoitmentSettingForm.value.blockType === 'block_time') ?
          moment(new Date(moment().format('YYYY-MM-DD') + ' ' + this.blockAppoitmentSettingForm.value.blockFromTime)).format(Constants.apiTimeFormate) :
          this.blockAppoitmentSettingForm.value.blockFromTime,
        block_to_time: (this.blockAppoitmentSettingForm.value.blockType === 'block_time') ?
          moment(new Date(moment().format('YYYY-MM-DD') + ' ' + this.blockAppoitmentSettingForm.value.blockToTime)).format(Constants.apiTimeFormate) :
          this.blockAppoitmentSettingForm.value.blockToTime,
        appointment_cancel_required: this.blockAppoitmentSettingForm.value.isCancelAppointment,
        remarks: this.blockAppoitmentSettingForm.value.remark
      };
      // check user have appointment in between selected duration
      const requestParamsAppCheck = {
        entity_id: requestParams.entity_id,
        entity_value_id: requestParams.entity_value_id,
        from_date: requestParams.from_date,
        from_time: requestParams.block_from_time,
        to_date: requestParams.to_date,
        to_time: requestParams.block_to_time,
      };
      this.entitySettingsService.checkAppointmentExistOrNot(requestParamsAppCheck).subscribe(res => {
        if (res) {
          this.cancelAppointmentConfirmationPopup(requestParams);
        } else {
          requestParams.appointment_cancel_required = false;
          this.cancelAppointmentConfirmationPopup(requestParams);
        }
      });
    }
  }

  saveBlockSettingAfterConfirmation(requestParams) {
    this.entitySettingsService.saveBlockedAppointmentSettings(requestParams).subscribe(res => {
      if (res.status_message === 'Success') {
        // this.entitySettingsService.setBlockSlotListData(requestParams);
        this.entitySettingsService.setHoildayListData(requestParams);
        this.alertMsg = {
          message: 'Setting Saved Successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.sendSelectedSetting('block');
      } else if (res.status_message === 'Error' && res.message === 'date and timeslot is overlapping') {
        this.alertMsg = {
          message: 'Date and timeslot is Overlapping.',
          messageType: 'danger',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Unable to save setting.',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  sendSelectedSetting(settingFor) {
    this.commonService.entitySettingPopUpValue(settingFor);
  }

  cancelAppointmentConfirmationPopup(requestParams): void {
    const modalInstance = this.modelService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal'
      });
    modalInstance.componentInstance.messageDetails = {
      modalTitle: 'Confirm',
      modalBody: 'Are you want to save all changes?',
      buttonType: 'yes_no',
    };
    modalInstance.result.then((res: any) => {
      if (res === 'yes') {
        this.saveBlockSettingAfterConfirmation(requestParams);
      } else if (res === 'no') {
        modalInstance.dismiss();
      }
    }, () => {

    });
  }

}

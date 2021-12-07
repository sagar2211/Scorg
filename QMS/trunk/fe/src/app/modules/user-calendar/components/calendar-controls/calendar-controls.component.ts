import { CommonService } from 'src/app/services/common.service';
import { AuthService } from 'src/app/services/auth.service';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/models/AlertMessage';
import { Component, OnInit, EventEmitter, Input, Output, OnDestroy, OnChanges } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { FrontDeskEntityMappingService } from 'src/app/modules/qms/services/front-desk-entity-mapping.service';
import { ApplicationEntityConstants } from 'src/app/shared/constants/ApplicationEntityConstants';
import { Provider } from './../../../../shared/models/provider';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-calendar-controls',
  templateUrl: './calendar-controls.component.html',
  styleUrls: ['./calendar-controls.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }
  ]
})
export class CalendarControlsComponent implements OnInit, OnChanges, OnDestroy {
  alertMsg: IAlert;

  @Input() view: string;
  @Input() calendarViewSetting: string;
  @Input() viewDate: Date;
  @Input() locale: string = 'en_IN';
  selectedEntity = null;
  @Output() viewChange: EventEmitter<string> = new EventEmitter();
  @Output() viewDateChange: EventEmitter<Date> = new EventEmitter();
  @Output() currentEntity: EventEmitter<any> = new EventEmitter();
  @Output() getPrintEvent: EventEmitter<any> = new EventEmitter();
  // @Output() alertEntity: EventEmitter<any> = new EventEmitter();
  @Output() getAppointmentByEntity: EventEmitter<any> = new EventEmitter();

  PermissionsConstantsList: any = [];
  datepickerDate;
  mappedUserList = [];
  userInfo = null;
  $destroy: Subject<any> = new Subject<any>();

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private frontdeskentityMappingService: FrontDeskEntityMappingService
  ) { }

  favoriteView = '';
  ngOnInit() {
    this.PermissionsConstantsList = PermissionsConstants;
    this.updateDatePickerDate();
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    if (this.userInfo.role_type === ApplicationEntityConstants.FRONTDESK) {
      this.getAllMappingUserList();
    }
    this.commonService.$recieveFilterEvent.pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.isFrom === 'calendar') {
        this.selectedEntity = {
          entityTypeId: res.data.providerDetails.providerId,
          entityTypeName: res.data.providerDetails.providerTypeName,
          entityTypeValueId: res.data.providerDetails.providerValueId,
          entityTypeValueName: res.data.providerDetails.providerName,
          displayMapUserName: res.data.providerDetails.providerName + '(' + res.data.providerDetails.providerTypeName + ')'
        };
      }
    });
  }
  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }
  ngOnChanges() {
    if (this.calendarViewSetting) {
      this.getCalendarSettings('init');
    }
  }
  getAllMappingUserList() {
    this.frontdeskentityMappingService.getMappingDetailsById(this.userInfo.user_id).subscribe((res) => {
      if (res.UserDetails.length && res.UserDetails[0].userMappingResponseViewModelList.length) {
        this.mappedUserList = res.UserDetails[0].userMappingResponseViewModelList;
        _.map(this.mappedUserList, (o) => {
          o.displayMapUserName = o.entityTypeValueName + '(' + o.entityTypeName + ')';
        });
      }
      const row = this.mappedUserList[0];
      const tempObj = {
        entity_id: row.entityTypeId,
        entity_name: row.entityTypeName,
        entity_value_id: row.entityTypeValueId,
        entity_value_name: row.entityTypeValueName,
        entity_alias: row.entityTypeName === 'SERVICE PROVIDER' ? 'SERVICE_PROVIDER' : row.entityTypeName === 'JOINT CLINIC' ? 'JOINT_CLINIC' : row.entityTypeName
      };
      let providerDetails;
      if (this.commonService.getCurrentSelectedProvider()) {
        providerDetails = this.commonService.getCurrentSelectedProvider();
      } else {
        const providerData = new Provider(tempObj);
        providerDetails = providerData;
        this.commonService.setCurrentSelectedProvider(providerData);
      }
      this.selectedEntity = {
        entityTypeId: providerDetails.providerId,
        entityTypeName: providerDetails.providerTypeName,
        entityTypeValueId: providerDetails.providerValueId,
        entityTypeValueName: providerDetails.providerName,
        displayMapUserName: providerDetails.providerName + '(' + providerDetails.providerTypeName + ')'
      };
      this.getAppointmentByEntity.emit(providerDetails);
    });
  }
  setViewFavorite(viewName) {
    const setFavViewObj = {
      favView: viewName,
    };
    const queSettingObj = JSON.stringify(setFavViewObj);
    const userId = this.authService.getLoggedInUserId().toString();
    this.commonService.SaveQueueSettings(Constants.calendarViewSetting, queSettingObj, userId).subscribe((res) => {
      if (res != null && res === 'Success') {
        // this.alertMsg = {
        //   message: 'Favorite view Save successfully.',
        //   messageType: 'success',
        //   duration: Constants.ALERT_DURATION
        // };
        this.favoriteView = viewName;
        this.viewChange.emit(viewName);
      } else {
        // this.alertMsg = {
        //   message: 'Somthing went wrong!',
        //   messageType: 'danger',
        //   duration: Constants.ALERT_DURATION
        // };
      }
      //this.alertEntity.emit(this.alertMsg);
    });
  }

  getCalendarSettings(from?: string) {
    from = from || '';
    // this.commonService.getQueueSettings(Constants.calendarViewSetting, userId).subscribe(res => {
    this.view = this.calendarViewSetting ? this.calendarViewSetting.toLowerCase() : 'day';
    this.favoriteView = this.calendarViewSetting ? this.calendarViewSetting.toLowerCase() : '';
    if (from === '') {
      this.viewChange.emit(this.view);
    }
    // });
  }

  datePickerDateChange() {
    console.log(this.datepickerDate);
    console.log(this.viewDate);
    this.viewDate = this.datepickerDate;
    this.viewDateChange.next(this.viewDate);
  }

  updateDatePickerDate() {
    this.datepickerDate = new Date(this.viewDate);
    // this.viewDateChange.next(this.viewDate);
  }

  getPrintAppointment() {
    this.getPrintEvent.emit(true);
  }

  GetAppointmentListOnEntityId($event) {
    const tempObj = {
      entity_id: $event.entityTypeId,
      entity_name: $event.entityTypeName,
      entity_value_id: $event.entityTypeValueId,
      entity_value_name: $event.entityTypeValueName,
      entity_alias: $event.entityTypeName === 'SERVICE PROVIDER' ? 'SERVICE_PROVIDER' : $event.entityTypeName === 'JOINT CLINIC' ? 'JOINT_CLINIC' : $event.entityTypeName
    };
    const providerData = new Provider(tempObj);
    this.selectedEntity = $event;
    this.commonService.setCurrentSelectedProvider(providerData);
    this.getAppointmentByEntity.emit(providerData);
  }
}

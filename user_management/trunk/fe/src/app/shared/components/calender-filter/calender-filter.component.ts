import { Constants } from 'src/app/config/constants';
import { AppointmentType } from './../../../modules/schedule/models/appointment-type.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppointmentService } from './../../../modules/appointment/services/appointment.service';
import { CommonService } from 'src/app/services/common.service';
import { AuthService } from '../../../services/auth.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ApplicationEntityConstants } from '../../constants/ApplicationEntityConstants';
import * as _ from 'lodash';
import { FrontDeskEntityMappingService } from 'src/app/modules/qms/services/front-desk-entity-mapping.service';
import { Provider } from '../../models/provider';


@Component({
  selector: 'app-calender-filter',
  templateUrl: './calender-filter.component.html',
  styleUrls: ['./calender-filter.component.scss']
})
export class CalendarFilterComponent implements OnInit, OnDestroy {
  @Input() url: string;

  userInfo: any = null;
  providerDetails = null;
  isShowSlot = false;
  appointmentTypList: Array<AppointmentType> = [];
  $destroy = new Subject<any>();
  isFromFrontDesk: boolean = false;
  mappedUserList = [];
  selectedProvider = null;

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private frontdeskentityMappingService: FrontDeskEntityMappingService
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    if (this.userInfo.role_type === ApplicationEntityConstants.FRONTDESK) {
      this.isFromFrontDesk = true;
      this.selectedProvider = this.commonService.getCurrentSelectedProvider();
      this.getAllMappingUserList();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }
  getAllMappingUserList() {
    this.frontdeskentityMappingService.getMappingDetailsById(this.userInfo.user_id).subscribe((res) => {
      this.mappedUserList = [];
      if (res.UserDetails.length && res.UserDetails[0].userMappingResponseViewModelList.length) {
          _.map(res.UserDetails[0].userMappingResponseViewModelList, (o) => {
            o.displayMapUserName = o.entityTypeValueName + '(' + o.entityTypeName + ')';
            const tempObj = {
              entity_id: o.entityTypeId,
              entity_name: o.entityTypeName,
              entity_value_id: o.entityTypeValueId,
              entity_value_name: o.entityTypeValueName,
              entity_alias: o.entityTypeName === 'SERVICE PROVIDER' ? 'SERVICE_PROVIDER' : o.entityTypeName === 'JOINT CLINIC' ? 'JOINT_CLINIC' : o.entityTypeName

            };
            const providerData = new Provider(tempObj);
            this.mappedUserList.push(providerData);
          });
      }
    });
  }
  currentSelectedEntity($event): void {
    this.providerDetails = $event;
    this.getAppointmentTypes();
  }


  sendEventToQlist() {
    const appTypeIds = [];
    this.appointmentTypList.forEach(a => {
      if (a.isSelected) {
        appTypeIds.push(a.id);
      }
    });
    const data = {
      providerDetails: this.providerDetails,
      appTypelist: appTypeIds
    };
    this.commonService.setFilterValuesByUrl(this.url, { ...data }); // --set values
    if (this.providerDetails) {
      this.commonService.sendFilterEvent.next({
        isFrom: this.url, data
      });
    }
  }

  getAppointmentTypes(): void {
    if (this.providerDetails) {
      this.appointmentService.getAppointmentTypeByEntity(this.providerDetails.providerId, this.providerDetails.providerValueId).pipe(takeUntil(this.$destroy)).subscribe(res => {
        this.appointmentTypList = res;
        const storedAppTypeIds = this.commonService.getFilterDataByUrl(this.url);
        if (storedAppTypeIds) {
          storedAppTypeIds.data.appTypelist.forEach(element => {
            const i = this.appointmentTypList.findIndex(a => a.id === element);
            if (i !== -1) { this.appointmentTypList[i].isSelected = true; }
          });
        }
        this.sendEventToQlist();
      });
    }
  }

  onChecked(event, item) {
    item.isSelected = event;
    this.sendEventToQlist();
  }

  getAppTypeColor(typeId: number): string {
    const color = Constants.APP_TYPES_COLOR_CODES.get(typeId);
    if (color) {
      // --$brand-primary = color;
      return color;
    } else {
      return '';
    }
  }

}

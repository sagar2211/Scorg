
import { Component, Input, OnChanges, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgbTabChangeEvent, NgbTabsetConfig, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { EntitityCommonDataService } from 'src/app/modules/schedule/services/entitity-common-data.service';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-service-provider-details',
  templateUrl: './service-provider-details.component.html',
  styleUrls: ['./service-provider-details.component.scss']
})
export class ServiceProviderDetailsComponent implements OnInit, OnChanges {

  @ViewChild('t', { static: false }) tabRef: NgbTabset;
  hideBlockSection: boolean;
  hideHolidaySection: boolean;

  constructor(
    private commonService: CommonService,
    private entityCommonDataService: EntitityCommonDataService,
    config: NgbTabsetConfig) {
    config.justify = 'start';
    config.type = 'tabs';
  }
  panelCollapseInstruction = false;
  panelCollapseRule = false;
  weeklyOffDays: any[];
  @Input() serviceProviderDetailsData: any;
  isServiceProviderSelected = false;
  serviceProviderName = '';
  entityHolidayList = [];
  scheduleData: any;
  scheduleParams: any;
  blockListDetails = [];
  serviceTime: any;
  communicationTime: any;

  ngOnInit() {
    this.hideBlockSection = true;
    this.hideHolidaySection = true;
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.tabRef.select('tab-instruction');
  //   });
  // }

  ngOnChanges() {
    // filter on schedule data
    this.isServiceProviderSelected = false;
    if (this.serviceProviderDetailsData != null) {
      this.tabRef.select(this.serviceProviderDetailsData.defaultTab);
      this.isServiceProviderSelected = true;
      this.serviceProviderName = this.serviceProviderDetailsData.serviceProviderName;
      this.entityHolidayList = this.serviceProviderDetailsData.holidayList;
      this.scheduleParams = this.serviceProviderDetailsData.entityParams;
      this.blockListDetails = this.serviceProviderDetailsData.blockDetailsList;
      if (this.serviceProviderDetailsData.scheduled_config_details != null) {
        this.serviceTime = this.serviceProviderDetailsData.scheduled_config_details.ScheduleAppointmentTypeDetails[0].Appt_Time_Slot;
        this.communicationTime = this.serviceProviderDetailsData.scheduled_config_details.ScheduleAppointmentTypeDetails[0].DefTime_Per_Patient;
      } else {
        this.serviceTime = '';
        this.communicationTime  = '';
      }
      _.map(this.entityHolidayList, (v) => {
        v.date_from = v.date_from + ' ' + moment(v.time_from, 'hh:mm:ss').format('h:mm A');
        v.date_to = v.date_to + ' ' + moment(v.time_to, 'hh:mm:ss').format('h:mm A');
      });
      _.map(this.blockListDetails, (v) => {
        _.map(v.value, (t) => {
          t.time_from = moment(t.time_from, 'hh:mm:ss').format('h:mm A');
          t.time_to = moment(t.time_to, 'hh:mm:ss').format('h:mm A');
        });
      });
      this.serviceProviderDetailsData = this.serviceProviderDetailsData.scheduled_config_details;
      if (this.serviceProviderDetailsData != null) {
        if (this.serviceProviderDetailsData.ScheduleInstructions.GeneralInstrucion_Patient == null &&
          this.serviceProviderDetailsData.ScheduleInstructions.GeneralInstruction_Operator == null &&
          this.serviceProviderDetailsData.ScheduleInstructions.ScheduleInstructionsDetails.length === 0
        ) {
          this.serviceProviderDetailsData.ScheduleInstructions = '';
        }
        if (this.serviceProviderDetailsData && this.serviceProviderDetailsData.ScheduleTimes != null) {
          this.filterWeeklyOffDays();
        }
      }
    }
  }

  filterWeeklyOffDays() {
    this.weeklyOffDays = _.filter(this.serviceProviderDetailsData.ScheduleTimes.Weekly_Off, (o) => {
      return o.Off === true;
    });
  }
  appOutSideClickEvent(event) {
    if (!event && this.commonService.isOpen) {
      this.commonService.toggle('instruction', 'sidebar');
    }
  }
  onClose(): void {
    // this.commonService.isOpenCount = this.commonService.isOpenCount === 0 ? 1 : 0;
    // this.commonService.toggle('instruction', 'sidebar');

    // close instruction slider
    this.commonService.openCloseInstruction('close');
  }

  public beforeChange($event: NgbTabChangeEvent) {
    if ($event.nextId === 'tab-schedule') {
      this.getscheduleData().subscribe();
    }
  }

  getscheduleData(): Observable<any> {
    this.scheduleData = [];
    const param = {
      entity_id: this.scheduleParams.entity_id,
      entity_data_id: this.scheduleParams.entityvalue_id
    };
    return this.entityCommonDataService.getHistoryDataForProvider(param).pipe(map(res => {
      this.scheduleData = res;
    }));
  }

  toggelHolidayDetailSection() {
    this.hideHolidaySection = !this.hideHolidaySection;
  }

  toggelBlockDetailSection() {
    this.hideBlockSection = !this.hideBlockSection;
  }

}

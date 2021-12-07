import { Component, OnInit, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { ScheduleMakerService } from '../../services/schedule-maker.service';
import { CommonService } from 'src/app/services/common.service';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';
import { SliderlogDetails, LogDetailsModel, GroupLogDetailsModel } from 'src/app/shared/models/sliderlog-details';


@Component({
  selector: 'app-schedule-history',
  templateUrl: './schedule-history.component.html',
  styleUrls: ['./schedule-history.component.scss']
})
export class ScheduleHistoryComponent implements OnInit {
  @Input() entityId: number;
  @Input() entityValueId: number;
  scheduleHistoryList: any = {};
  schedulelogMasterList = [];
  pagination = { limit: 15, pageNo: 1 };
  notscrolly: boolean = true;
  constructor(
    private scheduleMakerService: ScheduleMakerService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getschedulehistory();
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   if (this.entityId || this.entityValueId) {
  //     this.getschedulehistory();
  //   }
  // }
  getpageInfo(event) {
    this.pagination.limit = event.limit;
    this.pagination.pageNo = event.pageNo;
    this.getschedulehistory();
  }

  getschedulehistory() {
    const params = {
      entity_id: +this.entityId,
      entity_value: +this.entityValueId,
      limit_per_page: this.pagination.limit,
      current_page: this.pagination.pageNo
    };
    this.scheduleMakerService.getschedulelog(params).subscribe(res => {
      this.notscrolly = false;
      if (res.schedule_details.scheduleDetails.length) {
        this.schedulelogMasterList = this.schedulelogMasterList.length > 0 ? this.schedulelogMasterList.concat(res.schedule_details.scheduleDetails) : res.schedule_details.scheduleDetails;
        this.createScheduleDisplayList();
      }
    });
  }

  createScheduleDisplayList() {
    this.scheduleHistoryList = {};
    const logDetails = new SliderlogDetails();
    const templogDetailsArray = [];
    logDetails.logtitile = 'Change Log';
    _.map(this.schedulelogMasterList, (scheduleList) => {
      const groupLogObject = new GroupLogDetailsModel();
      const groupDate = moment(scheduleList[0].AddDate).format('DD/MM/YYYY');
      const existingGroupingDate = _.findIndex(templogDetailsArray, (rec) => rec.groupDate === groupDate);
      if (existingGroupingDate === -1) {
        groupLogObject.groupDate = groupDate;
        groupLogObject.groupLogDetails = [];
      }
      _.map(scheduleList, (o) => {
        const logDetailsObject = new LogDetailsModel();
        logDetailsObject.description = o.LogDescription;
        logDetailsObject.action = o.Action;
        logDetailsObject.actionDispalyName = '';
        logDetailsObject.updatedBy = o.Updated_By;
        logDetailsObject.updatedFor = o.Updated_For ? o.Updated_For : '';
        logDetailsObject.date = moment(o.AddDate).format('DD/MM/YYYY');
        logDetailsObject.time = moment(o.AddDate).format('hh:mm A');
        existingGroupingDate === -1 ? groupLogObject.groupLogDetails.push(logDetailsObject) : templogDetailsArray[existingGroupingDate].groupLogDetails.push(logDetailsObject);
      });
      if (existingGroupingDate === -1) {
        templogDetailsArray.push(groupLogObject);
      }
    });
    logDetails.logDetailsList = templogDetailsArray; // _.orderBy(templogDetailsArray, ['groupDate'], ['desc']);
    this.scheduleHistoryList = logDetails;
  }
  appOutSideClickEvent(event) {
    if (event && this.commonService.isOpen) {
      this.commonService.toggle(undefined);
    }
  }
}

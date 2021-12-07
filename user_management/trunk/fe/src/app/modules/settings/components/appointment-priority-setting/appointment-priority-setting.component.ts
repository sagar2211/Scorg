import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as _ from 'lodash';

@Component({
  selector: 'app-appointment-priority-setting',
  templateUrl: './appointment-priority-setting.component.html',
  styleUrls: ['./appointment-priority-setting.component.scss']
})
export class AppointmentPrioritySettingComponent implements OnInit {
  alertMsg: IAlert;
  formLoad: boolean;
  permissionConstList: any = [];
  appointmentTypeList: any = [];
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.formLoad = false;
    this.permissionConstList = PermissionsConstants;
    this.appointmentTypeList = [];
    this.getAppointmentSlotBooking();
  }
  getAppointmentSlotBooking() {
    this.commonService.getPatientTypePriority().subscribe(res => {
      if (res.priorityList.length) {
        const data = _.sortBy(res.priorityList, 'pat_sequence', 'asc');
        this.appointmentTypeList = _.clone(data);
      }
      this.formLoad = true;
    });
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.appointmentTypeList, event.previousIndex, event.currentIndex);
    let cnt = 0;
    _.map(this.appointmentTypeList, (v) => {
      this.appointmentTypeList[cnt].pat_sequence = cnt + 1;
      cnt++;
    });
  }
  setPrioritySetting() {
    const param = {
      pat_type_priority: this.appointmentTypeList
    };
    this.commonService.savePatientTypePriority(param).subscribe((res) => {
      if (res != null && res.status_message === 'Success') {
        this.alertMsg = {
          message: 'Setting Save successfully.',
          messageType: 'success',
          duration: 3000
        };
      } else {
        this.alertMsg = {
          message: 'Something went wrong!',
          messageType: 'danger',
          duration: 3000
        };
      }
    });
  }

}

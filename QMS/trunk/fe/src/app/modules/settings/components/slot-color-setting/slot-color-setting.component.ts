import { Component, OnInit } from '@angular/core';
import { Constants } from '../../../../config/constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IAlert } from '../../../../models/AlertMessage';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-slot-color-setting',
  templateUrl: './slot-color-setting.component.html',
  styleUrls: ['./slot-color-setting.component.scss']
})
export class SlotColorSettingComponent implements OnInit {

  alertMsg: IAlert;

  slotColorSetting = {
    holiday_color: 'red-clr', // -- strike
    available_color: 'green-clr',
    blocked_color: 'orange-clr', // strike
    booked_color: 'blue-clr',
    differentdateslot_color: 'gray-clr',
    out_of_hour_color : 'lime-clr'
  };

  currentSelectedComponent: string;

  formLoad: boolean;
  userPermission = PermissionsConstants;


  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentSelectedComponent = '';
    this.formLoad = false;
    // this.commonService.routeChanged(this.route);
    this.getSlotColors();
  }


  getSlotColors() {
    this.commonService.getQueueSettings(Constants.slotColorSetting).subscribe((res) => {
      if (res) {
        if (res.holiday_color) {
          this.slotColorSetting.holiday_color = res.holiday_color;
        }
        if (res.blocked_color) {
          this.slotColorSetting.blocked_color = res.blocked_color;
        }
        if (res.booked_color) {
          this.slotColorSetting.booked_color = res.booked_color;
        }
        if (res.available_color) {
          this.slotColorSetting.available_color = res.available_color;
        }
        if (res.differentdateslot_color) {
          this.slotColorSetting.differentdateslot_color = res.differentdateslot_color;
        }
        if (res.out_of_hour_color) {
          this.slotColorSetting.out_of_hour_color = res.out_of_hour_color;
        }
      }
      this.formLoad = true;
    });
  }


  updateSlotColorSetting() {
    const slotColorSettingObj = {
      holiday_color: this.slotColorSetting.holiday_color,
      blocked_color: this.slotColorSetting.blocked_color,
      booked_color: this.slotColorSetting.booked_color,
      available_color: this.slotColorSetting.available_color,
      differentdateslot_color: this.slotColorSetting.differentdateslot_color,
      out_of_hour_color: this.slotColorSetting.out_of_hour_color,
    };
    const JsonQueueDisplaySettingObj = JSON.stringify(slotColorSettingObj);
    this.commonService.SaveQueueSettings(Constants.slotColorSetting, JsonQueueDisplaySettingObj).subscribe((res) => {
      if (res != null && res === 'Success') {
        this.alertMsg = {
          message: 'Slot Color Setting Saved successfully.',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };

      } else {
        this.alertMsg = {
          message: 'Somthing went wrong!',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  onPopoverClick(ele: NgbPopover, compName): void {
    this.currentSelectedComponent = compName;
    if (ele.isOpen()) {
      ele.close();
    } else {
      ele.open();
    }
  }

  updateClassOnSelectedComponent(className) {
    if (this.currentSelectedComponent) {
      this.slotColorSetting[this.currentSelectedComponent] = className;
    }
  }

  updateDefaultColors() {
    this.slotColorSetting = {
      holiday_color: 'aqua-clr',
      available_color: 'blue-clr',
      blocked_color: 'fuchsia-clr',
      booked_color: 'green-clr',
      differentdateslot_color: 'lime-clr',
      out_of_hour_color : 'olive-clr'
    };
  }

}

import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { CommonService } from 'src/app/services/common.service';
import { AuthService } from './../../../services/auth.service';

@Component({
  selector: 'app-qlist-filter',
  templateUrl: './qlist-filter.component.html',
  styleUrls: ['./qlist-filter.component.scss']
})
export class QlistFilterComponent implements OnInit {
  minDate = new Date();
  userInfo: any = null;
  providerDetails = null;
  displayType: string;
  isDisplayType = false;
  isShowSlot = false;
  settingKey: string;
  ExtendedForTimeDetailId: number;
  @Input() url: string;

  constructor(
    private authService: AuthService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.settingKey = Constants.QLIST_FILTER;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.commonService.getQueueSettings(this.settingKey, this.userInfo.user_id).subscribe(res => {
      if (res) {
        this.isDisplayType = false; // res.displayType === 'grid' ? false : true;
        this.isShowSlot = res.isShowSlot;
        this.sendEventToQlist();
      }
    });
  }

  currentSelectedEntity($event): void {
    this.providerDetails = $event;
    this.sendEventToQlist();
  }

  onDisplayType($event) {
    this.isDisplayType = $event;
    this.sendEventToQlist();
    this.saveSetting();
  }

  sendEventToQlist() {
    const data = {
      displayType: this.isDisplayType ? 'card' : 'grid',
      // providerDetails: this.providerDetails,
      isShowSlot: this.isShowSlot
    };
    this.commonService.setFilterValuesByUrl(this.url, data);
    // if (this.providerDetails) {
    this.commonService.sendFilterEvent.next({
      isFrom: this.url,
      data
    });
    // }
  }

  saveSetting() {
    const tempObj = {
      displayType: this.isDisplayType ? 'card' : 'grid',
      isShowSlot: this.isShowSlot
    };
    this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(tempObj), this.userInfo.user_id).subscribe();
  }
}

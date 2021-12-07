import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/config/constants';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-qms-home',
  templateUrl: './qms-home.component.html',
  styleUrls: ['./qms-home.component.scss']
})
export class QmsHomeComponent implements OnInit {
  setingLoaded: boolean;
  constructor(
    private authService: AuthService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.setingLoaded = true;
    // this.getAllDefaultQmsSetting();
  }

  getAllDefaultQmsSetting() {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    const param = [
      {
        tag_name: Constants.DEFAULT_LANDING_PAGE,
        tag_question: userInfo.user_id,
      },
      {
        tag_name: Constants.QLIST_FILTER,
        tag_question: userInfo.user_id,
      },
      {
        tag_name: Constants.queueSkipSettingKey,
        tag_question: '',
      },
      {
        tag_name: Constants.allowLapsedTimeBooking,
        tag_question: '',
      }
    ];
    this.commonService.getQueueSettingsForMultiple(param).subscribe(resAry => {
      this.setingLoaded = true;
    });
  }

}

import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-entity-settings',
  templateUrl: './entity-settings.component.html',
  styleUrls: ['./entity-settings.component.scss']
})
export class EntitySettingsComponent implements OnInit, OnDestroy {

  isBlockSettingVisible = false;
  isHolidaySettingVisible = false;
  @Input() public isFromFrontDesk = false;
  @Input() public selectedUserFromFrontDesk: any;
  timeFormat: string;
  islistShowFlag = true;
  $destroy = new Subject<any>();
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    const getSetting = this.commonService.$sendEntitySettingEvent.pipe(takeUntil(this.$destroy)).subscribe((obj: any) => {
      if (obj) {
        this.showSelectedSetting(obj);
      } else {
        getSetting.unsubscribe();
      }
    });
    this.timeFormat = this.authService.getUserInfoFromLocalStorage().timeFormat;
  }
  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }
  showSelectedSetting(settingFor) {
    if (this.isBlockSettingVisible && settingFor === 'block') {
      this.isBlockSettingVisible = false;
    } else if (this.isHolidaySettingVisible && settingFor === 'holiday') {
      this.isHolidaySettingVisible = false;
    } else {
      this.isBlockSettingVisible = settingFor === 'block' ? true : false;
      this.isHolidaySettingVisible = settingFor === 'holiday' ? true : false;
    }
    this.islistShowFlag = (!this.isBlockSettingVisible && !this.isHolidaySettingVisible) ? true : false;
  }

}

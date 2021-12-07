import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';

@Component({
  selector: 'app-entitysettingpopover',
  templateUrl: './entitysettingpopover.component.html',
  styleUrls: ['./entitysettingpopover.component.scss']
})
export class EntitysettingpopoverComponent implements OnInit {
  @Input() url: string;
  PermissionsConstantsList: any = [];
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.PermissionsConstantsList = PermissionsConstants;
  }
  sendSelectedSetting(settingFor) {
    this.commonService.entitySettingPopUpValue(settingFor);
  }

}

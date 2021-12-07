import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';

@Component({
  selector: 'app-display-field-settings',
  templateUrl: './display-field-settings.component.html',
  styleUrls: ['./display-field-settings.component.scss']
})
export class DisplayFieldSettingsComponent implements OnInit {
  PermissionsConstantsList: any = [];
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.PermissionsConstantsList = PermissionsConstants;

    // this.commonService.routeChanged(this.route);
  }

}

import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ThemeService } from './../../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  activeThemeColor = 'primary';
  constructor(
    private commonService: CommonService,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.activeThemeColor = this.themeService.active.name;
  }

  closeSetting() {
    this.commonService.toggle('Settings');
  }



  changeTheme(value) {
    this.activeThemeColor = value;
    this.themeService.setSelectedTheme(value);
  }
}

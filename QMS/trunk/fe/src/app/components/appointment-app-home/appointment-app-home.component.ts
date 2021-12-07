import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-appointment-app-home',
  templateUrl: './appointment-app-home.component.html',
  styleUrls: ['./appointment-app-home.component.scss']
})
export class AppointmentAppHomeComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.authService.setActiveAppKey('appointment');
    localStorage.setItem('loginFor', JSON.stringify('appointment'));
  }
  appOutSideClickEvent(event) {
    if (event && this.commonService.isOpen) {
        this.commonService.toggle(undefined);
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.authService.setActiveAppKey('qms');
  }
  appOutSideClickEvent(event) {
    if (event && this.commonService.isOpen) {
        this.commonService.toggle(undefined);
    }
  }

}

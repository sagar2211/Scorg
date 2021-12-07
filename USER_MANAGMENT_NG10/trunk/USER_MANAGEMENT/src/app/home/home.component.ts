import { Component, OnInit } from '@angular/core';
import { CommonService } from './../public/services/common.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
  }
  appOutSideClickEvent(event) {
    if (event && this.commonService.isOpen) {
        this.commonService.toggle(undefined);
    }
  }

}

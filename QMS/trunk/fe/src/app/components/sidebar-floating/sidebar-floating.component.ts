import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-sidebar-floating',
  templateUrl: './sidebar-floating.component.html',
  styleUrls: ['./sidebar-floating.component.scss']
})
export class SidebarFloatingComponent implements OnInit {
  @Input() title: string;
  @Input() logoutFlag: false;
  @Input() autoLogoutFlag: false;
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    console.log(this);
  }
  appOutSideClickEvent(event) {
    if (!event && this.commonService.isOpen) {
      this.commonService.toggle(this.title);
    }
  }

}

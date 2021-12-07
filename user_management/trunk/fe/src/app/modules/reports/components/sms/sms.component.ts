import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SmsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
  }

}

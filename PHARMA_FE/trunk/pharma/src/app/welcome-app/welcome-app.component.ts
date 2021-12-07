import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../public/services/common.service';

@Component({
  selector: 'app-welcome-app',
  templateUrl: './welcome-app.component.html',
  styleUrls: ['./welcome-app.component.scss']
})
export class WelcomeAppComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.commonService.routeChanged(this.route);
  }

}

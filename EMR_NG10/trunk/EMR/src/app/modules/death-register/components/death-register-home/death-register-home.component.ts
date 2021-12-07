import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-death-register-home',
  templateUrl: './death-register-home.component.html',
  styleUrls: ['./death-register-home.component.scss']
})
export class DeathRegisterHomeComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.commonService.routeChanged(this.activatedRoute);
  }

}

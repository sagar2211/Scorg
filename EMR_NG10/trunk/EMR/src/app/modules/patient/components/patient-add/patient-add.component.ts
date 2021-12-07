import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-patient-add',
  templateUrl: './patient-add.component.html',
  styleUrls: ['./patient-add.component.scss']
})
export class PatientAddComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
  }

}

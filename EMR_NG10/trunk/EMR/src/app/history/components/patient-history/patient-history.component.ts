import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from './../../../public/services/common.service';

@Component({
  selector: 'app-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.scss']
})
export class PatientHistoryComponent implements OnInit {
  selectedFilter: any;
  selectedSec: string;
  constructor(
    private commonService: CommonService,
  ) {  }

  ngOnInit() {
    this.commonService.updateHistoryTabHideShow('patient');
  }

}

import { DiagnosisService } from './../../../../public/services/diagnosis.service';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
  selector: 'app-dashboard-diagnosis',
  templateUrl: './dashboard-diagnosis.component.html',
  styleUrls: ['./dashboard-diagnosis.component.scss']
})
export class DashboardDiagnosisComponent implements OnInit {
  @Input() getDiagnosisObj;
  diagnosisData: any[] = [];
  currentDate: string;
  @Input() source: string;
  @Input() dashboardDataList: Array<any>;

  constructor(
    public diagnosisService: DiagnosisService
  ) { }

  ngOnInit() {
    // this.getDiagnosisData();
    // if (this.source) {
    //   if (this.source === 'dashboard') {
    //     this.currentDate = moment().format('DD-MMM-YYYY');
    //   }
    // }
  }

  // getDiagnosisData() {
  //   if (!_.isUndefined(this.getDiagnosisObj)) {
  //     this.diagnosisData = this.getDiagnosisObj;
  //   } else {
  //     this.diagnosisService.getDiagnosisData().subscribe(data => {
  //       if (data.length) {
  //         this.diagnosisData = data;
  //       }
  //     });
  //   }
  // }
}

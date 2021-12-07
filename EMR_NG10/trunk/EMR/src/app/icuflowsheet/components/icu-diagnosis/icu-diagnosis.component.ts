import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DiagnosisService } from './../../../public/services/diagnosis.service';

@Component({
  selector: 'app-icu-diagnosis',
  templateUrl: './icu-diagnosis.component.html',
  styleUrls: ['./icu-diagnosis.component.scss']
})
export class IcuDiagnosisComponent implements OnInit {
  @Input() getDiagnosisObj;
  diagnosisData: any[] = [];
  currentDate: string;
  @Input() source: string;
  constructor(
    public diagnosisService: DiagnosisService
  ) { }

  ngOnInit() {
    this.getDiagnosisData();
    if (this.source) {
      if (this.source === 'dashboard') {
        this.currentDate = moment().format('DD-MMM-YYYY');
      }
    }
  }

  getDiagnosisData() {
    if (!_.isUndefined(this.getDiagnosisObj)) {
      this.diagnosisData = this.getDiagnosisObj;
    } else {
      this.diagnosisService.getDiagnosisData().subscribe(data => {
        if (data.length) {
          this.diagnosisData = data;
        }
      });
    }
  }

}

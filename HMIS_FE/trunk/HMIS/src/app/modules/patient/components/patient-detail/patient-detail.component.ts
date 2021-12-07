import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  @Input() public patientData;
  imgBaseUrl = environment.baseUrlHis;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.patientData.image =this.patientData.image.split("../..")[1];
  }

}

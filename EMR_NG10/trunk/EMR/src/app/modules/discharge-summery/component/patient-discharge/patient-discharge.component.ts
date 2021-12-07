import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth.service';
import { PatientService } from 'src/app/public/services/patient.service';
import * as moment from 'moment';
import * as _ from 'lodash';
@Component({
  selector: 'app-patient-discharge',
  templateUrl: './patient-discharge.component.html',
  styleUrls: ['./patient-discharge.component.scss']
})
export class PatientDischargeComponent implements OnInit {

  constructor(

  ) { }

  ngOnInit(): void {

  }
}

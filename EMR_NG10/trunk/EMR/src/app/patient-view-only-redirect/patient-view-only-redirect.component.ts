import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientService } from 'src/app/public/services/patient.service';
import { EncounterPatient } from '../public/models/encounter-patient.model';
import * as _ from 'lodash';

@Component({
  selector: 'app-patient-view-only-redirect',
  templateUrl: './patient-view-only-redirect.component.html',
  styleUrls: ['./patient-view-only-redirect.component.scss']
})
export class PatientViewOnlyRedirectComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private patientService: PatientService,
    private commonService: CommonService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(res => {
      const patId = res.get('patientId');
      this.redirctPatient(patId);
    });
  }

  redirctPatient(patientId: string) {
    this.patientService.getPatientActiveVisitDetail(patientId).subscribe(res => {
      if (res) {
        _.map(res,itr=>{
          itr.isViewOnlyPat = true;
        })
        this.selectedPatient(res[0]);
      }
    });
  }

  selectedPatient(patient) {
    if(patient?.type && patient?.loadFrom){
      patient.type = patient?.serviceType.name.toLowerCase();
      patient.loadFrom = 'APPOINTMENT';
    }
    this.commonService.setActivePatientList(patient, 'add');
    if (this.commonService.getActivePatientList(patient).length <= 5) {
      const obj = {
        type: 'add',
        data: patient,
        sourc: 'doctor_dashboard'
      };
      this.commonService.updateActivePatientList(obj);
      this.router.navigate(['/emr/patient/dashboard/', patient?.patientData.id]);
    }
  }

}

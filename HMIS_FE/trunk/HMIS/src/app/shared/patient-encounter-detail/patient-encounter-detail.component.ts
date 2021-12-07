import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from 'src/app/modules/billing/services/billing.service';
import * as _ from 'lodash';
import { EncounterDetailModel } from 'src/app/modules/billing/modals/patient-encounter-detail-model';

@Component({
  selector: 'app-patient-encounter-detail',
  templateUrl: './patient-encounter-detail.component.html',
  styleUrls: ['./patient-encounter-detail.component.scss']
})
export class PatientEncounterDetailComponent implements OnInit {

  @Input() patientData: any;
  encounterData: EncounterDetailModel;
  careProvides:string;

  constructor(
    public modal: NgbActiveModal,
    private billingService: BillingService
  ) { }

  ngOnInit(): void {
    this.getEncounterDetails();
  }

  getEncounterDetails() {
    const penId = this.patientData.penId;
    this.billingService.getPatientEncounterData(penId).subscribe(res => {
      this.encounterData = _.cloneDeep(res);
       let temp = this.encounterData.CareProviders;
       this.careProvides = temp.length > 0 ?temp.toString():'NA';
    });
  }

}

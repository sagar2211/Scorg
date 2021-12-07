import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { AllergiesService } from 'src/app/public/services/allergies.service';

@Component({
  selector: 'app-dashboard-allergy',
  templateUrl: './dashboard-allergy.component.html',
  styleUrls: ['./dashboard-allergy.component.scss']
})
export class DashboardAllergyComponent implements OnInit {
  @Input() patientId: any;
  @Input() public allergyLists: Array<any>;
  allergies: any[] = [];

  constructor(
    private allergyService: AllergiesService
  ) { }

  ngOnInit() {
    // this.allergyService.getAllergiesData(this.patientId).subscribe(result => {
    //   // get all medicine allergies
    //   if (result && result['isAllergySelected'] === 'YES') {
    //     _.map(result['allergiesListFrm'], (ma) => {
    //         if (ma['type'] === 2) {
    //           const allergyName = ma['medicineObject']['name'];
    //           const remark  = (ma['remark'] && ma['remark'] != '') ? ma['remark'] : '';
    //           const obj = {
    //             allergyName: allergyName,
    //             remark: remark
    //           };
    //           this.allergies.push(obj);
    //         }
    //     });
    //   }
    // });
  }

}

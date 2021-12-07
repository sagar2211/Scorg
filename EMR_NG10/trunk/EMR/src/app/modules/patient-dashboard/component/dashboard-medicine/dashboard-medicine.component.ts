import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { CommonService } from 'src/app/public/services/common.service';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-dashboard-medicine',
  templateUrl: './dashboard-medicine.component.html',
  styleUrls: ['./dashboard-medicine.component.scss']
})
export class DashboardMedicineComponent implements OnInit, OnChanges {
  @Input() medicationList: any[] = [];
  @Input() patientOnGoingMedication: any[] = [];
  @Input() serviceTypeId: any;
  filteredMedicationList: any[] = [];
  currentDate: string;
  showOnGoingMedicine: boolean;

  constructor(
    private commonService: CommonService
    ) { }

  ngOnInit() {
    // this.currentDate = moment().format('DD-MMM-YYYY');
    const patObj = this.commonService.getLastActivePatient();
    this.showOnGoingMedicine = patObj.serviceType.id !== Constants.ServiceType.OPD;
  }

  ngOnChanges() {
    // if (this.medicineOrders.length) {
    //   // set medicine data
    //   this.medicineOrders = _.orderBy(this.medicineOrders, ['tempId'], 'desc');
    //   _.forEach(this.medicineOrders, (v, k) => {
    //     if (moment(moment().format('YYYY-MM-DD')).isSame(moment(v['medicineObj']['startDate'], 'DD-MM-YYYY').format('YYYY-MM-DD'))) {
    //       const medicineName = v['medicineObj']['name'];
    //       const obj = {
    //         name: medicineName,
    //       };
    //       this.filteredMedicationList.push(obj);
    //     }
    //   });

    // }
  }

}

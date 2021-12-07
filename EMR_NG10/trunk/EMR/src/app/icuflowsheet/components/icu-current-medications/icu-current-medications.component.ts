import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { OrderService } from './../../../public/services/order.service';
import { AuthService } from './../../../public/services/auth.service';
import { ConsultationService } from './../../../public/services/consultation.service';
import { ActivatedRoute } from '@angular/router';
import { PublicService } from './../../../public/services/public.service';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-icu-current-medications',
  templateUrl: './icu-current-medications.component.html',
  styleUrls: ['./icu-current-medications.component.scss']
})
export class IcuCurrentMedicationsComponent implements OnInit, OnChanges {
  currentMedicationList: any[] = [];
  docName: string;
  patientId: any;
  @Input() source: string;
  @Input() medicineOrders: any[] = [];

  constructor(
    public orderService: OrderService,
    public authService: AuthService,
    public consultationService: ConsultationService,
    private route: ActivatedRoute,
    public publicService: PublicService
  ) {
  }

  ngOnInit() {
    const self = this;
    this.docName = Constants.EMR_IPD_USER_DETAILS.doctor_name;
  }

  ngOnChanges() {
    if (this.medicineOrders.length) {
      this.setMedicationData(this.medicineOrders);
    }
  }

  setMedicationData(data) {
    if (this.source === 'one_time_medication') {
      // find those which has duration =1 and freq = 1
      data = _.filter(data, (o) => {
        return (o['medicineObj']['duration'] === 1 && o['medicineObj']['frequency'] === 1);
      });
    }
    _.forEach(data, (v, k) => {
      let freqString = this.publicService.calculateHoursByTime(v['medicineObj']['frequency'], v['freqStartTime']);
      freqString = (freqString.length) ? ((freqString[0] !== 'Invalid date') ? _.join(freqString, '-') : '') : '';
      // console.log('freqString');
      // console.log(freqString);
      // let str = '';
      const medicineName = v['medicineObj']['name'];
      const dose = (v['medicineObj']['dose']) ?
        ((_.isObject(v['medicineObj']['dose']) ? v['medicineObj']['dose']['dose'] :
          v['medicineObj']['dose']) + ' ' + v['medicineObj']['type']['doseUnit']) : '';
      // if (dose != '') {
      //   dose = dose + ' ' + v['medicineObj']['type']['doseUnit'];
      // } else {
      //   dose = '';
      // }
      // str += (k + 1) + '. ' + medicineName  + dose;
      const obj = {
        name: medicineName,
        dose: dose,
        freqString: freqString,
      };
      this.currentMedicationList.push(obj);
    });

  }

  // getMedicineOrdersData() {
  //   this.orderService.getOrderData('medicineOrders').subscribe(result => {
  //     _.forEach(result, (v, k) => {
  //       let str = '';
  //       const medicineName = v['medicineObj']['name'];
  //       let dose  = (v['medicineObj']['dose']) ? v['medicineObj']['dose'] : '';
  //       if (dose != '') {
  //         dose = ' - ' + dose + ' ' + v['medicineObj']['type']['doseUnit'];
  //       } else {
  //         dose = '';
  //       }
  //       str += (k + 1) + '. ' + medicineName  + dose;
  //       this.currentMedicationList.push(str);
  //     });
  //   });
  // }


}

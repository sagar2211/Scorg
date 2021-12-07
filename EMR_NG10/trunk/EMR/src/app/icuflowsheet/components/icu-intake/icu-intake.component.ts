import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ConsultationService } from './../../../public/services/consultation.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { MarService } from '../../../patient/services/mar.service';

@Component({
  selector: 'app-icu-intake',
  templateUrl: './icu-intake.component.html',
  styleUrls: ['./icu-intake.component.scss']
})
export class IcuIntakeComponent implements OnInit, OnChanges {
  patientId: any;
  allTakenMedicines: any[] = [];
  @Input() medicineOrders: any[] = [];
  constructor(
    private consultationService: ConsultationService,
    private marService: MarService,
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.medicineOrders.length) {
      this.consultationService.getPatientObj('patientId', true).subscribe(res => {
        this.patientId = res;
        this.getPatientsMarDetails(this.patientId);
      });
    }
  }
  getPatientsMarDetails(patientId) {
    this.marService.getPatientsCompletedDoses(patientId).subscribe(result => {
      // find all taken medicines
      const allTakenMedicines = [];
      _.map(result, (o) => {
        if (o.doseDetails.length) {
          const doseGiven = _.filter(o.doseDetails, (dose) => {
            // console.log(moment);
            return dose['admisterDetails']['marCode'] == 'T' && moment(moment().format('YYYY-MM-DD')).isSame(moment(dose['medicineDay'], 'DD-MM-YYYY').format('YYYY-MM-DD'));
          });
          if (doseGiven.length) {
            const medicineObj = _.find(this.medicineOrders, (mo) => mo['medicineObj'].id == o.medicineId);
            if (!_.isUndefined(medicineObj)) {
              const intakeObj = {};
              intakeObj['name'] = medicineObj['medicineObj']['name'];
              intakeObj['dose'] = (medicineObj['medicineObj']['dose']) ?
                _.isObject(medicineObj['medicineObj']['dose']) ? medicineObj['medicineObj']['dose']['dose'] :
                  medicineObj['medicineObj']['dose'] : '';
              if (intakeObj['dose'] != '') {
                // calculate total dose
                intakeObj['dose'] = intakeObj['dose'] * doseGiven.length;
                intakeObj['dose'] += ' ' + medicineObj['medicineObj']['type']['doseUnit'];
              }
              allTakenMedicines.push(intakeObj);
            }
          }
        }
      });
      this.allTakenMedicines = allTakenMedicines;
    });
  }

}

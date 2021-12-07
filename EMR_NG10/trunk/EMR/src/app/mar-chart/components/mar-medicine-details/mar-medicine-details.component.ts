import { Component, OnInit, Input } from '@angular/core';
import { MarMedicine } from './../../../public/models/mar-medicine';
import { Medicine } from './../../../public/models/medicine';

@Component({
  selector: 'app-mar-medicine-details',
  templateUrl: './mar-medicine-details.component.html',
  styleUrls: ['./mar-medicine-details.component.scss']
})
export class MarMedicineDetailsComponent implements OnInit {
  @Input() marMedicine: MarMedicine;

  medicine: Medicine;

  constructor() { }

  ngOnInit(): void {
    this.medicine  = this.marMedicine.medicine;
  }

}

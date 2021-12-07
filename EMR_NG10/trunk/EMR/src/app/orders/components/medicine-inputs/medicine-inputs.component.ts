import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-medicine-inputs',
  templateUrl: './medicine-inputs.component.html',
  styleUrls: ['./medicine-inputs.component.scss']
})
export class MedicineInputsComponent implements OnInit, OnChanges {

  @Input() medicineOrder: any;
  compInstance: any;
  constructor() { }

  ngOnInit() {
    this.compInstance = this.medicineOrder;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.compInstance = this.medicineOrder;
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-emr-order-list',
  templateUrl: './emr-order-list.component.html',
  styleUrls: ['./emr-order-list.component.scss']
})
export class EmrOrderListComponent implements OnInit {
  @Input() patientData;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
  }

}

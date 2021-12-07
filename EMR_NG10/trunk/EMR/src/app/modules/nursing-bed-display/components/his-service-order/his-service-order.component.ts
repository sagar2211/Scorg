import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-his-service-order',
  templateUrl: './his-service-order.component.html',
  styleUrls: ['./his-service-order.component.scss']
})
export class HisServiceOrderComponent implements OnInit {

  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
  }

}

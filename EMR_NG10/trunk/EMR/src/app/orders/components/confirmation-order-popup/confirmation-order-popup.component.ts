import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-order-popup',
  templateUrl: './confirmation-order-popup.component.html',
  styleUrls: ['./confirmation-order-popup.component.scss']
})
export class ConfirmationOrderPopupComponent implements OnInit {

  @Input() messageDetails: any;
  categoryOrder: any;
  resOrder: any;
  type: any;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.categoryOrder = this.messageDetails.selectedOrder;
    this.resOrder = this.messageDetails.resData;
    this.type = this.messageDetails.type;
  }

}

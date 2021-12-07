import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from 'src/app/public/models/AlertMessage';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {

  @Input() formData;
  @Input() paymentHistory;
  alertMsg: IAlert;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {

  }

  closePopup() {
    this.modal.close(false);
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-popup-with-input',
  templateUrl: './confirmation-popup-with-input.component.html',
  styleUrls: ['./confirmation-popup-with-input.component.scss']
})
export class ConfirmationPopupWithInputComponent implements OnInit {
  @Input() messageDetails: any;
  messageText: boolean;
  confirmationMsg: string;
  placeholderText: string;
  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
  }
  dismissModel(check: string): void {
    if (this.confirmationMsg || check == "cancle") {
      this.messageText = false;
      const sendData = {
        popupVal: check ? check : 'ok',
        confirmationMsg: this.confirmationMsg
      };
      this.modal.dismiss(sendData);
    } else {
      this.messageText = true;
      return;
    }

  }
}

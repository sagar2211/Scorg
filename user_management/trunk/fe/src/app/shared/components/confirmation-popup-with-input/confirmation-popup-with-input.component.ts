import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-confirmation-popup-with-input',
  templateUrl: './confirmation-popup-with-input.component.html',
  styleUrls: ['./confirmation-popup-with-input.component.scss']
})
export class ConfirmationPopupWithInputComponent implements OnInit {

  @Input() messageDetails: any;
  sendSmsConfirmation: boolean;
  doneOpdConfirmation: boolean;
  messageText: boolean;
  confirmationMsg: string;
  placeholderText: string;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.messageText = false;
    this.sendSmsConfirmation = false;
    if (this.messageDetails.isDoneOpdCheck) {
      this.doneOpdConfirmation = true;
    } else {
      this.doneOpdConfirmation = false;
    }

    this.confirmationMsg = null;
    this.placeholderText = this.messageDetails.placeholderText ? this.messageDetails.placeholderText : 'Write Message....';
  }

  dismissModel(check: string): void {
    if (this.sendSmsConfirmation && !this.confirmationMsg && check === 'ok') {
      this.messageText = true;
      return;
    }
    const sendData = {
      smsCheck: this.sendSmsConfirmation,
      smsMsg: this.confirmationMsg,
      popupVal: check ? check : 'ok',
      doneOpdCheck: this.doneOpdConfirmation
    };
    this.modal.dismiss(sendData);
  }

}

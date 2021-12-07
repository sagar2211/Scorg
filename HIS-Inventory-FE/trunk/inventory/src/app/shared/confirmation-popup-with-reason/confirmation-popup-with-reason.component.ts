import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-popup-with-reason',
  templateUrl: './confirmation-popup-with-reason.component.html',
  styleUrls: ['./confirmation-popup-with-reason.component.scss']
})
export class ConfirmationPopupWithReasonComponent implements OnInit {
  @Input() messageDetails: any;
  isShowCrossIcon = true;
  reasonText: string = null;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.isShowCrossIcon = this.messageDetails.isShowCrossIcon !== undefined ?
      this.messageDetails.isShowCrossIcon : true;
    this.reasonText = this.messageDetails.reasonText ? this.messageDetails.reasonText : null;
  }

  closeModal(sts) {
    const obj = {
      status: sts,
      reason: this.reasonText
    };
    this.modal.close(obj);
  }

}

import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss']
})
export class ConfirmationPopupComponent implements OnInit {

  @Input() messageDetails: any;
  @ViewChild('yesButton', { static: false }) yesBtn: ElementRef;
  isShowCrossIcon = true;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.isShowCrossIcon = this.messageDetails.isShowCrossIcon !== undefined ?
      this.messageDetails.isShowCrossIcon : true;
    if (this.messageDetails.buttonType && this.messageDetails.buttonType == 'yes_no') {
      setTimeout(() => {
        this.yesBtn.nativeElement.focus()
      }, 500);
    }
  }

}

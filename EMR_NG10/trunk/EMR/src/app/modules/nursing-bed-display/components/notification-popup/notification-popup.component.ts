import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-notification-popup',
  templateUrl: './notification-popup.component.html',
  styleUrls: ['./notification-popup.component.scss']
})
export class NotificationPopupComponent implements OnInit {
  @Input() bedData: any;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    // console.log(this.bedData);
  }

}

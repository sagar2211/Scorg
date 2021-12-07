import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AppointmentHistory } from 'src/app/modules/appointment/models/appointment-history.model';
@Component({
  selector: 'app-confirmation-book-appointment',
  templateUrl: './confirmation-book-appointment.component.html',
  styleUrls: ['./confirmation-book-appointment.component.scss']
})
export class ConfirmationBookAppointmentComponent implements OnInit {
  @Input() history: Array<AppointmentHistory>;
  @Output() isAppointmentAvailable = new EventEmitter<boolean>();


  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {


  }


  dismissModel(check: string): void {
    if (check === 'cancle') {
      this.modal.dismiss();
    } else {
      this.isAppointmentAvailable.emit(true);
    }


  }


}

import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard-ot-patient-info',
  templateUrl: './dashboard-ot-patient-info.component.html',
  styleUrls: ['./dashboard-ot-patient-info.component.scss']
})
export class DashboardOtPatientInfoComponent implements OnInit {
  @Input() appointmentInfo: any;
  disableForm: boolean = true;

  constructor(public modal: NgbActiveModal
    ) { }

  ngOnInit(): void {
    this.appointmentInfo.appointmentDate = moment(this.appointmentInfo.appointmentDate).format('DD/MM/YYYY');
  }

  closeModal(type) {
    this.modal.close(type);
  }

}

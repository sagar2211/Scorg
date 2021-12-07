import { Component, OnInit, Input } from '@angular/core';
import { AppointmentListModel } from './../../../modules/appointment/models/appointment.model';
import { SlotInfo } from 'src/app/modules/appointment/models/slot-info.model';
import { QAppointments } from '../../../modules/qms/models/q-entity-appointment-details';
import { PatientHistory } from 'src/app/modules/appointment/models/patient-history.model';
import { PatientAppoitmentInfoModel } from 'src/app/modules/appointment/models/patient-appointment-info.model';

import { Subject, forkJoin } from 'rxjs';
import * as _ from 'lodash';
import { AppointmentHistory } from 'src/app/modules/appointment/models/appointment-history.model';
import { ApplicationEntityConstants } from '../../constants/ApplicationEntityConstants';

import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';
import { EntityBasicInfoService } from './../../../modules/schedule/services/entity-basic-info.service';

import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentEntityInfoModel } from 'src/app/modules/appointment/models/appointment-entity-info.model';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { AppointmentTimeSlots } from 'src/app/modules/appointment/models/appointment-time-slot.model';

@Component({
  selector: 'app-patient-appointments-detail',
  templateUrl: './patient-appointments-detail.component.html',
  styleUrls: ['./patient-appointments-detail.component.scss']
})
export class PatientAppointmentsDetailComponent implements OnInit {
  @Input() patientData;
  @Input() selectedAppointementData: AppointmentListModel;
  @Input() public bookingData: QAppointments;
  @Input() timeFormatKey: string;
  patientAppoitmentInfo: PatientAppoitmentInfoModel;
  appEntityData: any;
  public appontmentDate: Date = new Date();
  servicesName = [];

  constructor(
    private appointmentService: AppointmentService,
    private entityBasicInfoService: EntityBasicInfoService,
    private commonService: CommonService,
    public modal: NgbActiveModal, ) { }

  ngOnInit() {
    this.entityBasicInfoService.getAllEntityList().subscribe((res) => {
      this.selectedAppointementData.entity_name = this.entityBasicInfoService.getEnityDetailsById(this.selectedAppointementData.entity_id).name;
    });
    const appointmentDt = this.selectedAppointementData ? this.selectedAppointementData.entity_data as AppointmentEntityInfoModel : null;
    this.appEntityData = appointmentDt;
    this.appointmentService.getServiceByAppointmentId(this.bookingData.appointmentId).subscribe((res) => {
      if (res) {
        const appoitmentInfo = new PatientAppoitmentInfoModel();
        appoitmentInfo.generateObject({ ...res });
        this.patientAppoitmentInfo = appoitmentInfo;
        this.appEntityData.start_time = this.commonService.convertTime(this.timeFormatKey, this.patientAppoitmentInfo.slotTimeFrom);
        this.appEntityData.end_time = this.commonService.convertTime(this.timeFormatKey,
          (this.patientAppoitmentInfo.slotTimeTo === '00:00' || this.patientAppoitmentInfo.slotTimeTo === '12:00 AM') ? '23:59' : this.patientAppoitmentInfo.slotTimeTo);
        this.appEntityData.appointment_type = this.patientAppoitmentInfo.AppointmentTypeName;
        _.map(this.patientAppoitmentInfo.Services, (t) => {
          this.servicesName.push(t.service_name);
        });
      }
    });

  }

  dismissModel(): void {
    this.modal.close();
  }
}

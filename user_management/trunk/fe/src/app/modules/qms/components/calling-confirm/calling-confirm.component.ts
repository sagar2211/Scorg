import { IAlert } from 'src/app/models/AlertMessage';
import { QSlotInfoDummy } from './../../models/q-entity-appointment-details';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-calling-confirm',
  templateUrl: './calling-confirm.component.html',
  styleUrls: ['./calling-confirm.component.scss']
})
export class CallingConfirmComponent implements OnInit {
  alertMsg: IAlert;

  @Input() public appointmentSlots: Array<QSlotInfoDummy> = [];
  // @Input() public queueList: Array<QSlotInfoDummy> = [];
  @Input() public callingLimit: number;
  @Input() public selectedAppointment: QSlotInfoDummy;
  @Input() public selectRoomIdOfPatient: number;
  @Output() updateStatusEvent = new EventEmitter<any>();

  constructor(
    public modal: NgbActiveModal) { }

  ngOnInit() { }

  updateAppointentStatus(item: QSlotInfoDummy, status, roomId?): void {
    this.updateStatusEvent.emit({ item, status, roomId, isSkip: true });
    const indx = this.appointmentSlots.findIndex(res => res.patUhid === item.patUhid);
    if (indx !== -1) {
      this.appointmentSlots.splice(indx, 1);
    }

    // const reqParams = {
    //   queue_main_id: item.queueId,
    //   status_id: +status, // -- CALLING,
    //   cater_room_id: (+status === 2) ? roomId : 0
    // };
    // this.queueService.updateAppointmentQueue(reqParams).subscribe(res => {
    //   if (res.status_message === 'Success') {
    //     item.queueStatusId = +status;
    //     // item.queueStatus = this.qStatusList[this.qStatusList.findIndex(r => r.id === +status)].name;
    //     this.alertMsg = {
    //       message: 'Status updated succesfully',
    //       messageType: 'success',
    //       duration: Constants.ALERT_DURATION
    //     };

    //   } else {
    //     this.alertMsg = {
    //       message: res.message,
    //       messageType: 'danger',
    //       duration: Constants.ALERT_DURATION
    //     };
    //   }
    // });
  }

  onCalling(): void {
    this.updateAppointentStatus(this.selectedAppointment, 2, this.selectRoomIdOfPatient);
    this.modal.dismiss();
  }

}

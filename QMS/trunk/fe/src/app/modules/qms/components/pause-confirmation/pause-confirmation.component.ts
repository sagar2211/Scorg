import { QueueService } from './../../services/queue.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pause-confirmation',
  templateUrl: './pause-confirmation.component.html',
  styleUrls: ['./pause-confirmation.component.scss']
})
export class PauseConfirmationComponent implements OnInit {

  minutes: string;
  @Input() selectedSchedule;
  submitted = false;

  constructor(
    public modal: NgbActiveModal,
    private queueService: QueueService
  ) { }

  ngOnInit() {
  }

  pause() {
    this.submitted = true;
    if (this.minutes) {
      const reqParams = {
        room_mapping_id: this.selectedSchedule.roomMapId,
        staus: 'Pause',
        pause_time: this.minutes,
        stop_reason: ''
      };
      this.queueService.saveCheckInCheckOutStatus(reqParams).subscribe((res: any) => {
        if (res.status_message === 'Success') {
          this.modal.close(res);
        } else {
          this.modal.dismiss(res);
        }
        this.submitted = false;
      });
    }
  }

}

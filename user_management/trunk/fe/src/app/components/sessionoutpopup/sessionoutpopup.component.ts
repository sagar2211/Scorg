import { Component, OnInit, Input, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-sessionoutpopup',
  templateUrl: './sessionoutpopup.component.html',
  styleUrls: ['./sessionoutpopup.component.scss']
})
export class SessionoutpopupComponent implements OnInit {
  @Input() errorMsgDetails;
  timeLeft: number = 120; // 2 min befor popup will display.
  interval;
  constructor(
    public modal: NgbActiveModal

  ) { }

  ngOnInit() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.modal.close('logout');
      }
    }, 1000);
  }
}

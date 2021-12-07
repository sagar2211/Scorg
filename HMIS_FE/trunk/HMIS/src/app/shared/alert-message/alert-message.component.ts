import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IAlert } from './../../public/models/AlertMessage';

@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss']
})
export class AlertMessageComponent implements OnInit, OnChanges {

  private alert = new Subject<string>();
  @Input() alertMessage: IAlert;
  @Input() duration = 5000;

  constructor() { }

  ngOnInit(): void {
    this.alert.subscribe((message) => {
      this.alertMessage.message = message;
    });
    this.alert.pipe(debounceTime(this.getDuration())).subscribe(() => this.alertMessage = null);
  }

  ngOnChanges(): void {
    if (this.alertMessage != null && this.alertMessage.message && this.alertMessage.messageType) {
      this.alert.next(this.alertMessage.message);
    }
  }

  getDuration(): any {
    if (this.alertMessage) {
      if (this.alertMessage.duration != null) {
        return this.alertMessage.duration;
      }
    } else {
      return this.duration;
    }
  }

}

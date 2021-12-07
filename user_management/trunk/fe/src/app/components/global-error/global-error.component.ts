import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-global-error',
  templateUrl: './global-error.component.html',
  styleUrls: ['./global-error.component.scss']
})
export class GlobalErrorComponent implements OnInit {
  @Input() errorMsgDetails;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

  reload() {
    window.location.reload();
  }

}

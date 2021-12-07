import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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

  ngOnInit(): void { }

  reload(): void {
    window.location.reload();
  }

}

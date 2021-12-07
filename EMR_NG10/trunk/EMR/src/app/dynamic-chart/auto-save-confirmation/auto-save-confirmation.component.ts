import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-auto-save-confirmation',
  templateUrl: './auto-save-confirmation.component.html',
  styleUrls: ['./auto-save-confirmation.component.scss']
})
export class AutoSaveConfirmationComponent implements OnInit {

  constructor(public modal: NgbActiveModal) { }

  ngOnInit() {
  }

}

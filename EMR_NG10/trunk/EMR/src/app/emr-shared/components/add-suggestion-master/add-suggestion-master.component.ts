import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-suggestion-master',
  templateUrl: './add-suggestion-master.component.html',
  styleUrls: ['./add-suggestion-master.component.scss']
})
export class AddSuggestionMasterComponent implements OnInit {
  @Input() masterName: any;
  @Input() placeHolderName: any;
  @Output() newSuggNameEvent = new EventEmitter<any>();
  @Input() selectedText = '';
  suggName = '';
  constructor(
    public modal: NgbActiveModal,
  ) { }

  ngOnInit() {
    this.suggName = this.selectedText;
  }

  AddSuggValue() {
    if (this.suggName) {
      this.newSuggNameEvent.emit(this.suggName);
    }
  }

}

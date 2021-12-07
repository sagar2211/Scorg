import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-radio-switch',
  templateUrl: './radio-switch.component.html',
  styleUrls: ['./radio-switch.component.scss']
})
export class RadioSwitchComponent implements OnInit {
 // @Input() displayType; //round, square
  @Input() value; //round, square
  @Output() radioValue = new EventEmitter<any>();
  dpFrm: FormGroup;

  constructor(
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    this.dpFrm = this._fb.group({
      radioCheck: [this.value]
    });
  }

  ngOnChanges() {
    if (this.dpFrm) {
      this.dpFrm = this._fb.group({
        radioCheck: [this.value]
      });
    }
  }

  onRadioChanges(val): void {
    this.radioValue.emit(val);
  }

}

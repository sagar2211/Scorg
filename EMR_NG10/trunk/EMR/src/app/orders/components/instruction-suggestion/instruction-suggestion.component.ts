import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-instruction-suggestion',
  templateUrl: './instruction-suggestion.component.html',
  styleUrls: ['./instruction-suggestion.component.scss']
})
export class InstructionSuggestionComponent implements OnInit {
  instructionSugnFrm: FormGroup;
  isOpendsuggestionPanel: boolean = false;
  @Input() suggestionList: any = [];
  @Input() instructions: any = '';
  @Input() placeholdertext = 'Enter Instruction';
  @Input() rows = 7;
  @Input() showFrequency = true;
  @Output() changedValue = new EventEmitter<any>();
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.instructionSugnFrm = this.fb.group({
      instructionsTxt: ['']
    });
    this.instructionSugnFrm.patchValue({instructionsTxt: this.instructions});
    this.instructionSugnFrm.get('instructionsTxt').valueChanges.subscribe(val => {
      this.changedValue.emit(val);
    });
  }

  openSuggestionPanel() {
    this.isOpendsuggestionPanel = true;
  }

  onSelectSuggestionList(selectedSugg) {
    selectedSugg.checked = true;
    selectedSugg.instruction = selectedSugg.instruction + ' ';
    this.instructions = this.instructions ? this.instructions : '';
    this.instructions = this.instructions.concat(selectedSugg.instruction);
    this.instructionSugnFrm.patchValue({instructionsTxt: this.instructions});
  }

}

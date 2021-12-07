import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Room } from 'src/app/modules/qms/models/room.model';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'app-select-multiple',
  templateUrl: './select-multiple.component.html',
  styleUrls: ['./select-multiple.component.scss']
})
export class SelectMultipleComponent implements OnInit, OnChanges {
  @Output() optionSelectEvent = new EventEmitter<any>();
  @Input() disableRoom;
  @Input() selectedOptionList;
  @Input() setSourceList;
  loadForm: boolean;
  selectMultipleListForm: FormGroup;
  compInstance = this;
  sourceList: [] = [];
  constructor(
    private fb: FormBuilder,
    private roomMasterService: RoomMasterService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.sourceList = this.setSourceList;
    this.generateDataForForm();
  }

  ngOnChanges() {
    this.generateDataForForm();
  }

  generateDataForForm() {
    if (!this.loadForm) {
      this.createForm();
    } else {
      this.updateValue();
    }
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue() {
    const form = {
      selectedVal: [],
    };
    this.selectMultipleListForm = this.fb.group(form);
    this.loadForm = true;
    this.updateValue();
  }

  updateValue() {
    if (_.isEmpty(this.selectedOptionList)) {
      this.selectedOptionList = [];
    }
    this.selectMultipleListForm.patchValue({ selectedVal: this.selectedOptionList });

    if (this.disableRoom) {
      this.selectMultipleListForm.get('selectedVal').disable();
    } else {
      this.selectMultipleListForm.get('selectedVal').enable();
    }
  }

  getSelectedValues() {
    this.optionSelectEvent.emit(this.selectMultipleListForm.value);
  }

}

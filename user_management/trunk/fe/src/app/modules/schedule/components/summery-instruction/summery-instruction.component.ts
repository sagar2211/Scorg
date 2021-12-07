import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-summery-instruction',
  templateUrl: './summery-instruction.component.html',
  styleUrls: ['./summery-instruction.component.scss']
})
export class SummeryInstructionComponent implements OnInit {
  @Input() instructionData;
  @Input() showEditButton;
  @Output() onEditButtonClick = new EventEmitter<any>();
  @Output() onDeleteButtonClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  editScheduleData(val, flag) {
    const data = {
      data: val,
      key: flag
    };
    this.onEditButtonClick.emit(data);
  }

  deleteScheduleData(data, index, subIndex, key) {
    const emitData = {
      'data': data,
      'index': index,
      'subIndex': subIndex,
      'key': key
    };
    this.onDeleteButtonClick.emit(emitData);
  }

}

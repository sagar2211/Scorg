import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-summery-rules',
  templateUrl: './summery-rules.component.html',
  styleUrls: ['./summery-rules.component.scss']
})
export class SummeryRulesComponent implements OnInit {
  @Input() rulesData;
  @Input() showEditButton;
  @Output() onEditButtonClick = new EventEmitter<any>();

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

}

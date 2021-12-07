import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-summery-basic-info',
  templateUrl: './summery-basic-info.component.html',
  styleUrls: ['./summery-basic-info.component.scss']
})
export class SummeryBasicInfoComponent implements OnInit {
  @Input() basicInfoData;
  @Input() showEditButton;
  @Output() onEditButtonClick = new EventEmitter<any>();

  basicInfo: any;
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

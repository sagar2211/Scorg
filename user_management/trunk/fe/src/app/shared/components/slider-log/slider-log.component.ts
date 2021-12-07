import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { SliderlogDetails } from '../../models/sliderlog-details';

@Component({
  selector: 'app-slider-log',
  templateUrl: './slider-log.component.html',
  styleUrls: ['./slider-log.component.scss']
})
export class SliderLogComponent implements OnInit, OnChanges {
  @Output() onScrollsendPageInfo = new EventEmitter<any>();
  @Input() logDetails = new SliderlogDetails();
  @Input() source: string;
  pagination = { limit: 15, pageNo: 1};
  @Input() notscrolly: boolean = true;

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
  }
  onClose(): void {
    this.commonService.openCloselogSlider('close');
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.notscrolly) {
      this.notscrolly = true;
    }
  }

  onScrollDown() {
    if (this.notscrolly) {
      this.pagination.pageNo = this.pagination.pageNo + 1;
      this.onScrollsendPageInfo.next(this.pagination);
    }
  }

}

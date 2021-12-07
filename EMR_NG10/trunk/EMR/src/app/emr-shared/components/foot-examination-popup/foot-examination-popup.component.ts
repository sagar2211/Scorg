import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { FootExaminationService } from './../../../public/services/foot-examination.service';

@Component({
  selector: 'app-foot-examination-popup',
  templateUrl: './foot-examination-popup.component.html',
  styleUrls: ['./foot-examination-popup.component.scss']
})
export class FootExaminationPopupComponent implements OnInit {
  @Input() public footExaminationData: any;
  @Input() chartDetailId: number;
  public examineData: any;
  public pain = 'Absent';
  public isAbsent = false;
  public isReduced = false;
  public isNormal = false;
  currentSection = 'section1';
  constructor(
    private modal: NgbActiveModal,
    private footService: FootExaminationService,
  ) {
  }

  ngOnInit() {
    this.footExaminationData = this.footService.getData(this.chartDetailId);
    this.generateData();
    this.footService.OnUpdatePainScore.subscribe(response => {
      if (response) {
        this.footExaminationData = this.footService.getData(this.chartDetailId);
        // this.getDataByChatDetailId();
        this.generateData();
      }
    });
  }

  getDataByChatDetailId() {
    const examineData = this.footService.getData(this.chartDetailId);
    this.footExaminationData = _.filter(this.examineData, (o) => {
      return o.chart_detil_id === this.chartDetailId;
    });
  }

  public closeModal() {
    this.modal.close('closed');
  }

  public onPainScale(color) {
    this.pain = color;
  }

  public generateData() {
    this.examineData = this.footService.getDataByGroup(this.chartDetailId);
  }

}

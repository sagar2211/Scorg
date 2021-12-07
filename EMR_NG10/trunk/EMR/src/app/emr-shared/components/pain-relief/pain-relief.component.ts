import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { PublicService } from './../../../public/services/public.service';
import { Component, OnInit, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'pain-relief',
  templateUrl: './pain-relief.component.html',
  styleUrls: ['./pain-relief.component.scss']
})
export class PainReliefComponent implements OnInit, OnChanges {

  barValues: any[] = [];
  imgPath: string;
  oldscore: any = '';
  @Input() painScaleInput: any;
  @Output() updatePainRelief = new EventEmitter<any>();
  @Input() public componentInfo: any;
  isPanelOpen: boolean;
  chartDetailId: number;

  constructor(
    public publicService: PublicService,
    public commonService: CommonService,
    public dynamicChartService: DynamicChartService
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.imgPath = environment.IMG_PATH;
    this.defaultImgIconForPainScale();
    this.getPainReliefInitData();
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
  }

  ngOnChanges(change) {
    // this.imgPath = environment.IMG_PATH;
    // this.painScaleInput = change.painScaleInput.currentValue
    // this.painscaleChangeIcon(this.painScaleInput);
  }


  defaultImgIconForPainScale(): void {
    for (let i = 0; i <= 10; i++) {
      const v = { val: i, img: '00' + i + '.png' };
      this.barValues.push(v);
    }
  }

  resetPainScale(): void {
    this.painscaleChangeIcon(null);
  }

  painscaleChangeIcon(score): void {
    if (score === '' || score === null) {
      this.painscaleChange(null, score, 'painScale');
    } else {
      const id = ((score === 0) ? this.painscaleChange(0, score, 'painScale') :
        (score >= 1 && score <= 3) ? this.painscaleChange(2, score, 'painScale') :
          (score >= 4 && score <= 6) ? this.painscaleChange(5, score, 'painScale') :
            (score >= 7 && score <= 9) ? this.painscaleChange(8, score, 'painScale') :
              (score === 10) ? this.painscaleChange(10, score, 'painScale') :
                this.painscaleChange(null, score, 'painScale'));
    }
  }

  painscaleChange(score, barScore, where): void {
    barScore = barScore || score;
    if (where === 'painScale' && barScore != null) {
      this.painScaleInput = barScore;
      this.oldscore = this.oldscore.toString();
      if (this.oldscore !== '') {
        this.barValues[this.oldscore]['img'] = '00' + this.oldscore + '.png';
      }
      const indxs = _.findIndex(this.barValues, (o) => {
        return o.val === +score;
      });
      if (indxs !== -1) {
        this.barValues[score]['img'] = score + '.png';
        this.oldscore = score;
      }
    } else if (barScore === '' || barScore === null) {
      if (where === 'painScale') {
        this.barValues = [];
        this.painScaleInput = barScore;
        this.defaultImgIconForPainScale();
      }
    }
    this.updateParamValue();
  }

  updateParamValue(): void {
    // this.updatePainRelief.emit(this.painScaleInput);
    this.prepareAndSaveLocalTransData();
  }

  menuClicked(event: NgbPanelChangeEvent) {
    this.isPanelOpen = event.nextState;
    this.publicService.componentSectionClicked({
      sectionKeyName: 'pain_relief'
    });
  }

  getPainReliefInitData() {
    this.dynamicChartService.getChartDataByKey('relief_scale', true, null, this.chartDetailId).subscribe(result => {
      if (!result || result === null) {
        this.painScaleInput = null;
        this.painscaleChangeIcon(this.painScaleInput);
        return;
      }
      if (result.length) {
        this.painScaleInput = result[0].patient_relief_scale;
        this.painscaleChangeIcon(this.painScaleInput);
      }
    });
  }
  prepareAndSaveLocalTransData() {
    const reliefscaleObj = {
      patient_relief_scale: this.painScaleInput,
      chart_detail_id: this.chartDetailId
    };
    this.dynamicChartService.updateLocalChartData('relief_scale', [reliefscaleObj], 'update', this.chartDetailId);
  }
  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }
}

import { Component, OnInit, Renderer2, ElementRef, OnDestroy, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { FootExaminationPopupComponent } from './../foot-examination-popup/foot-examination-popup.component';
import { PublicService } from './../../../public/services/public.service';
import { FootExaminationService } from './../../../public/services/foot-examination.service';
import { environment } from 'src/environments/environment';
import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-foot-examination',
  templateUrl: './foot-examination.component.html',
  styleUrls: ['./foot-examination.component.scss']
})
export class FootExaminationComponent implements OnInit, OnDestroy {
  public footExaminationData = [];
  public leftFootData: any = [];
  public rightFootData: any = [];
  imgPath: string;
  public isFootExaminationDone = false;
  @Input() public source;
  @Input() footExaminationDataInputs = [];
  @Input() public componentInfo: any;
  chartDetailId: number;
  constructor(
    private modalService: NgbModal,
    private element: ElementRef,
    private renderer: Renderer2,
    private footService: FootExaminationService,
    public publicService: PublicService,
    public dynamicChartService: DynamicChartService,
    public commonService: CommonService,
  ) { }

  ngOnInit() {
    this.imgPath = environment.IMG_PATH;
    if (this.footExaminationDataInputs.length && this.source === 'history') {
      const chartDetailsId = this.footExaminationDataInputs[0].chart_detail_id;
      this.footService.creatEmptyChartInstance(chartDetailsId);
      _.map(this.footExaminationDataInputs,(foot) => {
        this.footService.updatePainScore(foot);
      });
      this.isFootExaminationDone = this.footService.getFlag(chartDetailsId);
      this.footExaminationData = this.footService.getData(chartDetailsId);
    } else {
      this.chartDetailId = this.componentInfo.chart_detail_id;
      this.footService.creatEmptyChartInstance(this.chartDetailId);
      this.getFootExaminationInitData();
    }
  }

  ngOnDestroy() { }

  public getFootExaminationReport() {
    this.footExaminationData = this.footService.getData(this.chartDetailId);
    this.isFootExaminationDone = this.footService.getFlag(this.chartDetailId);
  }

  public openExaminationPopUp() {
    this.isFootExaminationDone = false;
    const footExaminationPopupRef = this.modalService.open(FootExaminationPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'foot-examination',
      size: 'xl',
      container: '#homeComponent',
    });
    footExaminationPopupRef.componentInstance.footExaminationData = this.footExaminationData;
    footExaminationPopupRef.componentInstance.chartDetailId = this.chartDetailId;
    footExaminationPopupRef.result.then(result => {
      this.prepareAndSaveLocalTransData();
      footExaminationPopupRef.close();
      this.isFootExaminationDone = this.footService.getFlag(this.chartDetailId);
    });
  }

  public afterLoadingData() {
    const hostElem = this.element.nativeElement;
    const footExaminationRegion = hostElem.querySelectorAll('.footExamine');
    if (footExaminationRegion.length > 0) {
      footExaminationRegion.forEach(element => {
        if (this.footExaminationData.length > 0) {
          const regionId = element.attributes['id'].value;
          this.footExaminationData.forEach(pain => {
            if (pain.body_part === regionId) {
              this.renderer.setAttribute(element, 'class', 'score_' + pain.pain_score);
            }
          });
        }
      });
    }
  }

  menuClicked($event) {
    this.publicService.componentSectionClicked({
      sectionKeyName: 'foot_examination'
    });
  }

  getFootExaminationInitData() {
    this.dynamicChartService.getChartDataByKey('pain_foot_details', true, null, this.chartDetailId).subscribe(result => {
      if (!result || result === null) {
        this.getFootExaminationReport();
        this.isFootExaminationDone = false;
        const selectedPart = _.reject(this.footExaminationData, { pain_score: 'no' });
        _.map(selectedPart, (x) => {
          this.footService.deletePainScore(x.body_part);
        });
        return;
      }
      if (result && result.length) {
        _.map(result, (x) => {
          this.footService.updatePainScore(x);
        });
        this.isFootExaminationDone = this.footService.getFlag(this.chartDetailId);
        this.footExaminationData = this.footService.getData(this.chartDetailId);
        // this.afterLoadingData();
      }
    });
  }
  prepareAndSaveLocalTransData() {
    const footPart = this.footService.getData(this.chartDetailId);
    const selectedPart = _.reject(footPart, { pain_score: 'no' });
    this.dynamicChartService.updateLocalChartData('pain_foot_details', selectedPart, 'update', this.chartDetailId);
  }
  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }
}

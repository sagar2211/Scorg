import { Component, OnInit, Input, OnChanges, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FootExaminationService } from '../../../public/services/foot-examination.service';

@Component({
  selector: 'app-single-foot-examination',
  templateUrl: './single-foot-examination.component.html',
  styleUrls: ['./single-foot-examination.component.scss']
})
export class SingleFootExaminationComponent implements OnInit {
  @Input() svgName: any;
  @Input() painScore: any;
  @Input() footPainData: Array<any>;
  @Input() bodyPartSide: any;
  @Input() chartDetailId: number;
  public template;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private footService: FootExaminationService
  ) {
  }

  ngOnInit() {
    this.setTemplateUrl();
    // this.footService.OnDeletePainPart.subscribe(response => {
    //   this.oninsert();
    // });
  }

  setTemplateUrl() {
    this.template = environment.IMG_PATH + '/human/' + this.svgName + '.svg';
  }

  oninsert() {
    const hostElem = this.element.nativeElement;
    const footExaminationRegion = hostElem.querySelectorAll('.footExamine');
    if (footExaminationRegion.length > 0) {
      footExaminationRegion.forEach(element => {
        if (this.footPainData.length > 0) {
          const regionId = element.attributes.id.value;
          this.footPainData.forEach(pain => {
            if (pain.body_part === regionId) {
              this.renderer.setAttribute(element, 'class', 'score_' + pain.pain_score);
              this.renderer.addClass(element, 'footExamine');
            }
          });
        }
        this.renderer.listen(element, 'click', (el) => {
          const regionId = element.attributes.id.value;
          const index = this.footPainData.findIndex(data => data.pain_score === 'no' && data.body_part === regionId);
          if (index >= 0) {
            this.renderer.setAttribute(element, 'class', 'score_' + this.painScore);
            this.renderer.addClass(element, 'footExamine');
            const addedPainScore = {
              body_part: regionId,
              pain_score: this.painScore,
              chart_detail_id: this.chartDetailId
            };
            this.footService.updatePainScore(addedPainScore);
          } else {
            this.renderer.setAttribute(element, 'class', 'score_no');
            this.renderer.addClass(element, 'footExamine');
            this.footService.deletePainScore(regionId);
          }
        });
        this.renderer.listen(element, 'mouseover', (el) => {
          const regionId = element.attributes.id.value;
          const index = this.footPainData.findIndex(data => data.pain_score === 'no' && data.body_part === regionId);
          if (index >= 0) {
            this.renderer.setAttribute(element, 'class', 'score_' + this.painScore);
            this.renderer.addClass(element, 'footExamine');
          }
        });
        this.renderer.listen(element, 'mouseout', (el) => {
          const regionId = element.attributes.id.value;
          const index = this.footPainData.findIndex(data => data.pain_score === 'no' && data.body_part === regionId);
          if (index >= 0) {
            this.renderer.setAttribute(element, 'class', 'score_no');
            this.renderer.addClass(element, 'footExamine');
          }
        });
      });
    }
  }

}

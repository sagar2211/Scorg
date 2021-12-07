import { Component, OnInit, Input, ElementRef, Renderer2, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PainDataService } from '../../public/services/pain-data.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-svg-map-print',
  templateUrl: './svg-map-print.component.html',
  styleUrls: ['./svg-map-print.component.scss']
})
export class SvgMapPrintComponent implements OnInit, OnChanges {
  @Input() svgno;
  @Input() dummyData;
  @Input() svg_type;
  @Input() svg_name;

  myTemplateUrl: string;
  painScoreData: any[] = [];
  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private painDataService: PainDataService
  ) { }

  ngOnChanges() {
    this.svgno = this.svgno;
    this.painScoreData = (_.isUndefined(this.dummyData)) ? [] : this.dummyData;
    this.setSvgAttributes();
  }

  ngOnInit() {
    this.myTemplateUrl = environment.IMG_PATH + '/human/asset' + this.svgno + '.svg';
  }

  onSVGInserte(e) {
    this.setSvgAttributes();
  }

  setSvgAttributes() {
    const hostElem = this.element.nativeElement;
    const humanregions = hostElem.querySelectorAll('.human');
    const myotomeregions = hostElem.querySelectorAll('.myotome');
    const dermatomeregions = hostElem.querySelectorAll('.dermatome');
    const footExaminationregions = hostElem.querySelectorAll('.footExamine');
    const regions = myotomeregions.length > 0 ? myotomeregions : humanregions.length > 0 ? humanregions : dermatomeregions.length > 0 ?
    dermatomeregions : footExaminationregions.length > 0 ? footExaminationregions : null;
    if (regions) {
      regions.forEach(element => {
        const elementId = element.getAttribute('id');
        const color = this.painDataService.getScore(this.painScoreData, elementId, +this.svgno);

        if (this.svgno.endsWith('_x')) {
          this.renderer.addClass(element, 'human');
          this.renderer.removeClass(element, 'st0_11x');
          this.renderer.removeClass(element, 'st0_12x');
          this.renderer.removeClass(element, 'st0_13x');
          this.renderer.removeClass(element, 'st0_14x');
          this.renderer.removeClass(element, 'st0_15x');
          this.renderer.setAttribute(element, 'fill', color);
          this.renderer.setAttribute(element, 'stroke', '#6d6d6d');
        } else {
          this.renderer.setAttribute(element, 'fill', color);
          // this.renderer.setAttribute(element, 'fill', color);
        }
      });
    }

  //   if(attrs.printbody=='true' || attrs.checkuppage=='true'){
  //     var getprintpainData=pData; //painData.getPrintPain();
  //     if(attrs.svgType=='humanBody'){
  //         var findindex = _.findIndex(getprintpainData, { svg_name:attrs.svgName })
  //     }else{
  //         var findindex = _.findIndex(getprintpainData, { svg_type:attrs.svgType })
  //     }
  //     var elem = angular.element(element[0]);
  //     if(findindex!=-1){
  //         elem.css('display','block');
  //         elem.removeClass('hide');
  //     }
  //     else {
  //         elem.css('display','none');
  //         elem.addClass('hide');
  //     }
  // }
  }
}

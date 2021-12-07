import { Component, OnInit, Input, ViewChild, TemplateRef, ElementRef, AfterViewInit, OnChanges, Renderer2, Output, EventEmitter, AfterContentChecked, AfterViewChecked } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { environment } from './../../../../environments/environment';
import { PainDataService } from './../../../public/services/pain-data.service';

@Component({
  selector: 'app-svg-map',
  template: `
    <div (onSVGInserted)="onSVGInserte($event)" [inlineSVG]="myTemplateUrl" id="svgRoot"
      [ngClass]="['cloneMouseHover svgall', setClassName()]" #cloneMouseHover>
    </div>
  `,
  styleUrls: ['./svg-map.component.scss']
})
export class SvgMapComponent implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {

  @Input() val;
  @Input() svg_name;
  @Input() svg_type;
  @Input() svgno;
  @Input() dummyData;
  @Input() hoverRegion;
  @Input() setClass;
  @Input() refVar;
  @Input() source: string;
  @Input() chartDetailId: number;

  @ViewChild('cloneMouseHover', { static: false }) cloneMouseHoverRef: TemplateRef<any>;
  @Output() outPutData = new EventEmitter<any>();

  myTemplateUrl: string;
  classNo: any;
  myclass: any;
  count = 0;
  myNewColorClass: string;
  copyOfSvgNodes: any;
  previousColor: string;
  currentColor: string;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private painDataService: PainDataService) { }

  ngOnChanges() {
    this.classNo = this.val;
    this.setClass = this.setClass;
    this.svgno = this.svgno;
    this.source = this.source;
  }

  ngOnInit() {
    this.myTemplateUrl = environment.IMG_PATH + '/human/asset' + this.svgno + '.svg';
  }

  ngAfterViewInit() {
    this.setClassName();
  }

  ngAfterViewChecked() {
    // this.setSvgAttributes();
  }

  setSvgAttributes(): void {
    // d3.xml(this.myTemplateUrl).then(xml => {
    //   const clone = this.cloneMouseHoverRef;
    //   xml.documentElement.querySelectorAll('svg').forEach(res => {
    //     clone['nativeElement'].appendChild(res);
    //     this.d3svgDisplay();
    //   });

    const hostElem = this.element.nativeElement;
    const humanregions = hostElem.querySelectorAll('.human');
    const myotomeregions = hostElem.querySelectorAll('.myotome');
    const dermatomeregions = hostElem.querySelectorAll('.dermatome');
    const regions = myotomeregions.length > 0 ? myotomeregions :
      humanregions.length > 0 ? humanregions :
        dermatomeregions.length > 0 ? dermatomeregions : null;
    if (regions) {
      regions.forEach(element => {
        const dt = _.find(this.dummyData, (r) => r.body_part === element.getAttribute('id'));
        if (!_.isUndefined(dt)) {
          this.renderer.setAttribute(element, 'isSelected', 'true');
          this.renderer.setAttribute(element, 'class', 'score' + dt.pain_score);
        } else {
          this.renderer.setAttribute(element, 'isSelected', 'false');
        }
        this.renderer.setAttribute(element, 'svg_name', this.svg_name);
        this.renderer.setAttribute(element, 'svg_type', this.svg_type);
        this.renderer.setAttribute(element, 'svgno', this.svgno);
        // this.renderer.setAttribute(element, 'dummy-data', this.dummyData);
        // this.renderer.setAttribute(element, 'hover-region', this.hoverRegion);
        this.renderer.setAttribute(element, 'class-no', this.classNo);
        // this.renderer.setAttribute(element, 'set-class', this.setClass);
        // this.renderer.setAttribute(element, 'checkuppage', 'checkuppage');
        this.renderer.setAttribute(element, 'source', myotomeregions.length > 0 ? 'myotome' :
          humanregions.length > 0 ? 'human' : dermatomeregions.length > 0 ? 'dermatome' : null);
      });
    }

    this.addEventsToSvgNodes();
  }

  // --apply d3 event to all svg nodes
  addEventsToSvgNodes() {
    const svgNodes = d3.selectAll('#svgRoot svg');
    this.copyOfSvgNodes = svgNodes;
    svgNodes.selectAll('path, polygon, ellipse')
      .attr('fill', this.fillColor)
      .on('click', this.onSvgClick)
      .on('mouseover', this.onMouseOver)
      .on('mouseout', this.onMouseOut);
  }

  fillColor = (e: any, i: number, d: any) => {
    const elementId = d3.select(d.item(i)).attr('id');
    // d3.select(d.item(i)).attr('class', d.item(i).getAttribute('source'));
    if (elementId) {
      if (elementId === 'myotome_head') {
        return '#000000';
      } else {
        return elementId === 'head_el' ? 'none' : this.painDataService.getScore(this.dummyData, elementId, this.svgno, this.myclass, this.count);
      }
    } else {
      // return '#000000';
      return this.source === 'myotome' ? 'none' : '#000000';
    }
  }

  // -- click on svg path or region
  onSvgClick = (e, i, d) => {
    if ((d.item(i).getAttribute('svg_name') === 'dermatomeFlag_light_lateral') || (d.item(i).getAttribute('svg_name') === 'myotomeFlag_lateral')) {
      return;
    }

    const selectedElement = d.item(i);
    const elementId = d3.select(selectedElement).attr('id');
    const isSelected = d3.select(d.item(i)).attr('isSelected');

    if (this.setClass !== undefined && this.setClass !== 'erase') {
      d.item(i).parentNode.appendChild(d.item(i));
      const findRegion = _.find(this.dummyData, { body_part: elementId });
      if ((this.setClass !== 0 && !_.isUndefined(findRegion) && this.count !== 2)) { // scope.count > 0
        this.dummyData.splice(_.findIndex(this.dummyData, (vd: any) => vd.body_part === elementId), 1);
        this.painDataService.setPain(this.dummyData);
        this.count = 0;
        this.applyColor(i, d, isSelected, this.setClass);
      } else if (findRegion !== undefined) {
        this.dummyData.splice(_.findIndex(this.dummyData, (vd: any) => vd.body_part === elementId), 1);
        this.painDataService.setPain(this.dummyData);
        this.count = 0;
        this.applyColor(i, d, isSelected, this.setClass);
      } else {
        this.count = 1;
        this.dummyData.push({
          body_part: elementId,
          pain_score: this.setClass,
          svg_name: d.item(i).getAttribute('svg_name'),
          svg_type: d.item(i).getAttribute('svg_type'),
          comment: '',
          chart_detail_id: this.chartDetailId
        });
        this.painDataService.setPain(this.dummyData);
        this.applyColor(i, d, isSelected, this.setClass);
      }
    } else {
      this.myclass = this.hoverRegion === elementId ? 'score11' : 'scoreBlank';
      d3.select(d.item(i)).classed(this.myclass, true);
      this.count = 2;
    }
    this.outPutData.emit(); // call to onClickLoadData();
  }

  // -- Apply color to selected svg paths
  applyColor(i: number, d: any, isSelected, setClass) {
    this.copyOfSvgNodes._groups.forEach(e => {
      e.forEach(a => {
        const el = a.querySelector('#' + d.item(i).getAttribute('id'));
        d3.select(el).attr('class', d.item(i).getAttribute('source'));

        if (isSelected === 'false') {
          d3.select(el)
            .classed('score' + setClass, true)
            .classed('scoreBlank', false)
            .attr('isSelected', true);
        } else {
          d3.select(el)
            .classed('score' + setClass, false)
            .classed('scoreBlank', true)
            .attr('isSelected', false);
        }

        // set color for Dermatome and myotome literal views
        if (!d.item(i).getAttribute('id')) {
          return;
        }
        const selectedEle = d.item(i).getAttribute('id').split('_');
        const val = selectedEle[selectedEle.length - 1];
        if (val && (this.source === 'Dermatome' || this.source === 'myotome')) {
          const element = a.querySelector('#' + val);
          const tempDt = this.dummyData.map(x => Object.assign(x));
          const filter = _.filter(tempDt, x => x.body_part.endsWith(val));
          const minVal = Math.min.apply(null, filter.map((b: any) => {
            if (b.pain_score === 'NT') { b.pain_score = 3; }
            return b.pain_score;
          }));
          if (element) {
            if (this.source === 'Dermatome') {
              d3.select(element).attr('class', 'st0 dermatome');
            } else {
              d3.select(element).attr('class', 'st1 myotome');
            }
            if (minVal === Infinity) {
              d3.select(element)
                .classed('score' + minVal, false)
                .classed('scoreBlank', true);
            } else {
              d3.select(element)
                // .classed('score' + minVal, false)
                .classed('scoreBlank', false)
                .classed('score' + minVal, true);
            }
          } else {
            d3.select(element)
              .classed('score' + setClass, false)
              .classed('score' + minVal, false)
              .classed('scoreBlank', true);
          }
        }
        // end
      });
    });

    // d3.select(d.item(i)).attr('class', d.item(i).getAttribute('source'));
    // if (isSelected == 'false') {
    //   d3.select(d.item(i))
    //   .classed('score' + setClass, true)
    //   .classed('scoreBlank', false)
    //   .attr('isSelected', true);
    // } else {
    //   d3.select(d.item(i))
    //   .classed('score' + setClass, false)
    //   .classed('scoreBlank', true)
    //   .attr('isSelected', false);
    // }
  }

  // -- on mouse over to region
  onMouseOver = (e, i, d) => {
    if ((d.item(i).getAttribute('svg_name') === 'dermatomeFlag_light_lateral') || (d.item(i).getAttribute('svg_name') === 'myotomeFlag_lateral')) {
      return;
    }

    const selectedElement = d.item(i);
    const elementId = d3.select(selectedElement).attr('id');
    const isSelected = d3.select(selectedElement).attr('isSelected');
    // this.hoverRegion = elementId;
    // selectedElement.parentNode.appendChild(selectedElement);
    // this.myclass = this.hoverRegion === elementId ? 'score' + this.setClass : 'scoreBlank';

    // if (this.count === 0 && (_.find(this.dummyData, { body_part: elementId })) === undefined) {
    //   d3.select(selectedElement).classed(this.myclass, true).classed('scoreBlank', false);
    // }
    if (isSelected === 'false') {
      d3.select(selectedElement).classed('scoreBlank', false).classed('score' + this.setClass, true);
    }
  }

  // --on mouse out to region
  onMouseOut = (e, i, d) => {
    if ((d.item(i).getAttribute('svg_name') === 'dermatomeFlag_light_lateral') || (d.item(i).getAttribute('svg_name') === 'myotomeFlag_lateral')) {
      d3.select(d.item(i)).style('cursor: default');
      return;
    }

    this.hoverRegion = d3.select(d.item(i)).attr('id');
    const isSelected = d3.select(d.item(i)).attr('isSelected');
    d.item(i).parentNode.appendChild(d.item(i));
    if (isSelected === 'false') {
      d3.select(d.item(i)).classed('scoreBlank', true).classed('score' + this.setClass, false);
    }
  }

  // --remove svg fill color and called from parent
  removeSvgPath(data) {
    if ((this.source === 'Dermatome') || (this.source === 'myotome')) {
      data.forEach(dt => {
        const splt = dt.body_part.split('_');
        const val = splt[splt.length - 1];

        this.refVar.querySelectorAll('#' + val).forEach(el => {
          d3.select(el).classed('score' + dt.pain_score, false);
          d3.select(el).classed('score_' + dt.pain_score, false);
          d3.select(el).attr('isSelected', false);
          d3.select(el).classed('score_Blank', true);
          d3.select(el).classed('score_Blank', false);
          d3.select(el).attr('stroke', '#000000');
        });

        this.refVar.querySelectorAll('#' + dt.body_part).forEach(el => {
          d3.select(el).classed('score' + dt.pain_score, false);
          d3.select(el).classed('score_' + dt.pain_score, false);
          d3.select(el).attr('isSelected', false);
          d3.select(el).classed('score_Blank', true);
          d3.select(el).classed('score_Blank', false);
          d3.select(el).attr('stroke', '#000000');
        });
      });
    } else {
      data.forEach(val => {
        const hostElem = this.element.nativeElement;
        if (hostElem.querySelector('#' + val.body_part)) {
          this.renderer.removeClass(hostElem.querySelector('#' + val.body_part), 'score' + val.pain_score);
          this.renderer.removeClass(hostElem.querySelector('#' + val.body_part), 'score_' + val.pain_score);
          this.renderer.setAttribute(hostElem.querySelector('#' + val.body_part), 'isSelected', 'false');
          this.renderer.addClass(hostElem.querySelector('#' + val.body_part), 'scoreBlank');
          // this.renderer.removeClass(hostElem.querySelector('#' + val.body_part), 'score_Blank');
        }
      });
    }
  }

  // - fired when svg data full loaded
  onSVGInserte($e): void {
    this.setSvgAttributes();
  }

  setClassName() {
    if ((this.svg_type === 'dermatome_light') || (this.svg_type === 'dermatome_pin') || (this.svg_type === 'pin_prick') || (!this.svg_type)) {
      return 'no-padding dermatome-div-size';
    } else if (this.svg_type === 'myotome') {
      return 'no-padding myotome-div-size';
    } else {
      return 'svg-div-size';
    }
  }
}

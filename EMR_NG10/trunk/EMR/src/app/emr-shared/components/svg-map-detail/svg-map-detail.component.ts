import { Component, OnInit, Input, OnChanges, ElementRef, Renderer2, ViewChild, TemplateRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { environment } from './../../../../environments/environment';
import { PainDataService } from '../../../public/services/pain-data.service';

@Component({
  selector: 'app-svg-map-detail',
  template: `
    <div (onSVGInserted)="onSVGInserte($event)" [inlineSVG]="myTemplateUrl" id="svgMapDetail" class="svgall svg-div-size-zoom cloneMouseHover custom-scroll-transparent" #cloneMouseHover></div>
  `,
  styleUrls: ['./svg-map-detail.component.scss']
})
export class SvgMapDetailComponent implements OnInit, OnChanges, AfterViewInit {
  myTemplateUrl: string;

  @Output() valueChange = new EventEmitter<any>();

  @Input() val;
  @Input() svg_name;
  @Input() svg_type;
  @Input() svgno;
  @Input() setClass;
  @Input() dummyData;
  @Input() chartDetailId: number;

  @ViewChild('cloneMouseHover', { static: false }) cloneMouseHoverRef: TemplateRef<any>;

  classNo: any;
  scope_count = 0;
  painData: any[] = [];

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private painDataService: PainDataService) {
  }

  ngOnChanges() {
    this.svgno = this.svgno;
    this.classNo = this.val;
    // this.setClass = this.setClass;
  }

  ngOnInit() {
    this.myTemplateUrl = environment.IMG_PATH + '/human/asset' + this.svgno + '.svg';
    this.painData = this.painDataService.getPain();
    if (this.painData.length) {
      this.painData = _.filter(this.painData, (o) => {
        return o.chart_detail_id === this.chartDetailId;
      });
    }
  }

  ngAfterViewInit() {
  }

  setSvgAttributes(): void {
    const hostElem = this.element.nativeElement;
    const regions = hostElem.querySelectorAll('.human').length > 0 ? hostElem.querySelectorAll('.human') : null;
    if (regions) {
      regions.forEach(element => {
        const dt = _.find(this.painData, (r) => r.body_part === element.getAttribute('id'));
        if (!_.isUndefined(dt)) {
          this.renderer.setAttribute(element, 'isSelected', 'true');
          this.renderer.setAttribute(element,'class', 'score' + dt.pain_score)
        } else {
          this.renderer.setAttribute(element, 'isSelected', 'false');
        }
        this.renderer.setAttribute(element, 'svg_name', this.svg_name);
        this.renderer.setAttribute(element, 'svg_type', this.svg_type);
        this.renderer.setAttribute(element, 'svgno', this.svgno);
        // this.renderer.setAttribute(element, 'hover-region', this.hoverRegion);
        this.renderer.setAttribute(element, 'class-no', this.classNo);
        // this.renderer.setAttribute(element, 'set-class', this.setClass);
        this.renderer.setAttribute(element, 'source', 'human');
      });
    }

    this.d3svgDisplay();
  }

  d3svgDisplay() {
    const svg = d3.selectAll('#svgMapDetail svg');
    svg.selectAll('path, polygon, ellipse, rect, polyline')
      .attr('fill', this.fillColor)
      .on('click', this.onSvgClick)
      .on('mouseover', this.onMouseOver)
      .on('mouseout', this.onMouseOut)
      .on('mousemove', this.onMouseMove);
  }

  fillColor = (e: any, i: number, d: any) => {
    const elementId = d3.select(d.item(i)).attr('id');
    if (elementId) {
      if (elementId == 'head_el') {
        return 'none';
      } else {
        // d3.select(d.item(i)).attr('class', d.item(i).getAttribute('source'));
       return this.painDataService.getScore(this.painData, elementId, this.svgno, '', this.scope_count);
      }
    } else {
      return '#000000';
    }
  }

  onMouseOver = (e, i, d) => {
    const selectedElement = d.item(i);
    if (this.setClass !== 'erase') {
      const isSelected = d3.select(selectedElement).attr('isSelected');
      if (isSelected === 'false') {
        d3.select(d.item(i)).attr('class', d.item(i).getAttribute('source'));
        d3.select(d.item(i))
        .classed('score' + this.setClass, true)
        .classed('score_Blank', false)
      }
    }
  }

  onMouseOut = (e, i, d) => {
    const selectedElement = d.item(i);
    const isSelected = d3.select(selectedElement).attr('isSelected');
    if (this.setClass !== 'erase') {
      const myclass = 'score_' + this.setClass;
      if (isSelected === 'false') {
        d3.select(selectedElement).classed('score_Blank', true).classed('score' + this.setClass, false);
      }
    }
  }

  onMouseMove = (e, i, d) => {
    if (event['buttons'] > 0 && event['which'] === 1) { // drag mouse on left click
      const bodyPart = d.item(i).getAttribute('id');
      const bodyPartList = this.painData;
      const exists = _.find(bodyPartList, (o) => o.body_part === bodyPart);
      if (!exists && this.setClass !== 'erase') {
        this.onSvgClick(e, i, d);
      } else if (this.setClass === 'erase' && exists) {
        const delIndex = _.findIndex(bodyPartList, { body_part: d.item(i).getAttribute('id') });
        if (delIndex !== -1) {
          this.applyColor(i, d, d.item(i).getAttribute('isSelected'), this.setClass);
          bodyPartList.splice(delIndex, 1);
          this.painDataService.setPain(bodyPartList);
          this.scope_count = 0;
          this.valueChange.emit(null); // call function from parent
        }
      }
    }
  }

  onSvgClick = (e, i, d) => {
    const savePainScore = this.painDataService.getPain();
    const selectedItem = d.item(i);

    const elementId = d3.select(d.item(i)).attr('id');
    const isSelected = d3.select(d.item(i)).attr('isSelected');
    if (!elementId) { return; }
    if (this.setClass !== undefined && this.setClass !== 'erase') {
      selectedItem.parentNode.appendChild(selectedItem); // 22/5/19
      // const myclass = 'score' + this.setClass;

      const findRegion = _.find(savePainScore, { body_part: elementId });
      if (this.setClass !== 0 && !_.isUndefined(findRegion) && this.scope_count !== 2) {

        const indx = _.findIndex(savePainScore, { body_part: elementId });
        if (indx !== -1) {
          savePainScore.splice(indx, 1);
          this.painDataService.setPain(savePainScore);
          this.scope_count = 0;
          this.applyColor(i, d, isSelected, this.setClass);
        }
      } else if (findRegion !== undefined) {
        const indx = _.findIndex(savePainScore, { body_part: elementId });
        if (indx !== -1) {
          savePainScore.splice(indx, 1);
          this.painDataService.setPain(savePainScore);
          this.scope_count = 0;
          this.applyColor(i, d, isSelected, this.setClass);
        }
      } else {
        this.scope_count = 1;
        // scope.myclass = '';
        // selectedItem.classList.add(scope.myclass);
        this.applyColor(i, d, isSelected, this.setClass);
        savePainScore.push({
          body_part: elementId,
          pain_score: this.setClass,
          svg_name: this.svg_name,
          svg_type: this.svg_type,
          comment: '',
          chart_detail_id: this.chartDetailId
        });
        this.painDataService.setPain(savePainScore);
      }
    } else if (this.setClass === 'erase') {
      const indx = _.findIndex(savePainScore, { body_part: elementId });
      if (indx !== -1) {
        d3.select(d.item(i))
          .attr('isSelected', 'false')
          .classed('score' + savePainScore[indx].pain_score, false)
          .classed('score_Blank', true);

        savePainScore.splice(indx, 1);
        this.painDataService.setPain(savePainScore);
        this.scope_count = 0;
      } else {
        d3.select(d.item(i))
          .attr('isSelected', 'false')
          .attr('class', d3.select(d.item(i)).attr('source'))
          .classed('score_Blank', true);
      }

    } else {
      const delIndex = _.findIndex(savePainScore, { body_part: elementId });
      if (delIndex !== -1) {
        // scope.myclass = ''; // scoreBlank
        savePainScore.splice(delIndex, 1);
        this.painDataService.setPain(savePainScore);
        this.scope_count = 0;
      }
    }

    this.valueChange.emit(null); // call function from parent
  }

  // --Apply color to selected svg path
  applyColor(i: number, d: any, isSelected, setClass) {
    d3.select(d.item(i)).attr('class', d.item(i).getAttribute('source'));
    if (isSelected === 'false') {
      d3.select(d.item(i))
        .classed('score' + setClass, true)
        .classed('score_Blank', false)
        .attr('isSelected', true);
    } else {
      d3.select(d.item(i))
        .classed('score' + setClass, false)
        .classed('score_Blank', true)
        .attr('stroke', '#757070')
        .attr('isSelected', false);
    }
  }

  onSVGInserte($e): void {
    this.setSvgAttributes();
  }

  // --remove svg fill color and called from parent
  removeSvgPath(data) {
    data.forEach(val => {
      const hostElem = this.element.nativeElement;
      if (!hostElem.querySelector('#' + val.body_part)) { return; }
      this.renderer.removeClass(hostElem.querySelector('#' + val.body_part), 'score' + val.pain_score);
      this.renderer.removeClass(hostElem.querySelector('#' + val.body_part), 'score_' + val.pain_score);
      this.renderer.setAttribute(hostElem.querySelector('#' + val.body_part), 'isSelected', 'false');
      this.renderer.addClass(hostElem.querySelector('#' + val.body_part), 'score_Blank');
    });
  }

}

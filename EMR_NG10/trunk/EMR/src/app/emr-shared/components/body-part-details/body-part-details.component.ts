import { Component, OnInit, Input, ViewChild, ElementRef, Output, OnChanges, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { PainDataService } from './../../../public/services/pain-data.service';

@Component({
  selector: 'app-body-part-details',
  templateUrl: './body-part-details.component.html',
  styleUrls: ['./body-part-details.component.scss'],
})
export class BodyPartDetailsComponent implements OnInit, OnChanges {
  @Input() displayList;
  @ViewChild('bodyPartComment', { static: true }) bodyPartCommentPopupRef: ElementRef;

  @Output() callRemoveMethod: any = new EventEmitter();
  @Output() callLoadMethod: any = new EventEmitter();

  statusValue: any;
  typeOfBody = '';
  selectedVal: any;
  comment_type = '';

  constructor(
    private painDataService: PainDataService,
    private modalService: NgbModal
  ) { }

  ngOnChanges() {
    this.displayList = this.displayList;
  }

  ngOnInit() { }

  // -- set color selected svg path with score
  setColor(from, score) {
    let returnVal = '';
    switch (score) {
      case 1:
        returnVal = (from === 'HumanBody') ? 'label pain-one' : (from === 'Dermatome') ? 'label pain-six' : 'label pain-eight';
        break;
      case 2:
        returnVal = (from === 'HumanBody') ? 'label pain-two' : (from === 'Dermatome') ? 'label pain-one' : 'label pain-six';
        break;
      case 3:
        returnVal = (from === 'HumanBody') ? 'label pain-three' : 'label pain-five';
        break;
      case 4:
        returnVal = (from === 'HumanBody') ? 'label pain-four' : 'label pain-four';
        break;
      case 5:
        returnVal = (from === 'HumanBody') ? 'label pain-five' : 'label pain-one';
        break;
      case 6:
        returnVal = 'label pain-six';
        break;
      case 7:
        returnVal = 'label pain-seven';
        break;
      case 8:
        returnVal = 'label pain-eight';
        break;
      case 9:
        returnVal = 'label pain-nine';
        break;
      case 10:
        returnVal = 'label pain-ten';
        break;
      case 'NT':
        returnVal = 'label pain-NT';
        break;
      default:
        returnVal = (from === 'Dermatome') ? 'label pain-eight' : 'label pain-ten';
        break;
    }
    return returnVal;
  }

  // -- click on remove icons
  removebodyparts(painPart, flag, sideFlag?): void {
    const obj = {
      painPart,
      flag,
      sideFlag
    };
    this.callRemoveMethod.emit(obj);
  }

  // -- open body comment popup
  openCommentpopUp(currIndex, svg_type, nameStirng?) {
    this.typeOfBody = svg_type;
    this.selectedVal = currIndex;
    if (this.selectedVal.svg_name === 'headzoomFlag' || currIndex.svg_name === 'FrontzoomFlag' ||
      currIndex.svg_name === 'BackzoomFlag' || currIndex.svg_name === 'leftzoomFlag' || currIndex.svg_name === 'rightzoomFlag') {
      const filterbodypart = _.filter(this.painDataService.getPain(), (o) => {
        return o.body_part.indexOf(currIndex.body_part) === 0 && o.svg_name === currIndex.svg_name && o.pain_score === currIndex.pain_score;
      });
      // console.log(filterbodypart)
      if (filterbodypart.length > 0) {
        let bodypart =filterbodypart[0].body_part;
        // console.log(bodypart)
        bodypart = bodypart.replace(/[0-9]/g, '').trim();
        this.comment_type = currIndex.body_part === bodypart ? filterbodypart[0].comment : '';
      }
    } else {
      const filterbodypart = _.find(this.painDataService.getPain(), (o) => {
        return o.body_part === currIndex.body_part && o.svg_name === currIndex.svg_name;
      });
      this.comment_type = currIndex.body_part === filterbodypart.body_part ? filterbodypart.comment : '';
    }
    const modelInstance = this.modalService.open(this.bodyPartCommentPopupRef, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'Comment',
      size: 'xl',
      container: '#homeComponent',
    });
    modelInstance.result.then(result => { }, reason => { });
  }

  saveComment(comment_type, index) {
    if (index.svg_name === 'headzoomFlag' || index.svg_name === 'FrontzoomFlag' ||
      index.svg_name === 'BackzoomFlag' || index.svg_name === 'leftzoomFlag' || index.svg_name === 'rightzoomFlag') {
      const findSameBodyParts = _.filter(this.painDataService.getPain(), (o) => {
        return o.body_part.indexOf(index.body_part) === 0 && o.svg_name === index.svg_name && o.pain_score === index.pain_score;
      });
      if (findSameBodyParts.length > 0) {
        _.map(findSameBodyParts, (value, key) => {
          value.comment = comment_type;
        });
        this.callLoadMethod.emit();
        // notify({ message: 'comment saved successfully...', position: 'right', classes: 'alert-success', duration: 2000 });
      }
    } else {
      const savePainScoreComment = _.find(this.painDataService.getPain(), (o) => {
        return o.body_part === index.body_part && o.svg_name === index.svg_name;
      });
      if (!_.isUndefined(savePainScoreComment)) {
        savePainScoreComment.comment = comment_type;
        this.callLoadMethod.emit();
        // notify({ message: 'comment saved successfully...', position: 'right', classes: 'alert-success', duration: 2000 });
      }
    }
  }
}

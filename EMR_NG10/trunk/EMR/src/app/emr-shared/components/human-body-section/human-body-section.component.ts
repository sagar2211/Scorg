import { HumanBodyPainDetailsComponent } from './../human-body-pain-details/human-body-pain-details.component';
import { PainDataService } from './../../../public/services/pain-data.service';
import { environment } from 'src/environments/environment';
import { HumanBodyComponent } from './../human-body/human-body.component';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { PublicService } from './../../../public/services/public.service';
import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { DynamicChartService } from '../../../dynamic-chart/dynamic-chart.service';
import * as _ from 'lodash';
import { CommonService } from 'src/app/public/services/common.service';
@Component({
  selector: 'app-human-body-section',
  templateUrl: './human-body-section.component.html',
  styleUrls: ['./human-body-section.component.scss']
})
export class HumanBodySectionComponent implements OnInit {

  @ViewChild(HumanBodyPainDetailsComponent, { static: false }) humanBodyPainDetailsInst: HumanBodyPainDetailsComponent;
  @ViewChild('svgMapPrintsContainer', { static: false }) svgMapPrintsContainer: ViewContainerRef; // for display selected svg's
  @Input() public componentInfo: any;

  imgPath: string;
  humanIcon = 'human-body';
  footIcon = 'foot-examination';
  oldscore = '';
  // oldRelief = '';

  painDetails = [];
  partDetails = {
    humanbodyPartList: {
      humanbody: [],
      humanbodyDetail: []
    },
    Dermatome_lightPartList: [],
    Dermatome_pinPartList: [],
    myotomePartList: [],
    footExamination: []
  };
  bodyDetailsVisibility = { bodyExamineVisible: false, footExamineVisible: false };

  barValues: any[] = [];
  reliefbarValues = [];

  // painReliefInput: any;
  painScaleInput: any;
  painScoreInputs: any;
  dummyData: any;
  previousPainScore: any;
  getpainscoredataflag: boolean;

  maxValue: any = {
    maxhumanbody: '',
    maxdermatomelight: '',
    maxdermatomepinprick: '',
    maxMyotome: ''
  };
  maxServerity: any = {
    humanSerivty: 0,
    dermatolightSerivty: 0,
    dermatopinSerivty: 0,
    mytomSerivty: 0
  };

  severityValue = {
    dermatome: {
      severity: [{ score: 0, severity: 0 }, { score: 1, severity: 0 }, { score: 2, severity: 0 }, { score: 3, severity: 0 }]
    },
    myotome: {
      severity: [{ score: 0, severity: 0 }, { score: 1, severity: 0 }, { score: 2, severity: 0 }, { score: 3, severity: 0 },
      { score: 4, severity: 0 }, { score: 5, severity: 0 }, { score: 6, severity: 0 }]
    },
    humanBody: {
      severity: [{ score: 1, severity: 1 }, { score: 2, severity: 2 }, { score: 3, severity: 3 }, { score: 4, severity: 4 },
      { score: 5, severity: 5 }, { score: 6, severity: 6 }, { score: 7, severity: 7 }, { score: 8, severity: 8 }, { score: 9, severity: 9 }, { score: 10, severity: 10 }]
    }
  };
  displayBodyParts: any[] = [];
  isPanelOpen: boolean;
  chartDetailId: number;

  constructor(
    private modalService: NgbModal,
    private painDataService: PainDataService,
    private publicService: PublicService,
    private commonService: CommonService,
    public dynamicChartService: DynamicChartService
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.imgPath = environment.IMG_PATH;
    this.displayBodyParts = this.painDataService.masterDisplayBodyParts;

    if (this.painScaleInput != null) {
      const tempPainScaleValue = this.painScaleInput.toString().indexOf('.') > -1 ? this.painScaleInput.split('.')[0] : this.painScaleInput;
      this.oldscore = tempPainScaleValue;
      // this.painscaleChange(tempPainScaleValue, tempPainScaleValue, 'painScale');
      // this.painscaleChangeIcon(tempPainScaleValue);
    }

    // this.painDataService.setPain(this.painScoreInputs.pain_body_part);
    // this.painDataService.setPainAssociatedData(this.painScoreInputs.pain_associated_data);
    // this.painDetails = this.painScoreInputs.pain_body_part;

    this.getHumanBodyInitData();
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
  }


  humanScore(): void {
    this.getHumanBodyInitData();
    this.previousPainScore = this.painScaleInput;
    const modelInstance = this.modalService.open(HumanBodyComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'xl',
      container: '#homeComponent',
    });
    modelInstance.result.then(result => {
      this.humanbodyclose();
    }, reason => { });
    modelInstance.componentInstance.bodyDetailsVisibility = this.bodyDetailsVisibility;
    modelInstance.componentInstance.chartDetailId = this.chartDetailId;
  }

  findExaminePart(painDataList) {
    const isExistBodyExamine = _.find(painDataList, (o) => {
      return o.svg_type === 'humanBody';
    });
    this.bodyDetailsVisibility.bodyExamineVisible = !_.isUndefined(isExistBodyExamine) ? true : false;
    this.humanIcon = this.bodyDetailsVisibility.bodyExamineVisible === true ? 'human-body-active' : 'human-body';
  }

  MaxPainscore(list): any {
    let maxHumanBodyPainValue = 0;
    let maxhumanbodyDetailPainValue = 0;
    _.map(list, (value, key) => {
      if (key === 'humanbody') {
        maxHumanBodyPainValue = +Math.max.apply(Math, value.map((o) => o.pain_score));
      }
      if (key === 'humanbodyDetail') {
        maxhumanbodyDetailPainValue = +Math.max.apply(Math, value.map((o) => o.pain_score));
      }
    });
    return Math.max(maxHumanBodyPainValue, maxhumanbodyDetailPainValue);
  }

  bodyPartDetails(painDetails): void {
    this.partDetails = {
      humanbodyPartList: {
        humanbody: [],
        humanbodyDetail: []
      },
      Dermatome_lightPartList: [],
      Dermatome_pinPartList: [],
      myotomePartList: [],
      footExamination: []
    };
    const filterpainDetails = [];
    if (painDetails.length > 0) {
      _.map(painDetails, (value, key) => {
        if (value.svg_type === 'humanBody') {
          if (value.svg_name === 'headzoomFlag' ||
            value.svg_name === 'FrontzoomFlag' || value.svg_name === 'BackzoomFlag' || value.svg_name === 'leftzoomFlag'
            || value.svg_name === 'rightzoomFlag') {
            this.partDetails.humanbodyPartList.humanbodyDetail.push(value);
          } else if (value.svg_name === 'headFlag' || value.svg_name === 'svgBackFlag' || value.svg_name === 'leftFlag'
            || value.svg_name === 'svgFrontFlag' || value.svg_name === 'rightFlag') {
            this.partDetails.humanbodyPartList.humanbody.push(value);
          }
        }
      });
    }
    this.maxValue.maxhumanbody = this.MaxPainscore(this.partDetails.humanbodyPartList) || 0;
  }

  // -- called when human body popup closed
  humanbodyclose() {
    // this.maxServerity = [];
    let getpainscoredata = this.painDataService.getPain();
    if (getpainscoredata.length) {
      getpainscoredata = _.filter(getpainscoredata, (o) => {
        return o.chart_detail_id === this.chartDetailId;
      });
    }
    this.painDetails = getpainscoredata.map(x => this.ngCopy(x));
    this.humanIcon = 'human-body';
    this.footIcon = 'foot-examination';
    if (this.painDetails.length) {
      this.dummyData = this.painDetails;
      this.findExaminePart(this.painDetails);
      this.bodyPartDetails(this.painDetails);
      this.maxServerity.humanSerivty = this.getSeverityOfAppliedScoreClass(this.severityValue.humanBody, this.maxValue.maxhumanbody) || 0;
      const maxTempPainValue = _.max(this.publicService.getObjectValues(this.maxServerity));
      const maxPainValue = maxTempPainValue;
      if (!_.isUndefined(this.partDetails.humanbodyPartList)) {
        this.painScaleInput = ((this.previousPainScore > maxPainValue) ? this.previousPainScore : maxPainValue); // check previous max and cureent changes value
      } else {
        this.painScaleInput = null;
      }
      // this.painscaleChangeIcon(this.painScaleInput);
    } else {
      this.painScaleInput = null;
      // this.painscaleChangeIcon(this.painScaleInput);
      this.bodyDetailsVisibility.footExamineVisible = false;
      this.bodyDetailsVisibility.bodyExamineVisible = false;
    }
    this.prepareAndSaveLocalTransData();
  }

  getSeverityOfAppliedScoreClass(severityObj, scoreClass) {
    const maxServerityScore = _.find(severityObj.severity, (severity) => severity.score === scoreClass);
    if (!_.isUndefined(maxServerityScore)) {
      return maxServerityScore.severity;
    }
  }

  // -- to check svg's selected
  isSvgExist(svgName, svgType) {
    let isExist;
    if (svgType === 'humanBody') {
      isExist = _.find(this.painDataService.getPain(), (o) => o.svg_name === svgName);
    } else {
      isExist = _.find(this.painDataService.getPain(), (o) => o.svg_type === svgType);
    }

    if (!_.isUndefined(isExist)) {
      return true;
    } else {
      return false;
    }
  }

  // to open body paind details of all svg maps
  bodypartDetailsPopUp() {
    const modelInstance = this.modalService.open(this.humanBodyPainDetailsInst['humanBodyPainDetails'], {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'custom-modal',
      size: 'xl',
      container: '#homeComponent',
    });
    modelInstance.result.then(result => { }, reason => { });
  }

  ngCopy(obj): any {
    return _.cloneDeep(obj);
  }

  menuClicked(event: NgbPanelChangeEvent) {
    this.isPanelOpen = event.nextState;
    this.publicService.componentSectionClicked({
      sectionKeyName: 'human_body'
    });
  }

  getHumanBodyInitData() {
    this.dynamicChartService.getChartDataByKey('pain_body_details', true, null, this.chartDetailId).subscribe(result => {
      if (!result || result === null || !result.length) {
        this.painDetails = [];
        this.painDataService.setPain(this.painDetails);
        this.bodyDetailsVisibility.bodyExamineVisible = false;
        return;
      }
      if (result && result.length) {
        this.painDetails = result;
        _.map(result, (x) => {
          this.painDataService.setPain(result);
        });
        this.findExaminePart(this.painDetails);
        if (this.painDetails.length > 0) {
          this.dummyData = this.painDetails;
          this.bodyPartDetails(this.painDetails);
          setTimeout(() => {
            this.getpainscoredataflag = true;
          }, 100);
        } else {
          this.bodyDetailsVisibility.bodyExamineVisible = false;
        }
      }
    });
  }
  prepareAndSaveLocalTransData() {
    this.dynamicChartService.updateLocalChartData('pain_body_details', this.painDetails, 'update', this.chartDetailId);
  }
  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }
}

import { Component, OnInit, Input, ViewChild, TemplateRef, ElementRef, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PublicService } from './../../../public/services/public.service';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { SvgMapComponent } from './../svg-map/svg-map.component';
import { SvgMapDetailComponent } from './../svg-map-detail/svg-map-detail.component';
import { AuthService } from './../../../public/services/auth.service';
import { environment } from './../../../../environments/environment';
import { PainDataService } from './../../../public/services/pain-data.service';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-human-body',
  templateUrl: './human-body.component.html',
  styleUrls: ['./human-body.component.scss'],
})
export class HumanBodyComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Input() bodyDetailsVisibility: any;
  @Input() chartDetailId: number;
  @ViewChild('svgMapCompRef', { read: TemplateRef, static: false }) svgMapRef: TemplateRef<any>; // -- from child svg map component
  @ViewChild('svgMapDetailsComRef', { read: TemplateRef, static: false }) svgMapDetailsComRef: TemplateRef<any>;
  @ViewChild('mySlides', { read: TemplateRef, static: false }) mySlidesRef: TemplateRef<any>; // refer to child
  @ViewChild(SvgMapComponent, { read: SvgMapComponent, static: false }) svgMapComponent: SvgMapComponent;
  @ViewChild(SvgMapDetailComponent, { read: SvgMapDetailComponent, static: false }) svgMapDetailComponent: SvgMapDetailComponent;
  @ViewChild('ngbTabSetRef', { read: ElementRef, static: false }) ngbTabSetRef: ElementRef;

  imagePath: string;
  humanBodyflag: boolean;
  Dermatomeflag: boolean;
  myotomeflag: boolean;
  footExamineflag: boolean;
  eraser: boolean;
  selected: any;

  activeSlideBody = { active: 1 };
  scaleColor = ['green', '#018000', '#61b000', '#c0e000', '#fff500', '#ffdb00',
    '#ffc200', '#ffa900', '#ff7900', '#ff4200', '#ff0800'];
  // mytomeColor = ['#ff0800', '#ff7900', '#ffc200', '#ffdb00', '#fff500', '#018000', '#ba1515'];
  // dermatomeColor = ['#ff7900', '#ffc200', '#018000', '#ba1515'];
  // dermatomeImageEffectId = [
  //   {
  //     imageId: 'dermatome_lateral_view',
  //     identifier: 'last',
  //     delimeter: '_',
  //     svgName: 'dermatomeFlag_light_lateral',
  //     svgType: 'dermatome_light_lateral',
  //     severity: [{ score: 0, severity: 3 }, { score: 1, severity: 2 }, { score: 2, severity: 1 }, { score: 3, severity: 0 }]
  //   },
  //   {
  //     imageId: 'myotome_lateral_view',
  //     identifier: 'last',
  //     delimeter: '_',
  //     svgName: 'myotomeFlag_lateral',
  //     svgType: 'myotome_lateral',
  //     severity: [{ score: 0, severity: 6 }, { score: 1, severity: 5 }, { score: 2, severity: 4 }, { score: 3, severity: 3 },
  //     { score: 4, severity: 2 }, { score: 5, severity: 1 }, { score: 6, severity: 0 }]
  //   }
  // ];

  // myTomeImageEffectId = { imageId: 'dermatome_lateral_view' };
  show_slider = false;
  setClass: any = 1;
  summary_PartDetailsFlag = false;
  chartFlag = false;
  isOpen = true;
  partDetails = {
    humanbodyPartList: {
      humanbody: [],
      humanbodyDetail: []
    },
    // Dermatome_lightPartList: [],
    // Dermatome_pinPartList: [],
    // myotomePartList: [],
    footExamination: []
  };

  zoom: { firstZoom: boolean, counter: number } = {
    firstZoom: true,
    counter: 0
  };
  painSummaryData: any;

  lightTouchLeft = 0;
  lightTouchRight = 0;
  pinprickRight = 0;
  pinprickLeft = 0;
  totalLightTouch = 0;
  totalPinPrick = 0;
  totalUEMS = 0;
  UER = 0;
  UEL = 0;
  totalLEMS = 0;
  LER = 0;
  LEL = 0;
  // dermatome_lightTouch = true;
  // dermatome_pinprick = false;
  slideIndex = 1;

  dummyData: any;
  hoverRegion: any = '';

  defaultView: any;
  source: string;
  painChartData: any;
  painAssociatedData: any;
  lightTouchLeftCount: any;
  pinprickLeftCount: any;
  lightTouchRightCount: any;
  pinprickRightCount: any;

  chartRightCount: any;
  chartLeftCount: any;
  userId: number;
  activeBodytype: string;
  chartRightTotal: any;
  chartLeftTotal: any;

  constructor(
    private activeModel: NgbActiveModal,
    private publicService: PublicService,
    private painDataService: PainDataService,
    private authService: AuthService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.activeBodytype = 'HumanBody';
    this.userId = this.authService.getUserParentId();
    this.imagePath = environment.IMG_PATH;
    this.loadHumanBody('bodyExamine');
    this.dummyData = this.painDataService.getPain();
    if (this.dummyData.length) {
      this.dummyData = _.filter(this.dummyData, (o) => {
        return o.chart_detail_id === this.chartDetailId;
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showSlides(1);
    });
  }

  // -- unsubscribe to ensure no memory leaks
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // -- load human body (svg)
  loadHumanBody(flag): void {  // onload get data and rearrange data.
    const show_humanbody = true; // --checkupUserpermission('show_humanbody');
    // const show_dermatome = true; // -- checkupUserpermission('show_dermatome');
    // const show_myotome = true; // --checkupUserpermission('show_myotome');
    const show_foot_examination = true; // --checkupUserpermission('show_foot_examination');
    if (flag === 'bodyExamine') {
      if (show_humanbody) {
        this.source = 'human';
        this.humanBodyflag = true;
        this.setClass = 1;
        this.eraser = false;
        this.selected = 1;
        // this.showSlides(1);
      // } else if (show_dermatome) {
      //   this.source = 'dermatome';
      //   this.Dermatomeflag = true;
      //   this.setClass = 0;
      //   this.selected = 0;
      // } else if (show_myotome) {
      //   this.source = 'myotome';
      //   this.myotomeflag = true;
      //   this.setClass = 0;
      //   this.selected = 0;
      }
    } else if (show_foot_examination && flag === 'footExamine') {
      this.source = 'footExamine';
      this.footExamineflag = true;
      this.setClass = 0; // 'Absent';
      this.selected = 0; // 'Absent';
    }
    this.getDefaultHumanBodyview();
    this.onClickLoadData();
  }

  // -- get default human body from service
  getDefaultHumanBodyview(): void {
    // this.publicService.getDoctorSettings(this.userId, 'humanbody-view').subscribe((result) => {
    //   this.defaultView = result;
    //   if (result) {
    //     this.zoom.firstZoom = this.defaultView === 'normal-view' ? false : true;
    //     this.zoom.counter = this.defaultView === 'normal-view' ? 0 : 1;
    //   } else {
    //     this.zoom.firstZoom = this.defaultView === 'normal-view' ? false : true;
    //     this.zoom.counter = this.defaultView === 'normal-view' ? 0 : 1;
    //   }
    // });

    this.zoom.firstZoom = this.defaultView === 'normal-view' ? false : true;
    this.zoom.counter = this.defaultView === 'normal-view' ? 0 : 1;
  }

  // -- called function when svg path getting selected
  onClickLoadData(): void {
    this.lightTouchLeft = 0;
    this.lightTouchRight = 0;
    this.pinprickRight = 0;
    this.pinprickLeft = 0;
    this.totalLightTouch = 0;
    this.totalPinPrick = 0;
    this.totalUEMS = 0;
    this.UER = 0;
    this.UEL = 0;
    this.totalLEMS = 0;
    this.LER = 0;
    this.LEL = 0;

    this.partDetails = {
      humanbodyPartList: {
        humanbody: [],
        humanbodyDetail: []
      },
      // Dermatome_lightPartList: [],
      // Dermatome_pinPartList: [],
      // myotomePartList: [],
      footExamination: []
    };

    let painDetails = [];
    const getpainscoredata = this.painDataService.getPain();
    const self = this;
    painDetails = _.map(getpainscoredata, x => Object.assign(x));
    if (painDetails.length > 0) {
      _.map(painDetails, (value, key) => {
        if (value.svg_type === 'humanBody') {
          if ((value.svg_name === 'headzoomFlag' ||
            value.svg_name === 'FrontzoomFlag' || value.svg_name === 'BackzoomFlag' || value.svg_name === 'leftzoomFlag'
            || value.svg_name === 'rightzoomFlag') && value.chart_detail_id === this.chartDetailId && !self.checkIfAlreadyExists(self.partDetails.humanbodyPartList.humanbodyDetail, value)) {
            self.partDetails.humanbodyPartList.humanbodyDetail.push(value);
          } else if ((value.svg_name === 'headFlag' || value.svg_name === 'svgBackFlag' || value.svg_name === 'leftFlag'
            || value.svg_name === 'svgFrontFlag' || value.svg_name === 'rightFlag')
            && value.chart_detail_id === this.chartDetailId
            && !self.checkIfAlreadyExists(self.partDetails.humanbodyPartList.humanbody, value)) {
            self.partDetails.humanbodyPartList.humanbody.push(value);
          }
        // } else if (value.svg_type === 'dermatome_light') {
        //   if (!self.checkIfAlreadyExists(self.partDetails.Dermatome_lightPartList, value)) {
        //     self.partDetails.Dermatome_lightPartList.push(value);
        //   }

        // } else if (value.svg_type === 'dermatome_pin') {
        //   if (!self.checkIfAlreadyExists(self.partDetails.Dermatome_pinPartList, value)) {
        //     self.partDetails.Dermatome_pinPartList.push(value);
        //   }
        // } else if (value.svg_type === 'myotome') {
        //   if (!self.checkIfAlreadyExists(self.partDetails.myotomePartList, value)) {
        //     self.partDetails.myotomePartList.push(value);
        //   }
        } else if (value.svg_type === 'footExamine') {
          if (!self.checkIfAlreadyExists(self.partDetails.footExamination, value)) {
            self.partDetails.footExamination.push(value);
          }
        }
      });
    }
    // if (painDetails.length > 0) {
    //   this.calculateSubScore(this.partDetails.Dermatome_lightPartList, 'dermatome_light');
    //   this.calculateSubScore(this.partDetails.Dermatome_pinPartList, 'dermatome_pin');
    //   this.calculateSubScore(this.partDetails.myotomePartList, 'myotome');
    // }

    // this.findExaminePart();
    if (this.summary_PartDetailsFlag === true) {
      // onload show summary and while fill value on part call summary
      this.painDataService.getFilteredParts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => this.painSummaryData = res);
    }
  }

  calculateSubScore = (partsList, svgType) => {
    const partsListCopy = partsList.map(x => Object.assign({}, x));
    const self = this;
    _.map(partsListCopy, (value, key) => {
      if (value.pain_score === 'NT') {
        value.pain_score = 0;
      }
      // if (value.body_part.startsWith('Left')) {  // left
      //   if (svgType === 'dermatome_light') {
      //     self.lightTouchLeft += +value.pain_score;
      //   } else if (svgType === 'dermatome_pin') {
      //     self.pinprickLeft += +value.pain_score;
      //   } else if (svgType === 'myotome') {
      //     if (value.body_part.startsWith('Left_Upper')) {
      //       self.UEL += +value.pain_score;
      //     } else {
      //       self.LEL += +value.pain_score;
      //     }
      //   }
      // } else if (value.body_part.startsWith('Right')) {  // right
      //   if (svgType === 'dermatome_light') {
      //     self.lightTouchRight += +value.pain_score;
      //   } else if (svgType === 'dermatome_pin') {
      //     self.pinprickRight += +value.pain_score;
      //   } else if (svgType === 'myotome') {
      //     if (value.body_part.startsWith('Right_Upper')) {
      //       self.UER += +value.pain_score;
      //     } else {
      //       self.LER += +value.pain_score;
      //     }
      //   }
      // }
    });

    // if (svgType === 'dermatome_light') {
    //   this.totalLightTouch = +(this.lightTouchLeft + this.lightTouchRight);
    // } else if (svgType === 'dermatome_pin') {
    //   this.totalPinPrick = +(this.pinprickLeft + this.pinprickRight);
    // } else if (svgType === 'myotome') {
    //   this.totalUEMS = +(this.UER + this.UEL);
    //   this.totalLEMS = +(this.LER + this.LEL);
    //   this.chartRightTotal = +(this.UER + this.LER);
    //   this.chartLeftTotal = +(this.UEL + this.LEL);
    // }
  };

  checkIfAlreadyExists(parentArray, value): boolean {
    return parentArray.indexOf(value) > -1 ? true : false;
  }

  showSlides(n): void {
    this.activeSlideBody['active'] = n;
    const slides = document.getElementsByClassName('mySlides');
    const dots = document.getElementsByClassName('demo');
    // var captionText = document.getElementById("caption");
    if (n > slides.length) {
      this.slideIndex = 1;
      this.activeSlideBody['active'] = this.slideIndex;
    }
    if (n < 1) {
      this.slideIndex = slides.length;
      this.activeSlideBody['active'] = this.slideIndex;
    }
    for (let i = 0; i < slides.length; i++) {
      slides[i]['style'].display = 'none';
    }
    for (let i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace('active', '');
    }
    slides[this.slideIndex - 1]['style'].display = 'block';
    if (dots.length > 0) {
      dots[this.slideIndex - 1].className += ' active';
    }

    const sub = interval().subscribe(() => {
      if (this.svgMapRef || this.svgMapDetailsComRef) {
        this.mouseCursor(n);
        sub.unsubscribe();
      }
    });
  }

  mouseCursor(n) {
    let hostElm;
    if (this.zoom.firstZoom) { // for svg zoom view
      hostElm = this.svgMapDetailsComRef['cloneMouseHoverRef'].nativeElement;
    } else {
      hostElm = this.svgMapRef['cloneMouseHoverRef'].nativeElement; // for svg normal view
    }
    if (n === 0) { return; }
    // const copyScaleNode = document.getElementById('scale' + n).cloneNode(true);
    // const child = hostElm.appendChild(copyScaleNode);
    // child.classList.add('cloneClass');
    // child.querySelectorAll('.scaleDigit').forEach(res =>  res.hidden = true);
    // child.querySelectorAll('.scaleFootName').forEach(res => res.hidden = true);
  }

  // -- click on the color bars or scores
  scaleSet(n) {
    // console.log(this.mySlidesRef)
    // this.mySlidesRef['nativeElement'].querySelectorAll('.cloneClass').forEach(e => {
    //   e.remove();
    // });
    // console.log(n)
    this.setClass = n;
    this.selected = n;
    this.eraser = n === 'erase' ? true : false;
    // this.mouseCursor(n);
  }

  removebodyparts(data) {
    const partdetails = data.painPart;
    const flag = data.flag;
    const sideFlag = data.sideFlag;
    let svgType = '';
    let popUpTitile = '';
    if (flag === 'singleFlag') {
      if (partdetails.svg_type === 'humanBody') {
        svgType = 'Human body parts';
      // } else if (partdetails.svg_type === 'dermatome_light') {
      //   svgType = 'Dermatome(Light Touch)';
      // } else if (partdetails.svg_type === 'dermatome_pin') {
      //   svgType = 'Dermatome(Pin Prick)';
      // } else if (partdetails.svg_type === 'myotome') {
      //   svgType = 'Myotome';
      } else if (partdetails.svg_type === 'footExamine') {
        svgType = 'Foot Examination';
      }
      // var svgType=partdetails.svg_type.split('_').join(' ');
      const bodypartName = partdetails.body_part.split('_').join(' ');
      popUpTitile = bodypartName + ' ' + '(' + svgType + ')';
    } else if (flag === 'multipleFlag') {
      if (!_.isUndefined(partdetails.humanbodyDetail) && !_.isUndefined(partdetails.humanbody)) {
        if (partdetails.humanbody.length > 0) {
          if (partdetails.humanbody[0].svg_type === 'humanBody') {
            popUpTitile = 'Human body parts';
          }
        } else if (partdetails.humanbodyDetail.length > 0) {
          if (partdetails.humanbodyDetail[0].svg_type === 'humanBody') {
            popUpTitile = 'Human body parts';
          }
        }
      // } else if (partdetails[0].svg_type === 'dermatome_light') {
      //   popUpTitile = 'Dermatome(Light Touch)';
      // } else if (partdetails[0].svg_type === 'dermatome_pin') {
      //   popUpTitile = 'Dermatome(Pin Prick)';
      // } else if (partdetails[0].svg_type === 'myotome') {
      //   popUpTitile = 'Myotome';
      } else if (partdetails[0].svg_type === 'footExamine') {
        popUpTitile = 'Foot Examination';
      }
    }
    // const cnfrm = confirm('Are you sure you want to remove this?');
    const title =  popUpTitile;
    const body = 'Are you sure you want to remove this?';
    const messageDetails = {
      modalTitle: title,
      modalBody: body
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
          let removeArray = [];
          const savePainScore = this.painDataService.getPain();
          const self = this;
          if (flag === 'singleFlag') {
            if (partdetails.svg_name === 'headzoomFlag' ||
              partdetails.svg_name === 'FrontzoomFlag' || partdetails.svg_name === 'BackzoomFlag' || partdetails.svg_name == 'leftzoomFlag'
              || partdetails.svg_name === 'rightzoomFlag') {
              const similarBodyName = _.filter(savePainScore, (o) => {
                return o.body_part.indexOf(partdetails.body_part) === 0 && o.svg_name === partdetails.svg_name && o.pain_score == partdetails.pain_score;
              });
              _.map(similarBodyName, (value, key) => {
                let bodypart = Object.assign(value.body_part);
                bodypart = bodypart.replace(/[0-9]/g, '').trim();
                if (bodypart === partdetails.body_part) {
                  removeArray.push(value);
                  savePainScore.splice(_.findIndex(savePainScore, {
                    'body_part': value.body_part,
                    'svg_name': value.svg_name,
                    'svg_type': value.svg_type
                  }), 1);
                }
              });
              if (this.svgMapDetailComponent) { this.svgMapDetailComponent.removeSvgPath(removeArray); }
            } else if (partdetails.svg_type === 'footExamine') {
              removeArray = [];
              removeArray.push(partdetails);
              // $rootScope.$broadcast('callfootDirective', removeArray);
              savePainScore.splice(_.findIndex(savePainScore, {
                'body_part': partdetails.body_part, 'svg_name': partdetails.svg_name, 'svg_type': partdetails.svg_type
              }), 1);
            } else {
              const indx = _.findIndex(savePainScore, {
                'body_part': partdetails.body_part,
                'svg_name': partdetails.svg_name,
                'svg_type': partdetails.svg_type
              });
              if (self.svgMapComponent) { self.svgMapComponent.removeSvgPath([savePainScore[indx]]); }// remove svg
              savePainScore.splice(indx, 1);
            }
            this.painDataService.setPain(savePainScore);
          } else if (flag === 'multipleFlag') { // myotome & dermatome clear All
            if (!_.isUndefined(sideFlag)) {
              _.map(partdetails, (value, key) => {
                if (value.body_part.startsWith(sideFlag)) {
                  const samepartList = _.filter(savePainScore, { body_part: value.body_part });
                  if (samepartList[0].svg_type === 'footExamine') {
                    // $rootScope.$broadcast('callfootDirective', samepartList);
                  }
                  for (let i = 0; i < (samepartList.length); i++) {
                    const indx = _.findIndex(savePainScore, {
                      'body_part': samepartList[i].body_part,
                      'svg_name': samepartList[i].svg_name,
                      'svg_type': samepartList[i].svg_type
                    });
                    if (self.svgMapComponent) { self.svgMapComponent.removeSvgPath([savePainScore[indx]]); }// remove svg
                    savePainScore.splice(indx, 1);
                  }
                }
              });
            } else {  // human body Clear All
              const removeArrays = [];
              const copylists = savePainScore.map(x => Object.assign({}, x));
              if (!_.isUndefined(partdetails.humanbodyDetail) && partdetails.humanbodyDetail.length) {
                _.map(partdetails.humanbodyDetail, (value, key) => {
                  _.map(copylists, (value1, key1) => {
                    // let bodypart = value1.body_part;
                    // bodypart = bodypart.replace(/[0-9]/g, '').trim();
                    if ((value1.body_part === value.body_part) && (value1.svg_name === 'headzoomFlag' || value1.svg_name === 'FrontzoomFlag'
                      || value1.svg_name === 'BackzoomFlag' || value1.svg_name === 'rightzoomFlag'
                      || value1.svg_name === 'leftzoomFlag')) {
                      const findIndex = _.findIndex(savePainScore, {
                        'body_part': value1.body_part,
                        'svg_name': value1.svg_name,
                        'svg_type': value1.svg_type
                      });
                      if (findIndex !== -1) {
                        removeArrays.push(value1);
                        savePainScore.splice(findIndex, 1);
                      }
                    }
                  });
                  if (self.svgMapDetailComponent) { self.svgMapDetailComponent.removeSvgPath(removeArrays); }
                });
              }
              if (!_.isUndefined(partdetails.humanbody) && partdetails.humanbody.length > 0) {
                _.map(partdetails.humanbody, (partValue, key) => {
                  const indx = _.findIndex(savePainScore, {
                    'body_part': partValue.body_part,
                    'svg_name': partValue.svg_name,
                    'svg_type': partValue.svg_type
                  });
                  if (self.svgMapComponent) { self.svgMapComponent.removeSvgPath([savePainScore[indx]]); }// remove svg
                  savePainScore.splice(indx, 1);
                });
              }
            }
            this.painDataService.setPain(savePainScore);
          }

          this.dummyData = savePainScore;
          this.onClickLoadData();
      }
    });
      modalInstance.componentInstance.messageDetails = messageDetails;

  }

  isImageExist(list, flag) {
    const isExist = _.find(list, (o) => o.svg_name === flag);
    if (!_.isUndefined(isExist)) {
      return true;
    } else {
      return false;
    }
  }

  plusSlides(n) {
    this.showSlides(this.slideIndex += n);
    this.partDetails = {
      humanbodyPartList: {
        humanbody: [],
        humanbodyDetail: []
      },
      // Dermatome_lightPartList: [],
      // Dermatome_pinPartList: [],
      // myotomePartList: [],
      footExamination: []
    };
    this.onClickLoadData();
  }

  currentSlide(n) {
    this.showSlides(this.slideIndex = n);
    this.activeSlideBody['active'] = this.slideIndex;
    this.partDetails = {
      humanbodyPartList: {
        humanbody: [],
        humanbodyDetail: []
      },
      // Dermatome_lightPartList: [],
      // Dermatome_pinPartList: [],
      // myotomePartList: [],
      footExamination: []
    };
    this.onClickLoadData();
  }

  zoomIn(): void {
    this.eraser = false;
    if (this.zoom.counter === 0) {
      this.zoom = {
        firstZoom: true,
        counter: 1
      };
    }
  }

  zoomOut() {
    this.eraser = false;
    if (this.selected === 'erase') {
      this.selected = 1;
      this.mySlidesRef['nativeElement'].querySelectorAll('.cloneClass').forEach(e => {
        e.remove();
      });
    }
    if (this.zoom.counter === 1) {
      this.zoom = {
        firstZoom: false,
        counter: 0
      };
    }
  }

  // -- close the active model
  close() {
    this.activeModel.close();
  }

  load_Summary_body_Details(): void {
    this.summary_PartDetailsFlag = !this.summary_PartDetailsFlag;
    if (this.summary_PartDetailsFlag) {
      this.painDataService.getFilteredParts().subscribe(res => {
        this.painSummaryData = res;
      });
    }
    }

  LoadPainBody(data): void {
    if (data === 'HumanBody') {
      this.humanBodyflag = true;
      this.Dermatomeflag = false;
      this.myotomeflag = false;
      this.footExamineflag = false;
      this.setClass = 1;
      this.eraser = false;
      this.selected = 1;
      this.slideIndex = 1;
    // } else if (data === 'Dermatome') {
    //   this.Dermatomeflag = true;
    //   this.humanBodyflag = false;
    //   this.myotomeflag = false;
    //   this.footExamineflag = false;
    //   this.setClass = 0;
    //   this.selected = 0;
    // } else if (data === 'myotome') {
    //   this.myotomeflag = true;
    //   this.Dermatomeflag = false;
    //   this.humanBodyflag = false;
    //   this.footExamineflag = false;
    //   this.setClass = 0;
    //   this.selected = 0;
    } else if (data === 'footExamine') {
      this.Dermatomeflag = false;
      this.humanBodyflag = false;
      this.myotomeflag = false;
      this.footExamineflag = true;
      this.setClass = 'Absent';
      this.selected = 'Absent';
    }
    this.onClickLoadData();
  }

  DematoemExaminationChange(examType): void { // load pinprick and ligth touch
    // if (examType === 'Light_Touch') {
    //   this.dermatome_lightTouch = true;
    //   this.dermatome_pinprick = false;
    // } else if (examType === 'Pin_Prick') {
    //   this.dermatome_pinprick = true;
    //   this.dermatome_lightTouch = false;
    // }
    this.partDetails = {
      humanbodyPartList: {
        humanbody: [],
        humanbodyDetail: []
      },
      // Dermatome_lightPartList: [],
      // Dermatome_pinPartList: [],
      // myotomePartList: [],
      footExamination: []
    };
    this.onClickLoadData();
  }

  // -- open chart page
  openChart() {
    this.chartFlag = !this.chartFlag;
    this.humanBodyflag = this.chartFlag ? false : true;
    if (this.chartFlag) {
      this.painDataService.getPainChartData().subscribe(x => this.painChartData = x);
      this.painDataService.getPainAssociatedData().subscribe(x => this.painAssociatedData = x);

      this.lightTouchLeftCount = this.painDataService.getArraySum(this.publicService.getObjectValues(this.painChartData.dermatome.lightTouch.left));
      this.pinprickLeftCount = this.painDataService.getArraySum(this.publicService.getObjectValues(this.painChartData.dermatome.pinPrick.left));
      this.lightTouchRightCount = this.painDataService.getArraySum(this.publicService.getObjectValues(this.painChartData.dermatome.lightTouch.right));
      this.pinprickRightCount = this.painDataService.getArraySum(this.publicService.getObjectValues(this.painChartData.dermatome.pinPrick.right));

      this.UER = this.painDataService.getArraySum(this.publicService.getObjectValues(this.painChartData.mytome.upper.right));
      this.UEL = this.painDataService.getArraySum(this.publicService.getObjectValues(this.painChartData.mytome.upper.left));
      this.LER = this.painDataService.getArraySum(this.publicService.getObjectValues(this.painChartData.mytome.lower.right));
      this.LEL = this.painDataService.getArraySum(this.publicService.getObjectValues(this.painChartData.mytome.lower.left));

      this.chartRightCount = this.UER + this.LER;
      this.chartLeftCount = this.UEL + this.LEL;
    }
  }

  // to print the human body's
  printhtml(divName) {
    const css = '';
    const printContents = document.getElementById(divName).innerHTML;
    const frame1 = document.createElement('iframe');
    frame1.name = 'frame1';
    frame1.style.position = 'absolute';
    frame1.style.top = '-1000000px';
    document.body.appendChild(frame1);
    const frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument['document'] ? frame1.contentDocument['document'] : frame1.contentDocument;
    frameDoc.document.open();
    frameDoc.document.write('<html><head><style>' + css + '</style></head><body>' + printContents + '</body></html>');
    frameDoc.document.close();
    setTimeout(() => {
      window.frames['frame1'].focus();
      window.frames['frame1'].print();
      document.body.removeChild(frame1);
    }, 500);
  }

  setDefaultHumanBodyview(view) {
    const docId = this.authService.getUserParentId();
    this.publicService.saveDoctorSettings(docId, 'humanbody-view', view).subscribe(res => {
      this.getDefaultHumanBodyview();
    });
  }

  onBodyTypeSelect(bodyType: string) {
    this.activeBodytype = bodyType;
    this.LoadPainBody(bodyType);
  }

}

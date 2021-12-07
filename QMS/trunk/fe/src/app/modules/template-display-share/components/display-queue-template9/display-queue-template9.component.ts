import { Constants } from './../../../../config/constants';
import { fadeInOut } from './../../../../config/animations';
import { CustomEventsService } from './../../../../services/custom-events.service';
import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { interval } from 'rxjs';
import { findIndex, map } from 'rxjs/operators';

@Component({
  selector: 'app-display-queue-template9',
  templateUrl: './display-queue-template9.component.html',
  styleUrls: ['./display-queue-template9.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class DisplayQueueTemplate9Component implements OnInit, OnDestroy, OnChanges {

  @Input() displayData;
  @Input() doctorFieldShow;
  @Input() queueFieldShow;
  @Input() nextFieldShow;
  @Input() callingFieldShow;
  @Input() braningSectionVisble;
  @Input() source;

  defaultDisplayCount = 0;
  activeColor = '';

  showCallPatName: boolean;
  callPatTimer;
  callPerPageRow;
  isPreview = false;
  calculatedHeight = 4;
  calculatedHeightString = '4vh';
  templateData: any;

  constructor(
    private eventsService: CustomEventsService
  ) { }

  ngOnInit() {
    this.activeColor = this.eventsService.mastDisplayActiveColor;
    this.eventsService.$recDisplayActiveColor.subscribe(res => {
      this.activeColor = res;
    });
    // this.multipleCallingAndPaginationCall();
    // console.log(this.displayData);
    // this.showCallPatTimerOff();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (this.callPatTimer) {
    //   clearInterval(this.callPatTimer);
    // }
    // if (this.callPerPageRow) {
    //   clearInterval(this.callPerPageRow);
    // }
    // clearInterval(this.callPatTimer);
    // clearInterval(this.callPerPageRow);
    let isChanged = false;
    if (changes.displayData.previousValue && changes.displayData.currentValue.length === changes.displayData.previousValue.length) {
      _.map(changes.displayData.currentValue, (co, index) => {
       const pDocData = changes.displayData.previousValue[index].docData;
       if (!_.isEqual(co.docData, pDocData)) {
          isChanged = true;
          return;
        }
       if (co.next_queue_list.length === changes.displayData.previousValue[index].next_queue_list.length) {
          _.map(co.next_queue_list, (nq, nqIndex) => {
            const pnextqueue = changes.displayData.previousValue[index].next_queue_list[nqIndex];
            if (!_.isEqual(nq, pnextqueue)) {
              isChanged = true;
              return;
            }
          });
        } else {
          isChanged = true;
          return;
        }
       if (co.calling_queue_list.length === changes.displayData.previousValue[index].calling_queue_list.length) {
          _.map(co.calling_queue_list, (cq, cqIndex) => {
            const pcallingqueue = changes.displayData.previousValue[index].calling_queue_list[cqIndex];
            if (!_.isEqual(cq, pcallingqueue)) {
              isChanged = true;
              return;
            }
          });
        } else {
          isChanged = true;
          return;
        }
      });
    } else {
      isChanged = true;
    }

    if (isChanged) {
      this.templateData = [...this.displayData];
      this.multipleCallingAndPaginationCall();

      // console.log('aaaaaa:' + JSON.stringify(this.displayData));
      if (!this.callPatTimer) {
        this.showCallPatTimerOff();
      }
    }

  }

  ngOnDestroy() {
    clearInterval(this.callPatTimer);
    clearInterval(this.callPerPageRow);
  }

  showCallPat() {
    this.showCallPatName = true;
    clearInterval(this.callPatTimer);
    this.showCallPatTimerOn();

  }

  showCallPatTimerOff() {
    this.callPatTimer = setInterval(() => {
      this.showCallPat();
      // console.log('showCallPatTimerOff call from hideCallPat ' + new Date());
    }, 20000);
  }

  showCallPatTimerOn() {
    this.callPatTimer = setInterval(() => {
      this.hideCallPat();
      console.log('showCallPatTimerOn call from showCallPat ' + new Date());
    }, 10000);
  }

  hideCallPat() {
    this.showCallPatName = false;
    clearInterval(this.callPatTimer);
    this.showCallPatTimerOff();
  }

  showDataPerPageTimerOn(): void {
    this.hideCallPat();
    const startShowingFrom = _.findIndex(this.templateData, (o) => o.isShownIndex === true);
    if (startShowingFrom !== -1 && this.templateData.length !== (startShowingFrom + 1)) {
        let cnt = 0;
        this.templateData.forEach((element, index) => {
          element.isShow = false;
          element.isShownIndex = false;
          if ((index > startShowingFrom) && (cnt + 1) <= this.defaultDisplayCount) {
            element.isShow = true;
            element.isShownIndex = (cnt + 1) === this.defaultDisplayCount ? true : false;
            cnt++;
          }
        });
    } else {
      this.templateData.forEach((element , index) => {
        element.isShow = false;
        if ((index + 1) <= this.defaultDisplayCount) {
          element.isShow = true;
          element.isShownIndex = (index + 1) === this.defaultDisplayCount ? true : false;
        }
      });
    }
  }
  multipleCallingAndPaginationCall() {
    this.isPreview = this.source ? this.source.isPreviewQueueTemplate ? this.source.isPreviewQueueTemplate : false : false;
    // multiple calling repeat data
    if (!this.isPreview) {
      this.templateData.forEach((element, index) => {
        if (element.calling_queue_list.length > 1) {
          // const tempObj = {
          //   docData: {},
          //   next_queue_list: [],
          //   calling_queue_list: []
          // };
          // tempObj.docData = element.docData;
          element.calling_queue_list.forEach((calling, cInd) => {
            if (cInd > 0) {
              const tempObj = {
                docData: {},
                next_queue_list: [],
                calling_queue_list: []
              };
              tempObj.docData = element.docData;
              tempObj.calling_queue_list = [];
              tempObj.calling_queue_list.push(calling);
              // this.templateData.splice(index + 1, 0, tempObj);
              this.templateData.push(tempObj);
            }
          });
        }
      });
    }
    this.templateData = _.sortBy(this.templateData, (o) => o.docData.name);
    // end
    if (!this.isPreview) {
      this.defaultDisplayCount = 10;
      this.templateData.forEach((element, index) => {
        element.isShow = false;
        if ((index + 1) <= this.defaultDisplayCount) {
          element.isShow = true;
          element.isShownIndex = (index + 1) === this.defaultDisplayCount ? true : false;
        }
      });
      if (!this.callPerPageRow) {
        this.callPerPageRow = setInterval(() => { this.showDataPerPageTimerOn(); }, 30000);
      }
    }
  }
}

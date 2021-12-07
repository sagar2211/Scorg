// import { Component, OnInit, Input, OnChanges } from '@angular/core';
//
// @Component({
//   selector: 'app-human-body-summery',
//   templateUrl: './human-body-summery.component.html',
//   styleUrls: ['./human-body-summery.component.scss']
// })
// export class HumanBodySummeryComponent implements OnInit, OnChanges {
//   @Input() painSummaryData;
//   @Input() lightTouchRight;
//   @Input() lightTouchLeft;
//   @Input() pinprickRight;
//   @Input() pinprickLeft;
//   @Input() UER;
//   @Input() UEL;
//   @Input() LER;
//   @Input() LEL;
//
//   constructor() { }
//
//   ngOnInit() {
//   }
//
//   ngOnChanges() {
//     this.painSummaryData = this.painSummaryData;
//     this.lightTouchRight = this.lightTouchRight;
//     this.lightTouchLeft = this.lightTouchLeft;
//     this.pinprickRight = this.pinprickRight;
//     this.pinprickLeft = this.pinprickLeft;
//   }
//
//   isObjectEmpty(partList): any {
//     return Object.keys(partList).length === 0;
//   }
//
//   isTrue() {
//     return Object.keys(this.painSummaryData.mytome.lower.right['NT']).length > 0;
//   }
//
// }

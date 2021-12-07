import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'app-print-reports',
  templateUrl: './print-report-home.component.html',
  styleUrls: ['./print-report-home.component.scss']
})
export class PrintReportHomeComponent implements OnInit, OnChanges {
  @ViewChild('printDivHtml', { static: false }) printDivHtml: ElementRef;
  @ViewChild('printChartData', { static: false }) printChartData: ElementRef;
  @ViewChild('printDischargeSummery', { static: false }) printDischargeSummery: ElementRef;
  @Input() printData: any;
  @Input() printType: string;

  printHeader: [] = [];
  printBody: [] = [];
  printHeading;
  printDate = new Date();
  isPrintDataLoad: boolean;

  printChartDataList = [];
  chartPatientData: any;
  fileServePath = environment.FILE_SERVER_IMAGE_URL;

  constructor(

  ) { }

  ngOnInit() {
    this.printBody = [];
    this.printHeader = null;
    this.printHeading = null;
    this.isPrintDataLoad = false;
    this.printChartDataList = [];
    this.chartPatientData = null;
  }

  ngOnChanges(): void {
    if (!this.printType) {
      this.printType = 'appointment';
    }
    this.generatePrint();
  }

  generatePrint() {
    this.printBody = [];
    this.printHeader = null;
    this.printHeading = null;
    this.isPrintDataLoad = false;
    this.printChartDataList = [];
    this.chartPatientData = null;
    if (this.printType === 'appointment') {
      this.printAppointmentList();
    }
  }

  getComponenetData(dataList, chartDetailId) {
    const chartDetailData = _.filter(dataList, (o) =>
      o.chart_detail_id === chartDetailId
    );
    return chartDetailData;
  }

  isImage(item) {
    if (item && item.file_name.split('.')[1].toUpperCase() !== 'PDF') {
      return true;
    } else {
      return false;
    }
  }

  getPrintA4() {
    let printContents = null;
    let css = null;
    if (this.printType === 'appointment') {
      css = 'a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}:focus{outline:0}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:" ";content:none}table{border-collapse:collapse;border-spacing:0}[hidden]{display:none}html{font-size:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}a:focus{outline:thin dotted}a:active,a:hover{outline:0}img{border:0;-ms-interpolation-mode:bicubic}figure{margin:0}form{margin:0}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0;white-space:normal}table{border-collapse:collapse;border-spacing:0}button,html,input,select,textarea{color:#222}::-moz-selection{background:#b3d4fc;text-shadow:none}::selection{background:#b3d4fc;text-shadow:none}img{vertical-align:middle}fieldset{border:0;margin:0;padding:0}textarea{resize:vertical}.chromeframe{margin:.2em 0;background:#ccc;color:#000;padding:.2em 0}body{position:relative;width:21cm;margin:0 auto;color:#001028;background:#fff;font-size:12px;font-family:Roboto,sans-serif}.clearfix:after{content:"";display:table;clear:both}img{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none}h1{border-top:1px solid #ddd;border-bottom:1px solid #ddd;color:#636363;line-height:1.4em;font-weight:400;text-align:center;background:url(repeat.png)}h1.repeat{font-size:2.4em}h1.next-app{color:#2b2b2b;font-size:1.7em;padding:5px 0}h6{color:#5d6975}h5 small,h6 small{font-size:75%}a{color:#5d6975;text-decoration:underline}ul{line-height:1.2}table{width:100%;border-spacing:0;border-collapse:collapse;border:1px solid transparent}table td.left{text-align:left!important}table.table-bordered th{padding:5px 10px;color:#5d6975;white-space:nowrap;font-weight:400}table.table-bordered th .headeing{color:#001028}table.table-bordered td{padding:10px;text-align:right}table.table-bordered{border:1px solid #ddd}table.table-bordered tr:nth-child(2n-2) td{background:#f5f5f5}table.table-bordered td,table.table-bordered th{text-align:center;border:1px solid #ddd}table.table-bordered tbody .header{width:85px}table.table-bordered tbody .header{vertical-align:middle;background-color:#f5f5f5}.label{color:#5d6975;font-size:1.4em;}.label small{font-size:.7em}.font-weight-600{font-weight:600}.bg-light{background-color:#f5f5f5}#name{height:70px}#name .left-side{float:left}#name .left-side .name,#name .right-side .date{font-size:2em}#name .left-side .id,#name .right-side .id{font-size:1.2em}#name .left-side span,#name .right-side span{color:#5d6975;font-size:.9em}#name .right-side{float:right;text-align:right}#name .left-side p{white-space:nowrap;line-height:1.2}#prescription table .desc,#prescription table .service{vertical-align:top;text-align:left!important}#prescription table .desc{width:400px}#prescription table .unit{text-align:center;font-size:1.2em}#prescription table .unit h5{border-bottom:1px solid #d4d4d4}#face .table-bordered tbody tr td,#foot .table-bordered tbody tr td,#human-body .table-bordered tbody tr td,#image-annotation .table-bordered tbody tr td{width:50%}#footer .dr-sign{height:50px;font-size:1.4em;text-align:right}#footer p{color:#5d6975;width:100%;height:10px;border-top:1px solid #d4d4d4;padding:8px 0;text-align:center}@media print{@page{size:21cm 29.7cm;}}';
      printContents = this.printDivHtml.nativeElement.innerHTML;
    }
    const frame1 = document.createElement('iframe');
    frame1.name = "frame1";
    frame1.style.position = "absolute";
    frame1.style.top = "-1000000px";
    document.body.appendChild(frame1);
    const frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument['document'] ? frame1.contentDocument['document'] : frame1.contentDocument;

    frameDoc.document.open();
    frameDoc.document.write('<html><head><link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet"><style type="text/css" media="print">' + css + '</style></head><body>' + printContents + '</body></html>');
    frameDoc.document.close();
    window.frames["frame1"].focus();
    window.frames["frame1"].print();
    document.body.removeChild(frame1);
    this.printChartDataList = [];
  }

  printAppointmentList() {
    this.printBody = [];
    this.printHeader = null;
    this.printHeading = null;
    const data = this.printData;
    if (data && data.bodyData && data.bodyData.length) {
      this.isPrintDataLoad = true;
      this.printHeader = data.headerColumn;
      this.printBody = data.bodyData;
      this.printHeading = data.printHeading;
      this.printDate = data.date ? new Date(data.date) : new Date();
      setTimeout(() => {
        this.getPrintA4();
      }, 1000);
    }
  }


  modifyAge(val: string): string {
    let updateString = '';
    if (val) {
      const split = val.split(' ');
      if (_.toLower(split[1]) === _.toLower('YEAR(S)')) {
        updateString = split[0] + ' Yrs';
      } else {
        updateString = split[0] + split[1].charAt(0);
      }
    }
    return updateString;
  }
}

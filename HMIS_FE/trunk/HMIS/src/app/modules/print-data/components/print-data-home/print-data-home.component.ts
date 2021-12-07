import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import * as printJS from 'print-js'

@Component({
  selector: 'app-print-data',
  templateUrl: './print-data-home.component.html',
  styleUrls: ['./print-data-home.component.scss']
})
export class PrintDataHomeComponent implements OnInit, OnChanges {
  @Input() printData: any;
  @Output() printDiaglogClose = new EventEmitter<any>();
  properties = this;
  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges() {
    if (this.printData) {
      this.getPrintA4();
    }
  }

  getPrintA4() {
    if (this.printData.returnType) {
      printJS({
        printable: this.printData.url,
        type: 'pdf',
        showModal: true,
        properties: this.properties
      });
      this.printJobComplete();
    } else {
      printJS({
        printable: this.printData.url,
        type: 'pdf',
        showModal: true
      });
    }

  }

  printJobComplete = () => {
    this.properties['printDiaglogClose'].emit(true);
  }


}

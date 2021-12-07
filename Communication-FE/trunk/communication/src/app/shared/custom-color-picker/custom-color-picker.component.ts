import { Component, OnInit, ViewChild, ViewContainerRef, Output, EventEmitter, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';

@Component({
  selector: 'app-custom-color-picker',
  templateUrl: './custom-color-picker.component.html',
  styleUrls: ['./custom-color-picker.component.scss']
})
export class CustomColorPickerComponent implements OnInit, OnChanges {

  showColorPallateContainer = false;
  @ViewChild('colorInputTemplate', { static: false }) colorInputTemplate: ViewContainerRef;
  @Output() chooseColor = new EventEmitter<any>();
  @Input() inputSelctedColor: string;
  selctedColor: string;
  colorCodes =   [
    // { colorCode: '#001f3f', colorValue: 'navy' },
    // { colorCode: '#F1C40F', colorValue: 'blue' },
    // { colorCode: '#1ABC9C', colorValue: 'aqua' },
    // { colorCode: '#2980B9', colorValue: 'teal' },
    // { colorCode: '#9B59B6', colorValue: 'olive' },
    { colorCode: '#a6ce39', colorValue: 'green' },
    { colorCode: '#ffec01', colorValue: 'yellow' },
    { colorCode: '#ffb600', colorValue: 'orange' },
    { colorCode: '#bb3a01', colorValue: 'maroon' },
    { colorCode: '#990711', colorValue: 'red' }];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.inputSelctedColor) {
      this.selctedColor = this.inputSelctedColor;
    }
  }

  showColorPallate() {
    this.showColorPallateContainer = !this.showColorPallateContainer;
  }

  onSelect(codes) {
    this.selctedColor = codes.colorCode;
    this.showColorPallateContainer = false;
    this.chooseColor.emit(this.selctedColor);
 }

 @HostListener('document:click', ['$event'])
 clickout(event) {
  this.showColorPallateContainer = false;
 }

}

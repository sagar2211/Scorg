import { Directive, ElementRef, HostListener, Output, EventEmitter, Input } from '@angular/core';

@Directive({
  selector: '[appOutSideClickEvent]'
})
export class OutSideClickEventDirective {

  constructor(private elementRef: ElementRef) { }

  @Output() clickOutside = new EventEmitter<any>();
  @Input() clickInputValue;

  @HostListener('document:click', ['$event.target']) onMouseEnter(event) {
    const clickedInside = this.elementRef.nativeElement.contains(event);
    // const clientX = event.clientX;
    // const clientY = event.clientY;
    // const eleName = event.target.getAttribute('name');
    // const eleBoundingRect = event.target.getBoundingClientRect();
    // const elementWidth = eleBoundingRect.x + eleBoundingRect.width;
    // const elementHeight = eleBoundingRect.y + eleBoundingRect.height;

    let emitClostEvent = false;
    if (clickedInside) {
      emitClostEvent = true;
    }
    this.clickOutside.emit(emitClostEvent);
  }
}

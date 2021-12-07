import { Directive, OnInit, HostListener, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]'
})
export class OnlyNumbersDirective implements OnInit {
  @Output() updatedValue = new EventEmitter<string>();

  constructor(
    private element: ElementRef,
    private renderer2: Renderer2
  ) { }

  ngOnInit(): void {}

  @HostListener('keyup') numberValidation() {
    this.element.nativeElement.value = this.element.nativeElement.value.replace(/[^0-9]/g, '');
    this.updatedValue.next(this.element.nativeElement.value);
  }

}

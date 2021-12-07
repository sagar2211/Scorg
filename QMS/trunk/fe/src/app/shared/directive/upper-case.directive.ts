import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[ngModel][appUpperCase]'
})
export class UpperCaseDirective {
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
  value: any;

  @HostListener('input', ['$event']) onInputChange($event) {
    this.value = $event.target.value.toUpperCase();
    this.ngModelChange.emit(this.value);
  }
}

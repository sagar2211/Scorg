import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-wizard-step',
  templateUrl: './wizard-step.component.html',
  styleUrls: ['./wizard-step.component.scss']
})
export class WizardStepComponent {

  @Input() title: string;
  @Input() description: string ;
  @Input() hidden: boolean = false;
  @Input() isValid: boolean = true;
  @Input() showNext: boolean = true;
  @Input() showPrev: boolean = true;
  @Input() compeleteButtonName: string = '';
  @Input() preButtonName: string = '';
  @Input() nextButtonName: string = '';

  @Output() onNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() onPrev: EventEmitter<any> = new EventEmitter<any>();
  @Output() onComplete: EventEmitter<any> = new EventEmitter<any>();

  private _isActive: boolean = false;
  isDisabled: boolean = true;

  constructor() { }

  @Input('isActive')
  set isActive(isActive: boolean) {
    this._isActive = isActive;
    this.isDisabled = false;
  }

  get isActive(): boolean {
    return this._isActive;
  }

}

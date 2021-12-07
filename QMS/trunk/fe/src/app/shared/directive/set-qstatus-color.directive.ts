import { Directive, OnInit, ElementRef, Renderer2, Input, AfterViewInit, ViewEncapsulation } from '@angular/core';

@Directive({
  selector: '[appSetQStatusColor]'
})
export class SetQStatusColorDirective implements OnInit, AfterViewInit {
  @Input() qstatusId: number;
  @Input() appointmentStatus: string;
  @Input() isSetBackground: boolean;



  constructor(
    private element: ElementRef,
    private renderer: Renderer2) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setColor(this.qstatusId);
    });
  }

  setColor(qstatusId): void {
    if (!this.isSetBackground) {
      this.renderer.setStyle(this.element.nativeElement, 'background-color', 'transparent');
    }
    switch (qstatusId) {
      case 0: // -- appointment status
        switch (this.appointmentStatus) {
          case 'TENTATIVE':
            this.renderer.addClass(this.element.nativeElement, 'status_tentative');
            break;
          case 'CONFIRMED':
            this.renderer.addClass(this.element.nativeElement, 'status_confirmed');
            break;
          case 'RESCHEDULE':
            this.renderer.addClass(this.element.nativeElement, 'status_confirmed');
            break;
          case 'CANCELLED':
            this.renderer.addClass(this.element.nativeElement, 'status_confirmed');
            break;
        }
        break;
      case 1: // next
        this.renderer.addClass(this.element.nativeElement, 'status_queue');
        break;
      case 2: // calling
        this.renderer.addClass(this.element.nativeElement, 'status_calling');
        break;
      case 3: // absent
        this.renderer.addClass(this.element.nativeElement, 'status_absent');
        break;
      case 4: // inconsultation
        this.renderer.addClass(this.element.nativeElement, 'status_inconsultation');
        break;
      case 5: // complete
        this.renderer.addClass(this.element.nativeElement, 'status_complete');
        break;
      case 6:// on hold
        this.renderer.addClass(this.element, 'status_onhold');
        break;
      case 7: // skip
        this.renderer.addClass(this.element, '');
        break;
    }
  }

}

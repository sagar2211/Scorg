import { Directive, ElementRef, HostListener, AfterViewInit, Renderer2, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appResizeDom]'
})
export class ResizeDomDirective implements OnInit, AfterViewInit {
  @Input() textLength: number;
  @Input() fontUnits: string;
  @Input() fontSize: any;

  constructor(private elementRef: ElementRef, public render: Renderer2) { }

  ngOnInit() { }

  ngAfterViewInit() {
    const hasSpaceInTxt = this.elementRef.nativeElement.innerText.match(/\s/g);
    if (!hasSpaceInTxt && this.elementRef.nativeElement.innerText.length > this.textLength) {
      this.reduceFontSize();
    } else {

    }
    // this.resizePage(window.document.documentElement.clientWidth, window.document.documentElement.clientHeight);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.resizePage(window.innerWidth, window.innerHeight);
  }

  // -- for resize
  resizePage(width, height): void {
    let s;
    if (width > 1366) {
      width = 1366;
    }
    if (height > 768) {
      height = 768;
    }
    const w = width / 1366; // eval(width / 1366);
    const h = height / 768; // eval(height / 768);

    if (w < h) {
      s = w;
    } else {
      s = h;
    }
    this.render.setStyle(this.elementRef.nativeElement, 'transform', 'scale(' + s + ')');
    this.render.setStyle(this.elementRef.nativeElement, 'transform-origin', '50%');

    this.render.setStyle(this.elementRef.nativeElement, '-webkit-transform', 'scale(' + s + ')');
    this.render.setStyle(this.elementRef.nativeElement, '-webkit-transform-origin', '50%');

    this.render.setStyle(this.elementRef.nativeElement, '-moz-transform', 'scale(' + s + ')');
    this.render.setStyle(this.elementRef.nativeElement, '-moz-transform-origin', '50%');

    this.render.setStyle(this.elementRef.nativeElement, '-o-transform', 'scale(' + s + ')');
    this.render.setStyle(this.elementRef.nativeElement, '-o-transform-origin', '50%');

    this.render.setStyle(this.elementRef.nativeElement, '-ms-transform', 'scale(' + s + ')');
    this.render.setStyle(this.elementRef.nativeElement, '-ms-transform-origin', '50%');

    // console.log(this.elementRef.nativeElement);
    // $("#container").css({
    //   'transform': 'scale(' + s + ')',
    //   'transform-origin': '0% 0%',

    //   '-webkit-transform': 'scale(' + s + ')',
    //   '-webkit-transform-origin': '0% 0%',

    //   '-moz-transform': 'scale(' + s + ')',
    //   '-moz-transform-origin': '0% 0%',

    //   '-o-transform': 'scale(' + s + ')',
    //   '-o-transform-origin': '0% 0%',

    //   '-ms-transform': 'scale(' + s + ')',
    //   '-ms-transform-origin': '0% 0%',
    // });
  }

  reduceFontSize() {
    // const elementFontSize = parseFloat(this.elementRef.nativeElement.style.fontSize);
    // tslint:disable-next-line:radix
    const elementFontSize = parseInt(window.getComputedStyle(this.elementRef.nativeElement, null).getPropertyValue('font-size')); // in px
    const vwVal = (elementFontSize / window.document.documentElement.clientWidth) * 100;
    const fntSize = vwVal - parseFloat(this.fontSize);
    this.render.setStyle(this.elementRef.nativeElement, 'font-size', fntSize + this.fontUnits);
  }
}

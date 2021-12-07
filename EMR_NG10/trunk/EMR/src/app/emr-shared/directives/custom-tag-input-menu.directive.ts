import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import * as _ from 'lodash';

@Directive({
  selector: '[appCustomTagInputMenu]'
})
export class CustomTagInputMenuDirective implements OnInit {

  @Input() appTempVal;
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @Output() tagPrioritySelected = new EventEmitter<any>();
  @Output() manuallySaveSelected = new EventEmitter<any>();
  @Output() manuallyEditedTagSelected = new EventEmitter<any>();

  @HostListener('mouseover') onMouseOver() {
    // var allMoreMenu = element[0].closest('tags-input').querySelectorAll('.ddropdown-content');
    // _.map(allMoreMenu,function(element,index){
    //   angular.element(element).css({'display':'none'});
    // })
    // var mmoreMenu=angular.element(element[0].querySelectorAll('.ddropdown-content'));
    // mmoreMenu.css({'display':'block'});
    // try {
    //   var tagInput = element[0].closest('tags-input');
    //   $(tagInput.querySelectorAll('.autocomplete')[0]).addClass('hide');
    // }catch(exception){}
  }

  ngOnInit() {
    const menuOptionElement = this.el.nativeElement.querySelectorAll('.ddropdown-content')[0];
    const ddropdownElement = this.el.nativeElement.querySelectorAll('.ddropdown')[0];
    // ddropdownElement.onmouseover(function () {
    // });
    this.renderer.listen(ddropdownElement, 'mouseover', () => {
      const allMoreMenu = this.el.nativeElement.querySelectorAll('.ddropdown-content');
      // _.map(allMoreMenu, function(element, index) {
      // this.renderer.setStyle(menuOptionElement, 'display', '');
      // });

      const mmoreMenu = this.el.nativeElement.querySelectorAll('.ddropdown-content');
      // this.renderer.setStyle(menuOptionElement, 'display', 'block');
      try {
        const tagInput = this.el.nativeElement.closest('tags-input');
        // $(tagInput.querySelectorAll('.autocomplete')[0]).addClass('hide');
      } catch (exception) { }
    });

    this.renderer.listen(ddropdownElement, 'mouseout', () => {
      // this.renderer.setStyle(menuOptionElement, 'display', 'block');
      try {
        // var tagInput = element[0].closest('tags-input');
        // $(tagInput.querySelectorAll('.autocomplete')[0]).removeClass('hide');
      } catch (exception) { }
    });

    this.renderer.listen(ddropdownElement, 'click', () => {
      event.preventDefault();
      const targetEleId = (event.target as HTMLElement).id;
      const severityClass = ['normal', 'minor', 'moderate', 'serious', 'severe', 'critical'];
      if (severityClass.indexOf(targetEleId) > -1) {
        this.tagPrioritySelected.emit(targetEleId);
      }
      if (targetEleId === 'saveinmastermanually') {
        this.manuallySaveSelected.emit(true);
      }
      if (targetEleId === 'editTag') {
        this.manuallyEditedTagSelected.emit(true);
      }
    });


  }
}

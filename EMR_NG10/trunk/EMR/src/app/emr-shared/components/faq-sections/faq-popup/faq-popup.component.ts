import {Component, OnInit, ViewChild, ElementRef, Input, ViewEncapsulation} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq-popup',
  templateUrl: './faq-popup.component.html',
  styleUrls: ['./faq-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FaqPopupComponent implements OnInit {
  @ViewChild('faqPopupRef', {static: false}) faqPopupRef: ElementRef;
  @Input() faqSection;
  constructor(    public activeModal: NgbActiveModal, private router: Router,
  ) { }

  ngOnInit() {
  }

  trackByFunction = (index, item) => {
    if (!item) { return null; }
    return index;
  }

  scrollToSection(id) {
    document.getElementById(`${id}`).scrollIntoView();
  }
}

import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-faq-section-info',
  templateUrl: './faq-section-info.component.html',
  styleUrls: ['./faq-section-info.component.scss']
})
export class FaqSectionInfoComponent implements OnInit {

  @Input() helpFlag;
  constructor() { }

  ngOnInit() {
  }

}

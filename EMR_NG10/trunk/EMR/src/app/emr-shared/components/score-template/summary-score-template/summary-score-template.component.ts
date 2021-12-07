import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-summary-score-template',
  templateUrl: './summary-score-template.component.html',
  styleUrls: ['./summary-score-template.component.scss']
})
export class SummaryScoreTemplateComponent implements OnInit {

  @Input() templateList: any;
  @Input() source: any = '';
  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-foot-examination-summery',
  templateUrl: './foot-examination-summery.component.html',
  styleUrls: ['./foot-examination-summery.component.scss']
})
export class FootExaminationSummeryComponent implements OnInit {
@Input() examineData:any;
  constructor() {
   }

  ngOnInit() {
  }

}

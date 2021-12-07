import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-attachements',
  templateUrl: './view-attachements.component.html',
  styleUrls: ['./view-attachements.component.scss']
})
export class ViewAttachementsComponent implements OnInit {

  @Input() fileData: any;
  isShowCrossIcon = true;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    console.log(this.fileData);
  }

}

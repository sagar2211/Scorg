import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FootExaminationService } from './../../../public/services/foot-examination.service';

@Component({
  selector: 'app-foot-examination-comment',
  templateUrl: './foot-examination-comment.component.html',
  styleUrls: ['./foot-examination-comment.component.scss']
})
export class FootExaminationCommentComponent implements OnInit {
@Input() partData:any;
public comment:string
  constructor(private modal: NgbActiveModal,
    private footService:FootExaminationService) {  }

  ngOnInit() {
    this.comment = this.partData.comment;
    // console.log(this.comment)
  }

   onAddButtonClick(){
    this.partData.comment = this.comment;
    this.footService.updateComment(this.partData)
    this.modal.close('close')
  }
  onCancelButtonClick(){
    this.modal.close('close')
  }
}

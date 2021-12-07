import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from './../../../shared/confirmation-popup/confirmation-popup.component';
import { FootExaminationService } from '../../../public/services/foot-examination.service';
import { FootExaminationCommentComponent } from '../foot-examination-comment/foot-examination-comment.component';

@Component({
  selector: 'app-foot-examination-description',
  templateUrl: './foot-examination-description.component.html',
  styleUrls: ['./foot-examination-description.component.scss']
})
export class FootExaminationDescriptionComponent implements OnInit {
  @Input() examineData:any;

  constructor(
    private modalService: NgbModal,
    private footService: FootExaminationService
  ) { }

  ngOnInit(): void { }

  onClearAllData(side){
    const title =  'Delete';
    const body = 'Do you want to remove this?';
    const messageDetails = {
      modalTitle: title,
      modalBody: body
    };
    const modalInstance = this.modalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        if (side == 'left') {
          this.footService.deleteAll('left_footFlag');
        } else {
          this.footService.deleteAll('right_footFlag');
        }
      }
    });
      modalInstance.componentInstance.messageDetails = messageDetails;
  }


  openDeleteConfirmation(data){
  const title =  'Delete';
  const body = 'Do you want to remove this?';
  const messageDetails = {
    modalTitle: title,
    modalBody: body
  };
  const modalInstance = this.modalService.open(ConfirmationPopupComponent,
    {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
  modalInstance.result.then((result) => {
    if (result === 'Ok') {
      this.footService.deletePainScore(data)
    }
  });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  openCommentPopUp(data){
    let footExaminationCommentpRef = this.modalService.open(FootExaminationCommentComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      container: '#homeComponent',
    });
    footExaminationCommentpRef.componentInstance.partData = data;
    footExaminationCommentpRef.result.then(result=>{
      footExaminationCommentpRef.close();
       })
  }

}

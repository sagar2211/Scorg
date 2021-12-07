import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard-files-popup',
  templateUrl: './dashboard-files-popup.component.html',
  styleUrls: ['./dashboard-files-popup.component.scss']
})
export class DashboardFilesPopupComponent implements OnInit {

  @Input() fileData: any;
  public fileServePath = environment.FILE_SERVER_IMAGE_URL;
  constructor(
    public modal: NgbActiveModal,
  ) { }

  ngOnInit(): void {

  }

  closePopup(typ) {
    this.modal.close(typ);
  }

}

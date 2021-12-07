import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, HostListener } from '@angular/core';

@Component({
  selector: 'app-preview-queue-template',
  templateUrl: './preview-queue-template.component.html',
  styleUrls: ['./preview-queue-template.component.scss']
})
export class PreviewQueueTemplateComponent implements OnInit {
@Input() previewTemplateData: any;
TemplateSettingData: {TemplateData: {}, isPreviewQueueTemplate: true };
  constructor(
    public modal: NgbActiveModal,
  ) { }

  ngOnInit() {
    this.TemplateSettingData = {
      TemplateData: this.previewTemplateData,
      isPreviewQueueTemplate: true
    };
  }
  exitFullScreen() {
    document.exitFullscreen();
  }


  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      this.modal.dismiss('Cross click');
    }
  }
}

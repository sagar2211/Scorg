import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-copy-template',
  templateUrl: './copy-template.component.html',
  styleUrls: ['./copy-template.component.scss']
})
export class CopyTemplateComponent implements OnInit {
  @Input() typeListArray = [];
  @Input() templateList = [];
  @Input() certificateData: any;

  constructor(
    public modal: NgbActiveModal,
    private certificateService: CertificateService,
  ) { }

  ngOnInit(): void {
    console.log(this.templateList);
  }

  onTypeChange(val) {
    if (val) {
      this.certificateData.formType = { ...val };
      this.getTemplateList();
    } else {
      this.certificateData.formType = null;
      this.templateList = [];
    }
  }

  onTemplateChange(val) {
    if (val) {
      this.certificateData.templateId = val.templateId;
      this.certificateData.templateName = val.templateName;
      this.certificateData.templateContent = val.templateText;
      this.certificateData.isActive = val.isActive;
      this.certificateData.template = val;
    } else {
      this.certificateData.templateId = null;
      this.certificateData.templateName = null;
      this.certificateData.templateContent = null;
      this.certificateData.isActive = true;
      this.certificateData.template = null;
    }
  }


  getTemplateList() {
    this.certificateService.getTemplateListBYid(this.certificateData.formType.id).subscribe(res => {
      if (res.length > 0) {
        this.templateList = res;
      }
    });
  }

  updateValue() {
    if (this.certificateData.formType && this.certificateData.template) {
      this.modal.close(this.certificateData);
    }
  }

}

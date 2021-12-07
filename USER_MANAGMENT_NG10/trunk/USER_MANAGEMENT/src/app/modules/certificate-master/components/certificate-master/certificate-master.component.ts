import { Component, OnInit, Renderer2, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Observable, Subject, concat, of } from 'rxjs';
import * as _ from 'lodash';
import { CertificateService } from '../../services/certificate.service';
import { distinctUntilChanged, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from 'src/app/modules/consent/services/patient.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CopyTemplateComponent } from '../copy-template/copy-template.component';

@Component({
  selector: 'app-certificate-master',
  templateUrl: './certificate-master.component.html',
  styleUrls: ['./certificate-master.component.scss']
})
export class CertificateMasterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('angularEditor', { static: false }) angularEditor: any;

  typeListArray = [];
  templateList = [];
  $destroy: Subject<boolean> = new Subject();
  tagMasterList = [];
  certificateData = {
    formType: null,
    template: null,
    templateName: null,
    templateId: null,
    templateContent: null,
    templateDetailFlag: true,
    isActive: true,
    isAddNew: false,
  }

  setAlertMessage: IAlert;

  config: AngularEditorConfig = {
    editable: false,
    spellcheck: true,
    height: '25rem',
    minHeight: '',
    placeholder: '',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
      { class: 'notosansfont', name: 'Hindi Fonts' },
    ],
    sanitize: true,
    toolbarPosition: 'top',
  };

  constructor(
    private certificateService: CertificateService,
    private renderer: Renderer2,
    private commonService: CommonService,
    private activeRoute: ActivatedRoute,
    private patientService: PatientService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.getTypeList();
    this.getTaglistMasterList();
    this.commonService.routeChanged(this.activeRoute);
  }

  ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.unsubscribe();
  }

  ngAfterViewInit() {
    this.renderer.listen(this.angularEditor.textArea.nativeElement, 'focus', (r) => {
      this.certificateData.templateDetailFlag = true;
    });
  }

  onCertificateChange(val) {
    this.getCertificateDataById();
  }

  getTypeList() {
    if (this.typeListArray.length === 0) {
      this.patientService.getTypeList().subscribe(res => {
        if (res.length > 0) {
          this.typeListArray = res;
        }
      });
    }
  }

  getTemplateList() {
    this.certificateService.getTemplateListBYid(this.certificateData.formType.id).subscribe(res => {
      if (res.length > 0) {
        this.templateList = res;
      }
    });
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
      this.config.editable = true;
    } else {
      this.certificateData.templateId = null;
      this.certificateData.templateName = null;
      this.certificateData.templateContent = null;
      this.certificateData.isActive = true;
      this.certificateData.template = null;
      this.config.editable = false;
    }
  }

  addNewTemplate() {
    this.certificateData.templateId = null;
    this.certificateData.templateName = null;
    this.certificateData.template = null;
    if (!this.certificateData.isAddNew) {
      this.certificateData.isAddNew = true;
    } else {
      this.certificateData.isAddNew = false;
    }
  }

  onNewTemplateNameChange() {
    if (this.certificateData.templateName) {
      this.config.editable = true;
    } else {
      this.config.editable = false;
    }
  }


  getCertificateDataById() {
    this.certificateService.getCertificateDataById().subscribe(res => {
      // this.tagsList = res;
    });
  }

  getTaglistMasterList() {
    this.certificateService.getCertificateTagsNameList().subscribe(res => {
      this.tagMasterList = res;
    });
  }

  toAddTag(tagValue): void {
    if (this.certificateData.templateDetailFlag && this.certificateData.templateName) {
      const html = this.angularEditor.textArea.nativeElement.innerHTML;
      if ((!html || html === '<br>')) {
        this.angularEditor.textArea.nativeElement.innerHTML = '';
      }

      const el = this.renderer.createElement('span');
      el.innerHTML = `<span contenteditable=false class=editorTagLabel bg-secondary text-capitalize d-inline-block text-white mb-1 id=template>${tagValue}<span class=editorTagClose align-middle font-weight-bold pointer id=closeTag>×</span></span>&nbsp`;
      this.renderer.appendChild(this.angularEditor.textArea.nativeElement, el);
      this.angularEditor.onContentChange(this.angularEditor.textArea.nativeElement);
      this.addEventListenerOnNode();
    }
  }

  // add eventlistener on each node.
  addEventListenerOnNode(): void {
    const nodes = document.querySelectorAll('.editorTagClose');
    nodes.forEach(t => {
      t.addEventListener('click', (e) => {
        this.remove(e);
      });
    });
  }

  remove(e): void {
    // remove current element form textArea.
    e.currentTarget.parentNode.remove();
  }

  addContentEditableFalseOnNode(): void {
    const nodes = document.querySelectorAll('.editorTagLabel');
    nodes.forEach(t => {
      t.setAttribute('contenteditable', 'false');
    });
  }

  addEditTagCloseOnNode(emailText: string): string {
    if (emailText) {
      const tagCloseSpan = '<span class=editorTagClose align-middle font-weight-bold pointer>&#215;</span>';
      const tagCloseSpanReplaced = '<editor-tag-close></editor-tag-close>';
      emailText = emailText.split(tagCloseSpanReplaced).join(tagCloseSpan);
      return emailText;
    } else {
      return '';
    }
  }

  removeEditTagCloseOnNode(emailText: string): string {
    if (emailText) {
      const tagCloseSpan = '<span class=editorTagClose align-middle font-weight-bold pointer>&#215;</span>';
      const tagCloseSpanReplaced = '<editor-tag-close></editor-tag-close>';
      emailText = emailText.split(tagCloseSpan).join(tagCloseSpanReplaced);
      return emailText;
    } else {
      return '';
    }
  }

  updateTemplate() {
    if (!this.certificateData.templateName) {
      this.setAlertMessage = {
        message: 'Please Add Or select Template',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    } else if (!this.certificateData.templateContent) {
      this.setAlertMessage = {
        message: 'Please Add Template Content',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const param = {
      templateId: this.certificateData.templateId ? this.certificateData.templateId : 0,
      templateName: this.certificateData.templateName,
      categoryId: this.certificateData.formType.id,
      templateText: this.certificateData.templateContent,
      isActive: this.certificateData.isActive,
    }
    this.certificateService.updateTemplateData(param).subscribe(res => {
      if (res) {
        this.setAlertMessage = {
          message: 'Data Updated',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.certificateData = {
          formType: null,
          template: null,
          templateName: null,
          templateId: null,
          templateContent: null,
          templateDetailFlag: true,
          isActive: true,
          isAddNew: false
        }
        this.templateList.length = 0;
      } else {
        this.setAlertMessage = {
          message: 'Something Went Wrong',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  copyTemplateFrom() {
    const modalInstance = this.modalService.open(CopyTemplateComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'orders-modal-popup'
      });
    modalInstance.result.then((result) => {
      if (result) {
        this.certificateData = { ...result };
        this.certificateData.templateId = null;
        this.certificateData.templateName = null;
        this.certificateData.isAddNew = true;
        this.config.editable = true;
      }
    });
    modalInstance.componentInstance.typeListArray = [...this.typeListArray];
    modalInstance.componentInstance.certificateData = { ...this.certificateData };
    modalInstance.componentInstance.templateList = [...this.templateList];
  }

}

import { Component, OnInit, ViewChild, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularEditorConfig, AngularEditorComponent } from '@kolkov/angular-editor';
import { ActivatedRoute } from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, of } from 'rxjs';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { NgxPermissionsService } from 'ngx-permissions';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { CommonService } from 'src/app/public/services/common.service';
import { TemplatesService } from 'src/app/modules/communication/services/templates.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';

@Component({
  selector: 'app-template-master',
  templateUrl: './template-master.component.html',
  styleUrls: ['./template-master.component.scss']
})
export class TemplateMasterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('angularEditor', { static: false }) angularEditor: any;
  @ViewChild('smsEditor', { static: false }) smsEditor: any;
  @ViewChild('whatsAppEditor', { static: false }) whatsAppEditor: any;
  @ViewChild('newTemplateNamePopUp', { static: false }) newTemplatePopup: any;
  templateFrm: FormGroup;
  submitted = false;
  sel: any;
  range: any;
  templateTypeList: any = [];
  templateCategoryList = [];
  templateMasterList = [];
  tagMasterList = [];
  eventMasterList = [];
  newTemplateDetails: FormGroup;
  alertMsg: IAlert;
  emailCharcterCount = 0;
  config: AngularEditorConfig = {
    editable: true,
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
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    sanitize: true,
    toolbarPosition: 'top',
  };
  tagList = [{ key: 'patient' }, { key: 'Age' }, { key: 'Address' },
  { key: 'Dr.Name' }, { key: 'Date' }, { key: 'Her/Him' },
  { key: 'Her/His' }, { key: 'She/He' }, { key: 'Patient Name' }, { key: 'Patient Gender' },
  { key: 'Patient Blood Group' }, { key: 'Age' }, { key: 'Designation' }, { key: 'complaient' }, { key: 'Hostpital Name' },
  { key: 'Diagnosis' }, { key: 'Prescription' }, { key: 'Allergies' }, { key: 'Investigation' }, { key: 'Investigation Refrences' },
  { key: 'Radio Investigations' }, { key: 'Remark' }, { key: 'Advice' }, { key: 'Refer Doctor Name' }, { key: 'Doctor Email' },
  { key: 'Doctor Phone' }
  ];
  caretstartPosWhatsApp = 0;
  caretendPosWhatsApp = 0;
  caretPosNodeWhatsApp: HTMLElement;

  caretstartPos = 0;
  caretendPos = 0;
  caretPosNode: HTMLElement;
  mailCaretstartPos = 0;
  mailCaretendPos = 0;
  mailCaretPosNode: HTMLElement;
  modalService: NgbModal;
  $destroy: Subject<boolean> = new Subject();
  duplicateTemplateName: boolean;
  editPermission: boolean;

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private tempalteService: TemplatesService,
    private modal: NgbModal,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    this.modalService = modal;
  }

  ngOnInit() {
    this.templateTypeList = [
      { id: 1, name: 'Email Template' },
      { id: 2, name: 'SMS Template' }
    ];
    this.commonService.routeChanged(this.route);
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Templates)) ? true : false;
    this.defaultTemplateForm();
    this.showActivePopup();
    this.getTemplateCategoryList().subscribe();
    this.getTemplateTagList().subscribe();
    //this.getTemplateCategoryMasteList().subscribe();
    // this.templateFrm.get('emailtemplateDetails').valueChanges.subscribe((res) => {
    //   this.smstextAreaFlag = false;
    // });

  }

  // Initilization Methods
  defaultTemplateForm() {
    this.templateFrm = this.fb.group({
      templateCategory: [null, Validators.required],
      //templateEvent: [null, Validators.required],
      templateName: [null, Validators.required],
      isMailTemplateActive: true,
      isSmsTemplateActive: true,
      isWhatsappTemplateActive: true,
      emailtemplateDetails: '',
      smstemplateDetails: '',
      whatsApptemplateDetails: '',
      isActive: true,
      templateDetailFlag: 'mail',
    });
    this.duplicateTemplateName = false;
    this.config.editable = this.templateFrm.value.isMailTemplateActive;
  }
  ngAfterViewInit() {
    this.renderer.listen(this.angularEditor.textArea.nativeElement, 'focus', (r) => {
      this.templateFrm.patchValue({ templateDetailFlag: 'mail' });
    });
  }
  get templateFrmCntrols() {
    return this.templateFrm.controls;
  }
  get templateNewFrmCntrols() {
    return this.newTemplateDetails.controls;
  }

  // Add New Template Popup Methods
  onSelectNewTemplateCategory(event) {
    this.newTemplateDetails.reset();
    this.newTemplateDetails.patchValue({
      templateCategory: event ? event : null,
      templateName: null,
      isActive: true
    });
  }
  AddNewTemplateModal(template): void {
    // this.templateFrm.value.templateName = '';
    this.newTemplateDetails = this.fb.group({
      templateCategory: [null, Validators.required],
      //templateEvent: [null, Validators.required],
      templateName: [null, Validators.required],
      isMailTemplateActive: true,
      isSmsTemplateActive: true,
      isWhatsappTemplateActive: true,
      emailtemplateDetails: '',
      smstemplateDetails: '',
      whatsApptemplateDetails: '',
      isActive: true
      //templateDetailFlag: [true]
    });
    const modalInstance = this.modalService.open(template,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        windowClass: 'custom-modal',
        size: 'lg'
      });
  }
  AddNewTempate(): void {
    this.submitted = true;
    this.duplicateTemplateName = false;
    if (this.newTemplateDetails.valid) {
      this.submitted = false;
      this.templateFrm.reset();
      this.defaultTemplateForm();
      //this.templateFrm.patchValue({ ...this.newTemplateDetails.value });
      this.templateFrm.patchValue({
        templateCategory: { id: this.newTemplateDetails.value.templateCategory.id, name: this.newTemplateDetails.value.templateCategory.name },
        templateName: { id: '', name: this.newTemplateDetails.value.templateName }
      });
      this.AddUpdateTempate();
    }
  }
  showActivePopup() {
    this.commonService.$addPopupEvent.pipe(takeUntil(this.$destroy)).subscribe(popup => {
      if (popup.isShowAddPopup) {
        this.AddNewTemplateModal(this.newTemplatePopup);
      }
    });
  }
  closeGlobalActivePopup() {
    this.duplicateTemplateName = false;
    this.newTemplateDetails.reset();
    this.commonService.setPopupFlag(false, false);
    this.modalService.dismissAll();
  }

  // Data Binding Methods
  getTemplateCategoryList(): Observable<any> {
    return this.tempalteService.getTemplateCategoryList().pipe(map(res => {
      this.templateCategoryList = res;
      return this.templateCategoryList;
    }));
  }
  getTemplateMasterList(categoryId, clearExistingData?): Observable<any> {
    return this.tempalteService.getAllTemplateList(categoryId, clearExistingData, true).pipe(map(res => {
      this.templateMasterList = res;
      _.map(this.templateMasterList, (o) => {
        if (!o.isActive) {
          o.displayname = o.name + ' ( InActive )';
        } else {
          o.displayname = o.name;
        }
      });
      return this.templateMasterList;
    }));
  }
  getTemplateTagList() {
    return this.tempalteService.getTemplateTagsByCategory().pipe(map(res => {
      return this.tagMasterList = res;
    }));
  }
  onSelectTemplateCategory(event) {
    this.templateFrm.reset({});
    this.defaultTemplateForm();
    this.templateFrm.patchValue({
      templateCategory: event ? event : null
    });
    this.templateMasterList = [];
    if (event) {
      this.getTemplateMasterList(event.id).subscribe();
    }
  }
  getTemplateDetails(event): void {
    if (event) {
      this.tempalteService.getTemplateById(event.id).subscribe((res) => {
        if (!_.isEmpty(res)) {
          res.email = this.addEditTagCloseOnNode(res.email);
          res.templateFor = res.templateFor.toLowerCase().trim();
          this.templateFrm.patchValue({
            //templateCategory: { id: res.category.id, name: res.category.name, key: res.category.key, isActive: true },
            //templateEvent: { event_value: res.eventValue, event_name: res.eventName },
            templateName: { id: res.id, name: res.name },
            isMailTemplateActive: res.is_email_template,
            isSmsTemplateActive: res.is_sms_template,
            isWhatsappTemplateActive: res.is_whatsapp_template,
            emailtemplateDetails: res.email ? res.email : '',
            smstemplateDetails: res.sms ? res.sms : '',
            whatsApptemplateDetails: res.whatsApp ? res.whatsApp : '',
            isActive: res.isActive,
          });
          if (!this.templateFrm.value.isMailTemplateActive) {
            this.config.editable = false;
            this.smsEditor.nativeElement.focus();
            this.renderer.setStyle(this.angularEditor.textArea.nativeElement, 'background-color', '#e9ecef');
          } else {
            this.config.editable = true;
            this.angularEditor.textArea.nativeElement.focus();
            this.renderer.setStyle(this.angularEditor.textArea.nativeElement, 'background-color', 'transparent');
          }
          this.addEventListenerOnNode();
          this.addContentEditableFalseOnNode();
        }
      });
    } else {
      this.templateFrm.patchValue({
        //templateCategory: null,
        templateName: null,
        isMailTemplateActive: true,
        isSmsTemplateActive: true,
        isWhatsappTemplateActive: true,
        emailtemplateDetails: '',
        smstemplateDetails: '',
        whatsApptemplateDetails: '',
        isActive: true
      });
      this.angularEditor.textArea.nativeElement.focus();
    }
  }
  checkTemplateFlag(event: any, check: string) {
    if (check === 'sms') {

    } else if (check === 'email') {
      this.renderer.setStyle(this.angularEditor.textArea.nativeElement, 'background-color', '#e9ecef');
      this.smsEditor.nativeElement.focus();
    } else if (check === 'whatsApp') {

    }
    this.config.editable = this.templateFrm.value.isMailTemplateActive;
  }

  // CRUD Template Creation with content
  AddUpdateTempate(): void {
    this.submitted = true;
    const templateFrmvalue = this.templateFrm.value;
    if (this.templateFrm.valid && this.submitted) {
      this.submitted = false;
      const params = {
        category_id: templateFrmvalue.templateCategory.id,
        //event_name: templateFrmvalue.templateEvent.event_name
        template_id: templateFrmvalue.templateName.id ? templateFrmvalue.templateName.id : '',
        template_name: templateFrmvalue.templateName.name,
        template_sms_template: templateFrmvalue.smstemplateDetails,
        template_email_template: templateFrmvalue.emailtemplateDetails,
        template_isactive: templateFrmvalue.isActive,
        is_email_template: templateFrmvalue.isMailTemplateActive,
        is_sms_template: templateFrmvalue.isSmsTemplateActive,
        is_whatsapp_template: templateFrmvalue.isWhatsappTemplateActive,
        whatsapp_template: templateFrmvalue.whatsApptemplateDetails,
      };
      // replace close span with dummy span
      params.template_email_template = this.removeEditTagCloseOnNode(params.template_email_template);
      if (templateFrmvalue.templateName.id) { // update
        this.tempalteService.updateTemplate(params).subscribe((res) => {
          if (res.status_code === 200) {
            this.alertMsg = {
              message: 'Template Updated Successfully',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
            this.clearForm();
          }
          // if (!params.template_isactive) {
          // this.getTemplateMasterList(params.category_id, true).subscribe();
          this.templateMasterList = [];
          // }
        });
      } else {  // Add
        delete params.template_id;
        this.tempalteService.saveTemplate(params).subscribe((res) => {
          if (res.status_code === 200) {
            this.renderer.setStyle(this.angularEditor.textArea.nativeElement, 'background-color', 'transparent');
            this.angularEditor.textArea.nativeElement.focus();
            this.getTemplateMasterList(this.templateFrm.value.templateCategory.id, true).subscribe();
            this.templateFrm.patchValue({
              templateName: { id: res.id, name: templateFrmvalue.templateName.name }
            });
            this.alertMsg = {
              message: 'Template Added successfuly',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
            this.closeGlobalActivePopup();
          } else if (res.status_code === 400) {
            this.duplicateTemplateName = true;
          }
        });
      }
    }
  }
  clearForm(): void {
    this.submitted = false;
    this.templateFrm.reset();
    this.defaultTemplateForm();
  }
  toAddTag(tagValue, tagId?): void {
    if (this.templateFrm.value.templateDetailFlag === 'mail' && this.templateFrm.value.isMailTemplateActive) {
      const html = this.angularEditor.textArea.nativeElement.innerHTML;
      if ((!html || html === '<br>')) {
        this.angularEditor.textArea.nativeElement.innerHTML = '';
      }

      // Update Email Editor
      const el = this.renderer.createElement('span');
      el.innerHTML = `<span contenteditable="false" class="editorTagLabel bg-secondary text-capitalize d-inline-block text-white mb-1" id="template">${tagValue}<span class="editorTagClose align-middle font-weight-bold pointer" id="closeTag">×</span></span>&nbsp`;

      // if (this.mailCaretPosNode) {
      //   this.mailCaretPosNode.appendChild(el);
      //   this.angularEditor.onContentChange(this.angularEditor.textArea.nativeElement);
      // } else if (this.mailCaretendPos !== 0 || this.mailCaretendPos !== 0) {
      //   tagValue = el.innerHTML + ' ';
      //   const myField = this.angularEditor.textArea.nativeElement;
      //   myField.innerHTML = myField.innerHTML.substring(0, this.mailCaretstartPos) + tagValue + myField.innerHTML.substring(this.mailCaretendPos, myField.innerHTML.length);
      //   this.angularEditor.onContentChange(myField);
      // } else {
      //   this.renderer.appendChild(this.angularEditor.textArea.nativeElement, el);
      //   this.angularEditor.onContentChange(this.angularEditor.textArea.nativeElement);
      // }

      this.renderer.appendChild(this.angularEditor.textArea.nativeElement, el);
      this.angularEditor.onContentChange(this.angularEditor.textArea.nativeElement);
      this.addEventListenerOnNode();
    } else if (this.templateFrm.value.templateDetailFlag === 'sms' && this.templateFrm.value.isSmsTemplateActive) {
      // Update SMS template
      tagValue = tagValue + ' ';
      const myField = this.smsEditor.nativeElement;
      myField.focus();
      if (this.caretstartPos !== 0 || this.caretendPos !== 0) {
        myField.value = myField.value.substring(0, this.caretstartPos) + tagValue + myField.value.substring(this.caretendPos, myField.value.length);
        this.smsEditor.nativeElement.setSelectionRange(this.caretendPos + tagValue.length, this.caretstartPos + tagValue.length);
      } else {
        myField.value = myField.value.concat(tagValue);
      }
      this.templateFrm.patchValue({
        smstemplateDetails: myField.value
      });
      this.caretstartPos = 0;
      this.caretendPos = 0;
      this.templateFrm.patchValue({ templateDetailFlag: 'sms' });
    } else if (this.templateFrm.value.templateDetailFlag === 'whatsApp' && this.templateFrm.value.isWhatsappTemplateActive) {
      // Update SMS template
      tagValue = tagValue + ' ';
      const myField = this.whatsAppEditor.nativeElement;
      myField.focus();
      if (this.caretstartPosWhatsApp !== 0 || this.caretendPosWhatsApp !== 0) {
        myField.value = myField.value.substring(0, this.caretstartPosWhatsApp) + tagValue + myField.value.substring(this.caretendPosWhatsApp, myField.value.length);
        this.whatsAppEditor.nativeElement.setSelectionRange(this.caretendPosWhatsApp + tagValue.length, this.caretstartPosWhatsApp + tagValue.length);
      } else {
        myField.value = myField.value.concat(tagValue);
      }
      this.templateFrm.patchValue({
        whatsApptemplateDetails: myField.value
      });
      this.caretstartPosWhatsApp = 0;
      this.caretendPosWhatsApp = 0;
      this.templateFrm.patchValue({ templateDetailFlag: 'whatsApp' });
    }
  }
  getSMSCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart === '0') {
      this.caretstartPos = oField.selectionStart;
    }
    this.caretendPos = oField.selectionEnd;
    this.templateFrm.value.templateDetailFlag = 'sms';
  }
  getWhatsAppCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart === '0') {
      this.caretstartPosWhatsApp = oField.selectionStart;
    }
    this.caretendPosWhatsApp = oField.selectionEnd;
    this.templateFrm.value.templateDetailFlag = 'whatsApp';
  }
  getEmailCaretPosition() {
    let sel;
    let range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        if (range.commonAncestorContainer.parentNode.contentEditable === 'true') {
          this.mailCaretendPos = range.startOffset;
          this.mailCaretstartPos = range.endOffset;
          this.mailCaretPosNode = null;
        } else {
          this.mailCaretPosNode = range.commonAncestorContainer.parentNode;
        }
      }
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
      const tagCloseSpan = '<span class="editorTagClose align-middle font-weight-bold pointer">&#215;</span>';
      const tagCloseSpanReplaced = '<editor-tag-close></editor-tag-close>';
      emailText = emailText.split(tagCloseSpanReplaced).join(tagCloseSpan);
      return emailText;
    } else {
      return '';
    }
  }
  removeEditTagCloseOnNode(emailText: string): string {
    if (emailText) {
      const tagCloseSpan = '<span class="editorTagClose align-middle font-weight-bold pointer">&#215;</span>';
      const tagCloseSpanReplaced = '<editor-tag-close></editor-tag-close>';
      emailText = emailText.split(tagCloseSpan).join(tagCloseSpanReplaced);
      return emailText;
    } else {
      return '';
    }
  }

  // Destroy the scope of Component
  ngOnDestroy() {
    this.$destroy.next();
    this.modalService.dismissAll();
    this.$destroy.unsubscribe();
  }

}

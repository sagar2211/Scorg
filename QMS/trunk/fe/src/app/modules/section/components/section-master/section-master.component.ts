import { CustomEventsService } from './../../../../services/custom-events.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import * as _ from 'lodash';
import { IAlert } from 'src/app/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { fadeInOut } from 'src/app/config/animations';
import { trigger, transition, useAnimation, state, style, animate } from '@angular/animations';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';
import { PreviewQueueTemplateComponent } from '../preview-queue-template/preview-queue-template.component';

@Component({
  selector: 'app-section-master',
  templateUrl: './section-master.component.html',
  styleUrls: ['./section-master.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class SectionMasterComponent implements OnInit {
  @Input() sectionData;
  @Output() hideRoomSection = new EventEmitter<any>();
  sectionForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  templateList = [];
  gridTemplateList = [];
  doctorFieldList = [];
  queueFieldList = [];
  callingFieldList = [];
  nextFieldList = [];
  showDoctorField: boolean;
  showQueueField: boolean;
  showNextField: boolean;
  showCallingField: boolean;
  showDoctorFieldMsg: string;
  showQueueFieldMsg: string;
  showNextFieldMsg: string;
  showCallingFieldMsg: string;
  previewImageUrl: string;
  activeThemeColor = 'option-1';
  editMode: boolean;
  page: {
    size: number, // The number of elements in the page
    totalElements: number, // The total number of elements
    totalPages: number, // The total number of pages
    pageNumber: number, // The current page number
  };
  sectionList = [];
  compInstance = this;

  constructor(
    private fb: FormBuilder,
    private roomMasterService: RoomMasterService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private previewTemplateModal: NgbModal,
    private eventsService: CustomEventsService
  ) { }


  demoJsonData = {
    doctor_fields_key: [
      'name',
      'speciality',
      'profile_image',
      'room_list'
    ],
    queue_fields_key: [
      'name',
      'token',
      'contact',
      'wait_time'
    ],
    next_fields_key: [
      'name',
      'token',
      'contact'
    ],
    calling_fields_key: [
      'name',
      'token',
      'contact',
      'room_name'
    ],
    grid_template_key: 'grid_template_1'
  };

  ngOnInit() {
    this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    this.commonService.routeChanged(this.route);
    this.updateDeaultData();
    this.loadForm = false;
    if (_.isEmpty(this.sectionData)) {
      this.createForm();
    } else {
      this.createForm(this.sectionData);
    }
  }

  updateDisplayBranding(vl) {
    console.log(vl);
  }


  checkEditStatus() {
    if (!_.isEmpty(this.route.snapshot.params)) {
      this.editMode = true;
      this.sectionForm.controls.remark.disable();
      this.getSectionDataById(this.route.snapshot.params.mapId);
    } else {
      this.editMode = false;
    }
  }

  updateDeaultData() {
    this.showDoctorField = false;
    this.showQueueField = false;
    this.showNextField = false;
    this.showCallingField = false;
    this.showDoctorFieldMsg = null;
    this.showQueueFieldMsg = null;
    this.showNextFieldMsg = null;
    this.showCallingFieldMsg = null;
    this.previewImageUrl = '';
    this.templateList = _.clone(Constants.sectionTemplateTypeArray);
    this.gridTemplateList = _.clone(Constants.sectionTemplateGridTypeArray);
    this.updateDefaultFieldFieldArray();
  }

  updateDefaultFieldFieldArray() {
    this.doctorFieldList = _.clone(Constants.sectionDoctorFieldSelectionArray);
    this.queueFieldList = _.clone(Constants.sectionQueueFieldSelectionArray);
    this.callingFieldList = _.clone(Constants.sectionCallingFieldSelectionArray);
    this.nextFieldList = _.clone(Constants.sectionNextFieldSelectionArray);
  }

  createForm(form?) {
    this.patchDefaultValue(form);
  }

  patchFieldArray(type) {
    let selectedList = [];
    if (type === 'doctor') {
      selectedList = this.doctorFieldList;
    } else if (type === 'queue') {
      selectedList = this.queueFieldList;
    } else if (type === 'next') {
      selectedList = this.nextFieldList;
    } else if (type === 'calling') {
      selectedList = this.callingFieldList;
    }
    const listArray = [];
    _.map(selectedList, (v, k) => {
      listArray.push(this.fb.group(v));
    });
    return listArray;
  }
  sectionDefaultForm() {
    const form = {
      id: [null],
      name: [null, Validators.required],
      remark: [null],
      isActive: [true, Validators.required],
      selected_template: [null, Validators.required],
      doctor_fields: this.fb.array(this.patchFieldArray('doctor')),
      queue_fields: this.fb.array(this.patchFieldArray('queue')),
      next_fields: this.fb.array(this.patchFieldArray('next')),
      calling_fields: this.fb.array(this.patchFieldArray('calling')),
      grid_template: [null, Validators.required],
      displayBranding: [true, Validators.required]
    };
    this.sectionForm = this.fb.group(form);
  }

  patchDefaultValue(val?) {
    this.sectionDefaultForm();
    // this.sectionForm.get('displayBranding').disable();
    this.loadForm = true;
    this.checkEditStatus();
  }

  get doctorFieldsArray() {
    return (this.sectionForm.get('doctor_fields') as FormArray).controls;
  }
  get queueFieldsArray() {
    return (this.sectionForm.get('queue_fields') as FormArray).controls;
  }
  get nextFieldsArray() {
    return (this.sectionForm.get('next_fields') as FormArray).controls;
  }
  get callingFieldsArray() {
    return (this.sectionForm.get('calling_fields') as FormArray).controls;
  }

  saveSectionMasterData() {
    if (this.showFieldSelectionMessage()) {
      const formValues = _.cloneDeep(this.sectionForm.value);
      if (this.editMode) {
        formValues.name = formValues.name.rsm_name; // after update value on name as object
      }
      formValues.jsonData = {
        doctor_fields_key: _.filter(_.map(formValues.doctor_fields, (v) => {
          return v.isSelected === true ? v.key : null;
        }), (d) => {
          return d !== null;
        }),
        queue_fields_key: _.filter(_.map(formValues.queue_fields, (v) => {
          return v.isSelected === true ? v.key : null;
        }), (d) => {
          return d !== null;
        }),
        next_fields_key: _.filter(_.map(formValues.next_fields, (v) => {
          return v.isSelected === true ? v.key : null;
        }), (d) => {
          return d !== null;
        }),
        calling_fields_key: _.filter(_.map(formValues.calling_fields, (v) => {
          return v.isSelected === true ? v.key : null;
        }), (d) => {
          return d !== null;
        }),
        grid_template_key: formValues.grid_template,
        activeThemeColor: this.activeThemeColor,
        displayBranding: formValues.displayBranding
      };
      this.roomMasterService.saveRoomSectionMasterData(formValues).subscribe(res => {
        if (res) {
          this.alertMsg = {
            message: 'Data Saved!',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.redirectToSectionList();
        } else {
          this.alertMsg = {
            message: 'Something went wrong',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }
  }

  showFieldSelectionMessage() {
    this.showDoctorFieldMsg = null;
    this.showQueueFieldMsg = null;
    this.showNextFieldMsg = null;
    this.showCallingFieldMsg = null;
    const formValues = this.sectionForm.value;
    const doctorFields = _.filter(formValues.doctor_fields, (v) => {
      return v.isSelected === true;
    });
    const queueFields = _.filter(formValues.queue_fields, (v) => {
      return v.isSelected === true;
    });
    const nextFields = _.filter(formValues.next_fields, (v) => {
      return v.isSelected === true;
    });
    const callingFields = _.filter(formValues.calling_fields, (v) => {
      return v.isSelected === true;
    });
    if (doctorFields.length === 0) {
      this.showDoctorFieldMsg = 'Please select One Field';
    }
    if (queueFields.length === 0) {
      this.showQueueFieldMsg = 'Please select One Field';
    }
    if (nextFields.length === 0) {
      this.showNextFieldMsg = 'Please select One Field';
    }
    if (callingFields.length === 0) {
      this.showCallingFieldMsg = 'Please select One Field';
    }
    return this.checkSaveFormStatus(this.sectionForm.value.selected_template);
  }

  checkSaveFormStatus(value) {
    let saveStatus = true;
    if (value === 'display_template_1' && (this.showDoctorFieldMsg !== null || this.showCallingFieldMsg !== null)) {
      saveStatus = false;
    } else if (value === 'display_template_2' &&
      (this.showDoctorFieldMsg !== null || this.showQueueFieldMsg !== null || this.showCallingFieldMsg !== null)) {
      saveStatus = false;
    } else if ((value === 'display_template_3' || value === 'display_template_4') &&
      (this.showDoctorFieldMsg !== null || this.showQueueFieldMsg !== null)) {
      saveStatus = false;
    } else if (value === 'display_template_5' &&
      (this.showDoctorFieldMsg !== null || this.showNextFieldMsg !== null || this.showCallingFieldMsg !== null)) {
      saveStatus = false;
    } else if (value === 'display_template_6' &&
      (this.showDoctorFieldMsg !== null || this.showQueueFieldMsg !== null
        || this.showCallingFieldMsg !== null || this.showNextFieldMsg !== null)) {
      saveStatus = false;
    } else if ((value === 'display_template_7') &&
      (this.showCallingFieldMsg !== null)) {
      saveStatus = false;
    }
    return saveStatus;
  }

  showFieldSettingList(value) {
    this.updateDefaultFieldFieldArray();
    this.setGridTemplateEnabled(value);
    this.showDoctorField = false;
    this.showQueueField = false;
    this.showNextField = false;
    this.showCallingField = false;
    if (value === 'display_template_1') {
      this.showDoctorField = true;
      this.showCallingField = true;
    } else if (value === 'display_template_2') {
      this.showDoctorField = true;
      this.showCallingField = true;
      this.showQueueField = true;
    } else if (value === 'display_template_3' || value === 'display_template_4') {
      this.showDoctorField = true;
      this.showQueueField = true;
    } else if (value === 'display_template_5') {
      this.showDoctorField = true;
      this.showCallingField = true;
      this.showNextField = true;
    } else if (value === 'display_template_6') {
      this.showDoctorField = true;
      this.showCallingField = true;
      this.showNextField = true;
      this.showQueueField = true;
    } else if (value === 'display_template_7') {
      this.showCallingField = true;
    }
  }

  updateFieldArray(type, list) {
    let selectedList = [];
    if (type === 'doctor') {
      selectedList = this.doctorFieldList;
    } else if (type === 'queue') {
      selectedList = this.queueFieldList;
    } else if (type === 'next') {
      selectedList = this.nextFieldList;
    } else if (type === 'calling') {
      selectedList = this.callingFieldList;
    }

    _.map(selectedList, (v, k) => {
      const findVal = _.findIndex(list, (l) => {
        return l === v.key;
      });
      if (findVal !== -1) {
        selectedList[k].isSelected = true;
      } else {
        selectedList[k].isSelected = false;
      }
    });

    return selectedList;
  }


  getSectionDataById(id) {
    this.showFieldSettingList('display_template_2');
    this.roomMasterService.getRoomSectionMasterDataById(id).subscribe(res => {
      if (res) {
        this.patchFormData(res);
        // this.viewPreviewImage();
      } else {
        this.alertMsg = {
          message: 'Something wrong!',
          messageType: 'warning',
          duration: 3000
        };
      }
    });
  }

  viewPreviewImage() {
    const selectedTemplateKey = this.sectionForm.value.selected_template;
    _.map(this.templateList, (l) => {
      if (l.key === selectedTemplateKey) {
        this.previewImageUrl = l.big_img_path;
      }
    });
    if (this.showFieldSelectionMessage()) {
      const formValues = this.sectionForm.value;
      formValues.jsonData = {
        doctor_fields_key: _.filter(_.map(formValues.doctor_fields, (v) => {
          return v.isSelected === true ? v.key : null;
        }), (d) => {
          return d !== null;
        }),
        queue_fields_key: _.filter(_.map(formValues.queue_fields, (v) => {
          return v.isSelected === true ? v.key : null;
        }), (d) => {
          return d !== null;
        }),
        next_fields_key: _.filter(_.map(formValues.next_fields, (v) => {
          return v.isSelected === true ? v.key : null;
        }), (d) => {
          return d !== null;
        }),
        calling_fields_key: _.filter(_.map(formValues.calling_fields, (v) => {
          return v.isSelected === true ? v.key : null;
        }), (d) => {
          return d !== null;
        }),
        grid_template_key: formValues.grid_template,
        displayBranding: formValues.displayBranding,
        activeThemeColor: this.activeThemeColor
      };
      document.documentElement.requestFullscreen();
      const modalInstance = this.previewTemplateModal.open(PreviewQueueTemplateComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
          backdrop: 'static',
          keyboard: true,
          windowClass: 'custom-modal full-screen',
          size: 'xl',
        });
      modalInstance.componentInstance.previewTemplateData = formValues;
    }
  }

  redirectToSectionList() {
    setTimeout(() => {
      this.router.navigate(['/app/qms/sectionList']);
    }, 1000);

  }

  changeTheme(type) {
    this.activeThemeColor = type;
    this.eventsService.sendDisplayColor(type);
  }
  patchFormData(res) {
    let jsonData: any;
    if (res.rsm_fieldsetting_json == null) {
      jsonData = this.demoJsonData;
    } else {
      jsonData = JSON.parse(res.rsm_fieldsetting_json);
    }
    if (res.rsm_templatetype == null) {
      res.rsm_templatetype = 'display_template_2';
      this.showFieldSettingList(res.rsm_templatetype);
    } else {
      res.rsm_templatetype = res.rsm_templatetype.toLowerCase();
      this.showFieldSettingList(res.rsm_templatetype);
    }

    if (jsonData.doctor_fields_key.length > 0) {
      this.doctorFieldList = this.updateFieldArray('doctor', jsonData.doctor_fields_key);
    }
    if (jsonData.queue_fields_key.length > 0) {
      this.queueFieldList = this.updateFieldArray('queue', jsonData.queue_fields_key);
    }
    if (jsonData.next_fields_key.length > 0) {
      this.nextFieldList = this.updateFieldArray('next', jsonData.next_fields_key);
    }
    if (jsonData.calling_fields_key.length > 0) {
      this.callingFieldList = this.updateFieldArray('calling', jsonData.calling_fields_key);
    }
    this.activeThemeColor = jsonData.activeThemeColor ? jsonData.activeThemeColor : 'option-1';
    const tempObj = { // section master value and getRoomSectionMasterDataById api response are diffrent
      rsm_Id: res.rsm_Id ? res.rsm_Id : res.rsm_id,
      rsm_name: res.rsm_name,
      rsm_remarks: res.rsm_remarks ? res.rsm_remarks : res.rsm_remark,
      is_active: res.is_active ? res.is_active : res.rsm_isactive,
      rsm_templatetype: res.rsm_templatetype ? res.rsm_templatetype : res.rsm_templatetype
    };
    // this.sectionForm.patchValue({
    //   id: tempObj.rsm_Id,
    //   name: {rsm_id: tempObj.rsm_Id, rsm_name: tempObj.rsm_name},
    //   remark: tempObj.rsm_remarks,
    //   isActive: tempObj.is_active,
    //   selected_template: tempObj.rsm_templatetype
    // });
    const form = {
      id: [tempObj.rsm_Id],
      name: [{ rsm_id: tempObj.rsm_Id, rsm_name: tempObj.rsm_name }, Validators.required],
      remark: [tempObj.rsm_remarks],
      isActive: [tempObj.is_active, Validators.required],
      selected_template: [tempObj.rsm_templatetype, Validators.required],
      doctor_fields: this.fb.array(this.patchFieldArray('doctor')),
      queue_fields: this.fb.array(this.patchFieldArray('queue')),
      next_fields: this.fb.array(this.patchFieldArray('next')),
      calling_fields: this.fb.array(this.patchFieldArray('calling')),
      grid_template: [jsonData.grid_template_key, Validators.required],
      displayBranding: [jsonData.displayBranding ? jsonData.displayBranding : false, Validators.required]
    };
    this.sectionForm = this.fb.group(form);
  }

  selectSection(event) {
    this.sectionForm.patchValue({ name: event ? event : null });
    if (event) {
      this.patchFormData(event);
      // this.editMode = true;
      this.router.navigate(['/app/qms/updateSection', event.rsm_id]);
    } else {
      this.sectionForm.reset({});
      this.showDoctorField = false;
      this.showQueueField = false;
      this.showNextField = false;
      this.showCallingField = false;
      this.updateDefaultFieldFieldArray();
      this.sectionDefaultForm();
    }
  }

  getAllSectionMasterData(searchKey): Observable<any> {
    // this.page = { size: 15, totalElements: 0, totalPages: 10, pageNumber: 1 };
    const param = {
      limit_per_page: 20,
      current_page: 1,
      sort_order: 'asc',
      sort_column: 'rsm_name',
      searchString: (!_.isUndefined(searchKey) && searchKey != null) ? searchKey : '',
      showActiveRoom: true
    };
    return this.compInstance.roomMasterService.getRoomSectionMasterAllList(param).pipe(map(res => {
      if (res.sectionData.length > 0) {
        this.sectionList = res.sectionData;
        // this.page.totalElements = res.totalCount;
      } else {
        this.sectionList = [];
        // this.page.totalElements = 0;
      }
      return this.sectionList;
    }),
      catchError(error => [])
    );
  }

  setGridTemplateEnabled(template) {
    _.map(this.gridTemplateList, (gt) => {
      gt.isGridTemplateEnabled = false;
      if ((template === 'display_template_2' || template === 'display_template_3' || template === 'display_template_1' || template === 'display_template_5') &&
        (gt.key === 'grid_template_1' || gt.key === 'grid_template_3')) {
        gt.isGridTemplateEnabled = true;
      } else if (template === 'display_template_7') {
        gt.isGridTemplateEnabled = true;
      } else if (template === 'display_template_4' && (gt.key === 'grid_template_1' || gt.key === 'grid_template_3')) {
        gt.isGridTemplateEnabled = true;
      } else if ((template === 'display_template_6' || template === 'display_template_8' || template === 'display_template_9') && gt.key === 'grid_template_1') {
        gt.isGridTemplateEnabled = true;
      } else {
        gt.isGridTemplateEnabled = false;
      }
    });

    const selectedGridTemplate = this.gridTemplateList.filter(x => x.isGridTemplateEnabled === true)[0];
    this.sectionForm.patchValue({
      grid_template: selectedGridTemplate.key
    });
  }
}

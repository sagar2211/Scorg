import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil, retry } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Service } from '../../models/service.model';
import { EntitityCommonDataService } from '../../services/entitity-common-data.service';
import { EntitityRulesService } from '../../services/entitity-rules.service';
import { EntityInstructionService } from '../../models/entity-instruction-service.model';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { IAlert } from 'src/app/models/AlertMessage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entity-instruction',
  templateUrl: './entity-instruction.component.html',
  styleUrls: ['./entity-instruction.component.scss']
})
export class EntityInstructionComponent implements OnInit, OnDestroy {
  entityInstructionForm: FormGroup;
  serviceList: Service[] = [];
  destroy$ = new Subject();
  modalService: NgbModal;
  alertMsg: IAlert;
  historyData: any;
  formValid: boolean;

  constructor(
    private entityCommonDataService: EntitityCommonDataService,
    private entitityRulesService: EntitityRulesService,
    private fb: FormBuilder,
    private confirmationModalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit() {
    this.createForm();
    this.historyData = {};
    this.formValid = true;
    this.subcriptionOfEvents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  getServiceListArray(entityId, serviceProviderId) {
    this.serviceList = this.entityCommonDataService.entityScheduleObject.rules.serviceForm;
    this.serviceList = _.uniqBy(this.serviceList, 'id');
    this.createForm();
    // if (this.serviceList.length === 0) {
    //   const param = {
    //     entity_id: entityId,
    //     service_provider_id: serviceProviderId
    //   };
    //   this.entitityRulesService.getServiceListArray(param).subscribe(res => {
    //     if (res.length > 0) {
    //       this.serviceList = res;
    //     }
    //     this.createForm();
    //   });
    // }
  }

  createForm() {
    this.patchDefaultValue();
  }

  addHistoryInstruction(frm) {
    const serviceFormObj = {
      formId: [frm.formId],
      service: [frm.service],
      instructionPatient: [frm.instructionPatient, [Validators.maxLength(200)]],
      instructionOperator: [frm.instructionOperator, [Validators.maxLength(200)]]
    };
    const entityInstructionService = new EntityInstructionService();
    if (entityInstructionService.isObjectValid(serviceFormObj)) {
      entityInstructionService.generateObject(serviceFormObj);
    }
    return this.fb.group(entityInstructionService);
  }

  addNewInstructionForm() {
    const serviceFormObj = {
      formId: [null],
      service: [null],
      instructionPatient: [null],
      instructionOperator: [null]
    };
    const entityInstructionService = new EntityInstructionService();
    if (entityInstructionService.isObjectValid(serviceFormObj)) {
      entityInstructionService.generateObject(serviceFormObj);
    }
    return (entityInstructionService);
  }

  serviceDefaultFormArray() {
    if (!_.isEmpty(this.historyData) && this.historyData.instruction.serviceForm.length > 0) {
      const arrayForm = [];
      _.map(this.historyData.instruction.serviceForm, (v) => {
        arrayForm.push(this.addHistoryInstruction(v));
      });
      return arrayForm;
    } else {
      return [this.fb.group(this.addNewInstructionForm())];
    }
  }

  patchDefaultValue() {
    let instructionFrm = {
      formId: null,
      commonInstructionPatient: null,
      commonInstructionOperator: null,
      sendCommonInstructionToUsers: null,
      sendServiceInstructionToUsers: null,
      serviceForm: {}
    };
    if (this.serviceList.length > 0) {
      instructionFrm.formId = [null];
      instructionFrm.commonInstructionPatient = [null, Validators.maxLength(200)];
      instructionFrm.commonInstructionOperator = [null, Validators.maxLength(200)];
      instructionFrm.sendCommonInstructionToUsers = [false];
      instructionFrm.sendServiceInstructionToUsers = [false];
      instructionFrm.serviceForm = this.fb.array(this.serviceDefaultFormArray());
    } else {
      // instructionFrm = _.omit(instructionFrm, 'serviceForm');
      // instructionFrm = _.omit(instructionFrm, 'sendServiceInstructionToUsers');
      instructionFrm.serviceForm = this.fb.array(this.serviceDefaultFormArray());
      instructionFrm.sendServiceInstructionToUsers = [null];
      instructionFrm.commonInstructionPatient = [null];
      instructionFrm.commonInstructionOperator = [null];
      instructionFrm.sendCommonInstructionToUsers = [false];
    }
    if (!_.isEmpty(this.historyData)) {
      instructionFrm.formId = [this.historyData.instruction.formId];
      instructionFrm.commonInstructionPatient = [this.historyData.instruction.commonInstructionPatient, Validators.maxLength(200)];
      instructionFrm.commonInstructionOperator = [this.historyData.instruction.commonInstructionOperator, Validators.maxLength(200)];
      instructionFrm.sendCommonInstructionToUsers = [this.historyData.instruction.sendCommonInstructionToUsers];
      instructionFrm.sendServiceInstructionToUsers = [this.historyData.instruction.sendServiceInstructionToUsers];
    }
    this.entityInstructionForm = this.fb.group(instructionFrm);
    this.checkFormValidOrInvalid();
  }

  get serviceForm() {
    return this.entityInstructionForm.get('serviceForm') as FormArray;
  }

  selectService(e, item) {
    this.serviceList = _.uniqBy(this.serviceList, 'id');
    const isTrue = typeof e === 'object';
    if (isTrue) {
      item.patchValue({
        id: isTrue ? e.id : '',
        name: isTrue ? e.name : e,
      });
      this.saveEntityInstructionData();
    }
  }

  addServiceSection() {
    const newInstruction = this.fb.group(this.addNewInstructionForm());
    this.serviceForm.push(newInstruction);
    this.saveEntityInstructionData();
  }

  removeServiceSection(index: number) {
    const formValues = this.serviceForm.controls[index]['value'];
    if (formValues.formId) {
      const param = {
        title: 'Confirm',
        body: 'Do you want to delete?',
        formDeleteObj: formValues,
        formIndex: index
      };
      this.checkConfirmation(param);
    } else {
      this.serviceForm.removeAt(index);
      if (this.serviceList.length > 0 && this.serviceForm.value.length == 0) {
        this.addServiceSection();
      }
      this.saveEntityInstructionData();
    }

    if (this.serviceForm.controls.length <= 0) {
      this.addServiceSection();
    }
  }

  saveAllEntityScheduleData() {
    this.entityCommonDataService.saveAllEntityData().subscribe(res => {
      if (res.status) {
        this.alertMsg = {
          message: 'Data Saved!',
          messageType: 'success',
          duration: 3000
        };
        this.entityCommonDataService.historyData = {};
        this.router.navigate(['/app/activeSchedules']);
      } else {
        if (res.msg) {
          this.alertMsg = {
            message: res.msg,
            messageType: 'warning',
            duration: 3000
          };
        }
      }
    });
  }

  saveEntityInstructionData() {
    const formData = this.entityInstructionForm ? this.entityInstructionForm.value : null;
    formData.serviceForm = this.serviceList.length > 0 ? formData.serviceForm : [];
    formData.sendServiceInstructionToUsers = this.serviceList.length > 0 ? formData.sendServiceInstructionToUsers : false;
    this.entityCommonDataService.updateEntityInstructionValue(formData);
  }

  subcriptionOfEvents() {
    this.entityCommonDataService.$subcUpdateServiceInInstruction.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.type === 'add') {
        this.serviceList.push(data.serviceData);
      } else {
        if (data.serviceData){
          const indx = _.findIndex(this.serviceList, (v) => {
            return v.id === data.serviceData.id;
          });
          if (indx !== -1) {
            this.serviceList.splice(indx, 1);
            const formData = this.entityInstructionForm ? this.entityInstructionForm.value : null;
            if (formData && formData.serviceForm.length > 0){
              let frmIndex = _.findIndex(formData.serviceForm, (v) => {
                return (v.service && (v.service.id === data.serviceData.id));
              });
              this.serviceForm.removeAt(frmIndex);
              if (this.serviceList.length > 0 && this.serviceForm.value.length == 0){
                this.addServiceSection();
              }
            }
          }
        }
      }
      this.saveEntityInstructionData();
    });
    this.entityCommonDataService.$subcBasicInforServiceProviderChangeGetHistory.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.historyData = data;
      if (!_.isEmpty(this.historyData)) {
        this.serviceList = [];
        _.map(this.historyData.rules.serviceForm, (v) => {
          let obj = {
            name: v.name,
            id: v.id
          };
          let service = new Service();
          service.generateObject(obj);
          this.serviceList.push(service);
        });
        this.createForm();
      } else {
        this.serviceList = [];
        this.createForm();
      }
    });
    this.entityCommonDataService.$subcGetServicesListDataOnProviderSelect.pipe(takeUntil(this.destroy$)).subscribe(data => {
      const stepBasicInfoData = data;
      const entitityId = stepBasicInfoData.entity_id;
      const providerId = stepBasicInfoData.entity_data_id;
      this.getServiceListArray(entitityId, providerId);
    });
    this.serviceList = _.uniqBy(this.serviceList, 'id');
  }

  checkFormValidOrInvalid() {
    if (this.entityInstructionForm.value['sendCommonInstructionToUsers'] &&
      _.isEmpty(this.entityInstructionForm.value['commonInstructionPatient'])) {
      this.formValid = false;
    } else {
      const pat = this.entityInstructionForm.value['commonInstructionPatient'] ? this.entityInstructionForm.value['commonInstructionPatient'] : '';
      const opr = this.entityInstructionForm.value['commonInstructionOperator'] ? this.entityInstructionForm.value['commonInstructionOperator'] : '';
      if (this.entityInstructionForm.value['sendCommonInstructionToUsers'] && ((_.isEmpty(pat) || pat.length > 200) || (opr.length > 200))) {
        this.formValid = false;
      } else {
        this.formValid = true;
      }
    }
    this.saveEntityInstructionData();
  }

  addRemoveValidatorForServiceInstruction(value) {
    const formData = this.entityInstructionForm.controls;
    if (formData.serviceForm.value.length > 0) {
      _.map(formData['serviceForm']['controls'], (service) => {
        service.controls.instructionPatient.clearValidators();
        service.controls.instructionPatient.setErrors(null);
        service.controls.instructionOperator.clearValidators();
        service.controls.instructionOperator.setErrors(null);
        if (value) {
          service.controls.instructionPatient.setValidators([Validators.required, Validators.max(200)]);
          service.controls.instructionPatient.setErrors({ incorrect: true });
          service.controls.instructionOperator.setValidators([Validators.required, Validators.max(200)]);
          service.controls.instructionOperator.setErrors({ incorrect: true });
        }
      });
    }
    this.saveEntityInstructionData();
  }

  checkConfirmation(modalObj) {
    const messageDetails = {
      modalTitle: modalObj.title,
      modalBody: modalObj.body
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
    modalInstance.result.then((result) => {
      if (result !== 'Ok') {
        return false;
      } else {
        this.deleteInstructionService(modalObj);
      }
    }, (reason) => {
      return false;
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  deleteInstructionService(obj) {
    const formId = obj.formDeleteObj.formId;
    this.entityCommonDataService.deleteInstructionService(formId).subscribe(res => {
      this.alertMsg = {
        message: res,
        messageType: 'warning',
        duration: 3000
      };
      if (res) {
        this.serviceForm.removeAt(obj.formIndex);
        if (this.serviceList.length > 0 && this.serviceForm.value.length == 0) {
          this.addServiceSection();
        }
      }
    });
  }
}

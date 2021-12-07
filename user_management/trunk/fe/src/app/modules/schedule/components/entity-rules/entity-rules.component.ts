import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, retry, map } from 'rxjs/operators';
import { Service } from '../../models/service.model';
import { EntitityCommonDataService } from '../../services/entitity-common-data.service';
import { EntitityRulesService } from '../../services/entitity-rules.service';
import { EntityRule } from '../../models/entity-rule.model';
import { IAlert } from 'src/app/models/AlertMessage';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { EntityBasicInfoService } from '../../services/entity-basic-info.service';

@Component({
  selector: "app-entity-rules",
  templateUrl: "./entity-rules.component.html",
  styleUrls: ["./entity-rules.component.scss"]
})
export class EntityRulesComponent implements OnInit, OnDestroy {
  entityRuleForm: FormGroup;
  serviceList: Service[] = [];
  serviceListMaster: Service[] = [];
  serviceListClone: Service[] = [];
  destroy$ = new Subject();
  servicFormAry: Service[] = [];
  historyData: any;
  alertMsg: IAlert;
  modalService: NgbModal;
  defaultTimePerPatientArray;
  appointmentTimeSlotArray;
  selectedService;
  formLoad: boolean;
  compInstance = this;
  entityId: number;
  providerId: number;

  constructor(
    private entityCommonDataService: EntitityCommonDataService,
    private entitityRulesService: EntitityRulesService,
    private entityBasicInfoService: EntityBasicInfoService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.entityId = null;
    this.providerId = null;
    this.formLoad = false;
    this.createForm();
    this.historyData = {};
    this.defaultTimePerPatientArray = Constants.defaultTimePerPatientArray;
    this.appointmentTimeSlotArray = Constants.appointmentTimeSlotArray;
    this.subcriptionOfEvents();
    this.selectedService = {};
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  getServiceList(searchKey?): Observable<any> {
    if (this.compInstance.entityId === null && this.compInstance.providerId === null) {
      return of([]);
    }
    const param = {
      entity_id: this.compInstance.entityId,
      service_provider_id: this.compInstance.providerId,
      search_text: searchKey || ''
    };
    return this.compInstance.entityBasicInfoService.getServiceListByNameArray(param).pipe(map(res => {
      this.serviceListMaster = res;
      this.serviceListClone = _.cloneDeep(res);
      return this.serviceListMaster;
    }));
  }

  addDefaulatServiceObject(srvData, returnObj) {
    const serviceModal = new Service();
    const serviceObj = {
      id: null,
      name: null,
      timeSlot: null,
      maxNum: null,
      formId: null
    };
    if (serviceModal.isObjectValid(serviceObj)) {
      serviceModal.generateObject(serviceObj);
      if (returnObj) {
        return serviceModal;
      } else if (!srvData && !returnObj) {
        const isNullExist = _.some(this.serviceList, (s) => s.id == null);
        if (!isNullExist) {
          this.serviceList.push(serviceModal);
        }
      } else if (srvData && srvData.id) {
        this.serviceList.push(serviceModal);
      } else {
        this.alertMsg = {
          message: 'Please Select Service',
          messageType: 'warning',
          duration: 3000
        };
      }
    } else {
      this.alertMsg = {
        message: 'Please Check Service',
        messageType: 'warning',
        duration: 3000
      };
    }

  }

  selectService(e, index) {
    const isTrue = typeof e === "object";
    if (isTrue) {
      this.addServiceValue(e, index)
    } else {
      this.serviceList[index] = this.addDefaulatServiceObject(e, true);
    }
  }

  addServiceValue(service, index) {
    if (this.serviceList && this.serviceList.length) {
      let checkServiceExist = _.findIndex(this.serviceList, (v, i) => {
        return v.id === service.id && i != index;
      }
      );
      if (checkServiceExist !== -1) {
        this.alertMsg = {
          message: "Service Already Exist",
          messageType: 'warning',
          duration: 3000
        };
        this.serviceList[index] = this.addDefaulatServiceObject(service, true);
      } else {
        this.addToServiceListArray(service, index);
      }
    } else {
      this.addToServiceListArray(service, index);
    }
  }

  addToServiceListArray(serviceData, index) {
    const service = new Service();
    let serviceObj = {
      id: serviceData.id,
      name: serviceData.name,
      timeSlot: serviceData.timeSlot,
      maxNum: serviceData.maxNum,
      formId: null
    };
    if (service.isObjectValid(serviceObj)) {
      service.generateObject(serviceObj);
    }
    this.serviceList[index] = service;
    let obj = {
      serviceData: service,
      type: 'add'
    }
    this.selectedService = null;
    this.entityCommonDataService.updateServiceInInstructionFromRules(obj);
    this.saveEntityRulsData();
  }

  createForm() {
    this.patchDefaultValue();
  }

  updateServicesList() {
    if (this.historyData.rules.serviceForm.length === 0) {
      this.addDefaulatServiceObject(null, false);
      return;
    }
    _.map(this.historyData.rules.serviceForm, (sv) => {
      const service = new Service();
      let serviceObj = {
        id: sv.id,
        name: sv.name,
        timeSlot: sv.timeSlot,
        maxNum: sv.maxNum,
        formId: sv.formId,
        caterTime: null
      };
      if (service.isObjectValid(serviceObj)) {
        service.generateObject(serviceObj);
      }
      if (_.some(this.serviceList, (s) => s.id == null)) {
        _.remove(this.serviceList, (s) => s.id == null);
      }
      this.serviceList.push(service);
    });
  }

  patchDefaultValue() {
    let ruleForm = {
      timePerPatient: null,
      appointmentTimeSlot: null,
      formId: null
    };
    if (_.isEmpty(this.historyData)) {
      ruleForm = {
        timePerPatient: [null, [Validators.required]],
        appointmentTimeSlot: [null, Validators.required],
        formId: [null],
      };
      const entityRule = new EntityRule();
      if (entityRule.isObjectValid(ruleForm)) {
        entityRule.generateObject(ruleForm);
      }
      this.entityRuleForm = this.fb.group(entityRule);

    } else {
      this.entityRuleForm.controls.timePerPatient.setValue(this.historyData.rules.timePerPatient ? this.historyData.rules.timePerPatient : '');
      this.entityRuleForm.controls.appointmentTimeSlot.setValue(this.historyData.rules.appointmentTimeSlot ? this.historyData.rules.appointmentTimeSlot : '');
      this.entityRuleForm.controls.formId.setValue(this.historyData.rules.formId ? this.historyData.rules.formId : null);
      this.updateServicesList();
    }
    this.saveEntityRulsData();
    this.formLoad = true;
  }

  saveEntityRulsData($event?, type?) {
    // const formData = this.entityRuleForm ? this.entityRuleForm.value : null;
    if (this.entityRuleForm) {
      if (type === 'default' && $event !== undefined) {
        this.entityRuleForm.controls.timePerPatient.setValue($event);
        this.entityRuleForm.controls.appointmentTimeSlot.setValue(null);
        this.appointmentTimeSlotArray = _.filter(Constants.appointmentTimeSlotArray, (obj: number) => obj % $event === 0);
      }
      if (type === 'appointment' && $event !== undefined) {
        this.entityRuleForm.controls.appointmentTimeSlot.setValue($event);
      }
      const formData = this.entityRuleForm.value;
      formData.serviceForm = this.serviceList.length > 0 ? this.serviceList : [];
      this.entityCommonDataService.updateEntityRuleValue(this.entityRuleForm.value);
    }
  }

  deleteService(service, index: number) {
    this.serviceList.splice(index, 1);
    this.saveEntityRulsData();
    let obj = {
      serviceData: service,
      type: 'delete'
    }
    this.saveEntityRulsData();
    this.entityCommonDataService.updateServiceInInstructionFromRules(obj);
    if (this.serviceList.length == 0) {
      this.addDefaulatServiceObject(null, false);

    }
  }

  subcriptionOfEvents() {
    this.entityCommonDataService.$subcBasicInforServiceProviderChangeGetHistory
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.historyData = data;
        if (!_.isEmpty(this.historyData)) {
          this.compInstance.entityId = this.historyData.basicInfo.selectedEntity.id;
          this.compInstance.providerId = this.historyData.basicInfo.selectedProvider.id;
          this.getServiceList().subscribe();
          this.createForm();
        } else {
          this.serviceList = [];
          this.createForm();
          this.addDefaulatServiceObject(null, false);
        }
      });
    this.entityCommonDataService.$subcGetServicesListDataOnProviderSelect
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        const stepBasicInfoData = data;
        this.serviceList = [];
        this.compInstance.entityId = stepBasicInfoData.entity_id;
        this.compInstance.providerId = stepBasicInfoData.entity_data_id;
        this.getServiceList().subscribe();
        this.createForm();
        this.addDefaulatServiceObject(null, false);
      });
  }
}

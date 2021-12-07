import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Department } from 'src/app/public/models/department';
import { AppointmentType } from 'src/app/modules/communication/models/appointment-type.model';
import { UsersService } from 'src/app/public/services/users.service';
import { EntityBasicInfoService } from 'src/app/public/services/entity-basic-info.service';
import { TemplatesService } from 'src/app/modules/communication/services/templates.service';
import { CommonService } from 'src/app/public/services/common.service';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { Entity, Doctor } from '@qms/qlist-lib';
import { ServiceProvider } from 'src/app/public/models/service-provider.model';
import { JointClinic } from 'src/app/public/models/joint-clinic.model';

@Component({
  selector: 'app-set-feedback-default-template',
  templateUrl: './set-feedback-default-template.component.html',
  styleUrls: ['./set-feedback-default-template.component.scss']
})
export class SetFeedbackDefaultTemplateComponent implements OnInit {
  alertMsg: IAlert;
  feedbackTemplateForList = [];
  feedbackTemplateFor: string;
  departmentmasteList: Department[] = [];
  appointmentTypeList: AppointmentType[] = [];
  templatesList = [];
  compInstance = this;
  editPermission: boolean;

  saveObjForDefaultTemplate = {
    hospital: {
      editId: null,
      templateVal: null
    },
    entity: [],
    appoitmentType: [],
    department: [],
  };

  forEntityDefaultObj = {
    editId: null,
    entity: null,
    entityVal: null,
    templateVal: null
  };

  forAppointmentTypeDefaultObj = {
    editId: null,
    appoitmentType: null,
    templateVal: null
  };

  forDepartmentDefaultObj = {
    editId: null,
    department: null,
    templateVal: null
  };

  isFormLoaded: boolean;
  modalService: NgbModal;

  constructor(
    private userService: UsersService,
    private entityBasicInfoService: EntityBasicInfoService,
    private templatesService: TemplatesService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private confirmationModalService: NgbModal,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    this.modalService = confirmationModalService;
  }

  ngOnInit() {
    this.isFormLoaded = false;
    this.commonService.routeChanged(this.route);
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Set_Feedback_Template)) ? true : false;
    const getAllTempFork = this.getAllTemplateCategories();
    const getAppointmentFork = this.getAppointmentTypeList();
    const getDeprtmentFork = this.getDeprtmentMaster();
    const getSavedFeedbackFork = this.getSavedFeedbackTemplate();
    forkJoin([getAllTempFork, getAppointmentFork, getDeprtmentFork, getSavedFeedbackFork]).subscribe(res => {
      if (res[0]) {
        this.getAllTemplateList(res[0]).subscribe(templates => {
          if (templates.length > 0) {
            this.feedbackTemplateFor = 'hospital';
            this.feedbackTemplateForList = Constants.feedbackTemplateSetFor;
            if (res[3].length) {
              this.generateSaveObjectForAllType(res[3]);
            } else {
              this.generateDefaultObjectForAllType();
            }

          } else {
            this.alertMsg = {
              message: 'No Feedback Templates Find',
              messageType: 'warning',
              duration: Constants.ALERT_DURATION
            };
          }
        });
      } else {
        this.alertMsg = {
          message: 'No Feedback Category Find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  generateDefaultObjectForAllType() {
    this.saveObjForDefaultTemplate.entity.push(_.clone(this.forEntityDefaultObj));
    this.saveObjForDefaultTemplate.appoitmentType.push(_.clone(this.forAppointmentTypeDefaultObj));
    this.saveObjForDefaultTemplate.department.push(_.clone(this.forDepartmentDefaultObj));
    this.saveObjForDefaultTemplate.hospital = _.clone({
      editId: null,
      templateVal: null
    });
    this.isFormLoaded = true;
  }

  getSelectedTypeValues() {
    console.log(this.feedbackTemplateFor);
  }

  getEntityData(val, index: number) {
    this.saveObjForDefaultTemplate.entity[index].entity = _.clone(val);
  }

  selectTemplate(val, index: number, type: string) {
    if (type === 'entity') {
      this.saveObjForDefaultTemplate.entity[index].templateVal = _.clone(val);
    } else if (type === 'department') {
      this.saveObjForDefaultTemplate.department[index].templateVal = _.clone(val);
    } else if (type === 'appointment_type') {
      this.saveObjForDefaultTemplate.appoitmentType[index].templateVal = _.clone(val);
    } else if (type === 'hospital') {
      this.saveObjForDefaultTemplate.hospital.templateVal = _.clone(val);
    }
  }

  getEntityValue(val, index: number) {
    if (val) {
      const defObj = _.clone(this.saveObjForDefaultTemplate.entity[index]);
      defObj.entityVal = _.clone(val);
      const checkNotExist = this.checkSameValExist(this.saveObjForDefaultTemplate.entity, defObj, 'entity', index);
      if (!checkNotExist) {
        this.alertMsg = {
          message: 'Already Selected',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        this.saveObjForDefaultTemplate.entity[index].entityVal = this.saveObjForDefaultTemplate.entity[index].entityVal === null ? '' : null;
      } else {
        this.saveObjForDefaultTemplate.entity[index].entityVal = _.clone(val);
      }
    }
  }

  selectDepartment(val, index: number) {
    if (val) {
      const checkNotExist = this.checkSameValExist(this.saveObjForDefaultTemplate.department, { department: val }, 'department', index);
      if (!checkNotExist) {
        this.alertMsg = {
          message: 'Already Selected',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        this.saveObjForDefaultTemplate.department[index].department = this.saveObjForDefaultTemplate.department[index].department === null ? '' : null;
      } else {
        this.saveObjForDefaultTemplate.department[index].department = _.clone(val);
      }
    }
  }

  selectAppointmentType(val, index: number) {
    if (val) {
      const checkNotExist = this.checkSameValExist(this.saveObjForDefaultTemplate.appoitmentType, { appoitmentType: val }, 'appointment_type', index);
      if (!checkNotExist) {
        this.alertMsg = {
          message: 'Already Selected',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        this.saveObjForDefaultTemplate.appoitmentType[index].appoitmentType = this.saveObjForDefaultTemplate.appoitmentType[index].appoitmentType === null ? '' : null;
      } else {
        this.saveObjForDefaultTemplate.appoitmentType[index].appoitmentType = _.clone(val);
      }
    }
  }

  checkSameValExist(allData, check, type, index) {
    const findExist = _.findIndex(allData, (v, i) => {
      if (type === 'entity' && v.entity && v.entityVal) {
        return v.entity.id === check.entity.id
          && v.entityVal.id === check.entityVal.id
          && i !== index;
      } else if (type === 'appointment_type' && v.appoitmentType) {
        return v.appoitmentType.id === check.appoitmentType.id
          && i !== index;
      } else if (type === 'department' && v.department) {
        return v.department.id === check.department.id
          && i !== index;
      }
    });
    if (findExist === -1) {
      return true;
    } else {
      return false;
    }
  }

  checValueExist(type, index) {
    let checkVal = null;
    let returnVal = null;
    if (type === 'entity') {
      checkVal = this.saveObjForDefaultTemplate.entity[index];
      if (!checkVal.templateVal || !checkVal.entity || !checkVal.entityVal) {
        returnVal = 'check_section';
      } else {
        const val = this.checkSameValExist(this.saveObjForDefaultTemplate.entity, checkVal, type, index);
        returnVal = val ? null : 'duplicate_entry';
      }
    } else if (type === 'department') {
      checkVal = this.saveObjForDefaultTemplate.department[index];
      if (!checkVal.templateVal || !checkVal.department) {
        returnVal = 'check_section';
      } else {
        const val = this.checkSameValExist(this.saveObjForDefaultTemplate.department, checkVal, type, index);
        returnVal = val ? null : 'duplicate_entry';
      }
    } else if (type === 'appointment_type') {
      checkVal = this.saveObjForDefaultTemplate.appoitmentType[index];
      if (!checkVal.templateVal || !checkVal.appoitmentType) {
        returnVal = 'check_section';
      } else {
        const val = this.checkSameValExist(this.saveObjForDefaultTemplate.appoitmentType, checkVal, type, index);
        returnVal = val ? null : 'duplicate_entry';
      }
    }
    return returnVal;
  }

  addSectionByType(type) {
    if (type === 'entity') {
      this.saveObjForDefaultTemplate.entity.push(_.clone(this.forEntityDefaultObj));
    } else if (type === 'department') {
      this.saveObjForDefaultTemplate.department.push(_.clone(this.forDepartmentDefaultObj));
    } else if (type === 'appointment_type') {
      this.saveObjForDefaultTemplate.appoitmentType.push(_.clone(this.forAppointmentTypeDefaultObj));
    }
  }

  addNewSection(type, index) {
    const valExist = this.checValueExist(type, index);
    if (valExist === null) {
      this.addSectionByType(type);
    } else {
      if (valExist !== 'check_section') {
        if (type === 'entity') {
          this.saveObjForDefaultTemplate.entity[index] = _.clone(this.forEntityDefaultObj);
        } else if (type === 'department') {
          this.saveObjForDefaultTemplate.department[index] = _.clone(this.forDepartmentDefaultObj);
        } else if (type === 'appointment_type') {
          this.saveObjForDefaultTemplate.appoitmentType[index] = _.clone(this.forAppointmentTypeDefaultObj);
        }
      }
      this.alertMsg = {
        message: (valExist === 'check_section' ? ('Check ' + type + ' section') : 'Duplicate Entry'),
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  deleteSection(type, index, item) {
    if (!item.editId) {
      if (type === 'entity') {
        this.saveObjForDefaultTemplate.entity.splice(index, 1);
        if (this.saveObjForDefaultTemplate.entity.length === 0) {
          this.addSectionByType(type);
        }
      } else if (type === 'department') {
        this.saveObjForDefaultTemplate.department.splice(index, 1);
        if (this.saveObjForDefaultTemplate.department.length === 0) {
          this.addSectionByType(type);
        }
      } else if (type === 'appointment_type') {
        this.saveObjForDefaultTemplate.appoitmentType.splice(index, 1);
        if (this.saveObjForDefaultTemplate.appoitmentType.length === 0) {
          this.addSectionByType(type);
        }
      }
    } else {
      const param = {
        title: 'Confirm',
        body: 'Do you want to delete this?',
        formDeleteObj: item,
        formType: type,
        formIndex: {
          main: index,
          sub: null
        }
      };
      this.checkConfirmation(param);
    }
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
        this.templatesService.feedbackTemplateLinkDelete(modalObj.formDeleteObj.editId).subscribe(res => {
          if (res) {
            this.alertMsg = {
              message: 'Template Link Deleted',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
            modalObj.formDeleteObj.editId = null;
            this.deleteSection(modalObj.formType, modalObj.formIndex.main, modalObj.formDeleteObj);
          } else {
            this.alertMsg = {
              message: 'Something Wrong',
              messageType: 'warning',
              duration: Constants.ALERT_DURATION
            };
          }
          return true;
        });
      }
    }, (reason) => {
      return false;
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  getDeprtmentMaster(): Observable<any> {
    return this.compInstance.userService.getDepartment().pipe(map(res => {
      this.departmentmasteList = res.Departments;
      return this.departmentmasteList;
    }));
  }

  getAllTemplateCategories(): Observable<any> {
    return this.templatesService.getTemplateCategoryList().pipe(map(res => {
      const indx = _.findIndex(res, (v) => {
        return v.key === 'FEEDBACK';
      });
      if (indx !== -1) {
        return res[indx].id;
      } else {
        return false;
      }
    }));
  }

  getAllTemplateList(catgoryId): Observable<any> {
    return this.compInstance.templatesService.getAllTemplateList(catgoryId).pipe(map(res => {
      this.templatesList = res;
      return this.templatesList;
    }));
  }

  getSavedFeedbackTemplate(): Observable<any> {
    return this.templatesService.getFeedbackTemplate().pipe(map(res => {
      this.templatesList = res;
      return this.templatesList;
    }));
  }

  getAppointmentTypeList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
    };
    return this.compInstance.entityBasicInfoService.getAppointmentTypeList(params).pipe(map(res => {
      if (res.length > 0) {
        this.appointmentTypeList = res;
      } else {
        this.alertMsg = {
          message: 'no appointment type data',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      return this.appointmentTypeList;
    }));
  }

  saveDafaultTemplateData() {
    this.saveObjForDefaultTemplate.hospital.templateVal = this.saveObjForDefaultTemplate.hospital.templateVal ? this.saveObjForDefaultTemplate.hospital.templateVal : null;
    this.saveObjForDefaultTemplate.entity = _.filter(this.saveObjForDefaultTemplate.entity, (v) => {
      return !_.isEmpty(v.entity) && !_.isEmpty(v.entityVal) && !_.isEmpty(v.templateVal);
    });
    this.saveObjForDefaultTemplate.department = _.filter(this.saveObjForDefaultTemplate.department, (v) => {
      return !_.isEmpty(v.department) && !_.isEmpty(v.templateVal);
    });
    this.saveObjForDefaultTemplate.appoitmentType = _.filter(this.saveObjForDefaultTemplate.appoitmentType, (v) => {
      return !_.isEmpty(v.appoitmentType) && !_.isEmpty(v.templateVal);
    });
    console.log(this.saveObjForDefaultTemplate);
    const param = this.convertSaveData(this.saveObjForDefaultTemplate);
    console.log(param);
    this.templatesService.addEditFeedbackTemplate(param).subscribe((res) => {
      if (res) {
        this.alertMsg = {
          message: 'Template Set Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.alertMsg = {
          message: 'Something Wrong',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  convertSaveData(saveData) {
    let returnArray = [];
    if (!_.isEmpty(saveData)) {
      if (saveData.entity.length > 0) {
        if (returnArray.length > 0) {
          returnArray = returnArray.concat(this.getSaveObjectReturn(saveData.entity, 3, 'entityVal'));
        } else {
          returnArray = this.getSaveObjectReturn(saveData.entity, 3, 'entityVal');
        }
      }
      if (saveData.appoitmentType.length > 0) {
        if (returnArray.length > 0) {
          returnArray = returnArray.concat(this.getSaveObjectReturn(saveData.appoitmentType, 4, 'appoitmentType'));
        } else {
          returnArray = this.getSaveObjectReturn(saveData.appoitmentType, 4, 'appoitmentType');
        }
      }
      if (saveData.department.length > 0) {
        if (returnArray.length > 0) {
          returnArray = returnArray.concat(this.getSaveObjectReturn(saveData.department, 2, 'department'));
        } else {
          returnArray = this.getSaveObjectReturn(saveData.department, 2, 'department');
        }
      }
      if (!_.isEmpty(saveData.hospital.templateVal)) {
        const obj = {
          feedbacksetting_id: saveData.hospital.editId ? saveData.hospital.editId : 0,
          hierarchy_id: 1,
          template_id: saveData.hospital.templateVal.id,
          entity_id: null,
          value_id: 1,
          isactive: true,
        };
        returnArray.push(obj);
      }
    }
    return returnArray;
  }

  getSaveObjectReturn(data, type, key) {
    const returnArray = [];
    _.map(data, (v) => {
      const obj = {
        feedbacksetting_id: v.editId ? v.editId : 0,
        hierarchy_id: type,
        template_id: v.templateVal.id,
        entity_id: type === 3 ? v.entity.id : null,
        value_id: v[key].id,
        isactive: true,
      };
      returnArray.push(obj);
    });
    return returnArray;
  }

  generateSaveObjectForAllType(array) {
    const entityData = _.filter(array, (v) => {
      return v.hierarchy_id === 3;
    });
    const departmentData = _.filter(array, (v) => {
      return v.hierarchy_id === 2;
    });
    const appointmentData = _.filter(array, (v) => {
      return v.hierarchy_id === 4;
    });
    const hospitalData = _.filter(array, (v) => {
      return v.hierarchy_id === 1;
    });
    if (entityData.length > 0) {
      this.saveObjForDefaultTemplate.entity = this.generateFormObject(entityData, 'entity');
    } else {
      this.saveObjForDefaultTemplate.entity.push(_.clone(this.forEntityDefaultObj));
    }
    if (departmentData.length > 0) {
      this.saveObjForDefaultTemplate.department = this.generateFormObject(departmentData, 'department');
    } else {
      this.saveObjForDefaultTemplate.department.push(_.clone(this.forDepartmentDefaultObj));
    }
    if (appointmentData.length > 0) {
      this.saveObjForDefaultTemplate.appoitmentType = this.generateFormObject(appointmentData, 'appointment');
    } else {
      this.saveObjForDefaultTemplate.appoitmentType.push(_.clone(this.forAppointmentTypeDefaultObj));
    }
    if (hospitalData.length > 0) {
      this.saveObjForDefaultTemplate.hospital = this.generateFormObject(hospitalData, 'hospital');
    } else {
      this.saveObjForDefaultTemplate.hospital = _.clone({
        editId: null,
        templateVal: null
      });
    }
    this.isFormLoaded = true;
  }

  generateFormObject(dataArray, forType: string) {
    let returnData: any = null;
    if (forType === 'hospital') {
      returnData = {
        editId: dataArray[0].feedback_id,
        templateVal: this.generateTemplateObj(dataArray[0])
      };
    }
    if (forType === 'entity') {
      returnData = [];
      _.map(dataArray, (ent) => {
        const tempEnt = _.clone(this.forEntityDefaultObj);
        tempEnt.templateVal = this.generateTemplateObj(ent);
        tempEnt.editId = ent.feedback_id;
        const entityMdl = new Entity();
        if (entityMdl.isObjectValid(ent)) {
          entityMdl.generateObject(ent);
        }
        tempEnt.entity = entityMdl;
        const obj = {
          id: ent.Value_Data[0].value_id,
          name: ent.Value_Data[0].value_name,
        };
        if (ent.entity_id === 1) {
          const serviceProvider = new ServiceProvider();
          if (serviceProvider.isObjectValid(obj)) {
            serviceProvider.generateObject(obj);
            tempEnt.entityVal = serviceProvider;
          }
        }
        if (ent.entity_id === 2) {
          const doctor = new Doctor();
          if (doctor.isObjectValid(obj)) {
            doctor.generateObject(obj);
            tempEnt.entityVal = doctor;
          }
        }
        if (ent.entity_id === 3) {
          const jointClinic = new JointClinic();
          if (jointClinic.isObjectValid(obj)) {
            jointClinic.generateObject(obj);
            tempEnt.entityVal = jointClinic;
          }
        }
        returnData.push(tempEnt);
      });
    }
    if (forType === 'department') {
      returnData = [];
      _.map(dataArray, (dep) => {
        const tempDep = _.clone(this.forDepartmentDefaultObj);
        tempDep.templateVal = this.generateTemplateObj(dep);
        tempDep.editId = dep.feedback_id;
        const obj = {
          department_id: dep.Value_Data[0].value_id,
          department_name: dep.Value_Data[0].value_name,
        };
        const departmentModel = new Department();
        if (departmentModel.isObjectValid(obj)) {
          departmentModel.generateObject(obj);
        }
        tempDep.department = departmentModel;
        returnData.push(tempDep);
      });
    }
    if (forType === 'appointment') {
      returnData = [];
      _.map(dataArray, (app) => {
        const tempDep = _.clone(this.forAppointmentTypeDefaultObj);
        tempDep.templateVal = this.generateTemplateObj(app);
        tempDep.editId = app.feedback_id;
        const obj = {
          id: app.Value_Data[0].value_id,
          name: app.Value_Data[0].value_name,
        };
        const appointmentType = new AppointmentType();
        if (appointmentType.isObjectValid(obj)) {
          appointmentType.generateObject(obj);
        }
        tempDep.appoitmentType = appointmentType;
        returnData.push(tempDep);
      });
    }
    return returnData;
  }

  generateTemplateObj(templateData) {
    const obj = {
      id: templateData.template_id,
      name: templateData.template_name,
      isActive: true,
      email: templateData.email_template,
      sms: templateData.sms_template,
      category: {
        id: templateData.category_id,
        name: templateData.category_name,
        key: templateData.category_tag,
        isActive: true,
      }
    };
    return obj;
  }

  redirectPreviewTemplate(val) {
    console.log(val);
    const currentUrl = window.location;
    window.open(currentUrl.origin + '/#/feedback');
  }

}

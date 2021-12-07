import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { Entity, Doctor } from '@qms/qlist-lib';
import { IAlert } from 'src/app/models/AlertMessage';
import { Department } from 'src/app/models/department';
import { AppointmentType } from 'src/app/modules/schedule/models/appointment-type.model';
import { UsersService } from 'src/app/services/users.service';
import { TemplatesService } from 'src/app/modules/qms/services/templates.service';
import { EntityBasicInfoService } from 'src/app/modules/schedule/services/entity-basic-info.service';
import { CommonService } from 'src/app/services/common.service';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { ServiceProvider } from 'src/app/modules/schedule/models/service-provider.model';
import { JointClinic } from 'src/app/modules/schedule/models/joint-clinic.model';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-reminder-settings',
  templateUrl: './reminder-settings.component.html',
  styleUrls: ['./reminder-settings.component.scss']
})
export class ReminderSettingsComponent implements OnInit {

  alertMsg: IAlert;
  reminderSettingForm: FormGroup;
  submitted = false;
  formLoad: boolean;
  reminderSettingsFor = [];
  reminderSettingSetAs: string;
  templatesList = [];
  departmentmasteList: Department[] = [];
  appointmentTypeList: AppointmentType[] = [];
  compInstance = this;
  reminderKeyArray = ['Days', 'Hours'];
  editPermission: boolean;
  // reminderSettingObj = {
  //   remindersettingFor: 'hospital',
  //   smsTemplate: '',
  //   emailTemplate: '',
  // };

  saveObjForDefaultTemplate = {
    hospital: {
      editId: null,
      templateVal: null,
      isSmsTemplateActive: true,
      isEmialTemplateActive: true,
      reminderSettingVal: []
    },
    entity: [
    ],
    appoitmentType: [],
    department: [],
  };

  forReminderDefaultObject = {
    key: 'Days', value: 0, is_active: true
  };

  forEntityDefaultObj = {
    editId: null,
    entity: null,
    entityVal: null,
    templateVal: null,
    isSmsTemplateActive: true,
    isEmialTemplateActive: true,
    reminderSettingVal: [{ key: 'Days', value: 0 }]
  };

  forAppointmentTypeDefaultObj = {
    editId: null,
    appoitmentType: null,
    templateVal: null,
    isSmsTemplateActive: true,
    isEmialTemplateActive: true,
    reminderSettingVal: [{ key: 'Days', value: 0 }]
  };

  forDepartmentDefaultObj = {
    editId: null,
    department: null,
    templateVal: null,
    isSmsTemplateActive: true,
    isEmialTemplateActive: true,
    reminderSettingVal: [{ key: 'Days', value: 0 }]
  };

  constructor(
    private userService: UsersService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private confirmationModalService: NgbModal,
    private templatesService: TemplatesService,
    private entityBasicInfoService: EntityBasicInfoService,
    private commonService: CommonService,
    private ngxPermissionsService: NgxPermissionsService

  ) { }

  ngOnInit() {
    this.formLoad = true;
    this.commonService.routeChanged(this.route);
    this.reminderSettingsFor = Constants.reminderSettingsFor;
    this.editPermission = _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.Update_Reminder_Settings)) ? true : false;

    const getAllTempFork = this.getAllTemplateCategories();
    const getAppointmentFork = this.getAppointmentTypeList();
    const getDeprtmentFork = this.getDeprtmentMaster();
    const getSavedReminderSettings = this.getSavedReminderTemplateSettings();
    forkJoin([getAllTempFork, getAppointmentFork, getDeprtmentFork, getSavedReminderSettings]).subscribe(res => {
      if (res[0]) {
        //this.getAllTemplateList(res[0]).subscribe(templates => {
        //if (templates.length > 0) {
        this.reminderSettingSetAs = 'hospital';
        this.reminderSettingsFor = Constants.reminderSettingsFor;
        if (res[3].length) {
          this.generateSaveObjectForAllType(res[3]);
        } else {
          this.generateDefaultObjectForAllType();
        }

      } else {
        this.alertMsg = {
          message: 'No Reminder Templates Settings Find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
      //});
      // } else {
      //   this.alertMsg = {
      //     message: 'No Feedback Category Find',
      //     messageType: 'warning',
      //     duration: Constants.ALERT_DURATION
      //   };
      // }
    });
    // this.generateDefaultObjectForAllType();
    // this.setReminderDefaultFormObject();
    //this.getReminderSettings();
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
        templateVal: null,
        isSmsTemplateActive: true,
        isEmialTemplateActive: true,
        reminderSettingVal: [{ key: 'Days', value: 0, is_active: true }]
      });
    }
    //this.formLoad = true;
  }

  generateFormObject(dataArray, forType: string) {
    let returnData: any = null;
    if (forType === 'hospital') {

      returnData = {
        editId: dataArray[0].id,
        templateVal: this.generateTemplateObj(dataArray[0]),
        isSmsTemplateActive: true,
        isEmialTemplateActive: true,
        reminderSettingVal: []
      };
      // Set Email and SMS Flag with Reminder Setting
      if (dataArray[0].setting_for === 'all' || dataArray[0].setting_for === 'ALL') {
        returnData.isEmialTemplateActive = true;
        returnData.isSmsTemplateActive = true;
      } else if (dataArray[0].setting_for === 'sms' || dataArray[0].setting_for === 'SMS') {
        returnData.isSmsTemplateActive = true;
        returnData.isEmialTemplateActive = false;
      } else if (dataArray[0].setting_for === 'email' || dataArray[0].setting_for === 'EMAIL') {
        returnData.isEmialTemplateActive = true;
        returnData.isSmsTemplateActive = false;
      }
      returnData.reminderSettingVal = this.generateReminderSettingObj(dataArray[0].reminder_setting_details);
      // End
    }
    if (forType === 'entity') {
      returnData = [];
      _.map(dataArray, (ent) => {
        const tempEnt = _.clone(this.forEntityDefaultObj);
        tempEnt.templateVal = this.generateTemplateObj(ent);
        tempEnt.editId = ent.id;
        //ent.setting_for = ent.setting_for.toUpper();
        // Set Email and SMS Flag with Reminder Setting
        if (ent.setting_for === 'all' || ent.setting_for === 'ALL') {
          tempEnt.isEmialTemplateActive = true;
          tempEnt.isSmsTemplateActive = true;
        } else if (ent.setting_for === 'sms' || ent.setting_for === 'SMS') {
          tempEnt.isSmsTemplateActive = true;
          tempEnt.isEmialTemplateActive = false;
        } else if (ent.setting_for === 'email' || ent.setting_for === 'EMAIL') {
          tempEnt.isEmialTemplateActive = true;
          tempEnt.isSmsTemplateActive = false;
        }
        tempEnt.reminderSettingVal = this.generateReminderSettingObj(ent.reminder_setting_details);
        // End

        const entityMdl = new Entity();
        if (entityMdl.isObjectValid(ent)) {
          entityMdl.generateObject(ent);
        }
        tempEnt.entity = entityMdl;
        const obj = {
          id: ent.value_Data[0].value_id,
          name: ent.value_Data[0].value_name,
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
        tempDep.editId = dep.id;
        // Set Email and SMS Flag with Reminder Setting
        if (dep.setting_for === 'all' || dep.setting_for === 'ALL') {
          tempDep.isEmialTemplateActive = true;
          tempDep.isSmsTemplateActive = true;
        } else if (dep.setting_for === 'sms' || dep.setting_for === 'SMS') {
          tempDep.isSmsTemplateActive = true;
          tempDep.isEmialTemplateActive = false;
        } else if (dep.setting_for === 'email' || dep.setting_for === 'EMAIL') {
          tempDep.isEmialTemplateActive = true;
          tempDep.isSmsTemplateActive = false;
        }
        tempDep.reminderSettingVal = this.generateReminderSettingObj(dep.reminder_setting_details);
        // End
        const obj = {
          department_id: dep.value_Data[0].value_id,
          department_name: dep.value_Data[0].value_name,
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
        const tempapp = _.clone(this.forAppointmentTypeDefaultObj);
        tempapp.templateVal = this.generateTemplateObj(app);
        tempapp.editId = app.id;
        // Set Email and SMS Flag with Reminder Setting
        if (app.setting_for === 'all' || app.setting_for === 'ALL') {
          tempapp.isEmialTemplateActive = true;
          tempapp.isSmsTemplateActive = true;
        } else if (app.setting_for === 'sms' || app.setting_for === 'SMS') {
          tempapp.isSmsTemplateActive = true;
          tempapp.isEmialTemplateActive = false;
        } else if (app.setting_for === 'email' || app.setting_for === 'EMAIL') {
          tempapp.isEmialTemplateActive = true;
          tempapp.isSmsTemplateActive = false;
        }
        tempapp.reminderSettingVal = this.generateReminderSettingObj(app.reminder_setting_details);
        // End
        const obj = {
          id: app.value_Data[0].value_id,
          name: app.value_Data[0].value_name,
        };
        const appointmentType = new AppointmentType();
        if (appointmentType.isObjectValid(obj)) {
          appointmentType.generateObject(obj);
        }
        tempapp.appoitmentType = appointmentType;
        returnData.push(tempapp);
      });
    }
    return returnData;
  }


  getAllTemplateCategories(): Observable<any> {
    return this.templatesService.getTemplateCategoryList().pipe(map(res => {
      const categoryArray = _.map(_.filter(res, (v) => {
        return v.key !== 'FEEDBACK';
      }), (data) => {
        return data.id;
      });
      return categoryArray;
    }));
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

  generateReminderSettingObj(reminderObj) {
    const reminderSettingArray = [];
    _.map(reminderObj, (rv) => {
      const remObj = {
        value: rv.time_value,
        key: rv.time_unit,
        is_active: rv.is_active
      };
      reminderSettingArray.push(remObj);
    });
    return reminderSettingArray;
  }

  getSavedReminderTemplateSettings(): Observable<any> {
    const reqParam = {
      search_text: '',
      limit: 100,
      current_page: 1,
      sort_order: 'asc',
      Sort_column: '', //hierarchy_name,template_name
      is_active: true
    };

    return this.templatesService.getReminderSettingList(reqParam).pipe(map(res => {
      this.templatesList = res;
      return this.templatesList;
    }));
  }


  generateDefaultObjectForAllType() {
    this.saveObjForDefaultTemplate.hospital.reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
    this.saveObjForDefaultTemplate.entity.push(_.clone(this.forEntityDefaultObj));
    this.saveObjForDefaultTemplate.appoitmentType.push(_.clone(this.forAppointmentTypeDefaultObj));
    this.saveObjForDefaultTemplate.department.push(_.clone(this.forDepartmentDefaultObj));
    this.saveObjForDefaultTemplate.hospital = _.clone({
      editId: null,
      templateVal: null,
      isSmsTemplateActive: true,
      isEmialTemplateActive: true,
      reminderSettingVal: [{ key: 'Days', value: 0, is_active: true }]
    });
    //this.formLoad = true;
  }
  // get reminderFormSettingControl() {
  //   return this.reminderSettingForm.controls;
  // }

  // setReminderDefaultFormObject() {
  //   this.reminderSettingForm = this.fb.group({
  //     remindersettingFor: ['hospital', Validators.required],
  //     smsTemplate: ['', Validators.required],
  //     emailTemplate: ['', Validators.required]
  //   });
  //   this.formLoad = true;
  // }

  getAllTemplateList(catgoryIdArray): Observable<any> {
    return this.compInstance.templatesService.getAllTemplateList(catgoryIdArray).pipe(map(res => {
      this.templatesList = res;
      return this.templatesList;
    }));
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

  getEntityData(val, index: number) {
    this.saveObjForDefaultTemplate.entity[index].entity = _.clone(val);
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

  addNewSection(type, index) {
    const valExist = this.checValueExist(type, index);
    const reminderValExist = this.checkValueEmptyReminderSetting(type, index);
    //this.formLoad = false;
    if (valExist === null) {
      if (reminderValExist == null) {
        this.addSectionByType(type);
      } else {
        //this.formLoad = false;
        this.alertMsg = {
          message: 'Reminder value should be greater than 0',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
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
      //this.formLoad = false;
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
        this.templatesService.reminderSettingDelete(modalObj.formDeleteObj.editId).subscribe(res => {
          if (res.status_message !== 'Error') {
            this.alertMsg = {
              message: 'Reminder Template Setting Deleted',
              messageType: 'success',
              duration: Constants.ALERT_DURATION
            };
            modalObj.formDeleteObj.editId = null;
            this.deleteSection(modalObj.formType, modalObj.formIndex.main, modalObj.formDeleteObj);
          } else {
            this.alertMsg = {
              message: res.message ? res.message : 'Something Wrong',
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

  addSectionByType(type) {
    if (type === 'entity') {
      this.forEntityDefaultObj.reminderSettingVal = [_.clone(this.forReminderDefaultObject)];
      this.saveObjForDefaultTemplate.entity.push(_.clone(this.forEntityDefaultObj));
    } else if (type === 'department') {
      this.forDepartmentDefaultObj.reminderSettingVal = [_.clone(this.forReminderDefaultObject)];
      this.saveObjForDefaultTemplate.department.push(_.clone(this.forDepartmentDefaultObj));
    } else if (type === 'appointment_type') {
      this.forAppointmentTypeDefaultObj.reminderSettingVal = [_.clone(this.forReminderDefaultObject)];
      this.saveObjForDefaultTemplate.appoitmentType.push(_.clone(this.forAppointmentTypeDefaultObj));
    }
  }


  checValueExist(type, index) {
    let checkVal = null;
    let returnVal = null;
    if (type === 'entity') {
      checkVal = this.saveObjForDefaultTemplate.entity[index];
      if (!checkVal.entity || !checkVal.entityVal) {
        returnVal = 'check_section';
      } else {
        const val = this.checkSameValExist(this.saveObjForDefaultTemplate.entity, checkVal, type, index);
        returnVal = val ? null : 'duplicate_entry';
      }
    } else if (type === 'department') {
      checkVal = this.saveObjForDefaultTemplate.department[index];
      if (!checkVal.department) {
        returnVal = 'check_section';
      } else {
        const val = this.checkSameValExist(this.saveObjForDefaultTemplate.department, checkVal, type, index);
        returnVal = val ? null : 'duplicate_entry';
      }
    } else if (type === 'appointment_type') {
      checkVal = this.saveObjForDefaultTemplate.appoitmentType[index];
      if (!checkVal.appoitmentType) {
        returnVal = 'check_section';
      } else {
        const val = this.checkSameValExist(this.saveObjForDefaultTemplate.appoitmentType, checkVal, type, index);
        returnVal = val ? null : 'duplicate_entry';
      }
    }
    return returnVal;
  }

  checkValueEmptyReminderSetting(type, index) {
    let checkReminderVal = null;
    let returnVal = null;
    let findIndex = -1;
    if (type === 'entity') {
      checkReminderVal = this.saveObjForDefaultTemplate.entity[index].reminderSettingVal;
      findIndex = _.findIndex(checkReminderVal, (rv) => {
        return rv.value <= 0;
      });
    } else if (type === 'department') {
      checkReminderVal = this.saveObjForDefaultTemplate.department[index].reminderSettingVal;
      findIndex = _.findIndex(checkReminderVal, (rv) => {
        return rv.value <= 0;
      });
    } else if (type === 'appointment_type') {
      checkReminderVal = this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal;
      findIndex = _.findIndex(checkReminderVal, (rv) => {
        return rv.value <= 0;
      });
    }
    if (findIndex !== -1) {
      returnVal = 'check_reminder_setting';
    }
    return returnVal;
  }

  checkExistReminderSettings(type, val, index, reminderIndex) {
    if (val.value <= 0) {
      val.value = 0;
      this.alertMsg = {
        message: 'Reminder value should not be 0!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      this.formLoad = false;
    } else {
      let checkReminderVal = null;
      let findIndex = -1;
      this.formLoad = true;
      if (type === 'hospital') {
        checkReminderVal = this.saveObjForDefaultTemplate.hospital.reminderSettingVal;
        findIndex = _.findIndex(checkReminderVal, (rv) => {
          return rv.value === val.value && rv.key === val.key;
        });
      } else if (type === 'entity') {
        checkReminderVal = this.saveObjForDefaultTemplate.entity[index].reminderSettingVal;
        findIndex = _.findIndex(checkReminderVal, (rv) => {
          return rv.value === val.value && rv.key === val.key;
        });
      } else if (type === 'department') {
        checkReminderVal = this.saveObjForDefaultTemplate.department[index].reminderSettingVal;
        findIndex = _.findIndex(checkReminderVal, (rv) => {
          return rv.value === val.value && rv.key === val.key;
        });
      } else if (type === 'appointment_type') {
        checkReminderVal = this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal;
        findIndex = _.findIndex(checkReminderVal, (rv) => {
          return rv.value === val.value && rv.key === val.key;
        });
      }
      if (findIndex !== -1 && findIndex !== reminderIndex) {
        this.formLoad = false;
        //val.key==='Day' ? val.key = 'Hours' : 'Day'
        this.alertMsg = {
          message: 'Reminder Already Selected',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    }
  }

  getDeprtmentMaster(): Observable<any> {
    return this.compInstance.userService.getDepartment().pipe(map(res => {
      this.departmentmasteList = res.Departments;
      //console.log(JSON.stringify(this.departmentmasteList));
      return this.departmentmasteList;
    }));
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

  saveReminderSettingTemplateData() {
    const tempsaveObjForDefaultTemplate = _.clone(this.saveObjForDefaultTemplate);
    tempsaveObjForDefaultTemplate.hospital.templateVal = tempsaveObjForDefaultTemplate.hospital.templateVal ? tempsaveObjForDefaultTemplate.hospital.templateVal : null;
    // tempsaveObjForDefaultTemplate.hospital = tempsaveObjForDefaultTemplate.hospital.reminderSettingVal[0].value === 0 ? [] : tempsaveObjForDefaultTemplate.hospital;
    tempsaveObjForDefaultTemplate.entity = _.filter(tempsaveObjForDefaultTemplate.entity, (v) => {
      return !_.isEmpty(v.entity) && !_.isEmpty(v.entityVal);
    });
    tempsaveObjForDefaultTemplate.department = _.filter(tempsaveObjForDefaultTemplate.department, (v) => {
      return !_.isEmpty(v.department);
    });
    tempsaveObjForDefaultTemplate.appoitmentType = _.filter(tempsaveObjForDefaultTemplate.appoitmentType, (v) => {
      return !_.isEmpty(v.appoitmentType);
    });
    const param = this.convertSaveData(tempsaveObjForDefaultTemplate);
    if (param.length) {
      this.templatesService.addeditReminderSetting(param).subscribe((res) => {
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
    } else {
      this.alertMsg = {
        message: 'Please select value.',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    }
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
      if (saveData.hospital["reminderSettingVal"].length > 0) {
        const reminderSettingArray = [];
        const settingFor = (saveData.hospital.isSmsTemplateActive && saveData.hospital.isEmialTemplateActive) ?
          'all' : saveData.hospital.isSmsTemplateActive ? 'sms' : saveData.hospital.isEmialTemplateActive ? 'email' : null;
        _.map(saveData.hospital.reminderSettingVal, (rv) => {
          const remObj = {
            time_value: rv.value,
            time_unit: rv.key,
            is_active: rv.is_active ? rv.is_active : true
          };
          if (rv.value > 0) {
            reminderSettingArray.push(remObj);
          }
        });

        const obj = {
          id: saveData.hospital.editId ? saveData.hospital.editId : 0,
          hierarchy_id: 1,
          // template_id: saveData.hospital.templateVal.id,
          entity_id: 0,
          value_id: 1,
          is_active: true,
          // setting_for: settingFor,
          reminder_setting_details: reminderSettingArray
        };
        if (reminderSettingArray.length) {
          returnArray.push(obj);
        }
      }
    }
    return returnArray;
  }

  getSaveObjectReturn(data, type, key) {
    const returnArray = [];

    _.map(data, (v) => {
      const reminderSettingArray = [];
      const settingFor = (v.isSmsTemplateActive && v.isEmialTemplateActive) ? 'all' : v.isSmsTemplateActive ? 'sms' : v.isEmialTemplateActive ? 'email' : null;
      _.map(v.reminderSettingVal, (rv) => {
        const remObj = {
          time_value: rv.value,
          time_unit: rv.key,
          is_active: rv.is_active ? rv.is_active : true
        };
        if (rv.value > 0) {
          reminderSettingArray.push(remObj);
        }
      });
      const obj = {
        id: v.editId ? v.editId : 0,
        hierarchy_id: type,
        // template_id: v.templateVal.id,
        entity_id: type === 3 ? v.entity.id : 0,
        value_id: v[key].id,
        is_active: true,
        // setting_for: settingFor,
        reminder_setting_details: reminderSettingArray
      };
      if (reminderSettingArray.length) {
        returnArray.push(obj);
      }
    });
    return returnArray;
  }


  addNewReminderSection(type, index, reminderIndex?) {
    let isValueValid = true;
    this.formLoad = true;
    if (type === 'hospital_reminder') {
      if (this.saveObjForDefaultTemplate.hospital.reminderSettingVal[reminderIndex].value > 0) {
        this.saveObjForDefaultTemplate.hospital.reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
        this.formLoad = false;
      } else {
        isValueValid = false;
      }
    } else if (type === 'entity_reminder') {
      if (this.saveObjForDefaultTemplate.entity[index].reminderSettingVal[reminderIndex].value > 0) {
        this.saveObjForDefaultTemplate.entity[index].reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
        this.formLoad = false;
      } else {
        isValueValid = false;
      }
    } else if (type === 'department_reminder') {
      if (this.saveObjForDefaultTemplate.department[index].reminderSettingVal[reminderIndex].value > 0) {
        this.saveObjForDefaultTemplate.department[index].reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
        this.formLoad = false;
      } else {
        isValueValid = false;
      }
    } else if (type === 'appointment_type_reminder') {
      if (this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal[reminderIndex].value > 0) {
        this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
        this.formLoad = false;
      } else {
        isValueValid = false;
      }
    }

    if (!isValueValid) {
      this.formLoad = false;
      this.alertMsg = {
        message: 'Reminder value should be greater than 0',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    }
  }

  deleteReminderSection(type, index, reminderIndex, item) {
    //if (!item.editId) {
    if (type === 'hospital_reminder') {
      this.saveObjForDefaultTemplate.hospital.reminderSettingVal.splice(reminderIndex, 1);
      const prevRemIndex = this.saveObjForDefaultTemplate.hospital.reminderSettingVal.length - 1;
      if (prevRemIndex >= 0) {
        const val = this.saveObjForDefaultTemplate.hospital.reminderSettingVal[prevRemIndex];
        this.checkExistReminderSettings(type, val, index, reminderIndex);
      }
      if (this.saveObjForDefaultTemplate.hospital.reminderSettingVal.length === 0) {
        this.saveObjForDefaultTemplate.hospital.reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
      }
    } else if (type === 'entity_reminder') {
      this.saveObjForDefaultTemplate.entity[index].reminderSettingVal.splice(reminderIndex, 1);
      const prevRemIndex = this.saveObjForDefaultTemplate.entity[index].reminderSettingVal.length - 1;
      if (prevRemIndex >= 0) {
        const val = this.saveObjForDefaultTemplate.entity[index].reminderSettingVal[prevRemIndex];
        this.checkExistReminderSettings(type, val, index, reminderIndex);
      }
      if (this.saveObjForDefaultTemplate.entity[index].reminderSettingVal.length === 0) {
        this.saveObjForDefaultTemplate.entity[index].reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
      }
    } else if (type === 'department_reminder') {
      this.saveObjForDefaultTemplate.department[index].reminderSettingVal.splice(reminderIndex, 1);
      const prevRemIndex = this.saveObjForDefaultTemplate.department[index].reminderSettingVal.length - 1;
      if (prevRemIndex >= 0) {
        const val = this.saveObjForDefaultTemplate.department[index].reminderSettingVal[prevRemIndex];
        this.checkExistReminderSettings(type, val, index, reminderIndex);
      }
      if (this.saveObjForDefaultTemplate.department[index].reminderSettingVal.length === 0) {
        this.saveObjForDefaultTemplate.department[index].reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
      }
    } else if (type === 'appointment_type_reminder') {
      this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal.splice(reminderIndex, 1);
      const prevRemIndex = this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal.length - 1;
      if (prevRemIndex >= 0) {
        const val = this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal[prevRemIndex];
        this.checkExistReminderSettings(type, val, index, reminderIndex);
      }
      if (this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal.length === 0) {
        this.saveObjForDefaultTemplate.appoitmentType[index].reminderSettingVal.push(_.clone(this.forReminderDefaultObject));
      }
    }


    // } else {
    // const param = {
    //   title: 'Confirm',
    //   body: 'Do you want to delete this reminder setting?',
    //   formDeleteObj: item,
    //   formType: type,
    //   formIndex: {
    //     main: index,
    //     sub: null
    //   }
    // this.saveObjForDefaultTemplate.entity[index].reminderSettingVal[reminderIndex].is_active = false;
    //}
    //this.checkConfirmationForReminderDelete(param);
    //}
  }

  // checkConfirmationForReminderDelete(modalObj) {
  //   const messageDetails = {
  //     modalTitle: modalObj.title,
  //     modalBody: modalObj.body
  //   };
  //   const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
  //     ariaLabelledBy: 'modal-basic-title',
  //     backdrop: 'static',
  //     keyboard: false
  //   });
  //   modalInstance.result.then((result) => {
  //     if (result !== 'Ok') {
  //       return false;
  //     } else {
  //       this.templatesService.reminderSettingDelete(modalObj.formDeleteObj.editId).subscribe(res => {
  //         if (res === 'Success') {
  //           this.alertMsg = {
  //             message: 'Reminder Deleted',
  //             messageType: 'success',
  //             duration: Constants.ALERT_DURATION
  //           };
  //           modalObj.formDeleteObj.editId = null;
  //           //this.deleteReminderSection(modalObj.formType, modalObj.formIndex.main, modalObj.formDeleteObj);
  //         } else {
  //           this.alertMsg = {
  //             message: 'Something Wrong',
  //             messageType: 'warning',
  //             duration: Constants.ALERT_DURATION
  //           };
  //         }
  //         return true;
  //       });
  //     }
  //   }, (reason) => {
  //     return false;
  //   });
  //   modalInstance.componentInstance.messageDetails = messageDetails;
  // }


  checkEmailSmsFlag(item: any, check: string) {
    if (!item.isSmsTemplateActive && !item.isEmialTemplateActive) {
      item.isSmsTemplateActive = check === 'sms' ? true : false;
      item.isEmialTemplateActive = check === 'email' ? true : false;
      this.alertMsg = {
        message: 'Either sms or email should be selected.',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    }
  }

}

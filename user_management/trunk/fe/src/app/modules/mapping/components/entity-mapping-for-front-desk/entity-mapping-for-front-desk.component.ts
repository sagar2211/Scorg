import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { IAlert } from 'src/app/models/AlertMessage';
import { ActivatedRoute, Router } from '@angular/router';
import { Entity } from 'src/app/modules/schedule/models/entity.model';
import { EntityBasicInfoService } from 'src/app/modules/schedule/services/entity-basic-info.service';
import { environment } from 'src/environments/environment';
import { ServiceProvider } from 'src/app/modules/schedule/models/service-provider.model';
import { Constants } from 'src/app/config/constants';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Doctor } from 'src/app/modules/schedule/models/doctor.model';
import { JointClinic } from 'src/app/modules/schedule/models/joint-clinic.model';
import { UsersService } from 'src/app/services/users.service';
import { User } from 'src/app/models/user';
import * as _ from 'lodash';
import { CommonService } from 'src/app/services/common.service';
import { fadeInOut } from 'src/app/config/animations';
import { trigger, transition, useAnimation, state, style, animate } from '@angular/animations';
import { FrontDeskEntityMappingService } from 'src/app/modules/qms/services/front-desk-entity-mapping.service';

@Component({
  selector: 'app-entity-mapping-for-front-desk',
  templateUrl: './entity-mapping-for-front-desk.component.html',
  styleUrls: ['./entity-mapping-for-front-desk.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class EntityMappingForFrontDeskComponent implements OnInit {
  // @Input() mapData;
  // @Output() hideMappingSection = new EventEmitter<any>();
  compInstance = this;
  userMapingForm: FormGroup;
  alertMsg: IAlert;
  mapData: any;
  editMode: boolean = false;

  frontDeskUserList: Array<User> = [];
  entityList: Array<Entity> = [];
  serviceProviderList: Array<ServiceProvider> = [];
  doctorList: Array<Doctor> = [];
  jointClinicList: Array<JointClinic> = [];
  tempIndex = -1;
  selectedEntityType: string;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private entityBasicInfoService: EntityBasicInfoService,
    private userServices: UsersService,
    private commonService: CommonService,
    private frontdeskentityMappingService: FrontDeskEntityMappingService
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.getAllEntityList();
    this.createUserMappingForm();
    // get service edit value and check
    this.mapData = this.frontdeskentityMappingService.editMappingData ? _.cloneDeep(this.frontdeskentityMappingService.editMappingData) : {};
    this.editMode = this.frontdeskentityMappingService.editMappingData && !_.isEmpty(this.frontdeskentityMappingService.editMappingData) ? true : false;
    this.getEditMappingData();
  }
  getEditMappingData(searchKey?) {
    if (!_.isEmpty(this.mapData)) {
      this.frontdeskentityMappingService.editMappingData = {};
      // if (!_.isEmpty(this.mapData)) {
      // load default List
      const getFrontDeskUser = this.getUserList();
      const getAllDoctorList = this.getAllDoctorList();
      const getjointClinicList = this.getAllJointClinicList();
      const getserviceProviderList = this.getAllServiceProviderList();
      forkJoin([getFrontDeskUser, getAllDoctorList, getjointClinicList, getserviceProviderList]).subscribe((res: Array<any>) => {
        this.generateEditData();
      });
    }
  }
  getUserList(searchKey?: string): Observable<any> {
    const obj = {
      limit_per_page: 10,
      current_page: 1,
      sort_order: 'asc',
      sort_column: 'name',
      global_search: (this.compInstance.userMapingForm.value.fuId && this.compInstance.userMapingForm.value.fuId.login_id)
        ? this.compInstance.userMapingForm.value.fuId.login_id : searchKey ? searchKey : '',
      searchCondition: {
        role_type_id: Constants.frontdeskroletypeId  // FRONT DESK - 6
      }
    };
    return this.compInstance.userServices.getUserList(obj).pipe(map(res => {
      return this.frontDeskUserList = res.user_list;
    }));
  }
  generateEditData() {
    this.userMappingListArray.clear();
    this.userServices.getUserDataById(this.mapData.fd_userId).subscribe(result => {
      this.userMapingForm.patchValue({
        mapid: this.mapData.map_id,
        fuId: { user_id: this.mapData.fd_userId, name: this.mapData.fd_name, login_id: result.userdetail.user_id },
      });
    });
    _.forEach(this.mapData.userMappingResponseViewModelList, (o, k) => {
      const entityKey = o.entityTypeId === 2 ? 'doctor' : o.entityTypeId === 3 ? 'joint_clinic' : o.entityTypeId === 1 ? 'service_provider' : '';
      const obj = {
        entityType: { id: o.entityTypeId, key: entityKey, name: entityKey.replace(/_/g, '').toUpperCase() },
        entityTypeValue: { id: o.entityTypeValueId, name: o.entityTypeValueName },
        entityError: [false]
      };
      this.patchDefaultValue(obj);
    });
  }

  createUserMappingForm(val?) {
    this.userMapingForm = this.fb.group({
      mapid: [''],
      fuId: [null, Validators.required],
      userMappingList: this.fb.array([])
    });
    if (_.isEmpty(this.mapData)) {
      this.patchDefaultValue(val);
    }
  }
  get userMappingListArray() {
    return this.userMapingForm.get('userMappingList') as FormArray;
  }

  patchDefaultValue(val?) {
    const mapForm = {
      entityType: [val ? val.entityType : null, Validators.required],
      entityTypeValue: [val ? val.entityTypeValue : null, Validators.required],
      entityError: [false]
    };
    this.userMappingListArray.push(this.fb.group(mapForm));
  }
  getAllEntityList() {
    this.entityBasicInfoService.getAllEntityList().subscribe(res => {
      if (res.length > 0) {
        this.entityList = res;
      }
    });
  }
  selectFuid(event) {
    if (event) {
      const obj = {
        user_id: event.user_id,
        name: event.name,
        login_id: event.login_id
      };
      this.userMapingForm.patchValue({
        mapid: null,
        fuId: obj
      });
      this.frontdeskentityMappingService.getMappingDetailsById(event.user_id).subscribe((res) => {
        if (res.UserDetails.length) {
          this.mapData = res.UserDetails[0];
          this.getEditMappingData(event.name);
        } else {
          this.userMappingListArray.clear();
          this.patchDefaultValue();
        }
      });
    } else {
      this.userMapingForm.patchValue({
        fuId: null
      });
      this.userMappingListArray.clear();
    }
  }
  selectEntity(e, index) {
    this.userMappingListArray.at(index).patchValue({
      entityType: e ? e : null, entityError: false
    });
    this.tempIndex = index;
    this.selectedEntityType = e ? e.key : '';
    this.updateValuesOnEntityChange(e ? e.key : '');
  }
  selectValue(e, index): void {
    e = e.disabled ? null : e;
    this.userMappingListArray.at(index).patchValue({
      entityTypeValue: e ? e : null, entityError: false
    });
  }

  updateValuesOnEntityChange(key) {
    if (key === 'service_provider') {
      this.getAllServiceProviderList().subscribe();
    } else if (key === 'doctor') {
      this.getAllDoctorList().subscribe();
    } else if (key === 'joint_clinic') {
      this.getAllJointClinicList().subscribe();
    }
  }
  getAllServiceProviderList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
      id: Constants.entitytypeserviceproviderId, // service_provider
      specialityId: null
    };
    return this.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      this.tempIndex = -1;
      if (res.length > 0) {
        return this.serviceProviderList = this.disabledSelectedItem(res);

      } else {
        this.alertMsg = {
          message: 'no service provider data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return this.serviceProviderList = [];
      }
    }));
  }
  getAllDoctorList(searchKey?: string): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: Constants.entitytypedoctorId, // doctor
      specialityId: null
    };
    return this.compInstance.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      this.tempIndex = -1;
      if (res.length > 0) {
        // this.compInstance.doctorList = res;
        return this.compInstance.doctorList = this.compInstance.disabledSelectedItem(res);
      } else {
        return this.compInstance.doctorList = [];
      }
    }));
  }
  getAllJointClinicList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: Constants.entitytypejointclinicId, // joint_clinic
      specialityId: null
    };
    return this.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      this.tempIndex = -1;
      if (res.length > 0) {
        return this.jointClinicList = this.disabledSelectedItem(res);
      } else {
        this.alertMsg = {
          message: 'Joint Clinic data not find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
        return this.jointClinicList = [];
      }
    }));
  }
  disabledSelectedItem(list, entityType?) {
    _.map(list, (o) => {
      const findoobj = _.find(this.userMappingListArray.value, (rec) => {
        return rec.entityTypeValue && o.id === rec.entityTypeValue.id && this.selectedEntityType === rec.entityType.key;
      });
      o.disabled = !_.isUndefined(findoobj) ? true : false;
    });
    return list;
  }
  addNewSection(index) {
    if (this.userMappingListArray.value[index].entityType.key === 'joint_clinic') {
      this.jointClinicList = _.cloneDeep(this.disabledSelectedItem(this.jointClinicList));
    } else if (this.userMappingListArray.value[index].entityType.key === 'service_provider') {
      this.serviceProviderList = _.cloneDeep(this.disabledSelectedItem(this.serviceProviderList));
    }
    this.patchDefaultValue();
    this.selectedEntityType = this.userMappingListArray.value[index].entityType.key;
    this.userMappingListArray.at(index + 1).patchValue({
      entityType: this.userMappingListArray.value[index].entityType
    });
  }
  deleteSection(index) {
    this.userMappingListArray.removeAt(index);
    if (this.userMappingListArray.controls.length <= 0) {
      this.patchDefaultValue();
    }
    if (this.userMappingListArray.value[index]) {
      if (this.userMappingListArray.value[index].entityType.key === 'joint_clinic') {
        this.jointClinicList = _.cloneDeep(this.disabledSelectedItem(this.jointClinicList));
      } else if (this.userMappingListArray.value[index].entityType.key === 'service_provider') {
        this.serviceProviderList = _.cloneDeep(this.disabledSelectedItem(this.serviceProviderList));
      }
    }
  }

  saveRoomMasterData() {
    if (this.userMapingForm.valid) {
      const saveObject = {
        fd_userId: this.userMapingForm.value.fuId.user_id,
        entities: this.createSaveEntityObject(this.userMapingForm.value.userMappingList)
      };
      // this.createSaveObject(this.userMapingForm.value);
      this.frontdeskentityMappingService.saveUserMapping(saveObject).subscribe((res) => {
        if (res.id) {
          this.frontdeskentityMappingService.newmappingObject = {};
          this.userMapingForm.patchValue({
            mapid: res.id
          });
          this.alertMsg = {
            message: !_.isEmpty(this.mapData) ? 'Mapping Updated Successfully' : 'Mapping Added Successfully',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.frontdeskentityMappingService.newmappingObject = this.userMapingForm.value;
          setTimeout(() => {
            this.router.navigate(['/app/qms/frontDeskentityMappingList']);
          }, 1000);

        }
      });
    }
  }
  createSaveEntityObject(entityObjectList) {
    const mappingArray = [];
    _.forEach(entityObjectList, (o, k) => {
      const obj = {
        entity_id: o.entityType.id,
        entityvalue_id: o.entityTypeValue.id
      };
      mappingArray.push(obj);
    });
    return mappingArray;
  }

}

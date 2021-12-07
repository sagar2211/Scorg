import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DualListComponent } from 'angular-dual-listbox';
import * as _ from 'lodash';
import { forkJoin, Observable, of, Subject, Subscription, concat } from 'rxjs';
import { takeUntil, map, catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { fadeInOut } from 'src/app/config/animations';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Applicationlist } from 'src/app/public/models/applicationlist';
import { Department } from 'src/app/public/models/department';
import { Designation } from 'src/app/public/models/designation.modal';
import { DoctorCodes } from 'src/app/public/models/doctor-codes';
import { Doctor } from 'src/app/public/models/doctor.model';
import { Entity } from 'src/app/public/models/entity.model';
import { JointClinic } from 'src/app/public/models/joint-clinic.model';
import { RoleType } from 'src/app/public/models/roletype';
import { ServiceProvider } from 'src/app/public/models/service-provider.model';
import { Specialities } from 'src/app/public/models/specialities';
import { Speciality } from 'src/app/public/models/speciality.model';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { EntityBasicInfoService } from 'src/app/public/services/entity-basic-info.service';
import { UsersService } from 'src/app/public/services/users.service';
import { ConfirmationPopupComponent } from 'src/app/shared/confirmation-popup/confirmation-popup.component';
import { GlobalSearchDatPipe } from 'src/app/shared/pipes/global-search-dat.pipe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
  providers: [GlobalSearchDatPipe],
  animations: [
    fadeInOut
  ],
})
export class UserRegistrationComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  isEditFromProfile: boolean;
  userRegistrationFrm: FormGroup;
  destroy$ = new Subject();
  submitted = false;
  userList: any;
  rolesTypeList: RoleType[] = [];
  rolesTypeUniqueList: RoleType[] = [];
  designationList: Designation[] = [];
  specialitiesList: Specialities[] = [];
  applicationList: Applicationlist[] = [];
  departmentmasteList: Department[] = [];
  compInstance = this;
  doctorCodeList: DoctorCodes[] = [];
  titleList: any[] = [];
  roleSource: any[] = [];
  roleSourceMaster: any[] = [];
  roleKey: string;
  roleDisplay: any;
  secondaryRoleConfirmed: any[] = [];
  dualListboxFormat: any = DualListComponent.DEFAULT_FORMAT;
  docSource: any[] = [];
  docKey: string;
  docDisplay: any;
  docAssignmentConfirmed: any[] = [];
  editUserId = '';
  alertMsg: IAlert;
  isNgSelectTypeHeadDisabled = false;
  modalService: NgbModal;
  currentSection = 'section1';
  boxShadow = false;
  serviceProviderList: Array<ServiceProvider> = [];
  doctorList: Array<Doctor> = [];
  specialityList: Array<Speciality> = [];
  jointClinicList: Array<JointClinic> = [];
  entityList: Array<Entity> = [];
  imageUrl: any = './assets/img/profile.svg';
  isLoggedInUser: boolean;

  specialityList$ = new Observable<any>();
  specialityListInput$ = new Subject<string>();
  defaultApplicationList = [];
  applicationRoleDataList = [];
  selectedApplication = null;
  // Load permission for all application
  accessPerList = [];
  communicationPerList = [];
  adminPerList = [];
  appointmentPerList = [];
  billingPerList = [];
  configurationPerList = [];
  dischargePerList = [];
  dmsPerList = [];
  doctorDeskPerList = [];
  doctorSharePerList = [];
  emergencyPerList = [];
  emrSettingPerList = [];
  enqDeskPerList = [];
  insurancePerList = [];
  inventoryPerList = [];
  ipdPerList = [];
  laboratoryPerList = [];
  nursingPerList = [];
  opdPerList = [];
  otPerList = [];
  pharmaPerList = [];
  qmsPerList = [];
  radiologyPerList = [];
  registrationPerList = [];

  allAppPermissionList = [];

  constructor(
    private fb: FormBuilder,
    private userService: UsersService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationModalService: NgbModal,
    private globalSearchData: GlobalSearchDatPipe,
    private entityBasicInfoService: EntityBasicInfoService,
    private commonService: CommonService,
    private authService: AuthService
  ) {
    this.modalService = confirmationModalService;
    this.subscription = this.userService.getProfileUserEditFlag().subscribe(isEdit => {
      this.isEditFromProfile = isEdit.isFromProfileEdit;
      if (this.isEditFromProfile) {
        // this.userRegistrationFrm.controls.is_active.disable();
        // this.userRegistrationFrm.controls.login_id.disable();
      }
    });
  }
  tempEditedObject = {
    tempEmail: '',
    tempMobileNumber: '',
    tempUserId: ''
  };

  ngOnInit(): void {
    this.isEditFromProfile = false;
    this.commonService.routeChanged(this.route);
    this.DefaultBasicInfoObject();
    const allEntityListFork = this.getAllEntityList();
    const roleTypeFork = this.getRoleTypes();
    this.getUserDesignation('').subscribe();

    forkJoin([allEntityListFork, roleTypeFork]).subscribe(res => {
      this.getAllServiceProviderList().subscribe();

      this.editUserId = this.route.snapshot.params.id;
      if (!this.editUserId) {
        this.isLoggedInUser = false;
        this.getTitleList().subscribe();
      } else {
        this.isLoggedInUser = (this.editUserId === this.authService.getLoggedInUserId().toString());
        this.getEditUserData();
      }

      if (this.editUserId === this.authService.getLoggedInUserId().toString()) {
        this.userService.fromProfileUserEditFlag(true, _.toNumber(this.editUserId));
      }
    });

    this.subcriptionOfEvents();
    this.loadSpecialyList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  getApplications(): Observable<any> {
    return this.userService.getApplicationList().pipe(map(res => {
      this.applicationList = res.applications;
      return this.applicationList;
    }),
      catchError(error => [])
    );
  }

  subcriptionOfEvents(): void {
    this.userService.$subcIsFromProfileEditSubject.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.editUserId = data.user_id;
      this.isEditFromProfile = data.isFromProfileEdit;

      if (this.isEditFromProfile) {
        // this.userRegistrationFrm.controls.is_active.disable();
        // this.userRegistrationFrm.controls.login_id.disable();
      }

      this.DefaultBasicInfoObject();
      this.getAllEntityList().subscribe(res => {
        this.getAllServiceProviderList();

        if (!this.editUserId) {
          this.isLoggedInUser = false;
          this.getTitleList().subscribe();
        } else {
          this.isLoggedInUser = (this.editUserId === this.authService.getLoggedInUserId().toString());
          this.getEditUserData();
        }
      });
    });
  }

  getEditUserData(): void {
    this.userService.getUserDataById(this.editUserId).subscribe(result => {
      this.patchFormDataForEdit(result.userdetail);
      if (this.isLoggedInUser) {
        this.userService.masterUserDetails = {
          userDetails: result
        };
      }
    });
    this.userService.getUserImageById(this.editUserId).subscribe(imageResult => {
      if (imageResult.status_code === 200 && imageResult.userImageDetail && imageResult.userImageDetail.userImagePath != null) {
        this.patchUserImageDataForEdit(imageResult.userImageDetail);
      }
    });
  }

  patchFormDataForEdit(userDetails): void {
    if (userDetails != null && !_.isUndefined(userDetails)) {
      this.getTitleList().subscribe(res => {
        this.userRegistrationFrm.patchValue({
          id: userDetails.id,
          title: userDetails.title_id,
          first_name: userDetails.first_name,
          middle_name: userDetails.middle_name ? userDetails.middle_name : '',
          last_name: userDetails.last_name,
          email_address: userDetails.email,
          login_id: userDetails.user_id,
          mobile_no: userDetails.mobile_number,
          alternate_mobile_no: userDetails.alternate_number,
          designation_type: userDetails.designation ? {
            designationId: userDetails.designation.designation_id,
            designation: userDetails.designation.designation_name
          } : '',
          speciality: userDetails.specialty ? {
            id: userDetails.specialty.speciality_id.toString(),
            name: userDetails.specialty.specialty_name
          } : '',
          department: { id: userDetails.department.department_id, name: userDetails.department.department_name },
          is_active: userDetails.is_active,
          user_gender: userDetails.user_gender === 'FEMALE' ? 'female' : userDetails.user_gender === 'MALE' ? 'male' : 'transgender',
          selectedEntity: this.entityList[0],
          selectedServiceProvider: userDetails.assigned_serviceprovider ? {
            id: userDetails.assigned_serviceprovider.provider_id,
            name: userDetails.assigned_serviceprovider.provider_name
          } : null,
          user_services: userDetails.services_user,
          education: userDetails.education,
          experience: userDetails.experience,
          aboutUser: userDetails.about_user,
          default_application: userDetails.default_app_id.toString()
        });
        this.getPrimaryRoles('').subscribe();
        this.getUserDesignation('').subscribe();
        this.tempEditedObject = {
          tempEmail: userDetails.email ? userDetails.email : '',
          tempMobileNumber: userDetails.mobile_number ? userDetails.mobile_number : '',
          tempUserId: userDetails.user_id
        };
        const tempsecRoleConfirmedRoles = [];
        _.forEach(userDetails.additional_roles, (o, k) => {
          const obj = {
            id: o
          };
          tempsecRoleConfirmedRoles.push(obj);
        });
        const tempassignedDoctors = [];
        _.forEach(userDetails.assigned_doctors, (o, k) => {
          const obj = {
            code: o.toString()
          };
          tempassignedDoctors.push(obj);
        });
        this.secondaryRoleConfirmed = tempsecRoleConfirmedRoles;
        this.docAssignmentConfirmed = tempassignedDoctors;

        // get application details
        _.forEach(this.userRegistrationFrm.value.application_assigmentlist, (o, k) => {
          const obj = _.find(userDetails.applications, (rec) => rec === o.id);
          if (!_.isUndefined(obj)) {
            o.checked = true;
            (this.userRegistrationFrm.get('application_assigmentlist') as FormArray).at(k).patchValue(o);

          }
        });

        this.setDefaultApplication();

        // get application role details
        const forkJoins = [];
        _.forEach(this.userRegistrationFrm.value.application_role_detail, (o, k) => {
          const obj = _.find(userDetails.application_detail, (rec) => rec.application.id === o.application.id);
          if (!_.isUndefined(obj)) {
            (this.userRegistrationFrm.get('application_role_detail') as FormArray).at(k).patchValue({
              primary_role: obj.primary_role,
              role_type: obj.role_type,
              primary_permission: null
            });
            if (obj.primary_permission) {
              (this.userRegistrationFrm.get('application_role_detail') as FormArray).at(k).patchValue({
                primary_permission: {
                  permission_name: obj.primary_permission.name,
                  permission_id: obj.primary_permission.id,
                }
              });
            }
            forkJoins.push(this.getApplicationPermission(obj.primary_role.id));
          }
        });
        forkJoin(forkJoins).subscribe((res: Array<any>) => {
          _.forEach(this.userRegistrationFrm.value.application_role_detail, (o, k) => {
            this.callPermissionListAPI(o.application, o.primary_role.id);
          });
        });
      });
    }
  }

  getApplicationPermission(id): Observable<any> {
    if (this.allAppPermissionList.length > 0) {
      const check = _.find(this.allAppPermissionList, d => {
        return d.roleId === id;
      });
      if (check) {
        return of(check.data);
      } else {
        return this.userService.getPrimaryPermissionByRoleId(id).pipe(map((res: any) => {
          if (res.length > 0) {
            this.allAppPermissionList.push({ roleId: id, data: [...res] });
            return res;
          } else {
            this.allAppPermissionList.push({ roleId: id, data: [] });
            return [];
          }
        }));
      }
    } else {
      return this.userService.getPrimaryPermissionByRoleId(id).pipe(map((res: any) => {
        if (res.length > 0) {
          this.allAppPermissionList.push({ roleId: id, data: [...res] });
          return res;
        } else {
          this.allAppPermissionList.push({ roleId: id, data: [] });
          return [];
        }
      }));
    }
  }

  callPermissionListAPI(app, id) {
    const check = _.find(this.allAppPermissionList, d => {
      return d.roleId === id;
    });
    if (app.name === 'ACCESS') {
      this.accessPerList = [...check.data];
    } else if (app.name === 'ADMIN') {
      this.adminPerList = [...check.data];
    } else if (app.name === 'APPOINTMENT') {
      this.appointmentPerList = [...check.data];
    } else if (app.name === 'BILLING') {
      this.billingPerList = [...check.data];
    } else if (app.name === 'COMMUNICATION') {
      this.communicationPerList = [...check.data];
    } else if (app.name === 'CONFIGURATION') {
      this.configurationPerList = [...check.data];
    } else if (app.name === 'DISCHARGE') {
      this.dischargePerList = [...check.data];
    } else if (app.name === 'DMS') {
      this.dmsPerList = [...check.data];
    } else if (app.name === 'DOCTOR DESK') {
      this.doctorDeskPerList = [...check.data];
    } else if (app.name === 'DOCTOR SHARE') {
      this.doctorSharePerList = [...check.data];
    } else if (app.name === 'EMERGENCY') {
      this.emergencyPerList = [...check.data];
    } else if (app.name === 'EMR SETTINGS') {
      this.emrSettingPerList = [...check.data];
    } else if (app.name === 'ENQUIRY DESK') {
      this.enqDeskPerList = [...check.data];
    } else if (app.name === 'INSURANCE') {
      this.insurancePerList = [...check.data];
    } else if (app.name === 'INVENTORY') {
      this.inventoryPerList = [...check.data];
    } else if (app.name === 'IPD') {
      this.ipdPerList = [...check.data];
    } else if (app.name === 'LABORATORY') {
      this.laboratoryPerList = [...check.data];
    } else if (app.name === 'NURSING') {
      this.nursingPerList = [...check.data];
    } else if (app.name === 'OPD') {
      this.opdPerList = [...check.data];
    } else if (app.name === 'OT') {
      this.otPerList = [...check.data];
    } else if (app.name === 'PHARMACY') {
      this.pharmaPerList = [...check.data];
    } else if (app.name === 'QMS') {
      this.qmsPerList = [...check.data];
    } else if (app.name === 'RADIOLOGY') {
      this.radiologyPerList = [...check.data];
    } else if (app.name === 'REGISTRATION') {
      this.registrationPerList = [...check.data];
    }
  }

  patchUserImageDataForEdit(ImageData): void {
    if (ImageData != null && ImageData.userImagePath !== '#') {
      this.imageUrl = ImageData.userImagePath + '?time=' + new Date().getTime();
    }
  }

  DefaultBasicInfoObject(): void {
    this.userRegistrationFrm = this.fb.group({
      id: [''],
      title: [''],
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      email_address: ['', [Validators.required, Validators.email]],
      login_id: ['', Validators.required],
      mobile_no: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
      // tslint:disable-next-line: max-line-length
      alternate_mobile_no: ['', [Validators.pattern(/^(1[ \-\+]{0,3}|\+1[ -\+]{0,3}|\+1|\+)?((\(\+?1-[2-9][0-9]{1,2}\))|(\(\+?[2-8][0-9][0-9]\))|(\(\+?[1-9][0-9]\))|(\(\+?[17]\))|(\([2-9][2-9]\))|([ \-\.]{0,3}[0-9]{2,4}))?([ \-\.][0-9])?([ \-\.]{0,3}[0-9]{2,4}){2,3}$/)]],
      // role_type: [null, Validators.required],
      // primary_role: [null, Validators.required],
      designation_type: [null, Validators.required],
      department: [null, Validators.required],
      speciality: [null],
      application_assigmentlist: this.fb.array([]),
      application_role_detail: this.fb.array([]),
      is_active: [true],
      user_gender: ['male', Validators.required],
      selectedEntity: [null],
      selectedServiceProvider: [null],
      selectedJointClinic: [null],
      user_image: [null],
      user_services: [''],
      education: [''],
      experience: ['', [Validators.pattern(/[0-9]/)]],
      aboutUser: [''],
      default_application: [null, Validators.required]
    });
    this.getApplicationList();
    this.getDeprtmentMaster().subscribe();
    // this.defaultApplicationRoleObject({ id: 1, name: 'QMS'});
  }

  defaultApplicationRoleObject(app): any {
    const list = this.rolesTypeUniqueList.filter(r => r.application_id === app.id);
    const applicationRoleObj = this.fb.group({
      application: [app, Validators.required],
      role_type: [null, Validators.required],
      primary_role: [null, Validators.required],
      primary_permission: [null],
      applicationRoleTypeList: [list],
      primaryRolesList: [],
    });
    (this.userRegistrationFrm.get('application_role_detail') as FormArray).push(applicationRoleObj);
    this.selectedApplication = this.userRegistrationFrm.get('application_role_detail').value[0];
  }

  get userRegistrationFrmCntrols(): any {
    return this.userRegistrationFrm.controls;
  }

  get allApplicationFrmCntrols(): FormArray {
    return this.userRegistrationFrm.get('application_assigmentlist') as FormArray;
  }

  get allApplicationRoleFrmCntrols(): FormArray {
    return this.userRegistrationFrm.get('application_role_detail') as FormArray;
  }
  get titlesFrmControles(): FormArray {
    return this.userRegistrationFrm.get('title') as FormArray;
  }

  applicationRoleType(rolesTypes: RoleType[], applicationId: number) {
    return _.filter(rolesTypes, (o) => o.application_id === applicationId);
  }


  AddUpdateUser(): void {
    this.submitted = true;
    this.onclickApplicationValid();
    if (this.userRegistrationFrm.valid && this.submitted) {
      const serviceProvider = [];
      // const jointClinicData = [];
      const formValue = this.userRegistrationFrm.value;
      let userObject;
      const applicationAssigmentlist = [];
      const selectedRoleId = [];
      const selectedDocId = [];
      const tempapplicationAssigmentlist = _.filter(formValue.application_assigmentlist, (o) => {
        return o.checked === true;
      });
      _.map(tempapplicationAssigmentlist, (o) => {
        applicationAssigmentlist.push(o.id);
      });
      _.map(this.secondaryRoleConfirmed, (o) => {
        selectedRoleId.push(o.id);
      });
      _.map(this.docAssignmentConfirmed, (o) => {
        selectedDocId.push(o.code);
      });
      if (formValue.selectedServiceProvider) {
        serviceProvider.push(formValue.selectedServiceProvider.id);
      }
      // if (formValue.selectedJointClinic != null) {
      //   jointClinicData.push(formValue.selectedJointClinic.id);
      // }
      const appList = this.userRegistrationFrm.get('application_role_detail').value;
      _.map(appList, d => {
        if (d.primary_permission) {
          d.primary_permission.id = d.primary_permission.permission_id;
          d.primary_permission.name = d.primary_permission.permission_name;
        }
      });
      userObject = {
        title_id: formValue.title,
        first_name: formValue.first_name,
        middle_name: formValue.middle_name,
        last_name: formValue.last_name,
        email: formValue.email_address,
        user_id: formValue.login_id,
        mobile_number: formValue.mobile_no,
        alternate_number: formValue.alternate_mobile_no,
        is_active: formValue.is_active,
        // role_type_id: formValue.role_type.id,
        // primary_role_id: formValue.primary_role.id,
        designation_id: formValue.designation_type.designationId,
        speciality_id: formValue.speciality ? formValue.speciality.id : '',
        department_id: formValue.department.id,
        applications: applicationAssigmentlist,
        additional_roles: selectedRoleId,
        assigned_doctors: selectedDocId,
        user_gender: formValue.user_gender,
        assigned_serviceprovider: serviceProvider,
        services_user: formValue.user_services,
        education: formValue.education,
        experience: formValue.experience,
        about_user: formValue.aboutUser,
        default_app_id: formValue.default_application,
        application_detail: appList
      };
      // in case of edit, editUserId will be user id
      if (this.editUserId) {
        userObject.id = this.editUserId;
        this.userService.updateUser(userObject).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.status_code === 200) {
            this.submitted = false;
            this.saveUserImage(res.id, formValue.user_image);
            userObject = this.generateLocalObject(userObject, formValue);
            if (this.isLoggedInUser) {
              this.userService.masterUserDetails['userDetails'] = {
                userdetail: userObject
              };
            }
            this.alertMsg = {
              message: 'User Updated Successfully.',
              messageType: 'success',
              duration: 3000
            };
            this.tempEditedObject = {
              tempEmail: '',
              tempMobileNumber: '',
              tempUserId: ''
            };
            if (this.isEditFromProfile) {
              this.userService.fromProfileUserEditFlag(false, userObject.id);
              this.redirectdefaulturl();
            } else {
              setTimeout(() => {
                const pageObject = this.userService.getEditedPageObject();
                this.router.navigate(['app/user/userList']);
              }, 500);
            }
            // this.clearForm();
          } else {
            this.alertMsg = {
              message: 'Something went Wrong',
              messageType: 'danger',
              duration: 3000
            };
          }
        });
      } else {
        this.userService.createUser(userObject).pipe(takeUntil(this.destroy$)).subscribe(res => {
          if (res.status_code === 200) {
            this.submitted = false;
            this.saveUserImage(res.id, formValue.user_image);
            userObject = this.generateLocalObject(userObject, formValue);
            this.alertMsg = {
              message: 'User Saved Successfully.',
              messageType: 'success',
              duration: 3000
            };
            setTimeout(() => {
              this.router.navigate(['app/user/userList']);
            }, 500);
            // this.clearForm();
          } else {
            this.alertMsg = {
              message: 'Something went Wrong',
              messageType: 'danger',
              duration: 3000
            };
          }
        });
      }
    }
  }
  redirectdefaulturl(): void {
    const url = this.commonService.getpreviousUrl() ? _.clone(this.commonService.getpreviousUrl())
      : this.commonService.redirectQmsAsPerRoleType();
    this.commonService.setpreviousUrl('');
    this.router.navigate([url]);
  }
  saveUserImage(userId, userImage) {
    if (userImage != null) {
      const formData: any = new FormData();
      formData.append('user_id', userId);
      formData.append('Image', userImage);
      this.userService.saveUserImage(formData).pipe(takeUntil(this.destroy$)).subscribe(UserImageres => {
        if (UserImageres.status_code === 200) {
          if (this.isLoggedInUser) {
            this.userService.masterUserDetails['userImage'] = null;
          }
        } else {
          this.alertMsg = {
            message: 'Something went Wrong',
            messageType: 'danger',
            duration: 3000
          };
        }
      });
    }
  }
  onclickApplicationValid(): void {
    const isError = (_.some(this.userRegistrationFrm.get('application_assigmentlist').value, r => r.checked === true));
    if (!isError) {
      this.userRegistrationFrm.get('application_assigmentlist').setErrors({ incorrect: true });
      this.defaultApplicationList = [];
      this.applicationRoleDataList = [];
      this.allApplicationRoleFrmCntrols.removeAt(0);
      this.selectedApplication = null;
      // return true;
    } else {
      this.userRegistrationFrm.get('application_assigmentlist').setErrors(null);
      this.setDefaultApplication();
      // return false;
    }
  }
  getApplicationList(): void {
    this.userService.getApplicationList().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.applicationList = res.applications;
      this.applicationList.map((o, i) => {
        const control = this.fb.group({
          id: o.id,
          name: o.name,
          checked: false
        });
        (this.userRegistrationFrm.get('application_assigmentlist') as FormArray).push(control);
      });
      // call to edit on condition
      // if (this.editUserId) {
      //   this.getEditUserData();
      // }
    });
  }

  setDefaultApplication(): void {
    _.forEach(this.userRegistrationFrm.value.application_assigmentlist, (o, k) => {
      if (o.checked) {
        o.checked = true;
        const obj = {
          id: o.id,
          name: o.name
        };
        const index = _.findIndex(this.defaultApplicationList, (d) => d.id === o.id);
        if (index === -1) {
          this.defaultApplicationList.push(obj);
          this.defaultApplicationRoleObject(o);
        }
      } else {
        const index = _.findIndex(this.defaultApplicationList, (d) => {
          return d.id === o.id;
        });
        if (index !== -1) {
          if (this.userRegistrationFrm.value.default_application === this.defaultApplicationList[index].id.toString()) {
            this.userRegistrationFrm.patchValue({ default_application: null });
          }
          this.defaultApplicationList.splice(index, 1);
          this.allApplicationRoleFrmCntrols.removeAt(index);
        }
      }
    });

    const appControls = this.allApplicationRoleFrmCntrols.controls;
    const selectedApps = _.filter(this.userRegistrationFrm.value.application_assigmentlist, (o) => {
      return o.checked === true && _.find(appControls, (v) => v.value.application.id === o.id);
    });
    const nonSelectedApps = _.filter(this.userRegistrationFrm.value.application_assigmentlist, (o) => o.checked === false);

    // Add Selected Apps


    // appControls[0].value.application.id

    // this.defaultApplicationRoleObject();
  }
  onGenderChangeGetTitle(gendertitile) {
    const titleObject = _.find(this.titleList, (rec) => rec.title === gendertitile);
    this.userRegistrationFrm.patchValue({ title: titleObject.title_id });
  }

  getTitleList(): Observable<any> {
    return this.compInstance.userService.getTitles().pipe(map(res => {
      this.titleList = res.titles;
      this.onclickApplicationValid();
      if (!this.editUserId) {
        const titleObject = _.find(this.titleList, (rec) => rec.title === 'MR');
        this.userRegistrationFrm.patchValue({ title: titleObject.title_id });
      }
      return this.titleList;
    }),
      catchError(error => [])
    );
  }
  getRoleTypes(): Observable<any> {
    return this.compInstance.userService.getRoleTypes().pipe(map(res => {
      this.rolesTypeList = res.role_types;
      this.rolesTypeUniqueList = _.uniq(res.role_types, 'id');
      return this.rolesTypeList;
    }),
      catchError(error => [])
    );
  }
  getDoctorCodeList(): Observable<any> {
    return this.compInstance.userService.getDoctorCodes().pipe(map(res => {
      this.doctorCodeList = res.doctor_codes;
      return res.doctor_codes;
    }),
      catchError(error => [])
    );
  }
  getPrimaryRoles(searchSt, role?, item?: FormGroup): Observable<any> {
    const selectedFormControl = item; // value.application.id
    const searchString = (!_.isUndefined(searchSt) && searchSt != null) ? searchSt : '';
    const params = {
      type: (role && role.id) ? role.id : 0,
      isPrimary: true
    };
    if (params.isPrimary && (role == null || _.isUndefined(role.id))) {
      return of([]);
    } else {
      return this.compInstance.userService.getPrimaryRoles(params).pipe(map(res => {
        let primaryRolesList = res.Roles;
        primaryRolesList = this.compInstance.globalSearchData.transform(primaryRolesList, searchString);
        if (selectedFormControl) {
          primaryRolesList = primaryRolesList.filter(p => p.application_id === item.value.application.id);
          selectedFormControl.patchValue({ primaryRolesList });
          return primaryRolesList;
        }
        return primaryRolesList;
      }),
        catchError(error => [])
      );
    }
  }
  getUserDesignation(searchSt): Observable<any> {
    const searchString = (!_.isUndefined(searchSt) && searchSt != null) ? searchSt : '';
    const params = {
      type: 0
    };
    return this.compInstance.userService.getUserDesignation(params).pipe(map(res => {
      this.designationList = res.userDesg;
      this.designationList = this.compInstance.globalSearchData.transform(this.designationList, searchString);
      return this.designationList;
    }),
      catchError(error => [])
    );
  }

  getspeciality(searchKey): Observable<any> {
    const searchString = (!_.isUndefined(searchKey) && searchKey != null) ? searchKey : '';
    const param = { search_string: searchString, limit: environment.limitDataToGetFromServer };
    return this.compInstance.userService.getSpecialities(param).pipe(map(res => {
      this.specialitiesList = res.specialties;
      // this.specialitiesList = this.compInstance.globalSearchData.transform(this.specialitiesList, param.search_string);
      return this.specialitiesList;
    }),
      catchError(error => [])
    );
  }

  selectRoleType(event, item: FormGroup): void {
    item.patchValue({ primary_role: null });
    this.getPrimaryRoles('', event, item).subscribe();
  }

  selectSpecialities(event): void {
    // this.userRegistrationFrm.patchValue({ speciality: event ? event : null });
    // (+this.userRegistrationFrm.value.role_type.id === 3) ?
    //   this.userRegistrationFrm.controls.speciality.setValidators(Validators.required) :
    //   this.userRegistrationFrm.controls.speciality.clearValidators();
    // this.userRegistrationFrm.controls.speciality.updateValueAndValidity();
  }

  clearForm(): void {
    this.DefaultBasicInfoObject();
    this.applicationList.map((o, i) => {
      const control = {
        id: o.id,
        name: o.name,
        checked: false
      };
      (this.userRegistrationFrm.get('application_assigmentlist') as FormArray).at(i).patchValue(control);
    });
    this.getTitleList().subscribe(res => {
      const titleObject = _.find(this.titleList, (rec) => rec.title === 'MR');
      this.userRegistrationFrm.patchValue({ title: titleObject.title_id });
      this.userRegistrationFrm.patchValue({ is_active: true });
    });
    this.tempEditedObject = {
      tempEmail: '',
      tempMobileNumber: '',
      tempUserId: ''
    };
    this.secondaryRoleConfirmed = [];
    this.docAssignmentConfirmed = [];
    this.onclickApplicationValid();
  }

  AddPrivileges(): void {
    this.roleKey = 'id';
    this.roleDisplay = 'name';
    this.roleSource = [];
    this.getSecondryRoles('').subscribe(res => {
      this.roleSource = res;
      this.roleSourceMaster = [...this.roleSource];
      this.onSelectedApplication(this.selectedApplication);
    });
  }

  getSecondryRoles(searchSt): Observable<any> {
    const searchString = (!_.isUndefined(searchSt) && searchSt != null) ? searchSt : '';
    const params = {
      type: 0,
      isPrimary: false
    };
    return this.compInstance.userService.getPrimaryRoles(params).pipe(map(res => {
      return res.Roles;
    }),
      catchError(error => [])
    );
  }
  AddDoctorAssignment(): void {
    this.docKey = 'code';
    this.docDisplay = 'name';
    this.getDoctorCodeList().subscribe(res => {
      this.docSource = res;
    });
  }
  loadTab(event): void {
    if (event === 'addPrivileges') {
      this.AddPrivileges();
    } else if (event === 'docAssigment') {
      this.AddDoctorAssignment();
    }
  }

  isLoginExist(userName): void {
    if (userName.value && !_.isUndefined(this.tempEditedObject) && this.tempEditedObject.tempUserId !== userName.value) {
      this.userService.isExistLogin(userName.value).subscribe(res => {
        if (res.message === 'Yes') {
          this.userRegistrationFrm.get('login_id').setErrors({ incorrect: true });
        } else {
          this.userRegistrationFrm.get('login_id').setErrors(null);
        }
      });
    }
  }

  isEmailExist(email): void {
    if (email.value && this.userRegistrationFrm.get('email_address').errors === null
      && !_.isUndefined(this.tempEditedObject) && this.tempEditedObject.tempEmail !== email.value) {
      this.userService.isExistEmail(email.value).subscribe(res => {
        if (res.message === 'Yes') {
          this.userRegistrationFrm.get('email_address').setErrors({ incorrect: true });
        } else {
          this.userRegistrationFrm.get('email_address').setErrors(null);
        }
      });
    }
  }

  isMobileNumberExist(mobileNumber): void {
    if (mobileNumber.value && this.userRegistrationFrm.get('mobile_no').errors === null
      && !_.isUndefined(this.tempEditedObject) && this.tempEditedObject.tempMobileNumber !== mobileNumber.value) {
      this.userService.isExistPhoneNumebr(mobileNumber.value).subscribe(res => {
        if (res.message === 'Yes') {
          this.userRegistrationFrm.get('mobile_no').setErrors({ incorrect: true });
        } else {
          this.userRegistrationFrm.get('mobile_no').setErrors(null);
        }
      });
    }
  }
  getDeprtmentMaster(): Observable<any> {
    // const searchString = (!_.isUndefined(searchKey) && searchKey != null) ? searchKey : '';
    return this.compInstance.userService.getDepartment().pipe(map(res => {
      this.departmentmasteList = res.Departments;
      // this.departmentmasteList = this.compInstance.globalSearchData.transform(this.departmentmasteList, searchString);
      return this.departmentmasteList;
    }),
      catchError(error => [])
    );
  }

  cancel(): void {
    if (this.editUserId) {
      this.loadConfirmationPopup();
    } else {
      this.router.navigate(['app/user/userList']);
    }
  }

  loadConfirmationPopup(): void {
    const modalTitleobj = 'Cancel';
    const modalBodyobj = 'Do you want to cancel?';
    const messageDetails = {
      modalTitle: modalTitleobj,
      modalBody: modalBodyobj
    };
    const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    modalInstance.result.then((result) => {
      if (result === 'Ok') {
        this.tempEditedObject = {
          tempEmail: '',
          tempMobileNumber: '',
          tempUserId: ''
        };
        if (this.isEditFromProfile) {
          this.redirectdefaulturl();
        } else {
          this.userService.fromProfileUserEditFlag(false, _.toNumber(this.editUserId));
          const pageObject = this.userService.getEditedPageObject();
          this.router.navigate(['app/user/userList', { data: JSON.stringify(pageObject) }]);
        }
      }
    });
    modalInstance.componentInstance.messageDetails = messageDetails;
  }

  onSectionChange(sectionId: string): void {
    this.currentSection = sectionId;
    this.boxShadow = true;
    switch (sectionId) {
      case 'section1':
        this.loadTab('addPrivileges');
        break;
      case 'section2':
        this.loadTab('addPrivileges');
        break;
      case 'section3':
        this.loadTab('docAssigment');
        break;
    }
  }

  scrollTo(section): void {
    document.querySelector('#' + section).scrollIntoView();
    this.onSectionChange(section);
  }

  getAllEntityList(): Observable<any> {
    return this.entityBasicInfoService.getAllEntityList().pipe(map(res => {
      if (res.length > 0) {
        this.entityList = _.filter(res, (d) => d.key === 'service_provider');
      }
      this.userRegistrationFrm.patchValue({
        selectedEntity: this.entityList[0]
      });
    }));
  }

  selectJointClinic(e, selectedControl): void {
    selectedControl.patchValue(e);
  }

  selectProvider(e, selectedControl): void {
    selectedControl.patchValue(e);
  }


  selectEntity(e, item): void {
    item.patchValue(e);
    this.updateValuesOnEntityChange(e ? e.key : '');
  }

  updateValuesOnEntityChange(key): void {
    if (key === 'service_provider') {
      this.getAllServiceProviderList();
    } else if (key === 'joint_clinic') {
      this.getAllJointClinicList();
    }
  }

  getAllServiceProviderList(searchKey?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
      id: this.userRegistrationFrm.value.selectedEntity ? this.userRegistrationFrm.value.selectedEntity.id : null,
      key: this.userRegistrationFrm.value.selectedEntity ? this.userRegistrationFrm.value.selectedEntity.key : null,
      specialityId: null
    };
    return this.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      if (res.length > 0) {
        this.serviceProviderList = res;
      } else {
        this.serviceProviderList = [];
        this.alertMsg = {
          message: 'no service provider data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    }));
  }

  getAllJointClinicList(searchKey?): void {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : '',
      id: this.userRegistrationFrm.value.selectedEntity.id,
      key: this.userRegistrationFrm.value.selectedEntity.key,
      specialityId: null
    };
    this.entityBasicInfoService.getAllServiceProviderList(params).subscribe(res => {
      if (res.length > 0) {
        this.jointClinicList = res;
      } else {
        this.jointClinicList = [];
        this.alertMsg = {
          message: 'Joint Clinic data not find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

  uploadFile(event): void {
    const reader = new FileReader(); // HTML5 FileReader API
    const file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        this.imageUrl = reader.result;
        this.userRegistrationFrm.patchValue({
          user_image: file
        });
      };
    }
  }

  generateLocalObject(userDetails, formValue): void {
    // userDetails.role_type = {
    //   role_type_id: userDetails.role_type_id,
    //   role_name: formValue.role_type.role_type
    // };
    // userDetails.primary_role = {
    //   primary_role_id: formValue.primary_role.id,
    //   primary_role_name: formValue.primary_role.name
    // };
    userDetails.designation_type = {
      desg_id: formValue.designation_type.designationId,
      desg_name: formValue.designation_type.designation
    };
    if (formValue.speciality) {
      userDetails.speciality = {
        speciality_id: formValue.speciality.id,
        specialty_name: formValue.speciality.name
      };
    }
    userDetails.department = {
      department_id: formValue.department.id,
      department_name: formValue.department.name
    };

    return userDetails;
  }

  private loadSpecialyList(searchTxt?) {
    this.specialityList$ = concat(
      this.getspeciality(searchTxt), // default items
      this.specialityListInput$.pipe(
        distinctUntilChanged(),
        // tap(() => this.doctorLoading = true),
        switchMap(term => this.getspeciality(term).pipe(
          catchError(() => of([])), // empty list on error
          // tap(() => this.doctorLoading = false)
        ))
      )
    );
  }

  onDefaultApplicationSelect(selectedApp): void {
    this.userRegistrationFrm.patchValue({ default_application: selectedApp });
  }

  // getRoleById(app): any {
  //   return this.compInstance.userService.getRoleById(app.id).pipe(map(res => {
  //     this.rolesTypeList = res.role_types;
  //     this.rolesTypeUniqueList = _.uniq(res.role_types, 'id');
  //     return this.rolesTypeList;
  //   }),
  //     catchError(error => [])
  //   );
  // }

  filterRolesTypesByAppId(item): void {
    this.rolesTypeList = this.rolesTypeUniqueList.filter(r => r.application_id === item.value.application.id);
  }

  getSelectedApplication(): Array<any> {
    const temp = this.allApplicationRoleFrmCntrols.value;
    // const indx = temp.findIndex(t => t.application.id === -1);
    // if (indx === -1) {
    //   temp.unshift({ application: { id: -1, name: 'All' } });
    // }
    return temp;
  }

  onSelectedApplication(event): void {
    this.selectedApplication = event;
    console.log(this.selectedApplication);
    if (event && event.application.id !== -1) {
      const typeId = event.role_type ? event.role_type.id : 0;
      this.roleSource = this.roleSourceMaster.filter(r => {
        return typeId ? (r.type_id === typeId) && (r.application_id === event.application.id) : r.application_id === event.application.id;
      });
    } else {
      if (this.defaultApplicationList.length) {
        let temp = [];
        this.defaultApplicationList.forEach(e => {
          temp = temp.concat(this.roleSourceMaster.filter(r => {
            return r.application_id === e.id;
          }));
        });
        this.roleSource = temp;
      } else {
        this.roleSource = [];
      }
    }
  }

  getPermissionListByApplication(searchKey?, appName?): Observable<any> {
    const params = {
      limit: environment.limitDataToGetFromServer,
      search_text: searchKey ? searchKey : null,
      id: this.userRegistrationFrm.value.selectedEntity ? this.userRegistrationFrm.value.selectedEntity.id : null,
      key: this.userRegistrationFrm.value.selectedEntity ? this.userRegistrationFrm.value.selectedEntity.key : null,
      specialityId: null
    };
    return this.entityBasicInfoService.getAllServiceProviderList(params).pipe(map(res => {
      if (res.length > 0) {
        this.serviceProviderList = res;
      } else {
        this.serviceProviderList = [];
        this.alertMsg = {
          message: 'no service provider data find',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    }));
  }
}

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegistrationComponent } from './user-registration.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DualListComponent } from 'angular-dual-listbox';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UsersService } from 'src/app/services/users.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { GlobalSearchDatPipe } from 'src/app/shared/pipes/global-search-dat.pipe';

describe('UserRegistrationComponent', () => {
  let component: UserRegistrationComponent;
  let fixture: ComponentFixture<UserRegistrationComponent>;
  let userServiceSpy;
  let router: Router;
  // tslint:disable-next-line: quotemark
  const titleList = [
    {
      title_id: 1,
      title: 'BRIG'
    },
    {
      title_id: 2,
      title: 'CAPT'
    },
    {
      title_id: 3,
      title: 'COL'
    }];
  const applicationList = [{ id: 5, name: 'DEPARTMENT' }, { id: 2, name: 'DMS' }];
  const roleTypeList = [{ id: 2, role_type: 'ADMIN' }, { id: 3, role_type: 'DOCTOR' }, { id: 4, role_type: 'NURSE' }];
  const doctorCodesList = [{ code: '1', name: 'SHREEPRASAD PRAMOD PATANKAR' }, { code: '2', name: 'GOVIND  DATAR' }];
  const specialityList = [{ speciality_name: 'ABDOMINAL TRANSPLANT AND HEPATIC SURGERY', id: '1' },
  { speciality_name: 'ANAESTHESIOLOGY', id: '2' }];
  const primaryRolesLists = [{ role_id: 6, role_name: 'Admin' },
  { role_id: 7, role_name: 'Operator' },
  { role_id: 8, role_name: 'Scanner' }];

  const editObject = {
    userdetail: {
      applications: [
        1
      ],
      assigned_doctors: [
        100014,
        90,
        197
      ],
      additional_roles: [
        6
      ],
      id: 42,
      title_id: 1,
      user_id: 'vb',
      first_name: 'Vishal',
      middle_name: null,
      last_name: 'B',
      mobile_number: '0828428340',
      alternate_number: '',
      email: 'vb@gmail.com',
      is_active: true,
      role_type: {
        role_type_id: 3,
        role_name: 'DOCTOR'
      },
      primary_role: {
        primary_role_id: 7,
        primary_role_name: 'Operator'
      },
      specialty: {
        speciality_id: 2,
        specialty_name: 'ANAESTHESIOLOGY'
      },
      department: {
        id: 2,
        name: 'ACADEMICS'
      }
    }
  };
  const addUserData = {
    id: '', title: 1,
    first_name: 'Akshay', middle_name: '', last_name: 'Kumar',
    email_address: 'testUser@gmail.com', login_id: '123456',
    mobile_no: '8149972785', alternate_mobile_no: '7298498327',
    role_type: { id: 2, role_type: 'ADMIN' }, primary_role: { role_id: 7, role_name: 'Operator' },
    speciality: { speciality_name: 'ANAESTHESIOLOGY', id: '2' },
    department: { id: 2, name: 'ACADEMICS' },
    application_assigmentlist: [{ id: 5, name: 'DEPARTMENT', checked: true },
    { id: 2, name: 'DMS', checked: true }, { id: 7, name: 'EMR', checked: false },
    { id: 3, name: 'HMIS', checked: false }, { id: 4, name: 'HR', checked: false },
    { id: 1, name: 'QMS', checked: false },
    { id: 6, name: 'REPORT', checked: false }], is_active: true, user_gender: 'Male'
  };

  const departmentmasterObject = {
    Departments: [
      {
        id: 1,
        name: 'ABDOMINAL TRANSPLANT AND HEPATIC SURGERY'
      },
      {
        id: 2,
        name: 'ACADEMICS'
      }]
  };
  class UserServiceSpy {
    getTitles = jest.fn().mockImplementation(() => {
      return of({ titles: titleList });
    });

    getApplicationList = jest.fn().mockImplementation(() => {
      return of({ applications: applicationList });
    });

    getRoleTypes = jest.fn().mockImplementation(() => {
      return of({ role_types: roleTypeList });
    });

    getDoctorCodes = jest.fn().mockImplementation(() => {
      return of({ doctor_codes: doctorCodesList });
    });

    getSpecialities = jest.fn().mockImplementation(() => {
      return of({ specialties: specialityList });
    });
    getDepartment = jest.fn().mockImplementation(() => {
      return of(departmentmasterObject);
    });

    getPrimaryRoles = jest.fn().mockImplementation(() => {
      return of({ Roles: primaryRolesLists });
    });
    getUserDataById = jest.fn().mockImplementation(() => {
      return of(editObject);
    });
    createUser = jest.fn().mockImplementation(() => {
      return of({ res: { status_code: 200 } });
    });

    updateUser = jest.fn().mockImplementation(() => {
      return of({ res: { status_code: 200 } });
    });

    isExistLogin = jest.fn().mockImplementation(() => {
      return of({ res: { message: 'No' } });
    });

    isExistEmail = jest.fn().mockImplementation(() => {
      return of({ res: { message: 'No' } });
    });

    isExistPhoneNumebr = jest.fn().mockImplementation(() => {
      return of({ res: { message: 'No' } });
    });

  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule, SharedModule],
      declarations: [DualListComponent, UserRegistrationComponent, GlobalSearchDatPipe],
      providers: [
        { provide: UsersService, useValue: {} }
      ]
    })
      // Override component's own provider
      .overrideComponent(UserRegistrationComponent, {
        set: {
          providers: [
            { provide: UsersService, useClass: UserServiceSpy }, GlobalSearchDatPipe
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRegistrationComponent);
    component = fixture.componentInstance;
    userServiceSpy = fixture.debugElement.injector.get(UsersService) as any;
    router = TestBed.get(Router);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
  it('should call on edit ngOnInit', () => {
    component.editUserId = '9';
    component.ngOnInit();
    component.getTitleList().subscribe();
    expect(component.titleList.length).toBeGreaterThan(0);
  });

  it('should call ngOnInit', () => {
    component.editUserId = '';
    component.ngOnInit();
    expect(component.userRegistrationFrm.valid).toBeFalsy();
  });

  it('should get DefaultBasicInfoObject', () => {
    component.DefaultBasicInfoObject();
    expect(component.userRegistrationFrm.valid).toBeFalsy();
  });
  it('should get TitleList', () => {
    component.getTitleList().subscribe();
    expect(component.titleList.length).toBeGreaterThan(0);
  });

  it('should get applicationList', () => {
    component.applicationList = [];
    component.getApplicationList();
    expect(component.applicationList.length).toBeGreaterThan(0);
  });

  it('should get RoleTypeList', () => {
    component.rolesTypeList = [];
    component.DefaultBasicInfoObject();
    component.getRoleTypes().subscribe();
    expect(component.rolesTypeList.length).toBeGreaterThan(0);
  });

  it('should get DoctorCodesList', () => {
    component.doctorCodeList = [];
    component.getDoctorCodeList().subscribe();
    expect(component.doctorCodeList.length).toBeGreaterThan(0);
  });

  it('should get PrimaryRoles', () => {
    component.primaryRolesList = [];
    component.DefaultBasicInfoObject();
    component.getPrimaryRoles('', false).subscribe();
    expect(component.primaryRolesList.length).toBeGreaterThan(0);
  });
  it('should get specialityList', () => {
    component.specialitiesList = [];
    component.DefaultBasicInfoObject();
    component.getspeciality('').subscribe();
    expect(component.specialitiesList.length).toBeGreaterThan(0);
  });

  it('should get departmentList', () => {
    component.departmentmasteList = [];
    component.DefaultBasicInfoObject();
    component.getDeprtmentMaster().subscribe();
    expect(component.departmentmasteList.length).toBeGreaterThan(0);
  });

  it('should get GetUserDataForEdit', () => {
    component.DefaultBasicInfoObject();
    component.getEditUserData();
    component.patchFormDataForEdit(editObject.userdetail);
    component.getTitleList().subscribe(res => {
      component.userRegistrationFrm.patchValue(editObject.userdetail);
    });
    // expect(component.userRegistrationFrm.value.user_id).toEqual('vb');
    expect(component.userRegistrationFrm.value.application_assigmentlist.length).toBeGreaterThan(0);
    expect(component.secondaryRoleConfirmed.length).toBeGreaterThan(0);
    expect(component.docAssignmentConfirmed.length).toBeGreaterThan(0);
  });

  it('should add User', () => {
    component.DefaultBasicInfoObject();
    component.userRegistrationFrm.patchValue(addUserData);
    component.submitted = true;
    component.editUserId = '';
    component.AddUpdateUser();
    component.clearForm('basicInfo');
    component.getTitleList().subscribe();
    expect(component.userRegistrationFrm.valid).toBeFalsy();
  });

  it('should Edit User', () => {
    component.DefaultBasicInfoObject();
    component.userRegistrationFrm.patchValue(addUserData);
    component.submitted = true;
    component.editUserId = '4';
    component.AddUpdateUser();
    component.clearForm('basicInfo');
    component.getTitleList().subscribe();
    expect(component.userRegistrationFrm.valid).toBeFalsy();
  });

  it('should clearForm', () => {
    component.DefaultBasicInfoObject();
    component.clearForm('basicInfo');
    component.getApplicationList();
    component.getTitleList().subscribe();
    expect(component.userRegistrationFrm.valid).toBeFalsy();

    component.clearForm('additionalPrivileges');
    expect(component.secondaryRoleConfirmed.length).toEqual(0);

    component.clearForm('doctorAssignment');
    expect(component.docAssignmentConfirmed.length).toEqual(0);
  });

  it('should call LoadTab add priviliges', () => {
    component.DefaultBasicInfoObject();
    const eventPrivi = 'addPrivileges';
    component.loadTab(eventPrivi);
    // component.onclickApplicationValid();
    component.AddPrivileges();
    component.getPrimaryRoles('', false);
    expect(component.roleSource.length).toBeGreaterThan(0);

    const eventDoc = 'docAssigment';
    component.loadTab(eventDoc);
    component.AddDoctorAssignment();
    component.getDoctorCodeList();
    expect(component.docSource.length).toBeGreaterThan(0);
  });

  it('should call selectRoleType', () => {
    component.DefaultBasicInfoObject();
    component.selectRoleType('');
    expect(component.userRegistrationFrm.value.role_type).toBeNull();
  });

  it('should call selectPrimaryRole', () => {
    component.DefaultBasicInfoObject();
    component.selectPrimaryRole('');
    expect(component.userRegistrationFrm.value.primary_role).toEqual('');
  });

  it('should call selectSpecialities', () => {
    component.DefaultBasicInfoObject();
    component.selectSpecialities('');
    expect(component.userRegistrationFrm.value.speciality).toBeNull();
  });

  it('should call selectDepartment', () => {
    component.DefaultBasicInfoObject();
    component.selectDepartment('');
    expect(component.userRegistrationFrm.value.department).toBeNull();
  });

  it('should call onclickApplicationValid', () => {
    component.DefaultBasicInfoObject();
    component.onclickApplicationValid();
    expect(component.onclickApplicationValid).toBeTruthy();
  });

  it('should check isExistLoginId', () => {
    const object = {value : 'ABC'};
    component.tempEditedObject = {
      tempEmail: '',
      tempMobileNumber: '',
      tempUserId: ''
    };
    component.DefaultBasicInfoObject();
    component.isLoginExist(object);
    expect(component.userRegistrationFrm.controls.login_id.errors).toEqual(null);
  });
  it('should check isEmailExist', () => {
    const object = {value : 'ABC'};
    component.tempEditedObject = {
      tempEmail: '',
      tempMobileNumber: '',
      tempUserId: ''
    };
    component.DefaultBasicInfoObject();
    component.isEmailExist(object);
    expect(component.userRegistrationFrm.controls.email_address.errors).toEqual(null);
  });
  it('should check isMobileNumberExist', () => {
    const object = {value : 'ABC'};
    component.tempEditedObject = {
      tempEmail: '',
      tempMobileNumber: '',
      tempUserId: ''
    };
    component.DefaultBasicInfoObject();
    component.isMobileNumberExist(object);
    expect(component.userRegistrationFrm.controls.mobile_no.errors).toEqual(null);
  });

});

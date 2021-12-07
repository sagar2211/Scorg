import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UsersService } from 'src/app/services/users.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalSearchDatPipe } from 'src/app/shared/pipes/global-search-dat.pipe';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let usersServiceSpy;
  let authServiceSpy;


  const masterUserList = {
    user_list: [
      {
        name: 'gaurav', user_id: 1, email: 'gaurav@gmail.com', role_name: 'doctor',
        mobile_number: 9856231419, is_active: true, status: 'Active', created_on: '18 / 10 / 2018'
      },
      {
        name: 'drauto', user_id: 2, email: 'drauto@gmail.com',
        role_name: 'Admin', mobile_number: 9856231259, is_active: true,
        status: 'Inactive', created_on: '18 / 10 / 2018'
      },
      {
        name: 'Saroj',
        user_id: 3,
        email: 'sroj@gmail.com',
        role_name: 'Super Admin',
        mobile_number: 98562111459,
        is_active: true,
        status: 'Active',
        created_on: '18 / 10 / 2018'
      },
    ]
  };

  const deleteSuccessResponse = {
    id: 3,
    status_code: '200',
    status_message: 'Success',
    message: ''
  };

  const forcelogoutSuccessResponse = {
    status_code: '200',
    status_message: 'Success',
    message: ''
  };

  const roleTypeList = [{ id: 2, role_type: 'ADMIN' }, { id: 3, role_type: 'DOCTOR' }, { id: 4, role_type: 'NURSE' }];
  const primaryRolesLists = [{ role_id: 6, role_name: 'Admin' },
  { role_id: 7, role_name: 'Operator' },
  { role_id: 8, role_name: 'Scanner' }];
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
  class UsersServiceSpy {
    getUserList = jest.fn().mockImplementation(() => {
      return of(masterUserList);
    });

    deleteUserById = jest.fn().mockImplementation(() => {
      return of(deleteSuccessResponse);
    });

    getRoleTypes = jest.fn().mockImplementation(() => {
      return of({ role_types: roleTypeList });
    });
    getPrimaryRoles = jest.fn().mockImplementation(() => {
      return of({ Roles: primaryRolesLists });
    });
    getDepartment = jest.fn().mockImplementation(() => {
      return of(departmentmasterObject);
    });
  }

  class AuthServiceSpy {
    forceLogout = jest.fn().mockImplementation(() => {
      return of(forcelogoutSuccessResponse);
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NgbModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [UserListComponent, GlobalSearchDatPipe],
      providers: [{
        provide: UsersService, useValue: {}
      }, {
        provide: AuthService, useValue: {}
      }]
    })
      // Override component's own provider
      .overrideComponent(UserListComponent, {
        set: {
          providers: [
            { provide: UsersService, useClass: UsersServiceSpy },
            { provide: AuthService, useClass: AuthServiceSpy }, GlobalSearchDatPipe
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    usersServiceSpy = fixture.debugElement.injector.get(UsersService) as any;
    authServiceSpy = fixture.debugElement.injector.get(AuthService) as any;
    // fixture.detectChanges();
    // router = TestBed.get(Router);
    // location = TestBed.get(Location);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should call get ngOnit', () => {
    component.ngOnInit();
    component.defaultObject();
    expect(component.page.size).toEqual(15);
  });

  it(' should call get getUserList', () => {
    component.defaultObject();
    component.getUserList();
    component.clearForm();
    expect(component.usersList.length).toBeGreaterThan(0);
  });

  it(' should call get onFooterPage', () => {
    component.defaultObject();
    component.onFooterPage({page : 1});
    expect(component.page.pageNumber).toEqual(1);
    component.getUserList();
    component.clearForm();
    expect(component.usersList.length).toBeGreaterThan(0);
  });

  it(' should call get onPageSizeChanged', () => {
    component.defaultObject();
    component.onPageSizeChanged(10);
    expect(component.page.size).toEqual(10);
    component.getUserList();
    component.clearForm();
    expect(component.usersList.length).toBeGreaterThan(0);
  });

  it(' should call get deleteUserById', () => {
    const obj = { user_id: '1' };
    component.defaultObject();
    component.getUserList();
    component.deleteUserById(obj);
    expect(component.alertMsg.messageType).toEqual('success');
  });

  it('should get RoleTypeList', () => {
    component.rolesTypeList = [];
    component.getRoleTypes().subscribe();
    expect(component.rolesTypeList.length).toBeGreaterThan(0);
  });

  it(' should call get forcelogout', () => {
    const obj = { user_id: '1' };
    component.forcelogout(obj);
    expect(component.alertMsg.messageType).toEqual('success');
  });

  test('Should open Resete password popup', () => {
    expect(component._modalService.hasOpenModals()).toBeFalsy();
    component.resetPassword('');
    expect(component._modalService.hasOpenModals()).toBeTruthy();
  });

  test('Should open loadConfirmation popup', () => {
    expect(component._modalService.hasOpenModals()).toBeFalsy();
    component.loadConfirmationPopup('', '');
    expect(component._modalService.hasOpenModals()).toBeTruthy();
  });

  it('should call selectRoleType', () => {
    component.defaultObject();
    component.selectRoleType('');
    expect(component.userListFilterForm.value.role_type).toBeNull();
  });

  it(' should call get onSortChanged', () => {
    const obj = {
      sorts: [
        { dir: 'asc', prop: 'name' }
      ]
    };
    component.defaultObject();
    component.onSortChanged(obj);
    expect(component.sortUserList.sort_column).toEqual('name');
    component.getUserList();
    component.clearForm();
    expect(component.usersList.length).toBeGreaterThan(0);
  });

  it('should call selectPrimaryRole', () => {
    component.defaultObject();
    component.selectPrimaryRole('');
    expect(component.userListFilterForm.value.primary_role).toBeNull();
  });

  it('should call selectDepartment', () => {
    component.defaultObject();
    component.selectDepartment('');
    expect(component.userListFilterForm.value.department).toBeNull();
  });

  it('should get PrimaryRoles', () => {
    component.primaryRolesList = [];
    component.defaultObject();
    component.getPrimaryRoles(false).subscribe();
    expect(component.primaryRolesList.length).toBeGreaterThan(0);
  });

  it('should get departmentList', () => {
    component.departmentmasteList = [];
    component.defaultObject();
    component.getDeprtmentMaster().subscribe();
    expect(component.departmentmasteList.length).toBeGreaterThan(0);
  });

});

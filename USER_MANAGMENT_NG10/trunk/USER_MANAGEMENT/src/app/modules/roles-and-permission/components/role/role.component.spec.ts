import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleComponent } from './role.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsersService } from 'src/app/services/users.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';

describe('RoleComponent', () => {
  let component: RoleComponent;
  let usersServiceSpy;
  let childcomponent;
  let fixture: ComponentFixture<RoleComponent>;
  let childFixture: ComponentFixture<DatatableComponent>;

  const roleLists = [
    {
      is_active: true,
      id: 6,
      isPrimary: true,
      name: 'Admin',
      type_id: 1,
      type_name: 'SUPER ADMIN'
    }
  ];
  const saveObject = {
    is_active: true,
    role_id: 0,
    role_is_primary: true,
    role_name: 'super role',
    role_type: { id: 1, role_type: 'SUPER ADMIN' }
  };
  const responseObject = {
    id: 19,
    message: 'A new resource was successfully created.',
    status_code: 200,
    status_message: 'Success',
    masterRoelList: roleLists
  };
  const deleteObject = {
    id: 19,
    message: 'A new resource was successfully created.',
    status_code: 200,
    status_message: 'Success',
    masterRoelList: []
  };
  const roleTypeList = [{ id: 2, role_type: 'ADMIN' }, { id: 3, role_type: 'DOCTOR' }, { id: 4, role_type: 'NURSE' }];
  const primaryRolesLists = [{ role_id: 6, role_name: 'Admin' },
  { role_id: 7, role_name: 'Operator' },
  { role_id: 8, role_name: 'Scanner' }];
  class UsersServiceSpy {
    getRoleMasterList = jest.fn().mockImplementation(() => {
      return of(roleLists);
    });
    getRoleTypes = jest.fn().mockImplementation(() => {
      return of({ role_types: roleTypeList });
    });

    createRole = jest.fn().mockImplementation(() => {
      return of(responseObject);
    });
    isExistRoleName = jest.fn().mockImplementation(() => {
      return of({ res: { message: 'Yes' } });
    });

    deleteRoleById = jest.fn().mockImplementation(() => {
      return of(deleteObject);
    });
    getPrimaryRoles = jest.fn().mockImplementation(() => {
      return of({ Roles: primaryRolesLists });
    });

    roleMasterList = roleLists;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NgbModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [RoleComponent],
      providers: [{
        provide: UsersService, useValue: {}
      }]
    })
      .overrideComponent(RoleComponent, {
        set: {
          providers: [
            { provide: UsersService, useClass: UsersServiceSpy }
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleComponent);
    childFixture = TestBed.createComponent(DatatableComponent);
    childcomponent = childFixture.componentInstance;
    component = fixture.componentInstance;
    usersServiceSpy = fixture.debugElement.injector.get(UsersService) as any;
  });

  it('should call ngOnInit', () => {
    component.ngOnInit();
    component.defaultObject();
    component.getRoleList();
    expect(component.roleList.length).toBeGreaterThan(0);
  });
  it('should call onPageSizeChanged', () => {
    component.page = {
      size: 0, // The number of elements in the page
      totalElements: 0, // The total number of elements
      totalPages: 0, // The total number of pages
      pageNumber: 0, // The current page number
    };
    component.onPageSizeChanged(10);
    expect(component.page.size).toEqual(10);
  });
  it('should call editRole', () => {
    component.defaultObject();
    component.table = childcomponent;
    component.datatableBodyElement = component.table.element.children[0];
    component.editRole(roleLists[0]);
    expect(component.createRoleForm.valid).toBeTruthy();
  });

  it('should call getRoleTypes', () => {
    component.getRoleTypes().subscribe();
    expect(component.rolesTypeList.length).toBeGreaterThan(0);
  });

  it('should call selectRoleType', () => {
    component.defaultObject();
    component.selectRoleType('');
    expect(component.createRoleForm.value.role_type).toEqual(null);
  });

  it('should call deleteRoleById', () => {
    component.roleList = roleLists;
    component.deleteRoleById(roleLists[0]);
    expect(component.roleList.length).toEqual(0);
  });
  it('should call cancel', () => {
    component.table = childcomponent;
    component.datatableBodyElement = component.table.element.children[0];
    component.defaultObject();
    component.cancel();
    expect(component.createRoleForm.valid).toBeFalsy();
  });

  it('should call AddUpdateRole', () => {
    component.getRoleList();
    component.defaultObject();
    component.createRoleForm.patchValue(saveObject);
    // component.ngAfterViewInit();
    component.table = childcomponent;
    component.datatableBodyElement = component.table.element.children[0];
    component.AddUpdateRole();
    component.cancel();
    expect(component.createRoleForm.valid).toBeFalsy();
  });

  it('Should open delete Confirmation popup', () => {
    expect(component.modalService.hasOpenModals()).toBeFalsy();
    saveObject.role_id = 10;
    component.deleteConfirmationPopup(saveObject);
    expect(component.modalService.hasOpenModals()).toBeTruthy();
  });

  it('Should call isRoleNameExist', () => {
    component.tempEditedObject.roleName = '';
    const object = { value: 'ABC' };
    component.defaultObject();
    component.isRoleNameExist(object);
    expect(component.createRoleForm.valid).toBeFalsy();
  });
  it('should call clearSearchFilter', () => {
    component.defaultObject();
    component.table = childcomponent;
    component.clearSearchFilter();
    expect(component.roleList.length).toBeGreaterThan(0);
  });

  it('should call addTableBodyHeight', () => {
    component.table = childcomponent;
    component.datatableBodyElement = component.table.element.children[0];
    component.addTableBodyHeight();
    expect(component.tempEditedObject.roleName).toEqual('');
  });
  it('should get PrimaryRoles', () => {
    component.primaryRolesList = [];
    component.defaultObject();
    component.compInstance.roleListFilterForm.value.role_type = { id: 1 };
    component.getPrimaryRoles().subscribe();
    expect(component.primaryRolesList.length).toBeGreaterThan(0);
  });
  it('should get UpdateFilter', () => {
    component.defaultObject();
    component.table = childcomponent;
    component.datatableBodyElement = component.table.element.children[0];
    const event = { target: { value: 'Admin' } };
    component.updateFilter(event);
    expect(component.roleList.length).toBeGreaterThan(0);
  });
  it('should get PrimaryRoles', () => {
    component.showSearchFilter();
    expect(component.showRoleFilter).toEqual(true);
  });
  it('should call customeRoleFilter', () => {
    component.defaultObject();
    component.table = childcomponent;
    component.datatableBodyElement = component.table.element.children[0];
    component.compInstance.roleListFilterForm.value.role_type = { id: 1 };
    component.compInstance.roleListFilterForm.value.role = { id: 6 };
    component.compInstance.roleListFilterForm.value.status = 'true';
    component.customeRoleFilter();
    expect(component.roleList.length).toBeGreaterThan(0);
  });
});

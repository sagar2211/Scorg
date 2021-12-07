import {ComponentFixture, TestBed } from '@angular/core/testing';
import { MappedDoctorListComponent } from './mapped-doctor-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsersService } from 'src/app/services/users.service';
import { DoctorMappingService } from 'src/app/services/doctor-mapping.service';
import { of } from 'rxjs';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { DoctorMappingEditComponent } from '../doctor-mapping-edit/doctor-mapping-edit.component';
describe('MappedDoctorListComponent', () => {
  let component: MappedDoctorListComponent;
  let fixture: ComponentFixture<MappedDoctorListComponent>;
  let usersServiceSpy;
  let doctorMappingServiceSpy;
  const data = {
    doctor_mapping_list: [
      {
        id: 18,
        user_id: 132,
        user_name: 'ANAND VITHAL NIGUDKAR',
        mapped_user: [
          {
            mapped_id: 18,
            mapped_user_id: 87,
            mapped_user_name: 'ASHISH X KHANIJO',
            mapping_from_date: null,
            mapping_to_date: null,
            is_active: true
          }
        ]
      },
      {
        id: 15,
        user_id: 61,
        user_name: 'BHAGYASHREE SUBODH SHIVDE',
        mapped_user: [
          {
            mapped_id: 15,
            mapped_user_id: 158,
            mapped_user_name: 'DILEEP GANESH DEODHAR',
            mapping_from_date: '2019-09-25T18:30:00',
            mapping_to_date: '2019-09-27T18:30:00',
            is_active: true
          }
        ]
      },
      {
        id: 19,
        user_id: 146,
        user_name: 'DINESH AJINATH DEOKAR',
        mapped_user: [
          {
            mapped_id: 19,
            mapped_user_id: 54,
            mapped_user_name: 'AMIT MANOHAR PATIL',
            mapping_from_date: null,
            mapping_to_date: null,
            is_active: true
          }
        ]
      }
    ],
    total_records: 0,
    status_code: 200,
    status_message: 'Success',
    message: 'The request was successfully completed.'
  };

  const doctorList = {
    doctorList: [
      {
        id: 1,
        name: 'SHREEPRASAD PRAMOD PATANKAR'
      },
      {
        id: 2,
        name: 'GOVIND DATAR'
      },
      {
        id: 3,
        name: 'SUNEEL SURESH GODBOLE'
      }
    ]
  };
  class DoctorMappingServiceSpy {
    getDoctorMappingList = jest.fn().mockImplementation(() => {
      return of(data);
    });

    getDoctors = jest.fn().mockImplementation(() => {
      return of(doctorList);
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NgbModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [MappedDoctorListComponent, DoctorMappingEditComponent],
      providers: [{
        provide: UsersService, useValue: {}
      }, {
        provide: DoctorMappingService, useValue: {}
      }]
    })
     // Override component's own provider
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [ DoctorMappingEditComponent] } })
      .overrideComponent(MappedDoctorListComponent, {
        set: {
          providers: [
            { provide: DoctorMappingService, useClass: DoctorMappingServiceSpy }
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MappedDoctorListComponent);
    component = fixture.componentInstance;
    usersServiceSpy = fixture.debugElement.injector.get(UsersService) as any;
    doctorMappingServiceSpy = fixture.debugElement.injector.get(DoctorMappingService) as any;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call get ngOnit', () => {
    component.ngOnInit();
    component.defaultObject();
    console.log('component.page', component.page);
    expect(component.page.size).toEqual(15);
  });
  it(' should call get getDoctorMappingList', () => {
    component.defaultObject();
    component.getDoctorMapplingList();
    expect(component.doctorMappingList.length).toBeGreaterThan(0);
  });

  it(' should call get onPageSizeChanged', () => {
    component.defaultObject();
    component.onPageSizeChanged(15);
    expect(component.page.size).toEqual(15);
    component.getDoctorMapplingList();
    expect(component.doctorMappingList.length).toBeGreaterThan(0);
  });

  it(' should call get onPageChanged', () => {
    component.defaultObject();
    component.onPageChanged({ page: 1 });
    expect(component.page.pageNumber).toEqual(1);
    component.getDoctorMapplingList();
    expect(component.doctorMappingList.length).toBeGreaterThan(0);
  });

  it(' should call get onPageSizeChanged', () => {
    component.defaultObject();
    component.onPageSizeChanged(15);
    expect(component.page.size).toEqual(15);
    component.getDoctorMapplingList();
    expect(component.doctorMappingList.length).toBeGreaterThan(0);
  });
  it('should call onSerchByFilter', () => {
    component.defaultObject();
    component.onSerchByFilter();
    expect(component.showFilter).toEqual(false);
    expect(component.page.pageNumber).toEqual(1);
    component.getDoctorMapplingList();
    expect(component.doctorMappingList.length).toBeGreaterThan(0);
  });

  it(' should call get onSortChanged', () => {
    const obj = {
      sorts: [
        { dir: 'asc', prop: 'name' }
      ]
    };
    component.defaultObject();
    component.onSortChanged(obj);
    expect(component.sortDoctorMappingList.sort_column).toEqual('user_name');
    component.getDoctorMapplingList();
    expect(component.doctorMappingList.length).toBeGreaterThan(0);
  });

  it('should get getDoctorList', () => {
    component.filterDoctorList = [];
    component.getDoctorList();
    expect(component.filterDoctorList.length).toBeGreaterThan(0);
  });

  it('should get editDoctorMappingBYID', () => {
    const row = {
      id: 11,
      doctorId: 193,
      doctorName: 'ADITI MANISH DASTANE',
      mappingListDetails: [
          {
              mappedId: 11,
              mapdoctorId: 90,
              mapdoctorName: 'ADVAIT ANIRUDDHA KOTHURKAR',
              fromDate: '2019-09-26T00:00:00',
              toDate: '2019-09-28T00:00:00',
              isActive: true,
              isExpiry: false
          }
      ]
  };
    const mappedrow = {
    mappedId: 11,
    mapdoctorId: 90,
    mapdoctorName: 'ADVAIT ANIRUDDHA KOTHURKAR',
    fromDate: '2019-09-26T00:00:00',
    toDate: '2019-09-28T00:00:00',
    isActive: true,
    isExpiry: false
};
    expect(component._modalService.hasOpenModals()).toBeFalsy();
    component.editDoctorMappingBYID(row, mappedrow);
    expect(component._modalService.hasOpenModals()).toBeTruthy();
  });

  it(' should call get onSelectDoctorList', () => {
    component.defaultObject();
    component.getDoctorList();
    component.doctorMappingFilterForm.patchValue({
      doctorDetails: {id: 1, name: 'SHREEPRASAD PRAMOD PATANKAR'},
      mappedDoctorDetails: null,
      fromDate: null,
      toDate: null,
      status: ''
    });
    component.onSelectDoctorList();
    expect(component.mappaedDoctorList.length).toBeLessThan(component.filterDoctorList.length);
  });
  it(' should call get onSelectMappedDoctorList', () => {
    component.defaultObject();
    component.getDoctorList();
    component.doctorMappingFilterForm.patchValue({
      doctorDetails: null,
      mappedDoctorDetails: {id: 1, name: 'SHREEPRASAD PRAMOD PATANKAR'},
      fromDate: null,
      toDate: null,
      status: ''
    });
    component.onSelectMappedDoctorList();
    expect(component.doctorList.length).toBeLessThan(component.filterDoctorList.length);
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMappingComponent } from './doctor-mapping.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsersService } from 'src/app/services/users.service';
import { DoctorMappingService } from 'src/app/services/doctor-mapping.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DoctorSearchComponent } from '../doctor-search/doctor-search.component';
import { of } from 'rxjs';

describe('DoctorMappingComponent', () => {
  let component: DoctorMappingComponent;
  let fixture: ComponentFixture<DoctorMappingComponent>;
  let usersServiceSpy;
  let docMapServiceSpy;
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
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const docMapDetails = [{
    id: 1,
    doctorName: 'abc',
    doctorId: 12,
    mappingListDetails: [
      {
        mappedId: 1,
        mapdoctorId: 2,
        mapdoctorName: 'xyz',
        fromDate: today,
        toDate: tomorrow,
        isActive: true,
        isExpiry: false
      }
    ]
  }];

  const doctorList = {
    doctorList: [{
      doctor_id: 197,
      doctor_name: 'A G HUPRIKAR'
    }, {
      doctor_id: 225,
      doctor_name: 'AARATI SAMEER DESAI'
    }
    ]
  };

  const saveEditObject = {
    id: 14,
    detailId: 10,
    status_code: 200,
    status_message: 'Success',
    message: 'A new resource was successfully created.'
  };

  class UsersServiceSpy {
    getDepartment = jest.fn().mockImplementation(() => {
      return of(departmentmasterObject);
    });
  }

  class DocMapServiceSpy {
    getDoctorList = jest.fn().mockImplementation(() => {
      return of(doctorList);
    });

    getDoctorMappingDetails = jest.fn().mockImplementation(() => {
      return of({ doctormappinglist: docMapDetails });
    });

    saveDoctorMapping = jest.fn().mockImplementation(() => {
      return of(saveEditObject);
    });

    updateDoctorMapping = jest.fn().mockImplementation(() => {
      return of(saveEditObject);
    });
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [DoctorMappingComponent, DoctorSearchComponent],
      providers: [
        { provide: UsersService, useValue: {} },
        { provide: DoctorMappingService, useValue: {} },
      ]
    })
      .overrideComponent(DoctorMappingComponent, {
        set: {
          providers: [
            { provide: UsersService, useClass: UsersServiceSpy },
            { provide: DoctorMappingService, useClass: DocMapServiceSpy },
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    usersServiceSpy = fixture.debugElement.injector.get(UsersService) as any;
    docMapServiceSpy = fixture.debugElement.injector.get(DoctorMappingService) as any;
  });

  it('should call ngOnInit', () => {
    component.ngOnInit();
    expect(component.doctorMapForm.valid).toBeTruthy();
  });
  it('should call getDoctorSearchResult', () => {
    // const flag = 'select_doctor';
    component.defaultDocForm();
    const docObject = { doctor: { id: '1', name: 'abc' }, department: { id: '1', name: 'abc' } };
    component.getDoctorSearchResult('select_doctor', docObject);
    expect(component.doctorMappingDetails.mappingListDetails.length).toBeGreaterThan(0);

    component.getDoctorSearchResult('map_doctor', docObject);
    expect(component.doctorMapForm.value.mapDoctor.id).toEqual('1');

    component.getDoctorSearchResult('', docObject);
    expect(component.doctorMapForm.valid).toBeTruthy();
  });

  it('toggleOnChange on change', () => {
    const object = {
        mappedId: 1,
        mapdoctorId: 2,
        mapdoctorName: 'xyz',
        fromDate: today,
        toDate: tomorrow,
        isActive: true,
        isExpiry: false
    };
    const docObject = { doctor: { id: '1', name: 'abc' }, department: { id: '1', name: 'abc' } };
    component.getDoctorSearchResult('select_doctor', docObject);
    component.toggleOnChange(object);
    expect(component.updateDoctorMapFlag).toBeFalsy();
  });
});


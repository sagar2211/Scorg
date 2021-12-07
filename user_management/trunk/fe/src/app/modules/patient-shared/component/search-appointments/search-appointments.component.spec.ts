import { EntitityCommonDataService } from '../../../schedule/services/entitity-common-data.service';
import { EntityBasicInfoService } from '../../../schedule/services/entity-basic-info.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAppointmentsComponent } from './search-appointments.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import * as moment from "moment";
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';

describe('SearchAppointmentsComponent', () => {
  let component: SearchAppointmentsComponent;
  let fixture: ComponentFixture<SearchAppointmentsComponent>;

  const appointmentTypeList = [{ Appt_id: 7, Appt_Name: 'DENTISTS' }, { Appt_id: 3, Appt_Name: 'EMERGENCY' }];
  const entityList = [
    {
      entity_name: 'DOCTOR',
      entity_alias: 'DOCTOR',
      entity_id: 2
    },
    {
      entity_name: 'JOINT CLINIC',
      entity_alias: 'JOINT_CLINIC',
      entity_id: 3
    },
    {
      entity_name: 'SERVICE PROVIDER',
      entity_alias: 'SERVICE_PROVIDER',
      entity_id: 1
    }
  ];
  const servicePrividerList = [{ name: 'ADMINISTRATIVE CHARGES', id: 1 }, { name: 'BLOOD BANK', id: 7 },
  { name: 'CARDIAOLOGY INVESTIGATION & PROCEDURE', id: 8 }, { name: 'CATH LAB PROCEDURE', id: 10 }];
  const doctorList = [{ name: 'A G HUPRIKAR', id: 197 }, { name: 'AARATI SAMEER DESAI', id: 225 }, { name: 'ADITI MANISH DASTANE', id: 193 }, { name: 'ADVAIT ANIRUDDHA KOTHURKAR', id: 90 }];
  const speciality = [{
    speciality_name: 'ABDOMINAL TRANSPLANT AND HEPATIC SURGERY',
    id: '1'
  },
  {
    speciality_name: 'ANAESTHESIOLOGY',
    id: '2'
  },
  {
    speciality_name: 'ANDROLOGY',
    id: '3'
  },
  {
    speciality_name: 'ARTHROSCOPY AND ARTHROPLASTY',
    id: '4'
  }];
  const jointClinicList = [{ name: 'Abc', id: 10 }, { name: 'Jbjhg', id: 4 },
  { name: 'Joint clinic test', id: 6 }, { name: 'Lilwati', id: 1 },
  { name: 'My join clinic', id: 2 }];

  const searchFormValue = {"startDate":"2019-09-10T07:52:30.270Z","selectedEntity":{"id":2,"name":"DOCTOR","key":"doctor"},"selectedServiceProvider":null,"selectedDoctor":{"name":"BHAGYASHREE SUBODH SHIVDE","id":61},"selectedSpeciality":{"id":"2","name":"ANAESTHESIOLOGY"},"appointmentType":null,"selectedJointClinic":null,"startHour":"1:00","endHour":"5:00"};
  const hoursList = ["0:00","1:00","2:00","3:00","4:00","5:00","6:00","7:00","8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];
  const timeFormat = '24_hour';
  class AppointmentServiceSpy {
    getAppointmentTypeByEntity = jest.fn().mockImplementation(() => {
      return of(appointmentTypeList);
    });
  }

  class EntityBasicInfoServiceSpy {
    getAllEntityList = jest.fn().mockImplementation(() => {
      return of(entityList);
    });
    getAllServiceProviderList = jest.fn().mockImplementation((params) => {
      let data = [];
      if (params.id === 1) {
        data = servicePrividerList;
      } else if (params.id === 2) {
        data = doctorList;
      } else {
        data = jointClinicList;
      }
      return of(data);
    });
    getSpecialityListData = jest.fn().mockImplementation(() => {
      return of(speciality);
    });
  }

  class EntitityCommonDataServiceSpy {
    getTimeFormatKey = jest.fn().mockImplementation(() => {
      return of(timeFormat);
    });
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedModule, HttpClientTestingModule],
      declarations: [SearchAppointmentsComponent],
      providers: [
        { provide: AppointmentService, useValue: {} },
        { provide: EntityBasicInfoService, useValue: {} },
        { provide: EntitityCommonDataService, useValue: {} }
      ]
    })
      .overrideComponent(SearchAppointmentsComponent, {
        set: {
          providers: [
            { provide: AppointmentService, useClass: AppointmentServiceSpy },
            { provide: EntityBasicInfoService, useClass: EntityBasicInfoServiceSpy },
            { provide: EntitityCommonDataService, useClass: EntitityCommonDataServiceSpy }
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchAppointmentsComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('Should get appointment type list', () => {
  //   expect(component.appointmentTypeList.length).toEqual(0);
  //   component.getAppointmentTypeList(1, 1);
  //   expect(component.appointmentTypeList.length).toBeGreaterThan(0);
  // });

  it('Should get Entity list', () => {
    expect(component.entityList.length).toEqual(0);
    component.getAllEntityList();
    expect(component.entityList.length).toBeGreaterThan(0);
  });

  it('Should get service provider list', () => {
    component.createForm();
    component.searchForm.patchValue({
      selectedEntity: { id: 1, key: '' }
    });
    expect(component.serviceProviderList.length).toEqual(0);
    component.updateValuesOnEntityChange('service_provider');
    expect(component.serviceProviderList.length).toBeGreaterThan(0);
  });

  it('Should get doctor and speciality list', () => {

    component.createForm();
    // component.searchForm.patchValue({
    //   selectedEntity: { id: 2, key: 'doctor' }
    // });
    expect(component.doctorList.length).toEqual(0);
    expect(component.specialityList.length).toEqual(0);
    component.selectEntity({ id: 2, key: 'doctor' }, component.searchForm.get('selectedEntity'));
    expect(component.doctorList.length).toBeGreaterThan(0);
    // expect(component.specialityList.length).toBeGreaterThan(0);
  });

  it('Should get joint clinic list', () => {
    component.createForm();
    component.searchForm.patchValue({
      selectedEntity: { id: 3, key: '' }
    });
    expect(component.jointClinicList.length).toEqual(0);
    component.updateValuesOnEntityChange('joint_clinic');
    expect(component.jointClinicList.length).toBeGreaterThan(0);
  });

  it('Should get doctor list on select speciality', () => {
    component.createForm();
    component.selectSepeciality({ id: 1, name: 'test' }, component.searchForm.get('selectedSpeciality'));
    expect(component.searchForm.get('selectedDoctor').value).toBe('');
  });

  it('Should get appointment list on select doctor', () => {
    component.createForm();
    component.searchForm.patchValue({
      selectedEntity: { id: 2, key: '' }
    });
    expect(component.appointmentTypeList.length).toEqual(0);
    component.selectDoctor({ id: 1, name: 'test' }, component.searchForm.get('selectedDoctor'));
    expect(component.appointmentTypeList.length).toBeGreaterThan(0);
  });

  it('Should get appointment list on select joint clinic', () => {
    component.createForm();
    component.searchForm.patchValue({
      selectedEntity: { id: 3, key: '' }
    });
    expect(component.appointmentTypeList.length).toEqual(0);
    component.selectJointClinic({ id: 1, name: 'test' }, component.searchForm.get('selectedJointClinic'));
    expect(component.appointmentTypeList.length).toBeGreaterThan(0);
    // in case of e not set, appointmentType must be empty
    component.selectJointClinic(null, component.searchForm.get('selectedJointClinic'));
    expect(component.appointmentTypeList.length).toEqual(0);
  });

  it('Should get appointment list on select provider', () => {
    component.createForm();
    component.searchForm.patchValue({
      selectedEntity: { id: 1, key: '' }
    });
    expect(component.appointmentTypeList.length).toEqual(0);
    component.selectProvider({ id: 1, name: 'test' }, component.searchForm.get('selectedServiceProvider'));
    expect(component.appointmentTypeList.length).toBeGreaterThan(0);
  });

  it('Proper date must be set according to input parameters', () => {
    component.createForm();
    component.onClickDateBtn('TODAY');
    expect(moment(component.searchForm.value.startDate).format('YYYY-M-DD')).toEqual(moment(new Date()).format('YYYY-M-DD'));
    component.onClickDateBtn('TOMORROW');
    expect(moment(component.searchForm.value.startDate).format('YYYY-M-DD')).toEqual(moment(new Date()).add(1, 'days').format('YYYY-M-DD'));
    component.onClickDateBtn('NEXT_WEEK');
    expect(moment(component.searchForm.value.startDate).format('YYYY-M-DD')).toEqual(moment(new Date()).add(7, 'days').format('YYYY-M-DD'));
    component.onClickDateBtn('NEXT_MONTH');
    expect(moment(component.searchForm.value.startDate).format('YYYY-M-DD')).toEqual(moment(new Date()).add(1, 'months').format('YYYY-M-DD'));
  });

  it('Search form must be valid after hitting search data', () => {
    component.createForm();
    component.searchForm.patchValue(searchFormValue);
    component.getSearhData();
    expect(component.searchForm.status).toEqual('VALID');
  });

  // it('Time format key must be set as per the setting', () => {
  //   component.getTimeFormatKey();
  //   expect(component.timeFormat).toEqual(timeFormat);
  // });

});

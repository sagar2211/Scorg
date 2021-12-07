import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { GlobalSearchDatPipe } from 'src/app/shared/pipes/global-search-dat.pipe';
import {AppointmentService} from "../../services/appointment.service";
import {AddPatientComponent} from "../add-patient/add-patient.component";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {PatientService} from "../../services/patient.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {CalculateAge} from "../../../../shared/pipes/calculate-age.pipe";


describe('AddPatientComponent', () => {
  let component: AddPatientComponent;
  let fixture: ComponentFixture<AddPatientComponent>;
  let router: Router;
  let patientServiceSpy;
  const patDetailsForAdd = {
    "pat_title_id": "11",
    "pat_firstname": "mayur",
    "pat_middlename": "",
    "pat_lastname": "k",
    "pat_gender": "male",
    "pat_dob": "2018-06-08T09:20:00.000Z",
    "pat_age": 1,
    "pat_bloodgrp_id": 2,
    "pat_maritalstatus": "Unmarried",
    "pat_mobileno": "9879979797",
    "pat_alternateno": "9797979797",
    "pat_phoneno": "979797979797979",
    "pat_emailid": "mk@gmail.com",
    "pat_isactive": "true",
    "pat_res_address": "sadasdsadadadasd fghf dfg cg cbdfb dfv d ",
    "pat_nationality_id": 86,
    "Pat_country_id": 101,
    "Pat_state_id": 21,
    "Pat_city_id": 2763,
    "pat_pincode": "978678",
    "pat_panno": "9797979797",
    "pat_adharno": "979797979797",
    "Pat_annual_income": "6786",
    "pat_age_unit": "YEAR"
  };
  const addPatientSuccessResult = {
    "uhid": "20190900005",
    "status_code": 200,
    "status_message": "Success",
    "message": "A new resource was successfully created."
  };

  const titlesMaster = {"titles":[{"title_id":11,"title":"MR"},{"title_id":12,"title":"MRS"}],"status_code":200,"status_message":"Success","message":"Details fetched successfully"};
  const bloodListMaster = {"BloodGroup_Data":[{"id":1,"name":"A+"},{"id":3,"name":"AB+"},{"id":4,"name":"AB-"},{"id":2,"name":"B+"},{"id":5,"name":"O+"},{"id":6,"name":"O-"}],"status_code":200,"status_message":"Success","message":"Details fetched successfully"};
  const nationalityMaster = {"Nationality_Data":[{"Nationality_Id":86,"Nationality_Name":"INDIAN"}],"status_code":200,"status_message":"Success","message":"Details fetched successfully"};
  const patientDob = new Date('2012-09-09');
  const expectedPatAge = 7;
  const expectedPatAgeUnit = "YEAR";
  const stateObj = {
    id: 21,
    name: "MAHARASHTRA"
  };
  const citySearchResult = {
    "City_Data": [
      {
        "City_Id": 2763,
        "City_Name": "PUNE"
      }
    ],
    "status_code": 200,
    "status_message": "Success",
    "message": "Details fetched successfully"
  };
  const stateSearchResult = {
    "State_Data": [
      {
        "State_Id": 21,
        "State_Name": "MAHARASHTRA"
      }
    ],
    "status_code": 200,
    "status_message": "Success",
    "message": "Details fetched successfully"
  };
  const countrySearchResult = {
    "Country_Data": [
      {
        "Country_Id": 101,
        "Country_Name": "INDIA"
      }
    ],
    "status_code": 200,
    "status_message": "Success",
    "message": "Details fetched successfully"
  };
  const countryObj = {
    id: 101,
    name: "INDIA"
  };
  class PatientServiceSpy {
    savePatient = jest.fn().mockImplementation(() => {
      return of(addPatientSuccessResult);
    });
    getTitles = jest.fn().mockImplementation(() => {
      return of(titlesMaster);
    });
    getBloodList = jest.fn().mockImplementation(() => {
      return of(bloodListMaster);
    });
    getNationality = jest.fn().mockImplementation(() => {
      return of(nationalityMaster);
    });
    getCityList = jest.fn().mockImplementation(() => {
      return of({cityList: citySearchResult.City_Data});
    });
    getStateList = jest.fn().mockImplementation(() => {
      return of({stateList: stateSearchResult.State_Data});
    });
    getCountryList = jest.fn().mockImplementation(() => {
      return of({countryList: countrySearchResult.Country_Data});
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule, SharedModule],
      declarations: [AddPatientComponent],
      providers: [
        { provide: PatientService, useValue: {} }
      ]
    })
    // Override component's own provider
      .overrideComponent(AddPatientComponent, {
        set: {
          providers: [
            { provide: PatientService, useClass: PatientServiceSpy }, GlobalSearchDatPipe,
            NgbActiveModal, CalculateAge
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPatientComponent);
    component = fixture.componentInstance;
    patientServiceSpy = fixture.debugElement.injector.get(PatientService) as any;
    router = TestBed.get(Router);
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should set default values for patient gender and patient age unit. ', () => {
    component.defaultDocForm();
    component.titleList = titlesMaster.titles;
    component.clearform();
    expect(component.patientRegistrationForm.value.pat_gender).toEqual('male');
    expect(component.patientRegistrationForm.value.pat_age_unit).toEqual('YEAR');
  });

  it('Should add patient', () => {
    //set new form
    component.defaultDocForm();
    expect(component.submitted).toBeFalsy();
    expect(component.patientRegistrationForm.valid).toBeFalsy();
    component.patientRegistrationForm.patchValue(patDetailsForAdd);
    component.addUpdatePatient();
    expect(component.submitted).toBeTruthy();
    // expect(component.patientRegistrationForm.valid).toBeTruthy();
    expect(component.alertMsg.message).toEqual('User Saved Successfully.');
  });

  it('should get Titles, BloodList, Nationality masters', () => {
    expect(component.titleList.length).toEqual(0);
    expect(component.bloodList.length).toEqual(0);
    expect(component.nationalList.length).toEqual(0);
    component.ngOnInit();
    component.getTitleList().subscribe(res => {
      expect(component.titleList.length).toEqual(titlesMaster.titles.length);
    });
    component.getBloodList().subscribe(res => {
      expect(component.bloodList.length).toEqual(bloodListMaster.BloodGroup_Data.length);
    });
    component.getNationality().subscribe(res => {
      expect(component.nationalList.length).toEqual(nationalityMaster.Nationality_Data.length);
    });
  });

  it('Should calculate age and age unit based on selected date', () => {
    component.defaultDocForm();
    component.patientRegistrationForm.patchValue({pat_dob: patientDob});
    component.ageCalculation('dob');
    expect(component.patientRegistrationForm.value.pat_age).toEqual(expectedPatAge);
    expect(component.patientRegistrationForm.value.pat_age_unit).toEqual(expectedPatAgeUnit);
  });

  it('Patient dob field must be null when age field change', () => {
    component.defaultDocForm();
    component.ageCalculation('age');
    expect(component.patientRegistrationForm.value.pat_dob).toEqual(null);
  });

    it('Should get country list', () => {
    component.defaultDocForm();
    component.getCountryList('India').subscribe((res: any) => {
      expect(res.length).toEqual(countrySearchResult.Country_Data.length);
      expect(res[0].Country_Name).toEqual(countrySearchResult[0].Country_Name);
    })
  });

  it('Should get expected states list', () => {
    component.defaultDocForm();
    component.patientRegistrationForm.patchValue({Pat_country_id: countryObj});
    component.getStateList('Maharashtra').subscribe((res: any) => {
      expect(res.length).toEqual(stateSearchResult.State_Data.length);
      expect(res[0].State_Name).toEqual(stateSearchResult[0].State_Name);
    })
  });

  it('Should get expected cities list', () => {
    component.defaultDocForm();
    component.patientRegistrationForm.patchValue({Pat_state_id: stateObj});
    component.getCity('Pune').subscribe((res: any) => {
      expect(res.length).toEqual(citySearchResult.City_Data.length);
      expect(res[0].City_Name).toEqual(citySearchResult.City_Data[0].City_Name);
    })
  });
});

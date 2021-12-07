import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {SharedModule} from "../../../shared/shared.module";
import { of } from "rxjs";
import { OrderService } from "../../../services/order.service";
import { RouterTestingModule } from "@angular/router/testing";
import {HttpClientModule} from "@angular/common/http";
import {AuthService} from "../../../auth/auth.service";
import {ConsultationService} from "../../../public/consultation.service";
import { RadiologyOrdersComponent } from './radiology-orders.component';
import { PublicService } from "../../../services/public.service";

describe('RadiologyOrdersComponent', () => {
  let component: RadiologyOrdersComponent;
  let fixture: ComponentFixture<RadiologyOrdersComponent>;
  // let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let orderServiceSpy: any;
  let publicServiceSpy: any;
  const global = {
    'authToken': '$1$BhwcTLHZ$FhQ2PHHBhqdSYZJSZ3rPg.', 'userId': '2902',
    'userInfo': {
      'id': '2902', 'doctor_name': 'vikram', 'role_type': null,
      'doc_email': 'vikram.bhimannavar@scorgtechnologies.com',
      'doc_password': 'f9f16d97c90d8c6f2cab37bb6d1f1992',
      'doctor_gender': 'Male', 'doctor_exp': null,
      'doctor_spaciality': '', 'area_id': '0', 'city_id': '0', 'mac_address': null, 'doctor_hos_clnk_name': null,
      'doc_phone': '6965689568', 'offline_version': null, 'paperless_doc_id': null, 'website': '', 'logo_path': null, 'doctor_image_path': null,
      'doctor_address': '', 'default_age_dob': '1', 'last_updation_date': '2019-06-04 17:52:48', 'acount_expiry': null, 'password_reset_by': null,
      'password_reset_code': null, 'reset_code_sent_datetime': null, 'login_otp': null, 'login_otp_sent_date_time': null,
      'is_first_login': '0', 'creation_date': '2018-06-28 15:55:58', 'is_deleted': '0', 'lastloginTime': null, 'last_logout_time': null,
      'last_activity_time': null, 'average_rating': null, 'isSponsored': '0', 'isPremium': null, 'aboutDoctor': '', 'doctor_degree': '',
      'isActive': '1', 'mobile_token': null, 'created_by': null, 'modified_by': null
    },
    'userRolesData': [{ 'role_id': '1', 'role_key': 'doctor', 'display_name': 'Doctor' }, { 'role_id': '5', 'role_key': 'super_admin', 'display_name': 'Super Admin' }],
    'locationData': [{
      'hospital_id': '8', 'hospital_name': 'HINDUJA HOSPITAL',
      'location_id': '8', 'location_name': 'Mumbai', 'address': 'Hinduja Hospital OPD Building, SVS Road, Mahim West, Mahim, Mumbai, Maharashtra, India',
      'street_name': '', 'landmark': '', 'city_name': 'Mumbai'
    },
      {
        'hospital_id': '8', 'hospital_name': 'HINDUJA HOSPITAL', 'location_id': '96', 'location_name': 'Dadar',
        'address': 'Hinduja Hospital OPD Building, Mahim West, Mahim, Mumbai, Maharashtra, India', 'street_name': null, 'landmark': null, 'city_name': 'Mumbai'
      }],
    'fileGlobalUrl:': 'https://s3.ap-south-1.amazonaws.com/devrescribeattachments', 'userLoggedIn': true,
    'departmentInfo': { 'departmentId': '5', 'departmentName': 'Haematology' }, 'specialityInfo': { 'specialityId': '9', 'specialityName': 'Speciality 2' },
    'defualt_location': {
      'hospital_id': '8', 'hospital_name': 'HINDUJA HOSPITAL', 'location_id': '8', 'location_name': 'Mumbai',
      'address': 'Hinduja Hospital OPD Building, SVS Road, Mahim West, Mahim, Mumbai, Maharashtra, India', 'street_name': '', 'landmark': '', 'city_name': 'Mumbai'
    },
    'defualt_hospital': {
      'hospital_id': '8', 'hospital_name': 'HINDUJA HOSPITAL', 'location_id': '8', 'location_name': 'Mumbai',
      'address': 'Hinduja Hospital OPD Building, SVS Road, Mahim West, Mahim, Mumbai, Maharashtra, India', 'street_name': '', 'landmark': '', 'city_name': 'Mumbai'
    },
    'defualt_role': { 'role_id': '1', 'role_key': 'doctor', 'display_name': 'Doctor' }, 'userParentId': '2902'
  };
  const radiologyOrders = [
    {
      "isValidObject": true,
      "id": "",
      "name": "new radio test 13",
      "radioInvestigationObj": {
        "id": "528",
        "name": "new radio test 13",
        "label": "new radio test 13",
        "headId": "9",
        "comment": "same as anand gurjar"
      },
      "startDateTime": "2019-06-13T11:54:47.254Z",
      "endDateTime": "2019-06-13T11:54:47.254Z",
      "recurring": "",
      "priority": "Routine",
      "action": "",
      "status": "approved",
      "reason": "",
      "signSymptoms": "",
      "patientConsentNeeded": "no",
      "clinicalInfo": "",
      "radiologyInstruction": "",
      "patientInstruction": "",
      "isDirty": false,
      "tempId": 1560426897517,
      "tempstatus": "",
      "invalidObjectMessage": ""
    }
  ];

  const mockRadiologyOrderFormData = {
    id: "",
    name: "new radio test 13",
    startDateTime: "2019-06-13T11:54:47.254Z",
    endDateTime: "2019-06-13T11:54:47.254Z",
    recurring: "",
    priority: "Routine",
    action: "",
    status: "approved",
    reason: "",
    signSymptoms: "",
    patientConsentNeeded: "no",
    clinicalInfo: "",
    radiologyInstruction: "",
    patientInstruction: "",
    isDirty: true,
    tempId: 1560426897517,
    radioInvestigationObj: {
      id: "528",
      name: "new radio test 13",
      label: "new radio test 13",
      headId: "9",
      comment: "same"
    }
  };

  const mockEditRadiologyOrderFormData = {
    id: "",
    name: "new radio test 13",
    startDateTime: "2019-07-13T11:54:47.254Z",
    endDateTime: "2019-07-13T11:54:47.254Z",
    recurring: "",
    priority: "Routine",
    action: "",
    status: "approved",
    reason: "",
    signSymptoms: "",
    patientConsentNeeded: "no",
    clinicalInfo: "",
    radiologyInstruction: "",
    patientInstruction: "",
    isDirty: true,
    tempId: 1560426897580,
    radioInvestigationObj: {
      id: "528",
      name: "new radio test 13",
      label: "new radio test 13",
      headId: "9",
      comment: "same"
    }
  };

  const suggestionRadiologyData = {
    "key": "radiologyOrders",
    "data": {
      "id": "551",
      "name": "CT +3D - Face",
      "comment": null,
      "date": null,
      "headId": null,
      "label": "CT +3D - Face",
      "default_comment": "",
      "is_favourite": 0,
      "doc_id": "2766",
      "use_count": "0",
      "use_count_cardiac": "0",
      "investigation_head_id": "9",
      "checked": true
    },
    "type": "add"
  };

  // -- mock public service api
  class OrderServiceSpy {
    getOrderData = jest.fn().mockImplementation().mockReturnValue(of(radiologyOrders));

    // $subcFilteredEvnt = jasmine.createSpy('$subcFilteredEvnt').and.callFake(() => {
    //   return of({ data: '', key: 'dietOrders' });
    // });

    sendEvntToParentComp = jest.fn().mockImplementation(() => {
    });

    listenEventFromSuggList = jest.fn().mockImplementation(() => {
    });

    $subcFilteredEvnt = jest.fn().mockImplementation(() => {
      return of({ filterBy: 'radiologyOrders', mode: 'setData' })
    });
  }

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientModule, RouterTestingModule],
      declarations: [ RadiologyOrdersComponent ],
      providers: [AuthService, ConsultationService, { provide: OrderService, useValue: {} }]
    })
    // Override component's own provider
      .overrideComponent(RadiologyOrdersComponent, {
        set: {
          providers: [
            { provide: OrderService, useClass: OrderServiceSpy }
          ]
        }
      }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    localStorage.setItem('globals', JSON.stringify(global));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiologyOrdersComponent);
    component = fixture.componentInstance;
    publicServiceSpy = fixture.debugElement.injector.get(PublicService) as any;
    orderServiceSpy = fixture.debugElement.injector.get(OrderService) as any;
    spyOn(component, 'subcriptionOfEvents').and.callFake(() => {
      orderServiceSpy.$subcFilteredEvnt.and.returnValue(of({ data: '', key: 'dietOrders' }));
    });
    // fixture.detectChanges();
  });

  it('Should create component', () => {
    expect(component).toBeDefined();
  });

  // it('Should get radiology order list greater than 0', () => {
  //   component.getOrdersData();
  //   expect(component.radiologyOrderList.length).toEqual(1);
  // });

  it('Add Edit and Remove - Should increment diet then on remove should decrement count', () => {
    // check add
    component.setRadiologyOrderFormData();
    expect(component.radiologyOrderForm.valid).toBeFalsy();
    expect(component.selectedIndex).not.toBeGreaterThan(0);
    expect(component.radiologyOrderList.length).toEqual(0);
    component.radiologyOrderForm.patchValue(mockRadiologyOrderFormData);
    component.addradiologyOrders();
    expect(component.radiologyOrderList.length).toEqual(1);

    // check edit
    component.selectedIndex = 0;
    component.radiologyOrderForm.patchValue(mockEditRadiologyOrderFormData);
    component.addradiologyOrders();
    expect(component.selectedIndex).toEqual(-1);
    expect(component.radiologyOrderList.length).toEqual(1);

    // check remove
    component.radiologyOrderList[0].tempId = mockEditRadiologyOrderFormData.tempId;
    component.removeRadiologyOrders(mockEditRadiologyOrderFormData);
    expect(component.radiologyOrderList.length).toEqual(0);
  });

  it('Should add radiology from suggestion list', () => {
    publicServiceSpy.listenEventFromSuggList.pipe = jest.fn().mockImplementation().mockReturnValue(of(suggestionRadiologyData));
    component.orderDisplayType = 'all';
    const prevListCount = component.radiologyOrderList.length;
    component.subcriptionOfEvents();
    expect(component.radiologyOrderList.length).toBeGreaterThan(0);
  });

  it('Should get radiology orders', () => {
    const prevLength = component.radiologyOrderList.length;
    component.getOrdersData();
    const expectedLen = prevLength + radiologyOrders.length;
    expect(component.radiologyOrderList.length).toEqual(expectedLen);
  });
});

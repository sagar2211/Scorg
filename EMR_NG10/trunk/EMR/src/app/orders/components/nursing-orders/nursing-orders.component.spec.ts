import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import { NursingOrdersComponent } from './nursing-orders.component';
import {SharedModule} from "../../../shared/shared.module";
import { of } from "rxjs";
import { OrderService } from "../../../services/order.service";
import { RouterTestingModule } from "@angular/router/testing";
import {HttpClientModule} from "@angular/common/http";
import {AuthService} from "../../../auth/auth.service";
import {ConsultationService} from "../../../public/consultation.service";
import {PublicService} from "../../../services/public.service";
import {SuggestionModelPopupComponent} from "../suggestion-model-popup/suggestion-model-popup.component";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";

describe('NursingOrdersComponent', () => {
  let component: NursingOrdersComponent;
  let fixture: ComponentFixture<NursingOrdersComponent>;
  // let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let orderServiceSpy: any;
  let publicServiceSpy: any;
  let mockNursingOrderFormValue = {
    name: "Monitor respirations for signs of fatigue & impending failure.",
    tempId: 1560338204880,
    nursingId: "1",
    action: "",
    id: "",
    status: "approved",
    isDirty: true,
    frequency: "",
    genericFreq: "3",
    genericDuration: {
      id: "4",
      duration: "22"
    },
    startDateTime: "2019-06-12T19:34:39+05:30"
  };

  let mockEditNursingOrderFormValue = {
    name: "Monitor respirations for signs of fatigue & impending failure.",
    tempId: 1560338204889,
    nursingId: "1",
    action: "",
    id: "",
    status: "approved",
    isDirty: true,
    frequency: "",
    genericFreq: "6",
    genericDuration: {
      id: "5",
      duration: "20"
    },
    startDateTime: "2019-06-22T19:34:39+05:30"
  };

  const nursingOrders =  [
    {
      "isValidObject": true,
      "name": "Monitor for abdominal distension.",
      "tempId": 1560348867865,
      "nursingId": "5",
      "action": "",
      "id": "123",
      "status": "approvelPending",
      "isDirty": false,
      "genericFreq": "6",
      "genericDuration": "5",
      "startDateTime": "2019-06-12T14:14:18.000Z",
      "invalidObjectMessage": "Frequency or Duration may be missing",
      "tempstatus": "approved"
    }
  ];

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

  const nursingMaster = [{"name": "Monitor respirations for signs of fatigue & impending failure.", "id": "1", "instructions": "", "action": "", "is_favourite": "0", "use_count": "7"}, {"name": "Maintain mean arterial pressure > 85 mm Hg for next seven days.", "id": "2", "instructions": "", "action": "", "is_favourite": "0", "use_count": "7"}, {"name": "Monitor heart rate.", "id": "3", "instructions": "", "action": "", "is_favourite": "0", "use_count": "7"}];
  // -- mock public service api
  const suggestionNursingData = {
    "key": "nursingOrders",
    "data": {
      "isValidObject": true,
      "name": "Monitor respirations for signs of fatigue & impending failure.",
      "nursingId": "1",
      "action": "",
      "id": "",
      "startDateTime": "2019-06-21T09:54:49.351Z",
      "is_favourite": 0,
      "use_count": "7",
      "invalidObjectMessage": "Frequency or Duration may be missing",
      "tempstatus": "",
      "checked": true
    },
    "type": "add"
  };

  const suggestionNursingOrderForDelete = {
    "key": "nursingOrders",
    "data": 0,
    "type": "delete"
  };

  const activeIds = ['medicineOrders', 'labOrders', 'radiologyOrders', 'dietOrders', 'nursingOrders'];
  class OrderServiceSpy {
    // getOrderData = jasmine.createSpy('getOrderData').and.callFake(
    //   () => of(nursingOrders)
    // );
    //
    // sendEvntToParentComp = jasmine.createSpy('sendEvntToParentComp').and.callFake(() => {
    // });
    //

    getMasterNursingOrders = jest.fn().mockImplementation(() => {
      return of(nursingMaster);
    });

    sendEvntToParentComp = jest.fn().mockImplementation(() => {
    });

    // listenEventFromSuggList = jasmine.createSpy('listenEventFromSuggList').and.callFake(() => {
    // });

    listenEventFromSuggList = jest.fn().mockImplementation(() => {
    });

    getOrderData = jest.fn().mockImplementation(() => {
      return of(nursingOrders);
    });

    $subcFilteredEvnt = jest.fn().mockImplementation(() => {
      return of({ filterBy: 'nursingOrders', mode: 'setData' })
    });

    setOrderData = jest.fn().mockImplementation(() => {
    });
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientModule, RouterTestingModule],
      declarations: [ NursingOrdersComponent, SuggestionModelPopupComponent ],
      providers: [AuthService, ConsultationService, { provide: OrderService, useValue: {} }]
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [SuggestionModelPopupComponent] } })
    // Override component's own provider
      .overrideComponent(NursingOrdersComponent, {
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
    fixture = TestBed.createComponent(NursingOrdersComponent);
    component = fixture.componentInstance;
    orderServiceSpy = fixture.debugElement.injector.get(OrderService) as any;
    publicServiceSpy = fixture.debugElement.injector.get(PublicService) as any;
    orderServiceSpy.$subcFilteredEvnt.pipe = jest.fn().mockImplementation(() => {
      return of({ filterBy: 'nursingOrders', mode: 'setData' })
    });
  });

  it('Should create component', () => {
    expect(component).toBeDefined();
  });

  // it('Should get nursing order list greater than 0', () => {
  //   component.getNursingOrders();
  //   expect(component.nursingOrders.length).toEqual(1);
  // });

  it('Should get nursing order list on search', () => {
    component.getMasterNursingOrdList('').subscribe(result =>{
      expect(result.length).toBeGreaterThan(0);
    });
  });

  it('Function should return pending object when status is approval pending', () => {
    component.getNursingOrders();
    expect(component.nursingOrders.length).toBeGreaterThan(0);
    component.findPendingObject();
    expect(component.checkAllStatus).toBeTruthy();
  });

  it('Add Edit and Remove - Should increment nursing then on remove should decrement count', () => {
    // check add
    component.setNursingOrderForm();
    expect(component.nursingOrderFrm.valid).toBeFalsy();
    expect(component.selectedItemIndex).not.toBeGreaterThan(0);
    expect(component.nursingOrders.length).toEqual(0);
    component.nursingOrderFrm.patchValue(mockNursingOrderFormValue);
    component.addNursingOrders();
    expect(component.nursingOrders.length).toEqual(1);

    // check edit
    component.selectedItemIndex = 0;
    component.nursingOrderFrm.patchValue(mockEditNursingOrderFormValue);
    component.addNursingOrders();
    expect(component.selectedItemIndex).toEqual(-1);
    expect(component.nursingOrders.length).toEqual(1);

    // check remove
    component.nursingOrders[0].tempId = mockEditNursingOrderFormValue.tempId;
    component.removeNurOrders(mockEditNursingOrderFormValue);
    expect(component.nursingOrders.length).toEqual(0);
  });

  it('Should get nursing orders', () => {
    const prevLength = component.nursingOrders.length;
    component.getNursingOrders();
    const expectedLen = prevLength + nursingOrders.length;
    expect(component.nursingOrders.length).toEqual(expectedLen);
  });

  it('Should check status and call to add/remove orders count', () => {

    component.getNursingOrders();
    // component.addDiats();
    const obj = {
      target : {
        checked: false
      }
    };
    component.checkAllStatus(obj);
    expect(orderServiceSpy.sendEvntToParentComp).toHaveBeenCalled();
  });

  it('Should add nursing from suggestion list', () => {
    publicServiceSpy.listenEventFromSuggList.pipe = jest.fn().mockImplementation().mockReturnValue(of(suggestionNursingData));
    component.orderDisplayType = 'all';
    const prevListCount = component.nursingOrders.length;
    component.subcriptionOfEvents();
    expect(component.nursingOrders.length).toBeGreaterThan(0);
  });

  it('Should remove nursing from suggestion list', () => {
    component.getNursingOrders();
    publicServiceSpy.listenEventFromSuggList.pipe = jest.fn().mockImplementation().mockReturnValue(of(suggestionNursingOrderForDelete));
    component.orderDisplayType = 'all';
    expect(component.nursingOrders.length).toBeGreaterThan(0);
    const prevListCount = component.nursingOrders.length;
    component.subcriptionOfEvents();
    expect(component.nursingOrders.length).toEqual(prevListCount - 1);
  });

  test('Should open suggestion popup', () => {
    expect(component._modalService.hasOpenModals()).toBeFalsy();
    component.openSuggestion();
    expect(component._modalService.hasOpenModals()).toBeTruthy();
  });

  it('Edit nursing should not get called on init', () => {
    spyOn(component, 'onEditNursing').and.callFake(() => {
    });
    expect(component.editData).toBeUndefined();
    expect(component.onEditNursing).not.toHaveBeenCalled();
  });

  test('Should display order data on form when onEditNursing() called', () => {
    component.setNursingOrderForm();
    expect(component.nursingOrderFrm.valid).toBeFalsy();
    component.onEditNursing(mockEditNursingOrderFormValue, 1);
    expect(component.selectedItemIndex).toEqual(1);
    expect(component.nursingOrderFrm.valid).toBeTruthy();
  });

  it('If mode is not setData, component should maintain same filters as input', () => {
    const res = {
      mode: '',
      filterBy: 'approved',
      activeIds: activeIds
    };
    orderServiceSpy.$subcFilteredEvnt.pipe = jest.fn().mockImplementation(() => {
      return of(res)
    });
    component.subcriptionOfEvents();
    expect(component.filterBy).toEqual(res.filterBy);
    expect(component.activeIds).toEqual(res.activeIds);
    expect(component.closeOthers).toBeFalsy();
  });
});

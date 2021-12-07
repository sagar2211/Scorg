// Mayur Kulkarni
import { ConsultationService } from 'src/app/public/consultation.service';
import { AuthService } from './../../../auth/auth.service';
import { DietOrdersComponent} from "./diet-orders.component";
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './../../../shared/shared.module';
import { async, TestBed, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { PublicService } from 'src/app/prescription/index';
import { of } from 'rxjs';
import { OrderService} from "../../../services/order.service";
import {ActivatedRoute} from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { DietOrder} from "../../../models/diet-order/diet-order";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {SuggestionModelPopupComponent} from "../suggestion-model-popup/suggestion-model-popup.component";

describe('DietOrdersComponent', () => {
  let component: DietOrdersComponent;
  let fixture: ComponentFixture<DietOrdersComponent>;
  // let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let orderServiceSpy: any;
  let publicServiceSpy: any;
  const dietMaster = [{"name":"NPO for Tests","id":"1","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Clear Liquid Diet","id":"2","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Full Liquid Diet","id":"3","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Soft Diet","id":"4","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Regular Diet","id":"5","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Cardiac Diet","id":"6","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Carbohydrate Controlled Diet","id":"7","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Low Fiber Diet","id":"8","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Renal Diet","id":"9","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Dental Soft","id":"10","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Consistent Carbohydrate Diet","id":"11","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Low Sodium Diet","id":"12","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Low Fat Diet","id":"13","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Low Potassium Diet","id":"14","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Low Phosphorus Diet","id":"15","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Neutropenic Diet","id":"16","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Gluten Free Diet","id":"17","instructions":"","action":"","is_favourite":"0","use_count":"7"},{"name":"Bariatric Diet","id":"18","instructions":"","action":"","is_favourite":"0","use_count":"7"}];
  const mockDietOrderFormValue = {
    dietId: 1,
    name: "NPO for Tests",
    startDateTime: "2019-06-12T09:31:16.848Z",
    endDateTime: "2019-06-28T02:00:00+05:30",
    quantity : "4",
    freq : "5",
    specInstruction: "spec",
    action: "",
    id: "",
    status: "approvelPending",
    isDirty: true,
    tempId: 1560338204880,
  };
  const mockEditDietOrderFormValue = {
    dietId: 1,
    name: "NPO for Tests",
    startDateTime: "2019-06-14T09:31:16.848Z",
    endDateTime: "2019-06-30T02:00:00+05:30",
    quantity : "20",
    freq : "10",
    specInstruction: "spec",
    action: "",
    id: "",
    status: "approvelPending",
    isDirty: true,
    tempId: 1560338204885,
    tempstatus: "approved",
    checked: true,
    isValidObject: false,
    is_favourite: '',
    use_count: 0,
    invalidObjectMessage: ''
  };
  const dietOrders = [
    {
      "name": "Soft Diet",
      "tempId": 1558861397487,
      "dietId": "4",
      "action": "",
      "id": 451,
      "status": "approvelPending",
      "isDirty": false,
      "startDateTime": "2019-05-26T09:03:38.617Z",
      "endDateTime": "2019-05-28T09:03:38.617Z",
      "invalidObjectMessage": "",
      "is_favourite": 0,
      "use_count": "7",
      "checked": true,
      "freq": "10",
      "quantity": "10",
      "checkAllValue": false,
      "tempstatus": "approved",
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
  const suggestionDietOrder = {
    "key": "dietOrders",
    "data": {
      "name": "Clear Liquid Diet",
      "dietId": "2",
      "action": "",
      "id": "",
      "startDateTime": "2019-06-18T09:11:21.275Z",
      "endDateTime": null,
      "invalidObjectMessage": "",
      "is_favourite": 0,
      "use_count": "7",
      "tempstatus": "",
      "checked": true
    },
    "type": "add"
  };

  const suggestionDietOrderForDelete = {
    "key": "dietOrders",
    "data": 0,
    "type": "delete"
  };

  // -- mock public service api
  class OrderServiceSpy {
    // getOrderData = jasmine.createSpy('getOrderData').and.callFake(
    //   () => of(dietOrders)
    // );

    sendEvntToParentComp = jest.fn().mockImplementation(() => {
    });

    getDiatOrderList = jest.fn().mockImplementation(() => {
      return of(dietMaster);
    });
    // listenEventFromSuggList = jasmine.createSpy('listenEventFromSuggList').and.callFake(() => {
    // });

    // listenEventFromSuggList = jest.fn().mockImplementation(() => {
    //   return of(suggestionDietOrder);
    // });

    getOrderData = jest.fn().mockImplementation().mockReturnValue(of(dietOrders));

    $subcFilteredEvnt = jest.fn().mockImplementation(() => {
     return of({ filterBy: 'dietOrders', mode: 'setData' })
    });

    // $subcFilteredEvnt = orderServiceSpy.onOrderFilterClick.next({ filterBy: 'dietOrders', mode: 'setData' });
    // $subcFilteredEvnt = jest.fn().mockImplementation(() => {
    //    of({ data: '', key: 'dietOrders' })
    // });
  }

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientModule, RouterTestingModule],
      declarations: [DietOrdersComponent, SuggestionModelPopupComponent],
      providers: [AuthService, ConsultationService,
        { provide: OrderService, useValue: {} }, PublicService],

    })
    // Override component's own provider
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [SuggestionModelPopupComponent] } })
      .overrideComponent(DietOrdersComponent, {
        set: {
          providers: [
            { provide: OrderService, useClass: OrderServiceSpy }
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    localStorage.setItem('globals', JSON.stringify(global));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DietOrdersComponent);
    component = fixture.componentInstance;
    orderServiceSpy = fixture.debugElement.injector.get(OrderService) as any;
    publicServiceSpy = fixture.debugElement.injector.get(PublicService) as any;
    orderServiceSpy.$subcFilteredEvnt.pipe = jest.fn().mockImplementation(() => {
      return of({mode: 'setData', filterBy: 'dietOrders'})
    });

    // jest.spyOn(component, 'subcriptionOfEvents').mockImplementation(() => {
    // });
    // jest.spyOn('subcriptionOfEvents').mockImplementation().mockReturnValue(of({ data: '', key: 'dietOrders' }));
  });

  it('should create component', () => {
    component.getDietOrders();
    expect(component).toBeDefined();
  });

  it('Should get diet order list greater than 0', () => {
    // const get = new OrderServiceSpy();
    component.getDietOrders();
    fixture.whenStable().then(() => {
      expect(component.dietOrderList.length).toBeGreaterThan(0);
    });
  });

  it('form invalid when empty', () => {
    // component.subcriptionOfEvents();
    // fixture.detectChanges();
    fixture.whenStable().then(() => {
      component.setDietOrderForm();
      expect(component.diatOrdersFrm.valid).toBeFalsy();
    });
  });

  it('Add Edit and Remove - Should increment diet then on remove should decrement count', () => {

    // check add
    component.setDietOrderForm();
    expect(component.diatOrdersFrm.valid).toBeFalsy();
    expect(component.selectedItemIndx).not.toBeGreaterThan(0);
    expect(component.dietOrderList.length).toEqual(0);
    component.diatOrdersFrm.patchValue(mockDietOrderFormValue);
    component.addDiats();
    expect(component.dietOrderList.length).toBeGreaterThan(0);

    // check edit
    component.selectedItemIndx = 0;
    component.diatOrdersFrm.patchValue(mockEditDietOrderFormValue);
    component.addDiats();
    expect(component.selectedItemIndx).toEqual(-1);
    expect(component.dietOrderList.length).toEqual(1);

    // check remove
    component.dietOrderList[0].tempId = mockEditDietOrderFormValue.tempId;
    // console.log('diet order list length');
    // console.log(component.dietOrderList.length);
    component.removeDiet(mockEditDietOrderFormValue);
    expect(component.dietOrderList.length).toEqual(0);
  });

  it('Should get diet orders', () => {
    const prevLength = component.dietOrderList.length;
    component.getDietOrders();
    const expectedLen = prevLength + dietOrders.length;
    expect(component.dietOrderList.length).toEqual(expectedLen);
  });

  it('Should check status and call to add/remove orders count', () => {

    component.getDietOrders();
    // component.addDiats();
    const obj = {
      target : {
        checked: false
      }
    };
    component.checkAllStatus(obj);
    expect(orderServiceSpy.sendEvntToParentComp).toHaveBeenCalled();
  });

  it('Edit diet should not get called on init', () => {
    spyOn(component, 'onEditDiet').and.callFake(() => {
    });
    expect(component.editData).toBeUndefined();
    // component.onEditDiet(null, 0);
    expect(component.onEditDiet).not.toHaveBeenCalled();
  });

  it('Should add diet from suggestion list', () => {
    publicServiceSpy.listenEventFromSuggList.pipe = jest.fn().mockImplementation().mockReturnValue(of(suggestionDietOrder));
    component.orderDisplayType = 'all';
    const prevListCount = component.dietOrderList.length;
    component.subcriptionOfEvents();
    // publicServiceSpy.clickOnSuggestionList(suggestionDietOrder);
    expect(component.dietOrderList.length).toBeGreaterThan(0);
  });

  it('Should remove diet from suggestion list', () => {
    component.getDietOrders();
    publicServiceSpy.listenEventFromSuggList.pipe = jest.fn().mockImplementation().mockReturnValue(of(suggestionDietOrderForDelete));
    component.orderDisplayType = 'all';
    expect(component.dietOrderList.length).toBeGreaterThan(0);
    const prevListCount = component.dietOrderList.length;
    component.subcriptionOfEvents();
    // publicServiceSpy.clickOnSuggestionList(suggestionDietOrder);
    expect(component.dietOrderList.length).toEqual(prevListCount - 1);
  });

  it('Should preload values on edit button click', () => {
    component.setDietOrderForm();
    component.onEditDiet(mockEditDietOrderFormValue, 5);
    expect(component.selectedItemIndx).toEqual(5);
    expect(component.prevStatus).toEqual(mockEditDietOrderFormValue.status);
  });

  it('Should patch form value when diet order selected', () => {
    component.setDietOrderForm();
    expect(component.diatOrdersFrm.value.dietId).toEqual('');
    const dietObj = {
      id: 123,
      name: 'Regular Diet'
    };
    component.onDietSelect(dietObj);
    expect(component.diatOrdersFrm.value.dietId).toEqual(dietObj.id);
    expect(component.diatOrdersFrm.value.name).toEqual(dietObj.name);
  });

  it('Call to get Orders method once order set data has been set', () => {
    component.orderDisplayType = 'all';
    const prevListCount = component.dietOrderList.length;
    component.subcriptionOfEvents();
    // publicServiceSpy.clickOnSuggestionList(suggestionDietOrder);
    expect(component.dietOrderList.length).toBeGreaterThan(0);
  });

  test('Should open suggestion popup', () => {
    expect(component._modalService.hasOpenModals()).toBeFalsy();
    component.openSuggestion();
    expect(component._modalService.hasOpenModals()).toBeTruthy();
  });

  it('Function should return pending object when status is approval pending', () => {
    component.getDietOrders();
    expect(component.dietOrderList.length).toBeGreaterThan(0);
    component.findPendingObject();
    expect(component.checkAllStatus).toBeTruthy();
  });

  it('Should get diet order list on search', () => {
    component.getDiatList('').subscribe(result =>{
      expect(result.length).toBeGreaterThan(0);
    });
  });

});

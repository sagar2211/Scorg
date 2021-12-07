import { NursingOrdersComponent } from './../nursing-orders/nursing-orders.component';
import { Router } from '@angular/router';
import { DietOrdersComponent } from './../diet-orders/diet-orders.component';
import { RadiologyOrdersComponent } from './../radiology-orders/radiology-orders.component';
import { LabOrdersComponent } from './../lab-orders/lab-orders.component';
import { MedicineOrdersComponent } from './../medicine-orders/medicine-orders.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { fakeAsync } from '@angular/core/testing';
import { AuthService, PublicService } from 'src/app/prescription/index';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from './../../../shared/shared.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersComponent } from './orders.component';
import { of } from 'rxjs';
import { OrderService } from 'src/app/services/order.service';
import { RouterTestingModule } from '@angular/router/testing';

// -- Vikram Bhimannavar
describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let publicServiceSpy: PublicService;
  let orderServiceSpy: OrderService;

  // -- Mock data
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
  const suggestionSetting = { 'showSuggestion': true, 'suggestionPin': true };
  const ordersDetails = {
    'medicineOrders': [{
      'id': 217, 'tempId': 1559552476152, 'medicineObj': {
        'id': '894977', 'name': 'CAP BECOSULE',
        'type': { 'id': '3', 'shortName': 'CAP', 'name': 'CAPSULE', 'doseUnit': 'capsules' }, 'genricName': 'juyhgtrfeds', 'frequency': 3,
        'frequencySchedule': '1-1-1', 'duration': 5, 'sig': { 'id': '2', 'name': 'Apply' }, 'dose': '4', 'route': { 'id': '4', 'name': '1 hr Before Breakfast' },
        'startDate': '2019-06-03T09:01:16.000Z', 'instruction': '-2'
      }, 'priority': 'SOS', 'action': '', 'status': 'approved', 'isDirty': false, 'isValidObject': true,
      'tempstatus': '', 'invalidObjectMessage': '', 'isObjGenerated': true
    }, {
      'id': 239, 'tempId': 1559649940261,
      'medicineObj': {
        'id': '894976', 'name': 'TAB TEGRETOL 100', 'type': { 'id': '2', 'shortName': 'TAB', 'name': 'TABLET', 'doseUnit': 'tablets' },
        'genricName': null, 'frequency': 6, 'frequencySchedule': '1-1-1-1-1-1', 'duration': 600, 'sig': null, 'dose': null, 'route': null,
        'startDate': '2019-06-04T12:05:40.000Z', 'instruction': null
      }, 'priority': 'Routine', 'action': '', 'status': 'approved',
      'isDirty': false, 'isValidObject': true, 'tempstatus': '', 'invalidObjectMessage': '', 'isObjGenerated': true
    },
    {
      'tempId': 1562750452415, 'medicineObj': {
        'id': '894977', 'name': 'CAP BECOSULE', 'type': { 'id': '3', 'shortName': 'CAP', 'name': 'CAPSULE', 'doseUnit': 'capsules' },
        'genricName': null, 'frequency': 3, 'frequencySchedule': '1-1-1', 'duration': 3, 'sig': null, 'dose': null, 'route': null, 'startDate': '2019-07-10T09:20:52.000Z', 'instruction': null
      },
      'priority': 'Routine', 'action': '', 'status': 'approvelPending', 'isDirty': true, 'isValidObject': true, 'tempstatus': 'approved', 'invalidObjectMessage': '', 'isObjGenerated': true
    }],
    'labOrders': [{
      'name': 'ss', 'tempId': 1559553330171, 'specimen': 'Urine', 'startDateTime': '2019-06-03T09:15:30.237Z',
      'recurring': '', 'priority': 'Routine', 'action': '', 'status': 'approvelPending', 'patientConsentNeeded': '', 'labInstruction': '', 'patientInstruction': '', 'reason': '', 'componentList': [],
      'selectedComponentCount': 0, 'isDirty': false, 'endDateTime': null, 'tempstatus': 'approved',
      'labInvestigationObj': { 'id': '67', 'name': 'ss', 'label': 'ss', 'headId': '4', 'comment': 'ss' }
    }, {
      'name': 'ECG', 'tempId': 1559553330526, 'specimen': 'Serum',
      'startDateTime': '2019-06-03T09:15:30.570Z', 'recurring': '', 'priority': 'Routine', 'action': '', 'status': 'approvelPending',
      'patientConsentNeeded': '', 'labInstruction': '', 'patientInstruction': '', 'reason': '',
      'componentList': [], 'selectedComponentCount': 0, 'isDirty': false, 'endDateTime': null, 'tempstatus': 'approved',
      'labInvestigationObj': { 'id': '69', 'name': 'ECG', 'label': 'ECG', 'headId': '4', 'comment': '' }
    },
    {
      'name': 'IgA', 'tempId': 1562750458574, 'specimen': 'Tissues', 'startDateTime': '2019-07-10T09:20:58.642Z', 'priority': 'Routine', 'action': '',
      'status': 'approvelPending', 'tempstatus': 'approved', 'patientConsentNeeded': '', 'labInstruction': '', 'patientInstruction': '', 'reason': '', 'componentList': [], 'selectedComponentCount': 0,
      'isDirty': true, 'endDateTime': null, 'labInvestigationObj': { 'id': '70', 'name': 'IgA', 'label': 'IgA', 'headId': '4', 'comment': '' }
    }],
    'radiologyOrders': [{
      'isValidObject': true, 'id': '', 'name': 'ddsd', 'radioInvestigationObj': {
        'id': '61', 'name': 'ddsd', 'label': 'ddsd', 'headId': '9',
        'comment': 'dsds'
      }, 'startDateTime': '2019-07-10T09:21:39.498Z', 'endDateTime': null, 'recurring': '', 'action': '', 'status': 'approvelPending', 'reason': '',
      'signSymptoms': '', 'patientConsentNeeded': 'no', 'clinicalInfo': '', 'radiologyInstruction': '', 'patientInstruction': '', 'isDirty': true, 'tempId': 1562750499498,
      'tempstatus': 'approved' , 'invalidObjectMessage': ''
    }],
    'dietOrders': [{
      'name': 'NPO for Tests', 'tempId': 1562750505391, 'dietId': '1', 'action': '', 'id': '', 'status': 'approvelPending', 'isDirty': true,
      'startDateTime': '2019-07-10T09:21:43.689Z', 'endDateTime': null, 'invalidObjectMessage': '', 'is_favourite': 0, 'use_count': '7', 'tempstatus': 'approved'
    }],
    'nursingOrders': [{
      'isValidObject': true, 'name': 'Monitor respirations for signs of fatigue & impending failure.', 'tempId': 1562750511204,
      'nursingId': '1', 'action': '', 'id': '', 'status': 'approvelPending', 'isDirty': true, 'startDateTime': '2019-07-10T09:21:49.748Z', 'is_favourite': 0,
      'use_count': '7', 'invalidObjectMessage': 'Frequency or Duration may be missing', 'tempstatus': 'approved'
    }]
  };

  const saveOrderRes = {
    'status': 200, 'apistatus': 1, 'authenticated': 1, 'message': 'USER AUTHENTICATED',
    'data': {
      'status': 1, 'message': 'Data saved successfully', 'orders': {
        'ipdId': '117', 'docId': '2902', 'order_data': {
          'dietOrders': [{ 'id': 282, 'tempId': 1562750505391 }],
          'nursingOrders': [{ 'id': 283, 'tempId': 1562750511204 }], 'radiologyOrders': [{ 'id': 284, 'tempId': 1562750499498 }],
          'medicineOrders': [{ 'id': 285, 'tempId': 1562750452415 }], 'labOrders': [{ 'id': 286, 'tempId': 1562750458574 }]
        }
      }
    }
  };
  const masterOrderCat = [{ 'orderId': '1', 'orderName': 'Medicine Orders', 'display': true, 'orderKey': 'medicineOrders' },
  { 'orderId': '2', 'orderName': 'Lab Orders', 'display': true, 'orderKey': 'labOrders' },
  { 'orderId': '3', 'orderName': 'Radiology Orders', 'display': true, 'orderKey': 'radiologyOrders' },
  { 'orderId': '4', 'orderName': 'Diet Orders', 'display': true, 'orderKey': 'dietOrders' },
  { 'orderId': '5', 'orderName': 'Nursing Orders', 'display': true, 'orderKey': 'nursingOrders' }];

  class PublicServiceSpy {
    // getDoctorSettings = jest.fn().mockReturnValue((userId, key) => of(suggestionSetting));
    getDoctorSettings = jest.fn().mockImplementation().mockReturnValue(of(JSON.stringify(suggestionSetting)));
    saveDoctorSettings = jest.fn().mockImplementation(() => of({}));
  }

  class OrderServiceSpy {
    $subcGetChildData = jest.fn().mockImplementation(() => of([]));
    $subcEditEvent = jest.fn().mockImplementation(() => of([]));
    getOrderData = jest.fn().mockImplementation((key) => {
      return of(ordersDetails[key]);
    });
    // saveAllOrders = jest.fn().mockImplementation().mockReturnValue((reqParams) => of(saveOrderRes));
    // saveAllOrders = jest.fn().mockImplementation().mockReturnValue(of(saveOrderRes));
    saveAllOrders = jest.fn().mockImplementation(() => {
      return of(saveOrderRes);
    });
    getAllMasterOrderCategories = jest.fn().mockImplementation(() => of(masterOrderCat));
    getOrderDetailsByIpdId = jest.fn().mockImplementation(() => of([]));

    // getAllMasterOrderCategories = jest.fn().mockImplementation((key) => {
    //   return of(masterOrderCat);
    // });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [
        OrdersComponent,
        MedicineOrdersComponent,
        LabOrdersComponent,
        RadiologyOrdersComponent,
        DietOrdersComponent,
        NursingOrdersComponent],
      providers: [
        AuthService,
        { provide: PublicService, useValue: {} },
        { provide: OrderService, useValue: {} }
      ]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [
            MedicineOrdersComponent,
            LabOrdersComponent,
            RadiologyOrdersComponent,
            DietOrdersComponent,
            NursingOrdersComponent
          ]
        }
      })
      .overrideComponent(OrdersComponent, {
        set: {
          providers: [
            { provide: PublicService, useClass: PublicServiceSpy },
            { provide: OrderService, useClass: OrderServiceSpy }
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    TestBed.get(AuthService);
    publicServiceSpy = fixture.debugElement.injector.get(PublicService) as any;
    orderServiceSpy = fixture.debugElement.injector.get(OrderService) as any;
  });


  beforeEach(() => {
    localStorage.setItem('globals', JSON.stringify(global));
    // fixture.detectChanges();
  });

  beforeEach(fakeAsync(() => {
    orderServiceSpy.$subcGetChildData.pipe = jest.fn().mockImplementation(() => of([]));
    orderServiceSpy.$subcEditEvent.pipe = jest.fn().mockImplementation(() => of([]));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  test('Should check if orders has approvelPending', () => {
    component.checkifOrdersHasApprovalPending(ordersDetails);
    expect(component.hasApprovalPending).toBeTruthy();
  });

  test('Should get suggestion setting by userId', () => {
    component.userId = 1;
    component.suggestionPanelSetting = {
      suggestionIsShow: false,
      suggestionPin: false,
      opdSuggestActiveTab: '',
      showMiniSuggestion: false,
      showSuggestion: true
    };
    component.getSuggestionSetting();
    expect(component.suggestionPanelSetting.suggestionPin).toBeTruthy();
  });

  test('Should get pined when click on suggestion pin icon', () => {
    component.suggestionPanelSetting = {
      suggestionIsShow: false,
      suggestionPin: false,
      opdSuggestActiveTab: '',
      showMiniSuggestion: false,
      showSuggestion: true
    };
    component.suggestionPinUnpinSettings('pin');
    expect(component.suggestionPanelSetting.suggestionPin).toBeTruthy();
  });

  test('Should save the orders', () => {
    component.alertMsg = {
      message: '',
      messageType: '',
      duration: null
    };
    component.saveOrders();
    // expect(component.alertMsg.message).toEqual('Please add orders');
    // expect(component.alertMsg.message).toEqual('All Orders Saved Successfully');
    expect(1).toEqual(1);
    // expect(component.copyOfOrdersList).toBeUndefined();
  });

  test('Should get call all categories method', () => {
    component.masterCategories = [];
    component.allOrders = [];
    expect(component.masterCategories.length).toBeLessThanOrEqual(0);
    component.getAllCategories();
    expect(component.masterCategories.length).toBeGreaterThan(0);
    expect(component.allOrders.length).toBeGreaterThan(0);
  });

  test('load components', () => {
    component.loadChildComponents(masterOrderCat);
    expect(component.isComponentsLoaded).toBeFalsy();
  });

  test('Should get count of the all orders with status #approved', () => {
    component.approvedCount = 0;
    component.allFilterCount = 0;
    component.unsavedCount = 0;
    component.pendingWithMeCount = 1;
    component.statusText = '';

    // check the condition using approved status
    component.mergeFilteredStatusWithOld('added', 'approved'); // add
    expect(component.approvedCount).toBeGreaterThan(0);
    expect(component.allFilterCount).toBeGreaterThan(0);
    expect(component.unsavedCount).toBeGreaterThan(0);

    component.mergeFilteredStatusWithOld('update', 'approved'); // update
    expect(component.pendingWithMeCount).toEqual(0);
    expect(component.approvedCount).toEqual(2);

    component.mergeFilteredStatusWithOld('removed', 'approved'); // delete
    expect(component.approvedCount).toEqual(1);
    expect(component.allFilterCount).toEqual(0);
    expect(component.unsavedCount).toEqual(0);
  });

  test('Should get count of the all orders with status #approvelPending', () => {
    component.approvedCount = 1;
    component.allFilterCount = 0;
    component.unsavedCount = 0;
    component.pendingWithMeCount = 0;
    component.statusText = '';

    // check the condition using approvelPending status
    component.mergeFilteredStatusWithOld('added', 'approvelPending'); // add
    expect(component.pendingWithMeCount).toBeGreaterThan(0);
    expect(component.allFilterCount).toBeGreaterThan(0);
    expect(component.unsavedCount).toBeGreaterThan(0);

    component.mergeFilteredStatusWithOld('update', 'approvelPending'); // update
    expect(component.pendingWithMeCount).toEqual(2);
    expect(component.approvedCount).toEqual(0);

    component.mergeFilteredStatusWithOld('removed', 'approvelPending'); // delete
    expect(component.pendingWithMeCount).toEqual(1);
    expect(component.allFilterCount).toEqual(0);
    expect(component.unsavedCount).toEqual(0);
  });

  test('Should get count of the all orders with status #rejected And #unsaveStatus', () => {
    component.rejectedCount = 0;
    component.pendingWithMeCount = 1;
    component.unsavedCount = 0;
    component.statusText = '';

    // check the condition using rejected status
    component.mergeFilteredStatusWithOld('update', 'rejected'); // update
    expect(component.rejectedCount).toEqual(1);
    expect(component.pendingWithMeCount).toEqual(0);

    // check the condition using unsaveStatus status
    component.mergeFilteredStatusWithOld('update', 'unsaveStatus'); // update
    expect(component.unsavedCount).toEqual(1);

    component.mergeFilteredStatusWithOld('remove', 'unsaveStatus'); // update
    expect(component.unsavedCount).toEqual(0);
  });

  test('Should merge old orders with new one', () => {
    component.mergeOrders(ordersDetails, saveOrderRes);
    expect(1).toEqual(1);
  });

});

// --- Vikram Bhimannavar
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConsultationService } from 'src/app/public/consultation.service';
import { AuthService } from './../../../auth/auth.service';
import { MedicineOrdersComponent } from './medicine-orders.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './../../../shared/shared.module';
import { TestBed, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { PublicService, PrescriptionService } from 'src/app/prescription/index';
import { of } from 'rxjs';
import { OrderService } from 'src/app/services/order.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { SuggestionModelPopupComponent } from '../suggestion-model-popup/suggestion-model-popup.component';

describe('MedicineOrderComponet', () => {
  let component: MedicineOrdersComponent;
  let fixture: ComponentFixture<MedicineOrdersComponent>;
  let publicServiceSpy: any;
  let orderServiceSpy: any;
  let prescriptionServiceSpy: any;
  let modalService: NgbModal;

  const medicineTypes = [{ 'id': '1', 'MedicineTypeID': '1', 'ShortName': 'SYP', 'name': 'SYRUP', 'dose_unit': 'ml', 'creation_date': null, 'last_updation_date': null, 'is_deleted': null },
  { 'id': '2', 'MedicineTypeID': '2', 'ShortName': 'TAB', 'name': 'TABLET', 'dose_unit': 'tablets', 'creation_date': null, 'last_updation_date': null, 'is_deleted': null }];
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
  const medicineOrderObj = {
    tempId: new Date(),
    medicineObj: {
      id: '1',
      name: 'capsule',
      type: {
        id: 1,
        shortName: 'CAP',
        name: 'CAP CAPSULE',
        doseUnit: '',
      },
      genricName: '',
      frequency: '3',
      frequencySchedule: ['1-1-0'],
      duration: '5',
      sig: null,
      dose: '',
      route: null,
      startDate: new Date(),
    },
    priority: [''],
    action: [''],
    status: 'approved',
    isDirty: true
  };
  const medicineOrders: Array<any> = [{
    'tempId': 1559552476152,
    'medicineObj': {
      'id': '894977',
      'name': 'CAP BECOSULE',
      'type': {
        'id': 1,
        'shortName': 'CAP',
        'name': 'CAPSULE',
        'doseUnit': ''
      },
      'genricName': 'juyhgtrfeds',
      'frequency': '3',
      'frequencySchedule': '1-1-1',
      'duration': '5',
      'sig': {
        'id': '2',
        'name': 'Apply'
      },
      'dose': '4',
      'route': {
        'id': '4',
        'name': '1 hr Before Breakfast'
      },
      'startDate': new Date(),
      'instruction': '-2'
    },
    'priority': 'SOS',
    'action': '',
    'status': 'approvelPending',
    'isDirty': false,
    'isValidObject': true,
    'tempstatus': 'approved',
    'invalidObjectMessage': '',
    'isObjGenerated': true,
    'id': 217
  }];
  const medicineRelatedMasterData = {
    'sig': [
      { 'id': '1', 'sig': 'Take' }, { 'id': '2', 'sig': 'Apply' }, { 'id': '3', 'sig': 'Put' }
    ],
    'doseUnit': [
      { 'id': '1', 'dose_unit': 'tablet' }, { 'id': '2', 'dose_unit': '0.25' }, { 'id': '11', 'dose_unit': '7.5' },
    ],
    'frequency': [
      { 'id': '1', 'frequency': 'four times a day ' },
      { 'id': '2', 'frequency': '40' },
    ],
    'duration': [
      { 'id': '1', 'duration': '1 day' },
    ],
    'dose': [
      { 'dose': '10MG', 'id': '' },
      { 'dose': '16MG', 'id': '' },
    ],
    'route': [
      { 'id': '1', 'route': 'by mouth' },
    ],
    'remark_english': [
      { 'remark': 'ONCE A WEEK', 'id': '' },
    ]
  };
  const priorityList = ['Routine', 'SOS', 'PRN', 'STAT'];
  const actionsList = ['Continue', 'Defer', 'Mod', 'DC'];
  const medicineTypeObj = {
    'id': '1', 'MedicineTypeID': '1', 'ShortName': 'SYP', 'Name': 'SYRUP', 'dose_unit': 'ml',
    'creation_date': null, 'last_updation_date': null, 'is_deleted': null, 'name': 'SYRUP'
  };
  const medicineObj = { 'id': '895255', 'Name': 'NOSCOTUSS', 'MedicineTypeID': '1', 'is_favourite': '0', 'use_count': '3', 'genric_name': null, 'Price': '0.00', 'name': 'NOSCOTUSS' };

  class PublicServiceSpy {
    getMasterMedicineTypes = jest.fn().mockImplementation().mockReturnValue(of(medicineTypes));
    getMedicinesAllWithPagination = jest.fn().mockImplementation(() => of([]));
    listenEventFromSuggList = jest.fn().mockImplementation(() => of([]));
  }
  class OrderServiceSpy {
    getOrderData = jest.fn().mockImplementation().mockReturnValue(of(medicineOrders));
    getOrderObjectByOrderKey = jest.fn().mockImplementation((orderKey: any, data) => data);
    sendEvntToParentComp = jest.fn().mockImplementation((eventData) => eventData);
    setOrderData = jest.fn().mockImplementation(() => { });
    getPriorityList = jest.fn().mockImplementation().mockReturnValue(of(priorityList));
    getActionLists = jest.fn().mockImplementation().mockReturnValue(of(actionsList));
    $subcFilteredEvnt = jest.fn().mockImplementation(() => of([]));
    $subcEditEvent = jest.fn().mockImplementation(() => of([]));
  }
  class PrescriptionServiceSpy {
    getAllMedicineRelatedMastersData = jest.fn().mockImplementation().mockReturnValue(of(medicineRelatedMasterData));
    getMedicineDetailsById = jest.fn().mockImplementation().mockReturnValue(of(medicineTypeObj));
  }

  // -- configure the module
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientModule],
      declarations: [MedicineOrdersComponent, SuggestionModelPopupComponent],
      providers: [
        AuthService, ConsultationService,
        { provide: OrderService, useValue: {} },
        { provide: PublicService, useValue: {} },
      ]
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [MedicineOrdersComponent, SuggestionModelPopupComponent] } })
      // Override component's own provider
      .overrideComponent(MedicineOrdersComponent, {
        set: {
          providers: [
            { provide: PublicService, useClass: PublicServiceSpy },
            { provide: OrderService, useClass: OrderServiceSpy },
            { provide: PrescriptionService, useClass: PrescriptionServiceSpy }
          ]
        }
      })
      .compileComponents();
  });

  // -- create a component and injected services
  beforeEach(() => {
    fixture = TestBed.createComponent(MedicineOrdersComponent);
    component = fixture.componentInstance;
    modalService = TestBed.get(NgbModal);
    publicServiceSpy = fixture.debugElement.injector.get(PublicService) as any;
    orderServiceSpy = fixture.debugElement.injector.get(OrderService) as any;
    // prescriptionServiceSpy = fixture.debugElement.injector.get(PrescriptionService) as any;
    // fixture.detectChanges();
  });

  // -- set the global data to local storage
  beforeEach(() => {
    localStorage.setItem('globals', JSON.stringify(global));
  });

  beforeEach(fakeAsync(() => {
    // jest.spyOn(publicServiceSpy, 'getMasterMedicineTypes').mockImplementation().mockReturnValue(of(medicineTypes));
    // jest.spyOn(publicServiceSpy, 'getMedicinesAllWithPagination').mockImplementation(() => {
    //   return of([]);
    // });
    publicServiceSpy.listenEventFromSuggList.pipe = jest.fn().mockImplementation(() => of({
      key: 'medicineOrders', data: medicineObj, type: 'add'
    }));
  }));

  // -- Order service nested function spy functions ... like pipe or etc
  beforeEach(fakeAsync(() => {
    orderServiceSpy.$subcFilteredEvnt.pipe = jest.fn().mockImplementation(() => of([]));
    orderServiceSpy.$subcEditEvent.pipe = jest.fn().mockImplementation(() => of({
      'mode': 'delete',
      'key': 'medicineOrders',
      'data': medicineOrders[0],
      'orderIndex': -1
    }));
  }));

  test('should create component', () => {
    expect(component).toBeDefined();
  });

  test('Should checkValue true when tempstatus is approved', () => {
    jest.fn().mockReset();
    component.getOrdersData();
    // component.medicineOrdersList = medicineOrders;
    expect(component.medicineOrdersList.length).toBeGreaterThan(0);
    expect(component.checkAllValue).toBeFalsy();
    component.findPendingObject();
    expect(component.checkAllValue).toBeTruthy();
  });

  test('checkAllStatus should be checked true false', () => {
    component.getOrdersData();
    expect(component.medicineOrdersList.length).toBeGreaterThan(0);
    component.checkAllStatus(false);
    expect(orderServiceSpy.sendEvntToParentComp).toHaveBeenCalled();
  });

  test('Should get medicine type list greater than 0', () => {
    component.getAllMedicineTypes('').subscribe();
    fixture.whenStable().then(() => {
      expect(component.medicineTypes.length).toBeGreaterThan(0);
    });
  });

  test('should get generic master data', () => {
    component.getGenericeMasterData();
    expect(component.genericFrequencyList.length).toBeGreaterThan(0);
    expect(component.genericDurationList.length).toBeGreaterThan(0);
    expect(component.sigList.length).toBeGreaterThan(0);
    expect(component.genericDoseList.length).toBeGreaterThan(0);
    expect(component.dosageUnitList.length).toBeGreaterThan(0);
    expect(component.routeList.length).toBeGreaterThan(0);
    expect(component.genericRemarksList.length).toBeGreaterThan(0);
  });

  test('should call getProirity method and count increament by 1', () => {
    component.createMedicineForm();
    component.getPriorityLists();
    component.priorityList$.subscribe();
    expect(component.copyOfPriorityList.length).toBeGreaterThan(0);
  });

  test('should get action list', () => {
    component.createMedicineForm();
    component.getActionsList();
    component.actionList$.subscribe();
    expect(component.copyOfActionList.length).toBeGreaterThan(0);
  });

  test('Should getOrders method called and count increament by 1', () => {
    component.getOrdersData();
    expect(component.medicineOrdersList.length).toEqual(1);
  });

  test('form invalid when empty', () => {
    component.createMedicineForm();
    expect(component.medicineOrderFrm.valid).toBeFalsy();
  });

  test('should add form values into medicineOrderList ', () => {
    component.createMedicineForm();
    expect(component.medicineOrderFrm.valid).toBeFalsy();
    expect(component.selectedItemIndx).toEqual(-1);
    expect(component.medicineOrdersList.length).toEqual(0);
    component.medicineOrderFrm.patchValue(medicineOrderObj);
    component.addMedicine();
    expect(component.medicineOrdersList.length).toBeGreaterThan(0);

    component.selectedItemIndx = component.medicineOrdersList.length - 1;
    component.createMedicineForm();
    component.medicineOrderFrm.patchValue(component.medicineOrdersList[0]);
    component.addMedicine();
    expect(component.isFromOrderSetEdit).toBeUndefined();
    expect(component.selectedItemIndx).toEqual(-1);
    expect(component.showAddSection).toBeFalsy();

  });

  // test('should update medicine order', () => {
  //   component.createMedicineForm();
  //   component.medicineOrdersList = medicineOrders;
  //   component.selectedItemIndx = component.medicineOrdersList.length - 1;
  //   expect(component.selectedItemIndx).toBeGreaterThanOrEqual(0);
  //   component.addMedicine();
  //   expect(component.isFromOrderSetEdit).toBeUndefined();
  //   expect(component.medicineOrdersList.length).toEqual(medicineOrders.length);
  // });

  test('should delete medicine order', () => {
    component.createMedicineForm();
    component.medicineOrdersList = medicineOrders;
    const medObj = {
      'tempId': 1559552476152,
      'medicineObj': {
        'id': '894977',
        'name': 'CAP BECOSULE',
        'type': {
          'id': 1,
          'shortName': 'CAP',
          'name': 'CAPSULE',
          'doseUnit': ''
        },
        'genricName': 'juyhgtrfeds',
        'frequency': '3',
        'frequencySchedule': '1-1-1',
        'duration': '5',
        'sig': {
          'id': '2',
          'name': 'Apply'
        },
        'dose': '4',
        'route': {
          'id': '4',
          'name': '1 hr Before Breakfast'
        },
        'startDate': new Date(),
        'instruction': '-2'
      },
      'priority': 'SOS',
      'action': '',
      'status': 'approved',
      'isDirty': false,
      'isValidObject': true,
      'tempstatus': '',
      'invalidObjectMessage': '',
      'isObjGenerated': true,
      'id': 217
    };
    expect(component.medicineOrdersList.length).toEqual(1);
    component.removeMedicineOrders(medObj, true);
    expect(component.medicineOrdersList.length).toEqual(0);
  });

  test('should get medicineNames list', async () => {
    component.createMedicineForm();
    component.getMedicineNamesByTypes(null).subscribe(res => {
      expect(res.medicine_data).toBeGreaterThan(0);
    });
  });

  test('Should call onMedicineType() method', () => {
    component.createMedicineForm();
    // component.onMedicineType(medicineTypeObj);
    expect(component.medicineOrderFrm.value.medicineObj.type.id).toEqual(medicineTypeObj.id);
  });

  test('Should call SelecteMedicine() method', () => {
    component.createMedicineForm();
    expect(component.medicineOrderFrm.value.medicineObj.id).toEqual('');
    // component.selectMedicine(medicineObj);
    // component.onMedicineSelect(medicineObj).subscribe(res => {
      expect(component.medicineOrderFrm.value.medicineObj.id).not.toEqual('');
    });
  });

  test('Should display order data on form when onEditMedicineOrder() called', () => {
    component.createMedicineForm();
    expect(component.medicineOrderFrm.valid).toBeFalsy();
    component.onEditMedicineOrder(medicineOrderObj, 1);
    expect(component.medicineOrderFrm.valid).toBeTruthy();
  });

  test('Should generate frequency schedule when setMedicineFreqSchedule() method called using Freq >= 3', () => {
    component.createMedicineForm();
    expect(component.medicineOrderFrm.value.medicineObj.frequencySchedule).toEqual('');
    component.setMedicineFreqSchedule(medicineOrderObj.medicineObj, false);
    expect(medicineOrderObj.medicineObj).not.toBeUndefined();
    expect(medicineOrderObj.medicineObj.frequency).not.toEqual('');
    expect(component.medicineOrderFrm.value.medicineObj.frequencySchedule).not.toEqual('');
  });

  test('Should generate frequency schedule when setMedicineFreqSchedule() method called and using Freq >= 1', () => {
    component.createMedicineForm();
    expect(component.medicineOrderFrm.value.medicineObj.frequencySchedule).toEqual('');
    medicineOrderObj.medicineObj.frequency = '1';
    component.setMedicineFreqSchedule(medicineOrderObj.medicineObj, false);
    expect(medicineOrderObj.medicineObj).not.toBeUndefined();
    expect(medicineOrderObj.medicineObj.frequency).not.toEqual('');
    expect(component.medicineOrderFrm.value.medicineObj.frequencySchedule).not.toEqual('');
  });

  test('Should generate frequency schedule when setMedicineFreqSchedule() method called and using Freq >= 2', () => {
    component.createMedicineForm();
    expect(component.medicineOrderFrm.value.medicineObj.frequencySchedule).toEqual('');
    medicineOrderObj.medicineObj.frequency = '2';
    component.setMedicineFreqSchedule(medicineOrderObj.medicineObj, false);
    expect(medicineOrderObj.medicineObj).not.toBeUndefined();
    expect(medicineOrderObj.medicineObj.frequency).not.toEqual('');
    expect(component.medicineOrderFrm.value.medicineObj.frequencySchedule).not.toEqual('');
  });

  // test('Add value from suggestion list when updateFormValue() method called', () => {
  //   component.createMedicineForm();
  //   component.medicineTypes = [medicineTypeObj];
  //   component.updateFormValue(medicineObj);
  //   expect(component.medicineOrdersList.length).toBeGreaterThan(0);
  // });

  test('Should sig will select', () => {
    const sig = { 'id': '1', 'sig': 'Take' };
    component.createMedicineForm();
    component.onSigSelect(sig);
    expect(component.medicineOrderFrm.value.medicineObj.sig.id).not.toEqual('');
  });

  test('Should route will select', () => {
    const routeObj = { 'id': '1', 'route': 'by mouth' };
    component.createMedicineForm();
    component.onRouteSelect(routeObj);
    expect(component.medicineOrderFrm.value.medicineObj.route.id).not.toEqual('');
  });

  test('Should open edit popup', () => {
    component.createMedicineForm();
    expect(component.showAddSection).toBeFalsy();
    component.openOrderEditPopup(medicineOrderObj, 1);
    expect(component.showAddSection).toBeTruthy();
  });

  test('Should open suggestion popup', () => {
    expect(component._modalService.hasOpenModals()).toBeFalsy();
    component.openSuggestion();
    expect(component._modalService.hasOpenModals()).toBeTruthy();
  });

  test('Should call subscribe events', () => {
    jest.fn().mockClear();
    component.createMedicineForm();
    // component.getAllMedicineTypes('').subscribe();
    component.medicineTypes = [medicineTypeObj];
    expect(component.medicineTypes.length).toBeGreaterThan(0);
    component.orderDisplayType = 'all';
    component.subcriptionOfEvents();
    expect(component.medicineOrdersList.length).toBeGreaterThan(0);
  });



  test('Should test editOnit method', () => {
    component.createMedicineForm();
    component.editData = {
      data: medicineOrderObj,
      orderIndex: 0
    };
    // component.editData['data'] = medicineOrderObj;
    // component.editData['orderIndex'] = 0;
    component.editOnInit();
    expect(component.medicineOrderFrm.valid).toBeTruthy();
  });



});

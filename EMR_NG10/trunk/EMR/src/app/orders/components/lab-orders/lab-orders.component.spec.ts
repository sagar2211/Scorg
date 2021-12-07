//==========================================
// Title:  Lab-orders unit test case
// Author: sarojk
// Date:   21/6/19
// ==========================================
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { LabOrdersComponent } from './lab-orders.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicService, AuthService, PrescriptionService } from 'src/app/prescription';
import { of, from } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderService } from 'src/app/services/order.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InvestigationComponentListComponent } from '../investigation-component-list/investigation-component-list.component';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import { SuggestionModelPopupComponent } from '../suggestion-model-popup/suggestion-model-popup.component';

describe('LabOrdersComponent', () => {
  let component: LabOrdersComponent;
  let fixture: ComponentFixture<LabOrdersComponent>;
  // let publicServiceSpy: jasmine.SpyObj<PublicService>;
  let orderServiceSpy: any;
  let prescriptionServiceSpy: any;
  let publicServiceSpy: any;
  let modalService: NgbModal;
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

  const priorityList = ['Routine', 'SOS', 'PRN', 'STAT'];
  const actionsList = ['Continue', 'Defer', 'Mod', 'DC'];
  const labSpecimenList = [{ 'key': 'urine', 'value': 'Urine' }, { 'key': 'urine', 'value': 'Plasma' }];
  const labOrdersData = [{
    'isValidObject': false,
    'id': 690,
    'name': 'HBA1C',
    'labInvestigationObj': {
      'id': '3',
      'name': 'HBA1C',
      'label': 'HBA1C',
      'headId': '7',
      'comment': ''
    },
    'specimen': 'Urine',
    'startDateTime': '2019-06-14T06:22:32.219Z',
    'endDateTime': '2019-06-14T06:22:32.219Z',
    'priority': 'Routine',
    'action': '',
    'status': 'approved',
    'patientConsentNeeded': 'yes',
    'labInstruction': 'Lab instruction',
    'patientInstruction': 'Instruction ',
    'reason': '',
    'isDirty': false,
    'tempstatus': '',
    'componentList': [],
    'selectedComponentCount': 0,
    'invalidObjectMessage': '',
    'tempId': 1560435935725
  }];
  const mockLabOrderFormValue = {
    'isValidObject': true,
    'id': 691,
    'name': 'INR',
    'labInvestigationObj': {
      'id': '2',
      'name': 'INR',
      'label': 'INR',
      'headId': '7',
      'comment': ''
    },
    'specimen': 'Urine',
    'startDateTime': '2019-06-14T06:22:32.219Z',
    'endDateTime': '2019-06-14T06:22:32.219Z',
    'priority': 'Routine',
    'action': '',
    'status': 'approved',
    'patientConsentNeeded': 'yes',
    'labInstruction': 'Lab instruction',
    'patientInstruction': 'Instruction ',
    'reason': '',
    'isDirty': false,
    'tempstatus': '',
    'componentList': [],
    'selectedComponentCount': 0,
    'invalidObjectMessage': '',
    'tempId': 1560493377814,
    'recurring': ''
  };
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
  const getinvestigationData = {
    'name': 'cbc',
    'tempId': '',
    'specimen': '',
    'startDateTime': '2019-06-18T13:37:44.528Z',
    'recurring': '',
    'priority': 'Routine',
    'action': '',
    'status': 'approved',
    'patientConsentNeeded': 'no',
    'labInstruction': '',
    'patientInstruction': '',
    'reason': '',
    'componentList': [
      {
        'id': '22',
        'investigationId': '139',
        'isSelected': true,
        'parameterName': 'Basophil',
        'parameterData': {
          'age_range': {
            'min': '1',
            'max': '99',
            'parameter': 'years'
          },
          'value_range': [
            {
              'type': 'male',
              'min': '0',
              'max': '1',
              'operator': ''
            },
            {
              'type': 'female',
              'min': '0',
              'max': '1',
              'operator': ''
            }
          ]
        }
      }
    ],
    'selectedComponentCount': 1,
    'isDirty': true,
    'endDateTime': '2019-06-18T13:37:44.528Z',
    'labInvestigationObj': {
      'id': '139',
      'name': 'cbc',
      'label': 'cbc',
      'headId': '4',
      'comment': ''
    }
  };

  const suggestionLabOrderadd = {
    'key': 'labOrders',
    'data': {
      'id': '1',
      'name': 'HB',
      'comment': null,
      'date': null,
      'headId': null,
      'label': 'HB',
      'default_comment': null,
      'is_favourite': 1,
      'doc_id': '3070',
      'use_count': '0',
      'use_count_cardiac': '0',
      'investigation_head_id': '7',
      'checked': true
    },
    'type': 'add'
  };

  const suggestionLabOrderdelete = {'key': 'labOrders', 'data': 1, 'type': 'delete'};

// tslint:disable-next-line: max-line-length
  const selectedInvestigation = [{'id': '24', 'investigationId': '1', 'isSelected': true, 'parameterName': 'Haemoglobin', 'parameterData': {'age_range': {'min': '13', 'max': '100', 'parameter': 'years'}, 'value_range': [{'type': 'male', 'min': '13.5', 'max': '18', 'operator': ''}, {'type': 'female', 'min': '11.5', 'max': '16', 'operator': ''}]}}];

// tslint:disable-next-line: max-line-length
  const labtestList = {'data': [{'id': '139', 'label': 'cbc', 'default_comment': '', 'is_favourite': '0', 'doc_id': '3070', 'use_count': '0', 'use_count_cardiac': '0', 'investigation_head_id': '4', 'name': 'cbc'}], 'search_text': 'cbc', 'page_no': 1};

  // -- mock public service api

  class OrderServiceSpy {
    getPriorityList = jest.fn().mockImplementation().mockReturnValue(of(priorityList));
    getActionLists = jest.fn().mockImplementation().mockReturnValue(of(actionsList));
    getLabSpecimenList = jest.fn().mockImplementation().mockReturnValue(of(labSpecimenList));
    // $subcFilteredEvnt = jest.fn().mockImplementation().mockReturnValue(of({ data: '', key: 'labOrders' }));
    getOrderData = jest.fn().mockImplementation().mockReturnValue(of(labOrdersData));
    sendEvntToParentComp = jest.fn().mockImplementation(() => {});
    getComponentListForSelectedInvestigation = jest.fn().mockImplementation().mockReturnValue(of(selectedInvestigation));
    $subcFilteredEvnt = jest.fn().mockImplementation(() => {
      return of({ filterBy: 'labOrders', mode: 'setData' });
     });
  }

  class PrescriptionServiceSpy {
    getAllMedicineRelatedMastersData = jest.fn().mockImplementation().mockReturnValue(of(medicineRelatedMasterData));
  }

  class PublicServiceSpy {
    getInvestigationWithPaginationByType = jest.fn().mockImplementation().mockReturnValue(of(labtestList));
    listenEventFromSuggList = jest.fn().mockImplementation().mockReturnValue(of(null));
    // listenEventFromSuggList = jest.fn().mockImplementation().mockReturnValue(of(suggestionLabOrderdelete));
  }

  // -- configure the module
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LabOrdersComponent, InvestigationComponentListComponent, SuggestionModelPopupComponent],
      imports: [HttpClientTestingModule, SharedModule],
      providers: [AuthService,
        { provide: PrescriptionService, useValue: {} },
        { provide: PublicService, useValue: {} },
        { provide: OrderService, useValue: {} }]
    })
      // Override component's own provider
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [InvestigationComponentListComponent, SuggestionModelPopupComponent] } })
      .overrideComponent(LabOrdersComponent, {
        set: {
          providers: [
            { provide: PrescriptionService, useClass: PrescriptionServiceSpy },
            { provide: OrderService, useClass: OrderServiceSpy },
            { provide: PublicService, useClass: PublicServiceSpy }
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabOrdersComponent);
    component = fixture.componentInstance;
    publicServiceSpy = fixture.debugElement.injector.get(PublicService) as any;
    orderServiceSpy = fixture.debugElement.injector.get(OrderService) as any;
    prescriptionServiceSpy = fixture.debugElement.injector.get(PrescriptionService) as any;
    modalService = TestBed.get(NgbModal);
    // spyOn(component, 'subcriptionOfEvents').and.callFake(() => {
    //   orderServiceSpy.$subcFilteredEvnt.and.returnValue(of({ data: '', key: 'labOrders' }));
    // });
    orderServiceSpy.$subcFilteredEvnt.pipe = jest.fn().mockImplementation(() => {
      return of({mode: 'setData', filterBy: 'labOrders'});
    });
  });

  beforeEach(fakeAsync(() => {
    localStorage.setItem('globals', JSON.stringify(global));
  }));

  it('should be create Componet', () => {
    expect(component).toBeDefined();
  });

  it('should get proirity list', () => {
    component.setLabOrderFormData();
    component.getPriorityLists();
    component.priorityList$.subscribe();
    expect(component.labOrderForm.value).toBeTruthy();
  });

  it('should get Actions list', () => {
    component.setLabOrderFormData();
    component.getActionLists();
    component.actionList$.subscribe();
    expect(component.labOrderForm.value).toBeTruthy();
  });

  it('should get LabSpecimenList list', () => {
    component.setLabOrderFormData();
    component.getLabSpecimenList();
    component.labSpecimentList$.subscribe();
    expect(component.labOrderForm.value).toBeTruthy();
  });

  it('should get OrdersData list', () => {
    component.getOrdersData();
    expect(component.labOrderList.length).toBeGreaterThan(0);
  });

  it('Add Edit and Remove - Should increment lab then on remove should decrement count', () => {

    // check add
    component.setLabOrderFormData();
    expect(component.selectedItemIndx).not.toBeGreaterThan(0);
    component.labOrderForm.patchValue(mockLabOrderFormValue);
    component.addLabOrders();
    expect(component.labOrderList.length).toBeGreaterThan(0);

    // check edit
    component.selectedItemIndx = 0;
    component.labOrderForm.patchValue(mockLabOrderFormValue);
    component.addLabOrders();
    expect(component.selectedItemIndx).toEqual(-1);
    expect(component.labOrderList.length).toEqual(1);

    // check remove
    // component.labOrderModelInst[0].tempId = mockLabOrderFormValue.tempId;
    component.removeLabOrders(mockLabOrderFormValue);
    expect(component.labOrderList.length).toEqual(0);
  });
   it('call onEditLabOrder', () => {
    component.setLabOrderFormData();
    component.onEditLabOrder(mockLabOrderFormValue, 0);
    expect(component.labOrderForm.value).toBeTruthy();
   });

   it('call checkAllStatus', () => {
    mockLabOrderFormValue.status = 'approvelPending';
    component.labOrderList.push(mockLabOrderFormValue);
    let object = {
      target : {
        checked: true
      }
    };
    component.checkAllStatus(object);
    expect(mockLabOrderFormValue.isDirty).toEqual(true);
   });

   it('call  isExistPendingStatus check value for approvelPending', () => {
    mockLabOrderFormValue.status = 'approvelPending';
    component.labOrderList.push(mockLabOrderFormValue);
    component.filterBy = 'approvelPending';
    component.isExistPendingStatus(mockLabOrderFormValue);
    expect(component.isExistPendingStatus(mockLabOrderFormValue)).toEqual(false);
   });

   it('call  isExistPendingStatus check value for other then approvelPending', () => {
    component.labOrderList.push(mockLabOrderFormValue);
    component.filterBy = 'approved';
    component.isExistPendingStatus(mockLabOrderFormValue);
    expect(component.isExistPendingStatus(mockLabOrderFormValue)).toEqual(false);
   });

   it('call  findPendingObject and check value', () => {
    mockLabOrderFormValue.status = 'approvelPending';
    component.labOrderList.push(mockLabOrderFormValue);
    component.findPendingObject();
    expect(component.checkAllValue).toEqual(true);
   });

   it('get getGenericeMasterData', () => {
     component.getGenericeMasterData();
     expect(component.genericDurationList.length).toBeGreaterThan(0);
   });

   it('get  LabTestList according to search', () => {
    component.getAllLabTestList('cbc', 'Lab Test').subscribe();
    fixture.whenStable().then(() => {
      expect(component.labList.length).toBeGreaterThan(0);
    });
  });

   it('Should open suggestion popup', () => {
    expect(component._modalService.hasOpenModals()).toBeFalsy();
    component.openSuggestion();
    expect(component._modalService.hasOpenModals()).toBeTruthy();
  });

  it('onSelectTab event', () => {
    component.setLabOrderFormData();
    const obj = {'id': '8', 'name': 'Blood Group and Rh typing', 'label': 'Blood Group and Rh typing', 'headId': '7', 'comment': ''};
    component.onSelectLab(obj);
    expect(component.labOrderForm.value.labInvestigationObj).toEqual(obj);

    component.onSelectLab('');
    expect(component.labOrderForm.value.labInvestigationObj).toBeNull();
  });

  it('editOnInit', () => {
    const obj = {
      data: mockLabOrderFormValue,
      orderIndex: 0
    };
    component.setLabOrderFormData();
    component.editData = obj;
    component.editOnInit();
    expect(component.labOrderForm.value).toBeTruthy();
  });

  it('Should add lab from suggestion list', () => {
    component.orderDisplayType = 'all';
    const prevListCount = component.labOrderList.length;
    publicServiceSpy.listenEventFromSuggList.pipe = jest.fn().mockImplementation().mockReturnValue(of(suggestionLabOrderadd));
    component.subcriptionOfEvents();
    expect(component.labOrderList.length).toBeGreaterThan(0);
  });

  it('Should delete lab from suggestion list', () => {
    component.orderDisplayType = 'all';
    const prevListCount = component.labOrderList.length;
    publicServiceSpy.listenEventFromSuggList.pipe = jest.fn().mockImplementation().mockReturnValue(of(suggestionLabOrderdelete));
    component.subcriptionOfEvents();
    expect(component.labOrderList.length).toBeGreaterThan(0);
  });
   it('get getselectInvestigationComponentData', () => {
     component.setLabOrderFormData();
     component.getselectInvestigationComponentData(getinvestigationData, 'lab_form_add');
     expect(component.modelInstanceInvestigationPopup).toBeDefined();

    // close modal lab_form_add condtion
     component.componentPopupFrom = 'lab_form_add';
     component._modalService.dismissAll(getinvestigationData);
     expect(component.labOrderForm.value).toBeDefined();

    // // close modal lab_order_list condtion
    //  component.componentPopupFrom = 'lab_order_list';
    //  component.labOrderList.push(getinvestigationData);
    //  component._modalService.dismissAll(getinvestigationData);

    //  expect(component.labOrderList[0].selectedComponentCount).toBeGreaterThan(0);
   });
});

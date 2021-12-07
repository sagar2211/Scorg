import { Constants } from './../../../../config/constants';
import { AppointmentBookComponent } from './../appointment-book/appointment-book.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentService } from './../../services/appointment.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { SlotViewComponent } from './slot-view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { of } from 'rxjs';
import { SlotInfo } from '../../models/slot-info.model';

describe('SlotViewComponent', () => {
  let component: SlotViewComponent;
  let fixture: ComponentFixture<SlotViewComponent>;
  let appointmentServiceSpy: AppointmentServiceSpy;

  const appointmentSlots = {
    entityAlias: 'DOCTOR',
    entityName: 'DOCTOR',
    entityValueId: 213,
    entityValueName: 'ANIRUDH KULKARNI',
    slots: [{ "slotId": 85, "isBooked": false, "slotTime": "01:00 PM" }, { "slotId": 86, "isBooked": false, "slotTime": "01:20 PM" }, { "slotId": 87, "isBooked": false, "slotTime": "01:40 PM" }, { "slotId": 88, "isBooked": false, "slotTime": "02:00 PM" }, { "slotId": 89, "isBooked": false, "slotTime": "02:20 PM" }, { "slotId": 90, "isBooked": false, "slotTime": "02:40 PM" }, { "slotId": 91, "isBooked": false, "slotTime": "03:00 PM" }, { "slotId": 92, "isBooked": false, "slotTime": "03:20 PM" }, { "slotId": 93, "isBooked": false, "slotTime": "03:40 PM" }, { "slotId": 94, "isBooked": false, "slotTime": "04:00 PM" }, { "slotId": 95, "isBooked": false, "slotTime": "04:20 PM" }, { "slotId": 96, "isBooked": false, "slotTime": "04:40 PM" }, { "slotId": 97, "isBooked": false, "slotTime": "05:00 PM" }, { "slotId": 98, "isBooked": false, "slotTime": "05:20 PM" }, { "slotId": 99, "isBooked": false, "slotTime": "05:40 PM" }, { "slotId": 100, "isBooked": false, "slotTime": "06:00 PM" }, { "slotId": 101, "isBooked": false, "slotTime": "06:20 PM" }, { "slotId": 102, "isBooked": false, "slotTime": "06:40 PM" }, { "slotId": 103, "isBooked": false, "slotTime": "07:00 PM" }, { "slotId": 104, "isBooked": false, "slotTime": "07:20 PM" }, { "slotId": 105, "isBooked": false, "slotTime": "07:40 PM" }, { "slotId": 106, "isBooked": false, "slotTime": "08:00 PM" }, { "slotId": 107, "isBooked": false, "slotTime": "08:20 PM" }, { "slotId": 108, "isBooked": false, "slotTime": "08:40 PM" }, { "slotId": 73, "isBooked": false, "slotTime": "09:00 AM" }, { "slotId": 74, "isBooked": false, "slotTime": "09:20 AM" }, { "slotId": 75, "isBooked": false, "slotTime": "09:40 AM" }, { "slotId": 76, "isBooked": false, "slotTime": "10:00 AM" }, { "slotId": 77, "isBooked": false, 'slotTime': "10:20 AM" }, { slotId: 78, isBooked: false, slotTime: "10:40 AM" }, { slotId: 79, isBooked: false, slotTime: '11:00 AM' }, { slotId: 80, isBooked: false, slotTime: '11:20 AM' }, { slotId: 81, isBooked: false, slotTime: '11:40 AM' }, { slotId: 82, isBooked: false, slotTime: '12:00 PM' }, { slotId: 83, isBooked: false, slotTime: '12:20 PM' }, { slotId: 84, isBooked: false, slotTime: '12:40 PM' }],
    tokenType: 'FIXED',
    totalSlotCount: 36,
    usedSlotCount: 0
  };
  const selectAppointment = {
    config_id: 10118, entity_id: 2, entity_value_id: 213,
    entity_value_name: 'ANIRUDH KULKARNI', time_subdetail_id: '0', token_type: 'FIXED', default_time_per_patient: 20, entity_data: {
      appointment_type: 'EMERGENCY', appointment_type_id: 3,
      date: '26/09/2019', end_time: '10:30 AM', start_time: '09:00 AM', total_available_count: 0, total_slot_count: 0, used_slot_count: 0,
      slot_data: [{ slotId: 94, slotTime: '04:00 PM' }, { slotId: 95, slotTime: '04:20 PM' }, { slotId: 96, slotTime: '04:40 PM' },
      { slotId: 97, slotTime: '05:00 PM' }, { slotId: 98, slotTime: '05:20 PM' }, { slotId: 99, slotTime: '05:40 PM' }, { slotId: 100, slotTime: '06:00 PM' },
      { slotId: 101, slotTime: '06:20 PM' }, { slotId: 102, slotTime: '06:40 PM' }, { slotId: 103, slotTime: '07:00 PM' }, { slotId: 104, slotTime: '07:20 PM' },
      { slotId: 105, slotTime: '07:40 PM' }, { slotId: 106, slotTime: '08:00 PM' }, { slotId: 107, slotTime: '08:20 PM' }, { slotId: 108, slotTime: '08:40 PM' }],
      calDate: '26/09/2019'
    }
  };
  const searhParams = {
    entity_id: 2, entity_value_id: 0, speciality_id: 0, service_id: 0, appointment_type_id: 0, date: '09/26/2019', start_time: '',
    startDate: '2019-09-26T10:26:19.582Z', selectedEntity: { id: 2, name: 'DOCTOR', key: 'doctor' }, selectedServiceProvider: null, selectedDoctor: null,
    selectedSpeciality: null, appointmentType: null, selectedJointClinic: null, startHour: '', selectedService: null
  };

  class AppointmentServiceSpy {
    getAvailableAppointmentTimeSlot = jest.fn().mockImplementation(() => {
      return of(appointmentSlots);
    });
    // $patientInfo = jest.fn().mockImplementation(() => {
    //   return of(null);
    // });
    $patientInfo = jest.fn().mockImplementation(() => of([]));
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SlotViewComponent, AppointmentBookComponent],
      imports: [SharedModule, HttpClientTestingModule],
      providers: [{ provide: AppointmentService, useValue: {} }, NgbModal]
    })
      .overrideComponent(SlotViewComponent, {
        set: {
          providers: [
            { provide: AppointmentService, useClass: AppointmentServiceSpy }, NgbModal
          ]
        }
      })
      .compileComponents();
  }));

  // beforeEach(fakeAsync(() => {
  //   appointmentServiceSpy.$patientInfo['pipe'] = jest.fn().mockImplementation(() => of());
  // }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotViewComponent);
    component = fixture.componentInstance;
    appointmentServiceSpy = fixture.debugElement.injector.get(AppointmentService) as any;
    // fixture.detectChanges();
  });

  beforeEach(() => {
    component.morning = Constants.MORNING;
    component.noon = Constants.NOON;
    component.evening = Constants.EVENING;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get appointment slots', () => {
    const reqParams = {};
    component.searchParams = searhParams;
    component.appointmentData = selectAppointment;
    component.getSlots();
    expect(component.masterSlotData).not.toBeNull();
  });

  it('should get open book appointment dialogue', () => {
    const temp = [{ slotId: 97, isBooked: false, slotTime: '05:00 PM', timePassed: true, tempTime: '17:00' }, {
      slotId: 98, isBooked: false, slotTime: '05:20 PM',
      timePassed: true, tempTime: '17:20'
    }, { slotId: 99, isBooked: false, slotTime: '05:40 PM', timePassed: true, tempTime: '17:40' },
    { slotId: 100, isBooked: false, slotTime: '06:00 PM', timePassed: true, tempTime: '18:00' }, {
      slotId: 101, isBooked: false, slotTime: '06:20 PM', timePassed: false,
      tempTime: '18:20'
    }, { slotId: 102, isBooked: false, slotTime: '06:40 PM', timePassed: false, tempTime: '18:40' }, {
      slotId: 103, isBooked: false,
      slotTime: '07:00 PM', timePassed: false, tempTime: '19:00'
    }, { slotId: 104, isBooked: false, slotTime: '07:20 PM', timePassed: false, tempTime: '19:20' },
    { slotId: 105, isBooked: false, slotTime: '07:40 PM', timePassed: false, tempTime: '19:40' }, {
      slotId: 106, isBooked: false, slotTime: '08:00 PM', timePassed: false,
      tempTime: '20:00'
    }, { slotId: 107, isBooked: false, slotTime: '08:20 PM', timePassed: false, tempTime: '20:20' }, {
      slotId: 108, isBooked: false, slotTime: '08:40 PM',
      timePassed: false, tempTime: '20:40'
    }];
    // const tmempObj: SlotInfo;

    component.bookAppointment(temp[0], temp);
    expect(component.modelService.hasOpenModals).toBeTruthy();
  });

  // it('Should call subscription events', () => {
  //   component.subscribeEvents();
  //   expect(component.selectedPatient).toBeNull();
  // });
});

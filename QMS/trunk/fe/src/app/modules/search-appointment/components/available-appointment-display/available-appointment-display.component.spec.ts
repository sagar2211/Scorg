import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import {AvailableAppointmentDisplayComponent} from "./available-appointment-display.component";
import {ChartsModule} from "ng2-charts";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import * as moment from "moment";

describe('AvailableAppointmentDisplayComponent', () => {
  let component: AvailableAppointmentDisplayComponent;
  let fixture: ComponentFixture<AvailableAppointmentDisplayComponent>;
  const itemData = {
    entity_value_id: 1
  };
  const rowData = {
    date: new Date()
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedModule, HttpClientTestingModule, ChartsModule],
      declarations: [AvailableAppointmentDisplayComponent],
      providers: []
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [] } })
      .overrideComponent(AvailableAppointmentDisplayComponent, {
        set: {
          providers: []
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableAppointmentDisplayComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create available appointment display component', () => {
    expect(component).toBeTruthy();
  });

  // test('Should open add patient popup', () => {
  //   expect(component.appointmentBookModalService.hasOpenModals()).toBeFalsy();
  //   component.appointmentBookModal();
  //   expect(component.appointmentBookModalService.hasOpenModals()).toBeTruthy();
  // });

  // it('should set user id and date as per input parameters', () => {
  //   component.onAppointmentView('', itemData, rowData);
  //   expect(component.userId).toEqual(itemData.entity_value_id);
  //   expect(component.date).toEqual(moment(rowData.date, 'MM/DD/YYYY').format('DD/MM/YYYY'));
  // });

});

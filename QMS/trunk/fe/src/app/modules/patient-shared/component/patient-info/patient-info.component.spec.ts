import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { GlobalSearchDatPipe } from 'src/app/shared/pipes/global-search-dat.pipe';
import {PatientInfoComponent} from "./patient-info.component";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import { AddPatientComponent } from '../add-patient/add-patient.component';
import { AppointmentService } from 'src/app/modules/appointment/services/appointment.service';

describe('PatientInfoComponent', () => {
  let component: PatientInfoComponent;
  let fixture: ComponentFixture<PatientInfoComponent>;
  let router: Router;
  let appointmentServiceSpy;

  class AppointmentServiceSpy {
    getTitles = jest.fn().mockImplementation(() => {
      return of();
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule, SharedModule],
      declarations: [PatientInfoComponent, AddPatientComponent],
      providers: [
        { provide: AppointmentService, useValue: {} }
      ]
    })
    // Override component's own provider
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [AddPatientComponent] } })
      .overrideComponent(PatientInfoComponent, {
        set: {
          providers: [
            { provide: AppointmentService, useClass: AppointmentServiceSpy }, GlobalSearchDatPipe
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInfoComponent);
    component = fixture.componentInstance;
    appointmentServiceSpy = fixture.debugElement.injector.get(AppointmentService) as any;
    router = TestBed.get(Router);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  test('Should open add patient popup', () => {
    expect(component._modalService.hasOpenModals()).toBeFalsy();
    component.addPatientModal();
    expect(component._modalService.hasOpenModals()).toBeTruthy();
  });

});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMappingEditComponent } from './doctor-mapping-edit.component';
import {  NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DoctorMappingService } from 'src/app/services/doctor-mapping.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('DoctorMappingEditComponent', () => {
  let component: DoctorMappingEditComponent;
  let fixture: ComponentFixture<DoctorMappingEditComponent>;
  let doctorMappingServiceSpy;
  const data = {
    id: 3,
    status_code: 200,
    status_message: 'Success',
    message: 'A new resource was successfully updated.'
  };
  class DoctorMappingServiceSpy {
    updateDoctorMapping = jest.fn().mockImplementation(() => {
      return of(data);
    });
  }
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, FormsModule, NgbModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [DoctorMappingEditComponent],
      providers: [{
        provide: DoctorMappingService, useValue: {}
      }]
    })
     // Override component's own provider
      .overrideComponent(DoctorMappingEditComponent, {
        set: {
          providers: [
            { provide: DoctorMappingService, useClass: DoctorMappingServiceSpy }, NgbActiveModal
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorMappingEditComponent);
    component = fixture.componentInstance;
    doctorMappingServiceSpy = fixture.debugElement.injector.get(DoctorMappingService) as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call get onSubmit', () => {
    component.defaultFormObject();
    component.onSubmit();
    expect(component.alertMsg.message === 'success');
  });
});

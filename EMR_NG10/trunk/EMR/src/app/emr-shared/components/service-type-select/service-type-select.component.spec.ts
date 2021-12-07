import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTypeSelectComponent } from './service-type-select.component';

describe('ServiceTypeSelectComponent', () => {
  let component: ServiceTypeSelectComponent;
  let fixture: ComponentFixture<ServiceTypeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceTypeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

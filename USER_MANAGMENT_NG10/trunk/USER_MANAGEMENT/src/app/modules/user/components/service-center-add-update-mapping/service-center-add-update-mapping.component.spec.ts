import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCenterAddUpdateMappingComponent } from './service-center-add-update-mapping.component';

describe('ServiceCenterAddUpdateMappingComponent', () => {
  let component: ServiceCenterAddUpdateMappingComponent;
  let fixture: ComponentFixture<ServiceCenterAddUpdateMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceCenterAddUpdateMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCenterAddUpdateMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

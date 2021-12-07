import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsMappingComponent } from './vitals-mapping.component';

describe('VitalsMappingComponent', () => {
  let component: VitalsMappingComponent;
  let fixture: ComponentFixture<VitalsMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VitalsMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VitalsMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

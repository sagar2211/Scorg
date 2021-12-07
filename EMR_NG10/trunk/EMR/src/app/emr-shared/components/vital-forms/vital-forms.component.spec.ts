import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalFormsComponent } from './vital-forms.component';

describe('VitalFormsComponent', () => {
  let component: VitalFormsComponent;
  let fixture: ComponentFixture<VitalFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VitalFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VitalFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioInvestigationComponent } from './radio-investigation.component';

describe('RadioInvestigationComponent', () => {
  let component: RadioInvestigationComponent;
  let fixture: ComponentFixture<RadioInvestigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioInvestigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioInvestigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

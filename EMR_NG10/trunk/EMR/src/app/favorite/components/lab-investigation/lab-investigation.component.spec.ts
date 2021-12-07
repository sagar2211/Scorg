import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabInvestigationComponent } from './lab-investigation.component';

describe('LabInvestigationComponent', () => {
  let component: LabInvestigationComponent;
  let fixture: ComponentFixture<LabInvestigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabInvestigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInvestigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

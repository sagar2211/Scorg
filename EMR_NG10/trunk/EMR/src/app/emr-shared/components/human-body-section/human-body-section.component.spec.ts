import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HumanBodySectionComponent } from './human-body-section.component';

describe('HumanBodySectionComponent', () => {
  let component: HumanBodySectionComponent;
  let fixture: ComponentFixture<HumanBodySectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HumanBodySectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HumanBodySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

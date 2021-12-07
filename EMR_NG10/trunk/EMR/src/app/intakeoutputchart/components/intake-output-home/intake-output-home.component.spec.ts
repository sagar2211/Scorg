import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntakeOutputHomeComponent } from './intake-output-home.component';

describe('IntakeOutputHomeComponent', () => {
  let component: IntakeOutputHomeComponent;
  let fixture: ComponentFixture<IntakeOutputHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntakeOutputHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntakeOutputHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntakeOutputComponent } from './intake-output.component';

describe('IntakeOutputComponent', () => {
  let component: IntakeOutputComponent;
  let fixture: ComponentFixture<IntakeOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntakeOutputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntakeOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

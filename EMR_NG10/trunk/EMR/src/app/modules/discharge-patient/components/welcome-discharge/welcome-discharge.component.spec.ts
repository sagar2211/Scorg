import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeDischargeComponent } from './welcome-discharge.component';

describe('WelcomeDischargeComponent', () => {
  let component: WelcomeDischargeComponent;
  let fixture: ComponentFixture<WelcomeDischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WelcomeDischargeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeDischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

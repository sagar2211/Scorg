import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeNursingComponent } from './welcome-nursing.component';

describe('WelcomeNursingComponent', () => {
  let component: WelcomeNursingComponent;
  let fixture: ComponentFixture<WelcomeNursingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WelcomeNursingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeNursingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

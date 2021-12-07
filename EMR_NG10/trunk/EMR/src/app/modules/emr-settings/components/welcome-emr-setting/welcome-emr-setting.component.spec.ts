import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeEmrSettingComponent } from './welcome-emr-setting.component';

describe('WelcomeEmrSettingComponent', () => {
  let component: WelcomeEmrSettingComponent;
  let fixture: ComponentFixture<WelcomeEmrSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WelcomeEmrSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeEmrSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

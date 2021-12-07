import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeathRegisterHomeComponent } from './death-register-home.component';

describe('DeathRegisterHomeComponent', () => {
  let component: DeathRegisterHomeComponent;
  let fixture: ComponentFixture<DeathRegisterHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeathRegisterHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeathRegisterHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

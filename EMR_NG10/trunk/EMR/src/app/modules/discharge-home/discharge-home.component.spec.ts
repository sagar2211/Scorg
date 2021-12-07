import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeHomeComponent } from './discharge-home.component';

describe('DischargeHomeComponent', () => {
  let component: DischargeHomeComponent;
  let fixture: ComponentFixture<DischargeHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargeHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

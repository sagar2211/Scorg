import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HMISHomeComponent } from './hmis-home.component';

describe('HMISHomeComponent', () => {
  let component: HMISHomeComponent;
  let fixture: ComponentFixture<HMISHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HMISHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HMISHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

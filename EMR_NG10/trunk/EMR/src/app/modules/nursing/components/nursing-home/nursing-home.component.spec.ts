import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingHomeComponent } from './nursing-home.component';

describe('NursingHomeComponent', () => {
  let component: NursingHomeComponent;
  let fixture: ComponentFixture<NursingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NursingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingMainHomeComponent } from './nursing-main-home.component';

describe('NursingMainHomeComponent', () => {
  let component: NursingMainHomeComponent;
  let fixture: ComponentFixture<NursingMainHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingMainHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NursingMainHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

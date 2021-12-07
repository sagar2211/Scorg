import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HimsHomeComponent } from './hims-home.component';

describe('HimsHomeComponent', () => {
  let component: HimsHomeComponent;
  let fixture: ComponentFixture<HimsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HimsHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HimsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

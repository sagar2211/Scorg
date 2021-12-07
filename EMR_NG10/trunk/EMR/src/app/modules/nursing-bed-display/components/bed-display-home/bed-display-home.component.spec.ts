import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedDisplayHomeComponent } from './bed-display-home.component';

describe('BedDisplayHomeComponent', () => {
  let component: BedDisplayHomeComponent;
  let fixture: ComponentFixture<BedDisplayHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedDisplayHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BedDisplayHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

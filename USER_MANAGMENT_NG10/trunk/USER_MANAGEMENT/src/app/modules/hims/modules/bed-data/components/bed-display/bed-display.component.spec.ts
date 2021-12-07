import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedDisplayComponent } from './bed-display.component';

describe('BedDisplayComponent', () => {
  let component: BedDisplayComponent;
  let fixture: ComponentFixture<BedDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BedDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

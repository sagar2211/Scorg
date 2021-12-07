import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedDataHomeComponent } from './bed-data-home.component';

describe('BedDataHomeComponent', () => {
  let component: BedDataHomeComponent;
  let fixture: ComponentFixture<BedDataHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedDataHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BedDataHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

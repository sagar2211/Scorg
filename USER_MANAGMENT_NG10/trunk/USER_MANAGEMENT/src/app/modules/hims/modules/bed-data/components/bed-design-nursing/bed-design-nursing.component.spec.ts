import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedDesignNursingComponent } from './bed-design-nursing.component';

describe('BedDesignNursingComponent', () => {
  let component: BedDesignNursingComponent;
  let fixture: ComponentFixture<BedDesignNursingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedDesignNursingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BedDesignNursingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

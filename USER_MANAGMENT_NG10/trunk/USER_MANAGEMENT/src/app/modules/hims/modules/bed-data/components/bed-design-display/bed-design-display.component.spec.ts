import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedDesignDisplayComponent } from './bed-design-display.component';

describe('BedDesignDisplayComponent', () => {
  let component: BedDesignDisplayComponent;
  let fixture: ComponentFixture<BedDesignDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedDesignDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BedDesignDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

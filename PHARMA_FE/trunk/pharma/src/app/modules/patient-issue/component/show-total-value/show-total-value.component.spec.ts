import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTotalValueComponent } from './show-total-value.component';

describe('ShowTotalValueComponent', () => {
  let component: ShowTotalValueComponent;
  let fixture: ComponentFixture<ShowTotalValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowTotalValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowTotalValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

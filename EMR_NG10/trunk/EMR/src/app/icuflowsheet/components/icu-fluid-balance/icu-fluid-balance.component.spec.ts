import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuFluidBalanceComponent } from './icu-fluid-balance.component';

describe('IcuFluidBalanceComponent', () => {
  let component: IcuFluidBalanceComponent;
  let fixture: ComponentFixture<IcuFluidBalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuFluidBalanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuFluidBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

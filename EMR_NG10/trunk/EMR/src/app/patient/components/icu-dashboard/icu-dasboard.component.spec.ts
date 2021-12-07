import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuDashboardComponent } from './icu-dasboard.component';

describe('IcuDashboardComponent', () => {
  let component: IcuDashboardComponent;
  let fixture: ComponentFixture<IcuDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

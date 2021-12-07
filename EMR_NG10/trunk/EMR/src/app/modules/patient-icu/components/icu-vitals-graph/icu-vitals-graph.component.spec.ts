import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuVitalsGraphComponent } from './icu-vitals-graph.component';

describe('IcuVitalsGraphComponent', () => {
  let component: IcuVitalsGraphComponent;
  let fixture: ComponentFixture<IcuVitalsGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuVitalsGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuVitalsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

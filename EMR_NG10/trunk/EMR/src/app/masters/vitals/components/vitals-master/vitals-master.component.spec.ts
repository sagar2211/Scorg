import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsMasterComponent } from './vitals-master.component';

describe('VitalsMasterComponent', () => {
  let component: VitalsMasterComponent;
  let fixture: ComponentFixture<VitalsMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VitalsMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VitalsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

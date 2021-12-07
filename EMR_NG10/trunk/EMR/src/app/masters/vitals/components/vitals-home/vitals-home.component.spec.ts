import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsHomeComponent } from './vitals-home.component';

describe('VitalsHomeComponent', () => {
  let component: VitalsHomeComponent;
  let fixture: ComponentFixture<VitalsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VitalsHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VitalsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

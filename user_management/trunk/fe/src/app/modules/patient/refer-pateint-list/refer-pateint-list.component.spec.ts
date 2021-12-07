import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferPateintListComponent } from './refer-pateint-list.component';

describe('ReferPateintListComponent', () => {
  let component: ReferPateintListComponent;
  let fixture: ComponentFixture<ReferPateintListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferPateintListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferPateintListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

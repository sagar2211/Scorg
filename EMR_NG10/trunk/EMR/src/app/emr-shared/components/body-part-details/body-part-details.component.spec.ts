import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyPartDetailsComponent } from './body-part-details.component';

describe('BodyPartDetailsComponent', () => {
  let component: BodyPartDetailsComponent;
  let fixture: ComponentFixture<BodyPartDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BodyPartDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyPartDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

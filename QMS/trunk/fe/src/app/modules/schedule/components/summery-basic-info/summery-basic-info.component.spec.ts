import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummeryBasicInfoComponent } from './summery-basic-info.component';

describe('SummeryBasicInfoComponent', () => {
  let component: SummeryBasicInfoComponent;
  let fixture: ComponentFixture<SummeryBasicInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummeryBasicInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummeryBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

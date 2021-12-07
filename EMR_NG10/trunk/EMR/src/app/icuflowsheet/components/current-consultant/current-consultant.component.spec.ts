import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentConsultantComponent } from './current-consultant.component';

describe('CurrentConsultantComponent', () => {
  let component: CurrentConsultantComponent;
  let fixture: ComponentFixture<CurrentConsultantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentConsultantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

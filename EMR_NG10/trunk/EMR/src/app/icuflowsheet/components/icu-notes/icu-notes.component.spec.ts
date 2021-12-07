import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuNotesComponent } from './icu-notes.component';

describe('IcuNotesComponent', () => {
  let component: IcuNotesComponent;
  let fixture: ComponentFixture<IcuNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

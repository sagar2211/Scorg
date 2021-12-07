import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitysettingpopoverComponent } from './entitysettingpopover.component';

describe('EntitysettingpopoverComponent', () => {
  let component: EntitysettingpopoverComponent;
  let fixture: ComponentFixture<EntitysettingpopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitysettingpopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitysettingpopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

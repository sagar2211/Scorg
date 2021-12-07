import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityValueComponent } from './entity-value.component';

describe('EntityValueComponent', () => {
  let component: EntityValueComponent;
  let fixture: ComponentFixture<EntityValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

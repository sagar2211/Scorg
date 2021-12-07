import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityBlockSlotListComponent } from './entity-block-slot-list.component';

describe('EntityBlockSlotListComponent', () => {
  let component: EntityBlockSlotListComponent;
  let fixture: ComponentFixture<EntityBlockSlotListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityBlockSlotListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityBlockSlotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

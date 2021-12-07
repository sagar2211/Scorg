import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityInstructionComponent } from './entity-instruction.component';

describe('EntityInstructionComponent', () => {
  let component: EntityInstructionComponent;
  let fixture: ComponentFixture<EntityInstructionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityInstructionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

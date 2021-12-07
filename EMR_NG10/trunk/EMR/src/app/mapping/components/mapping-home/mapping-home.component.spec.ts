import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingHomeComponent } from './mapping-home.component';

describe('MappingHomeComponent', () => {
  let component: MappingHomeComponent;
  let fixture: ComponentFixture<MappingHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

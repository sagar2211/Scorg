import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseMappingHomeComponent } from './nurse-mapping-home.component';

describe('NurseMappingHomeComponent', () => {
  let component: NurseMappingHomeComponent;
  let fixture: ComponentFixture<NurseMappingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NurseMappingHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NurseMappingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

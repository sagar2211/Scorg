import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialMlcHomeComponent } from './partial-mlc-home.component';

describe('PartialMlcHomeComponent', () => {
  let component: PartialMlcHomeComponent;
  let fixture: ComponentFixture<PartialMlcHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartialMlcHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialMlcHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EntityRulesComponent } from './entity-rules.component';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EntitityCommonDataService } from 'src/app/services/entitity-common-data.service';
import { EntitityRulesService } from 'src/app/services/entitity-rules.service';
import { of } from 'rxjs';
import * as faker from 'faker';

describe('EntityRulesComponent', () => {
  let component: EntityRulesComponent;
  let fixture: ComponentFixture<EntityRulesComponent>;
  // let entitityCommonDataServiceSpy: jest.SpyInstance<EntitityCommonDataService>;
  let entitityRulesServiceSpy: jest.SpyInstance<EntitityRulesService>;

  let serviceListArray = [
    {
      id: 1,
      name: 'Service 1'
    },
    {
      id: 2,
      name: 'Service 2',
    },
    {
      id: 3,
      name: 'Service 3'
    },
    {
      id: 4,
      name: 'Service 4'
    }
  ];

  // class entitityCommonDataServiceSpy {

  // }

  class EntitityRulesServiceSpy {
    getServiceListArray = jest.fn().mockImplementation().mockReturnValue(of(serviceListArray));
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        FormGroup
      ],
      declarations: [EntityRulesComponent],
      providers: [
        { provide: EntitityCommonDataService, useValue: {} },
        { provide: EntitityRulesService, useValue: {} }
      ]
    })// Override component's own provider
      .overrideComponent(EntityRulesComponent, {
        set: {
          providers: [
            // { provide: EntitityCommonDataService, useClass: entitityCommonDataServiceSpy },
            { provide: EntitityRulesService, useClass: EntitityRulesServiceSpy }
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityRulesComponent);
    component = fixture.componentInstance;
    // entitityCommonDataServiceSpy = fixture.debugElement.injector.get(EntitityCommonDataService) as any;
    entitityRulesServiceSpy = fixture.debugElement.injector.get(EntitityRulesService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onload get services list by getServiceListArray', () => {
    console.log(component);
    // component.getServiceListArray();
   
    // expect(component.serviceList.length).toEqual(serviceListArray.length);
  });
});

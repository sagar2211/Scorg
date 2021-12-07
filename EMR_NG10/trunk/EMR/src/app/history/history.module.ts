import { polyfill as keyboardEventKeyPolyfill } from 'keyboardevent-key-polyfill';
import { FormatPScaleValPipe } from './format-pscale-val.pipe';
import { AuthGuard } from './../auth/auth.guard';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HistoryHomeComponent } from './components/history-home/history-home.component';
import { PatientHistoryComponent } from './components/patient-history/patient-history.component';
import { VisitHistoryComponent } from './components/visit-history/visit-history.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { CommonService } from './../public/services/common.service';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { SharedModule } from '../shared/shared.module';
import { HistoryRightSectionComponent } from './components/history-right-section/history-right-section.component';
import { VisitHistoryFilterComponent } from './components/visit-history-filter/visit-history-filter.component';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { HistoryService } from './history.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PatientHistoryFilterComponent } from './components/patient-history-filter/patient-history-filter.component';
// import { TreeModule } from 'angular-tree-component';
import { LeftTreeComponent } from './components/left-tree/left-tree.component';
import { EncounterHistoryComponent } from './components/encounter-history/encounter-history.component';
import { TreeModule } from '@circlon/angular-tree-component';

const historyRoutes: Routes = [
  {
    path: '', component: HistoryHomeComponent,
    canActivateChild: [AuthGuard, NgxPermissionsGuard],
    children: [
      {
        path: 'visit/:patientId',
        component: VisitHistoryComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Doctor_Dashboard_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'in_out_history/:patientId',
        component: PatientHistoryComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Doctor_Dashboard_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'encounter/:patientId',
        component: EncounterHistoryComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Doctor_Dashboard_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: '', redirectTo: 'visit',
      },
    ]
  }
];

@NgModule({
  declarations: [
    HistoryHomeComponent,
    PatientHistoryComponent,
    VisitHistoryComponent,
    HistoryRightSectionComponent,
    VisitHistoryFilterComponent,

    FormatPScaleValPipe,
    PatientHistoryFilterComponent,
    LeftTreeComponent,
    EncounterHistoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    RouterModule.forChild(historyRoutes),
    SharedModule,
    EmrSharedModule,
    InfiniteScrollModule,
    TreeModule
    // TreeModule.forRoot(),
  ],
  entryComponents: [
    // VisitHistoryFilterComponent,
    // PatientHistoryFilterComponent
  ],
  providers: [HistoryService, FormatPScaleValPipe],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class HistoryModule { }

import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes} from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { SlotByStatusPipe } from './pipes/slot-by-status.pipe';
import { QmsSideMenuComponent } from './components/qms-side-menu/qms-side-menu.component';
import { CardViewDisplayPipe } from './pipes/card-view-display.pipe';
import { PauseConfirmationComponent } from './components/pause-confirmation/pause-confirmation.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { TemplatesService } from 'src/app/modules/qms/services/templates.service';
import { FrontDeskEntityMappingService } from './services/front-desk-entity-mapping.service';
import { QueueService } from 'src/app/modules/qms/services/queue.service';
import { QDsiplayGridDetailsComponent } from './components/q-dsiplay-grid-details/q-dsiplay-grid-details.component';
import { QDisplayGridViewComponent } from './components/q-display-grid-view/q-display-grid-view.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QmsHomeComponent } from './components/qms-home/qms-home.component';
import { QlistSearchComponent } from './components/qlist-search/qlist-search.component';
import { OnlyNumbersDirective } from './../../directives/only-numbers.directive';
import { CallingConfirmComponent } from './components/calling-confirm/calling-confirm.component';
import { NgxPermissionsGuard, NgxPermissionsModule } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from './../../services/common.service';
import { SectionMasterService } from './services/section-master.service';
import { MaterialModule } from '../material/material-module';
import { QListComponent } from './components/qlist/qlist.component';
import { PrintReportsModule } from '../print-reports/print-reports.module';
import { QDisplayCardViewComponent } from './components/q-display-card-view/q-display-card-view.component';
import { QDisplayCardDetailsComponent } from './components/q-display-card-details/q-display-card-details.component';

const qmsRoutes: Routes = [
  {
    path: '', component: QmsHomeComponent,
    children: [
      {
        path: '', redirectTo: 'qList', pathMatch: 'full'
      },
      {
        path: 'qList',
        component: QListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Queue List',
          breadCrumInfo: {
            display: 'Queue List', route: '/app/qms/qList', redirectTo: '',
            isFilter: true, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.View_Queue,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks:[
            {
              displayName:'Doctor Dashboard',
              routeLink:'app/qms/dashboard/doctor',
              permission:PermissionsConstants.View_DoctorDashboard
            }
          ]
        }
      },
      // {
      //   path: 'appQlist',
      //   canActivate: [AuthGuard, NgxPermissionsGuard],
      //   data: {
      //     permissions: {
      //       only: PermissionsConstants.View_Room_Master,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   },
      //   loadChildren: () => import('../../modules/app-qlist/app-qlist.module').then(m => m.AppQListModule)
      // },
      {
        path: 'room',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/room/room.module').then(m => m.RoomModule)
      },
      // {
      //   path: 'queueDisplaySettings',
      //   component: QueueDisplaySettingsComponent,
      //   canActivate: [NgxPermissionsGuard],
      //   data: {
      //     displayName: 'Queue Display settings',
      //     breadCrumInfo: { display: 'Display Settings', route: '/app/qms/queueDisplaySettings' },
      //     permissions: {
      //       only: PermissionsConstants.View_Queue_Settings,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   }
      // },
      {
        path: 'roomSection',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Section_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/room-section/room-section.module').then(m => m.RoomSectionModule)
      },
      {
        path: 'section',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Section_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/section/section.module').then(m => m.SectionModule)
      },
      {
        path: 'mapping',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Section_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/mapping/mapping.module').then(m => m.MappingModule)
      },
      {
        path: 'entityRoom',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.View_Room_Entity_Mapping,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../../modules/room-entity/room-entity.module').then(m => m.RoomEntityModule)
      },
      // {
      //   path: 'receptionView', component: ReceptionViewComponent,
      //   canActivate: [NgxPermissionsGuard],
      //   data: {
      //     breadCrumInfo: { display: 'Reception View', route: 'app/qms/receptionView' },
      //     permissions: {
      //       only: PermissionsConstants.View_Receptionist_View,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   },
      // },
      // {
      //   path: 'entityUser',
      //   component: EntityUserComponent,
      //   canActivate: [NgxPermissionsGuard],
      //   data: {
      //     breadCrumInfo: { display: 'Entity User', route: 'app/qms/entityUser' },
      //     permissions: {
      //       only: PermissionsConstants.View_EntityUser,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   },
      // },
      {
        path: 'appointments',
        canActivate: [AuthGuard],
        loadChildren: () => import('./../appointment/appointment.module').then(m => m.AppointmentModule)
      },
      {
        path: 'schedule',
        canActivate: [AuthGuard],
        loadChildren: () => import('./../schedule/schedule.module').then(m => m.ScheduleModule)
      },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        loadChildren: () => import('./../reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadChildren: () => import('./../dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadChildren: () => import('./../settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'patient',
        canActivate: [AuthGuard],
        loadChildren: () => import('./../patient/patient.module').then(m => m.PatientModule)
      },
      {
        path: 'location',
        canActivate: [AuthGuard],
        loadChildren: () => import('../../modules/location/location.module').then(m => m.LocationModule)
      }
    ]
  }];

@NgModule({
  declarations: [
    QmsHomeComponent,
    // QueueDisplaySettingsComponent,
    SlotByStatusPipe,
    QmsSideMenuComponent,
    CardViewDisplayPipe,
    PauseConfirmationComponent,
    // ReceptionViewComponent,
    // EntityUserComponent,
    QDisplayGridViewComponent,
    QDsiplayGridDetailsComponent,
    QlistSearchComponent,
    OnlyNumbersDirective,
    CallingConfirmComponent,

    QListComponent,
    QDisplayCardViewComponent,
    QDisplayCardDetailsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(qmsRoutes),
    NgbModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    MaterialModule,
    PrintReportsModule
  ],
  entryComponents: [
    PauseConfirmationComponent,
    CallingConfirmComponent
  ],
  exports: [
    RouterModule,
    QDisplayGridViewComponent,
    QDsiplayGridDetailsComponent,
    QlistSearchComponent
  ],
  providers: [
    QueueService,
    FrontDeskEntityMappingService,
    TemplatesService,
    SectionMasterService
  ]
})
export class QmsModule { }

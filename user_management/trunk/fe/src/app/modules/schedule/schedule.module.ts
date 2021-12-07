// -- import modules
import { NgModule } from '@angular/core';
import { Routes, Router, RouterModule } from '@angular/router';
import { EntityBasicInfoComponent } from './components/entity-basic-info/entity-basic-info.component';
import { ScheduleMakerComponent } from './components/schedule-maker/schedule-maker.component';
import { EntityRulesComponent } from './components/entity-rules/entity-rules.component';
import { EntityInstructionComponent } from './components/entity-instruction/entity-instruction.component';
import { JointClinicModalComponent } from './components/joint-clinic-modal/joint-clinic-modal.component';
import { ScheduleSummeryComponent } from './components/schedule-summery/schedule-summery.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActiveSchedulesGridComponent } from './components/active-schedules-grid/active-schedules-grid.component';
import { SummeryBasicInfoComponent } from './components/summery-basic-info/summery-basic-info.component';
import { SummeryInstructionComponent } from './components/summery-instruction/summery-instruction.component';
import { SummeryRulesComponent } from './components/summery-rules/summery-rules.component';
// import { SummeryTimeScheduleComponent } from './components/summery-time-schedule/summery-time-schedule.component';
import { EntityProviderMasterComponent } from './components/entity-provider-master/entity-provider-master.component';
import { ScheduleHomeComponent } from './components/schedule-home/schedule-home.component';
import { CommonModule } from '@angular/common';
import { EntitityRulesService } from './services/entitity-rules.service';
import { ScheduleMakerService } from './services/schedule-maker.service';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from './../../services/common.service';
import { ScheduleEndDateExtendComponent } from './components/schedule-end-date-extend/schedule-end-date-extend.component';
import { ScheduleHistoryComponent } from './components/schedule-history/schedule-history.component';


const scheduleRoutes: Routes = [
  {
    path: '', component: ScheduleHomeComponent,
    children: [
      {
        path: '', redirectTo: 'activeScheduleList', pathMatch: 'full'
      },
      {
        path: 'activeScheduleList',
        component: ActiveSchedulesGridComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {
            display: 'Schedule', route: 'app/qms/schedule/activeScheduleList', redirectTo: 'app/qms/schedule/addScheduleMaster',
            isFilter: true, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_Schedule,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks:[
            {
              displayName:'Call center view',
              routeLink:'appointmentApp/appointments/searchAppointment',
              permission:PermissionsConstants.View_Call_Center_View
            },
            {
              displayName:'FrontDesk Dashboard',
              routeLink:'app/qms/dashboard/frontDesk',
              permission:PermissionsConstants.View_Front_Desk
            },
            {
              displayName:'Add Schedule',
              routeLink:'app/qms/schedule/addScheduleMaster',
              permission:PermissionsConstants.Add_Schedule
            }
          ]
        },
      },
      {
        path: 'addScheduleMaster',
        component: EntityProviderMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Schedule Master', route: 'app/qms/schedule/addScheduleMaster' },
          permissions: {
            only: PermissionsConstants.Add_Schedule,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks:[
            {
              displayName:'Schedule List',
              routeLink:'app/qms/schedule/activeScheduleList',
              permission: PermissionsConstants.View_Schedule
            },
            {
              displayName:'Room Entity Mappings',
              routeLink:'/app/qms/entityRoomMapList',
              permission: PermissionsConstants.View_Room_Entity_Mapping
            }
          ]
        },
      },
      {
        path: 'editScheduleMaster/:entityId/:providerId',
        component: EntityProviderMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Schedule Master', route: 'app/qms/schedule/editScheduleMaster' },
          permissions: {
            only: PermissionsConstants.Update_Schedule,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'updateTimeSchedule/:entityId/:providerId/:providerName/:scheduleId',
        component: ScheduleMakerComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Schedule Time', route: 'app/qms/schedule/updateTimeSchedule' },
          permissions: {
            only: PermissionsConstants.Add_TimeSchedule,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'addTimeSchedule',
        component: ScheduleMakerComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { displayName: 'Schedule Time' },
          permissions: {
            only: PermissionsConstants.Add_TimeSchedule,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
    ]
  }];

@NgModule({
  imports: [
    CommonModule,
    // NgSelectModule,
    RouterModule.forChild(scheduleRoutes),
    SharedModule,
    // FormsModule,
    // ReactiveFormsModule
  ],
  declarations: [
    ScheduleHomeComponent,
    ActiveSchedulesGridComponent,
    EntityBasicInfoComponent,
    ScheduleMakerComponent,
    EntityRulesComponent,
    EntityInstructionComponent,
    JointClinicModalComponent,
    ScheduleSummeryComponent,
    SummeryBasicInfoComponent,
    SummeryInstructionComponent,
    SummeryRulesComponent,
    // SummeryTimeScheduleComponent,
    EntityProviderMasterComponent,
    ScheduleEndDateExtendComponent,
    ScheduleHistoryComponent
  ],
  entryComponents: [
    JointClinicModalComponent,
    ScheduleEndDateExtendComponent,
    ScheduleHistoryComponent
  ],
  providers: [ScheduleMakerService, EntitityRulesService]
})
export class ScheduleModule { }

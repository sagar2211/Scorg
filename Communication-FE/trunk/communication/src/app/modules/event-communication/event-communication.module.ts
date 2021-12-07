import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCommunicationHomeComponent } from './components/event-communication-home/event-communication-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EventCommunicationComponent } from './components/event-communication/event-communication.component';

const communicationRoute: Routes = [
  {
    path: '', component: EventCommunicationHomeComponent,
    children: [
      {
        path: '', redirectTo: 'event', pathMatch: 'full'
      },
      {
        path: 'event',
        component: EventCommunicationComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Event Communication',
          breadCrumInfo: { display: 'Event Communication', route: 'app/qms/communication/eventCommunication' }
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
        }
      }
    ],
  }
];

@NgModule({
  declarations: [
    EventCommunicationHomeComponent,
    EventCommunicationComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(communicationRoute),
    NgxDatatableModule
  ]
})
export class EventCommunicationModule { }

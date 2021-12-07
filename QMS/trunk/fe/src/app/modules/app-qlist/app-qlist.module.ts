import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QlistHomeComponent } from './components/qlist-home/qlist-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { QListComponent } from './components/qlist/qlist.component';
import { QDisplayCardViewComponent } from './components/q-display-card-view/q-display-card-view.component';
import { PrintReportsModule } from '../print-reports/print-reports.module';
import { QmsQlistLibModule } from '@qms/qlist-lib';
import { QDisplayCardDetailsComponent } from './components/q-display-card-details/q-display-card-details.component';
import { MaterialModule } from '../material/material-module';

const qlistRoute: Routes = [
  {
    path: '', component: QlistHomeComponent,
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
          relatedLinks: [
            {
              displayName: 'Doctor Dashboard',
              routeLink: 'app/qms/dashboard/doctor',
              permission: PermissionsConstants.View_DoctorDashboard
            }
          ]
        }
      },
    ]
  }
];


@NgModule({
  declarations: [
    QlistHomeComponent,
    QListComponent,
    QDisplayCardViewComponent,
    QDisplayCardDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(qlistRoute),
    PrintReportsModule,
    MaterialModule,
    QmsQlistLibModule,
  ],
  exports: [
    RouterModule,
    QDisplayCardViewComponent,
    QDisplayCardDetailsComponent,
    QListComponent
  ],
})
export class AppQListModule { }

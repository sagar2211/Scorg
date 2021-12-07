import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsentHomeComponent } from './components/consent-home/consent-home.component';
import { ConsentViewComponent } from './components/consent-view/consent-view.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrintDataModule } from '../print-data/print-data.module';

const consentRoute: Routes = [
  {
    path: '', component: ConsentHomeComponent,
    children: [
      {
        path: '', redirectTo: 'forms', pathMatch: 'full'
      },
      {
        path: 'forms',
        component: ConsentViewComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Consent Forms',
          breadCrumInfo: {
            display: 'Consent Forms', route: '/emr/ot/master/roomMasterList', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            // only: PermissionsConstants.OT_Room_View,
            // redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    ConsentHomeComponent,
    ConsentViewComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(consentRoute),
    PrintDataModule
  ]
})
export class ConsentModule { }

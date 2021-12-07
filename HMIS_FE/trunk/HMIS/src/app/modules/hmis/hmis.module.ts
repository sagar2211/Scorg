import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HMISHomeComponent } from './components/hmis-home/hmis-home.component';

const lisRoute: Routes = [
  {
    path: '', component: HMISHomeComponent,
    children: [
      {
        path: '', redirectTo: 'forms', pathMatch: 'full'
      },
      // {
      //   path: 'forms',
      //   component: ConsentViewComponent,
      //   canActivate: [NgxPermissionsGuard],
      //   data: {
      //     displayName: 'Consent Forms',
      //     breadCrumInfo: {
      //       display: 'Consent Forms', route: '/hmis/ot/master/roomMasterList', redirectTo: '',
      //       isFilter: false, isAddPopup: true
      //     },
      //     permissions: {
      //       // only: PermissionsConstants.OT_Room_View,
      //       // redirectTo: CommonService.redirectToIfNoPermission
      //     },
      //     relatedLinks: []
      //   }
      // }
    ]
  }
];


@NgModule({
  declarations: [HMISHomeComponent],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(lisRoute)
  ]
})
export class HMISModule { }

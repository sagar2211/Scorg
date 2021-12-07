import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHomeComponent } from './components/section-home/section-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';
import { CommonService } from 'src/app/services/common.service';
import { SectionListComponent } from './components/section-list/section-list.component';
import { SectionMasterComponent } from './components/section-master/section-master.component';
import { PreviewQueueTemplateComponent } from './components/preview-queue-template/preview-queue-template.component';
import { TemplateDisplayShareModule } from '../template-display-share/template-display-share.module';

const sectionRoute: Routes = [
  {
    path: '', component: SectionHomeComponent,
    children: [
      {
        path: '', redirectTo: 'sectionList'
      },
      {
        path: 'sectionList',
        component: SectionListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Section List',
          breadCrumInfo: {
            display: 'Section List',
            route: '/app/qms/section/sectionList',
            redirectTo: 'app/qms/section/addSection',
            isFilter: false, isAddPopup: true, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.View_Section_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'addSection',
        component: SectionMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Add Section',
          breadCrumInfo: {
            display: 'Add Section',
            route: '/app/qms/section/addSection',
            redirectTo: '',
            isFilter: false, isAddPopup: false, btntext: 'ADD'
          },
          permissions: {
            only: PermissionsConstants.Add_Section_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
      {
        path: 'updateSection/:mapId',
        component: SectionMasterComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Update Section',
          breadCrumInfo: {
            display: 'Update Section',
            route: '/app/qms/section/updateSection:mapId',
            redirectTo: 'app/qms/section/updateSection:mapId',
            isFilter: false, isAddPopup: false, btntext: 'Update SECTION MASTER'
          },
          permissions: {
            only: PermissionsConstants.Update_Section_Master,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    SectionHomeComponent,
    SectionListComponent,
    SectionMasterComponent,
    PreviewQueueTemplateComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(sectionRoute),
    TemplateDisplayShareModule
  ],
  entryComponents: [
    PreviewQueueTemplateComponent
  ]
})
export class SectionModule { }

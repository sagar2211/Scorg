import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DisplayHomeComponent } from './components/display-home/display-home.component';
import { SharedModule } from '../../shared/shared.module';
import { TempQueueComponent } from './components/temp-queue/temp-queue.component';
import { TemplateDisplayShareModule } from '../template-display-share/template-display-share.module';
import { QListDisplayComponent } from './components/q-list-display/q-list-display.component';
const displayRoutes: Routes = [
  {
    path: '', component: DisplayHomeComponent,
    children: [
      {
        path: '', redirectTo: 'displayList', pathMatch: 'full'
      },
      {
        path: 'displayList/:sectionName/:templateName',
        component: QListDisplayComponent,
        data: {
          displayName: 'Display List',
        }
      },
      {
        path: 'displayListTemp',
        component: TempQueueComponent,
        data: {
          displayName: 'Display List',
        }
      }
    ]
  }];
@NgModule({
  declarations: [
    DisplayHomeComponent,
    TempQueueComponent,
    QListDisplayComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(displayRoutes),
    SharedModule,
    TemplateDisplayShareModule
  ]
})
export class DisplayModule { }

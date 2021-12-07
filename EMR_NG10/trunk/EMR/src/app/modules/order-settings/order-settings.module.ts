import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderSettingsHomeComponent } from './components/order-settings-home/order-settings-home.component';
import { OrderDefultStatusComponent } from './components/order-defult-status/order-defult-status.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const settingsRoutes: Routes = [
  {
    path: '', component: OrderSettingsHomeComponent,
    children: [
      {
        path: '', redirectTo: 'statusSetting', pathMatch: 'full'
      },
      {
        path: 'statusSetting',
        component: OrderDefultStatusComponent
      }
    ]
  }
];
@NgModule({
  declarations: [
    OrderSettingsHomeComponent,
    OrderDefultStatusComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(settingsRoutes)
  ]
})
export class OrderSettingsModule { }

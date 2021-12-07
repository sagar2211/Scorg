import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MastersHomeComponent } from './components/masters-home/masters-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from 'src/app/auth/auth.guard';

const masersRoute: Routes = [
  {
    path: '', component: MastersHomeComponent,
    children: [
      {
        path: '', redirectTo: 'suppliers', pathMatch: 'full'
      },
      {
        path: 'suppliers',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../supplier/supplier.module').then(m => m.SupplierModule)
      },
      {
        path: 'groups',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../groups/groups.module').then(m => m.GroupsModule)
      },
      {
        path: 'item',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../item/item.module').then(m => m.ItemModule)
      },
      {
        path: 'kit',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../item-kit/item-kit.module').then(m => m.ItemKitModule)
      },
      {
        path: 'store',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../store/store.module').then(m => m.StoreModule)
      },
      {
        path: 'tax',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../tax/tax.module').then(m => m.TaxModule)
      },
      {
        path: 'manufacture',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../manufacture/manufacture.module').then(m => m.ManufactureModule)
      },
      {
        path: 'generic',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../molecules/molecules.module').then(m => m.MoleculesModule)
      },
    ]
  }
];

@NgModule({
  declarations: [
    MastersHomeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(masersRoute),
    NgxDatatableModule
  ],
})
export class MastersModule { }

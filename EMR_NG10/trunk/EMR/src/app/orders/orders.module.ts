
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { LabOrdersComponent } from './components/lab-orders/lab-orders.component';
import { RadiologyOrdersComponent } from './components/radiology-orders/radiology-orders.component';
import { OrdersComponent } from './components/orders/orders.component';
import { NursingOrdersComponent } from './components/nursing-orders/nursing-orders.component';
import { DietOrdersComponent } from './components/diet-orders/diet-orders.component';
import { ReviewOrdersComponent } from './components/review-orders/review-orders.component';
import { SuggestionModelPopupComponent } from './components/suggestion-model-popup/suggestion-model-popup.component';
import { InvestigationComponentListComponent } from './components/investigation-component-list/investigation-component-list.component';
import { EditOrderComponent } from './components/edit-order/edit-order.component';
import { OrderSetComponent } from './components/order-set/order-set.component';
import { OrderSetDisplayComponent } from './components/order-set-display/order-set-display.component';
import { OrderByPipe } from './pipes/order-by.pipe';
import { OrderListFiltersComponent } from './components/order-list-filters/order-list-filters.component';
import { OrderSetListComponent } from './components/order-set-list/order-set-list.component';
import { AddEditOrderSetComponent } from './components/add-edit-order-set/add-edit-order-set.component';
import { EmrSharedModule } from './../emr-shared/emr-shared.module';
import { DoctorInformationComponent } from './components/doctor-information/doctor-information.component';
import { ConfirmationOrderPopupComponent } from './components/confirmation-order-popup/confirmation-order-popup.component';
import { AddOrderKeyboardComponent } from './components/add-order-keyboard/add-order-keyboard.component';
import { EMRService } from './../public/services/emr-service';
import { DynamicChartService } from './../dynamic-chart/dynamic-chart.service';

const orderRoutes: Routes = [
  {
    path: '', component: OrdersComponent,
    children: [
      // {
      //   path: '', redirectTo: 'ordersList',
      // },
      {
        path: 'ordersList/:patientId',
        component: OrdersComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Orders List', route: '/emr/patient/orders/ordersList/:patientId' },
          // permissions: {
          //   only: PermissionsConstants.Doctor_Dashboard_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
      {
        path: 'medicine/:patientId',
        component: OrdersComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Medicine Order', route: '/emr/patient/orders/medicine/:patientId' },
          // permissions: {
          //   only: PermissionsConstants.Doctor_Dashboard_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
      {
        path: 'lab/:patientId',
        component: OrdersComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Lab Order', route: '/emr/patient/orders/lab/:patientId' },
          // permissions: {
          //   only: PermissionsConstants.Doctor_Dashboard_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
      {
        path: 'radiology/:patientId',
        component: OrdersComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Radiology Order', route: '/emr/patient/orders/radiology/:patientId' },
          // permissions: {
          //   only: PermissionsConstants.Doctor_Dashboard_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
      {
        path: 'diet/:patientId',
        component: OrdersComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Diet Order', route: '/emr/patient/orders/diet/:patientId' },
          // permissions: {
          //   only: PermissionsConstants.Doctor_Dashboard_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
      {
        path: 'nursing/:patientId',
        component: OrdersComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Nursing Order', route: '/emr/patient/orders/nursing/:patientId' },
          // permissions: {
          //   only: PermissionsConstants.Doctor_Dashboard_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
      {
        path: 'orderSets/:patientId',
        component: OrderSetListComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Order Set', route: '/emr/patient/orders/orderSets/:patientId' },
          // permissions: {
          //   only: PermissionsConstants.Doctor_Dashboard_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
      {
        path: 'other/:patientId',
        component: OrdersComponent,
        data: {
          breadCrumInfo: {
            display: 'Other',
            route: '/emr/patient/orders/other/:patientId'
          }
        },
      },
      {
        path: 'add_order/:patientId',
        component: AddOrderKeyboardComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Add Order', route: 'emr/patient/orders/add_order/:patientId' },
          // permissions: {
          //   only: PermissionsConstants.Doctor_Dashboard_View,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    OrdersComponent,
    LabOrdersComponent,
    RadiologyOrdersComponent,
    NursingOrdersComponent,
    DietOrdersComponent,
    ReviewOrdersComponent,
    SuggestionModelPopupComponent,
    InvestigationComponentListComponent,
    EditOrderComponent,
    OrderSetDisplayComponent,
    OrderSetComponent,
    OrderByPipe,
    OrderListFiltersComponent,
    OrderSetListComponent,
    AddEditOrderSetComponent,
    DoctorInformationComponent,
    ConfirmationOrderPopupComponent,
    AddOrderKeyboardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(orderRoutes),
    EmrSharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    LabOrdersComponent,
    RadiologyOrdersComponent,
    NursingOrdersComponent,
    DietOrdersComponent,
    ReviewOrdersComponent,
    SuggestionModelPopupComponent,
    InvestigationComponentListComponent,
    EditOrderComponent,
    OrderSetComponent,
    OrderListFiltersComponent,
    AddEditOrderSetComponent,
    DoctorInformationComponent,
    ConfirmationOrderPopupComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [DynamicChartService, EMRService]
})
export class OrdersModule { }

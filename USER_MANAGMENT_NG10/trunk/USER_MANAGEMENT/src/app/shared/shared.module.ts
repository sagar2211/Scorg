import { CalculateAge } from './pipes/calculate-age.pipe';
import { CustomDateFormatPipe } from './pipes/custom-date-format.pipe';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { OrderByPipe } from './pipes/orderby.pipe';
import { FilterByPipe } from './pipes/filterby.pipe';
import { SohwhideElementOnPermissionDirective } from './directives/sohwhide-element-on-permission.directive';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { MiniNavbarComponent } from './mini-navbar/mini-navbar.component';
import { OutSideClickEventDirective } from './directives/out-side-click-event.directive';
import { ConfirmationPopupComponent } from './confirmation-popup/confirmation-popup.component';
import { GlobalSearchDatPipe } from 'src/app/shared/pipes/global-search-dat.pipe';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, forwardRef } from '@angular/core';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { AlertMessageComponent } from './alert-message/alert-message.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GlobalErrorComponent } from './global-error/global-error.component';
import { NoPermissionComponent } from './no-permission/no-permission.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ScrollSpyDirective } from './directives/scroll-spy.directive';
import { CustomListboxComponent } from './custom-listbox/custom-listbox.component';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        InfiniteScrollModule,
        NgSelectModule
    ],
    declarations: [
        NoPermissionComponent,
        GlobalErrorComponent,
        AlertMessageComponent,
        AutoFocusDirective,
        GlobalSearchDatPipe,
        ConfirmationPopupComponent,
        OutSideClickEventDirective,
        MiniNavbarComponent,
        BreadcrumbComponent,
        SohwhideElementOnPermissionDirective,
        FilterByPipe,
        OrderByPipe,
        DatePickerComponent,
        CustomDateFormatPipe,
        ScrollSpyDirective,
        CustomListboxComponent,
        CalculateAge,
        NotificationListComponent
    ],
    exports: [
        NgbModule,
        InfiniteScrollModule,
        NgxDatatableModule,
        ScrollSpyDirective,
        NoPermissionComponent,
        GlobalErrorComponent,
        AlertMessageComponent,
        AutoFocusDirective,
        GlobalSearchDatPipe,
        ConfirmationPopupComponent,
        OutSideClickEventDirective,
        MiniNavbarComponent,
        BreadcrumbComponent,
        SohwhideElementOnPermissionDirective,
        FilterByPipe,
        OrderByPipe,
        DatePickerComponent,
        CustomDateFormatPipe,
        CustomListboxComponent,
        CalculateAge,
        NotificationListComponent,
        NgSelectModule
    ],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class SharedModule { }

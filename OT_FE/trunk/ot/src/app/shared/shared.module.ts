import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomDateFormatPipe } from './pipes/custom-date-format.pipe';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrdersByPipe } from './pipes/orders-by.pipe';
import { FilterByPipe } from './pipes/filterby.pipe';
import { AlertMessageComponent } from './alert-message/alert-message.component';
import { ConfirmationPopupComponent } from './confirmation-popup/confirmation-popup.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { GlobalSearchDatPipe } from './pipes/global-search-dat.pipe';
import { CustomDatePipe } from './pipes/custom-date.pipe';
import { CalculateAge } from './pipes/calculate-age.pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollSpyDirective } from './pipes/scroll-spy.directive';
import { NgSelectTypeaheadComponent } from './ng-select-typeahead/ng-select-typeahead.component';
import { NoPermissionComponent } from './no-permission/no-permission.component';
import { GlobalErrorComponent } from './global-error/global-error.component';
import { OutSideClickEventDirective } from './directives/out-side-click-event.directive';
import { HighlightPipe } from './pipes/highlight.pipe';
import { AutocompleteSearchComponent } from './autocomplete-search/autocomplete-search.component';
import { CustomAutocompleteSearchComponent } from './custom-autocomplete-search/custom-autocomplete-search.component';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TranslatePipe } from './pipes/translate/translate.pipe';
import { OrderByPipe } from 'src/app/shared/pipes/orderby.pipe';
import { NumberOnlyInputComponent } from './number-only-input/number-only-input.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { MiniNavbarComponent } from './mini-navbar/mini-navbar.component';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { OnlyNumbersDirective } from './pipes/only-numbers.directive';
import { OnlyNumbersWithDecimalDirective } from './pipes/only-numbers-with-decimal.directive';
import { SelectMultipleComponent } from './select-multiple/select-multiple.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    NgSelectModule,
    NgMultiSelectDropDownModule,
    NgxPermissionsModule,
    NgbModule,
  ],
  declarations: [
    AlertMessageComponent,
    FilterByPipe,
    OrdersByPipe,
    ConfirmationPopupComponent,
    DatePickerComponent,
    ScrollSpyDirective,
    CalculateAge,
    GlobalSearchDatPipe,
    CustomDatePipe,
    CustomDateFormatPipe,
    NgSelectTypeaheadComponent,
    GlobalErrorComponent,
    NoPermissionComponent,
    OutSideClickEventDirective,
    CustomAutocompleteSearchComponent,
    AutocompleteSearchComponent,
    HighlightPipe,
    DateTimePickerComponent,
    OrderByPipe,
    TranslatePipe,
    NumberOnlyInputComponent,
    BreadcrumbComponent,
    MiniNavbarComponent,
    NotificationListComponent,
    OnlyNumbersDirective,
    OnlyNumbersWithDecimalDirective,
    SelectMultipleComponent
  ],
  exports: [
    NgbModule,
    InfiniteScrollModule,
    NgSelectModule,
    NgMultiSelectDropDownModule,
    NgxPermissionsModule,
    BreadcrumbComponent,
    AlertMessageComponent,
    FilterByPipe,
    OrdersByPipe,
    ConfirmationPopupComponent,
    DatePickerComponent,
    ScrollSpyDirective,
    CalculateAge,
    GlobalSearchDatPipe,
    CustomDatePipe,
    CustomDateFormatPipe,
    NgSelectTypeaheadComponent,
    GlobalErrorComponent,
    NoPermissionComponent,
    OutSideClickEventDirective,
    CustomAutocompleteSearchComponent,
    AutocompleteSearchComponent,
    HighlightPipe,
    DateTimePickerComponent,
    OrderByPipe,
    TranslatePipe,
    NumberOnlyInputComponent,
    MiniNavbarComponent,
    NotificationListComponent,
    OnlyNumbersDirective,
    OnlyNumbersWithDecimalDirective,
    SelectMultipleComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [OrderByPipe]
})
export class SharedModule { }

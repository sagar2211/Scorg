import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomDateFormatPipe } from './pipes/custom-date-format.pipe';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderByPipe } from './pipes/order-by.pipe';
import { FilterByPipe } from './pipes/filterby.pipe';
import { AlertMessageComponent } from './alert-message/alert-message.component';
import { ConfirmationPopupComponent } from './confirmation-popup/confirmation-popup.component';
import { ModifyCustomTemplateData } from './pipes/modify-custom-template-data';
import { SplitValuePipe } from './pipes/split-value.pipe';
import { BodyPartDetailsPipe } from './pipes/body-part-details.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { GlobalSearchDatPipe } from './pipes/global-search-dat.pipe';
import { CustomDatePipe } from './pipes/custom-date.pipe';
import { CalculateAge } from './pipes/calculate-age.pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollSpyDirective } from './pipes/scroll-spy.directive';
import { DisplaySavedUnsavedPipe } from './pipes/display-saved-unsaved.pipe';
// import { SpecialityComponent } from './speciality/speciality.component';
import { NgSelectTypheadComponent } from './ng-select-typhead/ng-select-typhead.component';
import { NgSelectTypeaheadComponent } from './ng-select-typeahead/ng-select-typeahead.component';
import { CustomColorPickerComponent } from './custom-color-picker/custom-color-picker.component';
import { NoPermissionComponent } from './no-permission/no-permission.component';
import { GlobalErrorComponent } from './global-error/global-error.component';
import { OutSideClickEventDirective } from './directives/out-side-click-event.directive';
import { ShowHideElementOnPermissionDirective } from './directives/show-hide-element-on-permission';
// import { BodyPainScorePipe } from './pipes/body-pain-score.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { AutocompleteSearchComponent } from './autocomplete-search/autocomplete-search.component';
import { CustomAutocompleteSearchComponent } from './custom-autocomplete-search/custom-autocomplete-search.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MiniNavbarComponent } from './mini-navbar/mini-navbar.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ConfirmationPopupWithReasonComponent } from './confirmation-popup-with-reason/confirmation-popup-with-reason.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { OnlyNumbersWithDecimalDirective } from './directives/only-numbers-with-decimal.directive';
import { OnlyNumbersDirective } from './directives/only-numbers.directive';
import { PdfViewerModule } from 'ng2-pdf-viewer';
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    NgSelectModule,
    InlineSVGModule,
    NgxDatatableModule,
    NgxPermissionsModule,
    PdfViewerModule
  ],
  declarations: [
    AlertMessageComponent,
    FilterByPipe,
    OrderByPipe,
    ConfirmationPopupComponent,
    ModifyCustomTemplateData,
    DatePickerComponent,
    BodyPartDetailsPipe,
    SplitValuePipe,
    ScrollSpyDirective,
    CalculateAge,
    GlobalSearchDatPipe,
    CustomDatePipe,
    DisplaySavedUnsavedPipe,
    CustomDateFormatPipe,
    // SpecialityComponent,
    NgSelectTypeaheadComponent,
    NgSelectTypheadComponent,
    CustomColorPickerComponent,
    GlobalErrorComponent,
    NoPermissionComponent,
    OutSideClickEventDirective,
    CustomAutocompleteSearchComponent,
    AutocompleteSearchComponent,
    HighlightPipe,
    // BodyPainScorePipe,
    MiniNavbarComponent,
    BreadcrumbComponent,
    ConfirmationPopupWithReasonComponent,
    ShowHideElementOnPermissionDirective,
    OnlyNumbersWithDecimalDirective,OnlyNumbersDirective
  ],
  exports: [
    NgbModule,
    InfiniteScrollModule,
    NgSelectModule,
    NgxDatatableModule,
    AlertMessageComponent,
    FilterByPipe,
    OrderByPipe,
    ConfirmationPopupComponent,
    ModifyCustomTemplateData,
    DatePickerComponent,
    BodyPartDetailsPipe,
    SplitValuePipe,
    ScrollSpyDirective,
    CalculateAge,
    GlobalSearchDatPipe,
    CustomDatePipe,
    DisplaySavedUnsavedPipe,
    CustomDateFormatPipe,
    // SpecialityComponent,
    NgSelectTypeaheadComponent,
    NgSelectTypheadComponent,
    CustomColorPickerComponent,
    GlobalErrorComponent,
    NoPermissionComponent,
    OutSideClickEventDirective,
    CustomAutocompleteSearchComponent,
    AutocompleteSearchComponent,
    HighlightPipe,
    // BodyPainScorePipe,
    MiniNavbarComponent,
    BreadcrumbComponent,
    ConfirmationPopupWithReasonComponent,
    NgxPermissionsModule,
    ShowHideElementOnPermissionDirective,
    OnlyNumbersWithDecimalDirective,
    OnlyNumbersDirective
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class SharedModule { }

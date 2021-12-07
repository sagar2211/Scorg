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
import { SpecialityComponent } from './speciality/speciality.component';
import { NgSelectTypheadComponent } from './ng-select-typhead/ng-select-typhead.component';
import { NgSelectTypeaheadComponent } from './ng-select-typeahead/ng-select-typeahead.component';
import { CustomColorPickerComponent } from './custom-color-picker/custom-color-picker.component';
import { NoPermissionComponent } from './no-permission/no-permission.component';
import { GlobalErrorComponent } from './global-error/global-error.component';
import { OutSideClickEventDirective } from './directives/out-side-click-event.directive';
import { BodyPainScorePipe } from './pipes/body-pain-score.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { AutocompleteSearchComponent } from './autocomplete-search/autocomplete-search.component';
import { CustomAutocompleteSearchComponent } from './custom-autocomplete-search/custom-autocomplete-search.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { SvgMapPrintComponent } from './svg-map-print/svg-map-print.component';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TranslatePipe } from './pipes/translate/translate.pipe';
import { OrderByPipe } from 'src/app/shared/pipes/orderby.pipe';
import { FileUploadModule } from 'ng2-file-upload';
import { NumberOnlyInputComponent } from './number-only-input/number-only-input.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { MiniNavbarComponent } from './mini-navbar/mini-navbar.component';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { OnlyNumbersDirective } from './pipes/only-numbers.directive';
import { OnlyNumbersWithDecimalDirective } from './pipes/only-numbers-with-decimal.directive';
import { PatientAdmitDischargePatientListComponent } from './patient-admit-discharge-patient-list/patient-admit-discharge-patient-list.component';
import { WizardComponent } from './wizard/wizard.component';
import { WizardStepComponent } from './wizard-step/wizard-step.component';
import { QmsQlistLibModule } from '@qms/qlist-lib';
// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MaterialModule } from '../material/material-module';
import { AngularEditorModule } from '@kolkov/angular-editor';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    // NgxDatatableModule,
    InfiniteScrollModule,
    NgSelectModule,
    InlineSVGModule,
    NgMultiSelectDropDownModule,
    NgxPermissionsModule,
    PdfViewerModule,
    FileUploadModule,
    QmsQlistLibModule,
    AngularEditorModule
  ],
  declarations: [
    AlertMessageComponent,
    FilterByPipe,
    OrdersByPipe,
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
    SpecialityComponent,
    NgSelectTypeaheadComponent,
    NgSelectTypheadComponent,
    CustomColorPickerComponent,
    GlobalErrorComponent,
    NoPermissionComponent,
    OutSideClickEventDirective,
    CustomAutocompleteSearchComponent,
    AutocompleteSearchComponent,
    HighlightPipe,
    BodyPainScorePipe,
    SvgMapPrintComponent,
    DateTimePickerComponent,
    OrderByPipe,
    TranslatePipe,
    NumberOnlyInputComponent,
    BreadcrumbComponent,
    MiniNavbarComponent,
    NotificationListComponent,
    OnlyNumbersDirective,
    OnlyNumbersWithDecimalDirective,
    PatientAdmitDischargePatientListComponent,
    WizardComponent,
    WizardStepComponent,
  ],
  exports: [
    NgbModule,
    InfiniteScrollModule,
    NgSelectModule,
    NgMultiSelectDropDownModule,
    NgxPermissionsModule,
    FileUploadModule,
    QmsQlistLibModule,
    BreadcrumbComponent,
    AlertMessageComponent,
    FilterByPipe,
    OrdersByPipe,
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
    SpecialityComponent,
    NgSelectTypeaheadComponent,
    NgSelectTypheadComponent,
    CustomColorPickerComponent,
    GlobalErrorComponent,
    NoPermissionComponent,
    OutSideClickEventDirective,
    CustomAutocompleteSearchComponent,
    AutocompleteSearchComponent,
    HighlightPipe,
    BodyPainScorePipe,
    SvgMapPrintComponent,
    DateTimePickerComponent,
    OrderByPipe,
    TranslatePipe,
    NumberOnlyInputComponent,
    PdfViewerModule,
    MiniNavbarComponent,
    NotificationListComponent,
    OnlyNumbersDirective,
    OnlyNumbersWithDecimalDirective,
    PatientAdmitDischargePatientListComponent,
    WizardComponent,
    WizardStepComponent,
    AngularEditorModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [OrderByPipe]
})
export class SharedModule { }

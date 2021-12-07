import { QmsQlistLibModule } from '@qms/qlist-lib';
import { FilterByPipe } from './pipes/filterby.pipe';
import { ResizeDomDirective } from './directive/resize-dom.directive';
// -- import modules
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeHeadComponent } from './components/type-head/type-head.component';
import { NgSelectTypeaheadComponent } from './components/ng-select-typeahead/ng-select-typeahead.component';

import { ConfirmationPopupComponent } from '../components/confirmation-popup/confirmation-popup.component';
import { CommonModule } from '@angular/common';
import { ResetPasswordComponent } from '../components/reset-password/reset-password.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxResizeWatcherDirectiveDirective } from './directive/ngx-resize-watcher-directive.directive';
import { OutSideClickEventDirective } from './directive/out-side-click-event.directive';
import { ScrollSpyDirective } from './directive/scroll-spy.directive';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
// -- import components
import { AppointmentBookComponent } from './components/appointment-book/appointment-book.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { QlistAddSectionComponent } from '../modules/qms/components/qlist-add-section/qlist-add-section.component';
// -- import pipes
import { CalculateAge } from './pipes/calculate-age.pipe';
import { CustomDateFormatPipe } from './pipes/custom-date-format.pipe';
import { GlobalSearchDatPipe } from './pipes/global-search-dat.pipe';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { NumberOnlyInputComponent } from './components/number-only-input/number-only-input.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { EntityComponent } from './components/entity/entity.component';
import { EntityValueComponent } from './components/entity-value/entity-value.component';
import { RoomMultipleComponent } from './components/room-multiple/room-multiple.component';
import { SelectMultipleComponent } from './components/select-multiple/select-multiple.component';
import { SectionComponent } from './components/section/section.component';
import { ProviderDetailsComponent } from './components/provider-details/provider-details.component';
import { HideStatusBtnDirective } from './directive/hide-status-btn.directive';
import { MiniNavbarComponent } from './components/mini-navbar/mini-navbar.component';
import { DatePicker2Component } from './components/date-picker2/date-picker2.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TimeDropDownComponent } from './components/time-drop-down/time-drop-down.component';
import { QlistFilterComponent } from './components/qlist-filter/qlist-filter.component';
import { QStatusListByKeyPipe } from './pipes/q-status-list-by-key.pipe';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { CalendarFilterComponent } from './components/calender-filter/calender-filter.component';
import { DisplayDataByStatusPipe } from '../modules/qms/pipes/display-data-by-status.pipe';
import { MaterialModule } from '../modules/material/material-module';
import { BulkFilterComponent } from './components/bulk-filter/bulk-filter.component';
import { UpperCaseDirective } from './directive/upper-case.directive';
import { AutoFocusDirective } from './directive/auto-focus.directive';
import { ConfirmationPopupWithInputComponent } from './components/confirmation-popup-with-input/confirmation-popup-with-input.component';
import { TextMaskModule } from 'angular2-text-mask';
import { ConfirmationPopupDelayNotificationComponent } from './components/confirmation-popup-delay-notification/confirmation-popup-delay-notification.component';
import { SetQStatusColorDirective } from './directive/set-qstatus-color.directive';
import { SummeryTimeScheduleComponent } from '../modules/schedule/components/summery-time-schedule/summery-time-schedule.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HistoryDelayNotificationComponent } from './components/history-delay-notification/history-delay-notification.component';
import { SohwhideElementOnPermissionDirective } from './directive/sohwhide-element-on-permission.directive';
import { GlobalErrorComponent } from '../components/global-error/global-error.component';
import { SliderLogComponent } from './components/slider-log/slider-log.component';
import { NumbersOnlyDirective } from './directive/numbers-only.directive';
import { SliderPatienthistoryComponent } from './components/slider-patienthistory/slider-patienthistory.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PatientAppointmentsDetailComponent } from './components/patient-appointments-detail/patient-appointments-detail.component';
import { SessionoutpopupComponent } from '../components/sessionoutpopup/sessionoutpopup.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { AutocompleteSearchComponent } from './components/autocomplete-search/autocomplete-search.component';
import { HighlightPipe } from './pipes/highlight.pipe';
import { CustomAutocompleteSearchComponent } from './components/custom-autocomplete-search/custom-autocomplete-search.component';
import { RoomSectionMapComponent } from './components/room-section-map/room-section-map.component';
import { OrderByPipe } from './pipes/orderby.pipe';
import { SlotViewComponent } from './components/slot-view/slot-view.component';
import { AppointmentHistoryComponent } from './components/appointment-history/appointment-history.component';
import { BlockAppointmentSettingComponent } from './components/block-appointment-setting/block-appointment-setting.component';
import { CancelHolidayPopupComponent } from './components/cancel-holiday-popup/cancel-holiday-popup.component';
import { EntityHolidayListComponent } from './components/entity-holiday-list/entity-holiday-list.component';
import { ConfirmationBookAppointmentComponent } from './components/confirmation-book-appointment/confirmation-book-appointment.component';
import { EntityBlockSlotListComponent } from './components/entity-block-slot-list/entity-block-slot-list.component';
import { EntityHolidaySettingComponent } from './components/entity-holiday-setting/entity-holiday-setting.component';
import { EntitysettingpopoverComponent } from './components/entitysettingpopover/entitysettingpopover.component';
import { ServiceProviderDetailsComponent } from './components/service-provider-details/service-provider-details.component';
import { AlertMessageComponent } from './components/alert-message/alert-message.component';
import { PrintDataHomeComponent } from './components/print-data-home/print-data-home.component';

// import { FocusInvalidElementDirective } from './directive/focus-invalid-element.directive';
// import { CustomListboxComponent } from '../components/custom-listbox/custom-listbox.component';
// import { InlineSVGModule } from 'ng-inline-svg';
// import { FileUploadModule } from 'ng2-file-upload';
// import { NgSelectTypheadComponent } from './components/ng-select-typhead/ng-select-typhead.component';
// import { CheckFileTypePipe } from './pipes/check-file-type.pipe';
// import { AddThumbnailPipe } from './pipes/add-thumbnail.pipe';
// import { LeftRightPartDataPipe } from './pipes/left-right-part-data.pipe';
// import { SplitValuePipe } from './pipes/split-value.pipe';
// import { OnSlidesDirective } from './directive/on-slides.directive';
// import { CustomColorPickerComponent } from './components/custom-color-picker/custom-color-picker.component';
// import { GenerateCustomTemplateSummeryPipe } from './pipes/generate-custom-template-summery.pipe';
// import { ModifyCustomTemplateData } from './pipes/modify-custom-template-data';
// import { BodyPartDetailsPipe } from './pipes/body-part-details.pipe';
// import { SpecialityComponent } from './components/speciality/speciality.component';
// import { TooltipComponent } from './components/tooltip/tooltip.component';
// import { FileUploadComponent } from './components/file-upload/file-upload.component';
// import { RuleSortPipe } from './pipes/rule-sort.pipe';
// import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
// import { BulkCancelationComponent } from './../modules/appointment/components/bulk-cancelation/bulk-cancelation.component';
@NgModule({
  imports: [
    FormsModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxDatatableModule,
    NgSelectModule,
    NgxTrimDirectiveModule,
    AngularEditorModule,
    BsDatepickerModule.forRoot(),
    MaterialModule,
    TextMaskModule,
    NgxPermissionsModule,
    PdfViewerModule,
    InfiniteScrollModule,
    NgMultiSelectDropDownModule,
    QmsQlistLibModule
  ],
  declarations: [
    // CustomListboxComponent, //rolepermission,userregistration
    // FocusInvalidElementDirective, // userregistration
    // RuleSortPipe,
    // TooltipComponent,
    // FileUploadComponent,
    // SpecialityComponent,
    // CheckFileTypePipe,
    // AddThumbnailPipe,
    // NgSelectTypheadComponent,
    // LeftRightPartDataPipe,
    // SplitValuePipe,
    // OnSlidesDirective,
    // BodyPartDetailsPipe,
    // CustomColorPickerComponent,
    // GenerateCustomTemplateSummeryPipe,
    // ModifyCustomTemplateData,
    // BulkCancelationComponent,
    // apointment

    TypeHeadComponent,
    ConfirmationPopupComponent,
    NgSelectTypeaheadComponent,
    AlertMessageComponent,
    ResetPasswordComponent,
    DatePickerComponent,
    NgxResizeWatcherDirectiveDirective,
    OutSideClickEventDirective,
    CalculateAge,
    CustomDateFormatPipe,
    NumberOnlyInputComponent,
    ScrollSpyDirective,
    AppointmentBookComponent,
    BreadcrumbComponent,
    DateTimePickerComponent,
    EntityComponent,
    EntityValueComponent,
    RoomMultipleComponent,
    SelectMultipleComponent,
    SectionComponent,
    ProviderDetailsComponent,
    HideStatusBtnDirective,
    MiniNavbarComponent,
    DatePicker2Component,
    TimeDropDownComponent,
    GlobalSearchDatPipe,
    QlistFilterComponent,
    ResizeDomDirective,
    QStatusListByKeyPipe,
    ComingSoonComponent,
    SummeryTimeScheduleComponent,
    GlobalErrorComponent,
    SliderLogComponent,
    SliderPatienthistoryComponent,
    HighlightPipe,
    SlotViewComponent,
    EntityHolidayListComponent,
    BlockAppointmentSettingComponent,
    EntityHolidaySettingComponent,
    EntityBlockSlotListComponent,
    AppointmentHistoryComponent,
    ConfirmationBookAppointmentComponent,
    PatientAppointmentsDetailComponent,
    SessionoutpopupComponent,
    // pipes
    DisplayDataByStatusPipe,
    OrderByPipe,
    FilterByPipe,
    CalendarFilterComponent,
    QlistAddSectionComponent,
    BulkFilterComponent,
    UpperCaseDirective,
    AutoFocusDirective,
    ConfirmationPopupWithInputComponent,
    EntitysettingpopoverComponent,
    ConfirmationPopupDelayNotificationComponent,
    SetQStatusColorDirective,
    HistoryDelayNotificationComponent,
    SohwhideElementOnPermissionDirective,
    NumbersOnlyDirective,
    ServiceProviderDetailsComponent,
    CancelHolidayPopupComponent,
    NotificationListComponent,
    AutocompleteSearchComponent,
    CustomAutocompleteSearchComponent,
    RoomSectionMapComponent,
    PrintDataHomeComponent
  ],
  exports: [
    // modules
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxDatatableModule,
    ResetPasswordComponent,
    NgxTrimDirectiveModule,
    AngularEditorModule,
    TextMaskModule,
    PdfViewerModule,
    InfiniteScrollModule,
    NgMultiSelectDropDownModule,
    QmsQlistLibModule,
    // pipes
    CalculateAge,
    CustomDateFormatPipe,
    QStatusListByKeyPipe,
    DisplayDataByStatusPipe,
    OrderByPipe,
    FilterByPipe,

    GlobalSearchDatPipe,
    HighlightPipe,
    // components
    TypeHeadComponent,
    NgSelectTypeaheadComponent,
    AlertMessageComponent,
    ConfirmationPopupComponent,
    DatePickerComponent,
    NgSelectModule,
    NumberOnlyInputComponent,
    AppointmentBookComponent,
    EntityComponent,
    EntityValueComponent,
    RoomMultipleComponent,
    SelectMultipleComponent,
    SectionComponent,
    MiniNavbarComponent,
    DatePicker2Component,
    TimeDropDownComponent,
    QlistFilterComponent,
    CalendarFilterComponent,
    QlistAddSectionComponent,
    ComingSoonComponent,
    SlotViewComponent,
    BulkFilterComponent,
    EntitysettingpopoverComponent,
    EntityHolidayListComponent,
    BlockAppointmentSettingComponent,
    EntityHolidaySettingComponent,
    EntityBlockSlotListComponent,
    SummeryTimeScheduleComponent,
    AppointmentHistoryComponent,
    ConfirmationBookAppointmentComponent,
    GlobalErrorComponent,
    SliderLogComponent,
    SliderPatienthistoryComponent,
    PatientAppointmentsDetailComponent,
    SessionoutpopupComponent,
    BreadcrumbComponent,
    DateTimePickerComponent,
    ProviderDetailsComponent,
    ServiceProviderDetailsComponent,
    AutocompleteSearchComponent,
    CustomAutocompleteSearchComponent,
    NotificationListComponent,
    // directives
    NgxResizeWatcherDirectiveDirective,
    OutSideClickEventDirective,
    ScrollSpyDirective,
    HideStatusBtnDirective,
    ResizeDomDirective,
    UpperCaseDirective,
    AutoFocusDirective,
    SetQStatusColorDirective,
    NgxPermissionsModule,
    NumbersOnlyDirective,
    RoomSectionMapComponent,
    PrintDataHomeComponent
  ],
  entryComponents: [
    ConfirmationPopupComponent,
    AlertMessageComponent,
    ResetPasswordComponent,
    DatePickerComponent,
    AppointmentBookComponent,
    QlistFilterComponent,
    QlistAddSectionComponent,
    BulkFilterComponent,
    ConfirmationPopupWithInputComponent,
    EntitysettingpopoverComponent,
    ConfirmationPopupDelayNotificationComponent,
    AppointmentHistoryComponent,
    ConfirmationBookAppointmentComponent,
    GlobalErrorComponent,
    SliderLogComponent,
    SliderPatienthistoryComponent,
    PatientAppointmentsDetailComponent,
    CancelHolidayPopupComponent,
    SessionoutpopupComponent,
    NotificationListComponent
  ],
  providers: [
    NgbActiveModal,
    // GenerateCustomTemplateSummeryPipe,
    // ModifyCustomTemplateData
  ]
})
export class SharedModule { }

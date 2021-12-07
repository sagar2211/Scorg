import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { HumanBodyPainDetailsComponent } from './components/human-body-pain-details/human-body-pain-details.component';
import { BodyPartDetailsComponent } from './components/body-part-details/body-part-details.component';
import { HumanBodyComponent } from './components/human-body/human-body.component';
// import { DynamicChartService } from './../dynamic-chart/dynamic-chart.service';
// import { DisplayImagesComponent } from '../patient/components/display-images/display-images.component';
// import { FileAttachmentsComponent } from './components/file-attachments/file-attachments.component';
// import { IvFluidFeedComponent } from './components/iv-fluid-feed/iv-fluid-feed.component';
// import { InvestigationHistorySharedComponent } from './components/investigation-history/investigation-history.component';
// import { DepartmentComponent } from './components/department/department.component';
// import { WardComponent } from './components/ward/ward.component';
// import { InvestigationSelectComponent } from './components/investigation-select/investigation-select.component';
import { InvestigationChartFormComponent } from './components/investigation-chart-form/investigation-chart-form.component';
import { PrescriptionComponent } from './components/prescription/prescription.component';
import { PainScaleComponent } from './components/pain-scale/pain-scale.component';
import { PainReliefComponent } from './components/pain-relief/pain-relief.component';
import { ServiceTypeSelectComponent } from './components/service-type-select/service-type-select.component';
import { ExminationTypeComponent } from './components/exmination-type/exmination-type.component';
import { ExaminationLabelFormChartComponent } from './components/examination-label-form-chart/examination-label-form-chart.component';
import { TagInputModule } from 'ngx-chips';
import { CustomTagInputMenuDirective } from './directives/custom-tag-input-menu.directive';
import { ExaminationLabelEditComponent } from './components/examination-label-edit/examination-label-edit.component';
import { AdviceComponent } from './components/advice/advice.component';
import { MedicineOrdersComponent } from './../orders/components/medicine-orders/medicine-orders.component';
import { OrderListFilterPipe } from './pipes/order-list-filter.pipe';
import { OrdersDisplayComponent } from './../orders/components/orders-display/orders-display.component';
import { SuggestionPanelComponent } from './components/suggestion-panel/suggestion-panel.component';
import { RadioSwitchComponent } from './components/radio-switch/radio-switch.component';
import { DiagnosisComponent } from './components/diagnosis/diagnosis.component';
import { AllergyComponent } from './components/allergy/allergy.component';
import { ComplaintsComponent } from './components/complaints/complaints.component';
import { ImageAnnotationComponent } from './components/image-annotation/image-annotation.component';
import { AddImageAnnotationComponent } from './components/add-image-annotation/add-image-annotation.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { UploadImageAnnotationFileComponent } from './components/upload-image-annotation-file/upload-image-annotation-file.component';
import { CameraComponent } from './components/camera/camera.component';
import { WebcamModule } from 'ngx-webcam';
import { FaqSectionsComponent } from './components/faq-sections/faq-sections.component';
import { FaqCategoriesComponent } from './components/faq-sections/faq-categories/faq-categories.component';
import { FaqFormsComponent } from './components/faq-sections/faq-forms/faq-forms.component';
import { FaqPopupComponent } from './components/faq-sections/faq-popup/faq-popup.component';
import { FaqSummaryComponent } from './components/faq-sections/faq-summary/faq-summary.component';
import { FaqSectionInfoComponent } from './components/faq-section-info/faq-section-info.component';
import { VitalFormsComponent } from './components/vital-forms/vital-forms.component';
import { HumanBodySectionComponent } from './components/human-body-section/human-body-section.component';
import { FootExaminationSummeryComponent } from './components/foot-examination-summery/foot-examination-summery.component';
import { FootExaminationDescriptionComponent } from './components/foot-examination-description/foot-examination-description.component';
import { FootExaminationCommentComponent } from './components/foot-examination-comment/foot-examination-comment.component';
import { SingleFootExaminationComponent } from './components/single-foot-examination/single-foot-examination.component';
import { FootExaminationPopupComponent } from './components/foot-examination-popup/foot-examination-popup.component';
import { FootScoreFilterPipe } from './pipes/foot-score-filter.pipe';
import { MedicineInputsComponent } from './../orders/components/medicine-inputs/medicine-inputs.component';
import { InstructionSuggestionComponent } from './../orders/components/instruction-suggestion/instruction-suggestion.component';
import { FollowupDateComponent } from './components/followup-date/followup-date.component';
import { AddSuggestionMasterComponent } from './components/add-suggestion-master/add-suggestion-master.component';
import { ScoreTemplateComponent } from './components/score-template/score-template.component';
import { PreviewScoreTemplateComponent } from './components/score-template/preview-score-template/preview-score-template.component';
import { SummaryScoreTemplateComponent } from './components/score-template/summary-score-template/summary-score-template.component';
import { NgxTributeModule } from 'ngx-tribute';
import { AllComponentsDataDisplayComponent } from './components/all-components-data-display/all-components-data-display.component';
// import { GetInvestigationDataByHead } from './pipes/get-investigation-by-head.pipe';
import { SnomedctComponent } from './components/snomedct/snomedct.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { ModifyCustomTemplateData } from './../shared/pipes/modify-custom-template-data';
import { FootExaminationComponent } from './components/foot-examination/foot-examination.component';
import { IcuVitalSheetComponent } from './../patient/components/icu-vital-sheet/icu-vital-sheet.component';
import { GetSectionCategoryDataPipe } from './pipes/get-section-category-data.pipe';
import { AutowidthDirective } from './directives/autowidth.directive';
import { ChartDateTimeComponent } from './components/chart-date-time/chart-date-time.component';
import { ChartUserComponent } from './components/chart-user/chart-user.component';
import { SvgMapComponent } from './components/svg-map/svg-map.component';
import { SvgMapDetailComponent } from './components/svg-map-detail/svg-map-detail.component';
import { FilterArrayPipe } from './pipes/filter-array.pipe';
import { GenerateCustomTemplateSummeryPipe } from './pipes/generate-custom-template-summery.pipe';
import { DynamicChartService } from '../dynamic-chart/dynamic-chart.service';
import { PatientActionComponent } from './components/patient-action/patient-action.component';
import { PatientBedTransferComponent } from './components/patient-bed-transfer/patient-bed-transfer.component';
import { PatientTransferComponent } from './components/patient-transfer/patient-transfer.component';
import { NursingHandoverComponent } from './components/nursing-handover/nursing-handover.component';
import { PatientReferComponent } from './components/patient-refer/patient-refer.component';
import { PatientTentativeDischargeComponent } from './components/patient-tentative-discharge/patient-tentative-discharge.component';
import { ChangeNursingStationPopupComponent } from './components/change-nursing-station-popup/change-nursing-station-popup.component';
import { PatientDeceasedPopupComponent } from './components/patient-deceased-popup/patient-deceased-popup.component';
import { OtRegisterComponent } from './components/ot-register/ot-register.component';

@NgModule({
  declarations: [
    // DisplayImagesComponent,
    // FileAttachmentsComponent,
    // IvFluidFeedComponent,
    // InvestigationHistorySharedComponent,
    // DepartmentComponent,
    // WardComponent,
    // InvestigationSelectComponent,
    // GetInvestigationDataByHead,

    InvestigationChartFormComponent,
    PrescriptionComponent,
    MedicineOrdersComponent,
    OrderListFilterPipe,

    OrdersDisplayComponent,
    SuggestionPanelComponent,
    RadioSwitchComponent,
    PainScaleComponent,
    PainReliefComponent,
    ServiceTypeSelectComponent,
    ExminationTypeComponent,
    ExaminationLabelFormChartComponent,
    AdviceComponent,
    FaqSectionsComponent,
    FaqCategoriesComponent,
    FaqFormsComponent,
    FaqPopupComponent,
    FaqSummaryComponent,
    FaqSectionInfoComponent,
    MedicineInputsComponent,
    InstructionSuggestionComponent,
    // Directives
    CustomTagInputMenuDirective,

    ExaminationLabelEditComponent,
    CustomTagInputMenuDirective,
    DiagnosisComponent,
    AllergyComponent,
    ComplaintsComponent,
    ImageAnnotationComponent,
    AddImageAnnotationComponent,
    UploadImageAnnotationFileComponent,
    CameraComponent,
    VitalFormsComponent,
    HumanBodySectionComponent,
    HumanBodyComponent,
    HumanBodyPainDetailsComponent,
    BodyPartDetailsComponent,
    FootExaminationSummeryComponent,
    FootExaminationDescriptionComponent,
    FootExaminationCommentComponent,
    SingleFootExaminationComponent,
    FootExaminationPopupComponent,
    FootScoreFilterPipe,
    FollowupDateComponent,
    AddSuggestionMasterComponent,
    ScoreTemplateComponent,
    PreviewScoreTemplateComponent,
    SummaryScoreTemplateComponent,
    AllComponentsDataDisplayComponent,
    SnomedctComponent,
    ChartUserComponent,
    ChartDateTimeComponent,
    AutowidthDirective,
    GetSectionCategoryDataPipe,
    IcuVitalSheetComponent,
    SvgMapDetailComponent,
    SvgMapComponent,
    FootExaminationComponent,
    FilterArrayPipe,
    GenerateCustomTemplateSummeryPipe,
    PatientActionComponent,
    PatientBedTransferComponent,
    PatientTransferComponent,
    NursingHandoverComponent,
    PatientReferComponent,
    PatientTentativeDischargeComponent,
    ChangeNursingStationPopupComponent,
    PatientDeceasedPopupComponent,
    OtRegisterComponent
  ],
  exports: [
    TagInputModule,
    InvestigationChartFormComponent,
    PrescriptionComponent,
    MedicineOrdersComponent,
    OrderListFilterPipe,
    OrdersDisplayComponent,
    SuggestionPanelComponent,
    RadioSwitchComponent,
    PainScaleComponent,
    PainReliefComponent,
    ServiceTypeSelectComponent,
    ExminationTypeComponent,
    ExaminationLabelFormChartComponent,
    AdviceComponent,
    DiagnosisComponent,
    AllergyComponent,
    ComplaintsComponent,
    ImageAnnotationComponent,
    FaqSectionsComponent,
    FaqFormsComponent,
    FaqCategoriesComponent,
    FaqPopupComponent,
    FaqSummaryComponent,
    FaqSectionInfoComponent,
    VitalFormsComponent,
    SingleFootExaminationComponent,
    HumanBodySectionComponent,
    HumanBodyComponent,
    MedicineInputsComponent,
    InstructionSuggestionComponent,
    FollowupDateComponent,
    AddSuggestionMasterComponent,
    ScoreTemplateComponent,
    PreviewScoreTemplateComponent,
    SummaryScoreTemplateComponent,
    AllComponentsDataDisplayComponent,
    ChartUserComponent,
    ChartDateTimeComponent,
    AutowidthDirective,
    GetSectionCategoryDataPipe,
    IcuVitalSheetComponent,
    SvgMapDetailComponent,
    SvgMapComponent,
    FootExaminationComponent,
    FilterArrayPipe,
    GenerateCustomTemplateSummeryPipe,
    PatientActionComponent,
    PatientBedTransferComponent,
    PatientTransferComponent,
    NursingHandoverComponent,
    PatientReferComponent,
    PatientTentativeDischargeComponent,
    ChangeNursingStationPopupComponent,
    PatientDeceasedPopupComponent,
    OtRegisterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TagInputModule,
    ColorPickerModule,
    WebcamModule,
    RouterModule,
    NgxTributeModule,
    InlineSVGModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    ExaminationLabelFormChartComponent,
    MedicineOrdersComponent,
    ExaminationLabelEditComponent,
    AllergyComponent,
    DiagnosisComponent,
    ComplaintsComponent,
    ImageAnnotationComponent,
    AddImageAnnotationComponent,
    UploadImageAnnotationFileComponent,
    CameraComponent,
    CameraComponent,
    FaqSectionsComponent,
    FaqFormsComponent,
    FaqCategoriesComponent,
    FaqPopupComponent,
    FaqSummaryComponent,
    FaqSectionInfoComponent,
    PrescriptionComponent,
    InvestigationChartFormComponent,
    AdviceComponent,
    PainScaleComponent,
    PainReliefComponent,
    HumanBodySectionComponent,
    HumanBodyComponent,
    HumanBodyPainDetailsComponent,
    FootExaminationPopupComponent,
    FootExaminationCommentComponent,
    VitalFormsComponent,
    MedicineInputsComponent,
    InstructionSuggestionComponent,
    FollowupDateComponent,
    AddSuggestionMasterComponent,
    ScoreTemplateComponent,
    PreviewScoreTemplateComponent,
    SummaryScoreTemplateComponent,
    ChartUserComponent,
    ChartDateTimeComponent
  ],
  providers: [ ModifyCustomTemplateData, DynamicChartService ]

})
export class EmrSharedModule { }

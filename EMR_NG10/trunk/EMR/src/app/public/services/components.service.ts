import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FollowupDateComponent } from '../../emr-shared/components/followup-date/followup-date.component';
import { DoctorInformationComponent } from './../../orders/components/doctor-information/doctor-information.component';
import { FootExaminationComponent } from '../../emr-shared/components/foot-examination/foot-examination.component';
import { HumanBodySectionComponent } from '../../emr-shared/components/human-body-section/human-body-section.component';
import { ImageAnnotationComponent } from '../../emr-shared/components/image-annotation/image-annotation.component';
import { ConsultationSectionItem } from '../models/consultation-section-item';
import { AllergyComponent } from '../../emr-shared/components/allergy/allergy.component';
import { ComplaintsComponent } from '../../emr-shared/components/complaints/complaints.component';
import { DiagnosisComponent } from '../../emr-shared/components/diagnosis/diagnosis.component';
import { MedicineOrdersComponent } from '../../orders/components/medicine-orders/medicine-orders.component';
import { LabOrdersComponent } from '../../orders/components/lab-orders/lab-orders.component';
import { RadiologyOrdersComponent } from '../../orders/components/radiology-orders/radiology-orders.component';
import { DietOrdersComponent } from '../../orders/components/diet-orders/diet-orders.component';
import { NursingOrdersComponent } from '../../orders/components/nursing-orders/nursing-orders.component';
import { PainReliefComponent } from '../../emr-shared/components/pain-relief/pain-relief.component';
import { ExaminationLabelFormChartComponent } from '../../emr-shared/components/examination-label-form-chart/examination-label-form-chart.component';
import { FaqSectionsComponent } from '../../emr-shared/components/faq-sections/faq-sections.component';
import { PrescriptionComponent } from '../../emr-shared/components/prescription/prescription.component';
import { InvestigationChartFormComponent } from '../../emr-shared/components/investigation-chart-form/investigation-chart-form.component';
import { PainScaleComponent } from '../../emr-shared/components/pain-scale/pain-scale.component';
import { AdviceComponent } from '../../emr-shared/components/advice/advice.component';
import { VitalFormsComponent } from '../../emr-shared/components/vital-forms/vital-forms.component';
import { ScoreTemplateComponent } from '../../emr-shared/components/score-template/score-template.component';
import { ChartDateTimeComponent } from './../../emr-shared/components/chart-date-time/chart-date-time.component';
import { ChartUserComponent } from './../../emr-shared/components/chart-user/chart-user.component';
import { FileAttachmentsComponent } from 'src/app/modules/patient-documents/components/file-attachments/file-attachments.component';
import { OtRegisterComponent } from 'src/app/emr-shared/components/ot-register/ot-register.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentsService {
  activeFormId: number;
  componentChartKeys = [{
    componentKey: 'allergies',
    chartKey: 'allergy_detail'
  },
  {
    componentKey: 'complaints',
    chartKey: 'complaint_detail'
  },
  {
    componentKey: 'diagnosis',
    chartKey: 'diagnosis_detail'
  },
  {
    componentKey: 'imageAnnotation',
    chartKey: 'annotation_detail'
  },
  {
    componentKey: 'fileAttachment',
    chartKey: 'attachment_detail'
  },
  {
    componentKey: 'faq_section',
    chartKey: 'custom_template_detail'
  },
  {
    componentKey: 'radiology_investigation',
    chartKey: 'investigation_detail',
    investigationType: 'Radiology'
  },
  {
    componentKey: 'lab_investigation',
    chartKey: 'investigation_detail',
    investigationType: 'Lab'
  },
  {
    componentKey: 'vitals',
    chartKey: 'vitals_detail'
  },
  {
    componentKey: 'prescription',
    chartKey: 'prescription_detail'
  },
  {
    componentKey: 'advice',
    chartKey: 'advice_detail'
  },
  {
    componentKey: 'pain_scale',
    chartKey: 'pain_scale'
  },
  {
    componentKey: 'pain_releif',
    chartKey: 'relief_scale'
  },
  {
    componentKey: 'examination_label',
    chartKey: 'examination_detail'
  },
  {
    componentKey: 'followup_date',
    chartKey: 'followup_date_detail'
  },
  {
    componentKey: 'score_template',
    chartKey: 'score_template_detail'
  },
  {
    componentKey: 'chart_date_time',
    chartKey: 'chart_date_detail'
  },
  {
    componentKey: 'chart_user',
    chartKey: 'chart_user_detail'
  },
  {
    componentKey: 'investigation',
    chartKey: 'investigation'
  },
  {
    componentKey: 'dietOrders',
    chartKey: 'dietOrders'
  },
  {
    componentKey: 'instructionOrders',
    chartKey: 'instructionOrders'
  },
  {
    componentKey: 'labOrders',
    chartKey: 'labOrders'
  },
  {
    componentKey: 'medicineOrders',
    chartKey: 'medicineOrders'
  },
  {
    componentKey: 'nursingOrders',
    chartKey: 'nursingOrders'
  },
  {
    componentKey: 'radiologyOrders',
    chartKey: 'radiologyOrders'
  },
  {
    componentKey: 'serviceOrders',
    chartKey: 'serviceOrders'
  },
  {
    componentKey: 'faq_section',
    chartKey: 'custom_template_summary'
  },
  {
    componentKey: 'ot_register',
    chartKey: 'ot_register_detail'
  },
  ];
  constructor(private http: HttpClient) { }

  getAllComponents() {
    return [
      new ConsultationSectionItem(AllergyComponent, undefined, 'Allergies', {
        name: 'Allergies',
        key: 'allergies',
        templateFormName: 'allergiesListFrm',
        display: false
      }),
      new ConsultationSectionItem(ComplaintsComponent, undefined, 'Complaints', {
        name: 'Complaints',
        key: 'complaints',
        templateFormName: 'complaintFrm',
        display: false
      }),
      new ConsultationSectionItem(DiagnosisComponent, undefined, 'Diagnosis', {
        name: 'Diagnosis',
        key: 'diagnosis',
        templateFormName: 'diagnosisFrm',
        display: false
      }),
      new ConsultationSectionItem(ImageAnnotationComponent, undefined, 'Image Annotation', {
        name: 'Image Annotation',
        key: 'image_annotation',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(FileAttachmentsComponent, undefined, 'File Attachment', {
        name: 'File Attachment',
        key: 'attachment',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(FaqSectionsComponent, undefined, 'Custom Template', {
        name: 'Custom Template',
        key: 'faq_section',
        templateFormName: '',
        display: false
      }),
      // new ConsultationSectionItem(MedicalHistoryComponent, undefined, 'Medical History', {
      //   name: 'Medical History',
      //   key: 'medical_history',
      //   templateFormName: 'medicalHistoryFrm',
      //   display: false
      // }),
      new ConsultationSectionItem(InvestigationChartFormComponent, undefined, 'Radiology Investigation', {
        name: 'Radiology Investigation',
        key: 'radiology_investigation',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(InvestigationChartFormComponent, undefined, 'Lab Investigation', {
        name: 'Lab Investigation',
        key: 'lab_investigation',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(InvestigationChartFormComponent, undefined, 'Investigation', {
        name: 'Investigation',
        key: 'investigation',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(VitalFormsComponent, undefined, 'Vitals', {
        name: 'Vitals',
        key: 'vitals',
        templateFormName: 'vitalFrm',
        display: false
      }),
      new ConsultationSectionItem(PrescriptionComponent, undefined, 'Medicine', {
        name: 'Medicine',
        key: 'prescription',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(PainScaleComponent, undefined, 'Pain Scale', {
        name: 'Pain Scale',
        key: 'pain_scale',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(PainReliefComponent, undefined, 'Pain Relief', {
        name: 'Pain Relief',
        key: 'pain_relief',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(HumanBodySectionComponent, undefined, 'Human Body', {
        name: 'Human Body',
        key: 'human_body',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(FootExaminationComponent, undefined, 'Foot Examination', {
        name: 'Foot Examination',
        key: 'foot_examination',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(ExaminationLabelFormChartComponent, 'examination_label', 'Examination', {
        name: 'Exam Label',
        key: 'examination_label',
        templateFormName: 'examinationLableFrm',
        display: false
      }),
      new ConsultationSectionItem(MedicineOrdersComponent, 'medicineOrders', 'Medicine Orders', {
        name: 'Medicine Orders',
        key: 'medicineOrders',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(LabOrdersComponent, 'labOrders', 'Lab Orders', {
        name: 'Lab Orders',
        key: 'labOrders',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(RadiologyOrdersComponent, 'radiologyOrders', 'Radiology Orders', {
        name: 'Radiology Orders',
        key: 'radiologyOrders',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(DietOrdersComponent, 'dietOrders', 'Diet Orders', {
        name: 'Diet Orders',
        key: 'dietOrders',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(NursingOrdersComponent, 'nursingOrders', 'Nursing Orders', {
        name: 'Nursing Orders',
        key: 'nursingOrders',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(DoctorInformationComponent, 'otherOrders', 'Other', {
        name: 'Other',
        key: 'otherOrders',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(AdviceComponent, 'advice', 'Advice', {
        name: 'Advice',
        key: 'advice',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(FollowupDateComponent, 'followup_date', 'Follow Up', {
        name: 'Follow Up',
        key: 'followup_date',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(ScoreTemplateComponent, 'score_template', 'Score Template', {
        name: 'Score Template',
        key: 'score_template',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(ChartDateTimeComponent, 'chart_date_time', 'Chart Date Time', {
        name: 'Chart Date Time',
        key: 'chart_date_time',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(ChartUserComponent, 'chart_user', 'Chart User', {
        name: 'Chart User',
        key: 'chart_user',
        templateFormName: '',
        display: false
      }),
      new ConsultationSectionItem(OtRegisterComponent, 'ot_register', 'OT Register', {
        name: 'OT Register',
        key: 'ot_register',
        templateFormName: '',
        display: false
      }),
    ];
  }

  getComponentDetailsByKey(key) {
    const componentList = this.getAllComponents();
    const filteredVal = componentList.filter(x => x.data['key'] === key);
    return filteredVal.length ? filteredVal[0] : {};
  }

  getComponentChartKeys() {
    return this.componentChartKeys;
  }

  getChartKeyBySectionKey(sectionKey) {
    const dt = this.componentChartKeys.find(c => c.componentKey === sectionKey);
    return dt.chartKey;
  }

  getSectionKeyByChartKey(chartKey, investigationType?: string) {
    let dt = null;
    if (investigationType) {
      dt = this.componentChartKeys.find(c => (c.chartKey === chartKey) && (c.investigationType === investigationType));
    } else {
      dt = this.componentChartKeys.find(c => c.chartKey === chartKey);
    }
    return dt.componentKey;
  }
}

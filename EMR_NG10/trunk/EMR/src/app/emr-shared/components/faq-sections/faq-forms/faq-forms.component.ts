import { Component, Input, OnInit, OnChanges, DoCheck } from '@angular/core';
import { ConsultationService } from '../../../../public/services/consultation.service';

@Component({
  selector: 'app-faq-forms',
  templateUrl: './faq-forms.component.html',
  styleUrls: ['./faq-forms.component.scss']
})
export class FaqFormsComponent implements OnInit, DoCheck {
  @Input() faqSection;
  @Input() source;
  @Input() category;
  @Input() isPreview = false;
  constructor(
    private _consultationService: ConsultationService
  ) { }

  ngOnInit() {
    // console.log('faqSection:', this.faqSection);
    // this.faqSection = this.faqSection.getCompInstance();
    // this.faqSection.loadFaqSectionFromUnclubbed(this.category, false, true);
    // this.faqSection.showFaqSectionQuestions(this.categoryData, false, true);
  }

  // ngOnChanges(changes) {
  //   console.log('FaqFormsComponent', changes, this.faqSection);
  // }

  ngDoCheck(): void {
    // console.log('FaqFormsComponent', this.faqSection.patientFaqSectionList);
    this.setFaqInputs();
    // Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.
    // Add 'implements DoCheck' to the class.

  }

  trackByFun(index, item) {
    return index;
  }

  setFaqInputs() {
    if (!this.isPreview) {
      const patId = this._consultationService.getPatientObj('patientId');
      this._consultationService.setConsultationFormData(patId, 'PatientFaqInputs', this.faqSection.patientFaqSectionList);
    }
  }

  trackByFunction = (index, item) => {
    if (!item) { return null; }
    return index;
  }

  getOptionListData(){

  }

}

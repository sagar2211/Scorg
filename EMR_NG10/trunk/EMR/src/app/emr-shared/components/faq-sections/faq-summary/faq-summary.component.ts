import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-faq-summary',
  templateUrl: './faq-summary.component.html',
  styleUrls: ['./faq-summary.component.scss']
})
export class FaqSummaryComponent implements OnInit, OnChanges {
  @Input() faqSection;
  @Input() faqSummaryData;
  @Input() source;
  @Input() test;
  @Input() patientFaqSectionList;

  categoryWiseData  = []

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.faqSection = this.faqSection;
    this.faqSummaryData = this.faqSummaryData;
    this.source = this.source;
    // console.log('patientFaqSectionList', this.faqSummaryData)
    // console.log('patientFaqSectionList', this.test)
    // console.log('patientFaqSectionList', this.patientFaqSectionList)
    setTimeout(() => {
      this.updateAnswerinQuestionGroup();
    })
  }

  trackByFunction = (index, item) => {
    if (!item) { return null; }
    return index;
  }

  updateAnswerinQuestionGroup(): void {
    // this.faqSummaryData.forEach(faSectionData => {
    //   faSectionData.faqCurrentSectionCategoryList.forEach(category => {
    //     const indx = this.patientFaqSectionList.findIndex(p => p.sectionId === category.sectionId && p.categoryId === category.categoryId);
    //     if (indx !== -1) {
    //       category = Object.assign(category, this.patientFaqSectionList[indx]);
    //     }
    //   });
    //   faSectionData.faqCurrentSectionCategoryList = _.uniqBy(faSectionData.faqCurrentSectionCategoryList , 'categoryId');
    // });
    const summeryData = [];
    // console.log(_);
    // this.categoryWiseData = _.uniqBy(this.patientFaqSectionList, 'categoryId');
    // this.categoryWiseData.forEach(res => {
    //   const filteredData = this.patientFaqSectionList.filter(p => p.categoryId === res.categoryId);
    //   filteredData.forEach((f, i) => {
    //     if (i !== 0) {
    //       f.sectionTabularHeadingData = []
    //     }
    //   })
    // })
  }

  // getSectionCategoryData(data): any{
  //     console.log(data)
  //   return data;
  // }

}

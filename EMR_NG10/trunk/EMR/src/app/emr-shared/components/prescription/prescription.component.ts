import { DynamicChartService } from './../../../dynamic-chart/dynamic-chart.service';
import { Component, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as _ from 'lodash';
import { PrescriptionService } from '../../../public/services/prescription.service';
import { takeUntil } from 'rxjs/operators';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLangService } from './../../../public/services/translate-lang.service';
import { CommonService } from 'src/app/public/services/common.service';
@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',

  styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit, OnDestroy {

  loadSuggestion = false;
  compInstance = this;
  languageList: any[] = [];
  @ViewChild('medicineOrders', { static: false }) medicineOrdersComp: any;
  selectedLanguage: { name: string, id: string };
  private ngUnsubscribe = new Subject();
  @Input() public componentInfo: any;
  isPanelOpen: boolean;
  chartDetailId: number;

  constructor(
    private prescriptionService: PrescriptionService,
    private translateService: TranslateLangService,
    private dynamicChartService: DynamicChartService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
    this.getLanguageList();
  }

  // unsubscribe to ensure no memory leaks
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.unsubscribe();
  }

  getLanguageList(): Observable<any> {
    const obs = this.compInstance.prescriptionService.getLanguageList();
    obs.subscribe(res => {
      _.map(res, (val) => {
        this.compInstance.languageList.push(val);
      });
      this.selectedLanguage = this.compInstance.languageList[0];
      this.compInstance.prescriptionService.setLanguageDetails(this.compInstance.languageList[0]);
      this.compInstance.setLang(this.compInstance.languageList[0]);
    });
    return obs;
  }

  // --set the selected language to achive i18n or translate the language ex:en to hi
  setLang(lang: { name: string; id: string }) {
    if (lang.id === '1') {
      this.translateService.use('en', 'prescription').pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    } else if (lang.id === '2') {
      this.translateService.use('hi', 'prescription').pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    } else {
      this.translateService.use('mr', 'prescription').pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    }
  }

  // --event fire when selectedLanguage change()
  onLanguageChange(): void {
    if (this.selectedLanguage) {
      // this.selectedLanguage = language;
      this.setLang(this.selectedLanguage);
      // this.initTransliterationAPI();
      // this.loadInstruction();
      // this.setInstructionOnLanguageChange();
      // this.clearForm();
    } else {
      this.selectedLanguage = this.languageList[0];
    }
  }

  openSuggestionPanel(): void {
    setTimeout(() => {
      this.dynamicChartService.sendEventToSuggestion.next({
        sectionKeyName: 'prescription',
        componentData: { chartDetailId: this.chartDetailId }
      });
    });
    this.dynamicChartService.sendEventToParentChartContainer.next({source: 'prescription', content: {prescriptionDetails: null}});
  }

  public beforeChange($event: NgbPanelChangeEvent) {
    if ($event.panelId === 'prescription') {
      $event.preventDefault();
    }
  }

  openSuggPanel(){
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('open');
  }

  panelChange(event): void {
    this.isPanelOpen = event.nextState;
    setTimeout(() => {
      this.dynamicChartService.sendEventToSuggestion.next({
        sectionKeyName: 'prescription',
        componentData: { chartDetailId: this.chartDetailId }
      });
    });
    this.dynamicChartService.sendEventToParentChartContainer.next({source: 'prescription', content: {prescriptionDetails: null}});
  }

  openModalPopupSugg(val) {
    if (this.commonService.isTabModeOn) {
      this.commonService.openSuggesstionPanelWhenTabModeOnForComponents(val);
    }
  }

}

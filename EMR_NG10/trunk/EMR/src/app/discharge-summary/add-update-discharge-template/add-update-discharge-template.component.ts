import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {map} from 'rxjs/operators';
import {Speciality} from '../../public/models/speciality.model';
import {HttpClient} from '@angular/common/http';
import {MappingService} from '../../public/services/mapping.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import {DischargeSummaryService} from '../discharge-summary.service';
@Component({
  selector: 'app-add-update-discharge-template',
  templateUrl: './add-update-discharge-template.component.html',
  styleUrls: ['./add-update-discharge-template.component.scss']
})
export class AddUpdateDischargeTemplateComponent implements OnInit {

  @Input() templateData: any;
  filteredChartList = [];
  componentList = [];
  isGeneric = false;
  templateName = '';
  speciality: any;
  specialityList$: any;

  constructor(
    public modal: NgbActiveModal,
    private http: HttpClient,
    private mappingService: MappingService,
    private dischargeSummaryService: DischargeSummaryService
  ) { }

  ngOnInit(): void {
    const specialityParams = {
      search_string: '',
      page_number: 1,
      limit: 100
    };
    this.mappingService.getSpecialityList(specialityParams).subscribe(res => {
      this.specialityList$ = res;
    });
    this.filteredChartList = (this.templateData) ? this.templateData.charts : [];
    this.componentList = (this.templateData) ? this.templateData.components : [];
  }

  closePopup(): void {
    this.modal.close(false);
  }

  onSpecialityChange(speciality): void {
    // console.log('speciality', speciality);
    if (speciality) {
      this.templateName = speciality.name;
    } else {
      this.templateName = '';
    }
  }

  saveAsTemplate(): any {
    let componentArray = [];
    let chartIdArray = [];
    _.forEach(this.filteredChartList, (chart) => {
      chartIdArray.push(chart.chartId);
    });
    _.forEach(this.componentList, (component) => {
      const obj = {
        chartDetailIds: component.chartDetailIds,
        sectionName: component.sectionName,
        sectionRefId: component.sectionRefId,
        sectionKey: component.sectionKey,
        sectionType: component.sectionType,
        displaySetting: component.displayType
      };
      componentArray.push(obj);
    });
    const reqParams = {
      templateId: 0,
      templateName: this.templateName,
      specialityId: (this.isGeneric) ? 0 : this.speciality,
      chartIds: chartIdArray,
      components: componentArray
    };

    this.dischargeSummaryService.saveDischargeSummeryTemplate(reqParams).subscribe(res => {
      if (res.status_message === 'Success') {
        this.modal.close(true);
      }
    });
  }
}

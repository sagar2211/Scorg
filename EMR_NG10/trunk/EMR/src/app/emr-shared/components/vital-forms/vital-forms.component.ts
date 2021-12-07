import { Component, OnInit, Input } from '@angular/core';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { VitalsDataService } from './../../../public/services/vitals-data.service';
import * as _ from 'lodash';
import { VitalSave } from './../../../public/models/vitals';
import { DynamicChartService } from '../../../dynamic-chart/dynamic-chart.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-vital-forms',
  templateUrl: './vital-forms.component.html',
  styleUrls: ['./vital-forms.component.scss']
})
export class VitalFormsComponent implements OnInit {

  @Input() specialtyId: number;
  @Input() serviceTypeId: number;
  @Input() public componentInfo: any;

  vitalListSet: VitalSave[];
  vitalSetGetDataKy = 'vitals_detail';
  vitalDataList = [];
  vitalsList = [];
  isPanelOpen: boolean;
  chartDetailId: number;

  constructor(
    private vitalsDataService: VitalsDataService,
    private dynamicChartService: DynamicChartService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.chartDetailId = this.componentInfo.chart_detail_id;
    this.isPanelOpen = (this.componentInfo.activeIdsOfPanels as Array<any>).indexOf(this.componentInfo.section_key) !== -1 ? true : false;
    this.getAllVitalsDataList();
  }

  getAllVitalsDataList() {
    if (this.serviceTypeId && this.specialtyId) {
      const param = {
        service_type_id: this.serviceTypeId,
        speciality_id: this.specialtyId
      };
      this.vitalsDataService.getConsultationVitalsList(param).subscribe(res => {
        this.vitalDataList = res;
        _.map(this.vitalDataList, dt => {
          dt.vital.value = null;
          dt.isUsedInFormula = false;
          dt.tooltip = '';
          dt.color = null;
          dt.vitalFormulaId = null;
          if (dt.clubbedVital) {
            dt.clubbedVital.value = null;
            dt.clubbedVitalData.tooltip = '';
            dt.clubbedVitalData.color = null;
          }
        });
        this.defaultDataSet();
        // console.log(this.vitalDataList);
      });
    }
  }

  defaultDataSet() {
    this.updateFunctionForFormula();
    this.updateFunctionForClubbedFormula();
    this.updateFunctionForSequence();
    this.getVitalInitData();
    this.setDefaultTooltip();
  }

  getVitalInitData() {
    this.dynamicChartService.getChartDataByKey(this.vitalSetGetDataKy, true, null, this.chartDetailId).subscribe(result => {
      // this.allergiesFrm.patchValue({ isAllergySelected: result.isAllergySelected });
      if (result === null) {
        this.vitalListSet = [];
      } else if (result.length) {
        this.vitalListSet = result;
        this.updateVitalValue();
      }
    });
  }

  updateVitalValue() {
    _.map(this.vitalDataList, dt => {
      const index = _.findIndex(this.vitalListSet, list => {
        return dt.vital.id === list.vital_id;
      });
      if (index !== -1) {
        dt.vital.value = this.vitalListSet[index].vital_text;
      }
      if (dt.clubbedVital) {
        const indexClb = _.findIndex(this.vitalListSet, list => {
          return (dt.clubbedVital && dt.clubbedVital.id === list.vital_id);
        });
        if (indexClb !== -1) {
          dt.clubbedVital.value = this.vitalListSet[indexClb].vital_text;
        }
      }
    });
  }

  setDefaultTooltip() {
    _.map(this.vitalDataList, vtl => {
      if (vtl.rangeData.length) {
        const obj = this.setVitalRangeColor(vtl.rangeData, vtl.vital.value);
        vtl.color = obj.color;
        vtl.tooltip = obj.tooltip;
      }
      if (vtl.clubbedVitalData && vtl.clubbedVitalData.rangeData.length) {
        const obj = this.setVitalRangeColor(vtl.clubbedVitalData.rangeData, vtl.clubbedVital.value);
        vtl.clubbedVitalData.color = obj.color;
        vtl.clubbedVitalData.tooltip = obj.tooltip;
      }
    });
  }

  updateFunctionForFormula() {
    const vitalWhichHaveFormula = _.filter(this.vitalDataList, dt => {
      return dt.vitalFormula && dt.vitalFormula.detail;
    });
    _.map(vitalWhichHaveFormula, vtl => {
      _.map(vtl.vitalFormula.idArray, id => {
        const index = _.findIndex(this.vitalDataList, list => {
          return list.vital.id === id;
        });
        if (index !== -1) {
          this.vitalDataList[index].isUsedInFormula = true;
          this.vitalDataList[index].vitalFormulaId = vtl.vital.id;
        }
        const indexClb = _.findIndex(this.vitalDataList, list => {
          return (list.clubbedVital && list.clubbedVital.id === id);
        });
        if (indexClb !== -1) {
          this.vitalDataList[indexClb].clubbedVitalData.isUsedInFormula = true;
          this.vitalDataList[indexClb].clubbedVitalData.vitalFormulaId = vtl.vital.id;
        }
      });
    });
  }

  updateFunctionForClubbedFormula() {
    const vitalWhichHaveFormula = _.filter(this.vitalDataList, dt => {
      return dt.clubbedVitalData && dt.clubbedVitalData.vitalFormula && dt.clubbedVitalData.vitalFormula.detail;
    });
    _.map(vitalWhichHaveFormula, vtl => {
      _.map(vtl.clubbedVitalData.vitalFormula.idArray, id => {
        const index = _.findIndex(this.vitalDataList, list => {
          return list.vital.id === id;
        });
        if (index !== -1) {
          this.vitalDataList[index].isUsedInFormula = true;
          this.vitalDataList[index].vitalFormulaId = vtl.vital.id;
        }
        const indexClb = _.findIndex(this.vitalDataList, list => {
          return (list.clubbedVital && list.clubbedVital.id === id);
        });
        if (indexClb !== -1) {
          this.vitalDataList[indexClb].clubbedVitalData.isUsedInFormula = true;
          this.vitalDataList[indexClb].clubbedVitalData.vitalFormulaId = vtl.vital.id;
        }
      });
    });
  }

  removedClubbedDuplicateVital() {
    const clbVtlData = _.filter(this.vitalDataList, dt => {
      return dt.clubbedVital && dt.clubbedVital.id;
    });
    _.map(clbVtlData, vtl => {
      const index = _.findIndex(this.vitalDataList, list => {
        return list.vital.id === vtl.clubbedVital.id;
      });
      if (index !== -1) {
        this.vitalDataList.splice(index, 1);
      }
    });
  }

  updateFunctionForSequence() {
    const listData = _.cloneDeep(this.vitalDataList);
    this.vitalDataList = [];
    this.vitalDataList = _.sortBy(listData, dt => {
      return dt.sequence;
    });
  }

  updateVitalValueFormula(item, i, isClubbed) {
    if (item.rangeData.length) {
      const obj = this.setVitalRangeColor(item.rangeData, item.vital.value);
      if (isClubbed) {
        this.vitalDataList[i].clubbedVitalData.color = obj.color;
        this.vitalDataList[i].clubbedVitalData.tooltip = obj.tooltip;
      } else {
        this.vitalDataList[i].color = obj.color;
        this.vitalDataList[i].tooltip = obj.tooltip;
      }
    }
    if (item.isUsedInFormula || (isClubbed && item.clubbedVitalData && item.clubbedVitalData.isUsedInFormula)) {
      const index = _.findIndex(this.vitalDataList, list => {
        return (list.vital.id === item.vitalFormulaId || (item.clubbedVitalData && (list.vital.id === item.clubbedVitalData.vitalFormulaId)));
      });
      if (index !== -1) {
        const fomulaVtl = this.vitalDataList[index];
        this.generateFormula(fomulaVtl, index, isClubbed);
        // console.log(fomulaVtl);
      }
    }
    this.outputVitalData();
  }

  generateFormula(fomulaVtl, index, isClubbed) {
    const splitData = fomulaVtl.vitalFormula.detail.match(/[\w]+|[-+*/]+|[0-9]+|[()]+|[\[]+|[\]]/g);
    let calcData = null;
    _.map(splitData, (d) => {
      const vtlData = _.find(this.vitalDataList, list => {
        return (list.vital.key === d);
      });
      const clubbedVital = _.find(this.vitalDataList, list => {
        return (list.clubbedVital && list.clubbedVital.key === d);
      });
      if (vtlData) {
        calcData += parseFloat(vtlData.vital.value) ? parseFloat(vtlData.vital.value) : 0;
      } else if (clubbedVital) {
        calcData += parseFloat(clubbedVital.clubbedVital.value) ? parseFloat(clubbedVital.clubbedVital.value) : 0;
      } else {
        if (d.match(/[-+*/]+|[()]+|[\[]+|[\]]/g)) {
          calcData += d;
        } else {
          calcData += parseFloat(d);
        }
      }
    });
    try {
      let tot = eval(calcData) === Infinity ? null : eval(calcData);
      tot = tot[0] || tot;
      this.vitalDataList[index].vital.value = tot ? _.toNumber(tot) : null; // $filter('number')(tot, 3) : '';
    } catch (err) {
      this.vitalDataList[index].vital.value = null;
      console.log(err);
    }
    if (fomulaVtl.rangeData.length) {
      const obj = this.setVitalRangeColor(fomulaVtl.rangeData, fomulaVtl.vital.value);
      if (isClubbed) {
        this.vitalDataList[index].clubbedVitalData.color = obj.color;
        this.vitalDataList[index].clubbedVitalData.tooltip = obj.tooltip;
      } else {
        this.vitalDataList[index].color = obj.color;
        this.vitalDataList[index].tooltip = obj.tooltip;
      }
    }
  }

  setVitalRangeColor(vital, value) {
    let rangeColor = null;
    let tooltip = '';

    _.map(vital, (element, index) => {
      if (value) {
        if (element.firstRange.operator === 'equal' && element.secondRange.operator === 'equal'
          && (parseFloat(value) >= parseFloat(element.firstRange.value) && parseFloat(value) <= parseFloat(element.secondRange.value))) {
          rangeColor = element.color;
        }
        if (element.firstRange.operator === 'greater' &&
          parseFloat(element.firstRange.value) < parseFloat(value)) {
          rangeColor = element.color;
        }
        if (element.secondRange.operator === 'less' &&
          parseFloat(element.secondRange.value) > parseFloat(value)) {
          rangeColor = element.color;
        }
        if (element.firstRange.operator === 'greater_and_equal' &&
          parseFloat(value) >= parseFloat(element.firstRange.value)) {
          rangeColor = element.color;
        }
        if (element.secondRange.operator === 'less_and_equal' &&
          parseFloat(value) <= parseFloat(element.secondRange.value)) {
          rangeColor = element.color;
        }
      }
      // tooltip manipulate
      if (element.firstRange.operator === 'equal' && element.secondRange.operator === 'equal') {
        tooltip += (tooltip !== '' ? ' <br> ' : '') + element.category.category + '- '
          + element.firstRange.value + ' to ' + element.secondRange.value;
      } else if (element.firstRange.operator === 'greater') {
        tooltip += (tooltip !== '' ? ' <br> ' : '') + element.category.category + '- '
          + ' greater than ' + element.firstRange.value;
      } else if (element.secondRange.operator === 'less') {
        tooltip += (tooltip !== '' ? ' <br> ' : '') + element.category.category + '- '
          + ' less than ' + element.secondRange.value;
      } else if (element.firstRange.operator === 'greater_and_equal') {
        tooltip += (tooltip !== '' ? ' <br> ' : '') + element.category.category + '- '
          + ' greater than and equal ' + element.firstRange.value;
      } else if (element.secondRange.operator === 'less_and_equal') {
        tooltip += (tooltip !== '' ? ' <br> ' : '') + element.category.category + '- '
          + ' less than and equal ' + element.secondRange.value;
      }
    });
    const obj = {
      color: rangeColor,
      tooltip: tooltip ? "<div class='popover-tooltip'>" + tooltip + "</div>" : ''
    };
    return obj;
  }

  prepareAndSaveLocalTransData() {
    const vitalData = this.outputVitalData();
    this.dynamicChartService.updateLocalChartData('vitals', vitalData, 'update', this.chartDetailId);
  }

  outputVitalData() {
    const vitalArray = [];
    const obj = {
      vital_name: null,
      vital_text: null,
      vital_id: null,
      chart_detail_id: this.chartDetailId
    };
    _.map(this.vitalDataList, vtl => {
      obj.vital_name = vtl.vital.name;
      obj.vital_id = vtl.vital.id;
      obj.vital_text = vtl.vital.value;
      const vObj = new VitalSave();
      if (vtl.vital.value) {
        vObj.generateObject(obj);
        vitalArray.push(_.cloneDeep(vObj));
      }
      if (vtl.clubbedVital) {
        obj.vital_name = vtl.clubbedVital.name;
        obj.vital_id = vtl.clubbedVital.id;
        obj.vital_text = vtl.clubbedVital.value;
        if (vtl.clubbedVital.value) {
          vObj.generateObject(obj);
          vitalArray.push(_.cloneDeep(vObj));
        }
      }
    });
    // this.vitalDataUpdated.emit(vitalArray);
    // return vitalArray;
    this.dynamicChartService.updateLocalChartData(this.vitalSetGetDataKy, vitalArray, 'update', this.chartDetailId);
  }

  panelChange(event: NgbPanelChangeEvent) {
    this.isPanelOpen = event.nextState;
  }

  openCloseSuggPanel() {
    this.commonService.openSuggesstionPanelOnFixedComponentSearchCallFunction('close');
  }

}

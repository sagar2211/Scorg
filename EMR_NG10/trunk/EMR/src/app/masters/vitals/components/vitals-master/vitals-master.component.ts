import { Component, OnInit, Input } from '@angular/core';
import { IAlert } from './../../../../public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { VitalsDataService } from './../../../../public/services/vitals-data.service';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-vitals-master',
  templateUrl: './vitals-master.component.html',
  styleUrls: ['./vitals-master.component.scss']
})
export class VitalsMasterComponent implements OnInit {

  vitalInputData = {
    type: 'add',
    data: null
  };
  setAlertMessage: IAlert;

  rangeFirstFilter = [
    { name: 'Not Set', id: '0' },
    { name: 'First Range Start', id: 'equal' },
    { name: 'First Range Greater than', id: 'greater' },
    { name: 'First Range Greater than and equal', id: 'greater_and_equal' }
  ];

  rangeSecondFilter = [
    { name: 'Not Set', id: '0' },
    { name: 'Second Range End', id: 'equal' },
    { name: 'Second Range Less than', id: 'less' },
    { name: 'Second Range Less than and equal', id: 'less_and_equal' }
  ];

  categoryList = [
    { id: 1, category: 'Normal' },
    { id: 2, category: 'Moderate' },
    { id: 3, category: 'Severe' }
  ];

  vitalTypeList = [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' }
  ];

  vitalDataSelected = {
    id: 0,
    key: null,
    displayName: null,
    prefix: null,
    suffix: null,
    vitalUnit: null,
    vitalType: 'number',
    clubbedVital: null,
    rangeData: [],
    isDecimal: false,
    formulaValue: null
  };

  operatorList = ['+', '-', '*', '/', '(', ')', '[', ']'];

  vitalRangeObj = {
    id: 0,
    categoryId: '0',
    category: '',
    firstRange: {
      operator: '0',
      value: 0
    },
    secondRange: {
      operator: '0',
      value: 0
    },
    color: '#a6ce39',
    errors: {}
  };

  formulaError: boolean;

  vitalValueList = [];
  vitalMasterList = [];
  compInstance = this;
  loadForm: boolean;
  constructor(
    private vitalsDataService: VitalsDataService,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    this.commonService.routeChanged(this.route);
    if (!_.isUndefined(this.route.snapshot.params.vitalId)) {
      this.vitalInputData.type = 'edit';
      this.vitalsDataService.getVitalById(this.route.snapshot.params.vitalId).subscribe(data => {
        const obj = this.vitalsDataService.generateVitalData(data);
        this.vitalInputData.data = obj;
        this.onLoadCheck();
      });
    } else {
      this.vitalInputData.type = 'add';
      this.vitalInputData.data = null;
      this.onLoadCheck();
    }
  }

  onLoadCheck() {
    this.getAllMasterVitalList().subscribe(res => {
      this.loadForm = true;
      this.setDefaultObject();
      if (this.vitalInputData.type === 'edit') {
        this.setVitalValue();
      }
    });
  }

  setDefaultObject() {
    this.getAllVitalListForFolmula();
    this.getAllVitalCategoryList();
    this.formulaError = false;
    this.vitalDataSelected.rangeData.push(_.cloneDeep(this.vitalRangeObj));
  }

  setVitalValue() {
    this.vitalDataSelected = {
      id: this.vitalInputData.data.vital.id,
      key: this.vitalInputData.data.vital.key,
      displayName: this.vitalInputData.data.vital.name,
      prefix: this.vitalInputData.data.prefix,
      suffix: this.vitalInputData.data.suffix,
      vitalUnit: this.vitalInputData.data.vitalUnit,
      vitalType: this.vitalInputData.data.vital.vitalType,
      clubbedVital: this.vitalInputData.data.clubbedVital,
      rangeData: [],
      isDecimal: this.vitalInputData.data.isDecimal,
      formulaValue: this.vitalInputData.data.vitalFormula ? this.vitalInputData.data.vitalFormula.display : null,
    };
    _.map(this.vitalInputData.data.rangeData, dt => {
      this.vitalDataSelected.rangeData.push(_.cloneDeep(this.updateRangeData(dt)));
    });
    if (this.vitalDataSelected.rangeData.length === 0) {
      this.vitalDataSelected.rangeData.push(_.cloneDeep(this.vitalRangeObj));
    }
    this.getAllVitalListForFolmula();
  }

  updateRangeData(val) {
    const obj = {
      id: val.id,
      categoryId: val.category.id,
      category: val.category.category,
      firstRange: val.firstRange,
      secondRange: val.secondRange,
      color: val.color,
      errors: {}
    };
    // this.chooseColorFromPalette(val.color, obj.color);
    return obj;
  }

  selectValueConfirm(typ: string) {
    if (typ === 'Ok') {
      this.saveVitalData().subscribe(res => {
        if (res) {
          this.router.navigate(['/emr/vitals/masterList']);
        } else {
          this.notifyAlertMessage({
            msg: 'Something Went Wrong',
            class: 'danger',
          });
        }
      });
    } else {
      this.router.navigate(['/emr/vitals/masterList']);
    }
  }

  addVitalRange(vitalRangeData, index) {
    if (this.validateVitalRange(vitalRangeData)) {
      this.vitalDataSelected.rangeData.push(_.cloneDeep(this.vitalRangeObj));
    }
  }

  removeVitalRange(vitalRangeData, index) {
    this.vitalDataSelected.rangeData.splice(index, 1);
    if (vitalRangeData.length === 0) {
      this.vitalDataSelected.rangeData.push(_.cloneDeep(this.vitalRangeObj));
    }
  }

  getCategoryId(catData) {
    const data = _.find(this.categoryList, dt => {
      return (dt.category === catData.category);
    });
    if (data) {
      return data.id;
    } else {
      return null;
    }
  }

  generateRangeDataForSave() {
    const rangeDataOrg = this.vitalDataSelected.rangeData;
    const rangeData = [];
    _.map(rangeDataOrg, dt => {
      if (dt.firstRange.operator !== '0' || dt.secondRange.operator !== '0') {
        const obj = {
          id: dt.id,
          category_id: this.getCategoryId(dt),
          category: dt.category,
          color: dt.color,
          firstRange: {
            rangeoperator: dt.firstRange.operator,
            value: dt.firstRange.value
          },
          secondRange: {
            rangeoperator: dt.secondRange.operator,
            value: dt.secondRange.value
          }
        };
        rangeData.push(_.cloneDeep(obj));
      }
    });
    return rangeData;
  }

  saveVitalData(): Observable<any> {
    if (this.checkSaveObjectValid()) {
      let formulaData = null;
      if (this.vitalDataSelected.formulaValue) {
        formulaData = this.generateKeyFormula();
      }
      const param = {
        vital_id: this.vitalDataSelected.id,
        vital_name: this.vitalDataSelected.displayName,
        prefix: this.vitalDataSelected.prefix,
        suffix: this.vitalDataSelected.suffix,
        vital_unit: this.vitalDataSelected.vitalUnit,
        vital_type: this.vitalDataSelected.vitalType,
        is_decimal: this.vitalDataSelected.vitalType === 'number' ? this.vitalDataSelected.isDecimal : false,
        formula_detail: formulaData ? formulaData.formula : null,
        formula_display: this.vitalDataSelected.formulaValue,
        clubbed_vital_id: this.vitalDataSelected.clubbedVital ? this.vitalDataSelected.clubbedVital.id : null,
        vital_range_data: this.vitalDataSelected.vitalType === 'number' ? this.generateRangeDataForSave() : [],
        formula_vitals_id: formulaData ? formulaData.idArry : [],
      };
      return this.vitalsDataService.saveVitalDetails(param).pipe(map(res => {
        return res;
      }));
    }
  }

  checkSaveObjectValid() {
    let returnVal = true;
    if (!this.vitalDataSelected.displayName) {
      this.notifyAlertMessage({
        msg: 'Please Add Vital Name',
        class: 'danger',
      });
      returnVal = false;
    }
    if (!this.validateVitalRange(this.vitalDataSelected.rangeData)) {
      this.notifyAlertMessage({
        msg: 'Please Check Range',
        class: 'danger',
      });
      returnVal = false;
    }
    return returnVal;
  }

  validateVitalRange(vitalRangeData) {
    let flag = true;
    _.forEach(this.vitalDataSelected.rangeData, (parentElement, parentIndex) => {
      parentElement.errors = {};
      if (parentElement.color === '') {
        parentElement.errors.color = 'Required';
        flag = false;
      }
      if (parentIndex === 0 && parentElement.firstRange.operator === 'equal'
        && parentElement.secondRange.operator === 'equal'
        && _.toNumber(parentElement.firstRange.value) >=
        _.toNumber(parentElement.secondRange.value)) {
        parentElement.errors.firstRange = ' Conflict';
        flag = false;
      }
      if (parentElement.category !== ''
        && parentElement.firstRange.operator === 0
        && parentElement.secondRange.operator === 0) {
        parentElement.errors.firstRange = 'Required';
        parentElement.errors.secondRange = 'Required';
        flag = false;
      }
      _.forEach(this.vitalDataSelected.rangeData, (childElement, childIndex) => {
        if (childIndex !== parentIndex) {
          // for equal range check conflict
          if (parentElement.firstRange.operator === 'equal'
            && childElement.firstRange.operator === 'equal') {
            if ((parseFloat(childElement.firstRange.value) || 0) <= (parseFloat(childElement.secondRange.value) || 0)) {
              if ((parseFloat(parentElement.firstRange.value) || 0) > (parseFloat(childElement.firstRange.value) || 0)
                && (parseFloat(parentElement.firstRange.value) || 0) < (parseFloat(childElement.secondRange.value) || 0)) {
                parentElement.errors.firstRange = ' Conflict';
                flag = false;
              }
              if ((parseFloat(parentElement.secondRange.value) || 0) >= (parseFloat(childElement.firstRange.value) || 0)
                && (parseFloat(parentElement.secondRange.value) || 0) <= (parseFloat(childElement.secondRange.value) || 0)) {
                parentElement.errors.secondRange = ' Conflict';
                flag = false;
              }
            }
            if ((parseFloat(childElement.firstRange.value) || 0) >
              (parseFloat(childElement.secondRange.value) || 0)) {
              if ((parseFloat(parentElement.firstRange.value) || 0) <
                (parseFloat(childElement.firstRange.value) || 0)
                && (parseFloat(parentElement.firstRange.value) || 0) >
                (parseFloat(childElement.secondRange.value) || 0)) {
                parentElement.errors.firstRange = ' Conflict';
                flag = false;
              }
              if ((parseFloat(parentElement.secondRange.value) || 0) <
                (parseFloat(childElement.firstRange.value) || 0)
                && (parseFloat(parentElement.secondRange.value) || 0) >
                (parseFloat(childElement.secondRange.value) || 0)) {
                parentElement.errors.secondRange = ' Conflict';
                flag = false;
              }
            }
          }
          if (childElement.firstRange.operator === 'greater') {
            if (parentElement.firstRange.operator === 'greater' &&
              (parseFloat(parentElement.firstRange.value) || 0)
              >= (parseFloat(childElement.firstRange.value) || 0)) {
              parentElement.errors.firstRange = ' Conflict';
              flag = false;
            }
            if (parentElement.firstRange.operator === 'equal' &&
              (parseFloat(parentElement.firstRange.value) || 0)
              > (parseFloat(childElement.firstRange.value) || 0)) {
              parentElement.errors.firstRange = ' Conflict';
              flag = false;
            }
            if (parentElement.secondRange.operator !== '0' &&
              (parseFloat(parentElement.secondRange.value) || 0) >
              (parseFloat(childElement.firstRange.value) || 0)) {
              parentElement.errors.secondRange = ' Conflict';
              flag = false;
            }
            if (parentElement.firstRange.operator === 'greater_and_equal' &&
              (parseFloat(parentElement.firstRange.value) || 0)
              >= (parseFloat(childElement.firstRange.value) || 0)) {
              parentElement.errors.firstRange = ' Conflict';
              flag = false;
            }
          }
          if (childElement.secondRange.operator === 'less') {
            if (parentElement.firstRange.operator !== '0' &&
              (parseFloat(parentElement.firstRange.value) || 0)
              < (parseFloat(childElement.secondRange.value) || 0)) {
              parentElement.errors.firstRange = ' Conflict';
              flag = false;
            }
            if (parentElement.secondRange.operator === 'equal' &&
              (parseFloat(parentElement.secondRange.value) || 0) <
              (parseFloat(childElement.secondRange.value) || 0)) {
              parentElement.errors.secondRange = ' Conflict';
              flag = false;
            }
            if (parentElement.secondRange.operator === 'less' &&
              (parseFloat(parentElement.secondRange.value) || 0) <=
              (parseFloat(childElement.secondRange.value) || 0)) {
              parentElement.errors.secondRange = ' Conflict';
              flag = false;
            }
            if (parentElement.secondRange.operator === 'less_and_equal' &&
              (parseFloat(parentElement.secondRange.value) || 0) <=
              (parseFloat(childElement.secondRange.value) || 0)) {
              parentElement.errors.secondRange = ' Conflict';
              flag = false;
            }
          }
          if (childElement.firstRange.operator === 'greater_and_equal') {
            if (parentElement.secondRange.operator !== '0' &&
              (parseFloat(parentElement.secondRange.value) || 0)
              >= (parseFloat(childElement.firstRange.value) || 0)) {
              parentElement.errors.secondRange = ' Conflict';
              flag = false;
            }
            if (parentElement.firstRange.operator === 'greater' &&
              (parseFloat(parentElement.firstRange.value) || 0)
              >= (parseFloat(childElement.firstRange.value) || 0)) {
              parentElement.errors.firstRange = ' Conflict';
              flag = false;
            }
            if (parentElement.firstRange.operator === 'equal' &&
              (parseFloat(parentElement.firstRange.value) || 0)
              > (parseFloat(childElement.firstRange.value) || 0)) {
              parentElement.errors.firstRange = ' Conflict';
              flag = false;
            }
          }
          if (childElement.secondRange.operator === 'less_and_equal') {
            if (parentElement.firstRange.operator !== '0' &&
              (parseFloat(parentElement.firstRange.value) || 0)
              < (parseFloat(childElement.secondRange.value) || 0)) {
              parentElement.errors.firstRange = ' Conflict';
              flag = false;
            }
            if (parentElement.secondRange.operator === 'equal' &&
              (parseFloat(parentElement.secondRange.value) || 0) <
              (parseFloat(childElement.secondRange.value) || 0)) {
              parentElement.errors.secondRange = ' Conflict';
              flag = false;
            }
            if (parentElement.secondRange.operator === 'less' &&
              (parseFloat(parentElement.secondRange.value) || 0) <=
              (parseFloat(childElement.secondRange.value) || 0)) {
              parentElement.errors.secondRange = ' Conflict';
              flag = false;
            }
          }
        }
      });
    });
    return flag;
  }

  updateRangeFilterSetting(input, rangeType) {
    if (rangeType === 'first') {
      input.firstRange.value = input.firstRange.operator === '0' ? 0 : input.firstRange.value;
      input.secondRange.operator = input.firstRange.operator === 'equal' ? 'equal' : input.secondRange.operator;
      input.secondRange.operator = input.secondRange.operator === 'equal' && input.firstRange.operator != 'equal' ? '0' : input.secondRange.operator;
    } else if (rangeType === 'second') {
      input.secondRange.value = input.secondRange.operator === '0' ? 0 : input.secondRange.value;
      input.firstRange.operator = input.secondRange.operator === 'equal' ? 'equal' : input.firstRange.operator;
      input.firstRange.operator = input.firstRange.operator === 'equal' && input.secondRange.operator != 'equal' ? '0' : input.firstRange.operator;
    }
    if (rangeType === 'first' && input.firstRange.operator === 'greater') {
      input.secondRange.operator = '0';
      input.secondRange.value = 0;
    }
    if (rangeType === 'second' && input.secondRange.operator === 'less') {
      input.firstRange.operator = '0';
      input.firstRange.value = 0;
    }
    if (rangeType === 'first' && input.firstRange.operator === 'greater_and_equal') {
      input.secondRange.operator = '0';
      input.secondRange.value = 0;
    }
    if (rangeType === 'second' && input.secondRange.operator === 'less_and_equal') {
      input.firstRange.operator = '0';
      input.firstRange.value = 0;
    }
  }

  onblurConvertColor(colorStr) {
    const a = document.createElement('div');
    a.style.color = colorStr.color;
    const colors = window.getComputedStyle(document.body.appendChild(a)).color.match(/\d+/g).map(function (a) { return parseInt(a, 10); });
    document.body.removeChild(a);
    const changedColor = (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1)) : false;
    colorStr.color = changedColor;
  }

  getAllMasterVitalList(): Observable<any> {
    return this.vitalsDataService.getAllVitals().pipe(map(res => {
      this.vitalMasterList = res;
      return res;
    }));
  }

  getAllVitalList(): Observable<any> {
    // remove current vital from list
    // can not clubbed same vital
    let clbVitalList = _.cloneDeep(this.compInstance.vitalMasterList);
    if (this.compInstance.vitalInputData.type === 'edit') {
      const indx = _.findIndex(clbVitalList, vt => {
        return vt.id === this.compInstance.vitalInputData.data.vital.id;
      });
      if (indx !== -1) {
        clbVitalList.splice(indx, 1);
      }
    }
    // get only who does't link with any vital
    clbVitalList = _.filter(clbVitalList, lst => {
      return lst.clubbedVitalId === null;
    });
    const vtlIdArray = _.map(_.filter(this.compInstance.vitalMasterList, lst => {
      if (this.compInstance.vitalInputData.type === 'edit') {
        return (lst.clubbedVitalId !== null
          || (this.compInstance.vitalInputData.data.clubbedVital
            && lst.clubbedVitalId === this.compInstance.vitalInputData.data.clubbedVital.id));
      } else {
        return lst.clubbedVitalId !== null;
      }
    }), d => {
      return d.clubbedVitalId;
    });
    if (vtlIdArray.length > 0) {
      clbVitalList = _.filter(clbVitalList, lst => {
        return !vtlIdArray.includes(lst.id);
      });
    }
    return of(clbVitalList);
  }

  // to show in formula list
  getAllVitalListForFolmula() {
    let vitalFormulaList = _.cloneDeep(this.vitalMasterList);
    this.vitalValueList = [];
    if (vitalFormulaList.length > 0) {
      // only vital which not have any formula can use in this
      vitalFormulaList = _.filter(vitalFormulaList, dt => {
        return dt.formulaVitalsId.length === 0;
      });
      this.vitalValueList = vitalFormulaList;
    }
    return this.vitalValueList;
  }

  getAllVitalCategoryList() {
    this.vitalsDataService.getVitalCategoryList().subscribe(res => {
      this.categoryList = [];
      if (res.length > 0) {
        this.categoryList = res;
      }
      return this.categoryList;
    });
  }

  selectClubbedValue(val) {
    this.vitalDataSelected.clubbedVital = val;
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  addDataToFormula(selectedValue, type) {
    if (type === 'operator') {
      if (this.vitalDataSelected.formulaValue) {
        this.vitalDataSelected.formulaValue += selectedValue;
      } else {
        this.vitalDataSelected.formulaValue = selectedValue;
      }
    } else {
      if (this.vitalDataSelected.formulaValue) {
        this.vitalDataSelected.formulaValue += selectedValue.name;
      } else {
        this.vitalDataSelected.formulaValue = selectedValue.name;
      }
    }
  }

  formulaValidation() {
    try {
      let storeFrmData = _.cloneDeep(this.vitalDataSelected.formulaValue);
      const sDat = this.vitalDataSelected.formulaValue.match(/[\w]+/g);
      _.forEach(sDat, (d) => {
        storeFrmData = storeFrmData.replace(d, 0);
      });
      eval(storeFrmData);
      this.formulaError = false;
      return true;
    } catch (error) {
      this.formulaError = true;
      return false;
    }
  }

  generateKeyFormula() {
    let vitalIdArray = [];
    const splitData = this.vitalDataSelected.formulaValue.match(/[\w]+|[-+*/]+|[0-9]+|[()]+|[\[]+|[\]]/g);
    _.forEach(splitData, (d, indx) => {
      _.forEach(this.vitalValueList, (v) => {
        if (v.name === d) {
          splitData[indx] = v.key;
          vitalIdArray.push(v.id);
        }
      });
    });
    vitalIdArray = _.uniq(vitalIdArray);
    return { formula: splitData.join(''), idArry: vitalIdArray };
  }

  updateDecimal(val) {
    console.log(val);
  }

  chooseColorFromPalette(event, index) {
    this.vitalDataSelected.rangeData[index].color = event;
  }

}

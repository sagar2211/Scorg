import { Injectable } from '@angular/core';
import { of, Observable, Subject } from 'rxjs';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PainDataService {
  _data = [];
  _printData = [];
  painChartData = {
    dermatome: {
      lightTouch: {
        left: {
          C2: 2, C3: 2, C4: 2, C5: 2, C6: 2, C7: 2, C8: 2,
          T1: 2, T2: 2, T3: 2, T4: 2, T5: 2, T6: 2, T7: 2, T8: 2, T9: 2, T10: 2, T11: 2, T12: 2, L1: 2, L2: 2, L3: 2, L4: 2, L5: 2, S1: 2, S2: 2, S3: 2, S4: 2
        },
        right: {
          C2: 2, C3: 2, C4: 2, C5: 2, C6: 2, C7: 2, C8: 2,
          T1: 2, T2: 2, T3: 2, T4: 2, T5: 2, T6: 2, T7: 2, T8: 2, T9: 2, T10: 2, T11: 2, T12: 2, L1: 2, L2: 2, L3: 2, L4: 2, L5: 2, S1: 2, S2: 2, S3: 2, S4: 2
        }
      },
      pinPrick: {
        left: {
          C2: 2, C3: 2, C4: 2, C5: 2, C6: 2, C7: 2, C8: 2,
          T1: 2, T2: 2, T3: 2, T4: 2, T5: 2, T6: 2, T7: 2, T8: 2, T9: 2, T10: 2, T11: 2, T12: 2, L1: 2, L2: 2, L3: 2, L4: 2, L5: 2, S1: 2, S2: 2, S3: 2, S4: 2
        },
        right: {
          C2: 2, C3: 2, C4: 2, C5: 2, C6: 2, C7: 2, C8: 2,
          T1: 2, T2: 2, T3: 2, T4: 2, T5: 2, T6: 2, T7: 2, T8: 2, T9: 2, T10: 2, T11: 2, T12: 2, L1: 2, L2: 2, L3: 2, L4: 2, L5: 2, S1: 2, S2: 2, S3: 2, S4: 2
        }
      }
    },
    mytome: {
      upper: {
        left: { C5: 5, C6: 5, C7: 5, C8: 5, T1: 5 },
        right: { C5: 5, C6: 5, C7: 5, C8: 5, T1: 5 }
      },
      lower: {
        left: { L2: 5, L3: 5, L4: 5, L5: 5, S1: 5 },
        right: { L2: 5, L3: 5, L4: 5, L5: 5, S1: 5 }
      }
    }
  };

  painSummaryData = {
    humanBody: {
      bodyPart: {}
    },
    dermatome: {
      lightTouch: {
        left: {},
        right: {}
      },
      pinPrick: {
        left: {},
        right: {}
      }
    },
    mytome: {
      upper: {
        left: {},
        right: {}
      },
      lower: {
        left: {},
        right: {}
      }
    },
    footExamine: {
      left: {},
      right: {}
    }
  };
  painAssociatedData = {
    comment: '',
    vacResult: false,
    dapResult: false,
    aisValue: '',
    completeModel: '',
    partialSensoryRight: '',
    partialSensoryLeft: '',
    partialMototRight: '',
    partialMototLeft: '',
    neurlogicalInjury: '',
    motorLeft: '',
    motorRight: '',
    sensoryRight: '',
    sensoryLeft: ''
  };

  painPrintAssociatedData = {
    comment: '',
    vacResult: false,
    dapResult: false,
    aisValue: '',
    completeModel: '',
    partialSensoryRight: '',
    partialSensoryLeft: '',
    partialMototRight: '',
    partialMototLeft: '',
    neurlogicalInjury: '',
    motorLeft: '',
    motorRight: '',
    sensoryRight: '',
    sensoryLeft: ''
  };

  painPrintChartData = {
    dermatome: {
      lightTouch: {
        left: {
          C2: 2, C3: 2, C4: 2, C5: 2, C6: 2, C7: 2, C8: 2,
          T1: 2, T2: 2, T3: 2, T4: 2, T5: 2, T6: 2, T7: 2, T8: 2, T9: 2, T10: 2, T11: 2, T12: 2, L1: 2, L2: 2, L3: 2, L4: 2, L5: 2, S1: 2, S2: 2, S3: 2, S4: 2, S5: 2
        },
        right: {
          C2: 2, C3: 2, C4: 2, C5: 2, C6: 2, C7: 2, C8: 2,
          T1: 2, T2: 2, T3: 2, T4: 2, T5: 2, T6: 2, T7: 2, T8: 2, T9: 2, T10: 2, T11: 2, T12: 2, L1: 2, L2: 2, L3: 2, L4: 2, L5: 2, S1: 2, S2: 2, S3: 2, S4: 2, S5: 2
        }
      },
      pinPrick: {
        left: {
          C2: 2, C3: 2, C4: 2, C5: 2, C6: 2, C7: 2, C8: 2,
          T1: 2, T2: 2, T3: 2, T4: 2, T5: 2, T6: 2, T7: 2, T8: 2, T9: 2, T10: 2, T11: 2, T12: 2, L1: 2, L2: 2, L3: 2, L4: 2, L5: 2, S1: 2, S2: 2, S3: 2, S4: 2, S5: 2
        },
        right: {
          C2: 2, C3: 2, C4: 2, C5: 2, C6: 2, C7: 2, C8: 2,
          T1: 2, T2: 2, T3: 2, T4: 2, T5: 2, T6: 2, T7: 2, T8: 2, T9: 2, T10: 2, T11: 2, T12: 2, L1: 2, L2: 2, L3: 2, L4: 2, L5: 2, S1: 2, S2: 2, S3: 2, S4: 2, S5: 2
        }
      }
    },
    mytome: {
      upper: {
        left: { C5: 5, C6: 5, C7: 5, C8: 5, T1: 5 },
        right: { C5: 5, C6: 5, C7: 5, C8: 5, T1: 5 }
      },
      lower: {
        left: { L2: 5, L3: 5, L4: 5, L5: 5, S1: 5 },
        right: { L2: 5, L3: 5, L4: 5, L5: 5, S1: 5 }
      }
    }
  };
  painPrintSummaryData = {
    humanBody: {
      bodyPart: {}
    },
    dermatome: {
      lightTouch: {
        left: {},
        right: {}
      },
      pinPrick: {
        left: {},
        right: {}
      }
    },
    mytome: {
      upper: {
        left: {},
        right: {}
      },
      lower: {
        left: {},
        right: {}
      }
    },
    footExamine: {
      left: {},
      right: {}
    }
  };

  public masterDisplayBodyParts = [{
    'svgType': 'humanBody',
    'svgName': 'headFlag',
    'svgNo': '13'
  }, {
    'svgType': 'humanBody',
    'svgName': 'headzoomFlag',
    'svgNo': '13_x'
  }, {
    'svgType': 'humanBody',
    'svgName': 'svgFrontFlag',
    'svgNo': '11'
  }, {
    'svgType': 'humanBody',
    'svgName': 'FrontzoomFlag',
    'svgNo': '11_x'
  }, {
    'svgType': 'humanBody',
    'svgName': 'svgBackFlag',
    'svgNo': '12'
  }, {
    'svgType': 'humanBody',
    'svgName': 'BackzoomFlag',
    'svgNo': '12_x'
  }, {
    'svgType': 'humanBody',
    'svgName': 'rightFlag',
    'svgNo': '15'
  }, {
    'svgType': 'humanBody',
    'svgName': 'rightzoomFlag',
    'svgNo': '15_x'
  }, {
    'svgType': 'humanBody',
    'svgName': 'leftFlag',
    'svgNo': '14'
  }, {
    'svgType': 'humanBody',
    'svgName': 'leftzoomFlag',
    'svgNo': '14_x'
  }, {
    'svgType': 'humanBody',
    'svgName': 'light_touchFlag',
    'svgNo': 'light_touch_checkup'
  }, {
    'svgType': 'humanBody',
    'svgName': 'light_touch_posteriorFlag',
    'svgNo': 'light_touch_posterior_checkup'
  }, {
    'svgType': 'humanBody',
    'svgName': 'pin_prickFlag',
    'svgNo': 'pin_prick_checkup'
  }, {
    'svgType': 'humanBody',
    'svgName': 'pin_prick_posteriorFlag',
    'svgNo': 'pin_prick_posterior_checkup'
  }, {
    'svgType': 'humanBody',
    'svgName': 'myotomeFlag',
    'svgNo': 'myotome_checkup'
  }, {
    'svgType': 'humanBody',
    'svgName': 'myotome_posteriorFlag',
    'svgNo': 'myotome_posterior_checkup'
  }];

  private setPain$ = new Subject<any>();
  public getPains$ = this.setPain$.asObservable();

  getArraySum(array): any {
    let _sum = 0;
    _.map(array, function (val) {
      if (val == 'NT') { // for chart value calculation
        val = 0;
      }
      _sum += +val;
    });
    return _sum;
  }

  getPain(returnObserbale?): any {
    _.map(this._data, (value) => {
      if (value.svg_type === 'myotome' && value.pain_score === '6') {
        value.pain_score = 'NT';
      } else if ((value.svg_type === 'dermatome_light' || value.svg_type === 'dermatome_pin') && (value.pain_score === '3')) {
        value.pain_score = 'NT';
      }
    });
    if (returnObserbale) {
      return this.getPains$.pipe(map(res => {
        _.map(res, (value) => {
          if (value.svg_type === 'myotome' && value.pain_score === '6') {
            value.pain_score = 'NT';
          } else if ((value.svg_type === 'dermatome_light' || value.svg_type === 'dermatome_pin') && (value.pain_score === '3')) {
            value.pain_score = 'NT';
          }
        });
        return res;
      }));
    } else {
      return this._data;
    }
    // return this._data;

  }

  setPain(value): void {
    this._data = value;
    this.setPain$.next(value); // send to observable
  }

  getPainAssociatedData(): Observable<any> {
    return of(this.painAssociatedData);
  }

  setPainAssociatedData(data): void {
    this.painAssociatedData = data;
  }

  getPainChartData(): Observable<any> {
    const p = Object.assign({}, this._data);
    const pd = _.uniq(p, 'body_part');
    const _painChartData = Object.assign({}, this.painChartData);
    _.map(pd, (part, index) => {
      const key = part.body_part.substring(part.body_part.lastIndexOf('_') + 1);
      const value = part.pain_score;
      if (part.svg_type === 'myotome') {
        if (part.body_part.startsWith('Left_Upper')) {
          _painChartData.mytome.upper.left[key] = value;
        } else if (part.body_part.startsWith('Left_Lower')) {
          _painChartData.mytome.lower.left[key] = value;
        } else if (part.body_part.startsWith('Right_Upper')) {
          _painChartData.mytome.upper.right[key] = value;
        } else if (part.body_part.startsWith('Right_Lower')) {
          _painChartData.mytome.lower.right[key] = value;
        }
      } else if (part.svg_type === 'dermatome_pin') {
        if (part.body_part.startsWith('Left')) {
          _painChartData.dermatome.pinPrick.left[key] = value;
        } else if (part.body_part.startsWith('Right')) {
          _painChartData.dermatome.pinPrick.right[key] = value;
        }
      } else if (part.svg_type === 'dermatome_light') {
        if (part.body_part.startsWith('Left')) {
          _painChartData.dermatome.lightTouch.left[key] = value;
        } else if (part.body_part.startsWith('Right')) {
          _painChartData.dermatome.lightTouch.right[key] = value;
        }
      }
    });
    return of(_painChartData);
  }

  ngCopy(data): any {
    return Object.assign({}, data);
  }

  getFilteredParts(): Observable<any> {
    const pDetails = this._data.map(x => this.ngCopy(x));
    const humanBodyList = _.filter(this._data, { svg_type: 'humanBody' });
    const copyOfHumanBOdyList = humanBodyList.map(res => Object.assign({}, res));
    if (humanBodyList.length > 0) {
      for (let i = 0; i < (humanBodyList.length); i++) {
        pDetails.splice(_.findIndex(pDetails, { 'body_part': humanBodyList[i].body_part, 'svg_name': humanBodyList[i].svg_name, 'svg_type': humanBodyList[i].svg_type }), 1);
      }
      _.map(copyOfHumanBOdyList, (value) => {
        value.body_part = value.body_part.replace(/[0-9]/g, '').replace(/_/g, ' ').trim();
        pDetails.push(value);
      });
    }
    const _painSummaryData = JSON.parse(JSON.stringify(this.painSummaryData));
    _.map(pDetails, (part, index) => {
      let key, value;
      if (part.svg_type === 'humanBody' || part.svg_type === 'footExamine') {
        if (part.svg_name === 'headzoomFlag' ||
          part.svg_name === 'FrontzoomFlag' || part.svg_name === 'BackzoomFlag' || part.svg_name === 'leftzoomFlag'
          || part.svg_name === 'rightzoomFlag') {
          key = part.body_part + '(' + 'd' + ')';
          value = part.pain_score;
        } else {
          key = part.body_part;
          value = part.pain_score;
        }
      } else {
        key = part.body_part.substring(part.body_part.lastIndexOf('_') + 1);
        value = part.pain_score;
      }
      if (part.svg_type === 'myotome') {
        const body_part = part.body_part.replace(' ', '_');
        if (body_part.startsWith('Left_Upper')) {
          if (_.isUndefined(_painSummaryData.mytome.upper.left[value])) {
            _painSummaryData.mytome.upper.left[value] = [];
          }
          _painSummaryData.mytome.upper.left[value].push(key);
        } else if (body_part.startsWith('Left_Lower')) {
          if (_.isUndefined(_painSummaryData.mytome.lower.left[value])) {
            _painSummaryData.mytome.lower.left[value] = [];
          }
          _painSummaryData.mytome.lower.left[value].push(key);
        } else if (body_part.startsWith('Right_Upper')) {
          if (_.isUndefined(_painSummaryData.mytome.upper.right[value])) {
            _painSummaryData.mytome.upper.right[value] = [];
          }
          _painSummaryData.mytome.upper.right[value].push(key);
        } else if (body_part.startsWith('Right_Lower')) {
          if (_.isUndefined(_painSummaryData.mytome.lower.right[value])) {
            _painSummaryData.mytome.lower.right[value] = [];
          }
          _painSummaryData.mytome.lower.right[value].push(key);
        }
      } else if (part.svg_type === 'dermatome_pin') {
        if (part.body_part.startsWith('Left')) {
          if (_.isUndefined(_painSummaryData.dermatome.pinPrick.left[value])) {
            _painSummaryData.dermatome.pinPrick.left[value] = [];
          }
          _painSummaryData.dermatome.pinPrick.left[value].push(key);
        } else if (part.body_part.startsWith('Right')) {
          if (_.isUndefined(_painSummaryData.dermatome.pinPrick.right[value])) {
            _painSummaryData.dermatome.pinPrick.right[value] = [];
          }
          _painSummaryData.dermatome.pinPrick.right[value].push(key);
        }
      } else if (part.svg_type === 'dermatome_light') {
        if (part.body_part.startsWith('Left')) {
          if (_.isUndefined(_painSummaryData.dermatome.lightTouch.left[value])) {
            _painSummaryData.dermatome.lightTouch.left[value] = [];
          }
          _painSummaryData.dermatome.lightTouch.left[value].push(key);
        } else if (part.body_part.startsWith('Right')) {
          if (_.isUndefined(_painSummaryData.dermatome.lightTouch.right[value])) {
            _painSummaryData.dermatome.lightTouch.right[value] = [];
          }
          _painSummaryData.dermatome.lightTouch.right[value].push(key);
        }
      } else if (part.svg_type === 'humanBody') {
        if (_.isUndefined(_painSummaryData.humanBody.bodyPart[value])) {
          _painSummaryData.humanBody.bodyPart[value] = [];
        }
        _painSummaryData.humanBody.bodyPart[value].push(key);
      } else if (part.svg_type === 'footExamine') {
        if (part.body_part.startsWith('Left')) {
          if (_.isUndefined(_painSummaryData.footExamine.left[value])) {
            _painSummaryData.footExamine.left[value] = [];
          }
          _painSummaryData.footExamine.left[value].push(key);
        } else if (part.body_part.startsWith('Right')) {
          if (_.isUndefined(_painSummaryData.footExamine.right[value])) {
            _painSummaryData.footExamine.right[value] = [];
          }
          _painSummaryData.footExamine.right[value].push(key);
        }
      }
    });
    return of(_painSummaryData);
  }

  // print related all functions
  getPrintPain(): Observable<any> {
    return of(this._printData);
  }

  setPrintPain(value) {
    this._printData = value;
  }

  getPrintPainAssociatedData(): Observable<any> {
    return of(this.painPrintAssociatedData);
  }

  setPrintPainAssociatedData(data) {
    this.painPrintAssociatedData = data;
  }

  getPrintPainChartData(): Observable<any> {
    let partDetails = this.ngCopy(this._printData);
    partDetails = _.uniq(partDetails, 'body_part');
    const _painChartData = this.ngCopy(this.painChartData);
    _.map(partDetails, (part, index) => {
      const key = part.body_part.substring(part.body_part.lastIndexOf('_') + 1);
      const value = part.pain_score;
      if (part.svg_type == 'myotome') {
        if (part.body_part.startsWith('Left_Upper')) {
          _painChartData.mytome.upper.left[key] = value;
        } else if (part.body_part.startsWith('Left_Lower')) {
          _painChartData.mytome.lower.left[key] = value;
        } else if (part.body_part.startsWith('Right_Upper')) {
          _painChartData.mytome.upper.right[key] = value;
        } else if (part.body_part.startsWith('Right_Lower')) {
          _painChartData.mytome.lower.right[key] = value;
        }
      } else if (part.svg_type === 'dermatome_pin') {
        if (part.body_part.startsWith('Left')) {
          _painChartData.dermatome.pinPrick.left[key] = value;
        } else if (part.body_part.startsWith('Right')) {
          _painChartData.dermatome.pinPrick.right[key] = value;
        }
      } else if (part.svg_type === 'dermatome_light') {
        if (part.body_part.startsWith('Left')) {
          _painChartData.dermatome.lightTouch.left[key] = value;
        } else if (part.body_part.startsWith('Right')) {
          _painChartData.dermatome.lightTouch.right[key] = value;
        }
      }
    });
    return of(_painChartData);
  }

  getPrintFilteredParts(): Observable<any> {
    const partDetails = this.ngCopy(this._printData);
    const humanBodyList = _.filter(partDetails, { svg_type: 'humanBody' });
    const copyOfHumanBOdyList = humanBodyList.map(r => Object.assign({}, r));
    if (humanBodyList.length > 0) {
      for (let i = 0; i < (humanBodyList.length); i++) {
        partDetails.splice(_.findIndex(partDetails, { 'body_part': humanBodyList[i].body_part, 'svg_name': humanBodyList[i].svg_name, 'svg_type': humanBodyList[i].svg_type }), 1);
      }
      _.map(copyOfHumanBOdyList, (value) => {
        value.body_part = value.body_part.replace(/[0-9]/g, '').replace(/_/g, ' ').trim();
        partDetails.push(value);
      });
    }
    const _painSummaryData = this.ngCopy(this.painPrintSummaryData);
    _.map(partDetails, (part, index) => {
      let key, value;
      if (part.svg_type === 'humanBody' || part.svg_type === 'footExamine') {
        if (part.svg_name === 'headzoomFlag' ||
          part.svg_name === 'FrontzoomFlag' || part.svg_name === 'BackzoomFlag' || part.svg_name === 'leftzoomFlag'
          || part.svg_name === 'rightzoomFlag') {
          key = part.body_part + '(' + 'd' + ')';
          value = part.pain_score;
        } else {
          key = part.body_part;
          value = part.pain_score;
        }
      } else {
        key = part.body_part.substring(part.body_part.lastIndexOf('_') + 1);
        value = part.pain_score;
      }
      if (part.svg_type === 'myotome') {
        const body_part = part.body_part.replace(' ', '_');
        if (body_part.startsWith('Left_Upper')) {
          if (_.isUndefined(_painSummaryData.mytome.upper.left[value])) {
            _painSummaryData.mytome.upper.left[value] = [];
          }
          _painSummaryData.mytome.upper.left[value].push(key);
        } else if (body_part.startsWith('Left_Lower')) {
          if (_.isUndefined(_painSummaryData.mytome.lower.left[value])) {
            _painSummaryData.mytome.lower.left[value] = [];
          }
          _painSummaryData.mytome.lower.left[value].push(key);
        } else if (body_part.startsWith('Right_Upper')) {
          if (_.isUndefined(_painSummaryData.mytome.upper.right[value])) {
            _painSummaryData.mytome.upper.right[value] = [];
          }
          _painSummaryData.mytome.upper.right[value].push(key);
        } else if (body_part.startsWith('Right_Lower')) {
          if (_.isUndefined(_painSummaryData.mytome.lower.right[value])) {
            _painSummaryData.mytome.lower.right[value] = [];
          }
          _painSummaryData.mytome.lower.right[value].push(key);
        }
      } else if (part.svg_type === 'dermatome_pin') {
        if (part.body_part.startsWith('Left')) {
          if (_.isUndefined(_painSummaryData.dermatome.pinPrick.left[value])) {
            _painSummaryData.dermatome.pinPrick.left[value] = [];
          }
          _painSummaryData.dermatome.pinPrick.left[value].push(key);
        } else if (part.body_part.startsWith('Right')) {
          if (_.isUndefined(_painSummaryData.dermatome.pinPrick.right[value])) {
            _painSummaryData.dermatome.pinPrick.right[value] = [];
          }
          _painSummaryData.dermatome.pinPrick.right[value].push(key);
        }
      } else if (part.svg_type === 'dermatome_light') {
        if (part.body_part.startsWith('Left')) {
          if (_.isUndefined(_painSummaryData.dermatome.lightTouch.left[value])) {
            _painSummaryData.dermatome.lightTouch.left[value] = [];
          }
          _painSummaryData.dermatome.lightTouch.left[value].push(key);
        } else if (part.body_part.startsWith('Right')) {
          if (_.isUndefined(_painSummaryData.dermatome.lightTouch.right[value])) {
            _painSummaryData.dermatome.lightTouch.right[value] = [];
          }
          _painSummaryData.dermatome.lightTouch.right[value].push(key);
        }
      } else if (part.svg_type === 'humanBody') {
        if (_.isUndefined(_painSummaryData.humanBody.bodyPart[value])) {
          _painSummaryData.humanBody.bodyPart[value] = [];
        }
        _painSummaryData.humanBody.bodyPart[value].push(key);
      } else if (part.svg_type === 'footExamine') {
        if (part.body_part.startsWith('Left')) {
          if (_.isUndefined(_painSummaryData.footExamine.left[value])) {
            _painSummaryData.footExamine.left[value] = [];
          }
          _painSummaryData.footExamine.left[value].push(key);
        } else if (part.body_part.startsWith('Right')) {
          if (_.isUndefined(_painSummaryData.footExamine.right[value])) {
            _painSummaryData.footExamine.right[value] = [];
          }
          _painSummaryData.footExamine.right[value].push(key);
        }
      }
    });
    return of(_painSummaryData);
  }

  getScore(dummyData, elementId, svgno?, myclass?, count?): any {
    let returnClass = '';
    let findRegion = _.find(dummyData, { body_part: elementId });
    if (svgno === 'dermatome_lateral_view' || svgno == 'myotome_lateral_view') {
      const severity = {
        dermatome_lateral_view: { '0': 3, '1': 2, '2': 1, 'NT': 0 },
        myotome_lateral_view: { '0': 6, '1': 5, '2': 4, '3': 3, '4': 2, '5': 1, 'NT': 0 }
      };
      const findRegionAll = _.filter(dummyData, (o) => {
        const checkKey = o.body_part.split('_');
        if (svgno === 'dermatome_lateral_view') {
          elementId = elementId === 'S4' ? 'S5' : elementId;
          return (o.svg_type === 'dermatome_light' || o.svg_type === 'dermatome_pin')
            && checkKey.length > 0
            && checkKey[checkKey.length - 1] === elementId;
        } else {
          return o.svg_type === 'myotome' && checkKey.length > 0
            && checkKey[checkKey.length - 1] === elementId;
        }
      });
      if (findRegionAll.length > 0) {
        let maxServityRegionIndex = 0, maxSeverity = 0;
        _.map(findRegionAll, (region, index) => {
          if (maxSeverity < severity[svgno][region.pain_score]) {
            maxSeverity = severity[svgno][region.pain_score];
            maxServityRegionIndex = index;
          }
        });
        findRegion = findRegionAll[maxServityRegionIndex];
      } else {
        findRegion = findRegionAll[0];
      }
    }

    if (!_.isUndefined(findRegion)) {
      returnClass = 'score' + findRegion.pain_score;
    } else if (myclass == '') {
      count = 0;
    }
    // return returnClass==""?"scoreBlank":returnClass;
    if (returnClass !== '') {
      return findRegion.svg_type === 'humanBody' && returnClass === 'score1' ? '#018000'
        : findRegion.svg_type === 'humanBody' && returnClass === 'score2' ? '#61b000'
          : findRegion.svg_type === 'humanBody' && returnClass === 'score3' ? '#c0e000'
            : findRegion.svg_type === 'humanBody' && returnClass === 'score4' ? '#fff500'
              : findRegion.svg_type === 'humanBody' && returnClass === 'score5' ? '#ffdb00'
                : findRegion.svg_type === 'humanBody' && returnClass === 'score6' ? '#ffc200'
                  : findRegion.svg_type === 'humanBody' && returnClass === 'score7' ? '#ffa900'
                    : findRegion.svg_type === 'humanBody' && returnClass === 'score8' ? '#ff7900'
                      : findRegion.svg_type === 'humanBody' && returnClass === 'score9' ? '#ff4200'
                        : findRegion.svg_type === 'humanBody' && returnClass === 'score10' ? '#ff0800'
                          : findRegion.svg_type === 'humanBody' && returnClass === 'score11' ? '#ff0800'

                            : findRegion.svg_type === 'footExamine' && returnClass === 'scoreAbsent' ? '#ED4E2C'
                              : findRegion.svg_type === 'footExamine' && returnClass === 'scoreReduced' ? '#F48828'
                                : findRegion.svg_type === 'footExamine' && returnClass === 'scoreNormal' ? '#54A939'

                                  : ((findRegion.svg_type === 'dermatome_light' || findRegion.svg_type === 'dermatome_pin') && returnClass === 'score0') ? '#ff7900'
                                    : ((findRegion.svg_type === 'dermatome_light' || findRegion.svg_type === 'dermatome_pin') && returnClass === 'score1') ? '#ffc200'
                                      : ((findRegion.svg_type === 'dermatome_light' || findRegion.svg_type === 'dermatome_pin') && returnClass === 'score2') ? '#018000'
                                        : ((findRegion.svg_type === 'dermatome_light' || findRegion.svg_type === 'dermatome_pin')
                                          && (returnClass === 'scoreNT' || returnClass === 'score3')) ? '#ba1515'
                                          : findRegion.svg_type === 'myotome' && returnClass === 'score0' ? '#ff0800'
                                            : findRegion.svg_type === 'myotome' && returnClass === 'score1' ? '#ff7900'
                                              : findRegion.svg_type === 'myotome' && returnClass === 'score2' ? '#ffc200'
                                                : findRegion.svg_type === 'myotome' && returnClass === 'score3' ? '#ffdb00'
                                                  : findRegion.svg_type === 'myotome' && returnClass === 'score4' ? '#fff500'
                                                    : findRegion.svg_type === 'myotome' && returnClass === 'score5' ? '#018000'
                                                      : findRegion.svg_type === 'myotome' && (returnClass === 'scoreNT' || returnClass === 'score6') ? '#ba1515' : 'rgb(181, 181, 181)';
    } else {
      return 'rgb(181, 181, 181)';
    }
  }

  getfootExaminescore(dummyData, elementId, svgno, myclass, count): Observable<any> {
    let returnClass = '';
    const findRegion = _.find(dummyData, { body_part: elementId });

    if (!_.isUndefined(findRegion)) {
      returnClass = 'score' + findRegion.pain_score;
    } else if (myclass === '') {
      count = 0;
    }
    if (returnClass !== '') {
      return of(findRegion.svg_type === 'footExamine' && returnClass === 'scoreAbsent' ? '#ED4E2C'
        : findRegion.svg_type === 'footExamine' && returnClass === 'scoreReduced' ? '#F48828'
          : findRegion.svg_type === 'footExamine' && returnClass === 'scoreNormal' ? '#54A939'
            : 'rgb(255,255,255)');
    } else {
      return of('rgb(255,255,255)');
    }
  }

}

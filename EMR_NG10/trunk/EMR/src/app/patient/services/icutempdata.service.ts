import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';
import { PublicService } from '../../../services/public.service';
import { ConsultationService } from '../../../services/consultation.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IcutempdataService {

  icuTempData = {
    patientId: null,
    bslValues: null,
    diabeticFormData: null,
    sofaScore: null,
    pupilSize: null,
    painScale: null,
    assessmentChart: [],
    vitalsSheetData: [],
  };

  vitalsList: Array<any> =
  [
    {
        'id': 1,
        'name': 'Temperature',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 35,
                'min': 0
            },
            'normal': {
                'color': 'green',
                'max': 99,
                'min': 97
            },
            'severe': {
                'color': 'red',
                'max': 110,
                'min': 98
            }
        },
        'rangetext': 'Hypothermia<35.0 °C (95.0 °F),Fever >37.5 or 38.3 °C (99.5 or 100.9 °F),Normal- 36.5-37.5 °C (97.7-99.5 °F),',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 2,
        'name': 'Rhythm',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 99,
                'min': 59
            },
            'severe': {
                'color': 'red',
                'max': 1000,
                'min': 99
            }
        },
        'rangetext': 'normal:newborn:99-149,infants: 89-119,children: 69–129, Adults: 59–99,adult athletes: 39–59,Severe:>99',
        'section': 'Vitals',
        'type': 'decimal'
    },
    {
        'id': 3,
        'name': 'BP',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': '90/140',
                'min': '120/80'
            },
            'normal': {
                'color': 'green',
                'max': '120/80',
                'min': '0'
            },
            'severe': {
                'color': 'red',
                'max': '140/90',
                'min': '140/90'
            }
        },
        'rangetext': 'normal: Less than 120 over 80, little high: Between 120 over 80 and 140 over 9,High: 140 over 90 or higher',
        'section': '',
        'type': 'string'
    },
    {
        'id': 4,
        'name': 'MEAN BP',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 99,
                'min': 60
            },
            'normal': {
                'color': 'green',
                'max': 10,
                'min': 70
            },
            'severe': {
                'color': 'red',
                'max': 1900,
                'min': 100
            }
        },
        'rangetext': 'normal: 70 - 10 mmHg, high: >100 mmHg, low: < 60 mmHg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 5,
        'name': 'MEAN CVP',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 2000,
                'min': 1000
            },
            'normal': {
                'color': 'green',
                'max': 5,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 12
            }
        },
        'rangetext': 'normal: 0 to 5 cm H2O, high > 12 cm H2O',
        'section': '',
        'type': 'number'
    },
    {
        'id': 6,
        'name': 'INOTROPES',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 6999,
                'min': 2000
            },
            'normal': {
                'color': 'green',
                'max': 20,
                'min': 2.5
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 40
            }
        },
        'rangetext': 'normal: 2.5 to 20 mcg/kg/minute,maximum: 40 mcg/kg/min',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 7,
        'name': 'INOTROPES(2)',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 8998,
                'min': 7009
            },
            'normal': {
                'color': 'green',
                'max': 20,
                'min': 2.5
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 40
            }
        },
        'rangetext': 'normal: 2.5 to 20 mcg/kg/minute,maximum: 40 mcg/kg/min',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 8,
        'name': 'INOTROPES(3)',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 9000,
                'min': 800
            },
            'normal': {
                'color': 'green',
                'max': 20,
                'min': 2.5
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 40
            }
        },
        'rangetext': 'normal: 2.5 to 20 mcg/kg/minute,maximum: 40 mcg/kg/min',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 9,
        'name': 'SEDATION',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 900,
                'min': 899
            },
            'normal': {
                'color': 'green',
                'max': 22,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 22
            }
        },
        'rangetext': 'normal:  0 to 22 mm/hr for men, 0 to 29 mm/hr for women',
        'section': '',
        'type': 'number'
    },
    {
        'id': 10,
        'name': 'Spontaneous Respiratory Rate',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 900,
                'min': 900
            },
            'normal': {
                'color': 'green',
                'max': 20,
                'min': 10
            },
            'severe': {
                'color': 'red',
                'max': 10,
                'min': 4
            }
        },
        'rangetext': 'slow :  4 to 10 breaths per min (0.07–0.16Hz),normal: 10–20 breaths per min (0.16–0.33Hz)',
        'section': '',
        'type': 'number'
    },
    {
        'id': 11,
        'name': 'SPATURATION/SpO2',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 999,
                'min': 999
            },
            'normal': {
                'color': 'green',
                'max': 99,
                'min': 96
            },
            'severe': {
                'color': 'red',
                'max': 96,
                'min': 0
            }
        },
        'rangetext': 'normal: 96% to 99%, Low: <90% ',
        'section': '',
        'type': 'number'
    },
    {
        'id': 12,
        'name': 'Ventilator/BIPAP MODE',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'Spontaneous,Timed,Spontaneous/Timed',
        'section': '',
        'type': 'string'
    },
    {
        'id': 13,
        'name': 'FIO2',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 900,
                'min': 900
            },
            'normal': {
                'color': 'green',
                'max': 20,
                'min': 5
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 21
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg,server: > 21',
        'section': '',
        'type': 'number'
    },
    {
        'id': 14,
        'name': 'IPAP',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 34,
                'min': 34
            },
            'normal': {
                'color': 'green',
                'max': 18,
                'min': 18
            },
            'severe': {
                'color': 'red',
                'max': 14,
                'min': 14
            }
        },
        'rangetext': 'normal : 18,modrate: 34,severe: 14',
        'section': '',
        'type': 'number'
    },
    {
        'id': 15,
        'name': 'EPAP',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 200,
                'min': 102
            },
            'normal': {
                'color': 'green',
                'max': 97,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 16,
        'name': 'SIMV BREATHS/MIN',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 12,
                'min': 12
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :12',
        'section': '',
        'type': 'number'
    },
    {
        'id': 17,
        'name': 'INSPIRATORY TIDAL VOLUME',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 500,
                'min': 500
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :500 ml',
        'section': '',
        'type': 'number'
    },
    {
        'id': 18,
        'name': 'EXPIRATORY TIDAL VOLUME',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 19,
        'name': 'SET RR',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 20,
        'name': 'EXPIRATORY MINUTE VOLUME',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 21,
        'name': 'IE RATIO',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': '1:1',
                'min': '1:1'
            },
            'normal': {
                'color': 'green',
                'max': '1:2',
                'min': '1:2'
            },
            'severe': {
                'color': 'red',
                'max': '2:1',
                'min': '2:1'
            }
        },
        'rangetext': 'normal: 1:2, Severe: 2:1',
        'section': '',
        'type': 'number'
    },
    {
        'id': 22,
        'name': 'PEEP/CPAP(PRESSURE)',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 23,
        'name': 'PRESSURE CONTROL/SUPPORT',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 24,
        'name': 'TRIGGER SENSITIVITY',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max':2,
                'min': 1
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 3
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 25,
        'name': 'PEAK AIRWAY PRESSURE',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 25,
                'min': 20
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 26
            }
        },
        'rangetext': 'normal: 20-25,sever: >25',
        'section': '',
        'type': 'number'
    },
    {
        'id': 26,
        'name': 'PLATEAU PRESSURE',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 788,
                'min': 900
            },
            'normal': {
                'color': 'green',
                'max': 35,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 400,
                'min': 38
            }
        },
        'rangetext': 'normal: 0 -35 cm,sever: >35',
        'section': '',
        'type': 'number'
    },
    {
        'id': 27,
        'name': 'PH',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 7,
                'min': 0
            },
            'normal': {
                'color': 'green',
                'max': 7,
                'min': 7
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 7
            }
        },
        'rangetext': 'acidic:<7,neutral: 7, basic:>7',
        'section': 'Arterial Blood Gases',
        'type': 'decimal'
    },
    {
        'id': 28,
        'name': 'ETCO2/PACO2',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal:35-45 mm Hg,hypercapnia:> 45 mm Hg,hypocapnia: 35 mm Hg',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 29,
        'name': 'PAO2',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 80,
                'min': 40
            },
            'normal': {
                'color': 'green',
                'max': 100,
                'min': 80
            },
            'severe': {
                'color': 'red',
                'max': 80,
                'min': 60
            }
        },
        'rangetext': 'normal: 80-100mm Hg,mild hypoxemia 60-80mm, moderate hypozemia 40-60mm ',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 30,
        'name': 'HCO2',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 290,
                'min': 290
            },
            'normal': {
                'color': 'green',
                'max': 28,
                'min': 22
            },
            'severe': {
                'color': 'red',
                'max': 200,
                'min': 29
            }
        },
        'rangetext': 'normal :22 - 28 mEq/L, severe: >29',
        'section': 's',
        'type': 'decimal'
    },
    {
        'id': 31,
        'name': 'PA02/FIO2',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 200,
                'min': 100
            },
            'normal': {
                'color': 'green',
                'max': 300,
                'min': 200
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 0
            }
        },
        'rangetext': 'normal :200 - 300 mm Hg,modrate: 100-200,severe<100',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 32,
        'name': 'BAGGING/SUCTION/PHYSO',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'number'
    },
    {
        'id': 33,
        'name': 'Patient Position',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'Supine,Prone,right Lateral recumbent,Fowler\'s,Trendelenberg',
        'section': '',
        'type': 'string'
    },
    {
        'id': 34,
        'name': 'Subglottic Suction',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'SETT, SACETT',
        'section': '',
        'type': 'string'
    },
    {
        'id': 35,
        'name': 'EYE response',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'Smooth,Vestibulo-ocular',
        'section': 'FOUR SCORE',
        'type': 'string'
    },
    {
        'id': 36,
        'name': 'Brain Stem REFLEXES',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'Pupil,Ocular Moment,Facial Senation,Pharyngeal',
        'section': '',
        'type': 'string'
    },
    {
        'id': 37,
        'name': 'MOTOR RESPONSE',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'Score 6,Score 5,Score 4,Score 3,Score 2,Score 2,Score 1',
        'section': '',
        'type': 'string'
    },
    {
        'id': 38,
        'name': 'RESPIRATION',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 500,
                'min': 500
            },
            'normal': {
                'color': 'green',
                'max': 20,
                'min': 12
            },
            'severe': {
                'color': 'red',
                'max': 400,
                'min': 21
            }
        },
        'rangetext': 'Normal :12 - 20 bpm,Severe> 20bpm',
        'section': '',
        'type': 'number'
    },
    {
        'id': 39,
        'name': 'TOTAL SCORE',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': '',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 40,
        'name': 'EYE RESPONSE(E)',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'Score 4,Score 3,Score 2,Score 1,Record ‘C’',
        'section': 'GCS',
        'type': 'string'
    },
    {
        'id': 41,
        'name': 'VOCAL RESPONSE(V)',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'Score 5,Score 4,Score 3,Score 2,Score 1,Record D',
        'section': '',
        'type': 'string'
    },
    {
        'id': 42,
        'name': 'TOTAL SCORE',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': '',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 43,
        'name': 'MOTOR RESPONSE(M)',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'Score 6,Score 5,Score 4,Score 3,Score 2,Score 2,Score 1',
        'section': '',
        'type': 'string'
    },
    {
        'id': 44,
        'name': 'Right Size',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 300,
                'min': 300
            },
            'normal': {
                'color': 'green',
                'max': 4,
                'min': 2
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': '2 to 4mm',
        'section': 'PUPILS',
        'type': 'number'
    },
    {
        'id': 45,
        'name': 'Right Reaction',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': '',
        'section': '',
        'type': 'string'
    },
    {
        'id': 46,
        'name': 'Left Size',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 400,
                'min': 400
            },
            'normal': {
                'color': 'green',
                'max': 4,
                'min': 2
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 4.1
            }
        },
        'rangetext': 'normal: 2.0 to 4.0 millimeters (mm) ',
        'section': '',
        'type': 'decimal'
    },
    {
        'id': 47,
        'name': 'Left Reaction',
        'range': {
            'modrate': {
                'color': '#FFA500',
                'max': 38,
                'min': 37
            },
            'normal': {
                'color': 'green',
                'max': 37,
                'min': 0
            },
            'severe': {
                'color': 'red',
                'max': 100,
                'min': 38
            }
        },
        'rangetext': 'normal :5 - 20 mm Hg',
        'section': '',
        'type': 'string'
    }
];
  dummyVitalData = {
    '07.00': {
      'Temperature': '102',
      'Rhythm': '90',
      'BP': '130/80',
      'MEAN BP': '109',
      'MEAN CVP': '15',
      'INOTROPES': '23',
      'INOTROPES(2)': '23',
      'INOTROPES(3)': '40',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '12',
      'SPATURATION/SpO2': '84',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '18',
      'EPAP': '21',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '19',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:3',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '39',
      'PH': '8',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Prone',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'Smooth',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 3',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '08.00': {
      'Temperature': '102',
      'Rhythm': '90',
      'BP': '130/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '18',
      'INOTROPES(2)': '18',
      'INOTROPES(3)': '18',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '90',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '12',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '80',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 3',
      'VOCAL RESPONSE(V)': 'Score 2',
      'MOTOR RESPONSE(M)': 'Score 5',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '09.00': {
      'Temperature': '102',
      'Rhythm': '90',
      'BP': '120/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '18',
      'INOTROPES(2)': '18',
      'INOTROPES(3)': '18',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '23',
      'SPATURATION/SpO2': '91',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME':'500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '13',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '40',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 6',
      'RESPIRATION': '29',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '10.00': {
      'Temperature': '101',
      'Rhythm': '92',
      'BP': '120/80',
      'MEAN BP': '75',
      'MEAN CVP': '9',
      'INOTROPES': '23',
      'INOTROPES(2)': '23',
      'INOTROPES(3)': '18',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '12',
      'SPATURATION/SpO2': '90',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '80',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 6',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '11.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '54',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '29',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'smooth',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '12.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '64',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '90',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'smooth',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '13.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '19',
      'INOTROPES(2)': '21',
      'INOTROPES(3)': '8.9',
      'SEDATION': '22',
      'Spontaneous Respiratory Rate': '19',
      'SPATURATION/SpO2': '80',
      'Ventilator/BIPAP MODE': 'Spontaneous/Timed',
      'FIO2': '11',
      'IPAP': '31',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'smooth',
      'Brain Stem REFLEXES': 'Moment',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '14.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '12.5',
      'INOTROPES(2)': '18.5',
      'INOTROPES(3)': '9.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '80',
      'Ventilator/BIPAP MODE': 'Timed',
      'FIO2': '200',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'Smooth',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '15.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '94',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'smooth',
      'Brain Stem REFLEXES': 'Moment',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '16.00': {
      'Temperature': '103',
      'Rhythm': '89',
      'BP': '120/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '18',
      'INOTROPES(2)': '18',
      'INOTROPES(3)': '18',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '84',
      'Ventilator/BIPAP MODE': 'Spontaneous/Timed',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '550',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '13',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 6',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '17.00': {
      'Temperature': '102',
      'Rhythm': '90',
      'BP': '140/90',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '18',
      'INOTROPES(2)': '18',
      'INOTROPES(3)': '18',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '94',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '12',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Moment',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 3',
      'VOCAL RESPONSE(V)': 'Score 2',
      'MOTOR RESPONSE(M)': 'Score 5',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '18.00': {
      'Temperature': '102',
      'Rhythm': '90',
      'BP': '130/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '18',
      'INOTROPES(2)': '18',
      'INOTROPES(3)': '18',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '94',
      'Ventilator/BIPAP MODE': 'Spontaneous/Timed',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '13',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 6',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '19.00': {
      'Temperature': '101',
      'Rhythm': '92',
      'BP': '120/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '18',
      'INOTROPES(2)': '18',
      'INOTROPES(3)': '18',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '99',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 6',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '20.00': {
      'Temperature': '100',
      'Rhythm': '89',
      'BP': '120/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '19',
      'INOTROPES(2)': '18',
      'INOTROPES(3)': '19',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '20',
      'SPATURATION/SpO2': '92',
      'Ventilator/BIPAP MODE': 'Timed',
      'FIO2': '10',
      'IPAP': '18',
      'EPAP': '21',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '530',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '19',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:3',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '39',
      'PH': '8',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Moment',
      'MOTOR RESPONSE': 'Score 6',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 3',
      'VOCAL RESPONSE(V)': 'Score 2',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '21.00': {
      'Temperature': '100',
      'Rhythm': '89',
      'BP': '120/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '19',
      'INOTROPES(2)': '18',
      'INOTROPES(3)': '19',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '20',
      'SPATURATION/SpO2': '90',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '18',
      'EPAP': '21',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '530',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '19',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:3',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '39',
      'PH': '8',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SETT',
      'EYE response': 'Vestibulo-ocular',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 6',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 3',
      'VOCAL RESPONSE(V)': 'Score 2',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '22.00': {
      'Temperature': '102',
      'Rhythm': '90',
      'BP': '120/80',
      'MEAN BP': '109',
      'MEAN CVP': '15',
      'INOTROPES': '6.5',
      'INOTROPES(2)': '39',
      'INOTROPES(3)': '40',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '20',
      'SPATURATION/SpO2': '91',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '18',
      'EPAP': '21',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '19',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:3',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '39',
      'PH': '8',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Prone',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'Smooth',
      'Brain Stem REFLEXES': 'Moment',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 2',
      'MOTOR RESPONSE(M)': 'Score 4',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '23.00': {
      'Temperature': '99',
      'Rhythm': '90',
      'BP': '120/80',
      'MEAN BP': '109',
      'MEAN CVP': '15',
      'INOTROPES': '5.5',
      'INOTROPES(2)': '5.5',
      'INOTROPES(3)': '40',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '20',
      'SPATURATION/SpO2': '94',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '18',
      'EPAP': '21',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '520',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '19',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:3',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '39',
      'PH': '8',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Prone',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'Smooth',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 4',
      'MOTOR RESPONSE(M)': 'Score 1',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '24.00': {
      'Temperature': '102',
      'Rhythm': '90',
      'BP': '130/80',
      'MEAN BP': '109',
      'MEAN CVP': '15',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '40',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '20',
      'SPATURATION/SpO2': '94',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '18',
      'EPAP': '21',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '19',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:3',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '39',
      'PH': '8',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Prone',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'Smooth',
      'Brain Stem REFLEXES': 'Moment',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '21',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 3',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '01.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '93',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'smooth',
      'Brain Stem REFLEXES': 'Ocular',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2'
    },
    '02.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '99',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'smooth',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '03.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '90',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'smooth',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '04.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '94',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'smooth',
      'Brain Stem REFLEXES': 'Ocular',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '12',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '05.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '15',
      'SPATURATION/SpO2': '89',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '26',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '60',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'Smooth',
      'Brain Stem REFLEXES': 'Pupil',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '13',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    },
    '06.00': {
      'Temperature': '99',
      'Rhythm': '89',
      'BP': '110/80',
      'MEAN BP': '75',
      'MEAN CVP': '4',
      'INOTROPES': '2.5',
      'INOTROPES(2)': '2.5',
      'INOTROPES(3)': '8.9',
      'SEDATION': '10',
      'Spontaneous Respiratory Rate': '20',
      'SPATURATION/SpO2': '94',
      'Ventilator/BIPAP MODE': 'Spontaneous',
      'FIO2': '10',
      'IPAP': '34',
      'EPAP': '6',
      'SIMV BREATHS/MIN': '12',
      'INSPIRATORY TIDAL VOLUME': '500',
      'EXPIRATORY TIDAL VOLUME': '6000',
      'SET RR': '14',
      'EXPIRATORY MINUTE VOLUME': '',
      'IE RATIO': '1:2',
      'PEEP/CPAP(PRESSURE)': '',
      'PRESSURE CONTROL/SUPPORT': '',
      'TRIGGER SENSITIVITY': '2',
      'PEAK AIRWAY PRESSURE': '89',
      'PLATEAU PRESSURE': '34',
      'PH': '7',
      'ETCO2/PACO2': '45',
      'PAO2': '90',
      'HCO2': '22',
      'PA02/FIO2': '210',
      'BAGGING/SUCTION/PHYSO': '',
      'Patient Position': 'Supine',
      'Subglottic Suction': 'SACETT',
      'EYE response': 'Smooth',
      'Brain Stem REFLEXES': 'Ocular',
      'MOTOR RESPONSE': 'Score 5',
      'RESPIRATION': '29',
      'TOTAL SCORE': '',
      'EYE RESPONSE(E)': 'Score 4',
      'VOCAL RESPONSE(V)': 'Score 3',
      'MOTOR RESPONSE(M)': 'Score 6',
      'Right Size': '2',
      'Right Reaction': '',
      'Left Size': '2',
      'Left Reaction': ''
    }
  };
  investigationList = [
    {
      'id': '1',
      'name': 'HB',
      'label': 'HB',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '417',
      'name': 'WBC',
      'label': 'WBC',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '418',
      'name': 'Platelets',
      'label': 'Platelets',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '217',
      'name': 'UREA',
      'label': 'UREA',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '28',
      'name': 'Creatinine',
      'label': 'Creatinine',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '21',
      'name': 'Electrolytes',
      'label': 'Electrolytes',
      'headId': 1,
      'comment': ''
    },
    {
      'id': '430',
      'name': 'LFTS',
      'label': 'LFTS',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '4',
      'name': 'PT/INR',
      'label': 'PT/INR',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '431',
      'name': 'ABG',
      'label': 'ABG',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '432',
      'name': 'SPUTUM/ETT:R/C/S',
      'label': 'SPUTUM/ETT:R/C/S',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '433',
      'name': 'Urine (R/C/S)',
      'label': 'Urine (R/C/S)',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '434',
      'name': 'Blood(C/S)',
      'label': 'Blood(cCS)',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '73',
      'name': 'X-RAY CHEST',
      'label': 'X-RAY CHEST',
      'headId': 4,
      'comment': ''
    },
    {
      'id': '61',
      'name': 'ECG',
      'label': 'ECG',
      'headId': 4,
      'comment': ''
    }
  ];

  insulinTypeList = [
    {
      'id': '1',
      'name': 'Rapid Acting',
      'key': 'rapid_acting'
    },
    {
      'id': '2',
      'name': 'Long Acting',
      'key': 'long_acting'
    },
    {
      'id': '3',
      'name': 'Regular (short-acting)',
      'key': 'short_acting'
    },
    {
      'id': '4',
      'name': 'Intermediate Acting',
      'key': 'intermediate_acting'
    },
    {
      'id': '5',
      'name': 'Combinations/pre-mixed',
      'key': 'combinations'
    },
    {
      'id': '6',
      'name': 'Inhaled insulin',
      'key': 'inhaled_insulin'
    }
  ];

  assessmentTypeList = [
    {
      "id": "1",
      "name": "Eye Care",
      "key": "Eye_Care",
      "type": "bool"
    },
    {
      "id": "2",
      "name": "Mouth Care",
      "key": "Mouth_Care",
      "type": "bool"
    },
    {
      "id": "3",
      "name": "Trachy/ET Care",
      "key": "sTrachy/ET_Care",
      "type": "bool"
    },
    {
      "id": "4",
      "name": "Catheter Care",
      "key": "Catheter_Care",
      "type": "bool"
    },
    {
      "id": "5",
      "name": "Chest PT",
      "key": "Chest_PT",
      "type": "bool"
    },
    {
      "id": "6",
      "name": "Limb PT",
      "key": "Limb_PT",
      "type": "bool"
    },
    {
      "id": "7",
      "name": "Back Care",
      "key": "Back_Care",
      "type": "bool"
    },
    {
      "id": "8",
      "name": "Skin Integrity",
      "key": "Skin_Integrity",
      "type": "text"
    },
    {
      "id": "9",
      "name": "Pressure Score",
      "key": "Pressure_Score",
      "type": "text"
    },
    {
      "id": "10",
      "name": "Site",
      "key": "Site",
      "type": "text"
    },
    {
      "id": "11",
      "name": "Action Taken",
      "key": "Action_taken",
      "type": "text"
    },
    {
      "id": "12",
      "name": "Bowel Habits Last Moved Dr",
      "key": "Bowel_Habits_Last_Moved_Dr",
      "type": "text"
    },
    {
      "id": "13",
      "name": "Action Taken",
      "key": "Action_taken",
      "type": "text"
    },
    {
      "id": "14",
      "name": "Sponge Bath",
      "key": "Sponge_Bath",
      "type": "bool"
    },
    {
      "id": "15",
      "name": "Haire Care",
      "key": "Haire_Care",
      "type": "bool"
    }
  ];

  patientConsultationHistoryData = [
    {
      "allergies": {
        "isAllergySelected": "YES",
        "allergiesListFrm": [
          {
            "type": "1",
            "medicineObject": {},
            "remark": "banana",
            "name": "Food Allergy",
            "medicine": null
          }
        ]
      },
      "patient_diagnosis": [
        {
          "name": "A03: Shigellosis",
          "remarks": null,
          "id": "A03",
          "isPrimary": 1,
          "description": null,
          "icdCode": null,
          "nameOld": "A03: Shigellosis",
          "diagnosisObj": {
            "id": "A03",
            "name": "A03: Shigellosis",
            "is_favourite": "1",
            "is_icd": "1",
            "use_count": "1",
            "description": "Shigellosis"
          }
        }
      ],
      "complaints": [
        {
          "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
          "days": "",
          "month": "2",
          "year": null,
          "id": "290560",
          "compObj": {
            "id": "290560",
            "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
            "is_favourite": "0",
            "use_count": "0",
            "doc_id": "3118"
          }
        }
      ],
      "radioInvestigationInputs": [
        {
          "id": "558",
          "name": "MRI - Forearm",
          "comment": null,
          "date": null,
          "headId": null
        }
      ],
      "investigation": [
        {
          "id": "7",
          "name": "Prothrombin Time(PT)",
          "comment": "",
          "date": "2019-09-05T18:30:00.000Z",
          "headId": "7"
        }
      ],
      "patPrescriptions": [
        {
          "typeId": "2",
          "typeName": "TABLET",
          "typeShortName": "TAB",
          "medicineName": "TAB MORPHINE SULPHATE 20",
          "genricName": null,
          "medicineId": "957952",
          "medicineNameObj": {
            "typeId": "2",
            "name": "TAB MORPHINE SULPHATE 20",
            "genricName": null,
            "id": "957952",
            "is_favourite": 1,
            "type": {
              "id": "2",
              "shortName": "TAB",
              "name": "TABLET",
              "doseUnit": "tablets",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T13:53:17.198Z"
          ],
          "taperedToDate": [
            "2019-10-04T13:53:17.198Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        },
        {
          "typeId": "2",
          "typeName": "TABLET",
          "typeShortName": "TAB",
          "medicineName": "TAB MEDROL 10",
          "genricName": null,
          "medicineId": "957954",
          "medicineNameObj": {
            "typeId": "2",
            "name": "TAB MEDROL 10",
            "genricName": null,
            "id": "957954",
            "is_favourite": 1,
            "type": {
              "id": "2",
              "shortName": "TAB",
              "name": "TABLET",
              "doseUnit": "tablets",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T13:53:17.856Z"
          ],
          "taperedToDate": [
            "2019-10-04T13:53:17.856Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        }
      ],
      "pain_relief": [],
      "pain_scale": [],
      "pain_score": {
        "pain_body_part": [
          {
            "body_part": "Right_Anterior_cervical_05",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_04",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_07",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_08",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_09",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_12",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Lumbar_Spine_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Thoracic_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_07",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          }
        ],
        "pain_associated_data": {
          "comment": "",
          "vacResult": false,
          "dapResult": false,
          "aisValue": "",
          "completeModel": "",
          "partialSensoryRight": "",
          "partialSensoryLeft": "",
          "partialMototRight": "",
          "partialMototLeft": "",
          "neurlogicalInjury": "",
          "motorLeft": "",
          "motorRight": "",
          "sensoryRight": "",
          "sensoryLeft": ""
        }
      },
      "examinations": {
        "BpMax": "23",
        "BpMin": "120",
        "Weight": "60",
        "height": "164",
        "Opd2": "120",
        "Opd4": "6.3",
        "BMI": "18"
      },
      "examinationLabelLocalFormData": [],
      "opd_tags": []
    },
    {
      "allergies": {
        "isAllergySelected": "YES",
        "allergiesListFrm": [
          {
            "type": "1",
            "medicineObject": {},
            "remark": "banana",
            "name": "Food Allergy",
            "medicine": null
          }
        ]
      },
      "patient_diagnosis": [
        {
          "name": "A03: Shigellosis",
          "remarks": null,
          "id": "A03",
          "isPrimary": 1,
          "description": null,
          "icdCode": null,
          "nameOld": "A03: Shigellosis",
          "diagnosisObj": {
            "id": "A03",
            "name": "A03: Shigellosis",
            "is_favourite": "1",
            "is_icd": "1",
            "use_count": "1",
            "description": "Shigellosis"
          }
        }
      ],
      "complaints": [
        {
          "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
          "days": "",
          "month": "2",
          "year": null,
          "id": "290560",
          "compObj": {
            "id": "290560",
            "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
            "is_favourite": "0",
            "use_count": "0",
            "doc_id": "3118"
          }
        }
      ],
      "radioInvestigationInputs": [
        {
          "id": "558",
          "name": "MRI - Forearm",
          "comment": null,
          "date": null,
          "headId": null
        },
        {
          "id": "560",
          "name": "X-Ray - Chest",
          "headId": null,
          "comment": null,
          "date": null
        }
      ],
      "investigation": [
        {
          "id": "7",
          "name": "Prothrombin Time(PT)",
          "comment": "",
          "date": "2019-09-05T18:30:00.000Z",
          "headId": "7"
        },
        {
          "id": "43",
          "name": "Australia Antigen (Hbsag)",
          "headId": null,
          "comment": null,
          "date": null
        },
        {
          "id": "51",
          "name": "Vit D3",
          "headId": null,
          "comment": null,
          "date": null
        }
      ],
      "patPrescriptions": [
        {
          "typeId": "2",
          "typeName": "TABLET",
          "typeShortName": "TAB",
          "medicineName": "TAB MEDROL 10",
          "genricName": null,
          "medicineId": "957954",
          "medicineNameObj": {
            "typeId": "2",
            "name": "TAB MEDROL 10",
            "genricName": null,
            "id": "957954",
            "is_favourite": 1,
            "type": {
              "id": "2",
              "shortName": "TAB",
              "name": "TABLET",
              "doseUnit": "tablets",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T13:53:17.856Z"
          ],
          "taperedToDate": [
            "2019-10-04T13:53:17.856Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        },
        {
          "typeId": "23",
          "typeName": "GEL",
          "typeShortName": "GEL",
          "medicineName": "VOLITRA GEL",
          "genricName": null,
          "medicineId": "957944",
          "medicineNameObj": {
            "typeId": "23",
            "name": "VOLITRA GEL",
            "genricName": null,
            "id": "957944",
            "is_favourite": 1,
            "type": {
              "id": "23",
              "shortName": "GEL",
              "name": "GEL",
              "doseUnit": "gm",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T13:57:09.708Z"
          ],
          "taperedToDate": [
            "2019-10-04T13:57:09.708Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        }
      ],
      "pain_relief": [],
      "pain_scale": [],
      "pain_score": {
        "pain_body_part": [
          {
            "body_part": "Right_Anterior_cervical_05",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_04",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_07",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_08",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_09",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_12",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Lumbar_Spine_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Thoracic_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_07",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          }
        ],
        "pain_associated_data": {
          "comment": "",
          "vacResult": false,
          "dapResult": false,
          "aisValue": "",
          "completeModel": "",
          "partialSensoryRight": "",
          "partialSensoryLeft": "",
          "partialMototRight": "",
          "partialMototLeft": "",
          "neurlogicalInjury": "",
          "motorLeft": "",
          "motorRight": "",
          "sensoryRight": "",
          "sensoryLeft": ""
        }
      },
      "examinations": {
        "BpMax": "123",
        "BpMin": "120",
        "Weight": "57",
        "height": "164",
        "Opd2": "120",
        "Opd4": "6.3",
        "BMI": "18"
      },
      "examinationLabelLocalFormData": [],
      "opd_tags": []
    },
    {
      "allergies": {
        "isAllergySelected": "YES",
        "allergiesListFrm": [
          {
            "type": "1",
            "medicineObject": {},
            "remark": "banana",
            "name": "Food Allergy",
            "medicine": null
          }
        ]
      },
      "patient_diagnosis": [
        {
          "name": "A03: Shigellosis",
          "remarks": null,
          "id": "A03",
          "isPrimary": 1,
          "description": null,
          "icdCode": null,
          "nameOld": "A03: Shigellosis",
          "diagnosisObj": {
            "id": "A03",
            "name": "A03: Shigellosis",
            "is_favourite": "1",
            "is_icd": "1",
            "use_count": "1",
            "description": "Shigellosis"
          }
        }
      ],
      "complaints": [
        {
          "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
          "days": "",
          "month": "2",
          "year": null,
          "id": "290560",
          "compObj": {
            "id": "290560",
            "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
            "is_favourite": "0",
            "use_count": "0",
            "doc_id": "3118"
          }
        },
        {
          "days": null,
          "month": null,
          "name": "NECK PAIN WITH ROM RESTRICTED",
          "id": "291072",
          "year": null,
          "compObj": null
        }
      ],
      "radioInvestigationInputs": [
        {
          "id": "560",
          "name": "X-Ray - Chest",
          "comment": null,
          "date": null,
          "headId": null
        }
      ],
      "investigation": [
        {
          "id": "51",
          "name": "Vit D3",
          "comment": null,
          "date": null,
          "headId": null
        }
      ],
      "patPrescriptions": [
        {
          "typeId": "2",
          "typeName": "TABLET",
          "typeShortName": "TAB",
          "medicineName": "TAB MEDROL 10",
          "genricName": null,
          "medicineId": "957954",
          "medicineNameObj": {
            "typeId": "2",
            "name": "TAB MEDROL 10",
            "genricName": null,
            "id": "957954",
            "is_favourite": 1,
            "type": {
              "id": "2",
              "shortName": "TAB",
              "name": "TABLET",
              "doseUnit": "tablets",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T13:53:17.856Z"
          ],
          "taperedToDate": [
            "2019-10-04T13:53:17.856Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        },
        {
          "typeId": "23",
          "typeName": "GEL",
          "typeShortName": "GEL",
          "medicineName": "VOLITRA GEL",
          "genricName": null,
          "medicineId": "957944",
          "medicineNameObj": {
            "typeId": "23",
            "name": "VOLITRA GEL",
            "genricName": null,
            "id": "957944",
            "is_favourite": 1,
            "type": {
              "id": "23",
              "shortName": "GEL",
              "name": "GEL",
              "doseUnit": "gm",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T13:57:09.708Z"
          ],
          "taperedToDate": [
            "2019-10-04T13:57:09.708Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        }
      ],
      "pain_relief": [],
      "pain_scale": [],
      "pain_score": {
        "pain_body_part": [
          {
            "body_part": "Right_Anterior_cervical_05",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_04",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_07",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_08",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_09",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_12",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Lumbar_Spine_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Thoracic_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_07",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Hypogastric_17",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Upperarrm_07",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_11",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Upperarrm_06",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Elbow_03",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_10",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_12",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Mental_08",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_infraorbital_02",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Buccal_08",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          }
        ],
        "pain_associated_data": {
          "comment": "",
          "vacResult": false,
          "dapResult": false,
          "aisValue": "",
          "completeModel": "",
          "partialSensoryRight": "",
          "partialSensoryLeft": "",
          "partialMototRight": "",
          "partialMototLeft": "",
          "neurlogicalInjury": "",
          "motorLeft": "",
          "motorRight": "",
          "sensoryRight": "",
          "sensoryLeft": ""
        }
      },
      "examinations": {
        "BpMax": "123",
        "BpMin": "120",
        "Weight": "57",
        "height": "164",
        "Opd2": "120",
        "Opd4": "6.3",
        "BMI": "18"
      },
      "examinationLabelLocalFormData": [],
      "opd_tags": []
    },
    {
      "allergies": {
        "isAllergySelected": "YES",
        "allergiesListFrm": [
          {
            "type": "1",
            "medicineObject": {},
            "remark": "banana",
            "name": "Food Allergy",
            "medicine": null
          }
        ]
      },
      "patient_diagnosis": [
        {
          "name": "A03: Shigellosis",
          "remarks": null,
          "id": "A03",
          "isPrimary": 1,
          "description": null,
          "icdCode": null,
          "nameOld": "A03: Shigellosis",
          "diagnosisObj": {}
        },
        {
          "name": "A04: Other bacterial intestinal infections",
          "remarks": null,
          "id": "A04",
          "isPrimary": "0",
          "description": null,
          "icdCode": null,
          "nameOld": "A04: Other bacterial intestinal infections",
          "diagnosisObj": {}
        }
      ],
      "complaints": [
        {
          "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
          "days": "",
          "month": "2",
          "year": null,
          "id": "290560",
          "compObj": {
            "id": "290560",
            "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
            "is_favourite": "0",
            "use_count": "0",
            "doc_id": "3118"
          }
        },
        {
          "days": null,
          "month": null,
          "name": "NECK PAIN WITH ROM RESTRICTED",
          "id": "291072",
          "year": "1",
          "compObj": null
        }
      ],
      "radioInvestigationInputs": [
        {
          "id": "560",
          "name": "X-Ray - Chest",
          "comment": null,
          "date": null,
          "headId": null
        }
      ],
      "investigation": [
        {
          "id": "51",
          "name": "Vit D3",
          "comment": null,
          "date": null,
          "headId": null
        }
      ],
      "patPrescriptions": [
        {
          "typeId": "23",
          "typeName": "GEL",
          "typeShortName": "GEL",
          "medicineName": "VOLITRA GEL",
          "genricName": null,
          "medicineId": "957944",
          "medicineNameObj": {
            "typeId": "23",
            "name": "VOLITRA GEL",
            "genricName": null,
            "id": "957944",
            "is_favourite": 1,
            "type": {
              "id": "23",
              "shortName": "GEL",
              "name": "GEL",
              "doseUnit": "gm",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T14:01:23.256Z"
          ],
          "taperedToDate": [
            "2019-10-04T14:01:23.256Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        },
        {
          "typeId": "2",
          "typeName": "TABLET",
          "typeShortName": "TAB",
          "medicineName": "TAB MORPHINE SULPHATE 20",
          "genricName": null,
          "medicineId": "957952",
          "medicineNameObj": {
            "typeId": "2",
            "name": "TAB MORPHINE SULPHATE 20",
            "genricName": null,
            "id": "957952",
            "is_favourite": 1,
            "type": {
              "id": "2",
              "shortName": "TAB",
              "name": "TABLET",
              "doseUnit": "tablets",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T14:01:23.359Z"
          ],
          "taperedToDate": [
            "2019-10-04T14:01:23.359Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        }
      ],
      "pain_relief": [],
      "pain_scale": [],
      "pain_score": {
        "pain_body_part": [
          {
            "body_part": "Right_Anterior_cervical_05",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_04",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_07",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_08",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_09",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_12",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Lumbar_Spine_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Thoracic_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_07",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Hypogastric_17",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Upperarrm_07",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_11",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Upperarrm_06",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Elbow_03",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_10",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_12",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Mental_08",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_infraorbital_02",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Buccal_08",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          }
        ],
        "pain_associated_data": {
          "comment": "",
          "vacResult": false,
          "dapResult": false,
          "aisValue": "",
          "completeModel": "",
          "partialSensoryRight": "",
          "partialSensoryLeft": "",
          "partialMototRight": "",
          "partialMototLeft": "",
          "neurlogicalInjury": "",
          "motorLeft": "",
          "motorRight": "",
          "sensoryRight": "",
          "sensoryLeft": ""
        }
      },
      "examinations": {
        "BpMax": "123",
        "BpMin": "120",
        "Weight": "57",
        "height": "164",
        "Opd2": "120",
        "Opd4": "6.3",
        "BMI": "18",
        "PDWeight": null,
        "RBPMax": null
      },
      "examinationLabelLocalFormData": [],
      "opd_tags": []
    },
    {
      "allergies": {
        "isAllergySelected": "YES",
        "allergiesListFrm": [
          {
            "remark": "banana",
            "name": "Food Allergy",
            "type": "1",
            "medicine": null,
            "medicineObject": {}
          },
          {
            "remark": null,
            "name": "Medicine allergy",
            "type": "2",
            "medicine": "957952",
            "medicineObject": {
              "id": "957952",
              "name": "TAB MORPHINE SULPHATE 20"
            }
          }
        ]
      },
      "patient_diagnosis": [
        {
          "name": "A03: Shigellosis",
          "remarks": null,
          "id": "A03",
          "isPrimary": 1,
          "description": null,
          "icdCode": null,
          "nameOld": "A03: Shigellosis",
          "diagnosisObj": {}
        },
        {
          "name": "A04: Other bacterial intestinal infections",
          "remarks": null,
          "id": "A04",
          "isPrimary": "0",
          "description": null,
          "icdCode": null,
          "nameOld": "A04: Other bacterial intestinal infections",
          "diagnosisObj": {}
        }
      ],
      "complaints": [
        {
          "days": "",
          "month": "2",
          "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
          "id": "290560",
          "year": null,
          "compObj": {
            "id": "290560",
            "name": "LEFT ELBOW AND LEFT GREAT TOE PAIN",
            "is_favourite": "0",
            "use_count": "0",
            "doc_id": "3118"
          }
        },
        {
          "days": null,
          "month": null,
          "name": "NECK PAIN WITH ROM RESTRICTED",
          "id": "291072",
          "year": "1",
          "compObj": null
        }
      ],
      "radioInvestigationInputs": [
        {
          "id": "560",
          "name": "X-Ray - Chest",
          "headId": null,
          "comment": null,
          "date": null
        }
      ],
      "investigation": [
        {
          "id": "8",
          "name": "Blood Group and Rh typing",
          "headId": "7",
          "comment": "",
          "date": null
        },
        {
          "id": "9",
          "name": "Complete Blood Count (CBC)",
          "headId": "7",
          "comment": "",
          "date": null
        }
      ],
      "patPrescriptions": [
        {
          "typeId": "2",
          "typeName": "TABLET",
          "typeShortName": "TAB",
          "medicineName": "TAB MORPHINE SULPHATE 20",
          "genricName": null,
          "medicineId": "957952",
          "medicineNameObj": {
            "typeId": "2",
            "name": "TAB MORPHINE SULPHATE 20",
            "genricName": null,
            "id": "957952",
            "is_favourite": 1,
            "type": {
              "id": "2",
              "shortName": "TAB",
              "name": "TABLET",
              "doseUnit": "tablets",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T14:03:24.819Z"
          ],
          "taperedToDate": [
            "2019-10-04T14:03:24.819Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        },
        {
          "typeId": "2",
          "typeName": "TABLET",
          "typeShortName": "TAB",
          "medicineName": "TAB MEDROL 10",
          "genricName": null,
          "medicineId": "957954",
          "medicineNameObj": {
            "typeId": "2",
            "name": "TAB MEDROL 10",
            "genricName": null,
            "id": "957954",
            "is_favourite": 1,
            "type": {
              "id": "2",
              "shortName": "TAB",
              "name": "TABLET",
              "doseUnit": "tablets",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T14:03:25.268Z"
          ],
          "taperedToDate": [
            "2019-10-04T14:03:25.268Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        },
        {
          "typeId": "2",
          "typeName": "TABLET",
          "typeShortName": "TAB",
          "medicineName": "TAB MEDROL",
          "genricName": null,
          "medicineId": "957953",
          "medicineNameObj": {
            "typeId": "2",
            "name": "TAB MEDROL",
            "genricName": null,
            "id": "957953",
            "is_favourite": 1,
            "type": {
              "id": "2",
              "shortName": "TAB",
              "name": "TABLET",
              "doseUnit": "tablets",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T14:03:27.376Z"
          ],
          "taperedToDate": [
            "2019-10-04T14:03:27.376Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        },
        {
          "typeId": "23",
          "typeName": "GEL",
          "typeShortName": "GEL",
          "medicineName": "VOLITRA GEL",
          "genricName": null,
          "medicineId": "957944",
          "medicineNameObj": {
            "typeId": "23",
            "name": "VOLITRA GEL",
            "genricName": null,
            "id": "957944",
            "is_favourite": 1,
            "type": {
              "id": "23",
              "shortName": "GEL",
              "name": "GEL",
              "doseUnit": "gm",
              "isObjGenerated": false
            },
            "is_selected": false
          },
          "doseViewType": 2,
          "genericRemarks": null,
          "genericRemarksEnglish": null,
          "genericRemarksHindi": null,
          "genericRemarksMarathi": null,
          "instruction": "",
          "instructionsEnglish": "null",
          "instructionsHindi": "null",
          "instructionsMarathi": "null",
          "instrOverwrite": null,
          "morningTime": "NULL",
          "morningVal": null,
          "lunchTime": "NULL",
          "lunchVal": null,
          "dinnerTime": "NULL",
          "dinnerVal": null,
          "genericDose": null,
          "dosage": "",
          "dosageUnit": {
            "id": ""
          },
          "freq": "",
          "freqSchedule": "1-0-0",
          "genericDuration": {
            "id": ""
          },
          "duration": null,
          "tapering": null,
          "taperedFromDate": [
            "2019-10-04T14:03:28.068Z"
          ],
          "taperedToDate": [
            "2019-10-04T14:03:28.068Z"
          ],
          "sig": {
            "id": "",
            "name": ""
          },
          "route": {
            "id": ""
          },
          "selectedLanguage": {
            "id": "101",
            "name": "English"
          },
          "quantity": "1",
          "administrate": null
        }
      ],
      "pain_relief": [],
      "pain_scale": [],
      "pain_score": {
        "pain_body_part": [
          {
            "body_part": "Right_Anterior_cervical_05",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_04",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Anterior_cervical_03",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_07",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_08",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Lumbar_09",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_12",
            "pain_score": 1,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Lumbar_Spine_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Thoracic_04",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Lumbar_07",
            "pain_score": 6,
            "svg_name": "BackzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Hypogastric_17",
            "pain_score": 1,
            "svg_name": "FrontzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Upperarrm_07",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_11",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Upperarrm_06",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Elbow_03",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_10",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_lateral_Forearrm_12",
            "pain_score": 1,
            "svg_name": "leftzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Mental_08",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_infraorbital_02",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Buccal_08",
            "pain_score": 1,
            "svg_name": "headzoomFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Left_Anterior_Thigh",
            "pain_score": 1,
            "svg_name": "svgFrontFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Orbital",
            "pain_score": 1,
            "svg_name": "headFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Auricular",
            "pain_score": 6,
            "svg_name": "headFlag",
            "svg_type": "humanBody",
            "comment": ""
          },
          {
            "body_part": "Right_Zygomatic",
            "pain_score": 6,
            "svg_name": "headFlag",
            "svg_type": "humanBody",
            "comment": ""
          }
        ],
        "pain_associated_data": {
          "comment": "",
          "vacResult": false,
          "dapResult": false,
          "aisValue": "",
          "completeModel": "",
          "partialSensoryRight": "",
          "partialSensoryLeft": "",
          "partialMototRight": "",
          "partialMototLeft": "",
          "neurlogicalInjury": "",
          "motorLeft": "",
          "motorRight": "",
          "sensoryRight": "",
          "sensoryLeft": ""
        }
      },
      "examinations": {
        "BpMin": "120",
        "Weight": "57",
        "BpMax": "123",
        "height": "164",
        "Opd2": "120",
        "BMI": "18",
        "Opd4": "6.3",
        "PDWeight": null,
        "RBPMax": null
      },
      "examinationLabelLocalFormData": [],
      "opd_tags": []
    }
  ];
  patientConsultationTimeLineData = [
  {
    "opd_data": [
      {
        "opd_date": "2019-10-05 15:47:35",
        "doctor": "Anirudh Kulkarni",
        "opd_data": {
          "Opdid": "839209",
          "OPDDate": "2019-10-05 15:47:35",
          "FollowUpDate": null,
          "advice": "",
          "next_appointment": null,
          "pain_scale": null,
          "refer_to_doctor_id": "0",
          "relief_scale": "5.00",
          "doc_id": "2883",
          "is_empty": false,
          "patPrescriptions": [
            {
              "Id": "385561",
              "OpdId": "839209",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-10-05",
              "tap_to_date": "2019-10-05",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:47:35",
              "modified_date": "2019-10-07 15:47:35",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-10-05",
              "taperedToDate": "2019-10-05",
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385562",
              "OpdId": "839209",
              "MedicineId": "1018930",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:47:35",
              "modified_date": "2019-10-07 15:47:35",
              "genric_name": "CETRIZINE 10 MG",
              "medicineName": "TAB ALERID",
              "medicineId": "1018930",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            }
          ],
          "tags": [],
          "refer_to_doctor": null,
          "investigation": "",
          "radioInvestigationInputs": [],
          "pain_score": {
            "temp_pain_score": [],
            "pain_scale": null
          },
          "operative_procedure": "",
          "diagnosis_icd": [],
          "lens_prescription": [],
          "pain_history": [],
          "back_and_leg_pain_investigation": [],
          "vitals": [
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "60"
            }
          ],
          "diagnosis": [
            {
              "name": "A15: Respiratory tuberculosis",
              "isPrimary": "1"
            }
          ],
          "allergies": [],
          "complaints": [],
          "cardiac_investigations": {
            "investigation_data": [],
            "attachment_data": []
          },
          "cardiac_attachment_data": [],
          "scoreTemplateList": [],
          "faq_data": [],
          "primary_checkup_opd": [],
          "patient_annotation_files": [],
          "medicalHistoryFilesInputs": {
            "medical_history_note": "",
            "attachment_data": []
          },
          "footExamineData": []
        }
      },
      {
        "opd_date": "2019-10-05 18:47:35",
        "doctor": "Ramesh Gupta",
        "opd_data": {
          "Opdid": "839209",
          "OPDDate": "2019-10-05 15:47:35",
          "FollowUpDate": null,
          "advice": "",
          "next_appointment": null,
          "pain_scale": null,
          "refer_to_doctor_id": "0",
          "relief_scale": "5.00",
          "doc_id": "2883",
          "is_empty": false,
          "patPrescriptions": [],
          "tags": [],
          "refer_to_doctor": null,
          "investigation": "",
          "radioInvestigationInputs": [],
          "pain_score": {
            "temp_pain_score": [],
            "pain_scale": null
          },
          "operative_procedure": "",
          "diagnosis_icd": [],
          "lens_prescription": [],
          "pain_history": [],
          "back_and_leg_pain_investigation": [],
          "vitals": [{
                "id": "2762",
                "doctor_id": "2883",
                "col_name": "Weight",
                "display_name": "Weight",
                "sequence_number": "2",
                "prefix": null,
                "suffix": null,
                "col_type": "text",
                "enabled": "1",
                "print_on_prescription": "1",
                "display_on_dashboard": "1",
                "is_decimal": "1",
                "clubbed_with": null,
                "created_by": null,
                "modified_by": "2883",
                "modified_date": "2019-04-22 14:44:05",
                "created_date": null,
                "patValue": "60"
              }
          ],
          "diagnosis": [
            {
              "name": "A15: Respiratory tuberculosis",
              "isPrimary": "1"
            }
          ],
          "allergies": [],
          "complaints": [
            {
              "OPDDate": "2019-10-05 15:47:35",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "SHOULDER PAIN, "
            }
          ],
          "cardiac_investigations": {
            "investigation_data": [],
            "attachment_data": []
          },
          "cardiac_attachment_data": [],
          "scoreTemplateList": [],
          "faq_data": [],
          "primary_checkup_opd": [],
          "patient_annotation_files": [],
          "medicalHistoryFilesInputs": {
            "medical_history_note": "",
            "attachment_data": []
          },
          "footExamineData": []
        }
      },
      {
        "opd_date": "2019-10-02 15:49:29",
        "doctor": "Abha Gupta",
        "opd_data": {
          "Opdid": "839211",
          "OPDDate": "2019-10-02 15:49:29",
          "FollowUpDate": null,
          "advice": "",
          "next_appointment": null,
          "pain_scale": null,
          "refer_to_doctor_id": "0",
          "relief_scale": null,
          "doc_id": "2883",
          "is_empty": false,
          "tags": [],
          "refer_to_doctor": null,
          "investigation": [
            {
              "id": "160",
              "investigation_date": "2019-10-02",
              "patient_investigation_date": "",
              "default_comment": "Needs 12 hour fasting",
              "label": "Fasting Blood Sugar"
            },
            {
              "id": "20",
              "investigation_date": "2019-10-02",
              "patient_investigation_date": "",
              "default_comment": "",
              "label": "Bld Sugar PP"
            }
          ],
          "radioInvestigationInputs": [],
          "pain_score": {
            "temp_pain_score": [],
            "pain_scale": null
          },
          "operative_procedure": "",
          "diagnosis_icd": [],
          "lens_prescription": [],
          "pain_history": [],
          "back_and_leg_pain_investigation": [],
          "vitals": [
            {
              "id": "2761",
              "doctor_id": "2883",
              "col_name": "height",
              "display_name": "height",
              "sequence_number": "1",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": null,
              "modified_date": null,
              "created_date": null,
              "patValue": "165"
            },
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "56"
            },
            {
              "id": "2760",
              "doctor_id": "2883",
              "col_name": "BMI",
              "display_name": "BMI",
              "sequence_number": "5",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-24 15:30:22",
              "created_date": null,
              "patValue": "92.400"
            }
          ],
          "diagnosis": [],
          "allergies": [],
          "complaints": [
            {
              "OPDDate": "2019-10-02 15:49:29",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "EXCESSIVE THIRST"
            },
            {
              "OPDDate": "2019-10-02 15:49:29",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "FEVER"
            }
          ],
          "cardiac_investigations": {
            "investigation_data": [],
            "attachment_data": []
          },
          "cardiac_attachment_data": [],
          "scoreTemplateList": [],
          "faq_data": [],
          "primary_checkup_opd": [],
          "patient_annotation_files": [],
          "medicalHistoryFilesInputs": {
            "medical_history_note": "",
            "attachment_data": []
          },
          "footExamineData": []
        }
      },
      {
        "opd_date": "2019-09-29 15:46:17",
        "doctor": "Abha Gupta",
        "opd_data": {
          "Opdid": "839208",
          "OPDDate": "2019-09-29 15:46:17",
          "FollowUpDate": null,
          "advice": "",
          "next_appointment": null,
          "pain_scale": null,
          "refer_to_doctor_id": "0",
          "relief_scale": null,
          "doc_id": "2883",
          "is_empty": false,
          "tags": [],
          "refer_to_doctor": null,
          "investigation": [
            {
              "id": "161",
              "investigation_date": "2019-09-29",
              "patient_investigation_date": "",
              "default_comment": "",
              "label": "complete Blood Count"
            }
          ],
          "radioInvestigationInputs": [],
          "pain_score": {
            "temp_pain_score": [],
            "pain_scale": null
          },
          "operative_procedure": "",
          "diagnosis_icd": [],
          "lens_prescription": [],
          "pain_history": [],
          "back_and_leg_pain_investigation": [],
          "vitals": [
            {
              "id": "2761",
              "doctor_id": "2883",
              "col_name": "height",
              "display_name": "height",
              "sequence_number": "1",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": null,
              "modified_date": null,
              "created_date": null,
              "patValue": "164"
            },
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "70"
            },
            {
              "id": "2760",
              "doctor_id": "2883",
              "col_name": "BMI",
              "display_name": "BMI",
              "sequence_number": "5",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-24 15:30:22",
              "created_date": null,
              "patValue": "114.800"
            }
          ],
          "diagnosis": [],
          "allergies": [],
          "complaints": [],
          "cardiac_investigations": {
            "investigation_data": [],
            "attachment_data": []
          },
          "cardiac_attachment_data": [],
          "scoreTemplateList": [],
          "faq_data": [],
          "primary_checkup_opd": [],
          "patient_annotation_files": [],
          "medicalHistoryFilesInputs": {
            "medical_history_note": "",
            "attachment_data": []
          },
          "footExamineData": [],
          "patPrescriptions": [
            {
              "Id": "385559",
              "OpdId": "839208",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:46:17",
              "modified_date": "2019-10-07 15:46:17",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385560",
              "OpdId": "839208",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:46:17",
              "modified_date": "2019-10-07 15:46:17",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        }
      }
    ],
    "year": "2019"
  },
  {
    "opd_data": [
      {
        "opd_date": "2018-10-05 09:47:35",
        "doctor": "Ravi Gupta",
        "opd_data": {
          "Opdid": "839207",
          "OPDDate": "2019-09-28 15:45:40",
          "FollowUpDate": null,
          "advice": "",
          "next_appointment": null,
          "pain_scale": null,
          "refer_to_doctor_id": "0",
          "relief_scale": null,
          "doc_id": "2883",
          "is_empty": false,
          "patPrescriptions": [
            {
              "Id": "385557",
              "OpdId": "839207",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:45:40",
              "modified_date": "2019-10-07 15:45:40",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385558",
              "OpdId": "839207",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:45:40",
              "modified_date": "2019-10-07 15:45:40",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            }
          ],
          "tags": [],
          "refer_to_doctor": null,
          "investigation": "",
          "radioInvestigationInputs": [],
          "pain_score": {
            "temp_pain_score": [],
            "pain_scale": null
          },
          "operative_procedure": "",
          "diagnosis_icd": [],
          "lens_prescription": [],
          "pain_history": [],
          "back_and_leg_pain_investigation": [],
          "vitals": [],
          "diagnosis": [],
          "allergies": [],
          "complaints": [],
          "cardiac_investigations": {
            "investigation_data": [],
            "attachment_data": []
          },
          "cardiac_attachment_data": [],
          "scoreTemplateList": [],
          "faq_data": [],
          "primary_checkup_opd": [],
          "patient_annotation_files": [],
          "medicalHistoryFilesInputs": {
            "medical_history_note": "",
            "attachment_data": []
          },
          "footExamineData": []
        }
      },
      {
        "opd_date": "2018-10-05 11:47:35",
        "doctor": "Ramesh Singh",
        "opd_data": {
          "Opdid": "839206",
          "OPDDate": "2019-09-26 15:21:55",
          "FollowUpDate": null,
          "advice": "Regular exercise, avoid sedentary lifestyle and keep a tab on carbohydrate foods.",
          "next_appointment": null,
          "pain_scale": null,
          "refer_to_doctor_id": "0",
          "relief_scale": null,
          "doc_id": "2883",
          "is_empty": false,
          "patPrescriptions": [
            {
              "Id": "385553",
              "OpdId": "839206",
              "MedicineId": "946863",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "15",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "50 MG",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-09-26",
              "tap_to_date": "2019-09-26",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": null,
              "medicineName": "GLIMEPRIDE",
              "medicineId": "946863",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-09-26",
              "taperedToDate": "2019-09-26",
              "Morning": null,
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385554",
              "OpdId": "839206",
              "MedicineId": "946864",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "1",
              "DinnerB": "",
              "DinnerA": "1",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "30",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "100 MG",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-09-26",
              "tap_to_date": "2019-09-26",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": null,
              "medicineName": "GLIPIZIN",
              "medicineId": "946864",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-09-26",
              "taperedToDate": "2019-09-26",
              "Morning": "Before",
              "Lunch": "After",
              "Dinner": "After",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385555",
              "OpdId": "839206",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385556",
              "OpdId": "839206",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            }
          ],
          "tags": [],
          "refer_to_doctor": null,
          "investigation": [
            {
              "id": "33",
              "investigation_date": "2019-09-26",
              "patient_investigation_date": "",
              "default_comment": "",
              "label": "Glucose - Fasting & Post prandial"
            },
            {
              "id": "1643",
              "investigation_date": "2019-09-26",
              "patient_investigation_date": "",
              "default_comment": "",
              "label": "Glycocylated Hb% (Hba1c)"
            },
            {
              "id": "9",
              "investigation_date": "2019-09-26",
              "patient_investigation_date": "",
              "default_comment": "",
              "label": "Complete Blood Count (CBC)"
            }
          ],
          "radioInvestigationInputs": [],
          "pain_score": {
            "temp_pain_score": [],
            "pain_scale": null
          },
          "operative_procedure": "",
          "diagnosis_icd": [],
          "lens_prescription": [],
          "pain_history": [],
          "back_and_leg_pain_investigation": [],
          "vitals": [
            {
              "id": "2761",
              "doctor_id": "2883",
              "col_name": "height",
              "display_name": "height",
              "sequence_number": "1",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": null,
              "modified_date": null,
              "created_date": null,
              "patValue": "164"
            },
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "52"
            },
            {
              "id": "2763",
              "doctor_id": "2883",
              "col_name": "BpMin",
              "display_name": "Diastolic",
              "sequence_number": "4",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2018-12-19 17:41:43",
              "created_date": null,
              "patValue": "120"
            },
            {
              "id": "2760",
              "doctor_id": "2883",
              "col_name": "BMI",
              "display_name": "BMI",
              "sequence_number": "5",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-24 15:30:22",
              "created_date": null,
              "patValue": "85.280"
            },
            {
              "id": "2764",
              "doctor_id": "2883",
              "col_name": "BpMax",
              "display_name": "Systolic",
              "sequence_number": "6",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2018-12-19 17:42:02",
              "created_date": null,
              "patValue": "120"
            }
          ],
          "diagnosis": [
            {
              "name": "E11: Type 2 diabetes mellitus",
              "isPrimary": "1"
            }
          ],
          "allergies": [],
          "complaints": [],
          "cardiac_investigations": {
            "investigation_data": [],
            "attachment_data": []
          },
          "cardiac_attachment_data": [],
          "scoreTemplateList": [],
          "faq_data": [],
          "primary_checkup_opd": [],
          "patient_annotation_files": [],
          "medicalHistoryFilesInputs": {
            "medical_history_note": "",
            "attachment_data": []
          },
          "footExamineData": []
        }
      },
      {
        "opd_date": "2018-09-08 15:49:29",
        "doctor": "Anirudh Kulkarni",
        "opd_data": {
          "Opdid": "839205",
          "OPDDate": "2019-09-19 15:20:36",
          "FollowUpDate": null,
          "advice": "Consult a dietitian for proper food intake, take regular medicine doses & avoid over-crowded places.",
          "next_appointment": null,
          "pain_scale": null,
          "refer_to_doctor_id": "0",
          "relief_scale": null,
          "doc_id": "2883",
          "is_empty": false,
          "tags": [],
          "refer_to_doctor": null,
          "investigation": [
            {
              "id": "9",
              "investigation_date": "2019-09-19",
              "patient_investigation_date": "",
              "default_comment": "",
              "label": "Complete Blood Count (CBC)"
            },
            {
              "id": "11",
              "investigation_date": "2019-09-19",
              "patient_investigation_date": "",
              "default_comment": "",
              "label": "Erythrocyte Sedimentation Rate (ESR)"
            },
            {
              "id": "1232",
              "investigation_date": "2019-09-19",
              "patient_investigation_date": "",
              "default_comment": "268187",
              "label": "SPUTUM FOR AFB"
            }
          ],
          "radioInvestigationInputs": [],
          "pain_score": {
            "temp_pain_score": [],
            "pain_scale": null
          },
          "operative_procedure": "",
          "diagnosis_icd": [],
          "lens_prescription": [],
          "pain_history": [],
          "back_and_leg_pain_investigation": [],
          "vitals": [
            {
              "id": "2764",
              "doctor_id": "2883",
              "col_name": "BpMax",
              "display_name": "Systolic",
              "sequence_number": "6",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2018-12-19 17:42:02",
              "created_date": null,
              "patValue": "60"
            }
          ],
          "diagnosis": [
            {
              "name": "A15: Respiratory tuberculosis",
              "isPrimary": "1"
            }
          ],
          "allergies": [],
          "complaints": [
            {
              "OPDDate": "2019-09-19 15:20:36",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "RIGHT HEEL PAIN"
            }
          ],
          "cardiac_investigations": {
            "investigation_data": [],
            "attachment_data": []
          },
          "cardiac_attachment_data": [],
          "scoreTemplateList": [],
          "faq_data": [],
          "primary_checkup_opd": [],
          "patient_annotation_files": [],
          "medicalHistoryFilesInputs": {
            "medical_history_note": "",
            "attachment_data": []
          },
          "footExamineData": []
        }
      },
      {
        "opd_date": "2018-09-29 15:46:17",
        "doctor": "Abha Gupta",
        "opd_data": {
          "Opdid": "839208",
          "OPDDate": "2019-09-29 15:46:17",
          "FollowUpDate": null,
          "advice": "",
          "next_appointment": null,
          "pain_scale": null,
          "refer_to_doctor_id": "0",
          "relief_scale": null,
          "doc_id": "2883",
          "is_empty": false,
          "patPrescriptions": [
            {
              "Id": "385559",
              "OpdId": "839208",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:46:17",
              "modified_date": "2019-10-07 15:46:17",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385560",
              "OpdId": "839208",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:46:17",
              "modified_date": "2019-10-07 15:46:17",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            }
          ],
          "tags": [],
          "refer_to_doctor": null,
          "investigation": [
            {
              "id": "161",
              "investigation_date": "2019-09-29",
              "patient_investigation_date": "",
              "default_comment": "",
              "label": "complete Blood Count"
            }
          ],
          "radioInvestigationInputs": [],
          "pain_score": {
            "temp_pain_score": [],
            "pain_scale": null
          },
          "operative_procedure": "",
          "diagnosis_icd": [],
          "lens_prescription": [],
          "pain_history": [],
          "back_and_leg_pain_investigation": [],
          "vitals": [
            {
              "0": {
                "id": "2761",
                "doctor_id": "2883",
                "col_name": "height",
                "display_name": "height",
                "sequence_number": "1",
                "prefix": null,
                "suffix": null,
                "col_type": "text",
                "enabled": "1",
                "print_on_prescription": "1",
                "display_on_dashboard": "1",
                "is_decimal": "0",
                "clubbed_with": null,
                "created_by": null,
                "modified_by": null,
                "modified_date": null,
                "created_date": null,
                "patValue": "164"
              },
              "1": {
                "id": "2762",
                "doctor_id": "2883",
                "col_name": "Weight",
                "display_name": "Weight",
                "sequence_number": "2",
                "prefix": null,
                "suffix": null,
                "col_type": "text",
                "enabled": "1",
                "print_on_prescription": "1",
                "display_on_dashboard": "1",
                "is_decimal": "1",
                "clubbed_with": null,
                "created_by": null,
                "modified_by": "2883",
                "modified_date": "2019-04-22 14:44:05",
                "created_date": null,
                "patValue": "70"
              },
              "4": {
                "id": "2760",
                "doctor_id": "2883",
                "col_name": "BMI",
                "display_name": "BMI",
                "sequence_number": "5",
                "prefix": null,
                "suffix": null,
                "col_type": "text",
                "enabled": "1",
                "print_on_prescription": "1",
                "display_on_dashboard": "1",
                "is_decimal": "0",
                "clubbed_with": null,
                "created_by": null,
                "modified_by": "2883",
                "modified_date": "2019-04-24 15:30:22",
                "created_date": null,
                "patValue": "114.800"
              }
            }
          ],
          "diagnosis": [],
          "allergies": [],
          "complaints": [],
          "cardiac_investigations": {
            "investigation_data": [],
            "attachment_data": []
          },
          "cardiac_attachment_data": [],
          "scoreTemplateList": [],
          "faq_data": [],
          "primary_checkup_opd": [],
          "patient_annotation_files": [],
          "medicalHistoryFilesInputs": {
            "medical_history_note": "",
            "attachment_data": []
          },
          "footExamineData": []
        }
      }
    ],
    "year": "2018"
  }
];

  labOrderData = [
    {
      "medicine": [
        {
          "doctorName": "Anirudh Kulkarni",
          "medicine": [
            {
              "tempId": 1570199128764,
              "medicineObj": {
                "name": "TAB MEDROL 10",
                "id": "957954",
                "startDate": "2019-10-04T14:25:28.765Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "24",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "4",
                  "short_name": "EPI",
                  "name": "Epidural"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "3",
                  "dose_unit": "mu"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            },
            {
              "tempId": 1570199129819,
              "medicineObj": {
                "name": "TAB MYORIL 4MG",
                "id": "957946",
                "startDate": "2019-10-04T14:25:29.819Z",
                "endDate": null,
                "dose": {
                  "id": "3",
                  "dose": "4"
                },
                "frequency": "5",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "3",
                  "short_name": "BUC",
                  "name": "Buccal"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "2",
                  "dose_unit": "mg"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "medicine": [
            {
              "tempId": 1570199588698,
              "medicineObj": {
                "name": "KALNASE NASAL SPRAY",
                "id": "957945",
                "startDate": "2019-10-04T14:33:08.701Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "8",
                "type": {
                  "id": "17",
                  "shortName": "NSPR",
                  "name": "NASAL SPRAY",
                  "doseUnit": "puffs"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "5",
                  "short_name": "IA",
                  "name": "Intra-arterial"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "3",
                  "dose_unit": "mu"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "04:00 PM"
            },
            {
              "tempId": 1570199589937,
              "medicineObj": {
                "name": "TAB MORCONTIN 30MG",
                "id": "957963",
                "startDate": "2019-10-04T14:33:09.937Z",
                "endDate": null,
                "dose": {
                  "id": "5",
                  "dose": "6"
                },
                "frequency": "8",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "4",
                  "short_name": "EPI",
                  "name": "Epidural"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "4",
                  "dose_unit": "cc"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            },
            {
              "tempId": 1570199590480,
              "medicineObj": {
                "name": "TAB RCINEX 600",
                "id": "957961",
                "startDate": "2019-10-04T14:33:10.480Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "10",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "12",
                  "short_name": "IM",
                  "name": "Intramuscular"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "6",
                  "dose_unit": "μg"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Ranjan Gogoi",
          "medicine": [
            {
              "tempId": 1570199588698,
              "medicineObj": {
                "name": "KALNASE NASAL SPRAY",
                "id": "957945",
                "startDate": "2019-10-04T14:33:08.701Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "8",
                "type": {
                  "id": "17",
                  "shortName": "NSPR",
                  "name": "NASAL SPRAY",
                  "doseUnit": "puffs"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "5",
                  "short_name": "IA",
                  "name": "Intra-arterial"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "3",
                  "dose_unit": "mu"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "04:00 PM"
            },
            {
              "tempId": 1570199589937,
              "medicineObj": {
                "name": "TAB MORCONTIN 30MG",
                "id": "957963",
                "startDate": "2019-10-04T14:33:09.937Z",
                "endDate": null,
                "dose": {
                  "id": "5",
                  "dose": "6"
                },
                "frequency": "8",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "4",
                  "short_name": "EPI",
                  "name": "Epidural"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "4",
                  "dose_unit": "cc"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            },
            {
              "tempId": 1570199590480,
              "medicineObj": {
                "name": "TAB RCINEX 600",
                "id": "957961",
                "startDate": "2019-10-04T14:33:10.480Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "10",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "12",
                  "short_name": "IM",
                  "name": "Intramuscular"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "6",
                  "dose_unit": "μg"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "lab": [
        {
          "doctorName": "Reena Bisht",
          "lab": [
            {
              "isValidObject": true,
              "id": "",
              "name": "Blood Group and Rh typing",
              "labInvestigationObj": {
                "id": "8",
                "name": "Blood Group and Rh typing",
                "label": "Blood Group and Rh typing",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:27:15.671Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570199235609,
              "frequency": "14",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "Random Glucose",
              "labInvestigationObj": {
                "id": "25",
                "name": "Random Glucose",
                "label": "Random Glucose",
                "headId": "1",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:27:17.250Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570199237186,
              "frequency": "15",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Anirudh Kulkarni",
          "lab": [
            {
              "isValidObject": true,
              "id": "",
              "name": "BT, CT, PT/INR",
              "labInvestigationObj": {
                "id": "6",
                "name": "BT, CT, PT/INR",
                "label": "BT, CT, PT/INR",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:43:11.922Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570200191872,
              "frequency": "6",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "INR",
              "labInvestigationObj": {
                "id": "2",
                "name": "INR",
                "label": "INR",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:43:12.287Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570200192252,
              "frequency": "3",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "diet": [
        {
          "doctorName": "Suman Gupta",
          "diet": [
            {
              "name": "Soft Diet",
              "tempId": 1569932453498,
              "dietId": "4",
              "action": "",
              "id": 493,
              "status": "approvelPending",
              "isDirty": false,
              "startDateTime": "2019-10-01T12:20:50.239Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            },
            {
              "name": "Full Liquid Diet",
              "tempId": 1569932454458,
              "dietId": "3",
              "action": "",
              "id": 494,
              "status": "approvelPending",
              "isDirty": false,
              "startDateTime": "2019-10-01T12:20:50.239Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            }
          ]
        },
        {
          "doctorName": "Anirudh Kulkarni",
          "diet": [
            {
              "name": "Cardiac Diet",
              "tempId": 1570199287412,
              "dietId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "startDateTime": "2019-10-04T14:28:06.432Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            }
          ]
        }
      ],
      "nursing": [
        {
          "doctorName": "Rajesh Singh",
          "nursing": [
            {
              "isValidObject": true,
              "name": "Maintain bowel elimination.",
              "tempId": 1570199290934,
              "nursingId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "startDateTime": "2019-10-04T14:28:10.092Z",
              "is_favourite": 0,
              "use_count": "7",
              "invalidObjectMessage": "Frequency or Duration may be missing",
              "tempstatus": "",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Rinku Shah",
          "nursing": [
            {
              "isValidObject": true,
              "name": "Maintain bowel elimination.",
              "tempId": 1570200243950,
              "nursingId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "genericFreq": "4",
              "startDateTime": "2019-10-04T14:44:03.023Z",
              "is_favourite": 0,
              "use_count": "7",
              "invalidObjectMessage": "Frequency or Duration may be missing",
              "tempstatus": "",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "radiology": [
        {
          "doctorName": "M M Singh",
          "radiology": [
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Foot",
              "radioInvestigationObj": {
                "id": "552",
                "name": "CT +3D - Foot",
                "label": "CT +3D - Foot",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:43:49.409Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200229409,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "2",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "X-Ray - Knee",
              "radioInvestigationObj": {
                "id": "550",
                "name": "X-Ray - Knee",
                "label": "X-Ray - Knee",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:43:49.876Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200229876,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "5",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Anirudh Kulkarni",
          "radiology": [
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Knee",
              "radioInvestigationObj": {
                "id": "554",
                "name": "CT +3D - Knee",
                "label": "CT +3D - Knee",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:46:48.644Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200408644,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "4",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Foot",
              "radioInvestigationObj": {
                "id": "552",
                "name": "CT +3D - Foot",
                "label": "CT +3D - Foot",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:46:49.211Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200409211,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "3",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ]
    },
    {
      "medicine": [
        {
          "doctorName": "Seema Yadav",
          "medicine": [
            {
              "tempId": 1570199588698,
              "medicineObj": {
                "name": "KALNASE NASAL SPRAY",
                "id": "957945",
                "startDate": "2019-10-04T14:33:08.701Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "8",
                "type": {
                  "id": "17",
                  "shortName": "NSPR",
                  "name": "NASAL SPRAY",
                  "doseUnit": "puffs"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "5",
                  "short_name": "IA",
                  "name": "Intra-arterial"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "3",
                  "dose_unit": "mu"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "04:00 PM"
            },
            {
              "tempId": 1570199589937,
              "medicineObj": {
                "name": "TAB MORCONTIN 30MG",
                "id": "957963",
                "startDate": "2019-10-04T14:33:09.937Z",
                "endDate": null,
                "dose": {
                  "id": "5",
                  "dose": "6"
                },
                "frequency": "8",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "4",
                  "short_name": "EPI",
                  "name": "Epidural"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "4",
                  "dose_unit": "cc"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            },
            {
              "tempId": 1570199590480,
              "medicineObj": {
                "name": "TAB RCINEX 600",
                "id": "957961",
                "startDate": "2019-10-04T14:33:10.480Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "10",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "12",
                  "short_name": "IM",
                  "name": "Intramuscular"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "6",
                  "dose_unit": "μg"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Ranjan Gogoi",
           "medicine": [
            {
              "tempId": 1570199588698,
              "medicineObj": {
                "name": "KALNASE NASAL SPRAY",
                "id": "957945",
                "startDate": "2019-10-04T14:33:08.701Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "8",
                "type": {
                  "id": "17",
                  "shortName": "NSPR",
                  "name": "NASAL SPRAY",
                  "doseUnit": "puffs"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "5",
                  "short_name": "IA",
                  "name": "Intra-arterial"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "3",
                  "dose_unit": "mu"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "04:00 PM"
            },
            {
              "tempId": 1570199589937,
              "medicineObj": {
                "name": "TAB MORCONTIN 30MG",
                "id": "957963",
                "startDate": "2019-10-04T14:33:09.937Z",
                "endDate": null,
                "dose": {
                  "id": "5",
                  "dose": "6"
                },
                "frequency": "8",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "4",
                  "short_name": "EPI",
                  "name": "Epidural"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "4",
                  "dose_unit": "cc"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            },
            {
              "tempId": 1570199590480,
              "medicineObj": {
                "name": "TAB RCINEX 600",
                "id": "957961",
                "startDate": "2019-10-04T14:33:10.480Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "10",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "12",
                  "short_name": "IM",
                  "name": "Intramuscular"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "6",
                  "dose_unit": "μg"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "lab": [
        {
          "doctorName": "Naresh Bisht",
          "lab": [
            {
              "isValidObject": true,
              "id": "",
              "name": "BT, CT, PT/INR",
              "labInvestigationObj": {
                "id": "6",
                "name": "BT, CT, PT/INR",
                "label": "BT, CT, PT/INR",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:43:11.922Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570200191872,
              "frequency": "6",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "INR",
              "labInvestigationObj": {
                "id": "2",
                "name": "INR",
                "label": "INR",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:43:12.287Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570200192252,
              "frequency": "3",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Kedar Singh",
          "lab": [
            {
              "isValidObject": true,
              "id": "",
              "name": "Blood Group and Rh typing",
              "labInvestigationObj": {
                "id": "8",
                "name": "Blood Group and Rh typing",
                "label": "Blood Group and Rh typing",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:27:15.671Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570199235609,
              "frequency": "14",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "Random Glucose",
              "labInvestigationObj": {
                "id": "25",
                "name": "Random Glucose",
                "label": "Random Glucose",
                "headId": "1",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:27:17.250Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570199237186,
              "frequency": "15",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "diet": [
        {
          "doctorName": "Sinkandar Kher",
          "diet": [
            {
              "name": "Cardiac Diet",
              "tempId": 1570199287412,
              "dietId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "startDateTime": "2019-10-04T14:28:06.432Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            }
          ]
        },
        {
          "doctorName": "Anirudh Kulkarni",

          "diet": [
            {
              "name": "Soft Diet",
              "tempId": 1569932453498,
              "dietId": "4",
              "action": "",
              "id": 493,
              "status": "approvelPending",
              "isDirty": false,
              "startDateTime": "2019-10-01T12:20:50.239Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            },
            {
              "name": "Full Liquid Diet",
              "tempId": 1569932454458,
              "dietId": "3",
              "action": "",
              "id": 494,
              "status": "approvelPending",
              "isDirty": false,
              "startDateTime": "2019-10-01T12:20:50.239Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            }
          ]
        }
      ],
      "nursing": [
        {
          "doctorName": "B R Singh",
          "nursing": [
            {
              "isValidObject": true,
              "name": "Maintain bowel elimination.",
              "tempId": 1570199290934,
              "nursingId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "startDateTime": "2019-10-04T14:28:10.092Z",
              "is_favourite": 0,
              "use_count": "7",
              "invalidObjectMessage": "Frequency or Duration may be missing",
              "tempstatus": "",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Mahadev Shah",
          "nursing": [
            {
              "isValidObject": true,
              "name": "Maintain bowel elimination.",
              "tempId": 1570200243950,
              "nursingId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "genericFreq": "4",
              "startDateTime": "2019-10-04T14:44:03.023Z",
              "is_favourite": 0,
              "use_count": "7",
              "invalidObjectMessage": "Frequency or Duration may be missing",
              "tempstatus": "",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "radiology": [
        {
          "doctorName": "M M Singh",
          "radiology": [
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Foot",
              "radioInvestigationObj": {
                "id": "552",
                "name": "CT +3D - Foot",
                "label": "CT +3D - Foot",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:43:49.409Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200229409,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "2",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "X-Ray - Knee",
              "radioInvestigationObj": {
                "id": "550",
                "name": "X-Ray - Knee",
                "label": "X-Ray - Knee",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:43:49.876Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200229876,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "5",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Anirudh Kulkarni",
          "radiology": [
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Knee",
              "radioInvestigationObj": {
                "id": "554",
                "name": "CT +3D - Knee",
                "label": "CT +3D - Knee",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:46:48.644Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200408644,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "4",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Foot",
              "radioInvestigationObj": {
                "id": "552",
                "name": "CT +3D - Foot",
                "label": "CT +3D - Foot",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:46:49.211Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200409211,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "3",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ]
    },
    {
      "medicine": [
        {
          "doctorName": "Anirudh Kulkarni",
          "medicine": [
            {
              "tempId": 1570199128764,
              "medicineObj": {
                "name": "TAB MEDROL 10",
                "id": "957954",
                "startDate": "2019-10-04T14:25:28.765Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "24",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "4",
                  "short_name": "EPI",
                  "name": "Epidural"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "3",
                  "dose_unit": "mu"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            },
            {
              "tempId": 1570199129819,
              "medicineObj": {
                "name": "TAB MYORIL 4MG",
                "id": "957946",
                "startDate": "2019-10-04T14:25:29.819Z",
                "endDate": null,
                "dose": {
                  "id": "3",
                  "dose": "4"
                },
                "frequency": "5",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "3",
                  "short_name": "BUC",
                  "name": "Buccal"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "2",
                  "dose_unit": "mg"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "medicine": [
            {
              "tempId": 1570199588698,
              "medicineObj": {
                "name": "KALNASE NASAL SPRAY",
                "id": "957945",
                "startDate": "2019-10-04T14:33:08.701Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "8",
                "type": {
                  "id": "17",
                  "shortName": "NSPR",
                  "name": "NASAL SPRAY",
                  "doseUnit": "puffs"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "5",
                  "short_name": "IA",
                  "name": "Intra-arterial"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "3",
                  "dose_unit": "mu"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "04:00 PM"
            },
            {
              "tempId": 1570199589937,
              "medicineObj": {
                "name": "TAB MORCONTIN 30MG",
                "id": "957963",
                "startDate": "2019-10-04T14:33:09.937Z",
                "endDate": null,
                "dose": {
                  "id": "5",
                  "dose": "6"
                },
                "frequency": "8",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "4",
                  "short_name": "EPI",
                  "name": "Epidural"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "4",
                  "dose_unit": "cc"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            },
            {
              "tempId": 1570199590480,
              "medicineObj": {
                "name": "TAB RCINEX 600",
                "id": "957961",
                "startDate": "2019-10-04T14:33:10.480Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "10",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "12",
                  "short_name": "IM",
                  "name": "Intramuscular"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "6",
                  "dose_unit": "μg"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Ranjan Gogoi",
          "medicine": [
            {
              "tempId": 1570199588698,
              "medicineObj": {
                "name": "KALNASE NASAL SPRAY",
                "id": "957945",
                "startDate": "2019-10-04T14:33:08.701Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "8",
                "type": {
                  "id": "17",
                  "shortName": "NSPR",
                  "name": "NASAL SPRAY",
                  "doseUnit": "puffs"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "5",
                  "short_name": "IA",
                  "name": "Intra-arterial"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "3",
                  "dose_unit": "mu"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "04:00 PM"
            },
            {
              "tempId": 1570199589937,
              "medicineObj": {
                "name": "TAB MORCONTIN 30MG",
                "id": "957963",
                "startDate": "2019-10-04T14:33:09.937Z",
                "endDate": null,
                "dose": {
                  "id": "5",
                  "dose": "6"
                },
                "frequency": "8",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "4",
                  "short_name": "EPI",
                  "name": "Epidural"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "4",
                  "dose_unit": "cc"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            },
            {
              "tempId": 1570199590480,
              "medicineObj": {
                "name": "TAB RCINEX 600",
                "id": "957961",
                "startDate": "2019-10-04T14:33:10.480Z",
                "endDate": null,
                "dose": {
                  "id": "4",
                  "dose": "5"
                },
                "frequency": "10",
                "type": {
                  "id": "2",
                  "shortName": "TAB",
                  "name": "TABLET",
                  "doseUnit": "tablets"
                },
                "sig": null,
                "instruction": null,
                "duration": null,
                "route": {
                  "id": "12",
                  "short_name": "IM",
                  "name": "Intramuscular"
                },
                "genricName": null,
                "frequencySchedule": "1-1-1-1-1-1-1-1-1-1",
                "isValid": false,
                "isObjGenerated": false,
                "doseUnit": {
                  "id": "6",
                  "dose_unit": "μg"
                }
              },
              "priority": "Routine",
              "action": "",
              "status": "approvelPending",
              "isDirty": true,
              "tempstatus": "",
              "invalidObjectMessage": "Type, Name, Frequency or Duration may be missing",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "lab": [
        {
          "doctorName": "Reena Bisht",
          "lab": [
            {
              "isValidObject": true,
              "id": "",
              "name": "Blood Group and Rh typing",
              "labInvestigationObj": {
                "id": "8",
                "name": "Blood Group and Rh typing",
                "label": "Blood Group and Rh typing",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:27:15.671Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570199235609,
              "frequency": "14",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "Random Glucose",
              "labInvestigationObj": {
                "id": "25",
                "name": "Random Glucose",
                "label": "Random Glucose",
                "headId": "1",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:27:17.250Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570199237186,
              "frequency": "15",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Anirudh Kulkarni",
          "lab": [
            {
              "isValidObject": true,
              "id": "",
              "name": "BT, CT, PT/INR",
              "labInvestigationObj": {
                "id": "6",
                "name": "BT, CT, PT/INR",
                "label": "BT, CT, PT/INR",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:43:11.922Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570200191872,
              "frequency": "6",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "INR",
              "labInvestigationObj": {
                "id": "2",
                "name": "INR",
                "label": "INR",
                "headId": "7",
                "comment": ""
              },
              "specimen": "",
              "startDateTime": "2019-10-04T14:43:12.287Z",
              "endDateTime": null,
              "priority": "",
              "action": "",
              "status": "approvelPending",
              "patientConsentNeeded": "",
              "labInstruction": "",
              "patientInstruction": "",
              "reason": "",
              "isDirty": true,
              "tempstatus": "",
              "componentList": [],
              "selectedComponentCount": 0,
              "invalidObjectMessage": "",
              "tempId": 1570200192252,
              "frequency": "3",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "diet": [
        {
          "doctorName": "Suman Gupta",
          "diet": [
            {
              "name": "Soft Diet",
              "tempId": 1569932453498,
              "dietId": "4",
              "action": "",
              "id": 493,
              "status": "approvelPending",
              "isDirty": false,
              "startDateTime": "2019-10-01T12:20:50.239Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            },
            {
              "name": "Full Liquid Diet",
              "tempId": 1569932454458,
              "dietId": "3",
              "action": "",
              "id": 494,
              "status": "approvelPending",
              "isDirty": false,
              "startDateTime": "2019-10-01T12:20:50.239Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            }
          ]
        },
        {
          "doctorName": "Anirudh Kulkarni",
          "diet": [
            {
              "name": "Cardiac Diet",
              "tempId": 1570199287412,
              "dietId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "startDateTime": "2019-10-04T14:28:06.432Z",
              "endDateTime": null,
              "invalidObjectMessage": "",
              "is_favourite": 0,
              "use_count": "7",
              "tempstatus": ""
            }
          ]
        }
      ],
      "nursing": [
        {
          "doctorName": "Rajesh Singh",
          "nursing": [
            {
              "isValidObject": true,
              "name": "Maintain bowel elimination.",
              "tempId": 1570199290934,
              "nursingId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "startDateTime": "2019-10-04T14:28:10.092Z",
              "is_favourite": 0,
              "use_count": "7",
              "invalidObjectMessage": "Frequency or Duration may be missing",
              "tempstatus": "",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Rinku Shah",
          "nursing": [
            {
              "isValidObject": true,
              "name": "Maintain bowel elimination.",
              "tempId": 1570200243950,
              "nursingId": "6",
              "action": "",
              "id": "",
              "status": "approvelPending",
              "isDirty": true,
              "genericFreq": "4",
              "startDateTime": "2019-10-04T14:44:03.023Z",
              "is_favourite": 0,
              "use_count": "7",
              "invalidObjectMessage": "Frequency or Duration may be missing",
              "tempstatus": "",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ],
      "radiology": [
        {
          "doctorName": "M M Singh",
          "radiology": [
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Foot",
              "radioInvestigationObj": {
                "id": "552",
                "name": "CT +3D - Foot",
                "label": "CT +3D - Foot",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:43:49.409Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200229409,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "2",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "X-Ray - Knee",
              "radioInvestigationObj": {
                "id": "550",
                "name": "X-Ray - Knee",
                "label": "X-Ray - Knee",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:43:49.876Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200229876,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "5",
              "freqStartTime": "07:00 AM"
            }
          ]
        },
        {
          "doctorName": "Anirudh Kulkarni",
          "radiology": [
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Knee",
              "radioInvestigationObj": {
                "id": "554",
                "name": "CT +3D - Knee",
                "label": "CT +3D - Knee",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:46:48.644Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200408644,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "4",
              "freqStartTime": "07:00 AM"
            },
            {
              "isValidObject": true,
              "id": "",
              "name": "CT +3D - Foot",
              "radioInvestigationObj": {
                "id": "552",
                "name": "CT +3D - Foot",
                "label": "CT +3D - Foot",
                "headId": "9",
                "comment": ""
              },
              "startDateTime": "2019-10-04T14:46:49.211Z",
              "endDateTime": null,
              "recurring": "",
              "action": "",
              "status": "approvelPending",
              "reason": "",
              "signSymptoms": "",
              "patientConsentNeeded": "no",
              "clinicalInfo": "",
              "radiologyInstruction": "",
              "patientInstruction": "",
              "isDirty": true,
              "tempId": 1570200409211,
              "tempstatus": "",
              "invalidObjectMessage": "",
              "frequency": "3",
              "freqStartTime": "07:00 AM"
            }
          ]
        }
      ]
    }
  ];

  medicineOnlyData = [
    {
      "0": [
        {
          "doctorName": "Anirudh Kulkarni",
          "patPrescriptions": [
            {
              "Id": "385561",
              "OpdId": "839209",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-10-05",
              "tap_to_date": "2019-10-05",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:47:35",
              "modified_date": "2019-10-07 15:47:35",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-10-05",
              "taperedToDate": "2019-10-05",
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385562",
              "OpdId": "839209",
              "MedicineId": "1018930",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:47:35",
              "modified_date": "2019-10-07 15:47:35",
              "genric_name": "CETRIZINE 10 MG",
              "medicineName": "TAB ALERID",
              "medicineId": "1018930",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "patPrescriptions": [
            {
              "Id": "385559",
              "OpdId": "839208",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:46:17",
              "modified_date": "2019-10-07 15:46:17",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385560",
              "OpdId": "839208",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:46:17",
              "modified_date": "2019-10-07 15:46:17",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "patPrescriptions": [
            {
              "Id": "385557",
              "OpdId": "839207",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:45:40",
              "modified_date": "2019-10-07 15:45:40",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385558",
              "OpdId": "839207",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:45:40",
              "modified_date": "2019-10-07 15:45:40",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        }
      ]
    },
    {
      "1": [
        {
          "doctorName": "Garima Gupta",
          "patPrescriptions": [
            {
              "Id": "385553",
              "OpdId": "839206",
              "MedicineId": "946863",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "15",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "50 MG",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-09-26",
              "tap_to_date": "2019-09-26",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": null,
              "medicineName": "GLIMEPRIDE",
              "medicineId": "946863",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-09-26",
              "taperedToDate": "2019-09-26",
              "Morning": null,
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385554",
              "OpdId": "839206",
              "MedicineId": "946864",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "1",
              "DinnerB": "",
              "DinnerA": "1",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "30",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "100 MG",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-09-26",
              "tap_to_date": "2019-09-26",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": null,
              "medicineName": "GLIPIZIN",
              "medicineId": "946864",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-09-26",
              "taperedToDate": "2019-09-26",
              "Morning": "Before",
              "Lunch": "After",
              "Dinner": "After",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385555",
              "OpdId": "839206",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385556",
              "OpdId": "839206",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "patPrescriptions": [
            {
              "Id": "385557",
              "OpdId": "839207",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:45:40",
              "modified_date": "2019-10-07 15:45:40",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385558",
              "OpdId": "839207",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:45:40",
              "modified_date": "2019-10-07 15:45:40",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "patPrescriptions": [
            {
              "Id": "385561",
              "OpdId": "839209",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-10-05",
              "tap_to_date": "2019-10-05",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:47:35",
              "modified_date": "2019-10-07 15:47:35",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-10-05",
              "taperedToDate": "2019-10-05",
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385562",
              "OpdId": "839209",
              "MedicineId": "1018930",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:47:35",
              "modified_date": "2019-10-07 15:47:35",
              "genric_name": "CETRIZINE 10 MG",
              "medicineName": "TAB ALERID",
              "medicineId": "1018930",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        },
        {
          "doctorName": "M M Gupta",
          "patPrescriptions": [
            {
              "Id": "385559",
              "OpdId": "839208",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:46:17",
              "modified_date": "2019-10-07 15:46:17",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385560",
              "OpdId": "839208",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:46:17",
              "modified_date": "2019-10-07 15:46:17",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        }
      ]
    },
    {
      "2": [
        {
          "doctorName": "Anirudh Gupta",
          "patPrescriptions": [
            {
              "Id": "385553",
              "OpdId": "839206",
              "MedicineId": "946863",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "15",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "50 MG",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-09-26",
              "tap_to_date": "2019-09-26",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": null,
              "medicineName": "GLIMEPRIDE",
              "medicineId": "946863",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-09-26",
              "taperedToDate": "2019-09-26",
              "Morning": null,
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385554",
              "OpdId": "839206",
              "MedicineId": "946864",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "1",
              "DinnerB": "",
              "DinnerA": "1",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "30",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "100 MG",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-09-26",
              "tap_to_date": "2019-09-26",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": null,
              "medicineName": "GLIPIZIN",
              "medicineId": "946864",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-09-26",
              "taperedToDate": "2019-09-26",
              "Morning": "Before",
              "Lunch": "After",
              "Dinner": "After",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385555",
              "OpdId": "839206",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385556",
              "OpdId": "839206",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:43:57",
              "modified_date": "2019-10-07 15:43:57",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        },
        {
          "doctorName": "Naresh Bisht",
          "patPrescriptions": [
            {
              "Id": "385557",
              "OpdId": "839207",
              "MedicineId": "1018961",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:45:40",
              "modified_date": "2019-10-07 15:45:40",
              "genric_name": "PREDNISOLONE 5MG",
              "medicineName": "TAB OMNACORTIL 5MG",
              "medicineId": "1018961",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385558",
              "OpdId": "839207",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": null,
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:45:40",
              "modified_date": "2019-10-07 15:45:40",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": null,
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        },
        {
          "doctorName": "T K Gupta",
          "patPrescriptions": [
            {
              "Id": "385561",
              "OpdId": "839209",
              "MedicineId": "1018929",
              "MorningB": "1",
              "MorningA": "",
              "LunchB": "1",
              "LunchA": "",
              "DinnerB": "1",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": "5",
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": "10 mg",
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": "2019-10-05",
              "tap_to_date": "2019-10-05",
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:47:35",
              "modified_date": "2019-10-07 15:47:35",
              "genric_name": "ACECLOFENAC 100+PARACETAMOL 500MG",
              "medicineName": "TAB ACEPARON",
              "medicineId": "1018929",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": "2019-10-05",
              "taperedToDate": "2019-10-05",
              "Morning": "Before",
              "Lunch": "Before",
              "Dinner": "Before",
              "dosageUnit": "",
              "genericDuration": ""
            },
            {
              "Id": "385562",
              "OpdId": "839209",
              "MedicineId": "1018930",
              "MorningB": "",
              "MorningA": "",
              "LunchB": "",
              "LunchA": "",
              "DinnerB": "",
              "DinnerA": "",
              "Freq": "",
              "FreqSchedule": "",
              "Quantity": null,
              "Days": null,
              "Total": null,
              "Instruction": "",
              "FontId": "101",
              "Dispensed": null,
              "Remarks": "",
              "Reaction": null,
              "Dosage": null,
              "dose_unit": null,
              "sig": "",
              "route": "",
              "generic_freq": "",
              "generic_dose": "",
              "tap_from_date": null,
              "tap_to_date": null,
              "generic_duration": null,
              "tapering": "0",
              "dose_view_type": "0",
              "created_by": "2883",
              "modified_by": "2883",
              "created_date": "2019-10-07 15:47:35",
              "modified_date": "2019-10-07 15:47:35",
              "genric_name": "CETRIZINE 10 MG",
              "medicineName": "TAB ALERID",
              "medicineId": "1018930",
              "medicineTypeName": "TABLET",
              "medicineTypeId": "2",
              "ShortName": "TAB",
              "genericFreq": "",
              "genericDose": "",
              "genericRemarks": "",
              "taperedFromDate": null,
              "taperedToDate": null,
              "Morning": null,
              "Lunch": null,
              "Dinner": null,
              "dosageUnit": "",
              "genericDuration": ""
            }
          ]
        }
      ]
    }
  ];

  diagnosisData = [
    {
      "0": [
        {
          "doctorName": "Anirudh Kulkarni",
          "diagnosis": [
            {
              "name": "A15: Respiratory tuberculosis",
              "isPrimary": "1"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "diagnosis": [
            {
              "name": "J18: Pneumonia, unspecified organism",
              "isPrimary": "1"
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "diagnosis": [
            {
              "name": "E11: Type 2 diabetes mellitus",
              "isPrimary": "1"
            }
          ]
        }
      ]
    },
    {
      "1": [
        {
          "doctorName": "Rahul Khare",
          "diagnosis": [
            {
              "name": "J18: Pneumonia, unspecified organism",
              "isPrimary": "1"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "diagnosis": [
            {
              "name": "A15: Respiratory tuberculosis",
              "isPrimary": "1"
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "diagnosis": [
            {
              "name": "E11: Type 2 diabetes mellitus",
              "isPrimary": "1"
            }
          ]
        },
        {
          "doctorName": "Abha Gupta",
          "diagnosis": [
            {
              "name": "E11: Type 2 diabetes mellitus",
              "isPrimary": "1"
            },
             {
              "name": "E11: Type 2 diabetes mellitus",
              "isPrimary": "1"
            }
          ]
        }
      ]
    }
  ];

  complaintsData = [
    {
      "0": [
        {
          "doctorName": "Anirudh Kulkarni",
          "complaints": [
            {
              "OPDDate": "2019-09-19 15:20:36",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "RIGHT HEEL PAIN"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "complaints": [
            {
              "OPDDate": "2019-09-15 15:19:04",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "PAIN STILL + OVER THE NOSE RIGHT, NO HEADACHE"
            },
            {
              "OPDDate": "2019-09-15 15:19:04",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "HEADACHE"
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "complaints": [
            {
              "OPDDate": "2019-10-05 15:47:35",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "SHOULDER PAIN, "
            }
          ]
        }
      ]
    },
    {
      "1": [
        {
          "doctorName": "Rahul Khare",
          "complaints": [
            {
              "OPDDate": "2019-10-02 15:49:29",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "EXCESSIVE THIRST"
            },
            {
              "OPDDate": "2019-10-02 15:49:29",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "FEVER"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "complaints": [
            {
              "OPDDate": "2019-09-19 15:20:36",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "RIGHT HEEL PAIN"
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "complaints": [
            {
              "OPDDate": "2019-09-15 15:19:04",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "PAIN STILL + OVER THE NOSE RIGHT, NO HEADACHE"
            },
            {
              "OPDDate": "2019-09-15 15:19:04",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "HEADACHE"
            }
          ]
        },
        {
          "doctorName": "Abha Gupta",
          "complaints": [
            {
              "OPDDate": "2019-09-05 15:15:21",
              "compDays": "",
              "compMonth": "",
              "compYear": "",
              "complaint_name": "PAIN STILL + OVER THE NOSE RIGHT, NO HEADACHE"
            }
          ]
        }
      ]
    }
  ];

  vitalsData = [
    {
      "0": [
        {
          "doctorName": "Anirudh Kulkarni",
          "vitals": [
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "60"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "vitals": [
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "60"
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "vitals": [
            {
              "id": "2761",
              "doctor_id": "2883",
              "col_name": "height",
              "display_name": "height",
              "sequence_number": "1",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": null,
              "modified_date": null,
              "created_date": null,
              "patValue": "165"
            },
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "56"
            },
            {
              "id": "2760",
              "doctor_id": "2883",
              "col_name": "BMI",
              "display_name": "BMI",
              "sequence_number": "5",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-24 15:30:22",
              "created_date": null,
              "patValue": "92.400"
            }
          ]
        }
      ]
    },
    {
      "1": [
        {
          "doctorName": "Rahul Khare",
          "vitals": [
            {
              "id": "2761",
              "doctor_id": "2883",
              "col_name": "height",
              "display_name": "height",
              "sequence_number": "1",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": null,
              "modified_date": null,
              "created_date": null,
              "patValue": "164"
            },
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "70"
            },
            {
              "id": "2760",
              "doctor_id": "2883",
              "col_name": "BMI",
              "display_name": "BMI",
              "sequence_number": "5",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-24 15:30:22",
              "created_date": null,
              "patValue": "114.800"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "vitals": [
            {
              "id": "2761",
              "doctor_id": "2883",
              "col_name": "height",
              "display_name": "height",
              "sequence_number": "1",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": null,
              "modified_date": null,
              "created_date": null,
              "patValue": "164"
            },
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "52"
            },
            {
              "id": "2763",
              "doctor_id": "2883",
              "col_name": "BpMin",
              "display_name": "Diastolic",
              "sequence_number": "4",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2018-12-19 17:41:43",
              "created_date": null,
              "patValue": "120"
            },
            {
              "id": "2760",
              "doctor_id": "2883",
              "col_name": "BMI",
              "display_name": "BMI",
              "sequence_number": "5",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-24 15:30:22",
              "created_date": null,
              "patValue": "85.280"
            },
            {
              "id": "2764",
              "doctor_id": "2883",
              "col_name": "BpMax",
              "display_name": "Systolic",
              "sequence_number": "6",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2018-12-19 17:42:02",
              "created_date": null,
              "patValue": "120"
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "vitals": [
            {
              "id": "2764",
              "doctor_id": "2883",
              "col_name": "BpMax",
              "display_name": "Systolic",
              "sequence_number": "6",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2018-12-19 17:42:02",
              "created_date": null,
              "patValue": "60"
            }
          ]
        },
        {
          "doctorName": "Abha Gupta",
          "vitals": [
            {
              "id": "2761",
              "doctor_id": "2883",
              "col_name": "height",
              "display_name": "height",
              "sequence_number": "1",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": null,
              "modified_date": null,
              "created_date": null,
              "patValue": "164"
            },
            {
              "id": "2762",
              "doctor_id": "2883",
              "col_name": "Weight",
              "display_name": "Weight",
              "sequence_number": "2",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "1",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-22 14:44:05",
              "created_date": null,
              "patValue": "70"
            },
            {
              "id": "2760",
              "doctor_id": "2883",
              "col_name": "BMI",
              "display_name": "BMI",
              "sequence_number": "5",
              "prefix": null,
              "suffix": null,
              "col_type": "text",
              "enabled": "1",
              "print_on_prescription": "1",
              "display_on_dashboard": "1",
              "is_decimal": "0",
              "clubbed_with": null,
              "created_by": null,
              "modified_by": "2883",
              "modified_date": "2019-04-24 15:30:22",
              "created_date": null,
              "patValue": "114.800"
            }
          ]
        }
      ]
    }
  ];

  allergyData = [
    {
      "0": [
        {
          "doctorName": "Anirudh Kulkarni",
          "allergies": [
            {
              "allergyType": "1",
              "allergy_name": "Food Allergy",
              "remarks": "Banana",
              "medicine": "",
              "opd_date": "2019-09-15"
            },
            {
              "allergyType": "0",
              "allergy_name": null,
              "remarks": "YES",
              "medicine": "",
              "opd_date": "2019-09-15"
            }
          ]
        },
        {
          "doctorName": "Reena Bisht",
          "allergies": [
            {
              "allergyType": "1",
              "allergy_name": "Food Allergy",
              "remarks": "Banana",
              "medicine": "",
              "opd_date": "2019-09-12"
            },
            {
              "allergyType": "0",
              "allergy_name": null,
              "remarks": "YES",
              "medicine": "",
              "opd_date": "2019-09-12"
            }
          ]
        },
        {
          "doctorName": "Suman Gupta",
          "allergies": [
            {
              "allergyType": "1",
              "allergy_name": "Food Allergy",
              "remarks": "Banana",
              "medicine": "",
              "opd_date": "2019-09-12"
            },
            {
              "allergyType": "0",
              "allergy_name": null,
              "remarks": "YES",
              "medicine": "",
              "opd_date": "2019-09-12"
            }
          ]
        }
      ]
    },
    {
      "1": [
        {
          "doctorName": "Charan Singh",
          "allergies": [
            {
              "allergyType": "1",
              "allergy_name": "Food Allergy",
              "remarks": "Banana",
              "medicine": "",
              "opd_date": "2019-09-15"
            },
            {
              "allergyType": "0",
              "allergy_name": null,
              "remarks": "YES",
              "medicine": "",
              "opd_date": "2019-09-15"
            }
          ]
        },
        {
          "doctorName": "Naresh Bisht",
          "allergies": [
            {
              "allergyType": "1",
              "allergy_name": "Food Allergy",
              "remarks": "Banana",
              "medicine": "",
              "opd_date": "2019-09-12"
            },
            {
              "allergyType": "0",
              "allergy_name": null,
              "remarks": "YES",
              "medicine": "",
              "opd_date": "2019-09-12"
            }
          ]
        },
        {
          "doctorName": "Reena Gupta",
          "allergies": [
            {
              "allergyType": "1",
              "allergy_name": "Food Allergy",
              "remarks": "Banana",
              "medicine": "",
              "opd_date": "2019-09-12"
            },
            {
              "allergyType": "0",
              "allergy_name": null,
              "remarks": "YES",
              "medicine": "",
              "opd_date": "2019-09-12"
            }
          ]
        }
      ]
    }
  ];

  constructor(
    private http: HttpClient,
    private publicService: PublicService,
    private consultationService: ConsultationService
  ) { }

  setValueByKey(key, data) {
    if (this.icuTempData.patientId == this.consultationService.getPatientObj('patientId')) {
      this.icuTempData[key] = data;
    } else {
      this.resetData();
      this.icuTempData.patientId = this.consultationService.getPatientObj('patientId');
      this.icuTempData[key] = data;
    }
  }

  resetData() {
    this.icuTempData.patientId = null;
    this.icuTempData.bslValues = null;
    this.icuTempData.diabeticFormData = null;
    this.icuTempData.sofaScore = null;
    this.icuTempData.pupilSize = null;
    this.icuTempData.painScale = null;
    this.icuTempData.assessmentChart = [];
    //this.icuTempData.vitalsSheetData = [];
  }

  getValueByKey(key) {
    if (this.icuTempData.patientId == this.consultationService.getPatientObj('patientId')) {
      return this.icuTempData[key];
    } else {
      this.resetData();
      return null;
    }
  }

  getVitalsSheetData(): Observable<any> {
    const reqUrl = environment.STATIC_JSON_URL + 'vitals_sheet_details.json';
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        this.icuTempData.vitalsSheetData = res;
        return this.icuTempData.vitalsSheetData;
      })
    );
  }

  setVitalsSheetData(obj) {
    this.icuTempData.vitalsSheetData = obj;
  }

  createHoursList12HourFormat(minute?) {
    const items = [];
    for (let hour = 0; hour < 24; hour++) {
      items.push(moment({ hour }).format('h:mm A'));
      if (minute) {
        items.push(moment({ hour, minute: 30 }).format('h:mm A'));
      }
    }
    return items;
  }

  getInsulinReportData() {
    const obj = {
      totalInsulin: 0,
      rapidActing: 0,
      longActing: 0,
      maxBSL: 0,
      minBSL: 0,
    };
    if (this.icuTempData.diabeticFormData && this.icuTempData.diabeticFormData['diabeticData']) {
      obj.totalInsulin = _.sumBy(this.icuTempData.diabeticFormData['diabeticData'], 'insLvl');
      obj.rapidActing = _.sumBy(this.icuTempData.diabeticFormData['diabeticData'], (v) => {
        return v.insTyp.name == 'rapid_acting';
      });
      obj.longActing = _.sumBy(this.icuTempData.diabeticFormData['diabeticData'], (v) => {
        return v.insTyp.name == 'long_acting';
      });
      obj.maxBSL = _.maxBy(this.icuTempData.diabeticFormData['diabeticData'], 'bsl').bsl;
      obj.minBSL = _.minBy(this.icuTempData.diabeticFormData['diabeticData'], 'bsl').bsl;
    }
    return obj;
  }
}

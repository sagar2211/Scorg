import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FootExaminationService {
  public footPartConst = [
    {
      body_part : 'Left_1st Toe Pulp',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Left_3rd Toe Pulp',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Left_5th Toe Pulp',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Left_1st Plantar MPJ',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Left_3rd Plantar MPJ',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Left_5th Plantar MPJ',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Left_Plantar Medial Arch',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },  {
      body_part : 'Left_Plantar Lateral Midfoot',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Left_Plantar Central Heel',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Left_1st Dorsal Webspace',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'left_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_1st Toe Pulp',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_3rd Toe Pulp',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_5th Toe Pulp',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_1st Plantar MPJ',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_3rd Plantar MPJ',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_5th Plantar MPJ',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_Plantar Medial Arch',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },  {
      body_part : 'Right_Plantar Lateral Midfoot',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_Plantar Central Heel',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
    {
      body_part : 'Right_1st Dorsal Webspace',
      pain_score: 'no',
      svg_type: 'footExamine',
      svg_name: 'right_footFlag',
      comment: ''
    },
  ];

  public footPart = [];

  OnUpdatePainScore: Subject<any> = new Subject();
  OnDeletePainPart: Subject<any> = new Subject();
  constructor() { }

  creatEmptyChartInstance(chartDetailId) {
    const index = _.findIndex(this.footPart, (o) => o.chart_detail_id === chartDetailId);
    if (index === -1) {
      this.footPartConst.forEach(element => {
        const tempObj = _.cloneDeep(element);
        tempObj.chart_detail_id = chartDetailId;
        this.footPart.push(tempObj);
      });
    }
  }

  getData(chartDetailId) {
    return _.filter(this.footPart, (o) => o.chart_detail_id === chartDetailId);
  }

  getFlag(chartDetailId) {
    const flag = this.footPart.filter(element => element.pain_score !== 'no' && element.chart_detail_id === chartDetailId);
    if (flag.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  updatePainScore(data) {
    const index = this.footPart.findIndex(element => element.body_part === data.body_part && element.chart_detail_id === data.chart_detail_id);
    this.footPart[index].pain_score = data.pain_score;
    this.footPart[index]['chart_detail_id'] = data.chart_detail_id;
    // this.getDataByGroup();
    this.OnUpdatePainScore.next(data);
  }

  deletePainScore(data) {
    const index = this.footPart.findIndex(element => element.body_part === data.body_part && element.chart_detail_id === data.chart_detail_id);
    this.footPart[index].pain_score = 'no';
    this.footPart[index].comment = '';
    this.OnUpdatePainScore.next(data);
    this.OnDeletePainPart.next();
  }

  deleteAll(partSide) {
    this.footPart.forEach(element => {
      if (element.svg_name === partSide) {
        element.pain_score = 'no';
        element.comment = '';
      }
    });

    this.OnUpdatePainScore.next();
    this.OnDeletePainPart.next();
  }

  updateComment(data) {
    // console.log(data);
    const index = this.footPart.findIndex(element => element.body_part === data.body_part && element.chart_detail_id === data.chart_detail_id);
    this.footPart[index].comment = data.comment;
    this.OnUpdatePainScore.next();
  }

  getDataByGroup(chartDetailId) {
    const filterData =  _.filter(this.footPart, (o) => o.chart_detail_id === chartDetailId);
    const selectedPart = _.reject(filterData, { pain_score: 'no' });
    const selectedSides = _.groupBy(selectedPart, 'svg_name');
    _.forEach(selectedSides, (value, key) => {
      selectedSides[key] = _.groupBy(selectedSides[key], 'pain_score');
    });
    return selectedSides;
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { UsersService } from 'src/app/public/services/users.service';
import * as _ from "lodash";
import { Constants } from 'src/app/config/constants';
import { RowHeightCache } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-case-paper-validity',
  templateUrl: './case-paper-validity.component.html',
  styleUrls: ['./case-paper-validity.component.scss']
})
export class CasePaperValidityComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  designationList: any;
  alertMsg: IAlert;
  casePaperList: any;
  casePaperListColne: any;
  designationId: any;
  editorOptions: object;
  searchString: any;

  constructor(
    private userService : UsersService
  ) { }

  ngOnInit(): void {
    this.loadcasePaperList();
  }

  loadcasePaperList(){
    this.userService.getCasePaperFollowupByDesignationId().subscribe((response)=>{
      if(response.length > 0){
        _.map(response,itr=>{
          if(!itr.followupDays){
            itr.followupDays = 0;
          }
        })
        this.casePaperList = response;
        this.casePaperListColne = _.cloneDeep(this.casePaperList);
      } else {
        this.casePaperList = null;
      }
    })
  }

  getRowNumber(dataGrid, data) {
    let missedRowsNumber = dataGrid.instance.getController('data').virtualItemsCount().begin;
    return data.row.rowIndex + missedRowsNumber + 1;
  }

  onEditorPreparing(evt){
    evt.editorOptions.onValueChanged = (e: any) => {
      if (evt.dataField == 'casePaperValidity') {
        if(evt.row && evt.row.data && evt.row.data.followupDays !== 0 && evt.row.data.followupDays < e.value){
          this.casePaperList[evt.row.rowIndex].casePaperValidity = e.value = this.casePaperListColne[evt.row.rowIndex].casePaperValidity;
          this.alertMsg = {
            message: 'Case paper validity must be less than followup days.',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      } else if (evt.dataField == 'followupDays') {
        if(evt.row && evt.row.data && evt.row.data.followupDays !== 0 && e.value < evt.row.data.casePaperValidity){
          this.casePaperList[evt.row.rowIndex].followupDays = e.value = 0;
          this.alertMsg = {
            message: 'Followup days must be gretter than case paper validity.',
            messageType: 'danger',
            duration: Constants.ALERT_DURATION
          };
        }
      }
      evt.setValue(e.value);
    }
     
  } 

  saveCasepaper(){
    let finalArray = []
    this.dataGrid.instance.saveEditData();
    _.map(this.casePaperListColne, (itr,indx)=>{
      _.map(this.casePaperList, (itr1,indx1)=>{
        if(indx === indx1){
          let compareObject = _.isEqual( itr, itr1);
          if(!compareObject){
            itr1.followupDays = +itr1.followupDays;
            finalArray.push(itr1);
          }
        }
      })
    })
    this.userService.saveCasePaperValidityAndFollowup(finalArray).subscribe((response)=>{
      if (response.status_message === 'Success' && response.status_code === 200) {
        this.alertMsg = {
          message: 'Case Paper Saved Successfully',
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
      } else {
        this.alertMsg = {
          message: 'Something Went Wrong.',
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    })
  } 
}

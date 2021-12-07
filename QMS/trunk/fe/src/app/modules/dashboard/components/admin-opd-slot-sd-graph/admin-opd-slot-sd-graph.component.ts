import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../../services/dashboard.service';
import { IAlert } from 'src/app/models/AlertMessage';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-admin-opd-slot-sd-graph',
  templateUrl: './admin-opd-slot-sd-graph.component.html',
  styleUrls: ['./admin-opd-slot-sd-graph.component.scss']
})
export class AdminOpdSlotSdGraphComponent implements OnInit {
  opdSlotsDetails:any;
  alertMsg: IAlert;
  chartData:ChartDataSets[] = [{
    label: null,
    data: []
  }];
  color:Color[] = [
    {
      borderColor: '#11cdef',
      backgroundColor: '#11cdef',
    }
  ]
  labels:Label[]=[]
  chartOptions:ChartOptions = {
  }
  constructor(private dashboardService:DashBoardService) { }

  ngOnInit() {
    this.getOpdSlotDetails();
  }

  getOpdSlotDetails(){
    this.dashboardService.getOpdSlotDetails().subscribe(response=>{
      if(response!=null){
        this.opdSlotsDetails = response;
        this.chartOptions = {
          responsive:true,
          legend:{
            display:true
          },
          tooltips:{
            backgroundColor:'white',
              titleFontColor:'black',
              bodyFontColor:'black',
              borderColor:'#11cdef',
              borderWidth:0.5,
              custom:function(tooltip){
                  tooltip.displayColors = false;
              },
            callbacks:{
              title:function(){
                return null;
              },
              beforeLabel : function(tooltipItem,data){
                return 'Doctor : '+ response[tooltipItem.index].DoctorCount
              },
              label: function (tooltipItem, data) {
                return 'Service Provider : '+ response[tooltipItem.index].ServiceProviderCount ;
              },
              afterLabel : function(tooltipItem,data){
                return  'Joint Clinic : ' + response[tooltipItem.index].JointClinicCount;
              }
            }
          },
          scales: {
            xAxes:[
             {
              scaleLabel: {
                display: true,
                labelString: 'Occupancy Percentage'
              },
              gridLines:{
                display:false
              }
             }
            ],
            yAxes:[
              {
               scaleLabel: {
                 display: true,
                 labelString: 'Provider Count'
               },
               gridLines:{
                display:false
              }
              }
             ]
          }
        }
        this.opdSlotsDetails.forEach(slot => {
          this.labels.push(slot.Percentage)
          this.chartData[0].data.push(slot.EntityCount)
      });
      } else {
        this.alertMsg = {
          message: response,
          messageType: 'success',
          duration: 3000
        };
      }
    })
  }

}

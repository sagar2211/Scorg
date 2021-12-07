import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/public/services/order.service';
import * as _ from 'lodash';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { UsersService } from 'src/app/public/services/users.service';
import * as moment from 'moment';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-orders-list-partial',
  templateUrl: './orders-list-partial.component.html',
  styleUrls: ['./orders-list-partial.component.scss']
})
export class OrdersListPartialComponent implements OnInit {
  // @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @ViewChild(DatatableComponent, { static: false })
  public table: DatatableComponent;
  patientId: any;
  encounterId: string;
  orderList: any;
  token: string;
  isPartialLoad: boolean;
  searchString;
  orderListClone: any;
  
  constructor(
    private orderService: OrderService,
    private activatedRoute : ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private userService: UsersService,
    private permissionsService: NgxPermissionsService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((response)=>{
      this.patientId = response.get('patientId');
      this.encounterId = response.get('encounterId');
      this.token = response.get('token');
      const param = {
        uhid : this.patientId,
        encounterId : this.encounterId
      }
      if(this.token){
        this.isPartialLoad = true;
        this.loginThroghSSO(this.token).then(res1 => {
          this.getAllOrdersList(param);
        });
      }
      
    });
    
  }

  loginThroghSSO(token) {
    const promise = new Promise((resolve, reject) => {
      this.authService.loginThroghSSO(token).subscribe(res => {
        if (res.status_message === 'Success') {
          const userObject = res.data;
          // store login info to local storage
          this.authService.storeLoginInfo(userObject);
          this.assignRoleAndRedirect(userObject);
          resolve(true);
        } else if (res) {
          resolve(false);
        }
      });
    });
    return promise;
  }

  assignRoleAndRedirect(userObject): void {
    this.userService.GetAssignedRolePermissionsByUserId(userObject.id)
      .subscribe((result) => {
        const userPermission = this.userService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
      });
  }

  getAllOrdersList(param) {
    this.orderService.getOrderList(param).subscribe((response)=>{
      _.map(response,itr=>{
        itr.orderDate = moment(itr.orderDate).format('DD-MM-YYYY');
        itr.orderByDoctor = itr.orderBy.user_name
      })

      const doctorWiseList = _.groupBy(response, 'orderByDoctor');
      
      const orderData = [];
      _.map(doctorWiseList, (doctorVal, doctorKey) => {
        var doctorObj = { doctorName: doctorKey, doctorData: [] };
        var orderTypeGrp = _.groupBy(doctorVal, 'orderType');
        console.log(orderTypeGrp)
        _.map(orderTypeGrp, (orderTypeVal, orderTypeKey) => {
          var obj1 = {
            orderTypeName: orderTypeKey,
            orderTypeData: orderTypeVal
          }
          doctorObj.doctorData.push(obj1);
        });
        orderData.push(doctorObj);
      })

      
      this.orderList = orderData;
      this.orderListClone = _.clone(this.orderList);
    })
  }

  showSearchFilter(){
    
    // this.orderListClone.clone(this.orderList);
    if(this.searchString){
      this.orderList = _.filter(this.orderList,itr=>{
        let string = itr.doctorName;
        return string.toLowerCase().includes(this.searchString.toLowerCase());
      })
      console.log(this.orderList)
    } else {
      return this.orderList = this.orderListClone;
    }
  }

  clearSearchFilter(){
    this.searchString = null;
    this.orderList = this.orderListClone;
  }

  onCheckboxChange(evt){
    console.log(evt)
  }

  onSubmit(){

  }

}

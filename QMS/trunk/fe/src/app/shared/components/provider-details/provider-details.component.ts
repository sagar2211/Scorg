import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import * as _ from 'lodash';
import { CommonService } from 'src/app/services/common.service';
import { Provider } from '../../models/provider';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-provider-details',
  templateUrl: './provider-details.component.html',
  styleUrls: ['./provider-details.component.scss']
})
export class ProviderDetailsComponent implements OnInit {

  providerDetails: Array<Provider> = [];
  selectedProvider: Provider = null;
  @Output() currentEntity: EventEmitter<any> = new EventEmitter();
  @Input() public selectedUserFromFrontDeskToList: any;
  @Input() public isFromFrontDesk = false;
  @Input() public frontDeskProviderList: any = [];
  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private userService: UsersService
  ) {
  }

  ngOnInit() {

    if (!_.isUndefined(this.route.snapshot.queryParams.entity_id)) {

      const objproviderDetails = {providerId: null, providerValueId: null, providerTypeName: null,  providerType: null, providerName: null};
      objproviderDetails.providerId = + this.route.snapshot.queryParams.entity_id;
      objproviderDetails.providerValueId = + this.route.snapshot.queryParams.provider_id;
      objproviderDetails.providerName = this.route.snapshot.queryParams.providerName;
      objproviderDetails.providerTypeName = this.route.snapshot.queryParams.providerTypeName;
      // this.providerDetails = [];
      // this.providerDetails.push(objproviderDetails);
      const entityId = + this.route.snapshot.queryParams.entity_id;
      const entityValueId = + this.route.snapshot.queryParams.provider_id;

      this.getProviderDetails(entityId, entityValueId).subscribe(res => {

        this.currentEntity.emit(this.selectedProvider);
      });
      // this.currentEntity.emit(this.selectedProvider);
    } else if (this.isFromFrontDesk) {
      if (this.frontDeskProviderList.length) {
          this.providerDetails = this.frontDeskProviderList;
          this.selectedProvider = _.find(this.providerDetails, { providerValueId: this.selectedUserFromFrontDeskToList.providerValueId });
          this.currentEntity.emit(this.selectedProvider);
        // this.changeProvider(this.selectedProvider);
          this.commonService.setCurrentSelectedProvider(this.selectedProvider);
      } else {
        this.getProviderDetails(this.selectedUserFromFrontDeskToList.providerId, this.selectedUserFromFrontDeskToList.providerValueId).subscribe(res => {
          // if (!res) {
          //   this.selectedProvider = this.selectedUserFromFrontDeskToList;
          // }
          // this.commonService.setCurrentSelectedProvider(this.selectedProvider);
          // this.currentEntity.emit(this.selectedProvider);
        });
      }
    } else {
      const userInfo = this.authService.getUserInfoFromLocalStorage();
      this.providerDetails = userInfo.provider_info;
      const selectedProviderFromService: Provider = this.commonService.getCurrentSelectedProvider();
      if (selectedProviderFromService) {
        this.selectedProvider = _.find(this.providerDetails, (o) =>  o.providerValueId === selectedProviderFromService.providerValueId && o.providerType === selectedProviderFromService.providerType);
        // _.find(this.providerDetails, { providerValueId: selectedProviderFromService.providerValueId });
      } else {
        this.selectedProvider = _.find(this.providerDetails, (o) =>  o.providerValueId === userInfo.user_id && o.providerType === userInfo.role_type);
        this.commonService.setCurrentSelectedProvider(this.selectedProvider);
      }
      this.currentEntity.emit(this.selectedProvider);
    }

  }

  getProviderDetails(eId: number, evId: number): Observable<any> {
    return this.userService.getProviderDetailsByEntity(eId, evId).pipe(map(res => {
      if (res.length > 0) {
        this.providerDetails = res;
      } else {
        this.providerDetails.push(this.selectedUserFromFrontDeskToList);
      }
      const provider = this.commonService.getCurrentSelectedProvider();
      if (provider) {
        this.selectedProvider = provider;
      } else {
        this.selectedProvider = _.find(this.providerDetails, { providerValueId: evId });
      }
      this.currentEntity.emit(this.selectedProvider);
    }));
  }
  changeProvider(provider) {
      this.selectedProvider = provider;
      this.commonService.setCurrentSelectedProvider(this.selectedProvider);
      this.currentEntity.emit(this.selectedProvider);
  }
}

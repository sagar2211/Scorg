import { Component, OnInit } from '@angular/core';
import { MappingService } from '../public/services/mapping.service';
import { environment } from "../../environments/environment";
import { AuthService } from "../public/services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxPermissionsService } from 'ngx-permissions';
import { SideMenuService } from '../public/services/sidemenu.service';
import { CommonService } from '../public/services/common.service';

@Component({
  selector: 'app-nursing-station-selection',
  templateUrl: './nursing-station-selection.component.html',
  styleUrls: ['./nursing-station-selection.component.scss']
})
export class NursingStationSelectionComponent implements OnInit {

  userId: number;
  storesArray: Array<any> = [];
  selectedNursingStation: { nursingStationId: number, nursingStationName: string };
  loginLogUrl: string;

  constructor(
    private mappingService: MappingService,
    private authService: AuthService,
    private permissionsService: NgxPermissionsService,
    private sideMenuService: SideMenuService,
    private commonService: CommonService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loginLogUrl = environment.LoginLogoUrl + 'hospital-logo.png';
    this.userId = this.authService.getLoggedInUserId();
    this.GetUserStoreMappingByUserId();
  }

  GetUserStoreMappingByUserId(): void {
    this.mappingService.getNusringStationMappingByUserId(this.userId).subscribe(res => {
      if (res) {
        this.storesArray = res;
      }
      if (this.storesArray.length === 1) {
        this.selectedNursingStation = this.storesArray[0]
        this.authService.setNursingStationDetails(this.selectedNursingStation);
        this.router.navigate(['/nursingApp']);
      }
      if (!this.storesArray.length) {
        this.router.navigate(['/noNursingStation']);
      }
    });
  }

  onSubmit(): void {
    if (this.selectedNursingStation) {
      this.authService.setNursingStationDetails(this.selectedNursingStation);
      this.commonService.GetAssignedRolePermissionsByUserId_Promise(this.userId).then(res => {
        const userPermission = this.commonService.userPermission;
        this.permissionsService.loadPermissions(userPermission);
        const userInfo = this.authService.getUserDetails();
        const key = this.authService.getActiveAppKey();
        const loginFor = 'NURSING';
        const nursingStationId = this.authService.getNursingStationId();
        this.sideMenuService.redirectTo(userPermission, userInfo, key, loginFor, nursingStationId);
      });

    }
  }
}


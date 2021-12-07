import { Component, OnInit } from '@angular/core';
import { MappingService } from '../public/services/mapping.service';
import { environment } from "../../environments/environment";
import { AuthService } from "../public/services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SideMenuService } from '../public/services/sidemenu.service';
import { UsersService } from '../public/services/users.service';

@Component({
  selector: 'app-store-selection',
  templateUrl: './store-selection.component.html',
  styleUrls: ['./store-selection.component.scss']
})
export class StoreSelectionComponent implements OnInit {
  userId: number;
  storesArray: Array<any> = [];
  selectedStore: { storeId: number, storeName: string };
  loginLogUrl: string;

  constructor(
    private mappingService: MappingService,
    private authService: AuthService,
    private router: Router,
    private sideMenuService: SideMenuService,
    private userService: UsersService,
  ) { }

  ngOnInit(): void {
    this.loginLogUrl = environment.LoginLogoUrl + 'hospital-logo.png';
    this.userId = this.authService.getLoggedInUserId();
    this.GetUserStoreMappingByUserId();
  }

  GetUserStoreMappingByUserId(): void {
    this.mappingService.GetUserStoreMappingByUserId(this.userId).subscribe(res => {
      if (res) {
        this.storesArray = res;
      }
      if (!this.storesArray.length) {
        this.router.navigate(['/noStore']);
      }
    });
  }

  onSubmit(): void {
    if (this.selectedStore) {
      console.log(this.userService);
      console.log(this.userService.userPermission);
      this.authService.setStoreDetails(this.selectedStore);
      const userPermissions = this.userService && this.userService.userPermission ? [...this.userService.userPermission] : [];
      const userInfo = this.authService.getUserInfoFromLocalStorage();
      this.sideMenuService.redirectToApp(userPermissions, userInfo);
    }
  }
}

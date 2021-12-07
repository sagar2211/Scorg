import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../public/services/auth.service';
import { CommonService } from '../public/services/common.service';
import { Constants } from '../config/constants';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { PermissionsConstants } from "../config/PermissionsConstants";

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit, OnDestroy {
  @Input() showMenuType;

  sideBarArray = [];
  userInfo: any;
  settingKey = '';
  favouriteMenusList: Array<any> = [];
  showHideMenu: boolean;
  destroy$ = new Subject<any>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkCurrentActive();
      }
    });
  }

  ngOnInit(): void {
    this.showHideMenu = false;
    this.settingKey = Constants.DEFAULT_LANDING_PAGE;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.updateSideMenuList();
    this.queueSetting();
    this.subcriptionOfEvents();
    this.checkCurrentActive();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  checkCurrentActive(): void {
    const spiltCoutnt = 1;
    const isAnyParentActive = !!(_.find(this.sideBarArray, (o) => o.isActive === true));
    const splitUrl = this.router.url.split('/')[this.router.url.split('/').length - spiltCoutnt];
    _.map(this.sideBarArray, (v) => {
      v.isActive = (isAnyParentActive) ? v.isActive : false;
      _.map(v.children, (child) => {
        const localKey = child.linkKey.split('/')[child.linkKey.split('/').length - 1];
        if (splitUrl === localKey) {
          child.isActive = true;
          v.isActive = (isAnyParentActive) ? v.isActive : true;
        } else {
          child.isActive = false;
        }
      });
    });
  }

  updateParentActive(index): void {
    _.map(this.sideBarArray, (v) => {
      v.isActive = false;
    });
    this.sideBarArray[index].isActive = true;
    this.showHideMenu = !this.showHideMenu;
    this.commonService.showHideMainMenuReverse(this.showHideMenu);
  }

  saveFavourite(parentItem, childItem, $event): void {
    $event.stopPropagation();
    parentItem.children.forEach(c => {
      c.isFavourite = false;
    });
    childItem.isFavourite = true;
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentItem.linkKey && f.masterModule === 'emr');
    if (indx !== -1) {
      this.favouriteMenusList[indx].favouriteRouteUrl = childItem.linkKey;
    } else {
      this.favouriteMenusList.push({
        masterModule: 'inventory',
        parentMenu: parentItem.linkKey,
        favouriteRouteUrl: childItem.linkKey
      });
    }
    this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(this.favouriteMenusList), this.userInfo.user_id).subscribe();
  }

  onMenuClick(parentUrl): void {
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentUrl.linkKey && f.masterModule === 'qms');
    // check user has permission or not of fav. menu
    if (indx !== -1) {
      const userPermissions = [...this.commonService.userPermission];
      const menuList = _.find(this.sideBarArray, (o) => {
        return o.linkKey === this.favouriteMenusList[indx].parentMenu;
      });
      const subMenu = menuList ? _.find(menuList.children, (o) => {
        return this.favouriteMenusList[indx].favouriteRouteUrl.endsWith(o.linkKey);
      }) : undefined;
      if (subMenu) {
        const permission = _.find(userPermissions, (o) => {
          return o === subMenu.permission;
        });
        if (permission) {
          this.router.navigate([this.favouriteMenusList[indx].favouriteRouteUrl]);
        }
      } else {
        this.router.navigate([this.favouriteMenusList[indx].favouriteRouteUrl]);
      }
      this.showHideMenu = !this.showHideMenu;
      this.commonService.showHideMainMenuReverse(this.showHideMenu);
    }
  }

  subcriptionOfEvents(): void {
    this.commonService.$menushowHide.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.showHideMenu = !this.showHideMenu;
    });
  }

  queueSetting(): void {
    this.commonService.getQueueSettings(this.settingKey, this.userInfo.user_id).subscribe(res => {
      if (res) {
        this.favouriteMenusList = res;
        this.favouriteMenusList.forEach((fav: any) => {
          const i = this.sideBarArray.findIndex(r => r.linkKey === fav.parentMenu && fav.masterModule === 'inventory');
          if (i !== -1) {
            this.sideBarArray[i].children.forEach(e => {
              const childKey = fav.favouriteRouteUrl.split('/')[fav.favouriteRouteUrl.split('/').length - 1];
              const localKey = e.linkKey.split('/')[e.linkKey.split('/').length - 1];
              if (localKey === childKey) {
                e.isFavourite = true;
              } else {
                e.isFavourite = false;
              }
            });
          } else {

          }
        });
      }
    });
  }

  updateSideMenuList(): void {
    this.sideBarArray = [
      {
        linkKey: '',
        name: 'Home',
        isActive: false,
        cssClass: 'icon-home',
        children: [
          {
            linkKey: 'dashboard/admin',
            name: 'Admin Dashboard',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-queue-setting',
            isVisible: true,
          },
          {
            linkKey: 'dashboard/nurse',
            name: 'Nurse Dashboard',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-queue-setting',
            isVisible: true,
          },
          {
            linkKey: 'dashboard/doctor',
            name: 'Doctor Dashboard',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-user-md',
            isVisible: true,
            permission: PermissionsConstants.VIEW_DASHBOARD
          }
        ]
      },
      {
        linkKey: '',
        name: 'Master',
        isActive: false,
        cssClass: 'icon-masters',
        children: [
          {
            linkKey: 'masters/suppliers/list',
            name: 'Suppliers',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-supplier',
            isVisible: true,
            permission: PermissionsConstants.VIEW_SUPPLIER
          },
          {
            linkKey: 'masters/groups/primaryGroup',
            name: 'Primary Group',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-primary-group',
            isVisible: true,
            permission: PermissionsConstants.VIEW_PRIMARY_GROUP
          },
          {
            linkKey: 'masters/groups/subGroup',
            name: 'Sub Group',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-sub-group',
            isVisible: true,
            permission: PermissionsConstants.VIEW_SUB_GROUP
          },
          {
            linkKey: 'masters/item/itemType',
            name: 'Item Type',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-list',
            isVisible: true,
            permission: PermissionsConstants.VIEW_ITEM_TYPE
          },
          {
            linkKey: 'masters/item/itemMaster',
            name: 'Item Master',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-clipboard-list-check',
            isVisible: true,
            permission: PermissionsConstants.VIEW_ITEM_MASTER
          },
          {
            linkKey: 'masters/manufacture/manufacturer',
            name: 'Manufacturer Master',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-manufacturer-master',
            isVisible: true,
            permission: PermissionsConstants.VIEW_MANUFACTURER
          },
          {
            linkKey: 'masters/store/storeMaster',
            name: 'Store Master',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-store-master',
            isVisible: true,
            permission: PermissionsConstants.VIEW_STORE_MASTER
          },
          {
            linkKey: 'masters/tax/taxMaster',
            name: 'Tax Master',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-tax-master',
            isVisible: true,
            permission: PermissionsConstants.VIEW_TAX_MASTER
          },
          {
            linkKey: 'masters/store/userStoreMapping',
            name: 'User Store Mapping',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-link',
            isVisible: true,
            permission: PermissionsConstants.VIEW_USER_STORE_MAPPING
          }
        ]
      },
      {
        linkKey: '',
        name: 'Purchase',
        isActive: false,
        cssClass: 'icon-transactions',
        children: [
          {
            linkKey: 'transactions/purchaseOrders',
            name: 'Purchase Orders List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-purchase-orders',
            isVisible: true,
            permission: PermissionsConstants.VIEW_PURCHASE_ORDER
          },
          {
            linkKey: 'transactions/purchaseRecieptList',
            name: 'GRN List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-grn',
            isVisible: true,
            permission: PermissionsConstants.VIEW_GRN
          },
          {
            linkKey: 'transactions/purchaseReturnList',
            name: 'GDN List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-gdn',
            isVisible: true,
            permission: PermissionsConstants.VIEW_GDN
          },
          {
            linkKey: 'transactions/purchaseInvoiceList',
            name: 'Purchase Invoice List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-purchase-invoice-list',
            isVisible: true,
            permission: PermissionsConstants.VIEW_PURCHASE_INVOICE
          },
        ]
      },
      {
        linkKey: 'indent',
        name: 'Indent',
        isActive: false,
        cssClass: 'icon-indent',
        children: [
          {
            linkKey: 'indent/materialIndentList',
            name: 'Material Indent',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-indent',
            isVisible: true,
            permission: PermissionsConstants.VIEW_MATERIAL_INDENT
          }
        ]
      },
      {
        linkKey: 'issue',
        name: 'Issue',
        isActive: false,
        cssClass: 'icon-issue',
        children: [
          {
            linkKey: 'issue/summeryIndent',
            name: 'Material Indent Summary',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-indent',
            isVisible: true,
            permission: PermissionsConstants.VIEW_INDEND_ISSUE
          },
          {
            linkKey: 'issue/consumption/storeConsumptionSummary',
            name: 'Store Consumption Summary',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-store-consumption-summary',
            isVisible: true,
            permission: PermissionsConstants.VIEW_STORE_CONSUMPTION
          },
          {
            linkKey: 'issue/consumption/storeConsumption/-1',
            name: 'Store Consumption',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-store-consumption-summary',
            isVisible: true,
            permission: PermissionsConstants.ADD_STORE_CONSUMPTION
          },
          {
            linkKey: 'issue/patient/consumptionSummary',
            name: 'Patient Issue Summary',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-store-consumption-summary',
            isVisible: true,
            permission: PermissionsConstants.VIEW_STORE_CONSUMPTION
          },
          {
            linkKey: 'issue/patient/consumption/-1',
            name: 'Patient Issue',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-store-consumption-summary',
            isVisible: true,
            permission: PermissionsConstants.ADD_STORE_CONSUMPTION
          },
          {
            linkKey: 'issue/summeryIssue',
            name: 'Material Issue Summary',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-material-issue-summary',
            isVisible: true,
            permission: PermissionsConstants.VIEW_ISSUE_SUMMARY
          },
          {
            linkKey: 'issue/issueAcceptanceList',
            name: 'Issue Acceptance List',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-issue-acceptance-list',
            isVisible: true,
            permission: PermissionsConstants.VIEW_ISSUE_ACCEPTANCE
          }
        ]
      },
      {
        linkKey: 'reports',
        name: 'Reports',
        isActive: false,
        cssClass: 'icon-reports',
        children: [
          {
            linkKey: 'reports/',
            name: 'GRN Report',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-reports',
            isVisible: true,
            children: [
              {
                linkKey: 'reports/grnDateWise',
                name: 'GRN Date Wise Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
                permission: PermissionsConstants.VIEW_GRN_DATEWISE_REPORT
              },
              {
                linkKey: 'reports/grnItemWise',
                name: 'GRN Item Wise Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
                permission: PermissionsConstants.VIEW_GRN_ITEMWISE_REPORT
              },
            ]
          },
          {
            linkKey: 'reports/',
            name: 'GDN Report',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-reports',
            isVisible: true,
            children: [
              {
                linkKey: 'reports/gdnDateWise',
                name: 'GDN Date Wise Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
              },
              {
                linkKey: 'reports/gdnItemWise',
                name: 'GDN Item Wise Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
              },
            ]
          },
          {
            linkKey: 'reports/',
            name: 'Issue',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-reports',
            isVisible: true,
            children: [
              {
                linkKey: 'reports/issue',
                name: 'Issue Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
              },
              {
                linkKey: 'reports/issueItemWIse',
                name: 'Issue Item wise Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
              },
            ]
          },
          {
            linkKey: 'reports/issueReturn',
            name: 'Issue Return Report',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-reports',
            isVisible: true,
            children: []
          },
          {
            linkKey: 'reports/',
            name: 'Stock',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-reports',
            isVisible: true,
            children: [
              {
                linkKey: 'reports/stockReorder',
                name: 'Stock Reorder Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
              },
              {
                linkKey: 'reports/stockExpDate',
                name: 'Stock Expiry Date Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
              },
              {
                linkKey: 'reports/stock',
                name: 'Stock Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
              },
              {
                linkKey: 'reports/openingStock',
                name: 'Opening Stock Report',
                isActive: false,
                isFavourite: false,
                cssClass: 'icon-reports',
                isVisible: true,
              },
            ]
          },
          {
            linkKey: 'reports/itemLedger',
            name: 'Item ledger Report',
            isActive: false,
            isFavourite: false,
            cssClass: 'icon-reports',
            isVisible: true,
            children: []
          },
        ]
      },
    ];
  }
}

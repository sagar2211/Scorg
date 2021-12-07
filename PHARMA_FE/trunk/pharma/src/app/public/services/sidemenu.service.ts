
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {

  constructor(
    private router: Router,
  ) { }

  sideMenuList = [
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
        },
        {
          linkKey: 'masters/kit/itemKitList',
          name: 'Kit List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-link',
          isVisible: true,
          permission: PermissionsConstants.VIEW_USER_STORE_MAPPING
        },
        {
          linkKey: 'masters/generic/genericNameList',
          name: 'Generic Name List',
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
          linkKey: 'transactions/po/purchaseOrders',
          name: 'Purchase Orders List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-purchase-orders',
          isVisible: true,
          permission: PermissionsConstants.VIEW_PURCHASE_ORDER
        },
        {
          linkKey: 'transactions/po/addPurchaseOrder',
          name: 'Add Purchase Order',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-purchase-orders',
          isVisible: true,
          permission: PermissionsConstants.VIEW_PURCHASE_ORDER
        },
        {
          linkKey: 'transactions/grn/purchaseRecieptList',
          name: 'GRN List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-grn',
          isVisible: true,
          permission: PermissionsConstants.VIEW_GRN
        },
        {
          linkKey: 'transactions/grn/purchaseRecieptAdd/-1',
          name: 'Add GRN',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-grn',
          isVisible: true,
          permission: PermissionsConstants.VIEW_GRN
        },
        {
          linkKey: 'transactions/gdn/purchaseReturnList',
          name: 'GDN List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-gdn',
          isVisible: true,
          permission: PermissionsConstants.VIEW_GDN
        },
        {
          linkKey: 'transactions/gdn/addUpdatePurchaseReturns/-1',
          name: 'Add GDN',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-gdn',
          isVisible: true,
          permission: PermissionsConstants.ADD_GDN
        },
        {
          linkKey: 'transactions/purchaseInvoice/purchaseInvoiceList',
          name: 'Purchase Invoice List',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-purchase-invoice-list',
          isVisible: true,
          permission: PermissionsConstants.VIEW_PURCHASE_INVOICE
        },
        {
          linkKey: 'transactions/purchaseInvoice/purchaseInvoiceAddUpdate/-1',
          name: 'Purchase Invoice Add',
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
          linkKey: 'indent/materialIndent/materialIndentList',
          name: 'Material Indent',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-indent',
          isVisible: true,
          permission: PermissionsConstants.VIEW_MATERIAL_INDENT
        },
        {
          linkKey: 'indent/materialIndent/addMaterialIndent',
          name: 'Add Material Indent',
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
          linkKey: 'issue/summeryIndent/summeryIndent',
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
          linkKey: 'issue/patient/consumptionSummary/consumptionsummary',
          name: 'Patient Issue Summary',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-store-consumption-summary',
          isVisible: true,
          permission: PermissionsConstants.VIEW_STORE_CONSUMPTION
        },
        // {
        //   linkKey: 'issue/patient/consumption/-1',
        //   name: 'Patient Issue',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-store-consumption-summary',
        //   isVisible: true,
        //   permission: PermissionsConstants.ADD_STORE_CONSUMPTION
        // },
        // {
        //   linkKey: 'issue/patient/countersale',
        //   name: 'Counter Sale',
        //   isActive: false,
        //   isFavourite: false,
        //   cssClass: 'icon-store-consumption-summary',
        //   isVisible: true,
        //   permission: PermissionsConstants.ADD_STORE_CONSUMPTION
        // },
        {
          linkKey: 'issue/patient/allsale/-1',
          name: 'Sale',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-store-consumption-summary',
          isVisible: true,
          permission: PermissionsConstants.ADD_STORE_CONSUMPTION
        },
        {
          linkKey: 'issue/sale/salereturn',
          name: 'Sale Return',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-store-consumption-summary',
          isVisible: true,
          permission: PermissionsConstants.ADD_STORE_CONSUMPTION
        },
        {
          linkKey: 'issue/issueList/summeryIssue',
          name: 'Material Issue Summary',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-material-issue-summary',
          isVisible: true,
          permission: PermissionsConstants.VIEW_ISSUE_SUMMARY
        },
        {
          linkKey: 'issue/issueList/issueAcceptanceList',
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
              linkKey: 'reports/grnSchedule/grnDateWise',
              name: 'GRN Date Wise Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
              permission: PermissionsConstants.VIEW_GRN_DATEWISE_REPORT
            },
            {
              linkKey: 'reports/grnSchedule/grnItemWise',
              name: 'GRN Item Wise Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
              permission: PermissionsConstants.VIEW_GRN_ITEMWISE_REPORT
            }
          ]
        },
        {
          linkKey: 'reports/prescription/prescription',
          name: 'Prescription Detail',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-reports',
          isVisible: true,
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
              linkKey: 'reports/gdnReport/gdnDateWise',
              name: 'GDN Date Wise Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
            },
            {
              linkKey: 'reports/gdnReport/gdnItemWise',
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
              linkKey: 'reports/issueReport/issue',
              name: 'Issue Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
            },
            {
              linkKey: 'reports/issueReport/issueItemWIse',
              name: 'Issue Item wise Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
            },
            {
              linkKey: 'reports/issueReport/issueReturn',
              name: 'Issue Return Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
              children: []
            }
          ]
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
              linkKey: 'reports/stockReport/stockReorder',
              name: 'Stock Reorder Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
            },
            {
              linkKey: 'reports/stockReport/stockExpDate',
              name: 'Stock Expiry Date Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
            },
            {
              linkKey: 'reports/stockReport/stock',
              name: 'Stock Report',
              isActive: false,
              isFavourite: false,
              cssClass: 'icon-reports',
              isVisible: true,
            },
            {
              linkKey: 'reports/stockReport/openingStock',
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
    // Add code by SB
    {
      linkKey: 'stock',
      name: 'Stock',
      isActive: false,
      cssClass: 'icon-reports',
      children: [
        {
          linkKey: 'stock/stock-info',
          name: 'Stock Detail',
          isActive: false,
          isFavourite: false,
          cssClass: 'icon-reports',
          isVisible: true
        }
      ]
    },
  ];

  redirectToApp(userPermissions, userInfo): void {
    //   const userPermissions = [...this.userService.userPermission];
    // const userInfo = this.authService.getUserInfoFromLocalStorage();
    const appData = _.find(userInfo.assigenedApplication, d => {
      return d.app_key === 'PHARMACY';
    });
    if (appData && appData.primary_permission && _.find(userPermissions, (o) => o === appData.primary_permission.name)) {
      const check = this.redirecToLanding(appData.primary_permission.name);
      if (check.link && check.redirect) {
        this.router.navigate(['/inventory/' + check.link]);
      } else {
        this.router.navigate(['/inventory/welcome']);
      }
    } else {
      this.router.navigate(['/inventory/welcome']);
    }
  }

  redirecToLanding(permissionName) {
    const menuList = this.sideMenuList;
    let obj = {
      link: null,
      redirect: false
    }
    let loopRun = true;
    _.map(menuList, (main, mi) => {
      _.map(main.children, (child, ci) => {
        if (child.permission && child.permission === permissionName && loopRun) {
          loopRun = false;
          obj.redirect = true;
          obj.link = child.linkKey;
        }
      })
    });
    return obj;
  }
}

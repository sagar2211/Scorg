import { Directive, AfterViewInit, ElementRef, OnInit, Input, Renderer2, SimpleChanges, OnChanges } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import {PermissionsConstants} from '../../config/PermissionsConstants';
import * as _ from 'lodash';


@Directive({
  selector: '[appShowHideElementOnPermission]'
})
export class ShowHideElementOnPermissionDirective implements OnInit, OnChanges {
  @Input() currentActiveUrl: string;
  @Input() typeOfButton: string;
  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit(): void{
    this.isPermisionExist();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentActiveUrl) {
      this.isPermisionExist();
    }
  }
  isPermisionExist(): void{
    if (this.currentActiveUrl === 'manufacturer') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_MANUFACTURER));
    } else if (this.currentActiveUrl === 'purchaseRecieptList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_GRN));
    } else if (this.currentActiveUrl === 'issueAcceptanceList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_ISSUE_ACCEPTANCE));
    } else if (this.currentActiveUrl === 'itemMaster') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_ITEM_MASTER));
    } else if (this.currentActiveUrl === 'itemType') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_ITEM_TYPE));
    } else if (this.currentActiveUrl === 'materialIndentList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_MATERIAL_INDENT));
    } else if (this.currentActiveUrl === 'primaryGroup') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_PRIMARY_GROUP));
    } else if (this.currentActiveUrl === 'purchaseInvoiceList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_PURCHASE_INVOICE));
    } else if (this.currentActiveUrl === 'purchaseOrders') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_PURCHASE_ORDER));
    } else if (this.currentActiveUrl === 'storeConsumptionSummary') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_STORE_CONSUMPTION));
    } else if (this.currentActiveUrl === 'storeMaster') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_STORE_MASTER));
    } else if (this.currentActiveUrl === 'subGroup') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_SUB_GROUP));
    } else if (this.currentActiveUrl === 'suppliers') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_SUPPLIER));
    } else if (this.currentActiveUrl === 'taxMaster') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_TAX_MASTER));
    } else if (this.currentActiveUrl === 'userStoreMapping') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_USER_STORE_MAPPING));
    } else if (this.currentActiveUrl === 'summeryIndent') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_INDENT_ISSUE));
    } else if (this.currentActiveUrl === 'purchaseReturnList') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_GDN));
    } else if (this.currentActiveUrl === 'itemSupplierTaxMaster') {
      this.AddRemoveElementStyle(this.ngxPermissionsService.getPermission(PermissionsConstants.ADD_ITEM_SUPPLIER_TAX_MASTER));
    }
  }
  AddRemoveElementStyle(permissions): void{
    this.element.nativeElement.style.display = permissions && permissions.name ? 'inline-block' : 'none';
  }
}

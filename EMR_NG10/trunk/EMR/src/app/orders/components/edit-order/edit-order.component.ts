import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { OrderService } from '../../../public/services/order.service';
import * as _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ComponentsService } from './../../../public/services/components.service';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditOrderComponent implements OnInit, AfterViewInit {
  selectedComponentRef: any;
  displayFormContainer: any;
  @Input() editObj: any;
  @Input() isFromOrderSetEdit: boolean;
  @ViewChild('displayEditForm', {static: false, read: ViewContainerRef }) editFormContent: ViewContainerRef;
  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _orderService: OrderService,
    public activeModal: NgbActiveModal,
    public _componentsService: ComponentsService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.loadSelectedFormForEdit(this.editObj.selectedCompForEdit, this.editObj.editData);
  }
  loadSelectedFormForEdit(selectedCom, editData): void {
    const viewContainerRef = this.editFormContent;
    viewContainerRef.clear();
    // compList.forEach(item => {
    if (selectedCom.component === undefined ) {
      selectedCom.component = this._componentsService.getComponentDetailsByKey(this.editObj.editData.key)['component']; // -- to get component instance
    }
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(selectedCom.component);
    const componentRef = viewContainerRef.createComponent(componentFactory);

    // getting the component's HTML
    const element: HTMLElement = <HTMLElement>componentRef.location.nativeElement;

    // adding styles
    element.classList.add('custom-form');

    this.selectedComponentRef = componentRef;
    // componentRef.instance['activeIds'] = this.activeOrderPanels;
    componentRef.instance['showAddSection'] = true;
    componentRef.instance['activeModal'] = this.activeModal;
    componentRef.instance['orderCatId'] = selectedCom.orderId;
    componentRef.instance['isFromOrderSetEdit'] = this.isFromOrderSetEdit;
    // componentRef.instance['_publicService'].componentSectionClicked({
    //   sectionKeyName: selectedCom.orderKey
    // });
    componentRef.instance['editData'] = editData;
    // console.log(' is popover open');
    // popOver.open();
  }
}

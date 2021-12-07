import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayQueueTemplate1Component } from './components/display-queue-template1/display-queue-template1.component';
import { DisplayQueueTemplate2Component } from './components/display-queue-template2/display-queue-template2.component';
import { DisplayQueueTemplate3Component } from './components/display-queue-template3/display-queue-template3.component';
import { DisplayQueueTemplate4Component } from './components/display-queue-template4/display-queue-template4.component';
import { DisplayQueueTemplate5Component } from './components/display-queue-template5/display-queue-template5.component';
import { DisplayQueueTemplate6Component } from './components/display-queue-template6/display-queue-template6.component';
import { DisplayQueueTemplate7Component } from './components/display-queue-template7/display-queue-template7.component';
import { DisplayQueueTemplate8Component } from './components/display-queue-template8/display-queue-template8.component';
import { DisplayQueueTemplate9Component } from './components/display-queue-template9/display-queue-template9.component';
import { QueueDisplayListComponent } from './components/queue-display-list/queue-display-list.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    // -- dispaly module
    DisplayQueueTemplate1Component,
    DisplayQueueTemplate2Component,
    DisplayQueueTemplate3Component,
    DisplayQueueTemplate4Component,
    DisplayQueueTemplate5Component,
    DisplayQueueTemplate6Component,
    DisplayQueueTemplate7Component,
    DisplayQueueTemplate8Component,
    DisplayQueueTemplate9Component,
    QueueDisplayListComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    DisplayQueueTemplate1Component,
    DisplayQueueTemplate2Component,
    DisplayQueueTemplate3Component,
    DisplayQueueTemplate4Component,
    DisplayQueueTemplate5Component,
    DisplayQueueTemplate6Component,
    DisplayQueueTemplate7Component,
    DisplayQueueTemplate8Component,
    DisplayQueueTemplate9Component,
    QueueDisplayListComponent
  ]
})
export class TemplateDisplayShareModule { }

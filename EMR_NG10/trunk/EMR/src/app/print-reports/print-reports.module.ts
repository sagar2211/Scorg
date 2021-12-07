import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PrintReportHomeComponent } from './print-report-home/print-report-home.component';
import { EmrSharedModule } from './../emr-shared/emr-shared.module';
import { SharedModule } from 'src/app/shared/shared.module';

const printRoutes: Routes = [{
    path: '/', component: PrintReportHomeComponent
}];

@NgModule({
    declarations: [PrintReportHomeComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(printRoutes),
        SharedModule,
        EmrSharedModule
    ],
    exports: [PrintReportHomeComponent]
})
export class PrintReportsModule { }

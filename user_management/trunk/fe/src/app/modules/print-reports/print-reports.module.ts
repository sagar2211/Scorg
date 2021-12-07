
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PrintReportHomeComponent } from './print-report-home/print-report-home.component';

const printRoutes: Routes = [{
    path: '', component: PrintReportHomeComponent
}];

@NgModule({
    declarations: [PrintReportHomeComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(printRoutes),
        SharedModule,
    ],
    exports: [PrintReportHomeComponent]
})
export class PrintReportsModule { }

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { DynamicChartComponent } from './dynamic-chart/dynamic-chart.component';
import { EmrSharedModule } from './../emr-shared/emr-shared.module';
import { ChartSuggestionPanelComponent } from './chart-suggestion-panel/chart-suggestion-panel.component';
import { DynamicChartService } from './dynamic-chart.service';
import { DeactivateGuard } from '../guards/deactivate.guard';
import { AutoSaveConfirmationComponent } from './auto-save-confirmation/auto-save-confirmation.component';
import { ChartOrderSetDisplayComponent } from './chart-order-set-display/chart-order-set-display.component';
import { AddOrderSetOfChartComponent } from './add-order-set-of-chart/add-order-set-of-chart.component';
import { PrintReportsModule } from './../print-reports/print-reports.module';
import { EMRService } from './../public/services/emr-service';
import { ChartLatestHistoryComponent } from './chart-latest-history/chart-latest-history.component';

@NgModule({
    declarations: [
        DynamicChartComponent,
        ChartSuggestionPanelComponent,
        AutoSaveConfirmationComponent,
        ChartOrderSetDisplayComponent,
        AddOrderSetOfChartComponent,
        ChartLatestHistoryComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        EmrSharedModule,
        ReactiveFormsModule,
        FormsModule,
        PrintReportsModule,
        RouterModule.forChild([
            { path: '', component: DynamicChartComponent, canDeactivate: [DeactivateGuard] }]
        )],
    entryComponents: [AutoSaveConfirmationComponent, AddOrderSetOfChartComponent],
    providers: [
        DynamicChartService,
        DeactivateGuard,
        EMRService
    ]
})
export class DynamicChartModule { }

import { IfluidReportOptionNameList } from './ifluid-report-option-name-list.model';

export class IFluidChartDefaultRow {
  intakeTime: Date;
  intakeIvFluidName: IfluidReportOptionNameList;
  intakeIvFluidQty: number;
  intakeRtFeedName: IfluidReportOptionNameList;
  intakeRtFeedQty: number;
  outputRTQty: number;
  outputUrineQty: number;
  outputDrainQty: number;
  fluidBal: number;
}

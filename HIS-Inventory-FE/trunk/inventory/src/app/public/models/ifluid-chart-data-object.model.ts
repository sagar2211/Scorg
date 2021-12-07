import { IFluidChartDefaultRow } from './fluid-chart-default-row.model';

export class IfluidChartDataObject {
  chartDate: Date;
  isExpanded: boolean;
  chartData: IFluidChartDefaultRow[];
  intakeIivFluidQtyTotal: number;
  intakeRtFeedQtyTotal: number;
  intakeTotal: number;
  outputRTQtyTotal: number;
  outputUrineQtyTotal: number;
  outputDrainQtyTotal: number;
  outputTotal: number;
  outputFluidBalTotal: number;
}

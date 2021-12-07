export class ChartData {
  chartId: number;
  serviceTypeId: number;
  patientId: number;
  visitNo: string;
  userId: number;
  visitDetailId?: number;
  chartData?: any;

  generateObject(obj: any) {
    this.chartId = obj.patient_chart_id || obj.chartId || null;
    this.serviceTypeId = obj.service_type_id || obj.serviceTypeId || null;
    this.patientId = obj.patient_id || obj.patientId || null;
    this.visitNo = obj.visit_no || obj.visitNo || null;
    this.userId = obj.doctor_id || obj.userId || null;
    this.visitDetailId = obj.visit_detail_id || obj.visitDetailId || 0;
    this.chartData = obj.chart_data || obj.chartData || null;
  }
}

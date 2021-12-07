export class VisitType {
  visitId: number;
  visitName: string;


  generateObject(obj: any) {
      this.visitId = obj.visit_id;
      this.visitName = obj.visit_name;
  }
}

export class Doctors {
  name: string;
  id: number;

  generateObj(obj: any) {
      this.name = obj.doctor_name;
      this.id = obj.doctor_id;
  }
}

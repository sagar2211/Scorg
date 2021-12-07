import { MappedDoctor } from './mapped-doctor';

export class DoctorMapping {
    'id': number;
    'doctorName': string;
    'doctorId': number;
    'mappingListDetails': MappedDoctor[];
    generateObject(obj: any) {
        this.id = obj.id ? obj.id : '';
        this.doctorId = obj.user_id ? obj.user_id : '';
        this.doctorName = obj.user_name;
        this.mappingListDetails = this.getMappedDoctorDetails(obj.mapped_user);
    }
    getMappedDoctorDetails(mappobj: any) {
        const mappedDoctorModel = new MappedDoctor();
        const mappedDocList: Array<MappedDoctor> = [];
        mappobj.forEach((o, index) => { // check if object is valid. If valid generate.
          mappedDoctorModel.generateMappedObject(o);
          mappedDocList.push(Object.assign({}, mappedDoctorModel));
        });
        return mappedDocList;
      }
}

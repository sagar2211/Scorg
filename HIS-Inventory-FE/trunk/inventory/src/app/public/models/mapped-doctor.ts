export class MappedDoctor {
    'mappedId': number;
    'mapdoctorId': number;
    'mapdoctorName': string;
    'fromDate': Date;
    'toDate': Date;
    'isActive': boolean;
    'isExpiry': boolean;

    generateMappedObject(obj: any) {
        this.mappedId = obj.mapped_id,
        this.mapdoctorId = obj.mapped_user_id ;
        this.mapdoctorName = obj.mapped_user_name;
        this.fromDate = obj.mapping_from_date;
        this.toDate = obj.mapping_to_date;
        this.isActive = obj.is_active;
        this.isExpiry = false;
    }
}

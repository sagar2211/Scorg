export class IcomplaintsMasterList {
    id: number;
    name: string;
    // doc_id: number;
    // is_favourite: boolean;
    // use_count: number;

    isObjectValid(obj: any) {
        return (obj.hasOwnProperty('id')
            && obj.hasOwnProperty('complaintName'));
    }

    generateObject(obj: any) {
        this.id = obj.id.toString();
        this.name = obj.complaintName;
    }
}

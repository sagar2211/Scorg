export class PatientDetails {
    id: String;
    name: String;
    salutaion?: String;
    age?: String;
    dob?: Date;
    gender?: String;
    email?: String;
    phone?: number;
    photo?: String;
    death_date?: Date;
    is_dead?: String;
    hospital_pat_id?: String;
    aadhaar_number?: String;
    area_name?: String;
    blood_group?: String;
    blood_group_name?: String;
    city_id?: String;
    city_name?: String;
    state_name?: String;
    country_name?: String;
    relation?: String;
    referred_doctor_id?: String;
    firstName: String;
    lastName: String;

    isObjectValid(obj: any) {
        return obj.hasOwnProperty('id') ? obj.hasOwnProperty('patient_name') ? true : false : false;
    }
    generateObject(obj: any) {
        this.id = obj.id ? obj.id : null;
        this.name = obj.patient_name ? obj.patient_name : null;
        this.salutaion = obj.salutaion ? obj.salutaion : null;
        this.age = obj.patient_age != undefined ? obj.patient_age : obj.age;
        this.dob = obj.patient_dob ? obj.patient_dob : null;
        this.gender = obj.patient_gender ? obj.patient_gender : null;
        this.email = obj.patient_email ? obj.patient_email : null;
        this.phone = obj.patient_phon ? obj.patient_phon : null;
        this.photo = obj.profile_photo ? obj.profile_photo : null;
        this.death_date = obj.death_date ? obj.death_date : null;
        this.is_dead = obj.is_dead ? obj.is_dead : null;
        this.hospital_pat_id = obj.hospital_pat_id ? obj.hospital_pat_id : null;
        this.aadhaar_number = obj.aadhaar_number ? obj.aadhaar_number : null;
        this.area_name = obj.area_name ? obj.area_name : null;
        this.blood_group = obj.blood_group ? obj.blood_group : null;
        this.blood_group_name = obj.blood_group_name ? obj.blood_group_name : null;
        this.city_id = obj.city_id ? obj.city_id : null;
        this.city_name = obj.city_name ? obj.city_name : null;
        this.state_name = obj.state_name ? obj.state_name : null;
        this.country_name = obj.country_name ? obj.country_name : null;
        this.relation = obj.relation ? obj.relation : null;
        this.referred_doctor_id = obj.referred_doctor_id ? obj.referred_doctor_id : null;
        this.firstName = obj.patient_fname ? obj.patient_fname : null;
        this.lastName = obj.patient_lname ? obj.patient_lname : null;
    }
}

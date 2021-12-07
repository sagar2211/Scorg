export interface GetAppointmentSlot {
    entity_id: number;
    entity_value_id: number;
    appointment_type_id: number;
    service_id: number;
    date: any; // MM/dd/yyyy format required
    start_time: string; // (put  null if don’t want to specify it)
    end_time?: string; // (put  null if don’t want to specify it)
    Only_non_walkin_timeslots?: boolean; // (default false - returns all time slots)
}

export interface GetAppointmentListByEntity {
    entity_id: number;
    entity_value_id: number;
    speciality_id?: number;
    service_id?: number;
    appointment_type_id: number;
    date: any; // MM/dd/yyyy format required
    start_time?: string; // It will treat always >=. It is optional,
    end_time?: string; // optional.
}

export interface UpdateAppointmentQueue {
    queue_main_id: number;
    status_id: number;
    cater_room_id: number;
    mark_as_skip?: boolean;
    next_patient_queueid?: number;
}



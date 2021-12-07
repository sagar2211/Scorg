import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EntitityDummyDataService {

  constructor() { }

  entityDataArray = [
    {
      id: 1,
      name: 'Service Provider',
      key: 'service_provider'
    },
    {
      id: 2,
      name: 'Doctor',
      key: 'doctor'
    },
    {
      id: 3,
      name: 'Joint Clinic',
      key: 'joint_clinic'
    }
  ];

  serviceProviderListArray = [
    {
      id: 1,
      name: 'Lab 1'
    },
    {
      id: 2,
      name: 'Lab 2',
    },
    {
      id: 3,
      name: 'Lab 3'
    },
    {
      id: 4,
      name: 'Lab 4'
    }
  ];

  doctorListArray = [
    {
      id: 1,
      name: 'Doctor 1'
    },
    {
      id: 2,
      name: 'Doctor 2',
    },
    {
      id: 3,
      name: 'Doctor 3'
    },
    {
      id: 4,
      name: 'Doctor 4'
    }
  ];
  doctorListArrayForJointClinic = [
    {
      id: 10,
      name: 'Doctor 10'
    },
    {
      id: 11,
      name: 'Doctor 11',
    }
  ];

  jointClinicListArray = [
    {
      id: 1,
      name: 'Joint Clinic 1'
    },
    {
      id: 2,
      name: 'Joint Clinic 2',
    },
    {
      id: 3,
      name: 'Joint Clinic 3'
    },
    {
      id: 4,
      name: 'Joint Clinic 4'
    }
  ];

  appointmentTypeListArray = [
    {
      id: 1,
      name: 'Appointment type 1'
    },
    {
      id: 2,
      name: 'Appointment type 2',
    },
    {
      id: 3,
      name: 'Appointment type 3'
    },
    {
      id: 4,
      name: 'Appointment type 4'
    }
  ];

  serviceListArray = [
    {
      id: 1,
      name: 'Service 1',
      timeSlot: 12,
      maxNum: null
    },
    {
      id: 2,
      name: 'Service 2',
      timeSlot: 12,
      maxNum: null
    },
    {
      id: 3,
      name: 'Service 3',
      timeSlot: 12,
      maxNum: null
    },
    {
      id: 4,
      name: 'Service 4',
      timeSlot: 12,
      maxNum: null
    }
  ];

  scheduleTypeArray = [
    {
      id: 1,
      name: 'flexible'
    },
    {
      id: 2,
      name: 'Sequential',
    },
    {
      id: 3,
      name: 'Fixed'
    }
  ];

  specialityArray = [
    {
      id: 1,
      name: 'speciality 1',
    },
    {
      id: 2,
      name: 'speciality 2'
    },
    {
      id: 3,
      name: 'speciality 3'
    }
  ];
  activeSchedulesArray = [
    {
      scheduleId: 1,
      entity: {
        id: 1,
        name: 'doctor'
      },
      provider: {
        id: 1,
        name: 'Amit Shah'
      },
      activeSchedule: {
        startDate: "2019-08-01",
        endDate: "2019-08-30",
      },
      workingDays: ['Mon', 'Tue', 'Wed']
    },
    {
      scheduleId: 2,
      entity: {
        id: 1,
        name: 'doctor'
      },
      provider: {
        id: 1,
        name: 'Moni Ladda'
      },
      activeSchedule: {
        startDate: "2019-08-01",
        endDate: "2019-08-31",
      },
      workingDays: ['Mon', 'Tue', 'Sat']
    },
    {
      scheduleId: 2,
      entity: {
        id: 1,
        name: 'Service Provider'
      },
      provider: {
        id: 1,
        name: 'Service Name'
      },
      activeSchedule: {
        startDate: "2019-08-01",
        endDate: "2019-08-31",
      },
      workingDays: ['Wed', 'Tue', 'Sat']
    },
  ];

  tokenBookingExistingData = {
    scheduleType: {
      id: 2,
      name: 'Sequential',
    },
    tokenValue: "qwe",
    parallelBookingAllow: true,
    parallelBookingValue: 10,
    advanceBookingDays: 120,
    timePerPatient: 10,
    appointmentTimeSlot: 12
  };

  getEntityDataArray() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.entityDataArray
    };
  }

  getServiceProviderListArray() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.serviceProviderListArray
    };
  }

  getDoctorListArray() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.doctorListArray
    };
  }

  getJointClinicListArray() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.jointClinicListArray
    };
  }

  getAppointmentTypeListArray() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.appointmentTypeListArray
    };
  }

  getServiceListArray() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.serviceListArray
    };
  }

  saveJointClinic() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
    };
  }

  getSelectJointClinicDoctorsList() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.doctorListArrayForJointClinic
    };
  }

  getScheduleTypeList() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.scheduleTypeArray
    };
  }

  getSpecialityListData() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.specialityArray
    };
  }

  getTimeFormatKey() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: '12_hour'
    };
  }

  getActiveSchedulesArray() {
    return {
      status_code: 200,
      status_message: "Success",
      message: "Success",
      data: this.activeSchedulesArray
    };
  }

}

export class ApppointmentSuccessModel {
  id: string;
  tokenNo: string;
  message: string;
  isBooked: boolean;
  appointmentStatus: string;
  appointmentDisplayStatus: string;
  bookingStatusId: number;
  queueId: number;
  tokenType: string;

  generateObject(obj) {
    this.id = obj.id;
    this.tokenNo = obj.token_no;
    this.message = obj.message;
    this.isBooked = obj.is_booked;
    this.appointmentStatus = obj.appt_status;
    this.appointmentDisplayStatus = obj.appt_displayname;
    this.bookingStatusId = obj.booking_status_id;
    this.queueId = obj.queue_id;
    this.tokenType = obj.token_type;
  }

}

export class SliderlogDetails {
  'logtitile': string;
  'subtitle': string;
  'logDetailsList': Array<GroupLogDetailsModel>;
}

export class GroupLogDetailsModel {
  'groupDate': string;
  'groupLogDetails': Array<LogDetailsModel>;
}

export class LogDetailsModel {
  'date': string;
  'description': string;
  'action': string;
  'actionDispalyName': string;
  'time': string;
  'updatedBy': string;
  'updatedFor': string;
}

import * as _ from 'lodash';
import { State } from './state.model';
import { City } from './city.model';
import {Country} from "./country.model";

export class Supplier {
  id: number;
  name: string;
  address: string;
  state: State;
  city: City;
  phone: string;
  email: string;
  contactPerson: string;
  contactPersonMobile: string;
  gstRegNo: string;
  gstCode: string;
  registrationNo: string;
  isActive: boolean;
  country: Country;

  isObjectValid(obj: any) {
    return (obj.hasOwnProperty('supplierId') || obj.hasOwnProperty('id'))
      && (obj.hasOwnProperty('supplierName') || obj.hasOwnProperty('name')) ? true : false;
  }

  generateObject(obj: any) {
    this.id = obj.supplierId || obj.id;
    this.name = obj.supplierName || obj.name;
    this.address = obj.address || null;
    this.state = this.generateStateObject(obj);
    this.city = this.generateCityObject(obj);
    this.country = this.generateCountryObject(obj);
    this.phone = obj.phone || null;
    this.email = obj.email || null;
    this.contactPerson = obj.contactPerson || null;
    this.contactPersonMobile = obj.contactPersonMobile || null;
    this.gstRegNo = obj.gstRegNo || null;
    this.gstCode = obj.gstCode || null;
    this.registrationNo = obj.registrationNo || null;
    this.isActive = obj.isActive || null;
  }

  generateStateObject(val) {
    const obj = {
      id: val.stateId,
      name: val.stateName
    };
    const mg = new State();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }

  generateCityObject(val) {
    const obj = {
      id: val.cityId,
      name: val.city
    };
    const mg = new City();
    if (mg.isObjectValid(obj)) {
      mg.generateObject(obj);
    }
    return mg;
  }

  generateCountryObject(val) {
    const obj = {
      id: val.countryId || val.id,
      name: val.countryName || val.name
    };
    const mg = new Country();
    mg.generateObject(obj);
    return mg;
  }

}

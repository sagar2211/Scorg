import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Supplier } from '../modals/supplier.model';
import { MainGroup } from '../modals/maingroup.model';
import { SubGroup } from '../modals/subgroup.model';
import { ItemType } from '../modals/itemtype.model';
import { Country } from '../modals/country.model';
import { City } from '../modals/city.model';
import { state } from '@angular/animations';
import { State } from '../modals/state.model';
import { Store } from '../modals/store.model';
import { Manufacturer } from '../modals/manufacturer.model';
import { ItemMaster } from '../modals/itemmaster.model';
import { GstCode } from '../modals/gstcode';
import { Unit } from '../modals/unit.model';
import { ItemClass } from '../modals/itemclass.model';
import { Delivery } from '../../transactions/modals/delivery.model';
import { PaymentTerm } from '../../transactions/modals/paymentterm.model';
import { AuthService } from 'src/app/public/services/auth.service';
import { Constants } from 'src/app/config/constants';
import { itemCategory } from '../modals/itemcategory';

@Injectable({
  providedIn: 'root'
})
export class MastersService {
  httpOptions: any;
  gstCodeListArray = [];
  unitMasterListArray = [];
  itemClass = [];
  deliveryMasterlist = [];
  payTermMasterList = [];
  taxListData = [];
  accountTypeList = [{
    id: 1,
    name: 'Debtor'
  },
  {
    id: 2,
    name: 'Company'
  }];

  openAddAccountPopup: Subject<object> = new Subject();
  public $subOpenAddAccountPopup = this.openAddAccountPopup.asObservable();

  openPatientAttachePopup: Subject<object> = new Subject();
  public $subOpenPatientAttachePopup = this.openPatientAttachePopup.asObservable();

  updatePaymentRelatedData: Subject<object> = new Subject();
  public $subUpdatePaymentRelatedData = this.updatePaymentRelatedData.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    const token = JSON.parse(localStorage.getItem('globals'));
    this.httpOptions = {
      headers: new HttpHeaders({
        "authorization": token.auth_token
      })
    };
  }

  openAccountPopup(data) {
    this.openAddAccountPopup.next(data);
  }

  openAccountPatientPopup(data) {
    this.openPatientAttachePopup.next(data);
  }

  updatePaymentAndInforRelatedData(data) {
    this.updatePaymentRelatedData.next(data);
  }

  getSupplierList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Supplier/GetSupplierList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const supp = new Supplier();
            if (supp.isObjectValid(val)) {
              supp.generateObject(val);
              data.push(supp);
            }
          });
          return { data: data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  saveSupplierMaster(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Supplier/SaveSupplier';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res;
        } else {
          return res;
        }
      })
    );
  }

  getSupplierDataByID(supplierID): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Supplier/GetSupplierDataByID?SupplierID=${supplierID}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteSupplierById(supplierID): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Supplier/DeleteSupplierById?SupplierID=${supplierID}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  getSupplierBySearchKeyword(param?, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param,
        limit: 50
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/Supplier/GetSupplierBySearchKeyword';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new Supplier();
            val.stateName = val.state;
            val.stateId = 0;
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getPrimaryGroupMasterList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Master/GetPrimaryGroupMasterList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new MainGroup();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return { data: data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getMainGroupDataByID(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/GetGroupDataByID?groupId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteMainGroupDataById(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/DeleteMasterGroupById?groupId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  saveMainGroupMaster(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Master/SaveGroupMaster';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return res.data;
        }
      })
    );
  }

  getGroupBySearchKeyword(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/Master/GetGroupBySearchKeyword';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new MainGroup();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getSubGroupMasterList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Master/GetSubGroupList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new SubGroup();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return { data: data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getSubGroupDataByID(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/GetSubGroupDataByID?subGroupId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteSubGroupDataById(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/DeleteSubGroupDataById?subGroupId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  saveSubGroupMaster(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Master/SaveSubGroupMaster';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return res.data;
        }
      })
    );
  }

  getSubGroupBySearchKeyword(param, pgId): Observable<any> {
    let paramObj = null;
    if (!_.isUndefined(pgId)) {
      paramObj = {
        searchKeyword: param,
        primaryGroupId: pgId ? pgId : null
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/Master/GetSubgroupBySearchKeyword';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new SubGroup();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getItemTypeList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/GetItemTypeList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new ItemType();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return { data: data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getItemTypeDataByID(supplierID): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Item/GetItemTypeDataByID?itemTypeId=${supplierID}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteItemTypeDataById(supplierID): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Item/DeleteItemTypeDataById?itemTypeId=${supplierID}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  saveItemTypeMaster(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/SaveItemTypeMaster';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return res.data;
        }
      })
    );
  }

  getCountryList(keyword): Observable<any> {
    const param = {
      search_text: keyword ? keyword : null,
      limit: 50
    };
    const reqUrl = environment.baseUrl + '/HisView/GetCountryData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new Country();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getCityList(keyword?, sttId?): Observable<any> {
    const param = {
      searchText: keyword ? keyword : null,
      limit: 50,
      stateId: sttId
    };
    const reqUrl = environment.baseUrl + '/HisView/GetCityData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new City();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getStateList(keyword?, cntrId?): Observable<any> {
    const param = {
      searchText: keyword ? keyword : null,
      limit: 50,
      countryId: cntrId
    };
    const reqUrl = environment.baseUrl + '/HisView/GetStateData';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new State();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getItemMasterList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/GetItemList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new ItemMaster();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return { data: data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getItemMasterDataByID(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Item/GetItemById?itemId=${id}`;
    return this.http.get(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  deleteItemMasterDataById(id): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Item/DeleteItemById?itemId=${id}`;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return res;
    }));
  }

  saveItemMasterData(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Item/SaveItem';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return res.data;
        }
      })
    );
  }

  getManufacturerList(params) {
    const reqUrl = environment.baseUrlPharma + '/Master/GetManufacturerList';
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const supp = new Manufacturer();
            if (supp.isObjectValid(val)) {
              supp.generateObject(val);
              data.push(supp);
            }
          });
          return { data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getTaxMasterList(params) {
    const reqUrl = environment.baseUrlPharma + '/Master/GetTaxMasterList';
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return { data: res.data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getStoreMasterList(params) {
    const reqUrl = environment.baseUrlPharma + '/Master/GetStoresMasterList';
    return this.http.post(reqUrl, params, this.httpOptions).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const store = new Store();
            if (store.isObjectValid(val)) {
              store.generateObject(val);
              data.push(store);
            }
          });
          return { data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }



  saveManufacturer(params) {
    const reqUrl = environment.baseUrlPharma + '/Master/SaveManufacturerMaster';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  saveTaxMaster(params) {
    const reqUrl = environment.baseUrlPharma + '/Master/SaveTaxMaster';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return res;
    }));
  }

  saveStoreMaster(params) {
    const reqUrl = environment.baseUrlPharma + '/Master/SaveStoreMaster';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  getGSTCodeList() {
    if (this.gstCodeListArray.length > 0) {
      return of(this.gstCodeListArray);
    } else {
      const reqUrl = environment.baseUrlPharma + '/Master/GetGSTCodeList';
      return this.http.post(reqUrl, null).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.data.length > 0) {
            const data = [];
            _.map(res.data, (val, key) => {
              const store = new GstCode();
              if (store.isObjectValid(val)) {
                store.generateObject(val);
                data.push(store);
              }
            });
            this.gstCodeListArray = data;
            return data;
          } else {
            return [];
          }
        })
      );
    }
  }

  getUnitMasterList() {
    if (this.unitMasterListArray.length > 0) {
      return of(this.unitMasterListArray);
    } else {
      const reqUrl = environment.baseUrlPharma + '/Master/GetUnitMasterList';
      return this.http.post(reqUrl, null).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.data.length > 0) {
            const data = [];
            _.map(res.data, (val, key) => {
              const store = new Unit();
              if (store.isObjectValid(val)) {
                store.generateObject(val);
                data.push(store);
              }
            });
            this.unitMasterListArray = data;
            return data;
          } else {
            return [];
          }
        })
      );
    }
  }

  getItemClassBySearchKeyword(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param
      };
    } else {
      paramObj = param;
    }
    if (this.itemClass.length > 0) {
      return of(this.itemClass);
    } else {
      const reqUrl = environment.baseUrlPharma + '/Item/GetItemClassBySearchKeyword';
      return this.http.post(reqUrl, paramObj).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.data.length > 0) {
            const data = [];
            _.map(res.data, (val, key) => {
              const mg = new ItemClass();
              if (mg.isObjectValid(val)) {
                mg.generateObject(val);
                data.push(mg);
              }
            });
            this.itemClass = res;
            return data;
          } else {
            return [];
          }
        })
      );
    }

  }

  getItemTypeBySearchKeyword(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/Item/GetItemTypeBySearchKeyword';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new ItemType();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getManufacturerBySearchKeyword(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/Master/GetManufacturerBySearchKeyword';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new Manufacturer();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }


  getcategoryBySearchKeyword(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param,
        sortOrder: 'asc',
        sortColumn: 'categoryName',
        pageNumber: 1,
        limit: 10,
        isActive: true
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/item/GetItemCategoryList';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          _.map(res.data, (val, key) => {
            const mg = new itemCategory();
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getGenericItemBySearchKeyword(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param,
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/item/GetGenericItemBySearchKeyword';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          const data = [];
          res.data.map(d => {
            const obj = {
              id: d.genericId,
              name: d.genericName
            };
            data.push({ ...obj });
          });
          return data;
        } else {
          return [];
        }
      })
    );
  }

  getScheduleDrugBySearchKeyword(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param,
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/item/GetScheduledDrugsTypesBySearchKeyword';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return res.data;
        } else {
          return null;
        }
      })
    );
  }

  getBrandListBySearchKeyword(param, isString?): Observable<any> {
    let paramObj = null;
    if (isString) {
      paramObj = {
        searchKeyword: param,
      };
    } else {
      paramObj = param;
    }
    const reqUrl = environment.baseUrlPharma + '/Master/GetBrandListBySearchKeyword';
    return this.http.post(reqUrl, paramObj).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          // const data = [];
          // res.data.map(d => {
          //   const obj = {
          //     id: d.genericId,
          //     name: d.genericName
          //   };
          //   data.push({ ...obj });
          // });
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  GetItemSupplierTaxList(params) {
    const reqUrl = environment.baseUrlPharma + '/Supplier/GetItemSupplierTaxList';
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return { data: res.data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getSupplierById(supplierId) {
    const reqUrl = environment.baseUrlPharma + `/Supplier/GetSupplierDataById?supplierId=${supplierId}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return {};
        }
      })
    );
  }

  getGstCodeList() {
    const reqUrl = environment.baseUrlPharma + `/Master/GetGSTCodeList`;
    return this.http.post(reqUrl, {}).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  getTaxMasterData(): Observable<any> {
    if (this.taxListData.length > 0) {
      return of(this.taxListData);
    }
    const param = {
      searchKeyword: null
    };
    const reqUrl = environment.baseUrlPharma + `/Master/GetTaxMasterBySearchKeyword`;
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          const taxData = [];
          _.map(res.data, dt => {
            const obj = {
              id: dt.taxId,
              value: dt.taxPercent,
              name: dt.taxDesc
            };
            taxData.push(_.cloneDeep(obj));
          });
          this.taxListData = taxData;
          return taxData;
        } else {
          return [];
        }
      })
    );
  }

  getItemList(params) {
    const reqUrl = environment.baseUrlPharma + `/Item/getItemList`;
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  saveItemSupplierTaxMaster(params) {
    const reqUrl = environment.baseUrlPharma + '/Supplier/SaveItemSupplierTax';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  delete(url) {
    const reqUrl = environment.baseUrlPharma + url;
    return this.http.delete(reqUrl).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  getDeliveryMasterList(): Observable<any> {
    if (this.deliveryMasterlist.length > 0) {
      return of(this.deliveryMasterlist);
    } else {
      const reqUrl = environment.baseUrlPharma + `/Master/GetDeliveryMasterList`;
      return this.http.post(reqUrl, null).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.data) {
            const data = [];
            _.map(res.data, (val, key) => {
              const mg = new Delivery();
              if (mg.isObjectValid(val)) {
                mg.generateObject(val);
                data.push(mg);
              }
            });
            this.deliveryMasterlist = data;
            return data;
          } else {
            return [];
          }
        })
      );
    }
  }

  getPaymentTermMasterList(): Observable<any> {
    if (this.payTermMasterList.length > 0) {
      return of(this.payTermMasterList);
    } else {
      const reqUrl = environment.baseUrlPharma + `/Master/GetPaymentTermMasterList`;
      return this.http.post(reqUrl, null).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.data) {
            const data = [];
            _.map(res.data, (val, key) => {
              const mg = new PaymentTerm();
              if (mg.isObjectValid(val)) {
                mg.generateObject(val);
                data.push(mg);
              }
            });
            this.payTermMasterList = data;
            return data;
          } else {
            return [];
          }
        })
      );
    }
  }

  getStoresBySearchKeyword(searchValue: string, isMainStore?, removeLoginStore?): Observable<any> {
    removeLoginStore = _.isUndefined(removeLoginStore) ? true : removeLoginStore;
    const reqParams = {
      searchKeyword: searchValue,
      isMainStore: isMainStore ? isMainStore : null
    };
    const reqUrl = environment.baseUrlPharma + '/Master/GetStoresBySearchKeyword';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        const data = [];
        _.map(res.data, val => {
          const mg = new Store();
          if (removeLoginStore) {
            if (mg.isObjectValid(val) && val.storeId !== this.authService.getLoginStoreId()) {
              mg.generateObject(val);
              data.push(mg);
            }
          } else {
            if (mg.isObjectValid(val)) {
              mg.generateObject(val);
              data.push(mg);
            }
          }
        });
        return data;
      } else {
        return [];
      }
    }));
  }

  getItemBySearchKeyword(searchValue: string, setting?, storeId?): Observable<any> {
    let reqParams = {
      searchKeyword: searchValue,
      showZeroStockItem: _.isUndefined(setting) ? true : setting
    };
    if(storeId){
      reqParams['storeId'] = storeId;
    }
    const reqUrl = environment.baseUrlPharma + '/Item/GetItemBySearchKeyword';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        _.map(res.data, d => {
          d.customName = d.itemDescription + '/' + d.itemCode;
        });
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getMoleculeUnitBySearchKeyword(searchValue: string): Observable<any> {
    const reqParams = {
      searchKeyword: searchValue
    };
    const reqUrl = environment.baseUrlPharma + '/Master/GetMoleculeUnitBySearchKeyword';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getMoleculeBySearchKeyword(searchValue: string): Observable<any> {
    const reqParams = {
      searchKeyword: searchValue
    };
    const reqUrl = environment.baseUrlPharma + '/Master/GetMoleculeBySearchKeyword';
    return this.http.post(reqUrl, reqParams).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getUserStoreMappingList(param): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Mapping/GetUserStoreMappingList';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return { data: res.data, totalCount: res.total_records };
        } else {
          return { data: [], totalCount: 0 };
        }
      })
    );
  }

  getUserList(searchText): Observable<any> {
    const param = {
      search_keyword: searchText,
      dept_id: null,
      speciality_id: null,
      role_type_id: null,
      designation_id: null,
      limit: 100
    };
    const reqUrl = environment.baseUrlPharma + '/Inventory/GetUsersBySearchKeyword';
    return this.http.post(reqUrl, param).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data.length > 0) {
          return res.data;
        } else {
          return res.data;
        }
      })
    );
  }

  getUserStoreMappingByUserId(id): Observable<any> {
    const reqUrl = environment.baseUrlPharma + `/Mapping/GetUserStoreMappingByUserId?userId=${id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return {};
        }
      })
    );
  }

  saveUserStoreMapping(params): Observable<any> {
    const reqUrl = environment.baseUrlPharma + '/Mapping/SaveUserStoreMapping';
    return this.http.post(reqUrl, params).pipe(map((res: any) => {
      return !!(res.status_code === 200 && res.status_message === 'Success' && res.data);
    }));
  }

  getSupplierItemList(params) {
    const reqUrl = environment.baseUrlPharma + `/Item/GetItemsForSupplierMapping`;
    return this.http.post(reqUrl, params).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return [];
        }
      })
    );
  }

  getQuickPatientList(searchText): Observable<any> {
    const param = {
      search_string: searchText,
      page_number: 1,
      limit: 50,
      visit_Type: [
        "IP", "ER"
      ],
    };
    const reqUrl = `${environment.baseUrlPharma}/HISView/GetPatientEncounterList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  getPatientListByType(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/HISView/GetAllPatientList`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }


  getSupplierItemsListOnSettings(keyword, supp): Observable<any> {
    const paramObj = {
      searchKeyword: keyword,
      supplierId: supp,
      limit: 5
    };
    if (!supp) {
      return of([]);
    } else {
      const reqUrl = environment.baseUrlPharma + '/PurchaseOrder/GetSupplierItemsListOnSettings';
      return this.http.post(reqUrl, paramObj).pipe(
        map((res: any) => {
          if (res.status_code === 200 && res.data.length > 0) {
            return res.data;
          } else {
            return [];
          }
        })
      );
    }
  }

  getPharmacyPatientBySearchKeyword(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/GetPharmacyPatientBySearchKeyword`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data.length > 0) {
        return res.data;
      } else {
        return [];
      }
    }));
  }

  savePatientMaster(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/SavePatientMaster`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getDebtorsAccountBySearchKeyword(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/GetDebtorsAccountBySearchKeyword`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  saveAccountMaster(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/SaveAccountMaster`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  savePatientMasterFromSaleBill(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/SavePatientMasterFromSaleBill`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success' && res.data) {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getAdvanceAmountDetails(param): Observable<any> {
    const reqUrl = `${environment.baseUrlPharma}/Master/GetAdvanceAmountDetails`;
    return this.http.post(reqUrl, param).pipe(map((res: any) => {
      if (res.status_message === 'Success') {
        return res.data;
      } else {
        return null;
      }
    }));
  }

  getAccountDataByID(id): Observable<any> {
    const reqUrl = environment.baseUrlPharma + `/Master/GetAccountDataByID?accountId=${id}`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return null;
        }
      })
    );
  }

  getPharmacySettings(): Observable<any> {
    const reqUrl = environment.baseUrlPharma + `/Settings/GetPharmacySettings`;
    return this.http.get(reqUrl).pipe(
      map((res: any) => {
        if (res.status_code === 200 && res.data) {
          return res.data;
        } else {
          return null;
        }
      })
    );
  }


}


export class Field {
  id?: any;
  name?: any;
  type?: any;
  icon?: any;
  toggle?: any;
  required?: any;
  regex?: any;
  errorText?: any;
  label?: any;
  description?: any;
  placeholder?: any;
  className?: any;
  subtype?: any;
  handle?: any;
  min?: number;
  max?: number;
  inline?: any;
  value?: any;
  values?: Array<Value>;
  colwidth?: number;
  formulaValue?: any;
  formulaKey?: any;
  formulaValueArray?: any;
  formulaSelectedTextForSqrt?: any;
  hiddenFormulaText?: any;
  isFormulaSqrt?: boolean;
  answerSelected?: any;
  isFormulaValid?: boolean;
}

export class Value {
  label?: any = '';
  value?: any = '';
  colWidth?: any = 0;
  ansId?: number;
  optionSize?: number;
}


export class IControl {
  type?: any;
  icon?: any;
  className?: any;
  controlName?: any;
  ansGroupKey?: any;
  controlKey?: any;
  parentAnsGroupKey?: any;
  parentAnsGroupOption?: any;
  groupPlaceHolder?: any;
  groupLabel?: string;
  colWidth?: any;
  isDynamicOptions?: any;
  isSearchByKeyword?: any;
  dbQuery?: any;
  selectDynamicTypeHeadList?: Array<any>;
  optionList?: Array<IAnsOption>;
}
export class IAnsOption {
  answerText?: any = '';
  answerKey?: any = '';
  colWidth?: any = 0;
  ansId?: number;
}

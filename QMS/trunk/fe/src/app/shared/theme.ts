export interface Theme {
  name: string;
  properties: any;
}

export const primary: Theme = {
  name: 'primary',
  properties: {
    '--bgColor': '#3F51B5',
    '--bgLight': '#eaeaea',
    '--invbgColor': '#f2f2f2',   
    '--txtColor': '#fff'
  }
};
export const secondary: Theme = {
  name: 'secondary',
  properties: {
    '--bgColor': '#6c757d',
    '--bgLight': '#e5e9ec',
    '--invbgColor': '#f2f2f2',
    '--txtColor': '#fff'
  }
};
export const success: Theme = {
  name: 'success',
  properties: {
    '--bgColor': '#2dce89',
    '--bgLight': '#e7f1ec',
    '--invbgColor': '#f2f2f2',
    '--txtColor': '#fff'
  }
};
export const info: Theme = {
  name: 'info',
  properties: {
    '--bgColor': '#11cdef',
    '--bgLight': '#e8eff1',
    '--invbgColor': '#f2f2f2',
    '--txtColor': '#fff'
  }
};
export const warning: Theme = {
  name: 'warning',
  properties: {
    '--bgColor': '#E3724B',
    '--bgLight': '#fbf0ec',
    '--invbgColor': '#f2f2f2',
    '--txtColor': '#fff'
  }
};
export const danger: Theme = {
  name: 'danger',
  properties: {
    '--bgColor': '#d8506b',
    '--bgLight': '#f7e7ea',
    '--invbgColor': '#f2f2f2',
    '--txtColor': '#fff'
  }
};
export const pink: Theme = {
  name: 'pink',
  properties: {
    '--bgColor': '#e83e8c',
    '--bgLight': '#f7e7ea',
    '--invbgColor': '#f2f2f2',
    '--txtColor': '#fff'
  }
};
export const light: Theme = {
  name: 'light',
  properties: {
    '--bgColor': '#eeeeee',
    '--bgLight': '#dadada',
    '--invbgColor': '#17171766',
    '--txtColor': '#343a40'
  }
};
export const dark: Theme = {
  name: 'dark',
  properties: {
    '--bgColor': '#343a40',
    '--bgLight': '#e4e7ea',
    '--invbgColor': '#f2f2f2',
    '--txtColor': '#fff'
  }
};
export const alternate: Theme = {
  name: 'alternate',
  properties: {
    '--bgColor': '#794c8a',
    '--bgLight': '#e5dce8',
    '--invbgColor': '#f2f2f2',
    '--txtColor': '#fff'
  }
};

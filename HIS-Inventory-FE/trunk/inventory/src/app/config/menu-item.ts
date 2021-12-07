export interface MenuItemKeys {
    linkKey: string;
    name: string;
    isActive: boolean;
    cssClass: string;
    permission: Array<any>;
    children: Array<any>;
    sectionKey: string;
}

export class MenuItems {
    public static PATIENT_MENU_ITEMS: Array<MenuItemKeys> = [
        { // donne
            linkKey: 'patient/dashboard',
            name: 'Summary',
            isActive: true,
            cssClass: 'icon-home',
            permission: [],
            children: [],
            sectionKey: 'summary'
        },
        { // donne
            linkKey: 'patient/history/visit',
            name: 'History',
            isActive: false,
            cssClass: 'icon-emr-history',
            permission: [],
            children: [],
            sectionKey: 'history'
        },
        { // -- not added
            linkKey: 'patient/orders',
            name: 'Orders',
            isActive: false,
            cssClass: 'icon-emr-orders',
            permission: [],
            children: [],
            sectionKey: 'orders'
        },
        {// -- not added
            linkKey: 'patient/progress_notes',
            name: 'Progress Notes',
            isActive: false,
            cssClass: 'icon-emr-progress-notes',
            permission: [],
            children: [],
            sectionKey: 'progress_notes'
        },
        {
            linkKey: 'patient/icu_flow_sheet',
            name: 'ICU Flow Sheet',
            isActive: false,
            cssClass: 'icon-emr-icu-flow-sheet',
            permission: [],
            children: [],
            sectionKey: 'icu_flow_sheet'
        },
        {
            linkKey: 'patient/icu_vital_sheet',
            name: 'ICU Vital Sheet',
            isActive: false,
            cssClass: 'icon-emr-icu-vital-sheet',
            permission: [],
            children: [],
            sectionKey: 'icu_vital_sheet'
        },
        {
          linkKey: 'patient/icu-monitoring',
          name: 'ICU Monitor',
          isActive: false,
          cssClass: 'icon-emr-icu-vital-sheet',
          permission: [],
          children: [],
          sectionKey: 'icu-monitoring'
      },
        {// donne
            linkKey: 'patient/mar/chart',
            name: 'MAR',
            isActive: false,
            cssClass: 'icon-emr-mar',
            permission: [],
            children: [],
            sectionKey: 'mar'
        },
        {// donne
            linkKey: 'patient/diagnosis',
            name: 'Diagnosis',
            isActive: false,
            cssClass: 'icon-emr-diagnosis',
            permission: [],
            children: [],
            sectionKey: 'diagnosis'
        },
        {// donne
            linkKey: 'patient/pacs',
            name: 'PACS',
            isActive: false,
            cssClass: 'icon-emr-pacs',
            permission: [],
            children: [],
            sectionKey: 'pacs'
        },
        {
            linkKey: 'patient/intake_output/chart',
            name: 'Intake/Output',
            isActive: false,
            cssClass: 'icon-emr-intake-output',
            permission: [],
            children: [],
            sectionKey: 'intake_output'
        },
        {
            linkKey: 'patient/care_team',
            name: 'Care Team',
            isActive: false,
            cssClass: 'icon-emr-care-team',
            permission: [],
            children: [],
            sectionKey: 'care_team'
        },
        {
            linkKey: 'patient/prescription',
            name: 'Prescription',
            isActive: false,
            cssClass: 'icon-rx',
            permission: [],
            children: [],
            sectionKey: 'prescription'
        },
        {
            linkKey: 'patient/advice',
            name: 'Advice',
            isActive: false,
            cssClass: 'icon-chat',
            permission: [],
            children: [],
            sectionKey: 'advice'
        },
        {
            linkKey: 'patient/dischargesummary',
            name: 'Discharge summary',
            isActive: false,
            cssClass: 'icon-emr-history',
            permission: [],
            children: [],
            sectionKey: 'discharge_summary'
        }, {
            linkKey: 'patient/investigationHistory',
            name: 'Investigation History',
            isActive: false,
            cssClass: 'icon-emr-history',
            permission: [],
            children: [],
            sectionKey: 'investigation_history'
        },
        {
          linkKey: 'patient/intake_output/chart/diabeticChart',
          name: 'Diabetic Chart',
          isActive: false,
          cssClass: 'icon-emr-intake-output',
          permission: [],
          children: [],
          sectionKey: 'diabetic_chart'
      },
    ];

    // public static PATIENT_ORDER_MENUS: Array<MenuItemKeys> = [
    //     {
    //         linkKey: 'patient/orders/ordersList/',
    //         name: 'Order List',
    //         isActive: false,
    //         cssClass: 'icon-emr-intake-output',
    //         permission: [],
    //         children: [],
    //         sectionKey: 'ordersList'
    //     },
    //     {
    //         linkKey: 'patient/orders/medicine/',
    //         name: 'Medicine',
    //         isActive: false,
    //         cssClass: 'icon-emr-intake-output',
    //         permission: [],
    //         children: [],
    //         sectionKey: 'order_medicine'
    //     },
    //     {
    //         linkKey: 'patient/orders/lab/',
    //         name: 'Lab',
    //         isActive: false,
    //         cssClass: 'icon-emr-intake-output',
    //         permission: [],
    //         children: [],
    //         sectionKey: 'order_lab'
    //     },
    //     {
    //         linkKey: 'patient/orders/radiology/',
    //         name: 'Radiology',
    //         isActive: false,
    //         cssClass: 'icon-emr-intake-output',
    //         permission: [],
    //         children: [],
    //         sectionKey: 'order_radiology'
    //     },
    //     {
    //         linkKey: 'patient/orders/diet/',
    //         name: 'Diet',
    //         isActive: false,
    //         cssClass: 'icon-emr-intake-output',
    //         permission: [],
    //         children: [],
    //         sectionKey: 'order_diet'
    //     },
    //     {
    //         linkKey: 'patient/orders/nursing/',
    //         name: 'Nursing',
    //         isActive: false,
    //         cssClass: 'icon-emr-intake-output',
    //         permission: [],
    //         children: [],
    //         sectionKey: 'order_nursing'
    //     },
    //     {
    //         linkKey: 'patient/orders/doctorInformation/',
    //         name: 'Doctor Information',
    //         isActive: false,
    //         cssClass: 'icon-emr-intake-output',
    //         permission: [],
    //         children: [],
    //         sectionKey: 'order_doc_information'
    //     },
    //     {
    //         linkKey: 'patient/orders/orderSets/',
    //         name: 'Order Set',
    //         isActive: false,
    //         cssClass: 'icon-emr-intake-output',
    //         permission: [],
    //         children: [],
    //         sectionKey: 'order_order_list'
    //     }
    // ];

    getMenusDetailsByKey(sectionKey: string): MenuItemKeys {
        const data = MenuItems.PATIENT_MENU_ITEMS.find(p => p.sectionKey === sectionKey) as MenuItemKeys;
        if (data) {
            return Object.assign({}, data);
        }
        return null;
    }
}





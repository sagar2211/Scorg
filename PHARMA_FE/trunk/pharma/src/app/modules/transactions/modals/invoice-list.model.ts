export interface InvoiceListModel {
    invoiceId: number;
    supplierId: number;
    storeId: number;
    invoiceDate: Date;
    paymentPostingDate: Date;
    paymentMode: string;
    totalAmount: number;
    adjustmentAmount: number;
    roundOff: number;
    netAmount: number;
    remark: string;
    isApproved: string;
    receiptList: Array<InvoiceReceiptItem>;
}

export interface InvoiceReceiptItem {
    grnId: number;
    grnNo: string;
    grnDate: Date;
    billNo: string;
    billDate: Date;
    poId: number;
    poNo: string;
    purchaseAmount: number;
    gstCode: string;
    gstPercent: number;
    gstAmount: number;
    discountPercent: number;
    discountAmount: number;
    netAmount: number;
    selected?: boolean;
}


export interface LedgerRow {
    id: string;
    startDate: string;
    endDate: string;
    itemName: string;
    itemType: 'Tent' | 'Catering' | 'House Building';
    itemStatus: 'Pending' | 'Take' | 'Get' | 'Clear';
    quantity: number;
    returnItems: number;
    perPieceRent: number;
    totalPerDayRent: number;
}

export interface CustomerData {
    customerId: string;
    customerName: string;
    startDate?: string;
    endDate?: string;
    address?: string;
    phone?: string;
    email?: string;
    paymentStatus: 'Paid' | 'UnPaid';
    ledgerRows: LedgerRow[];
    grandTotal: number;
    status: 'RUNNING' | 'PENDING' | 'COMPLETED';
    createdAt: string;
    updatedAt: string;
}

export interface DemoData {
    users: {
        [uid: string]: {
            customers: { [customerId: string]: CustomerData };
            running: { [customerId: string]: Record<string, unknown> }; // Summary data
            history: { [customerId: string]: Record<string, unknown> }; // Summary data
        };
    };
}

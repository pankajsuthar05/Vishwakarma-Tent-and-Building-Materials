import { DemoData } from '@/types';

export const LOCAL_STORAGE_KEY = 'tent_ledger_demo_data';

export const getDemoData = (): DemoData => {
    if (typeof window === 'undefined') return { users: {} };
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : { users: {} };
};

export const saveDemoData = (data: DemoData) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

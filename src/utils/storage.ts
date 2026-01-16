/// <reference types="chrome" />
import { StorageSchema, SFRecord, ObjectType } from '../types';

const INITIAL_STATE: StorageSchema = {
    salesforce_data: {
        leads: [],
        contacts: [],
        accounts: [],
        opportunities: [],
        tasks: [],
        lastSync: 0,
    },
};

export const getStorage = async (): Promise<StorageSchema> => {
    return new Promise((resolve) => {
        chrome.storage.local.get('salesforce_data', (result) => {
            if (result && result.salesforce_data) {
                resolve(result as StorageSchema);
            } else {
                resolve(INITIAL_STATE);
            }
        });
    });
};

export const saveRecord = async (type: ObjectType, record: SFRecord) => {
    const data = await getStorage();
    if (!data.salesforce_data) data.salesforce_data = INITIAL_STATE.salesforce_data;

    const currentList = data.salesforce_data[type] || [];
    const index = currentList.findIndex((r) => r.id === record.id || r.name === record.name);

    if (index >= 0) {
        currentList[index] = { ...currentList[index], ...record };
    } else {
        currentList.push(record);
    }

    data.salesforce_data[type] = currentList;
    data.salesforce_data.lastSync = Date.now();

    await chrome.storage.local.set({ salesforce_data: data.salesforce_data });
};

export const deleteRecord = async (type: ObjectType, id: string) => {
    const data = await getStorage();
    if (data.salesforce_data && data.salesforce_data[type]) {
        data.salesforce_data[type] = data.salesforce_data[type].filter((r) => r.id !== id);
        await chrome.storage.local.set({ salesforce_data: data.salesforce_data });
    }
};

export const clearStorage = async () => {
    await chrome.storage.local.remove('salesforce_data');
};

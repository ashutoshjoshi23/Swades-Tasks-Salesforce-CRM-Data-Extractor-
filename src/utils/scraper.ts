import { SFRecord, ObjectType } from '../types';

export const detectObjectType = (): ObjectType | null => {
    const url = window.location.href;
    if (url.includes('/Lead/')) return 'leads';
    if (url.includes('/Contact/')) return 'contacts';
    if (url.includes('/Account/')) return 'accounts';
    if (url.includes('/Opportunity/')) return 'opportunities';
    if (url.includes('/Task/')) return 'tasks';
    return null;
};

export const extractData = (): SFRecord | null => {
    const type = detectObjectType();
    if (!type) return null;

    const url = window.location.href;
    const idMatch = url.match(/\/([a-zA-Z0-9]{15,18})\//);
    const id = idMatch ? idMatch[1] : `temp_${Date.now()}`;

    const data: SFRecord = {
        id,
        name: 'Unknown',
        objectType: type,
        extractedAt: new Date().toISOString(),
        url: url
    };

    const headerTitle = document.querySelector('lightning-formatted-name, .slds-page-header__title, [data-field="Name"]');
    if (headerTitle) {
        data.name = headerTitle.textContent?.trim() || 'Unknown';
    }

    const fields = document.querySelectorAll('lightning-output-field');
    fields.forEach((field) => {
        const label = field.querySelector('.test-id__field-label, .slds-form-element__label')?.textContent?.trim();
        const value = field.querySelector('.test-id__field-value, .slds-form-element__control')?.textContent?.trim();

        if (label && value) {
            const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
            data[key] = value;
        }
    });

    return data;
};

/// <reference types="chrome" />

type ObjectType = 'leads' | 'contacts' | 'accounts' | 'opportunities' | 'tasks';

interface SFRecord {
    id: string;
    name: string;
    objectType: ObjectType;
    extractedAt: string;
    url: string;
    [key: string]: any;
}

const cleanLabel = (label: string) => {
    return label.replace(/^\*/, '').replace(/:$/, '').replace(/\s+/g, ' ').trim();
};

const cleanValue = (val: string) => {
    return val.replace(/Edit\s+[A-Za-z\s]+$/, '').replace(/\n/g, ' ').trim();
};

const detectObjectType = (): ObjectType | null => {
    const url = window.location.href.toLowerCase();
    if (url.includes('/lead/')) return 'leads';
    if (url.includes('/contact/')) return 'contacts';
    if (url.includes('/account/')) return 'accounts';
    if (url.includes('/opportunity/')) return 'opportunities';
    if (url.includes('/task/')) return 'tasks';

    // Search Results detection
    const bodyText = document.body.innerText;
    if (bodyText.includes('ObjectTask') || bodyText.includes('Tasks (')) return 'tasks';

    const headerText = document.querySelector('.slds-page-header__title, .entityNameTitle, h1, .search-results-header')?.textContent || '';
    if (headerText.includes('Task')) return 'tasks';

    return null;
};

const extractData = (): SFRecord[] => {
    const type = detectObjectType();
    if (!type) return [];

    const url = window.location.href;
    const rows = document.querySelectorAll('tr.slds-hint-parent, [role="row"], .slds-table tr, .search-result-item');

    if (rows.length > 0) {
        const records: SFRecord[] = [];
        rows.forEach((row, index) => {
            // Skip headers
            if (row.querySelector('th[scope="col"]') || row.classList.contains('slds-text-title_caps')) return;

            // Try to find the primary link (Subject for Tasks, Name for others)
            let nameLink = row.querySelector('[data-label="Subject"] a, [data-label="Name"] a, a[data-recordid], a[href*="/lightning/r/"]');
            if (!nameLink) nameLink = row.querySelector('a.slds-truncate, th a, .slds-file__title a');
            if (!nameLink) return;

            const name = nameLink.textContent?.trim() || 'Unknown';
            if (name === 'Unknown' || name === 'Select item' || name.length < 2) return;

            let recordId = nameLink.getAttribute('data-recordid');
            if (!recordId) {
                const href = (nameLink as HTMLAnchorElement).href || '';
                const match = href.match(/\/r\/[A-Za-z0-9]+\/([A-Za-z0-9]{15,18})/);
                recordId = match ? match[1] : `row_${index}_${Date.now()}`;
            }

            const record: SFRecord = {
                id: recordId,
                name: name,
                objectType: type,
                extractedAt: new Date().toISOString(),
                url: (nameLink as HTMLAnchorElement).href || url
            };

            // Extract other fields
            row.querySelectorAll('td, th, .slds-list_horizontal > div').forEach(cell => {
                const label = cleanLabel(cell.getAttribute('data-label') || cell.getAttribute('title') || '');
                if (label && label.length > 1 && !['Name', 'Action', 'Select'].some(s => label.includes(s))) {
                    const cellClone = cell.cloneNode(true) as HTMLElement;
                    cellClone.querySelectorAll('button, .slds-button, .slds-assistive-text, .slds-checkbox').forEach(el => el.remove());
                    const value = cleanValue(cellClone.textContent || '');
                    if (value && value !== name) {
                        record[label.toLowerCase().replace(/[^a-z0-9]/g, '_')] = value;
                    }
                }
            });
            records.push(record);
        });
        if (records.length > 0) return records;
    }

    // Detail Page Fallback
    const idMatch = url.match(/\/([a-zA-Z0-9]{15,18})\//);
    const id = idMatch ? idMatch[1] : `temp_${Date.now()}`;
    const headerTitle = document.querySelector('lightning-formatted-name, .slds-page-header__title, [data-field="Name"], h1 slot, .entityNameTitle');
    const name = headerTitle?.textContent?.trim() || 'Unknown';

    const data: SFRecord = { id, name, objectType: type, extractedAt: new Date().toISOString(), url };

    document.querySelectorAll('lightning-output-field, .slds-form-element, .slds-page-header__detail-block').forEach((field) => {
        const labelEl = field.querySelector('.test-id__field-label, .slds-form-element__label, .slds-text-title, .label');
        const valueEl = field.querySelector('.test-id__field-value, .slds-form-element__control, .slds-text-body_regular, .value');

        if (labelEl && valueEl) {
            const label = cleanLabel(labelEl.textContent || '');
            const valueClone = valueEl.cloneNode(true) as HTMLElement;
            valueClone.querySelectorAll('button, .slds-button, .slds-assistive-text').forEach(el => el.remove());
            const value = cleanValue(valueClone.textContent || '');
            if (label && value) {
                data[label.toLowerCase().replace(/[^a-z0-9]/g, '_')] = value;
            }
        }
    });

    return data.name !== 'Unknown' ? [data] : [];
};

function showNotification(message: string, isError = false) {
    let host = document.getElementById('sf-extractor-notification-host');
    if (host) host.remove();
    host = document.createElement('div');
    host.id = 'sf-extractor-notification-host';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
        <style>
            .notification {
                position: fixed; top: 20px; right: 20px; padding: 16px 24px; border-radius: 12px;
                background: ${isError ? '#FF4D4D' : '#00A1E0'}; color: white;
                font-family: sans-serif; font-size: 14px; font-weight: 600;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 999999;
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        </style>
        <div class="notification">${message}</div>
    `;
    setTimeout(() => host?.remove(), 4000);
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'extract') {
        try {
            const records = extractData();
            if (records.length > 0) {
                chrome.storage.local.get('salesforce_data', (result) => {
                    const data = result.salesforce_data || { leads: [], contacts: [], accounts: [], opportunities: [], tasks: [], lastSync: 0 };
                    const type = records[0].objectType;
                    records.forEach(r => {
                        const idx = data[type].findIndex((old: any) => old.id === r.id || old.name === r.name);
                        if (idx >= 0) data[type][idx] = { ...data[type][idx], ...r };
                        else data[type].push(r);
                    });
                    data.lastSync = Date.now();
                    chrome.storage.local.set({ salesforce_data: data }, () => {
                        sendResponse({ status: 'success', count: records.length });
                        showNotification(`Extracted ${records.length} ${type}!`);
                    });
                });
            } else {
                sendResponse({ status: 'error' });
                showNotification('No records found.', true);
            }
        } catch (e) { sendResponse({ status: 'error' }); }
        return true;
    }
});

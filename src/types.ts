export type ObjectType = 'leads' | 'contacts' | 'accounts' | 'opportunities' | 'tasks';

export interface SFRecord {
    id: string;
    name: string;
    objectType: ObjectType;
    extractedAt: string;
    url: string;
    // Common fields
    email?: string;
    phone?: string;
    owner?: string;
    status?: string;
    // Lead specific
    company?: string;
    lead_source?: string;
    // Contact specific
    account_name?: string;
    title?: string;
    mailing_address?: string;
    // Account specific
    website?: string;
    industry?: string;
    type?: string;
    annual_revenue?: string;
    // Opportunity specific
    amount?: string;
    stage?: string;
    probability?: string;
    close_date?: string;
    forecast_category?: string;
    // Task specific
    subject?: string;
    due_date?: string;
    priority?: string;
    related_to?: string;
    assigned_to?: string;
    [key: string]: any;
}

export interface StorageSchema {
    salesforce_data: {
        leads: SFRecord[];
        contacts: SFRecord[];
        accounts: SFRecord[];
        opportunities: SFRecord[];
        tasks: SFRecord[];
        lastSync: number;
    };
}

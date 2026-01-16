# Salesforce CRM Extractor

A powerful Chrome Extension for extracting, managing, and exporting data from Salesforce CRM.

## 🚀 Features

- **Smart Extraction:** Automatically detects Salesforce object types (Leads, Contacts, Accounts, Opportunities, Tasks) and extracts data from List Views and Detail Pages.
- **Multi-Format Export:** Export your data to **CSV** (Excel/Sheets), **Word** (.doc), **JSON**, or use the **Print View** for a clean, printable report.
- **Data Cleaning:** Intelligently cleans extracted data, removing system labels and formatting issues.
- **Dashboard:** A user-friendly popup dashboard to view and manage extracted records.
- **Search & Filter:** Real-time search functionality to find specific records instantly.
- **Persistent Storage:** Data is saved locally in the browser, so you don't lose it when you close the popup.

## 🛠️ Installation & Usage

1. **Load the Extension:**
   - Open Chrome and go to `chrome://extensions`.
   - Enable **Developer Mode** (top right).
   - Click **Load unpacked**.
   - Select the `dist` folder in this project directory.

2. **Extract Data:**
   - Navigate to any Salesforce page (e.g., Leads List, Opportunity Detail).
   - Open the extension popup.
   - Click **"Extract Current Page"**.
   - Watch as records populate the dashboard!

3. **Export:**
   - Use the icons at the top of the popup to export your data in your desired format.

## 🏗️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Build Tool:** Vite
- **Icons:** Lucide React

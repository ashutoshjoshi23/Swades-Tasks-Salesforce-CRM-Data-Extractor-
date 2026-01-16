# Salesforce CRM Extractor

A powerful Chrome Extension for extracting, managing, and exporting data from Salesforce CRM.

## 🚀 Features

- **Smart Extraction:** Automatically detects Salesforce object types (Leads, Contacts, Accounts, Opportunities, Tasks) and extracts data from List Views and Detail Pages.
- **Multi-Format Export:** Export your data to **CSV** (Excel/Sheets), **Word** (.doc), **JSON**, or use the **Print View** for a clean, printable report.
- **Data Cleaning:** Intelligently cleans extracted data, removing system labels and formatting issues.
- **Dashboard:** A user-friendly popup dashboard to view and manage extracted records.
- **Search & Filter:** Real-time search functionality to find specific records instantly.
- **Persistent Storage:** Data is saved locally in the browser, so you don't lose it when you close the popup.
- 
<img width="956" height="503" alt="Screenshot 2026-01-16 174434" src="https://github.com/user-attachments/assets/ce8d00ef-38b2-41a6-be74-a0967e1fc822" />
<img width="958" height="505" alt="Screenshot 2026-01-16 174353" src="https://github.com/user-attachments/assets/7102c998-8c5a-4c16-a2ee-d1bab7a3fd3b" />
<img width="959" height="504" alt="Screenshot 2026-01-16 174051" src="https://github.com/user-attachments/assets/8e7ec351-089e-4ca5-842a-fd88f7b10454" />
<img width="959" height="539" alt="Screenshot 2026-01-16 174018" src="https://github.com/user-attachments/assets/9a69a08f-c2fb-4348-8a21-f5d799f9e826" />
<img width="948" height="539" alt="Screenshot 2026-01-16 173934" src="https://github.com/user-attachments/assets/479aa9b9-7599-4a84-9107-554ef23744c8" />


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


<div align="center">
  <img src="public/favicon.ico" alt="Logo" width="80" height="80">

  # GM Super Services Billing System
  
  **A modern, intuitive, and highly functional billing and management system built for transport and vehicle rental services.**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
</div>

---

## ✨ Features

- 🧾 **Smart Invoicing:** Generate professional invoices with custom sequences (e.g., `GM-YYYYMMDD-XXXX`), taxes, and discounts.
- 👥 **Customer Management:** Maintain a centralized database of your regular, VIP, and corporate clients.
- 🚗 **Fleet Management:** Track your vehicles, their status, types, and conditions.
- 💳 **Payment Tracking:** Effortlessly record and monitor incoming payments, partial payments, and balances due.
- 📊 **Operational Dashboard:** Get real-time, non-financial operational insights to see how your business is moving.
- 🖨️ **Print & Export:** Easily print invoices with A4 optimized layouts or share them directly.
- 🔒 **Secure Authentication:** Built-in Firebase authentication with password change functionality.

## 🚀 Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Maheesh218a/gm-billing-site.git
   cd gm-billing-site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`*

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Backend/Database:** Firebase (Firestore & Authentication)
- **Routing:** React Router v6
- **Data Visualization:** Chart.js with react-chartjs-2

## 🎨 UI/UX Highlights

- **Premium Design:** Glassmorphism effects, smooth animations, and a rich color palette.
- **Dark Mode Support:** Beautifully crafted dark mode for low-light environments.
- **Print Layout:** Specially designed CSS rules (`@media print`) ensure invoices look perfect on paper.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/Maheesh218a/gm-billing-site/issues) if you want to contribute.

---
<div align="center">
  <i>Developed with ❤️ for GM Super Services</i>
</div>

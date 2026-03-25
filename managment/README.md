# ParkPicasso Management System

A comprehensive business management application for landscaping companies with project-based financial tracking, customer management, inventory control, and PDF quotation generation.

## 🚀 Project Status

**Current Phase: Phase 1 - Foundation & Core Architecture** ✅ **COMPLETED**

### ✅ Completed Features (Phase 1)

#### Sprint 1.1: Project Setup & Authentication
- ✅ React project initialization with Vite
- ✅ Dependencies installation (Tailwind CSS, Lucide icons, UUID, React Router)
- ✅ TypeScript configuration
- ✅ Folder structure setup
- ✅ Authentication system with local validation
- ✅ Login screen with modern UI
- ✅ Session management with localStorage
- ✅ Protected route wrapper

#### Sprint 1.2: Core Layout & Navigation
- ✅ Responsive sidebar navigation
- ✅ Main content wrapper with header
- ✅ Mobile-responsive drawer menu
- ✅ Complete routing setup (Dashboard, Projects, Customers, Products, Quotes)
- ✅ 404 page handling
- ✅ User profile section with logout functionality

#### Sprint 1.3: Data Models & State Management
- ✅ TypeScript interfaces for all data models
- ✅ localStorage utility functions for CRUD operations
- ✅ Initial seed data for development
- ✅ Context API setup for authentication
- ✅ Data persistence layer

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Data Storage**: localStorage
- **Utilities**: UUID for ID generation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with sidebar
│   └── ProtectedRoute.tsx
├── contexts/           # React Context providers
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   ├── CustomersPage.tsx
│   ├── ProductsPage.tsx
│   ├── QuotesPage.tsx
│   └── NotFoundPage.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── storage.ts      # localStorage operations
│   └── seedData.ts     # Development seed data
├── hooks/              # Custom React hooks
└── assets/             # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd managment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Demo Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 📊 Data Models

The application includes comprehensive data models for:

- **Users**: Authentication and user management
- **Customers**: Individual and company customers with contact information
- **Products**: Inventory items with pricing and stock levels
- **Projects**: Customer projects with status tracking and budgets
- **Transactions**: Income and expense tracking per project
- **Quotes**: Customer quotations with line items and calculations

## 🔐 Authentication

- Simple local authentication system
- Session persistence with localStorage
- Protected routes for authenticated users
- Automatic redirect to login for unauthenticated users

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Dark/Light Mode Ready**: CSS variables for easy theming
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: Semantic HTML and keyboard navigation

## 📈 Next Phases

### Phase 2: Dashboard & Core CRUD (Next)
- Financial calculation engine
- Dashboard with real-time metrics
- Project CRUD operations
- Transaction management

### Phase 3: Customer & Product Management
- Customer CRUD with relationship management
- Product catalog with inventory tracking
- Stock level monitoring

### Phase 4: Transaction System
- Project financial tracking
- Income/expense management
- Financial reporting

### Phase 5: PDF Quotation System
- Quote builder interface
- PDF generation with jsPDF
- Professional templates

### Phase 6: Polish & Launch Prep
- File upload system
- Final UI/UX improvements
- Testing and documentation

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Seed Data

The application comes with comprehensive seed data including:
- 4 sample customers (individual and company)
- 5 sample products with inventory
- 4 sample projects with different statuses
- 8 sample transactions (income and expenses)
- 2 sample quotes with line items

## 🤝 Contributing

This is a solo development project following a structured 6-week MVP timeline.

## 📄 License

This project is proprietary software for ParkPicasso landscaping business.

---

**Current Status**: Phase 1 Complete ✅  
**Next Milestone**: Phase 2 - Dashboard Implementation  
**Timeline**: 6 weeks total (30 working days)

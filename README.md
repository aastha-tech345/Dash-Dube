# 🏭 Warehouse Management System

A comprehensive warehouse management system built with React, TypeScript, and modern web technologies.

## ✨ Features

### 🏢 **Infrastructure Management**
- **Hierarchical Structure**: Complete warehouse hierarchy (Warehouse → Floor → Zone → Rack → Shelf → Bin)
- **CRUD Operations**: Full create, read, update, delete functionality for all entities
- **Advanced Filtering**: Multi-criteria filtering with real-time search
- **Export Functionality**: Excel and CSV export with filter support
- **Visual Management**: Interactive tables with sorting and pagination

### 📦 **Inventory Management**
- **Product Lifecycle**: Complete product management with categories and subcategories
- **Stock Transactions**: Stock in/out operations with movement tracking
- **Batch & Serial Tracking**: Full traceability for products
- **Multi-warehouse Support**: Manage inventory across multiple warehouses
- **Real-time Updates**: Live inventory status and movements

### 🎨 **User Experience**
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Theme**: Theme switching with system preference detection
- **Toast Notifications**: Real-time user feedback system
- **Loading States**: Proper loading indicators and error handling
- **Intuitive Navigation**: Clean sidebar navigation with breadcrumbs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd warehouse-management

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API configuration

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── inventory/      # Inventory management
│   ├── layout/         # Layout components
│   ├── shared/         # Shared components
│   └── ui/             # Base UI components (shadcn/ui)
├── pages/              # Application pages
│   ├── warehouse/      # Warehouse management
│   ├── floor/          # Floor management
│   ├── zone/           # Zone management
│   ├── rack/           # Rack management
│   ├── shelf/          # Shelf management
│   └── bin/            # Bin management
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript definitions
├── contexts/           # React contexts
├── data/               # Static data and configs
└── utils/              # Utility functions
```

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - UI library with latest features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library

### **State Management**
- **React Query** - Server state management
- **React Context** - Client state management
- **React Router** - Client-side routing

### **Development Tools**
- **ESLint** - Code linting
- **Vitest** - Unit testing framework
- **TypeScript** - Static type checking

## 📊 API Integration

The system integrates with a RESTful API for all warehouse operations:

### **Base URL**
```
https://thegtrgroup.com/api/warehouse/
```

### **Authentication**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### **Key Endpoints**
- `/warehouses` - Warehouse management
- `/floors` - Floor management  
- `/zones` - Zone management
- `/racks` - Rack management
- `/shelves` - Shelf management
- `/bins` - Bin management
- `/products` - Product management

## 🎯 Key Features

### **Advanced Filtering**
- Multi-criteria filtering for all entity types
- Real-time search across all properties
- Filter persistence across sessions
- Export filtered data

### **Export Functionality**
- Excel (.xlsx) and CSV export
- Respects applied filters
- Timestamped filenames
- Formatted data with proper headers

### **Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Optimized performance

## 🔧 Configuration

### **Environment Variables**
```env
VITE_API_BASE_URL=https://thegtrgroup.com
VITE_APP_TITLE=Warehouse Management System
```

### **Theme Configuration**
The app supports light/dark themes with system preference detection. Theme settings are persisted in localStorage.

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/src/docs/`
- Review the API integration guide

---

Built with ❤️ using React and TypeScript
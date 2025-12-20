# Design Document

## Overview

The BloomCart Admin Panel requires comprehensive fixes to restore full CRUD functionality, implement reliable filtering, fix routing issues, and improve the user experience. The current implementation has several critical issues:

1. **Frontend-Backend Disconnect**: The frontend uses mock data instead of connecting to the Laravel backend API
2. **Type Mismatches**: Product IDs are strings in frontend but numbers in backend
3. **Missing API Integration**: Action buttons (View, Edit, Delete) don't trigger actual API calls
4. **Filter Logic Issues**: Filters work on mock data but aren't connected to backend filtering
5. **Route Configuration**: Admin routes exist but aren't properly integrated with authentication

This design addresses these issues through a systematic approach that fixes the data layer, API integration, routing, and UI components while maintaining the existing design aesthetic.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Admin Pages   │  │  Admin API   │  │  State Mgmt     │ │
│  │  - Products    │→ │  Service     │→ │  - Loading      │ │
│  │  - View/Edit   │  │  - CRUD ops  │  │  - Error        │ │
│  │  - Filters     │  │  - Filters   │  │  - Cache        │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Laravel)                         │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  API Routes    │→ │ Controllers  │→ │   Models        │ │
│  │  - Auth        │  │ - Product    │  │   - Product     │ │
│  │  - Admin       │  │ - Validation │  │   - Category    │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
                    ┌──────────────┐
                    │   Database   │
                    │   (MySQL)    │
                    └──────────────┘
```

### Data Flow

1. **Product List Loading**:
   - Admin page mounts → API call with filters → Backend query → Return paginated results → Update UI

2. **Product Actions**:
   - User clicks action → Validate → API call → Backend processes → Return result → Update cache → Refresh UI

3. **Filtering**:
   - User changes filter → Debounce → API call with params → Backend filters → Return results → Update UI

4. **State Management**:
   - Optimistic updates for better UX
   - Cache invalidation on mutations
   - Error boundaries for graceful failures

## Components and Interfaces

### Frontend Components

#### 1. AdminApi Service (Enhanced)
**Location**: `frontend/lib/adminApi.ts`

**Responsibilities**:
- Centralized API communication
- Request/response transformation
- Error handling and retry logic
- Type-safe interfaces

**Key Methods**:
```typescript
class AdminApiService {
  // Product CRUD
  getProducts(filters: ProductFilters): Promise<PaginatedResponse<Product>>
  getProduct(id: number): Promise<Product>
  createProduct(data: ProductInput): Promise<Product>
  updateProduct(id: number, data: Partial<ProductInput>): Promise<Product>
  deleteProduct(id: number): Promise<void>
  
  // Error handling
  private handleError(error: Error): never
  private retry<T>(fn: () => Promise<T>, attempts: number): Promise<T>
}
```

#### 2. Products List Page
**Location**: `frontend/app/[locale]/admin/products/page.tsx`

**Responsibilities**:
- Display paginated product list
- Handle filtering and sorting
- Manage product actions
- Show loading and error states

**State Management**:
```typescript
interface ProductsPageState {
  products: Product[]
  loading: boolean
  error: string | null
  filters: ProductFilters
  pagination: PaginationState
  selectedProducts: number[]
}
```

#### 3. Product View Page
**Location**: `frontend/app/[locale]/admin/products/[id]/page.tsx`

**Responsibilities**:
- Display complete product details
- Handle product deletion
- Navigate to edit page

#### 4. Product Edit Page
**Location**: `frontend/app/[locale]/admin/products/[id]/edit/page.tsx`

**Responsibilities**:
- Load existing product data
- Validate form inputs
- Submit updates to API
- Handle success/error states

#### 5. Filter Component (New)
**Location**: `frontend/components/admin/ProductFilters.tsx`

**Responsibilities**:
- Render filter controls
- Manage filter state
- Emit filter changes
- Display active filters
- Clear filters functionality

### Backend Components

#### 1. ProductController (Enhanced)
**Location**: `backend/app/Http/Controllers/ProductController.php`

**Methods to Enhance**:
- `adminIndex()`: Add comprehensive filtering, sorting, and pagination
- `adminShow()`: Return complete product data with relationships
- `update()`: Add proper validation and error handling
- `destroy()`: Add soft delete support and cascade handling

#### 2. Middleware
**Location**: `backend/app/Http/Middleware/`

**New Middleware**:
- `AdminAuth`: Verify user has admin role
- `ValidateProductOwnership`: Ensure proper access control

#### 3. Request Validators
**Location**: `backend/app/Http/Requests/`

**New Validators**:
- `StoreProductRequest`: Validation rules for creating products
- `UpdateProductRequest`: Validation rules for updating products
- `ProductFilterRequest`: Validation for filter parameters

## Data Models

### Product Interface (Frontend)
```typescript
interface Product {
  id: number                    // Changed from string to number
  name: string
  slug: string
  description: string
  price: number
  stock_quantity: number
  image_url: string | null
  status: 'active' | 'draft' | 'out-of-stock'
  sku: string
  subcategory_id: number
  created_at: string
  updated_at: string
  subcategory?: {
    id: number
    name: string
    category?: {
      id: number
      name: string
    }
  }
}

interface ProductFilters {
  search?: string
  category_id?: number
  subcategory_id?: number
  status?: 'active' | 'draft' | 'out-of-stock'
  min_price?: number
  max_price?: number
  stock_status?: 'in-stock' | 'low-stock' | 'out-of-stock'
  sort_by?: 'name' | 'price' | 'stock_quantity' | 'created_at'
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}
```

### Product Model (Backend)
```php
class Product extends Model {
    protected $fillable = [
        'name', 'slug', 'description', 'price', 
        'stock_quantity', 'image_url', 'status', 
        'sku', 'subcategory_id'
    ];
    
    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];
    
    public function subcategory() {
        return $this->belongsTo(Subcategory::class);
    }
    
    public function category() {
        return $this->hasOneThrough(Category::class, Subcategory::class);
    }
}
```


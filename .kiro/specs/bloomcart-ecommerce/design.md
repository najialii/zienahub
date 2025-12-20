# BloomCart E-Commerce Platform - Design Document

## Overview

BloomCart is a full-stack e-commerce platform built with Laravel (backend) and Next.js (frontend), featuring an elegant monochromatic design (black, gray, white). The system follows a RESTful API architecture with clear separation between the backend API layer and the frontend presentation layer. The platform supports product catalog management with hierarchical categories, shopping cart functionality, wishlist features, gift sharing, and comprehensive administrative capabilities including analytics and reporting.

## Architecture

### System Architecture

The system follows a three-tier architecture:

1. **Presentation Layer (Next.js Frontend)**
   - Server-side rendering (SSR) for SEO and initial page loads
   - Client-side routing for seamless navigation
   - State management using React Context API or Zustand
   - API client for backend communication

2. **Application Layer (Laravel Backend API)**
   - RESTful API endpoints
   - Business logic and validation
   - Authentication and authorization (Laravel Sanctum)
   - File storage management

3. **Data Layer (MySQL Database)**
   - Relational database schema
   - Eloquent ORM for data access
   - Database migrations and seeders

### Technology Stack

**Backend:**
- PHP 8.1+
- Laravel 10.x
- Laravel Sanctum (API authentication)
- MySQL 8.0+
- Laravel Storage (file management)

**Frontend:**
- Next.js 14.x (App Router)
- React 18.x
- TypeScript
- Tailwind CSS (for elegant styling)
- Axios (HTTP client)
- React Query (data fetching and caching)

### Communication Flow

```
Customer/Admin Browser
        ↓
Next.js Frontend (Port 3000)
        ↓
HTTP/HTTPS Requests
        ↓
Laravel API (Port 8000)
        ↓
MySQL Database
```

## Components and Interfaces

### Backend Components

#### 1. Authentication Module
- **Controllers**: `AuthController`, `AdminAuthController`
- **Middleware**: `auth:sanctum`, `admin`
- **Services**: `AuthService`
- **Responsibilities**: User registration, login, logout, token management

#### 2. Category Management Module
- **Controllers**: `CategoryController`, `SubcategoryController`
- **Models**: `Category`, `Subcategory`
- **Services**: `CategoryService`
- **Responsibilities**: CRUD operations for categories and subcategories

#### 3. Product Management Module
- **Controllers**: `ProductController`
- **Models**: `Product`
- **Services**: `ProductService`, `ImageUploadService`
- **Responsibilities**: Product CRUD, image handling, inventory management

#### 4. Cart Module
- **Controllers**: `CartController`
- **Models**: `Cart`, `CartItem`
- **Services**: `CartService`
- **Responsibilities**: Cart operations, quantity management, total calculation

#### 5. Wishlist Module
- **Controllers**: `WishlistController`
- **Models**: `Wishlist`
- **Services**: `WishlistService`
- **Responsibilities**: Like/unlike products, retrieve wishlist

#### 6. Order Module
- **Controllers**: `OrderController`
- **Models**: `Order`, `OrderItem`
- **Services**: `OrderService`, `CheckoutService`
- **Responsibilities**: Order creation, status management, order history

#### 7. Share Module
- **Controllers**: `ShareController`
- **Services**: `ShareService`
- **Responsibilities**: Generate shareable links, track shares

#### 8. Admin Module
- **Controllers**: `AdminDashboardController`, `AdminCustomerController`, `AdminOrderController`, `AdminReportController`
- **Services**: `ReportService`, `AnalyticsService`
- **Responsibilities**: Dashboard data, customer management, reports generation

### Frontend Components

#### 1. Layout Components
- `Header`: Navigation, cart icon, user menu
- `Footer`: Links and information
- `Sidebar`: Category navigation
- `AdminLayout`: Admin dashboard layout

#### 2. Product Components
- `ProductCard`: Display product in grid/list
- `ProductDetail`: Full product information
- `ProductGallery`: Image display
- `ShareButton`: Gift sharing functionality

#### 3. Cart Components
- `CartDrawer`: Slide-out cart view
- `CartItem`: Individual cart item
- `CartSummary`: Total and checkout button

#### 4. Category Components
- `CategoryGrid`: Display categories
- `SubcategoryList`: Display subcategories
- `CategoryBreadcrumb`: Navigation trail

#### 5. User Components
- `LoginForm`: User authentication
- `RegisterForm`: User registration
- `UserProfile`: Account information
- `OrderHistory`: Past orders

#### 6. Admin Components
- `AdminDashboard`: Overview with metrics
- `ProductManager`: Product CRUD interface
- `CategoryManager`: Category CRUD interface
- `OrderManager`: Order management
- `CustomerManager`: Customer management
- `ReportViewer`: Analytics and reports

### API Endpoints

#### Public Endpoints
- `GET /api/categories` - List all categories
- `GET /api/categories/{id}/subcategories` - List subcategories
- `GET /api/subcategories/{id}/products` - List products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/share/{token}` - Access shared product
- `POST /api/auth/register` - Register customer
- `POST /api/auth/login` - Login customer

#### Authenticated Customer Endpoints
- `GET /api/cart` - Get cart contents
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update cart item quantity
- `DELETE /api/cart/items/{id}` - Remove cart item
- `POST /api/wishlist/toggle` - Like/unlike product
- `GET /api/wishlist` - Get wishlist
- `POST /api/orders` - Create order
- `GET /api/orders` - Get order history
- `POST /api/products/{id}/share` - Generate share link

#### Admin Endpoints
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/categories` - List categories (with management data)
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category
- `POST /api/admin/subcategories` - Create subcategory
- `PUT /api/admin/subcategories/{id}` - Update subcategory
- `DELETE /api/admin/subcategories/{id}` - Delete subcategory
- `GET /api/admin/products` - List products (paginated)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `POST /api/admin/products/{id}/image` - Upload product image
- `GET /api/admin/customers` - List customers
- `GET /api/admin/customers/{id}` - Get customer details
- `PUT /api/admin/customers/{id}/status` - Activate/deactivate customer
- `GET /api/admin/orders` - List orders
- `GET /api/admin/orders/{id}` - Get order details
- `PUT /api/admin/orders/{id}/status` - Update order status
- `GET /api/admin/reports/sales` - Sales reports
- `GET /api/admin/reports/products` - Product reports
- `GET /api/admin/reports/customers` - Customer reports
- `GET /api/admin/reports/export` - Export report

## Data Models

### Database Schema

#### users
- id (PK)
- name
- email (unique)
- password (hashed)
- role (enum: 'customer', 'admin')
- status (enum: 'active', 'inactive')
- created_at
- updated_at

#### categories
- id (PK)
- name
- slug (unique)
- description
- image_url
- created_at
- updated_at

#### subcategories
- id (PK)
- category_id (FK → categories)
- name
- slug (unique)
- description
- created_at
- updated_at

#### products
- id (PK)
- subcategory_id (FK → subcategories)
- name
- slug (unique)
- description
- price (decimal)
- stock_quantity (integer)
- image_url
- status (enum: 'active', 'inactive')
- created_at
- updated_at

#### carts
- id (PK)
- user_id (FK → users, nullable for guest carts)
- session_id (for guest carts)
- created_at
- updated_at

#### cart_items
- id (PK)
- cart_id (FK → carts)
- product_id (FK → products)
- quantity (integer)
- price_at_addition (decimal)
- created_at
- updated_at

#### wishlists
- id (PK)
- user_id (FK → users)
- product_id (FK → products)
- created_at
- unique(user_id, product_id)

#### orders
- id (PK)
- user_id (FK → users)
- order_number (unique)
- total_amount (decimal)
- status (enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
- shipping_name
- shipping_email
- shipping_phone
- shipping_address
- shipping_city
- shipping_postal_code
- shipping_country
- created_at
- updated_at

#### order_items
- id (PK)
- order_id (FK → orders)
- product_id (FK → products)
- quantity (integer)
- price_at_purchase (decimal)
- created_at

#### product_shares
- id (PK)
- product_id (FK → products)
- user_id (FK → users, nullable)
- share_token (unique)
- access_count (integer)
- created_at
- expires_at

### Relationships

- Category → Subcategories (one-to-many)
- Subcategory → Products (one-to-many)
- User → Cart (one-to-one)
- Cart → CartItems (one-to-many)
- Product → CartItems (one-to-many)
- User → Wishlist (one-to-many)
- Product → Wishlist (one-to-many)
- User → Orders (one-to-many)
- Order → OrderItems (one-to-many)
- Product → OrderItems (one-to-many)
- Product → ProductShares (one-to-many)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:
- Cart operations (add, update, remove) all involve cart total recalculation - these can be tested together
- Category/subcategory listing and product filtering are similar data retrieval patterns
- Authentication and session management properties overlap with token validation
- CRUD operations across different entities (products, categories, orders) follow similar patterns

The following properties represent the unique, non-redundant validation requirements:

### Category and Product Navigation Properties

**Property 1: Category subcategory retrieval**
*For any* category with associated subcategories, retrieving subcategories for that category should return exactly the subcategories that belong to it and no others.
**Validates: Requirements 1.2**

**Property 2: Subcategory product retrieval**
*For any* subcategory with associated products, retrieving products for that subcategory should return exactly the products that belong to it and no others.
**Validates: Requirements 1.3**

**Property 3: Product display completeness**
*For any* product, the rendered product display should contain the product name, image URL, price, and availability status.
**Validates: Requirements 1.4**

### Cart Management Properties

**Property 4: Add to cart creates item with quantity one**
*For any* product and cart, adding the product to an empty cart should result in a cart item with quantity 1.
**Validates: Requirements 2.1**

**Property 5: Adding existing product increments quantity**
*For any* cart containing a product, adding the same product again should increment that product's quantity by 1 without creating a duplicate cart item.
**Validates: Requirements 2.2**

**Property 6: Cart display completeness**
*For any* cart with items, the cart display should show all items with their product details, quantities, individual prices, and the correct total price (sum of quantity × price for all items).
**Validates: Requirements 2.3**

**Property 7: Quantity modification updates total**
*For any* cart item, changing its quantity should result in the cart total being recalculated as the sum of (quantity × price) for all items.
**Validates: Requirements 2.4**

**Property 8: Item removal updates cart**
*For any* cart item, removing it should result in the item no longer appearing in the cart and the total being recalculated without that item.
**Validates: Requirements 2.5**

### Wishlist Properties

**Property 9: Like adds to wishlist**
*For any* product and user, liking a product not already in the wishlist should add it to the user's wishlist.
**Validates: Requirements 3.1**

**Property 10: Like toggle is idempotent**
*For any* product and user, liking then unliking a product should result in the product not being in the wishlist (returning to the original state).
**Validates: Requirements 3.2**

**Property 11: Wishlist display completeness**
*For any* user's wishlist, displaying it should show all liked products with their current details (name, price, image, availability).
**Validates: Requirements 3.3**

**Property 12: Product deletion cascades to wishlists**
*For any* product that exists in multiple users' wishlists, deleting the product should remove it from all wishlists.
**Validates: Requirements 3.4**

**Property 13: Wishlist status indication**
*For any* product and user, the product display should correctly indicate whether the product is in the user's wishlist.
**Validates: Requirements 3.5**

### Gift Sharing Properties

**Property 14: Share link generation**
*For any* product, generating a share link should produce a unique token that can be used to access that specific product.
**Validates: Requirements 4.1**

**Property 15: Share link resolution**
*For any* valid share token, accessing the share link should return the correct product details associated with that token.
**Validates: Requirements 4.3**

**Property 16: Share link contains product identification**
*For any* product, the generated share link should contain information that uniquely identifies the product.
**Validates: Requirements 4.5**

### Authentication Properties

**Property 17: Valid registration creates account**
*For any* valid registration data (unique email, valid password, required fields), submitting registration should create a new user account with that data.
**Validates: Requirements 5.1**

**Property 18: Invalid registration rejected**
*For any* invalid registration data (duplicate email, missing required fields, invalid format), submitting registration should be rejected with specific validation errors indicating what is invalid.
**Validates: Requirements 5.2**

**Property 19: Valid login authenticates**
*For any* registered user with correct credentials, submitting login should authenticate the user and return a valid authentication token.
**Validates: Requirements 5.3**

**Property 20: Invalid login rejected**
*For any* login attempt with incorrect credentials, authentication should fail and return an error message.
**Validates: Requirements 5.4**

**Property 21: Logout invalidates session**
*For any* authenticated user, logging out should invalidate the authentication token such that subsequent requests with that token are rejected.
**Validates: Requirements 5.5**

### Checkout and Order Properties

**Property 22: Checkout displays cart summary**
*For any* cart with items, initiating checkout should display a summary containing all cart items and the correct total cost.
**Validates: Requirements 6.1**

**Property 23: Shipping validation**
*For any* shipping information, the system should validate required fields (name, address, city, postal code, country) and reject incomplete or invalid data with specific error messages.
**Validates: Requirements 6.2**

**Property 24: Order creation from cart**
*For any* cart with items and valid shipping information, completing checkout should create an order containing all cart items with their quantities and prices at the time of purchase.
**Validates: Requirements 6.3**

**Property 25: Order creation empties cart**
*For any* cart, successfully creating an order should result in the cart being empty.
**Validates: Requirements 6.4**

**Property 26: Order number uniqueness**
*For any* two orders, they should have different order numbers.
**Validates: Requirements 6.5**

### Admin Category Management Properties

**Property 27: Category creation**
*For any* valid category data, creating a category should add it to the catalog such that it appears in category listings.
**Validates: Requirements 7.1**

**Property 28: Subcategory parent association**
*For any* subcategory created with a parent category ID, the subcategory should be associated with that specific parent category.
**Validates: Requirements 7.2**

**Property 29: Category update persistence**
*For any* category or subcategory, updating its attributes should persist the changes such that subsequent retrievals reflect the updated values.
**Validates: Requirements 7.3**

**Property 30: Category deletion constraint**
*For any* category that has subcategories or products, attempting to delete it should be prevented and return an error.
**Validates: Requirements 7.4**

**Property 31: Subcategory deletion constraint**
*For any* subcategory that has products, attempting to delete it should be prevented and return an error.
**Validates: Requirements 7.5**

### Admin Product Management Properties

**Property 32: Product creation completeness**
*For any* valid product data with all required attributes, creating a product should store all attributes such that they can be retrieved.
**Validates: Requirements 8.1**

**Property 33: Product update persistence**
*For any* product, updating its attributes should persist the changes such that subsequent retrievals reflect the updated values.
**Validates: Requirements 8.2**

**Property 34: Product deletion cascades to carts**
*For any* product that exists in multiple carts, deleting the product should remove it from all carts.
**Validates: Requirements 8.3**

**Property 35: Image upload association**
*For any* product and image file, uploading an image should store the file and associate its URL with the product.
**Validates: Requirements 8.4**

**Property 36: Subcategory validation on assignment**
*For any* product assignment to a non-existent subcategory ID, the operation should be rejected with a validation error.
**Validates: Requirements 8.5**

### Admin Reporting Properties

**Property 37: Sales revenue calculation**
*For any* time period, the sales report should calculate total revenue as the sum of all order totals within that period.
**Validates: Requirements 9.1**

**Property 38: Product popularity ranking**
*For any* set of orders, the product report should rank products by total quantity sold in descending order.
**Validates: Requirements 9.2**

**Property 39: Category sales distribution**
*For any* set of orders, the category report should calculate sales for each category as the sum of order items belonging to products in that category.
**Validates: Requirements 9.3**

**Property 40: Customer statistics accuracy**
*For any* set of customers and orders, the customer report should accurately count registrations per time period and orders per customer.
**Validates: Requirements 9.4**

**Property 41: Report export format**
*For any* report, exporting should generate a file in the specified format (CSV or PDF) that contains all report data.
**Validates: Requirements 9.5**

### Admin Customer Management Properties

**Property 42: Customer listing completeness**
*For any* set of registered customers, the customer list should display all customers with their basic information (name, email, registration date, status).
**Validates: Requirements 10.1**

**Property 43: Customer search accuracy**
*For any* search query, the customer search should return all customers whose name, email, or ID matches the query.
**Validates: Requirements 10.2**

**Property 44: Customer profile completeness**
*For any* customer, viewing their profile should display their account details and complete order history.
**Validates: Requirements 10.3**

**Property 45: Account deactivation prevents login**
*For any* customer account, deactivating it should prevent login attempts with that account's credentials from succeeding.
**Validates: Requirements 10.4**

**Property 46: Account reactivation restores access**
*For any* customer account, deactivating then reactivating it should restore the ability to login with that account's credentials.
**Validates: Requirements 10.5**

### Admin Order Management Properties

**Property 47: Order listing completeness**
*For any* set of orders, the order list should display all orders with their status, customer information, date, and total.
**Validates: Requirements 11.1**

**Property 48: Order status update persistence**
*For any* order, updating its status should persist the new status and record a timestamp of the change.
**Validates: Requirements 11.2**

**Property 49: Order details completeness**
*For any* order, viewing its details should display all order items, customer information, shipping details, and order metadata.
**Validates: Requirements 11.3**

**Property 50: Order search accuracy**
*For any* search query, the order search should return all orders matching the order number, customer name, or falling within the date range.
**Validates: Requirements 11.4**

**Property 51: Order cancellation**
*For any* order, cancelling it should update the order status to 'cancelled'.
**Validates: Requirements 11.5**

### API Security and Data Integrity Properties

**Property 52: Authentication token validation**
*For any* protected API endpoint, requests with invalid or missing authentication tokens should be rejected with a 401 Unauthorized status.
**Validates: Requirements 12.1**

**Property 53: Input validation**
*For any* API endpoint with validation rules, submitting data that violates those rules should be rejected with a 422 Unprocessable Entity status and specific validation error messages.
**Validates: Requirements 12.2**

**Property 54: Error response format**
*For any* API error, the response should include an appropriate HTTP status code and a JSON error message.
**Validates: Requirements 12.3**

**Property 55: JSON response format**
*For any* successful API request, the response should be valid JSON.
**Validates: Requirements 12.5**

**Property 56: Frontend error display**
*For any* API error encountered by the frontend, a user-friendly error message should be displayed to the user.
**Validates: Requirements 13.4**

**Property 57: Transaction rollback on error**
*For any* database operation within a transaction that encounters an error, all changes within that transaction should be rolled back.
**Validates: Requirements 15.2**

**Property 58: Password hashing**
*For any* user account, the stored password should be hashed (not plain text) and verifiable using the hashing algorithm.
**Validates: Requirements 15.3**

## Error Handling

### Backend Error Handling

1. **Validation Errors**
   - Return 422 Unprocessable Entity
   - Include field-specific error messages
   - Use Laravel's validation system

2. **Authentication Errors**
   - Return 401 Unauthorized for invalid/missing tokens
   - Return 403 Forbidden for insufficient permissions
   - Clear error messages without exposing security details

3. **Not Found Errors**
   - Return 404 Not Found for non-existent resources
   - Include helpful error messages

4. **Server Errors**
   - Return 500 Internal Server Error
   - Log detailed error information
   - Return generic message to client (don't expose internals)

5. **Database Errors**
   - Wrap operations in transactions where appropriate
   - Roll back on failure
   - Return appropriate error responses

### Frontend Error Handling

1. **API Error Handling**
   - Display user-friendly error messages
   - Show validation errors near relevant form fields
   - Provide retry options for network errors

2. **Loading States**
   - Show loading indicators during API calls
   - Disable form submissions during processing
   - Prevent duplicate submissions

3. **Form Validation**
   - Client-side validation before submission
   - Real-time validation feedback
   - Clear error messages

4. **Network Errors**
   - Detect offline state
   - Show appropriate messages
   - Retry failed requests when connection restored

## Testing Strategy

### Unit Testing

**Backend (PHPUnit)**
- Test individual service methods
- Test model relationships and scopes
- Test validation rules
- Test authentication middleware
- Test specific edge cases:
  - Empty cart checkout attempts
  - Deleting categories with dependencies
  - Accessing shared links for deleted products
  - Deactivated user login attempts

**Frontend (Jest + React Testing Library)**
- Test component rendering
- Test user interactions
- Test form submissions
- Test error state displays
- Test specific examples:
  - Homepage displays categories
  - Empty subcategory message display
  - Share button functionality presence

### Property-Based Testing

**Backend (Pest PHP with Property Testing or PHPUnit with Eris)**
- Configure each property test to run a minimum of 100 iterations
- Each property-based test MUST be tagged with a comment explicitly referencing the correctness property
- Tag format: `// Feature: bloomcart-ecommerce, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

**Property Test Coverage:**
- Cart operations (Properties 4-8): Generate random products and carts, test add/update/remove operations
- Category/product navigation (Properties 1-3): Generate random category hierarchies, test retrieval
- Wishlist operations (Properties 9-13): Generate random users and products, test like/unlike
- Authentication (Properties 17-21): Generate random user data, test registration/login/logout
- Order creation (Properties 22-26): Generate random carts and shipping data, test checkout
- Admin CRUD operations (Properties 27-36): Generate random entities, test create/update/delete
- Reporting (Properties 37-41): Generate random order data, test calculations
- Search and filtering (Properties 43, 50): Generate random data sets, test search accuracy
- Data integrity (Properties 52-58): Test validation, security, and consistency

**Frontend (fast-check with Jest)**
- Configure each property test to run a minimum of 100 iterations
- Each property-based test MUST be tagged with a comment explicitly referencing the correctness property
- Tag format: `// Feature: bloomcart-ecommerce, Property {number}: {property_text}`

**Property Test Coverage:**
- Form validation: Generate random valid/invalid inputs
- Cart calculations: Generate random cart states, verify totals
- Display completeness: Generate random data, verify all required fields present

### Integration Testing

**API Integration Tests**
- Test complete API workflows (register → login → add to cart → checkout)
- Test admin workflows (create category → create subcategory → create product)
- Test authentication flows across multiple endpoints
- Test error scenarios end-to-end

**End-to-End Testing (Optional)**
- Use Playwright or Cypress for critical user journeys
- Test complete purchase flow
- Test admin product management flow
- Test gift sharing flow

### Test Data Generation

**For Property-Based Tests:**
- Generate random valid user data (names, emails, passwords)
- Generate random product data (names, prices, descriptions)
- Generate random category hierarchies
- Generate random cart states with multiple items
- Generate random order histories
- Use constraints to ensure generated data is realistic (e.g., positive prices, valid email formats)

## Design Patterns and Best Practices

### Backend Patterns

1. **Repository Pattern**
   - Abstract database operations
   - Easier testing and maintenance
   - Swap implementations if needed

2. **Service Layer**
   - Business logic separate from controllers
   - Reusable across different endpoints
   - Easier to test

3. **Resource Transformers**
   - Consistent API response format
   - Control data exposure
   - Use Laravel API Resources

4. **Request Validation**
   - Form Request classes for validation
   - Keep controllers thin
   - Reusable validation rules

### Frontend Patterns

1. **Component Composition**
   - Small, reusable components
   - Clear component hierarchy
   - Props for configuration

2. **Custom Hooks**
   - Reusable logic (useCart, useAuth, useWishlist)
   - Separate concerns
   - Easier testing

3. **Context for Global State**
   - Auth context
   - Cart context
   - Theme context (for consistent styling)

4. **API Client Abstraction**
   - Centralized API calls
   - Consistent error handling
   - Request/response interceptors

### Security Best Practices

1. **Authentication**
   - Use Laravel Sanctum for API tokens
   - HTTP-only cookies for token storage
   - Token expiration and refresh

2. **Authorization**
   - Role-based access control (customer vs admin)
   - Policy classes for permissions
   - Middleware for route protection

3. **Input Validation**
   - Validate all user input
   - Sanitize data before storage
   - Use parameterized queries (Eloquent handles this)

4. **Password Security**
   - Bcrypt hashing (Laravel default)
   - Minimum password requirements
   - Password confirmation for sensitive operations

5. **CORS Configuration**
   - Restrict allowed origins
   - Proper credentials handling
   - Secure headers

### Performance Considerations

1. **Database Optimization**
   - Proper indexing (email, slug, foreign keys)
   - Eager loading to prevent N+1 queries
   - Database query caching where appropriate

2. **API Response Optimization**
   - Pagination for list endpoints
   - Field selection (only return needed data)
   - Response caching for static data

3. **Frontend Optimization**
   - Image optimization (Next.js Image component)
   - Code splitting
   - Lazy loading for routes
   - React Query for caching and deduplication

4. **Caching Strategy**
   - Cache category/subcategory trees
   - Cache product listings with short TTL
   - Invalidate cache on updates

## Deployment Considerations

### Backend Deployment

- Environment configuration (.env)
- Database migrations
- File storage configuration (local/S3)
- Queue workers for async tasks (optional)
- Logging configuration

### Frontend Deployment

- Environment variables for API URL
- Build optimization
- Static asset hosting
- CDN configuration for images

### Database

- MySQL 8.0+ recommended
- Regular backups
- Migration version control
- Seeding for initial data (categories, admin user)

## Future Enhancements

- Payment gateway integration
- Email notifications (order confirmation, shipping updates)
- Product reviews and ratings
- Advanced search with filters
- Inventory management
- Discount codes and promotions
- Multi-language support
- Product recommendations
- Real-time stock updates
- Mobile app (React Native)

# Implementation Plan

- [x] 1. Set up project structure and initialize both applications



  - Create Laravel backend project with required dependencies (Laravel 10.x, Sanctum, MySQL)
  - Create Next.js frontend project with TypeScript and Tailwind CSS
  - Configure database connection and environment variables
  - Set up CORS configuration for API communication
  - Initialize Git repository with appropriate .gitignore files
  - _Requirements: 12.4, 13.1_

- [ ] 2. Create database schema and migrations
  - Write migration for users table with role and status fields
  - Write migration for categories table with slug and image fields
  - Write migration for subcategories table with category relationship
  - Write migration for products table with subcategory relationship and stock tracking
  - Write migration for carts and cart_items tables
  - Write migration for wishlists table with unique constraint
  - Write migration for orders and order_items tables
  - Write migration for product_shares table with token and expiration
  - Add database indexes for performance (email, slug, foreign keys)
  - _Requirements: 15.1, 15.4_

- [ ] 3. Implement authentication system
  - [ ] 3.1 Create User model with role-based access
    - Implement User Eloquent model with relationships
    - Add role enum (customer, admin) and status enum (active, inactive)
    - Create password hashing using bcrypt
    - _Requirements: 5.1, 15.3_

  - [ ] 3.2 Build authentication API endpoints
    - Create AuthController with register, login, logout methods
    - Implement Laravel Sanctum token authentication
    - Create AdminAuthController for admin login
    - Add validation rules for registration (email uniqueness, password strength)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 12.1, 12.2_

  - [ ] 3.3 Write property test for authentication
    - **Property 17: Valid registration creates account**
    - **Property 18: Invalid registration rejected**
    - **Property 19: Valid login authenticates**
    - **Property 20: Invalid login rejected**
    - **Property 21: Logout invalidates session**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

  - [ ] 3.4 Write unit tests for authentication edge cases
    - Test duplicate email registration rejection
    - Test deactivated user login prevention
    - Test token expiration handling
    - _Requirements: 5.2, 10.4_

- [ ] 4. Implement category and subcategory management
  - [ ] 4.1 Create Category and Subcategory models
    - Implement Eloquent models with relationships
    - Add slug generation for URLs
    - Define one-to-many relationship (Category → Subcategories)
    - _Requirements: 1.1, 1.2_

  - [ ] 4.2 Build category API endpoints for customers
    - Create CategoryController with index and show methods
    - Implement GET /api/categories endpoint
    - Implement GET /api/categories/{id}/subcategories endpoint
    - Return JSON responses with proper structure
    - _Requirements: 1.1, 1.2, 12.5_

  - [ ] 4.3 Build admin category management endpoints
    - Create admin CategoryController with CRUD operations
    - Implement POST /api/admin/categories endpoint
    - Implement PUT /api/admin/categories/{id} endpoint
    - Implement DELETE /api/admin/categories/{id} with constraint checking
    - Add validation for category deletion (prevent if subcategories exist)
    - _Requirements: 7.1, 7.3, 7.4, 12.2_

  - [ ] 4.4 Build admin subcategory management endpoints
    - Implement POST /api/admin/subcategories endpoint
    - Implement PUT /api/admin/subcategories/{id} endpoint
    - Implement DELETE /api/admin/subcategories/{id} with constraint checking
    - Add validation for subcategory deletion (prevent if products exist)
    - _Requirements: 7.2, 7.3, 7.5_

  - [ ] 4.5 Write property tests for category operations
    - **Property 1: Category subcategory retrieval**
    - **Property 27: Category creation**
    - **Property 28: Subcategory parent association**
    - **Property 29: Category update persistence**
    - **Property 30: Category deletion constraint**
    - **Property 31: Subcategory deletion constraint**
    - **Validates: Requirements 1.2, 7.1, 7.2, 7.3, 7.4, 7.5**

- [ ] 5. Implement product management
  - [ ] 5.1 Create Product model and relationships
    - Implement Product Eloquent model
    - Define relationship with Subcategory
    - Add status enum (active, inactive)
    - Create slug generation for product URLs
    - _Requirements: 1.3, 1.4_

  - [ ] 5.2 Build product API endpoints for customers
    - Create ProductController with index and show methods
    - Implement GET /api/subcategories/{id}/products endpoint
    - Implement GET /api/products/{id} endpoint
    - Return product with name, image, price, availability
    - Handle empty subcategory case with appropriate message
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ] 5.3 Build admin product management endpoints
    - Create admin ProductController with CRUD operations
    - Implement POST /api/admin/products endpoint with validation
    - Implement PUT /api/admin/products/{id} endpoint
    - Implement DELETE /api/admin/products/{id} with cascade logic
    - Add subcategory existence validation
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 12.2_

  - [ ] 5.4 Implement image upload functionality
    - Create ImageUploadService for file handling
    - Implement POST /api/admin/products/{id}/image endpoint
    - Store images using Laravel Storage
    - Associate image URL with product
    - Add image validation (file type, size)
    - _Requirements: 8.4_

  - [ ] 5.5 Write property tests for product operations
    - **Property 2: Subcategory product retrieval**
    - **Property 3: Product display completeness**
    - **Property 32: Product creation completeness**
    - **Property 33: Product update persistence**
    - **Property 34: Product deletion cascades to carts**
    - **Property 35: Image upload association**
    - **Property 36: Subcategory validation on assignment**
    - **Validates: Requirements 1.3, 1.4, 8.1, 8.2, 8.3, 8.4, 8.5**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement shopping cart functionality
  - [ ] 7.1 Create Cart and CartItem models
    - Implement Cart and CartItem Eloquent models
    - Define relationships (Cart → CartItems, CartItem → Product)
    - Add session_id field for guest cart support
    - Create methods for total calculation
    - _Requirements: 2.3, 2.4_

  - [ ] 7.2 Build cart API endpoints
    - Create CartController with cart operations
    - Implement GET /api/cart endpoint
    - Implement POST /api/cart/items endpoint (add to cart)
    - Implement PUT /api/cart/items/{id} endpoint (update quantity)
    - Implement DELETE /api/cart/items/{id} endpoint (remove item)
    - Add logic to increment quantity if product already in cart
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 7.3 Implement cart total calculation
    - Create CartService with calculateTotal method
    - Ensure total updates on quantity changes
    - Ensure total updates on item removal
    - Store price_at_addition for price consistency
    - _Requirements: 2.3, 2.4, 2.5_

  - [ ] 7.4 Write property tests for cart operations
    - **Property 4: Add to cart creates item with quantity one**
    - **Property 5: Adding existing product increments quantity**
    - **Property 6: Cart display completeness**
    - **Property 7: Quantity modification updates total**
    - **Property 8: Item removal updates cart**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [ ] 8. Implement wishlist functionality
  - [ ] 8.1 Create Wishlist model
    - Implement Wishlist Eloquent model
    - Define relationships with User and Product
    - Add unique constraint on (user_id, product_id)
    - _Requirements: 3.1, 3.2_

  - [ ] 8.2 Build wishlist API endpoints
    - Create WishlistController
    - Implement POST /api/wishlist/toggle endpoint (like/unlike)
    - Implement GET /api/wishlist endpoint
    - Add logic to toggle wishlist status
    - Return wishlist with current product details
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 8.3 Add wishlist cascade on product deletion
    - Update Product model delete logic
    - Remove product from all wishlists when deleted
    - _Requirements: 3.4_

  - [ ] 8.4 Add wishlist status to product responses
    - Modify ProductController to include wishlist status
    - Check if product is in authenticated user's wishlist
    - _Requirements: 3.5_

  - [ ] 8.5 Write property tests for wishlist operations
    - **Property 9: Like adds to wishlist**
    - **Property 10: Like toggle is idempotent**
    - **Property 11: Wishlist display completeness**
    - **Property 12: Product deletion cascades to wishlists**
    - **Property 13: Wishlist status indication**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [ ] 9. Implement gift sharing functionality
  - [ ] 9.1 Create ProductShare model
    - Implement ProductShare Eloquent model
    - Add share_token field with unique constraint
    - Add access_count and expires_at fields
    - Define relationship with Product
    - _Requirements: 4.1_

  - [ ] 9.2 Build share API endpoints
    - Create ShareController
    - Implement POST /api/products/{id}/share endpoint
    - Generate unique share token
    - Implement GET /api/products/share/{token} endpoint
    - Handle expired or invalid tokens
    - Increment access_count on share link access
    - _Requirements: 4.1, 4.3, 4.5_

  - [ ] 9.3 Handle deleted product shares
    - Add logic to check product availability
    - Display appropriate message for unavailable products
    - _Requirements: 4.4_

  - [ ] 9.4 Write property tests for sharing
    - **Property 14: Share link generation**
    - **Property 15: Share link resolution**
    - **Property 16: Share link contains product identification**
    - **Validates: Requirements 4.1, 4.3, 4.5**

  - [ ] 9.5 Write unit test for deleted product share
    - Test accessing share link for deleted product
    - Verify appropriate error message
    - _Requirements: 4.4_

- [ ] 10. Implement checkout and order management
  - [ ] 10.1 Create Order and OrderItem models
    - Implement Order and OrderItem Eloquent models
    - Add order_number generation logic
    - Add status enum (pending, processing, shipped, delivered, cancelled)
    - Define relationships (Order → OrderItems, OrderItem → Product)
    - Store shipping information fields
    - _Requirements: 6.3, 6.5_

  - [ ] 10.2 Build checkout API endpoints
    - Create OrderController and CheckoutService
    - Implement POST /api/orders endpoint
    - Display cart summary before order creation
    - Validate shipping information (required fields, format)
    - Create order with all cart items
    - Store price_at_purchase for each order item
    - Generate unique order number
    - Empty cart after successful order creation
    - Use database transactions for order creation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 15.1, 15.2_

  - [ ] 10.3 Build order history endpoint
    - Implement GET /api/orders endpoint
    - Return customer's order history
    - Include order items and details
    - _Requirements: 6.3_

  - [ ] 10.4 Write property tests for checkout
    - **Property 22: Checkout displays cart summary**
    - **Property 23: Shipping validation**
    - **Property 24: Order creation from cart**
    - **Property 25: Order creation empties cart**
    - **Property 26: Order number uniqueness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement admin order management
  - [ ] 12.1 Build admin order endpoints
    - Create AdminOrderController
    - Implement GET /api/admin/orders endpoint (list all orders)
    - Implement GET /api/admin/orders/{id} endpoint (order details)
    - Implement PUT /api/admin/orders/{id}/status endpoint
    - Add timestamp recording for status changes
    - Implement order search by number, customer name, date range
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 12.2 Add order cancellation
    - Implement order cancellation logic
    - Update status to 'cancelled'
    - _Requirements: 11.5_

  - [ ] 12.3 Write property tests for admin order management
    - **Property 47: Order listing completeness**
    - **Property 48: Order status update persistence**
    - **Property 49: Order details completeness**
    - **Property 50: Order search accuracy**
    - **Property 51: Order cancellation**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [ ] 13. Implement admin customer management
  - [ ] 13.1 Build admin customer endpoints
    - Create AdminCustomerController
    - Implement GET /api/admin/customers endpoint (list customers)
    - Implement GET /api/admin/customers/{id} endpoint (customer profile)
    - Implement PUT /api/admin/customers/{id}/status endpoint
    - Add customer search by name, email, ID
    - Include order history in customer profile
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 13.2 Implement account activation/deactivation
    - Add logic to toggle customer status
    - Prevent login for deactivated accounts
    - _Requirements: 10.4, 10.5_

  - [ ] 13.3 Write property tests for customer management
    - **Property 42: Customer listing completeness**
    - **Property 43: Customer search accuracy**
    - **Property 44: Customer profile completeness**
    - **Property 45: Account deactivation prevents login**
    - **Property 46: Account reactivation restores access**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 14. Implement admin reporting and analytics
  - [ ] 14.1 Create reporting services
    - Create ReportService and AnalyticsService
    - Implement sales revenue calculation by time period
    - Implement product popularity ranking by quantity sold
    - Implement category sales distribution calculation
    - Implement customer statistics (registrations, order counts)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 14.2 Build admin reporting endpoints
    - Create AdminReportController
    - Implement GET /api/admin/reports/sales endpoint
    - Implement GET /api/admin/reports/products endpoint
    - Implement GET /api/admin/reports/customers endpoint
    - Implement GET /api/admin/reports/export endpoint
    - Add CSV and PDF export functionality
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 14.3 Build admin dashboard
    - Create AdminDashboardController
    - Implement GET /api/admin/dashboard endpoint
    - Return key metrics (total sales, orders, customers, popular products)
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ] 14.4 Write property tests for reporting
    - **Property 37: Sales revenue calculation**
    - **Property 38: Product popularity ranking**
    - **Property 39: Category sales distribution**
    - **Property 40: Customer statistics accuracy**
    - **Property 41: Report export format**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

- [ ] 15. Implement API security and error handling
  - [ ] 15.1 Add authentication middleware
    - Configure Laravel Sanctum middleware
    - Protect customer endpoints with auth:sanctum
    - Create admin middleware for role checking
    - Return 401 for invalid/missing tokens
    - Return 403 for insufficient permissions
    - _Requirements: 12.1_

  - [ ] 15.2 Implement comprehensive validation
    - Create Form Request classes for all endpoints
    - Add validation rules for all input data
    - Return 422 with field-specific errors
    - _Requirements: 12.2_

  - [ ] 15.3 Implement error handling
    - Create global exception handler
    - Return appropriate HTTP status codes
    - Return JSON error responses
    - Log errors without exposing internals
    - _Requirements: 12.3, 12.5_

  - [ ] 15.4 Add database transaction handling
    - Wrap critical operations in transactions
    - Implement rollback on errors
    - _Requirements: 15.1, 15.2_

  - [ ] 15.5 Write property tests for security
    - **Property 52: Authentication token validation**
    - **Property 53: Input validation**
    - **Property 54: Error response format**
    - **Property 55: JSON response format**
    - **Property 57: Transaction rollback on error**
    - **Property 58: Password hashing**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.5, 15.2, 15.3**

- [ ] 16. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Set up Next.js frontend structure
  - [ ] 17.1 Create project structure and configuration
    - Initialize Next.js 14 with App Router
    - Configure TypeScript and Tailwind CSS
    - Set up monochromatic color scheme (black, gray, white)
    - Create environment variables for API URL
    - _Requirements: 13.1, 14.1_

  - [ ] 17.2 Create API client and utilities
    - Create Axios instance with base configuration
    - Add request/response interceptors
    - Implement authentication token handling
    - Create error handling utilities
    - _Requirements: 13.3, 13.4_

  - [ ] 17.3 Set up state management
    - Create React Context for authentication
    - Create React Context for cart
    - Implement custom hooks (useAuth, useCart, useWishlist)
    - _Requirements: 13.2_

- [ ] 18. Build frontend layout components
  - [ ] 18.1 Create main layout components
    - Build Header component with navigation and cart icon
    - Build Footer component
    - Build Sidebar for category navigation
    - Implement responsive design
    - Apply elegant styling with Tailwind
    - _Requirements: 14.1, 14.2, 14.5_

  - [ ] 18.2 Create AdminLayout component
    - Build admin dashboard layout
    - Add admin navigation menu
    - Apply consistent styling
    - _Requirements: 14.1_

- [ ] 19. Build authentication pages
  - [ ] 19.1 Create login and registration pages
    - Build LoginForm component with validation
    - Build RegisterForm component with validation
    - Implement client-side validation
    - Handle API errors and display messages
    - Implement loading states
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 13.3, 13.4_

  - [ ] 19.2 Implement authentication flow
    - Handle successful login (store token, redirect)
    - Handle logout (clear token, redirect)
    - Implement protected routes
    - _Requirements: 5.3, 5.5_

  - [ ] 19.3 Write unit tests for authentication forms
    - Test form validation
    - Test error message display
    - Test successful submission flow
    - _Requirements: 5.2, 13.4_

- [ ] 20. Build category and product browsing pages
  - [ ] 20.1 Create homepage with categories
    - Build CategoryGrid component
    - Fetch and display all categories
    - Implement server-side rendering for SEO
    - Add elegant hover effects
    - _Requirements: 1.1, 13.1, 14.2_

  - [ ] 20.2 Create category page with subcategories
    - Build SubcategoryList component
    - Fetch and display subcategories for selected category
    - Add CategoryBreadcrumb for navigation
    - _Requirements: 1.2_

  - [ ] 20.3 Create subcategory page with products
    - Build ProductCard component
    - Fetch and display products for selected subcategory
    - Handle empty subcategory case
    - Display product name, image, price, availability
    - Add wishlist status indicator
    - _Requirements: 1.3, 1.4, 1.5, 3.5_

  - [ ] 20.4 Create product detail page
    - Build ProductDetail component
    - Build ProductGallery for images
    - Display complete product information
    - Add "Add to Cart" button
    - Add "Like" button with wishlist status
    - Build ShareButton component
    - _Requirements: 1.4, 2.1, 3.1, 4.1_

  - [ ] 20.5 Write property tests for product display
    - **Property 56: Frontend error display**
    - **Validates: Requirements 13.4**

- [ ] 21. Build shopping cart functionality
  - [ ] 21.1 Create cart components
    - Build CartDrawer component (slide-out)
    - Build CartItem component
    - Build CartSummary component
    - Display items with details, quantities, prices
    - Display total price
    - _Requirements: 2.3_

  - [ ] 21.2 Implement cart operations
    - Add product to cart functionality
    - Update quantity functionality
    - Remove item functionality
    - Handle loading states
    - Update cart total on changes
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 13.3_

  - [ ] 21.3 Write property tests for cart calculations
    - Test cart total calculation with random items
    - Test quantity updates
    - _Requirements: 2.3, 2.4_

- [ ] 22. Build wishlist and sharing features
  - [ ] 22.1 Create wishlist page
    - Build wishlist display component
    - Fetch and display liked products
    - Show current product details
    - Add remove from wishlist functionality
    - _Requirements: 3.3_

  - [ ] 22.2 Implement like/unlike functionality
    - Add toggle wishlist API call
    - Update UI immediately
    - Handle errors
    - _Requirements: 3.1, 3.2_

  - [ ] 22.3 Implement share functionality
    - Build share modal/dialog
    - Generate share link
    - Provide copy link functionality
    - Add social media share options
    - _Requirements: 4.1, 4.2_

  - [ ] 22.4 Create shared product page
    - Build page for accessing shared links
    - Handle invalid/expired tokens
    - Display product details
    - _Requirements: 4.3, 4.4_

- [ ] 23. Build checkout and order pages
  - [ ] 23.1 Create checkout page
    - Display cart summary
    - Build shipping information form
    - Implement form validation
    - Handle checkout submission
    - Display loading state during processing
    - _Requirements: 6.1, 6.2, 13.3_

  - [ ] 23.2 Create order confirmation page
    - Display order confirmation
    - Show order number
    - Display order details
    - _Requirements: 6.5_

  - [ ] 23.3 Create order history page
    - Build OrderHistory component
    - Fetch and display past orders
    - Show order status, date, total
    - Add view order details functionality
    - _Requirements: 6.3_

- [ ] 24. Build admin dashboard
  - [ ] 24.1 Create admin dashboard page
    - Build AdminDashboard component
    - Display key metrics (sales, orders, customers)
    - Show popular products
    - Add charts/visualizations for data
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ] 24.2 Implement admin authentication
    - Create admin login page
    - Handle admin role verification
    - Protect admin routes
    - _Requirements: 12.1_

- [ ] 25. Build admin category management
  - [ ] 25.1 Create category management interface
    - Build CategoryManager component
    - Display category list with subcategories
    - Add create category form
    - Add edit category functionality
    - Add delete category with constraint checking
    - Display validation errors
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ] 25.2 Create subcategory management interface
    - Add create subcategory form
    - Add edit subcategory functionality
    - Add delete subcategory with constraint checking
    - _Requirements: 7.2, 7.3, 7.5_

- [ ] 26. Build admin product management
  - [ ] 26.1 Create product management interface
    - Build ProductManager component
    - Display paginated product list
    - Add create product form with all fields
    - Add edit product functionality
    - Add delete product functionality
    - Implement image upload
    - Add subcategory selection dropdown
    - Display validation errors
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 26.2 Optimize image handling
    - Use Next.js Image component
    - Implement image optimization
    - _Requirements: 13.5_

- [ ] 27. Build admin customer management
  - [ ] 27.1 Create customer management interface
    - Build CustomerManager component
    - Display customer list
    - Implement customer search
    - Add view customer profile functionality
    - Display customer order history
    - Add activate/deactivate account functionality
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 28. Build admin order management
  - [ ] 28.1 Create order management interface
    - Build OrderManager component
    - Display order list with filters
    - Implement order search
    - Add view order details functionality
    - Add update order status functionality
    - Add cancel order functionality
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 29. Build admin reporting interface
  - [ ] 29.1 Create reports page
    - Build ReportViewer component
    - Add time period selector
    - Display sales reports with revenue
    - Display product reports with rankings
    - Display category reports with distribution
    - Display customer reports with statistics
    - Add export functionality (CSV/PDF)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 30. Implement frontend error handling and loading states
  - [ ] 30.1 Add comprehensive error handling
    - Display user-friendly error messages
    - Show validation errors near form fields
    - Handle network errors
    - Implement retry functionality
    - _Requirements: 13.4_

  - [ ] 30.2 Add loading states
    - Show loading indicators during API calls
    - Disable forms during submission
    - Prevent duplicate submissions
    - Add skeleton loaders for content
    - _Requirements: 13.3_

- [ ] 31. Apply elegant design styling
  - [ ] 31.1 Refine visual design
    - Ensure monochromatic color scheme throughout
    - Add subtle hover effects and transitions
    - Implement elegant typography
    - Style product images with clean borders
    - Add appropriate spacing and padding
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ] 31.2 Ensure responsive design
    - Test on mobile, tablet, desktop
    - Maintain elegant aesthetic across devices
    - Optimize touch interactions for mobile
    - _Requirements: 14.5_

- [ ] 32. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 33. Create database seeders
  - Create seeder for admin user
  - Create seeder for sample categories and subcategories
  - Create seeder for sample products
  - _Requirements: 7.1, 8.1_

- [ ] 34. Add performance optimizations
  - Implement database query optimization (eager loading)
  - Add pagination to list endpoints
  - Configure caching for categories
  - Implement React Query for frontend caching
  - Optimize frontend code splitting
  - _Requirements: 13.1, 13.2_

- [ ] 35. Documentation and deployment preparation
  - Write API documentation
  - Create README with setup instructions
  - Document environment variables
  - Create deployment guide
  - _Requirements: 12.4, 13.1_

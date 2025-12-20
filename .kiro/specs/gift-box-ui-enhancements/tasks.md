# Implementation Plan

- [x] 1. Create database migrations for gift box functionality





  - Write migration for gift_boxes table with user relationship and status field
  - Write migration for gift_box_items table with gift box and product relationships
  - Write migration for gift_box_shares table with token and expiration
  - Extend orders table migration to add gift box reference and recipient fields
  - Add database indexes for performance (gift_box_id, user_id, share_token)
  - _Requirements: 1.1, 2.3, 2.4, 4.1_












- [ ] 2. Implement gift box models and relationships
  - [ ] 2.1 Create GiftBox model
    - Implement GiftBox Eloquent model with status enum (active, sent, purchased)
    - Define relationship with User (belongsTo)



    - Define relationship with GiftBoxItems (hasMany)
    - Add methods for total calculation
    - _Requirements: 1.1, 1.4_




  - [ ] 2.2 Create GiftBoxItem model
    - Implement GiftBoxItem Eloquent model
    - Define relationships with GiftBox and Product
    - Store price_at_addition for price consistency
    - _Requirements: 1.2, 1.3_



  - [ ] 2.3 Create GiftBoxShare model
    - Implement GiftBoxShare Eloquent model
    - Add share_token field with unique constraint
    - Define relationship with GiftBox and User
    - Add access tracking fields
    - _Requirements: 8.3_

  - [ ] 2.4 Extend Order model
    - Add gift box relationship (belongsTo)
    - Add is_gift boolean field
    - Add recipient information fields
    - Add gift_message field
    - _Requirements: 2.3, 2.4_

- [ ] 3. Implement gift box management API
  - [ ] 3.1 Create GiftBoxService
    - Implement createGiftBox method
    - Implement addItem method with quantity logic
    - Implement removeItem method with total recalculation
    - Implement updateGiftBoxName method
    - Implement deleteGiftBox method with cascade
    - Implement calculateTotal method
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.2, 4.3, 4.4_

  - [ ] 3.2 Create GiftBoxController
    - Implement GET /api/gift-boxes endpoint (list customer's gift boxes)
    - Implement POST /api/gift-boxes endpoint (create new gift box)
    - Implement GET /api/gift-boxes/{id} endpoint (get gift box details)
    - Implement PUT /api/gift-boxes/{id} endpoint (update gift box name)
    - Implement DELETE /api/gift-boxes/{id} endpoint (delete gift box)
    - Add authorization checks (user owns gift box)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 3.3 Create gift box item endpoints
    - Implement POST /api/gift-boxes/{id}/items endpoint (add item)
    - Implement PUT /api/gift-boxes/{id}/items/{itemId} endpoint (update quantity)
    - Implement DELETE /api/gift-boxes/{id}/items/{itemId} endpoint (remove item)
    - Add logic to increment quantity if product already exists
    - _Requirements: 1.2, 1.3, 1.5_

  - [ ] 3.4 Write property tests for gift box management
    - **Property 1: Gift box creation associates with customer**
    - **Property 2: Adding product to gift box sets quantity to one**
    - **Property 3: Adding existing product increments quantity**
    - **Property 4: Gift box display completeness**
    - **Property 5: Item removal updates gift box**
    - **Property 16: Active gift box listing**
    - **Property 17: Gift box name assignment**
    - **Property 18: Gift box name update persistence**
    - **Property 19: Gift box deletion cascades to items**
    - **Property 20: Gift box timestamp display**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 4. Implement gift sending functionality
  - [ ] 4.1 Create GiftOrderService
    - Implement sendGiftBox method with recipient validation
    - Implement purchaseGiftBoxForSelf method
    - Create order from gift box items
    - Store sender and recipient information
    - Update gift box status (sent/purchased)
    - Use database transactions for atomicity
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_

  - [ ] 4.2 Create GiftOrderController
    - Implement POST /api/gift-boxes/{id}/send endpoint
    - Validate recipient information (name, phone, address required)
    - Allow optional gift message
    - Implement POST /api/gift-boxes/{id}/purchase endpoint
    - Do not require recipient info for self-purchase
    - Generate unique order numbers
    - Return order confirmation
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.3, 3.5_

  - [ ] 4.3 Write property tests for gift sending
    - **Property 6: Gift sending requires recipient information**
    - **Property 7: Gift message inclusion**
    - **Property 8: Gift order creation from gift box**
    - **Property 9: Gift order stores sender and recipient**
    - **Property 10: Sent gift box status and preservation**
    - **Property 11: Self-purchase order creation**
    - **Property 12: Self-purchase uses customer shipping**
    - **Property 13: Self-purchase does not require recipient**
    - **Property 14: Purchased gift box status and preservation**
    - **Property 15: Self-purchase order number uniqueness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5**

- [ ] 5. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement gift box sharing functionality
  - [ ] 6.1 Create GiftBoxShareService
    - Implement generateShareLink method with unique token
    - Implement getSharedGiftBox method with token validation
    - Track access count
    - Handle expired tokens
    - _Requirements: 8.3, 8.4_

  - [ ] 6.2 Create GiftBoxShareController
    - Implement POST /api/gift-boxes/{id}/share endpoint
    - Validate share form (name, email or phone required)
    - Generate unique share token
    - Implement GET /api/gift-boxes/shared/{token} endpoint
    - Return gift box with all product details
    - Implement POST /api/gift-boxes/shared/{token}/add-to-cart endpoint
    - Add all gift box items to user's cart
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [ ] 6.3 Write property tests for gift sharing
    - **Property 26: Share form validation**
    - **Property 27: Share link generation and uniqueness**
    - **Property 28: Shared gift box display completeness**
    - **Property 29: Add shared box to cart**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**

- [ ] 7. Implement enhanced profile API
  - [ ] 7.1 Create ProfileController
    - Implement GET /api/profile endpoint
    - Aggregate account information, orders, gift boxes, and wishlist
    - Include gift indicators in order history
    - Include recipient information for gift orders
    - Implement PUT /api/profile endpoint for updates
    - Return confirmation message on successful update
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

  - [ ] 7.2 Write property tests for profile
    - **Property 21: Profile display completeness**
    - **Property 22: Profile update persistence**
    - **Property 23: Profile order history completeness**
    - **Property 24: Profile gift box display**
    - **Validates: Requirements 5.1, 5.3, 5.4, 5.5**

- [ ] 8. Enhance database seeders
  - [ ] 8.1 Create EnhancedUserSeeder
    - Generate 20+ users with varied names using Faker
    - Generate diverse email addresses
    - Vary account creation dates across realistic time range
    - Include mix of active and inactive accounts
    - _Requirements: 7.1, 10.2_

  - [ ] 8.2 Create EnhancedProductSeeder
    - Generate 50+ products with gift and flower appropriate names
    - Use realistic descriptions and prices
    - Vary stock quantities
    - Include some out-of-stock products
    - Associate products with appropriate categories
    - _Requirements: 7.3_

  - [ ] 8.3 Create EnhancedOrderSeeder
    - Generate sample orders with varied statuses
    - Distribute order dates across realistic time range (last 6 months)
    - Include both regular and gift orders
    - Vary order totals and item counts
    - _Requirements: 7.4, 10.3_

  - [ ] 8.4 Create GiftBoxSeeder
    - Generate sample gift boxes for users
    - Populate with appropriate product combinations
    - Include gift boxes in different statuses (active, sent, purchased)
    - Add recipient information for sent gift boxes
    - _Requirements: 7.5_

  - [ ] 8.5 Update DatabaseSeeder
    - Call all enhanced seeders in correct order
    - Ensure referential integrity
    - Add admin user if not exists
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Update global CSS for sharp corners
  - [ ] 9.1 Configure Tailwind for no rounded corners
    - Update tailwind.config.ts to set default borderRadius to 0
    - Remove or override any rounded-* utility classes
    - Create utility class for sharp corners if needed
    - _Requirements: 6.1_

  - [ ] 9.2 Update global styles
    - Add global CSS rule to remove border-radius from all elements
    - Override any third-party component rounded styles
    - Ensure images display without rounded corners
    - _Requirements: 6.1_

  - [ ] 9.3 Write property test for UI styling
    - **Property 25: No rounded corners on UI components**
    - **Validates: Requirements 6.1**

- [ ] 10. Build gift box management frontend
  - [ ] 10.1 Create gift box components
    - Build GiftBoxList component to display all gift boxes
    - Build GiftBoxCard component for individual gift box preview
    - Build GiftBoxDetail component for full gift box view
    - Build GiftBoxForm component for create/edit
    - Build AddToGiftBoxButton component
    - Apply sharp corner styling to all components
    - _Requirements: 1.4, 4.1, 4.2, 4.5, 6.1_

  - [ ] 10.2 Create gift box management page
    - Build page at /gift-boxes route
    - Display list of customer's gift boxes
    - Add create new gift box button
    - Implement gift box detail view
    - Add edit and delete functionality
    - Handle loading and error states
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 10.3 Implement gift box operations
    - Add product to gift box functionality
    - Update item quantity functionality
    - Remove item from gift box functionality
    - Update gift box total on changes
    - Handle API errors gracefully
    - _Requirements: 1.2, 1.3, 1.5_

- [ ] 11. Build gift sending frontend
  - [ ] 11.1 Create gift sending components
    - Build SendGiftForm component with recipient fields
    - Build RecipientInfoForm component (name, phone, address)
    - Build GiftMessageInput component for personalized message
    - Build GiftConfirmation component for order confirmation
    - Apply sharp corner styling
    - _Requirements: 2.1, 2.2, 9.1, 9.5, 6.1_

  - [ ] 11.2 Implement gift sending flow
    - Add "Send as Gift" button to gift box detail page
    - Display gift sending form with validation
    - Implement real-time validation feedback
    - Show gift box contents and total in form
    - Handle form submission
    - Display confirmation with order details
    - _Requirements: 2.1, 2.2, 2.3, 9.2, 9.3, 9.4, 9.5_

  - [ ] 11.3 Implement self-purchase flow
    - Add "Purchase for Myself" button to gift box detail page
    - Skip recipient information for self-purchase
    - Use customer's shipping information
    - Display order confirmation
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 11.4 Write property tests for gift forms
    - **Property 30: Gift form validation and error display**
    - **Property 31: Gift submission confirmation**
    - **Property 32: Gift form displays box contents**
    - **Validates: Requirements 9.3, 9.4, 9.5**

- [ ] 12. Build gift box sharing frontend
  - [ ] 12.1 Create sharing components
    - Build ShareGiftBoxButton component
    - Build ShareGiftBoxModal component with recipient form
    - Build SharedGiftBoxView component for public view
    - Build AddSharedBoxToCart component
    - Apply sharp corner styling
    - _Requirements: 8.1, 8.4, 8.5, 6.1_

  - [ ] 12.2 Implement sharing flow
    - Add share button to gift box detail page
    - Display share form modal with validation
    - Generate and display shareable link
    - Provide copy link functionality
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 12.3 Create shared gift box page
    - Build page at /shared/gift-boxes/[token] route
    - Display gift box with all product details
    - Handle invalid/expired tokens gracefully
    - Add "Add to Cart" button for entire gift box
    - Implement add all items to cart functionality
    - _Requirements: 8.4, 8.5_

- [ ] 13. Build enhanced user profile page
  - [ ] 13.1 Create profile components
    - Build UserProfile main layout component
    - Build ProfileHeader component for account info
    - Build ProfileOrderHistory component with gift indicators
    - Build ProfileGiftBoxes component with action buttons
    - Build ProfileWishlist component
    - Build ProfileSettings component for account updates
    - Apply sharp corner styling to all components
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 6.1_

  - [ ] 13.2 Implement profile page
    - Create page at /profile or /account route
    - Organize sections with clear visual separation
    - Display account information
    - Display order history with status, date, total, recipient info
    - Display gift boxes with view/edit/send actions
    - Display wishlist
    - Add edit profile functionality
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 13.3 Implement profile updates
    - Create profile edit form
    - Implement form validation
    - Handle profile update submission
    - Display confirmation message on success
    - Handle errors gracefully
    - _Requirements: 5.3_

- [ ] 14. Update existing UI components for sharp corners
  - [ ] 14.1 Update product components
    - Remove rounded corners from ProductCard
    - Update ProductDetail styling
    - Update product images to sharp corners
    - _Requirements: 6.1_

  - [ ] 14.2 Update cart components
    - Remove rounded corners from CartDrawer
    - Update CartItem styling
    - Update CartSummary styling
    - _Requirements: 6.1_

  - [ ] 14.3 Update form components
    - Remove rounded corners from all form inputs
    - Update button styling to rectangular
    - Update modal/dialog styling
    - _Requirements: 6.1_

  - [ ] 14.4 Update layout components
    - Remove rounded corners from Header
    - Update Footer styling
    - Update card containers throughout app
    - _Requirements: 6.1_

- [ ] 15. Add navigation and integration
  - [ ] 15.1 Update navigation
    - Add "Gift Boxes" link to main navigation
    - Add gift box icon to header
    - Update profile link to new enhanced profile
    - _Requirements: 4.1, 5.1_

  - [ ] 15.2 Integrate gift box with product pages
    - Add "Add to Gift Box" button on product detail pages
    - Show modal to select which gift box
    - Handle adding product to selected gift box
    - _Requirements: 1.2_

  - [ ] 15.3 Update cart to support gift box purchases
    - Add option to create gift box from cart
    - Link to gift box functionality from cart
    - _Requirements: 1.1_

- [ ] 16. Implement error handling and loading states
  - [ ] 16.1 Add comprehensive error handling
    - Display user-friendly error messages for gift box operations
    - Handle validation errors in gift sending forms
    - Handle expired/invalid share links gracefully
    - Show appropriate messages for failures
    - _Requirements: 8.4, 9.3_

  - [ ] 16.2 Add loading states
    - Show loading indicators during gift box operations
    - Disable forms during submission
    - Add skeleton loaders for gift box lists
    - Prevent duplicate submissions
    - _Requirements: 2.3, 3.1_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Test and refine UI consistency
  - Verify all components use sharp corners
  - Test responsive design across devices
  - Ensure consistent spacing and typography
  - Verify elegant visual separation in profile
  - Test all gift box workflows end-to-end
  - _Requirements: 5.2, 6.1_

- [ ] 19. Run enhanced seeders and verify data
  - Run database migrations
  - Run enhanced seeders
  - Verify realistic data is generated
  - Test with seeded data in development
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 10.2, 10.3_

- [ ] 20. Documentation and cleanup
  - Document gift box API endpoints
  - Update README with gift box features
  - Document seeder usage
  - Add comments to complex gift box logic
  - _Requirements: 1.1, 2.1, 4.1, 7.1_

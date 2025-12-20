# Gift Box and UI Enhancements - Design Document

## Overview

This feature extends the BloomCart e-commerce platform with gift box functionality, enhanced gift sharing capabilities, refined UI design, and an improved user profile experience. The gift box system allows customers to create curated collections of products that can be sent to friends with personalized messages or purchased for themselves. The UI improvements focus on a cleaner, more modern aesthetic by removing all rounded corners and refining the design language. The user profile is enhanced to provide a comprehensive, well-organized account management experience. Additionally, database seeders are improved to generate more realistic and comprehensive test data.

## Architecture

### System Integration

This feature integrates with the existing BloomCart architecture:

1. **Backend Extensions**
   - New models: GiftBox, GiftBoxItem, GiftBoxShare
   - New controllers: GiftBoxController, GiftBoxShareController
   - Extended Order model to support gift box orders
   - Enhanced seeders for realistic data generation

2. **Frontend Extensions**
   - New pages: Gift Box Management, Gift Box Detail, Send Gift Form, Shared Gift Box View
   - Enhanced User Profile page with gift box section
   - UI component updates to remove rounded corners
   - Global CSS updates for sharp, modern design

3. **Database Extensions**
   - New tables: gift_boxes, gift_box_items, gift_box_shares
   - Extended orders table with gift box reference and recipient information

### Technology Stack

Builds on existing BloomCart stack:
- **Backend**: Laravel 10.x, MySQL 8.0+, Laravel Sanctum
- **Frontend**: Next.js 14.x, React 18.x, TypeScript, Tailwind CSS
- **Testing**: PHPUnit with Pest (property-based testing), Jest with fast-check

## Components and Interfaces

### Backend Components

#### 1. Gift Box Management Module
- **Controllers**: `GiftBoxController`
- **Models**: `GiftBox`, `GiftBoxItem`
- **Services**: `GiftBoxService`
- **Responsibilities**: CRUD operations for gift boxes, item management, total calculation

#### 2. Gift Box Sharing Module
- **Controllers**: `GiftBoxShareController`
- **Models**: `GiftBoxShare`
- **Services**: `GiftBoxShareService`
- **Responsibilities**: Generate share links, track shares, retrieve shared gift boxes

#### 3. Gift Order Module
- **Controllers**: `GiftOrderController` (extends OrderController)
- **Services**: `GiftOrderService`
- **Responsibilities**: Create orders from gift boxes, handle recipient information, send gifts

#### 4. Enhanced Seeder Module
- **Seeders**: `EnhancedUserSeeder`, `EnhancedProductSeeder`, `EnhancedOrderSeeder`, `GiftBoxSeeder`
- **Factories**: Enhanced factories with realistic data
- **Responsibilities**: Generate comprehensive, realistic test data

### Frontend Components

#### 1. Gift Box Components
- `GiftBoxList`: Display all customer's gift boxes
- `GiftBoxCard`: Individual gift box preview
- `GiftBoxDetail`: Full gift box view with items
- `GiftBoxForm`: Create/edit gift box
- `AddToGiftBoxButton`: Add product to gift box

#### 2. Gift Sending Components
- `SendGiftForm`: Form for sending gift to friend
- `RecipientInfoForm`: Recipient details input
- `GiftMessageInput`: Personalized message input
- `GiftConfirmation`: Order confirmation for gifts

#### 3. Gift Sharing Components
- `ShareGiftBoxButton`: Share gift box button
- `ShareGiftBoxModal`: Share form modal
- `SharedGiftBoxView`: Public view of shared gift box
- `AddSharedBoxToCart`: Add entire shared box to cart

#### 4. Enhanced Profile Components
- `UserProfile`: Main profile page layout
- `ProfileHeader`: Account information section
- `ProfileOrderHistory`: Orders with gift indicators
- `ProfileGiftBoxes`: Gift box management section
- `ProfileWishlist`: Wishlist section
- `ProfileSettings`: Account settings

### API Endpoints

#### Gift Box Endpoints
- `GET /api/gift-boxes` - List customer's gift boxes
- `POST /api/gift-boxes` - Create new gift box
- `GET /api/gift-boxes/{id}` - Get gift box details
- `PUT /api/gift-boxes/{id}` - Update gift box (name)
- `DELETE /api/gift-boxes/{id}` - Delete gift box
- `POST /api/gift-boxes/{id}/items` - Add item to gift box
- `PUT /api/gift-boxes/{id}/items/{itemId}` - Update item quantity
- `DELETE /api/gift-boxes/{id}/items/{itemId}` - Remove item from gift box

#### Gift Sending Endpoints
- `POST /api/gift-boxes/{id}/send` - Send gift box to friend
- `POST /api/gift-boxes/{id}/purchase` - Purchase gift box for self

#### Gift Sharing Endpoints
- `POST /api/gift-boxes/{id}/share` - Generate share link
- `GET /api/gift-boxes/shared/{token}` - Access shared gift box
- `POST /api/gift-boxes/shared/{token}/add-to-cart` - Add shared box to cart

#### Enhanced Profile Endpoint
- `GET /api/profile` - Get comprehensive profile data (account, orders, gift boxes, wishlist)
- `PUT /api/profile` - Update profile information

## Data Models

### Database Schema

#### gift_boxes
- id (PK)
- user_id (FK → users)
- name (string)
- status (enum: 'active', 'sent', 'purchased')
- created_at
- updated_at

#### gift_box_items
- id (PK)
- gift_box_id (FK → gift_boxes)
- product_id (FK → products)
- quantity (integer)
- price_at_addition (decimal)
- created_at
- updated_at

#### gift_box_shares
- id (PK)
- gift_box_id (FK → gift_boxes)
- user_id (FK → users)
- share_token (unique)
- recipient_name (string, nullable)
- recipient_email (string, nullable)
- recipient_phone (string, nullable)
- access_count (integer)
- created_at
- expires_at

#### orders (extended)
- ... (existing fields)
- gift_box_id (FK → gift_boxes, nullable)
- is_gift (boolean)
- recipient_name (string, nullable)
- recipient_phone (string, nullable)
- recipient_address (text, nullable)
- gift_message (text, nullable)
- sender_name (string, nullable)

### Relationships

- User → GiftBoxes (one-to-many)
- GiftBox → GiftBoxItems (one-to-many)
- Product → GiftBoxItems (one-to-many)
- GiftBox → GiftBoxShares (one-to-many)
- GiftBox → Orders (one-to-many)
- User → GiftBoxShares (one-to-many)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:
- Gift box item operations (add, increment, remove) are similar to cart operations and can share testing patterns
- Display completeness properties (1.4, 5.1, 5.4, 5.5, 8.4, 9.5) all verify that required information is present
- Validation properties (2.1, 8.2, 9.3) all test that required fields are enforced
- Status update properties (2.5, 3.4) both verify state transitions and preservation
- UI component styling (6.2-6.5) are all covered by the general no-rounded-corners rule (6.1)

The following properties represent the unique, non-redundant validation requirements:

### Gift Box Management Properties

**Property 1: Gift box creation associates with customer**
*For any* customer, creating a new gift box should result in an empty gift box that is associated with that customer's account.
**Validates: Requirements 1.1**

**Property 2: Adding product to gift box sets quantity to one**
*For any* gift box and product not already in the box, adding the product should result in a gift box item with quantity 1.
**Validates: Requirements 1.2**

**Property 3: Adding existing product increments quantity**
*For any* gift box containing a product, adding the same product again should increment that product's quantity by 1 without creating a duplicate item.
**Validates: Requirements 1.3**

**Property 4: Gift box display completeness**
*For any* gift box with items, the display should show all items with their product details, quantities, and the correct total price (sum of quantity × price for all items).
**Validates: Requirements 1.4**

**Property 5: Item removal updates gift box**
*For any* gift box item, removing it should result in the item no longer appearing in the gift box and the total being recalculated without that item.
**Validates: Requirements 1.5**

### Gift Sending Properties

**Property 6: Gift sending requires recipient information**
*For any* gift box send attempt, submitting without friend's name, phone number, or delivery address should be rejected with validation errors indicating the missing fields.
**Validates: Requirements 2.1**

**Property 7: Gift message inclusion**
*For any* gift box being sent, including a personalized message should result in that message being stored with the order.
**Validates: Requirements 2.2**

**Property 8: Gift order creation from gift box**
*For any* gift box with items and valid recipient information, completing the send operation should create an order containing all gift box items with their quantities and prices.
**Validates: Requirements 2.3**

**Property 9: Gift order stores sender and recipient**
*For any* gift order, the order should contain both the sender's information (from the authenticated user) and the recipient's information (from the form).
**Validates: Requirements 2.4**

**Property 10: Sent gift box status and preservation**
*For any* gift box, successfully sending it should update its status to 'sent' and the gift box should remain accessible in the customer's gift history.
**Validates: Requirements 2.5**

### Self-Purchase Properties

**Property 11: Self-purchase order creation**
*For any* gift box with items, purchasing it for self should create an order containing all gift box items.
**Validates: Requirements 3.1**

**Property 12: Self-purchase uses customer shipping**
*For any* gift box self-purchase, the created order should use the customer's own shipping information, not recipient information.
**Validates: Requirements 3.2**

**Property 13: Self-purchase does not require recipient**
*For any* gift box self-purchase attempt, submitting without recipient information should succeed and create a valid order.
**Validates: Requirements 3.3**

**Property 14: Purchased gift box status and preservation**
*For any* gift box, successfully purchasing it should update its status to 'purchased' and the gift box should remain accessible in the customer's order history.
**Validates: Requirements 3.4**

**Property 15: Self-purchase order number uniqueness**
*For any* two gift box self-purchases, they should have different order numbers.
**Validates: Requirements 3.5**

### Gift Box Management Properties

**Property 16: Active gift box listing**
*For any* customer with multiple gift boxes in different statuses, viewing their gift boxes should display only active gift boxes with their names and item counts.
**Validates: Requirements 4.1**

**Property 17: Gift box name assignment**
*For any* gift box creation with a provided name, the gift box should be created with that name stored.
**Validates: Requirements 4.2**

**Property 18: Gift box name update persistence**
*For any* gift box, updating its name should persist the change such that subsequent retrievals reflect the updated name.
**Validates: Requirements 4.3**

**Property 19: Gift box deletion cascades to items**
*For any* gift box with items, deleting the gift box should remove both the gift box and all its items from the database.
**Validates: Requirements 4.4**

**Property 20: Gift box timestamp display**
*For any* gift box, the display should include both the creation date and last modified date.
**Validates: Requirements 4.5**

### Profile Properties

**Property 21: Profile display completeness**
*For any* customer, accessing their profile should display all of: account information, order history, gift boxes, and wishlist.
**Validates: Requirements 5.1**

**Property 22: Profile update persistence**
*For any* customer, updating profile information should persist the changes and return a confirmation message.
**Validates: Requirements 5.3**

**Property 23: Profile order history completeness**
*For any* customer's order history in the profile, each order should display status, date, total, and for gift orders, recipient information.
**Validates: Requirements 5.4**

**Property 24: Profile gift box display**
*For any* customer's profile, the gift box section should display all gift boxes with access to view, edit, and send actions.
**Validates: Requirements 5.5**

### UI Design Properties

**Property 25: No rounded corners on UI components**
*For any* rendered UI component (buttons, cards, containers, form inputs, images), the component should have border-radius of 0 or no border-radius styling applied.
**Validates: Requirements 6.1**

### Gift Sharing Properties

**Property 26: Share form validation**
*For any* gift box share attempt, submitting without required fields (name and either email or phone) should be rejected with specific validation errors.
**Validates: Requirements 8.2**

**Property 27: Share link generation and uniqueness**
*For any* gift box, generating a share link should produce a unique token that can be used to access that specific gift box.
**Validates: Requirements 8.3**

**Property 28: Shared gift box display completeness**
*For any* valid share token, accessing the shared gift box should display all products in the gift box with their details (name, price, image, quantity).
**Validates: Requirements 8.4**

**Property 29: Add shared box to cart**
*For any* shared gift box, adding it to cart should add all products from the gift box to the user's cart with their respective quantities.
**Validates: Requirements 8.5**

**Property 30: Gift form validation and error display**
*For any* incomplete gift sending form submission, the system should reject it and display specific error messages for each missing or invalid field.
**Validates: Requirements 9.3**

**Property 31: Gift submission confirmation**
*For any* successful gift submission, the system should display a confirmation message that includes order details.
**Validates: Requirements 9.4**

**Property 32: Gift form displays box contents**
*For any* gift sending form, the form should display the gift box contents and total price.
**Validates: Requirements 9.5**

## Error Handling

### Backend Error Handling

1. **Gift Box Validation Errors**
   - Return 422 for invalid gift box operations (e.g., adding to non-existent box)
   - Return 404 for non-existent gift boxes
   - Return 403 for unauthorized access to other users' gift boxes

2. **Gift Sending Validation Errors**
   - Return 422 for missing recipient information
   - Return 422 for invalid email/phone formats
   - Provide field-specific error messages

3. **Gift Sharing Errors**
   - Return 404 for invalid/expired share tokens
   - Return 410 Gone for deleted gift boxes
   - Handle gracefully with user-friendly messages

4. **Transaction Handling**
   - Wrap gift order creation in database transactions
   - Roll back on any failure during order creation
   - Ensure gift box status updates are atomic

### Frontend Error Handling

1. **Form Validation**
   - Real-time validation for gift sending forms
   - Clear error messages near relevant fields
   - Prevent submission with invalid data

2. **Gift Box Operations**
   - Handle errors when adding/removing items
   - Display appropriate messages for failures
   - Maintain UI state consistency

3. **Sharing Errors**
   - Handle expired/invalid share links gracefully
   - Display helpful messages to recipients
   - Provide alternative actions (browse catalog)

## Testing Strategy

### Unit Testing

**Backend (PHPUnit)**
- Test gift box service methods (create, add item, remove item, calculate total)
- Test gift order creation logic
- Test share token generation and validation
- Test recipient information validation
- Test specific edge cases:
  - Empty gift box purchase attempts
  - Accessing deleted gift boxes via share links
  - Adding products to gift boxes after product deletion
  - Concurrent gift box modifications

**Frontend (Jest + React Testing Library)**
- Test gift box component rendering
- Test gift sending form validation
- Test share modal functionality
- Test profile page sections
- Test specific examples:
  - Share form displays when button clicked (8.1)
  - Real-time validation feedback (9.2)
  - Seeder creates expected data structure (7.1-7.5, 10.2-10.3)

### Property-Based Testing

**Backend (Pest PHP with Property Testing)**
- Configure each property test to run a minimum of 100 iterations
- Each property-based test MUST be tagged with: `// Feature: gift-box-ui-enhancements, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

**Property Test Coverage:**
- Gift box operations (Properties 1-5): Generate random gift boxes and products, test CRUD operations
- Gift sending (Properties 6-10): Generate random gift boxes and recipient data, test order creation
- Self-purchase (Properties 11-15): Generate random gift boxes, test self-purchase flow
- Gift box management (Properties 16-20): Generate random gift boxes with varied states, test listing and updates
- Profile operations (Properties 21-24): Generate random user data, test profile display and updates
- Gift sharing (Properties 26-29): Generate random gift boxes and share data, test sharing flow
- Form validation (Properties 30-32): Generate random valid/invalid form data, test validation

**Frontend (fast-check with Jest)**
- Configure each property test to run a minimum of 100 iterations
- Each property-based test MUST be tagged with: `// Feature: gift-box-ui-enhancements, Property {number}: {property_text}`

**Property Test Coverage:**
- UI styling (Property 25): Generate random component types, verify no border-radius
- Form validation: Generate random valid/invalid recipient data
- Gift box calculations: Generate random gift box states, verify totals

### Integration Testing

**API Integration Tests**
- Test complete gift box workflow (create → add items → send to friend)
- Test self-purchase workflow (create → add items → purchase for self)
- Test sharing workflow (create → share → access via link → add to cart)
- Test profile data aggregation (verify all sections load correctly)

### Test Data Generation

**For Property-Based Tests:**
- Generate random gift box names
- Generate random recipient information (names, emails, phones, addresses)
- Generate random gift messages
- Generate random product combinations for gift boxes
- Generate random user profiles with varied data
- Use constraints to ensure generated data is realistic (e.g., valid email formats, positive prices)

## Design Patterns and Best Practices

### Backend Patterns

1. **Service Layer for Gift Box Logic**
   - GiftBoxService handles all gift box operations
   - Separate concerns from controllers
   - Reusable across different endpoints

2. **Transaction Management**
   - Wrap gift order creation in transactions
   - Ensure atomicity of multi-step operations
   - Roll back on any failure

3. **Token Generation**
   - Use secure random token generation for shares
   - Set appropriate expiration times
   - Track access for analytics

### Frontend Patterns

1. **Form State Management**
   - Use controlled components for forms
   - Implement real-time validation
   - Clear error states appropriately

2. **Component Composition**
   - Break down complex forms into smaller components
   - Reuse recipient information form across features
   - Compose profile page from section components

3. **Styling Consistency**
   - Create Tailwind utility classes for sharp corners
   - Override default rounded styles globally
   - Ensure consistent application across all components

### UI Design Guidelines

1. **Sharp Corner Implementation**
   - Set `rounded-none` class on all components
   - Override Tailwind defaults in config: `borderRadius: { DEFAULT: '0' }`
   - Remove any `rounded-*` classes from existing components

2. **Visual Hierarchy**
   - Use borders and shadows instead of rounded corners for separation
   - Maintain elegant spacing and typography
   - Use subtle transitions for interactions

3. **Form Design**
   - Clear labels and field organization
   - Inline validation feedback
   - Prominent call-to-action buttons

### Seeder Best Practices

1. **Realistic Data Generation**
   - Use Faker library for varied, realistic data
   - Create appropriate product names for gift/flower shop
   - Generate realistic date ranges for orders

2. **Data Relationships**
   - Ensure referential integrity
   - Create logical product-category associations
   - Generate gift boxes with appropriate product combinations

3. **Quantity and Variety**
   - Create sufficient data for testing (50+ products, 20+ users)
   - Vary order statuses and dates
   - Include edge cases (empty categories, out-of-stock products)

## Performance Considerations

1. **Database Optimization**
   - Index gift_box_id and user_id in gift_box_items
   - Index share_token in gift_box_shares
   - Eager load gift box items when fetching gift boxes

2. **Query Optimization**
   - Use pagination for gift box listings
   - Limit profile data queries to necessary fields
   - Cache share token lookups

3. **Frontend Optimization**
   - Lazy load gift box details
   - Implement optimistic UI updates for gift box operations
   - Cache profile data with React Query

## Security Considerations

1. **Authorization**
   - Verify user owns gift box before operations
   - Validate share tokens before granting access
   - Prevent unauthorized access to other users' gift boxes

2. **Input Validation**
   - Validate all recipient information
   - Sanitize gift messages
   - Validate email and phone formats

3. **Share Token Security**
   - Use cryptographically secure random tokens
   - Implement token expiration
   - Rate limit share link generation

## Migration Strategy

1. **Database Migrations**
   - Create gift_boxes table
   - Create gift_box_items table
   - Create gift_box_shares table
   - Extend orders table with gift fields
   - Add indexes for performance

2. **UI Updates**
   - Update global CSS to remove rounded corners
   - Update all existing components to use sharp corners
   - Test across all pages for consistency

3. **Seeder Updates**
   - Enhance existing seeders with more realistic data
   - Add new GiftBoxSeeder
   - Update product names to be gift-appropriate

## Future Enhancements

- Gift box templates (pre-curated collections)
- Gift wrapping options
- Scheduled gift delivery
- Gift registry functionality
- Gift box recommendations based on occasion
- Social sharing integration (Facebook, WhatsApp)
- Gift tracking for recipients
- Thank you note functionality

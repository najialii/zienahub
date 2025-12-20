# Requirements Document

## Introduction

BloomCart is an elegant e-commerce platform specializing in gifts and flowers. The system enables customers to browse categorized products, manage shopping carts, share gifts with friends, and complete purchases. The platform features a sophisticated black, gray, and white color scheme with an elegant design aesthetic. The system includes both customer-facing functionality and comprehensive administrative capabilities with reporting and analytics.

## Glossary

- **BloomCart System**: The complete e-commerce platform including frontend, backend, and administrative interfaces
- **Customer**: A registered or guest user who browses and purchases products
- **Administrator**: A privileged user with access to the admin dashboard and management functions
- **Product**: An item available for purchase (gifts or flowers)
- **Category**: A top-level classification for products (e.g., "Flowers", "Gift Boxes")
- **Subcategory**: A secondary classification within a category (e.g., "Roses", "Birthday Gifts")
- **Cart**: A temporary collection of products selected by a customer for purchase
- **Wishlist**: A collection of products marked with "like" by a customer
- **Gift Share**: A feature allowing customers to share product links with friends
- **Order**: A completed purchase transaction
- **Backend API**: The Laravel-based server application handling business logic and data persistence
- **Frontend Application**: The Next.js-based client application providing the user interface
- **Admin Dashboard**: The administrative interface for managing the platform

## Requirements

### Requirement 1

**User Story:** As a customer, I want to browse products organized by categories and subcategories, so that I can easily find the gifts and flowers I'm looking for.

#### Acceptance Criteria

1. WHEN a customer accesses the homepage, THEN the BloomCart System SHALL display all available top-level categories
2. WHEN a customer selects a category, THEN the BloomCart System SHALL display all subcategories within that category
3. WHEN a customer selects a subcategory, THEN the BloomCart System SHALL display all products belonging to that subcategory
4. WHEN displaying products, THEN the BloomCart System SHALL show product name, image, price, and availability status
5. WHEN no products exist in a subcategory, THEN the BloomCart System SHALL display an appropriate message indicating the subcategory is empty

### Requirement 2

**User Story:** As a customer, I want to add products to my shopping cart, so that I can purchase multiple items in a single transaction.

#### Acceptance Criteria

1. WHEN a customer clicks the add-to-cart button on a product, THEN the BloomCart System SHALL add the product to the customer's cart with quantity one
2. WHEN a customer adds a product already in the cart, THEN the BloomCart System SHALL increment the quantity of that product
3. WHEN a customer views their cart, THEN the BloomCart System SHALL display all cart items with product details, quantities, individual prices, and total price
4. WHEN a customer modifies the quantity of a cart item, THEN the BloomCart System SHALL update the cart total immediately
5. WHEN a customer removes an item from the cart, THEN the BloomCart System SHALL delete that item and recalculate the cart total

### Requirement 3

**User Story:** As a customer, I want to like products and view my liked items, so that I can save products I'm interested in for later consideration.

#### Acceptance Criteria

1. WHEN a customer clicks the like button on a product, THEN the BloomCart System SHALL add that product to the customer's wishlist
2. WHEN a customer clicks the like button on an already-liked product, THEN the BloomCart System SHALL remove that product from the wishlist
3. WHEN a customer views their wishlist, THEN the BloomCart System SHALL display all liked products with their current details
4. WHEN a product is deleted by an administrator, THEN the BloomCart System SHALL remove that product from all customer wishlists
5. WHILE viewing products, THEN the BloomCart System SHALL indicate which products are in the customer's wishlist

### Requirement 4

**User Story:** As a customer, I want to share gift products with friends, so that I can recommend items or coordinate gift purchases.

#### Acceptance Criteria

1. WHEN a customer clicks the share button on a product, THEN the BloomCart System SHALL generate a shareable link for that product
2. WHEN a customer shares a product, THEN the BloomCart System SHALL provide options to share via common methods (copy link, email, social media)
3. WHEN a friend accesses a shared product link, THEN the BloomCart System SHALL display the product details page
4. WHEN a shared product is no longer available, THEN the BloomCart System SHALL display an appropriate message to the recipient
5. WHEN generating a share link, THEN the BloomCart System SHALL include product identification in the URL

### Requirement 5

**User Story:** As a customer, I want to register and authenticate with the platform, so that I can access personalized features and track my orders.

#### Acceptance Criteria

1. WHEN a customer submits valid registration information, THEN the BloomCart System SHALL create a new customer account
2. WHEN a customer submits invalid registration information, THEN the BloomCart System SHALL reject the registration and display specific validation errors
3. WHEN a registered customer submits valid login credentials, THEN the BloomCart System SHALL authenticate the customer and create a session
4. WHEN a customer submits invalid login credentials, THEN the BloomCart System SHALL reject the authentication attempt and display an error message
5. WHEN a customer logs out, THEN the BloomCart System SHALL terminate the session and clear authentication tokens

### Requirement 6

**User Story:** As a customer, I want to complete purchases through a checkout process, so that I can receive the products I've selected.

#### Acceptance Criteria

1. WHEN a customer initiates checkout, THEN the BloomCart System SHALL display a summary of cart items and total cost
2. WHEN a customer provides shipping information, THEN the BloomCart System SHALL validate the address format and required fields
3. WHEN a customer completes payment, THEN the BloomCart System SHALL create an order record with all transaction details
4. WHEN an order is created, THEN the BloomCart System SHALL empty the customer's cart
5. WHEN an order is successfully placed, THEN the BloomCart System SHALL provide an order confirmation with a unique order number

### Requirement 7

**User Story:** As an administrator, I want to manage categories and subcategories, so that I can organize the product catalog effectively.

#### Acceptance Criteria

1. WHEN an administrator creates a new category, THEN the BloomCart System SHALL add the category to the catalog
2. WHEN an administrator creates a new subcategory, THEN the BloomCart System SHALL associate it with the specified parent category
3. WHEN an administrator updates a category or subcategory, THEN the BloomCart System SHALL save the changes and reflect them immediately
4. WHEN an administrator deletes a category, THEN the BloomCart System SHALL prevent deletion if subcategories or products exist within it
5. WHEN an administrator deletes a subcategory, THEN the BloomCart System SHALL prevent deletion if products exist within it

### Requirement 8

**User Story:** As an administrator, I want to manage products, so that I can maintain an accurate and up-to-date catalog.

#### Acceptance Criteria

1. WHEN an administrator creates a new product, THEN the BloomCart System SHALL add the product with all specified attributes to the catalog
2. WHEN an administrator updates a product, THEN the BloomCart System SHALL save the changes and reflect them on the frontend immediately
3. WHEN an administrator deletes a product, THEN the BloomCart System SHALL remove it from the catalog and all customer carts
4. WHEN an administrator uploads a product image, THEN the BloomCart System SHALL store the image and associate it with the product
5. WHEN an administrator assigns a product to a subcategory, THEN the BloomCart System SHALL validate that the subcategory exists

### Requirement 9

**User Story:** As an administrator, I want to view sales reports and analytics, so that I can make informed business decisions.

#### Acceptance Criteria

1. WHEN an administrator accesses the reports section, THEN the BloomCart System SHALL display total sales revenue for selectable time periods
2. WHEN an administrator views product reports, THEN the BloomCart System SHALL show the most popular products by quantity sold
3. WHEN an administrator views category reports, THEN the BloomCart System SHALL display sales distribution across categories
4. WHEN an administrator views customer reports, THEN the BloomCart System SHALL show customer registration trends and order counts
5. WHEN an administrator exports a report, THEN the BloomCart System SHALL generate a downloadable file in a standard format (CSV or PDF)

### Requirement 10

**User Story:** As an administrator, I want to manage customer accounts, so that I can provide support and handle account issues.

#### Acceptance Criteria

1. WHEN an administrator views the customer list, THEN the BloomCart System SHALL display all registered customers with their basic information
2. WHEN an administrator searches for a customer, THEN the BloomCart System SHALL return matching results based on name, email, or customer ID
3. WHEN an administrator views a customer profile, THEN the BloomCart System SHALL display the customer's order history and account details
4. WHEN an administrator deactivates a customer account, THEN the BloomCart System SHALL prevent that customer from logging in
5. WHEN an administrator reactivates a customer account, THEN the BloomCart System SHALL restore login access for that customer

### Requirement 11

**User Story:** As an administrator, I want to manage orders, so that I can track fulfillment and handle customer service issues.

#### Acceptance Criteria

1. WHEN an administrator views the orders list, THEN the BloomCart System SHALL display all orders with status, customer, date, and total
2. WHEN an administrator updates an order status, THEN the BloomCart System SHALL save the new status and timestamp the change
3. WHEN an administrator views order details, THEN the BloomCart System SHALL display complete order information including items, customer, and shipping details
4. WHEN an administrator searches for orders, THEN the BloomCart System SHALL return results matching order number, customer name, or date range
5. WHEN an administrator cancels an order, THEN the BloomCart System SHALL update the order status to cancelled

### Requirement 12

**User Story:** As a developer, I want the backend API built with Laravel, so that the system has a robust, maintainable server architecture.

#### Acceptance Criteria

1. WHEN the Backend API receives a request, THEN the BloomCart System SHALL validate authentication tokens for protected endpoints
2. WHEN the Backend API processes data, THEN the BloomCart System SHALL validate all input against defined rules
3. WHEN the Backend API encounters an error, THEN the BloomCart System SHALL return appropriate HTTP status codes and error messages
4. WHEN the Backend API performs database operations, THEN the BloomCart System SHALL use Eloquent ORM for data access
5. WHEN the Backend API responds to requests, THEN the BloomCart System SHALL return data in JSON format

### Requirement 13

**User Story:** As a developer, I want the frontend built with Next.js, so that the application provides a fast, modern user experience.

#### Acceptance Criteria

1. WHEN the Frontend Application renders pages, THEN the BloomCart System SHALL use server-side rendering for initial page loads
2. WHEN the Frontend Application navigates between pages, THEN the BloomCart System SHALL use client-side routing for seamless transitions
3. WHEN the Frontend Application makes API calls, THEN the BloomCart System SHALL handle loading states and display appropriate feedback
4. WHEN the Frontend Application encounters API errors, THEN the BloomCart System SHALL display user-friendly error messages
5. WHEN the Frontend Application loads images, THEN the BloomCart System SHALL optimize image delivery for performance

### Requirement 14

**User Story:** As a customer, I want the interface to have an elegant black, gray, and white design, so that I have a premium shopping experience.

#### Acceptance Criteria

1. WHEN the Frontend Application renders any page, THEN the BloomCart System SHALL use only black, gray, and white colors in the design palette
2. WHEN the Frontend Application displays interactive elements, THEN the BloomCart System SHALL provide subtle hover effects and transitions
3. WHEN the Frontend Application renders text, THEN the BloomCart System SHALL use elegant typography with appropriate hierarchy
4. WHEN the Frontend Application displays product images, THEN the BloomCart System SHALL present them with clean borders and appropriate spacing
5. WHEN the Frontend Application renders on different screen sizes, THEN the BloomCart System SHALL maintain the elegant aesthetic across all devices

### Requirement 15

**User Story:** As a system administrator, I want the application to persist data reliably, so that customer and business information is never lost.

#### Acceptance Criteria

1. WHEN the BloomCart System writes data to the database, THEN the system SHALL use transactions to ensure data consistency
2. WHEN the BloomCart System encounters a database error, THEN the system SHALL roll back incomplete transactions
3. WHEN the BloomCart System stores sensitive data, THEN the system SHALL encrypt passwords using secure hashing algorithms
4. WHEN the BloomCart System performs data migrations, THEN the system SHALL maintain referential integrity between related tables
5. WHEN the BloomCart System backs up data, THEN the system SHALL ensure all related records are included in the backup

### Requirement 16

**User Story:** As a customer, I want to create gift boxes with multiple products, so that I can curate personalized gift collections for special occasions.

#### Acceptance Criteria

1. WHEN a customer creates a new gift box, THEN the BloomCart System SHALL create an empty gift box associated with that customer
2. WHEN a customer adds a product to a gift box, THEN the BloomCart System SHALL add the product with quantity one to that gift box
3. WHEN a customer adds a product already in the gift box, THEN the BloomCart System SHALL increment the quantity of that product in the gift box
4. WHEN a customer views a gift box, THEN the BloomCart System SHALL display all products in the gift box with their details, quantities, and total price
5. WHEN a customer removes a product from a gift box, THEN the BloomCart System SHALL delete that product from the gift box and recalculate the total

### Requirement 17

**User Story:** As a customer, I want to send gift boxes to friends with personalized messages, so that I can share thoughtful gifts with people I care about.

#### Acceptance Criteria

1. WHEN a customer sends a gift box to a friend, THEN the BloomCart System SHALL require the friend's name, phone number, and delivery address
2. WHEN a customer sends a gift box, THEN the BloomCart System SHALL allow the customer to include a personalized message with the gift
3. WHEN a customer completes sending a gift box, THEN the BloomCart System SHALL create an order with the gift box items and recipient information
4. WHEN a gift box order is created, THEN the BloomCart System SHALL store both the sender's information and the recipient's information
5. WHEN a gift box is sent, THEN the BloomCart System SHALL mark the gift box as sent and preserve it in the customer's gift history

### Requirement 18

**User Story:** As a customer, I want to purchase gift boxes for myself, so that I can buy curated collections of products.

#### Acceptance Criteria

1. WHEN a customer purchases a gift box for themselves, THEN the BloomCart System SHALL create an order with the gift box items
2. WHEN a customer purchases a gift box, THEN the BloomCart System SHALL use the customer's own shipping information
3. WHEN a gift box is purchased for self, THEN the BloomCart System SHALL not require recipient information
4. WHEN a gift box purchase is completed, THEN the BloomCart System SHALL mark the gift box as purchased and preserve it in the customer's order history
5. WHEN a customer completes a gift box purchase, THEN the BloomCart System SHALL provide an order confirmation with a unique order number

### Requirement 19

**User Story:** As a customer, I want to manage multiple gift boxes simultaneously, so that I can prepare gifts for different occasions and recipients.

#### Acceptance Criteria

1. WHEN a customer views their gift boxes, THEN the BloomCart System SHALL display all active gift boxes with their names and item counts
2. WHEN a customer creates a gift box, THEN the BloomCart System SHALL allow the customer to provide a name for the gift box
3. WHEN a customer edits a gift box name, THEN the BloomCart System SHALL update the gift box name
4. WHEN a customer deletes a gift box, THEN the BloomCart System SHALL remove the gift box and all its items
5. WHEN displaying gift boxes, THEN the BloomCart System SHALL show the creation date and last modified date for each gift box

### Requirement 20

**User Story:** As a customer, I want an improved user profile page, so that I can easily manage my account, orders, gift boxes, and wishlist in one place.

#### Acceptance Criteria

1. WHEN a customer accesses their profile page, THEN the BloomCart System SHALL display the customer's account information, order history, gift boxes, and wishlist
2. WHEN a customer views their profile, THEN the BloomCart System SHALL organize information into clear sections with elegant visual separation
3. WHEN a customer updates their profile information, THEN the BloomCart System SHALL save the changes and display a confirmation message
4. WHEN a customer views their order history in the profile, THEN the BloomCart System SHALL display orders with status, date, total, and recipient information for gift orders
5. WHEN a customer views their gift boxes in the profile, THEN the BloomCart System SHALL display all gift boxes with quick access to view, edit, or send each box

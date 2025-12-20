# Design Document

## Overview

This design document outlines the implementation of gift order functionality in the BloomCart e-commerce system. The feature allows customers to send products as gifts to recipients with personalized messages. The backend already supports gift fields in the Order model and OrderController, so this implementation focuses on:

1. Adding UI components to the checkout page for gift options
2. Implementing form state management for gift-specific fields
3. Ensuring proper data validation and submission
4. Maintaining clean, non-duplicated code structure
5. Preserving existing regular order functionality

## Architecture

### Component Structure

```
CheckoutPage (frontend/app/[locale]/checkout/page.tsx)
├── Header
├── Main Content
│   ├── Checkout Form (2/3 width)
│   │   ├── Gift Toggle Section (NEW)
│   │   ├── Contact Information Section
│   │   ├── Shipping/Recipient Address Section (MODIFIED)
│   │   ├── Gift Details Section (NEW - conditional)
│   │   │   ├── Recipient Contact Fields
│   │   │   ├── Gift Message Field
│   │   │   └── Sender Name Field
│   │   └── Payment Information Section
│   └── Order Summary (1/3 width)
└── Footer
```

### Data Flow

```
User Input → Form State → Validation → Order Payload → API → Backend → Database
                ↓
         Gift Toggle
                ↓
    Conditional Field Display
```

## Components and Interfaces

### Form State Interface

```typescript
interface CheckoutFormData {
  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Shipping/Recipient Address
  street: string;
  city: string;
  state: string;
  postalCode: string;
  
  // Gift-specific fields
  isGift: boolean;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  giftMessage: string;
  senderName: string;
}
```

### Order Payload Interface

```typescript
interface OrderPayload {
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
  total: number;
  
  // Shipping information (always required)
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  
  // Gift fields (conditional)
  is_gift?: boolean;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_address?: string;
  gift_message?: string;
  sender_name?: string;
  gift_box_id?: number;
}
```

## Data Models

### Existing Backend Models

The Order model already includes the following gift-related fields:
- `gift_box_id` (nullable foreign key)
- `is_gift` (boolean, default false)
- `recipient_name` (nullable string)
- `recipient_phone` (nullable string)
- `recipient_address` (nullable text)
- `gift_message` (nullable text)
- `sender_name` (nullable string)

No backend model changes are required.

### Frontend Type Extensions

Add gift-related fields to the existing types in `frontend/lib/types.ts`:

```typescript
export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  total_amount: number;
  status: string;
  
  // Shipping fields
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  
  // Gift fields
  is_gift: boolean;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_address?: string;
  gift_message?: string;
  sender_name?: string;
  gift_box_id?: number;
  
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Gift toggle controls field visibility
*For any* checkout form state, when isGift is true, recipient information fields should be visible, and when isGift is false, recipient fields should be hidden.
**Validates: Requirements 1.2**

### Property 2: Disabling gift clears recipient data
*For any* form state with recipient data entered, toggling isGift from true to false should clear all recipient-specific fields (recipientName, recipientPhone, recipientAddress, giftMessage).
**Validates: Requirements 1.3**

### Property 3: Gift order payload includes gift flag
*For any* order with isGift enabled, the constructed payload should contain is_gift: true.
**Validates: Requirements 1.4**

### Property 4: Regular order payload excludes gift flag
*For any* order with isGift disabled, the constructed payload should contain is_gift: false.
**Validates: Requirements 1.5**

### Property 5: Gift order validation requires recipient fields
*For any* gift order submission attempt, if any required recipient field (recipientName, recipientPhone, recipientAddress) is empty, the validation should fail and prevent submission.
**Validates: Requirements 2.2**

### Property 6: Recipient name minimum length validation
*For any* recipient name input in a gift order, names with fewer than 2 characters should fail validation.
**Validates: Requirements 2.3**

### Property 7: Recipient phone required validation
*For any* recipient phone input in a gift order, empty values should fail validation.
**Validates: Requirements 2.4**

### Property 8: Recipient address required validation
*For any* recipient address input in a gift order, empty values should fail validation.
**Validates: Requirements 2.5**

### Property 9: Gift message character limit
*For any* gift message input, the system should accept messages up to 500 characters and reject or truncate messages exceeding this limit.
**Validates: Requirements 3.2**

### Property 10: Gift message warning display
*For any* gift message exceeding 500 characters, a character count warning should be displayed to the user.
**Validates: Requirements 3.3**

### Property 11: Gift message included in payload
*For any* gift order with a non-empty gift message, the payload should include the gift_message field with the entered text.
**Validates: Requirements 3.4**

### Property 12: Optional gift message handling
*For any* gift order submitted without a gift message, the order should be accepted with gift_message as null or undefined.
**Validates: Requirements 3.5**

### Property 13: Sender name auto-population
*For any* checkout form where profile data is loaded and isGift is enabled, the sender name field should be pre-populated with the customer's full name (firstName + lastName).
**Validates: Requirements 4.2**

### Property 14: Sender name included in payload
*For any* gift order, the payload should include the sender_name field.
**Validates: Requirements 4.4**

### Property 15: Sender name fallback
*For any* gift order where sender name is empty, the system should use the shipping name (firstName + lastName) as the sender_name in the payload.
**Validates: Requirements 4.5**

### Property 16: Shipping address section title updates
*For any* checkout form, when isGift changes from false to true, the shipping address section title should update to indicate it's the recipient's delivery address.
**Validates: Requirements 5.2**

### Property 17: Toggle preserves shipping address
*For any* form state with shipping address data entered, toggling isGift should not clear the shipping address fields (street, city, state, postalCode).
**Validates: Requirements 5.5**

### Property 18: Conditional gift fields in payload
*For any* order payload, gift-specific fields (recipient_name, recipient_phone, recipient_address, gift_message, sender_name) should only be included when is_gift is true.
**Validates: Requirements 7.2**

### Property 19: Pre-submission validation
*For any* order submission attempt, all required field validations should be performed before making the API call.
**Validates: Requirements 7.3**

### Property 20: Specific validation error messages
*For any* validation failure, the system should display specific error messages identifying which fields are invalid.
**Validates: Requirements 7.4**

### Property 21: Backend error parsing
*For any* backend validation error response, the system should parse the error structure and display user-friendly messages for each field error.
**Validates: Requirements 7.5**

### Property 22: Regular order creation success
*For any* valid regular order (isGift: false) with all required shipping fields, the order should be successfully created via the API.
**Validates: Requirements 9.1**

### Property 23: Gift order creation success
*For any* valid gift order (isGift: true) with all required shipping and recipient fields, the order should be successfully created via the API with all gift data persisted.
**Validates: Requirements 9.2**

### Property 24: Backward compatibility maintained
*For any* regular order submission, the order creation logic should work identically to the pre-enhancement implementation.
**Validates: Requirements 9.3**

## Error Handling

### Validation Errors

The system implements multi-layer validation:

1. **Client-side validation** (immediate feedback):
   - Required field checks
   - Format validation (email, phone)
   - Length constraints (recipient name >= 2 chars, gift message <= 500 chars)
   - Conditional validation (gift fields only required when isGift is true)

2. **Pre-submission validation** (before API call):
   - Comprehensive check of all required fields
   - Prevents unnecessary API calls
   - Displays specific error messages

3. **Backend validation** (Laravel validation):
   - Server-side validation rules in OrderController
   - Returns structured error responses
   - Frontend parses and displays errors

### Error Display Strategy

```typescript
interface ValidationError {
  field: string;
  message: string;
}

// Display errors inline near the relevant field
// Show summary of errors at the top of the form
// Prevent form submission until errors are resolved
```

### API Error Handling

```typescript
try {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    
    // Parse Laravel validation errors
    if (errorData.errors) {
      displayValidationErrors(errorData.errors);
    } else {
      displayGenericError(errorData.message);
    }
  }
} catch (error) {
  // Network or unexpected errors
  displayNetworkError();
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific functionality:

1. **Form state management**:
   - Test isGift toggle updates state correctly
   - Test recipient field clearing when gift is disabled
   - Test sender name auto-population from profile

2. **Validation functions**:
   - Test required field validation
   - Test character length validation
   - Test conditional validation (gift fields only when isGift is true)

3. **Payload construction**:
   - Test regular order payload structure
   - Test gift order payload structure
   - Test conditional field inclusion

4. **Error handling**:
   - Test validation error display
   - Test backend error parsing
   - Test network error handling

### Property-Based Testing

Property-based tests will verify universal behaviors across many inputs using **fast-check** (JavaScript/TypeScript property testing library):

1. **Gift toggle property**: For any form state, toggling isGift should show/hide recipient fields appropriately
2. **Data clearing property**: For any recipient data, disabling gift should clear it
3. **Payload construction property**: For any order data, the payload should match the expected structure based on isGift
4. **Validation property**: For any invalid input, validation should fail with appropriate messages
5. **Order creation property**: For any valid order data, the API call should succeed

Each property-based test will run a minimum of 100 iterations with randomly generated test data.

### Integration Testing

Integration tests will verify end-to-end flows:

1. **Regular order flow**: Complete checkout as a regular order
2. **Gift order flow**: Complete checkout as a gift order with all fields
3. **Toggle behavior**: Switch between gift and regular order during checkout
4. **Error recovery**: Handle validation errors and retry submission
5. **Profile data integration**: Use saved profile data for auto-population

### Test Tagging Convention

Each property-based test will be tagged with:
```typescript
// Feature: gift-order-enhancement, Property 1: Gift toggle controls field visibility
```

This links the test directly to the correctness property in this design document.

## Implementation Notes

### State Management Approach

Use React useState for form state management:
- Single state object for all form fields
- Derived state for validation errors
- Effect hooks for auto-population and conditional logic

### Conditional Rendering Strategy

```typescript
{isGift && (
  <div className="gift-details-section">
    {/* Recipient fields */}
  </div>
)}
```

### Payload Construction

Create a single `buildOrderPayload` function that:
1. Always includes required shipping fields
2. Conditionally adds gift fields when isGift is true
3. Applies fallback logic (e.g., sender name defaults to shipping name)
4. Validates structure before returning

### Backward Compatibility

Ensure regular orders work exactly as before:
- Default isGift to false
- Don't send gift fields when isGift is false
- Maintain existing validation rules for regular orders
- No changes to existing order processing logic

### UI/UX Considerations

1. **Visual hierarchy**: Use borders, backgrounds, or spacing to distinguish gift sections
2. **Progressive disclosure**: Only show gift fields when needed
3. **Clear labeling**: Update section titles dynamically based on order type
4. **Helpful hints**: Add placeholder text and helper text for gift fields
5. **Character counter**: Show remaining characters for gift message
6. **Confirmation**: Show gift details in order summary before submission

## API Integration

### Endpoint

```
POST /api/orders
```

### Request Payload (Gift Order)

```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 29.99
    }
  ],
  "total": 69.98,
  "shipping_name": "John Doe",
  "shipping_email": "john@example.com",
  "shipping_phone": "+1234567890",
  "shipping_address": "123 Main St",
  "shipping_city": "New York",
  "shipping_postal_code": "10001",
  "shipping_country": "Saudi Arabia",
  "is_gift": true,
  "recipient_name": "Jane Smith",
  "recipient_phone": "+0987654321",
  "recipient_address": "456 Oak Ave, Los Angeles, CA 90001",
  "gift_message": "Happy Birthday! Hope you enjoy these gifts!",
  "sender_name": "John Doe"
}
```

### Response (Success)

```json
{
  "message": "Order created successfully",
  "order": {
    "id": 123,
    "order_number": "ORD-ABC123XYZ",
    "is_gift": true,
    "recipient_name": "Jane Smith",
    ...
  }
}
```

### Response (Validation Error)

```json
{
  "message": "Validation failed",
  "errors": {
    "recipient_name": ["The recipient name field is required when order is a gift."],
    "recipient_phone": ["The recipient phone field is required when order is a gift."]
  }
}
```

## Performance Considerations

1. **Form rendering**: Use React.memo for expensive components
2. **Validation**: Debounce validation checks to avoid excessive re-renders
3. **API calls**: Show loading state during submission
4. **Error handling**: Cache validation results to avoid redundant checks

## Security Considerations

1. **Input sanitization**: Sanitize all user inputs before submission
2. **XSS prevention**: Escape special characters in gift messages
3. **Data validation**: Validate on both client and server
4. **Authentication**: Maintain existing auth requirements (guest checkout supported)

## Accessibility

1. **Labels**: All form fields have associated labels
2. **ARIA attributes**: Use aria-required, aria-invalid, aria-describedby
3. **Keyboard navigation**: Logical tab order through all fields
4. **Screen readers**: Announce validation errors and state changes
5. **Focus management**: Move focus to first error on validation failure

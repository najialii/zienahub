# Implementation Plan

- [ ] 1. Update TypeScript types for gift order support

  - Add Order and OrderItem interfaces to `frontend/lib/types.ts`
  - Include all gift-related fields (is_gift, recipient_name, recipient_phone, recipient_address, gift_message, sender_name)
  - Ensure types match backend Order model structure
  - _Requirements: 1.4, 1.5, 2.1, 3.4, 4.4_

- [-] 2. Implement form state management for gift fields





  - [x] 2.1 Extend CheckoutFormData interface with gift fields



    - Add isGift boolean field
    - Add recipientName, recipientPhone, recipientAddress string fields
    - Add giftMessage and senderName string fields
    - Initialize all fields with appropriate default values
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

  - [ ] 2.2 Implement gift toggle handler

    - Create handleGiftToggle function that updates isGift state
    - Clear recipient fields when toggling from gift to regular order
    - Maintain shipping address data when toggling
    - _Requirements: 1.2, 1.3, 5.5_

  - [ ] 2.3 Write property test for gift toggle behavior

    - **Property 1: Gift toggle controls field visibility**
    - **Property 2: Disabling gift clears recipient data**
    - **Property 17: Toggle preserves shipping address**
    - **Validates: Requirements 1.2, 1.3, 5.5**

- [ ] 3. Add gift toggle UI component

  - [ ] 3.1 Create gift toggle section in checkout form

    - Add checkbox or toggle switch for "Send as gift" option
    - Position above contact information section
    - Include clear label and optional helper text
    - Style consistently with existing form elements
    - _Requirements: 1.1_


  - [ ] 3.2 Implement conditional rendering for gift sections
    - Show/hide recipient fields based on isGift state
    - Show/hide gift message field based on isGift state
    - Show/hide sender name field based on isGift state
    - Update section titles dynamically (shipping vs recipient address)
    - _Requirements: 1.2, 5.2_

  - [ ] 3.3 Write unit tests for gift toggle UI
    - Test toggle renders correctly
    - Test conditional field visibility
    - Test section title updates
    - _Requirements: 1.1, 1.2, 5.2_

- [ ] 4. Implement recipient information fields
  - [ ] 4.1 Create recipient contact fields section
    - Add recipient name input field (required when isGift is true)
    - Add recipient phone input field (required when isGift is true)
    - Add recipient address textarea (required when isGift is true)
    - Style section to visually distinguish from sender information
    - Include appropriate labels and placeholders
    - _Requirements: 2.1, 5.3_

  - [ ] 4.2 Implement recipient field validation
    - Validate recipient name has minimum 2 characters
    - Validate recipient phone is not empty
    - Validate recipient address is not empty
    - Only validate when isGift is true
    - Display inline validation errors
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ] 4.3 Write property tests for recipient validation
    - **Property 5: Gift order validation requires recipient fields**
    - **Property 6: Recipient name minimum length validation**
    - **Property 7: Recipient phone required validation**
    - **Property 8: Recipient address required validation**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

- [ ] 5. Implement gift message and sender fields
  - [ ] 5.1 Create gift message textarea
    - Add optional textarea for gift message
    - Set maxLength to 500 characters
    - Add character counter showing remaining characters
    - Display warning when approaching or exceeding limit
    - Style consistently with other form fields
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 5.2 Create sender name field
    - Add sender name input field
    - Auto-populate from profile data when available
    - Allow manual editing of auto-populated value
    - Include helpful placeholder text
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 5.3 Write property tests for gift message and sender
    - **Property 9: Gift message character limit**
    - **Property 10: Gift message warning display**
    - **Property 13: Sender name auto-population**
    - **Validates: Requirements 3.2, 3.3, 4.2**

- [ ] 6. Implement order payload construction logic
  - [ ] 6.1 Create buildOrderPayload utility function
    - Accept form data and cart items as parameters
    - Always include required shipping fields
    - Conditionally include gift fields when isGift is true
    - Apply sender name fallback (use shipping name if empty)
    - Return properly structured OrderPayload object
    - _Requirements: 1.4, 1.5, 3.4, 3.5, 4.4, 4.5, 7.1, 7.2_

  - [ ] 6.2 Write property tests for payload construction
    - **Property 3: Gift order payload includes gift flag**
    - **Property 4: Regular order payload excludes gift flag**
    - **Property 11: Gift message included in payload**
    - **Property 12: Optional gift message handling**
    - **Property 14: Sender name included in payload**
    - **Property 15: Sender name fallback**
    - **Property 18: Conditional gift fields in payload**
    - **Validates: Requirements 1.4, 1.5, 3.4, 3.5, 4.4, 4.5, 7.2**

- [ ] 7. Implement comprehensive form validation
  - [ ] 7.1 Create validateForm function
    - Validate all required shipping fields
    - Conditionally validate gift fields when isGift is true
    - Return structured validation errors with field names and messages
    - Prevent submission if validation fails
    - _Requirements: 2.2, 7.3, 7.4_

  - [ ] 7.2 Update form submission handler
    - Call validateForm before API submission
    - Display validation errors to user
    - Prevent API call if validation fails
    - Show loading state during submission
    - Handle successful submission (clear cart, redirect)
    - _Requirements: 7.3, 9.1, 9.2_

  - [ ] 7.3 Write property tests for validation
    - **Property 19: Pre-submission validation**
    - **Property 20: Specific validation error messages**
    - **Validates: Requirements 7.3, 7.4**

- [ ] 8. Implement backend error handling
  - [ ] 8.1 Create error parsing utility
    - Parse Laravel validation error responses
    - Extract field-specific error messages
    - Format errors for display to user
    - Handle network errors gracefully
    - _Requirements: 7.5_

  - [ ] 8.2 Integrate error handling in submission flow
    - Catch API errors in form submission handler
    - Parse and display backend validation errors
    - Show user-friendly error messages
    - Allow user to correct errors and resubmit
    - _Requirements: 7.5_

  - [ ] 8.3 Write property tests for error handling
    - **Property 21: Backend error parsing**
    - **Validates: Requirements 7.5**

- [ ] 9. Test regular order flow
  - [ ] 9.1 Verify regular order submission
    - Test that regular orders (isGift: false) submit successfully
    - Verify payload contains only shipping fields
    - Confirm order is created in backend
    - Ensure backward compatibility with existing orders
    - _Requirements: 9.1, 9.3_

  - [ ] 9.2 Write property tests for regular orders
    - **Property 22: Regular order creation success**
    - **Property 24: Backward compatibility maintained**
    - **Validates: Requirements 9.1, 9.3**

- [ ] 10. Test gift order flow
  - [ ] 10.1 Verify gift order submission
    - Test that gift orders (isGift: true) submit successfully
    - Verify payload contains shipping and gift fields
    - Confirm order is created with all gift data
    - Test with and without optional gift message
    - _Requirements: 9.2_

  - [ ] 10.2 Write property tests for gift orders
    - **Property 23: Gift order creation success**
    - **Validates: Requirements 9.2**

- [ ] 11. Enhance order summary display
  - [ ] 11.1 Update order summary to show gift indicator
    - Display gift icon or badge when isGift is true
    - Show recipient name in summary
    - Include gift message preview if present
    - Maintain existing summary functionality
    - _Requirements: 1.1, 5.4_

- [ ] 12. Add accessibility improvements
  - [ ] 12.1 Ensure proper ARIA attributes
    - Add aria-required to required fields
    - Add aria-invalid to fields with errors
    - Add aria-describedby for error messages
    - Ensure all inputs have associated labels
    - _Requirements: 8.5_

  - [ ] 12.2 Verify keyboard navigation
    - Test tab order through all form fields
    - Ensure logical navigation flow
    - Test with gift toggle enabled and disabled
    - _Requirements: 8.3_

- [ ] 13. Final integration testing
  - [ ] 13.1 Test complete checkout flows
    - Complete regular order from start to finish
    - Complete gift order with all fields
    - Toggle between gift and regular during checkout
    - Test with profile data auto-population
    - Test error recovery and resubmission
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 13.2 Verify backend integration
    - Confirm orders are created correctly in database
    - Verify gift fields are persisted
    - Check that regular orders don't have gift data
    - Test with both authenticated and guest users
    - _Requirements: 9.1, 9.2_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

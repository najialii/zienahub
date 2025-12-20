# Design Document

## Overview

This design document outlines the comprehensive UI redesign for the BloomCart e-commerce platform. The redesign focuses on creating a modern, elegant, and consistent visual experience across all pages while implementing proper typography for bilingual support (Arabic with El Messiri, English with Poppins). The design maintains the existing minimalist aesthetic with sharp corners while enhancing visual hierarchy, spacing, and interactive elements.

## Architecture

### Design System Architecture

The redesign follows a component-based architecture with a centralized design system:

1. **Typography Layer**: Font loading and locale-based font switching
2. **Design Tokens**: Centralized color palette, spacing scale, and typography scale
3. **Component Library**: Reusable UI components with consistent styling
4. **Layout System**: Responsive grid and container system
5. **Theme Provider**: Context for managing design system values

### Font Loading Strategy

- **Google Fonts Integration**: Load El Messiri and Poppins via Google Fonts API
- **Font Display Strategy**: Use `font-display: swap` to prevent layout shift
- **Locale Detection**: Dynamically apply font family based on current locale
- **Fallback Fonts**: System fonts as fallbacks for each language

## Components and Interfaces

### Typography System

```typescript
interface TypographyConfig {
  fontFamily: {
    arabic: string;  // 'El Messiri'
    english: string; // 'Poppins'
  };
  weights: {
    light: 300;
    regular: 400;
    medium: 500;
    semibold: 600;
    bold: 700;
  };
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
}
```

### Color System

```typescript
interface ColorPalette {
  primary: {
    DEFAULT: string;  // Main brand color
    light: string;
    dark: string;
  };
  secondary: {
    DEFAULT: string;
    light: string;
    dark: string;
  };
  accent: {
    DEFAULT: string;
    light: string;
    dark: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    // ... through 900
  };
  success: string;
  error: string;
  warning: string;
  info: string;
}
```

### Component Interfaces

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

interface CardProps {
  variant: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: React.ReactNode;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  showQuickView?: boolean;
}
```

## Data Models

### Design Token Model

```typescript
interface DesignTokens {
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}
```

### Page Configuration Model

```typescript
interface PageConfig {
  title: string;
  description: string;
  layout: 'default' | 'full-width' | 'centered';
  showHeader: boolean;
  showFooter: boolean;
  requiresAuth: boolean;
}
```

## Corre
ctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Typography Properties

**Property 1: Arabic locale font consistency**
*For any* text element when the locale is set to Arabic, the computed font-family should include 'El Messiri'
**Validates: Requirements 1.1**

**Property 2: English locale font consistency**
*For any* text element when the locale is set to English, the computed font-family should include 'Poppins'
**Validates: Requirements 1.2**

**Property 3: Font family reactivity**
*For any* text element, when switching from one locale to another, the font-family should update to match the new locale's designated font
**Validates: Requirements 1.4**

**Property 4: Typography hierarchy consistency**
*For any* page, text elements of the same semantic level (h1, h2, body, etc.) should have consistent font-weight and font-size values matching the design tokens
**Validates: Requirements 1.5**

### Navigation and Page Completeness Properties

**Property 5: Navigation link validity**
*For any* navigation link in the header or footer, clicking it should navigate to a page that returns a 200 status code
**Validates: Requirements 2.1**

**Property 6: Page completeness**
*For any* route in the application, the page should not contain placeholder text like "Coming Soon" or "Under Construction"
**Validates: Requirements 2.4**

### Visual Design Properties

**Property 7: Color contrast compliance**
*For any* text-background color combination used in the UI, the contrast ratio should meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text)
**Validates: Requirements 3.1**

**Property 8: Interactive element transitions**
*For any* interactive element (button, link, card), the computed CSS should include transition properties for hover states
**Validates: Requirements 3.2**

**Property 9: Product image aspect ratio consistency**
*For any* set of product cards displayed together, all product images should have the same aspect ratio
**Validates: Requirements 3.3**

**Property 10: Responsive layout adaptation**
*For any* page, when viewport width changes from mobile to desktop breakpoints, the layout should adapt (e.g., grid columns should increase)
**Validates: Requirements 3.5**

### Component Consistency Properties

**Property 11: Header presence**
*For any* page in the application, the header component should be present in the DOM
**Validates: Requirements 4.1**

**Property 12: Footer presence**
*For any* page in the application, the footer component should be present in the DOM
**Validates: Requirements 4.2**

**Property 13: Active navigation highlighting**
*For any* page, the navigation item corresponding to the current route should have an active state class or style applied
**Validates: Requirements 4.4**

### Interactive Feedback Properties

**Property 14: Hover state presence**
*For any* clickable element (button, link), CSS hover pseudo-class styles should be defined
**Validates: Requirements 5.1**

**Property 15: Button active state feedback**
*For any* button element, CSS active pseudo-class styles or loading state handling should be defined
**Validates: Requirements 5.2**

**Property 16: Form loading states**
*For any* form submission, a loading indicator should be displayed while the request is in progress
**Validates: Requirements 5.3**

**Property 17: Error message display**
*For any* error condition (form validation, API error), an error message should be displayed with error styling
**Validates: Requirements 5.4**

**Property 18: Success feedback display**
*For any* successful action (form submission, item added to cart), a success message or indicator should be displayed
**Validates: Requirements 5.5**

### Performance Properties

**Property 19: Homepage load performance**
*For any* homepage load, the page should load in under 3 seconds and images should be in optimized formats (WebP, AVIF, or optimized JPEG/PNG)
**Validates: Requirements 6.5**

### Data Display Properties

**Property 20: Price formatting consistency**
*For any* price displayed in the application, it should follow the same format pattern (currency symbol position, decimal places)
**Validates: Requirements 7.5**

**Property 21: Cart item information completeness**
*For any* item in the cart, the display should include image, name, quantity, and price
**Validates: Requirements 8.1**

**Property 22: Cart total calculation accuracy**
*For any* cart state, the displayed total should equal the sum of (quantity × price) for all items
**Validates: Requirements 8.5**

### Design System Properties

**Property 23: Design token propagation**
*For any* design token value change (color, spacing, typography), the change should be reflected across all pages that use that token
**Validates: Requirements 10.3**

## Error Handling

### Font Loading Errors

- **Fallback Fonts**: If Google Fonts fail to load, system fonts should be used as fallbacks
- **Font Display Strategy**: Use `font-display: swap` to show fallback fonts immediately while custom fonts load
- **Error Logging**: Log font loading failures to monitoring service

### Navigation Errors

- **404 Page**: Custom 404 page with navigation options and search
- **Error Boundaries**: React error boundaries to catch component errors and display fallback UI
- **Broken Link Detection**: Development-time link checking to prevent broken links in production

### Image Loading Errors

- **Placeholder Images**: Display placeholder when product images fail to load
- **Lazy Loading**: Implement lazy loading with loading skeletons
- **Alt Text**: Provide meaningful alt text for all images

### Responsive Design Errors

- **Breakpoint Testing**: Test all breakpoints to ensure layouts don't break
- **Overflow Handling**: Prevent horizontal scroll with proper container constraints
- **Touch Target Sizing**: Ensure interactive elements meet minimum touch target sizes (44x44px)

## Testing Strategy

### Unit Testing

**Typography Tests**:
- Test font family application based on locale
- Test font weight and size consistency across components
- Test font loading and fallback behavior

**Component Tests**:
- Test button variants render correctly
- Test card components with different props
- Test form components with validation
- Test navigation components with active states

**Utility Tests**:
- Test color contrast calculation utility
- Test responsive breakpoint utilities
- Test price formatting utility

### Property-Based Testing

The testing strategy uses Playwright for end-to-end property-based testing and Jest with React Testing Library for component-level tests.

**Property Testing Framework**: Playwright with custom property test utilities
**Test Configuration**: Minimum 100 iterations per property test
**Test Tagging**: Each property test must reference its design document property number

**Typography Property Tests**:
- Generate random text elements and verify font-family matches locale
- Test locale switching updates fonts across all text elements
- Verify typography hierarchy consistency across pages

**Navigation Property Tests**:
- Crawl all navigation links and verify 200 status responses
- Generate random navigation paths and verify no placeholder content
- Test active state highlighting for all routes

**Visual Design Property Tests**:
- Test color contrast ratios for all text-background combinations
- Verify hover transitions exist for all interactive elements
- Test responsive behavior at various viewport widths

**Data Display Property Tests**:
- Generate random cart states and verify total calculations
- Test price formatting consistency across all price displays
- Verify cart item information completeness

### Integration Testing

**Page Integration Tests**:
- Test complete user flows (browse → product → cart → checkout)
- Test locale switching across different pages
- Test navigation between all major sections

**Component Integration Tests**:
- Test header with navigation and user actions
- Test product cards with cart and wishlist integration
- Test forms with validation and submission

### Visual Regression Testing

**Screenshot Comparison**:
- Capture screenshots of all pages in both locales
- Compare against baseline screenshots
- Flag visual differences for review

**Responsive Testing**:
- Test layouts at mobile, tablet, and desktop breakpoints
- Verify no layout breaks or overflow issues
- Test touch interactions on mobile devices

### Accessibility Testing

**WCAG Compliance**:
- Test color contrast ratios (automated)
- Test keyboard navigation
- Test screen reader compatibility
- Test focus management

**Automated Accessibility Tests**:
- Use axe-core for automated accessibility testing
- Test all pages and components
- Fail builds on accessibility violations

## Implementation Plan

### Phase 1: Design System Foundation

1. **Typography Setup**
   - Add Google Fonts for El Messiri and Poppins
   - Create font loading utility with locale detection
   - Update global CSS with font families
   - Create typography utility classes

2. **Design Tokens**
   - Define color palette in Tailwind config
   - Define spacing scale
   - Define typography scale
   - Define shadow and transition tokens

3. **Base Components**
   - Create Button component with variants
   - Create Card component with variants
   - Create Input and Form components
   - Create Loading and Error components

### Phase 2: Layout Components

1. **Header Redesign**
   - Update header styling with new design tokens
   - Improve navigation menu
   - Enhance mobile menu
   - Add search functionality

2. **Footer Redesign**
   - Update footer styling
   - Organize footer links
   - Add newsletter signup
   - Add social media links

3. **Layout Containers**
   - Create responsive container components
   - Create grid layout utilities
   - Create section components

### Phase 3: Page Redesigns

1. **Homepage**
   - Redesign hero section
   - Update featured categories section
   - Update featured products section
   - Add testimonials or trust indicators

2. **Product Pages**
   - Redesign product listing page
   - Redesign product detail page
   - Add product image gallery
   - Improve product information layout

3. **Category Pages**
   - Redesign category listing
   - Redesign category detail pages
   - Add filtering and sorting UI
   - Improve category navigation

4. **Cart and Checkout**
   - Redesign cart page
   - Improve cart item display
   - Add empty cart state
   - Enhance checkout flow

5. **Account Pages**
   - Redesign account dashboard
   - Update profile page
   - Update orders page
   - Update settings page

### Phase 4: Interactive Enhancements

1. **Hover and Focus States**
   - Add hover effects to all interactive elements
   - Improve focus indicators
   - Add loading states
   - Add success/error feedback

2. **Transitions and Animations**
   - Add smooth transitions
   - Add micro-interactions
   - Add page transition effects
   - Optimize animation performance

3. **Responsive Improvements**
   - Test and fix mobile layouts
   - Improve tablet layouts
   - Optimize touch interactions
   - Test across devices

### Phase 5: Testing and Refinement

1. **Property-Based Testing**
   - Implement typography property tests
   - Implement navigation property tests
   - Implement visual design property tests
   - Implement data display property tests

2. **Accessibility Testing**
   - Run automated accessibility tests
   - Fix accessibility issues
   - Test keyboard navigation
   - Test screen reader compatibility

3. **Performance Optimization**
   - Optimize images
   - Implement lazy loading
   - Optimize font loading
   - Measure and improve load times

4. **Cross-Browser Testing**
   - Test in Chrome, Firefox, Safari, Edge
   - Fix browser-specific issues
   - Test on mobile browsers
   - Verify consistent experience

## Technical Considerations

### Font Loading Optimization

- Use `font-display: swap` to prevent invisible text
- Preload critical fonts in document head
- Subset fonts to include only needed characters
- Use variable fonts where possible for better performance

### CSS Architecture

- Use Tailwind CSS utility classes for consistency
- Create custom components for complex patterns
- Use CSS custom properties for dynamic theming
- Minimize custom CSS to reduce maintenance

### Component Reusability

- Create atomic design system (atoms, molecules, organisms)
- Document component APIs and usage
- Create Storybook for component documentation
- Ensure components are locale-agnostic

### Performance Considerations

- Implement code splitting for routes
- Lazy load images and heavy components
- Optimize bundle size
- Use Next.js Image component for automatic optimization

### Accessibility Considerations

- Maintain semantic HTML structure
- Ensure keyboard navigation works everywhere
- Provide ARIA labels where needed
- Test with screen readers
- Maintain sufficient color contrast

### Internationalization

- Ensure RTL support for Arabic
- Test text overflow in both languages
- Verify date and number formatting
- Test with long and short translations

## Success Metrics

### User Experience Metrics

- Page load time < 3 seconds
- Time to interactive < 5 seconds
- Zero broken links
- 100% WCAG AA compliance
- Consistent font rendering across pages

### Technical Metrics

- All property tests passing
- Zero accessibility violations
- 90+ Lighthouse performance score
- 100% test coverage for critical paths
- Zero console errors in production

### Design Metrics

- Consistent spacing across all pages
- Consistent typography hierarchy
- Consistent color usage
- Consistent component styling
- Proper responsive behavior at all breakpoints

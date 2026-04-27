# Home Layout System Documentation

## Overview

The Home Layout System is a flexible, drag-and-drop content management system that allows administrators to customize the homepage of the e-commerce platform. It provides a modular approach to building dynamic homepage layouts without requiring code changes.

## Architecture

### Core Components

1. **Home Sections** - Modular content blocks that can be arranged in any order
2. **Section Types** - Predefined templates for different content layouts
3. **Settings** - Configurable options for each section type
4. **Sort Order** - Drag-and-drop ordering system

### Database Structure

```
home_sections table:
- id: Primary key
- name: Unique internal identifier (e.g., "top_banner_1")
- type: Section type (banner, product_row, etc.)
- title_en: English display title
- title_ar: Arabic display title
- description_en: Optional English description
- description_ar: Optional Arabic description
- settings: JSON field for type-specific configuration
- sort_order: Integer for ordering sections
- is_active: Boolean to show/hide section
- created_at, updated_at: Timestamps
```

## Section Types

### 1. Hero Slider (`hero_slider`)
**Purpose:** Large, full-width banner carousel at the top of the page

**Settings:**
- `layout`: "slider" (carousel with navigation)
- `banner_type`: "hero_slider"
- `autoplay`: Boolean for automatic sliding
- `interval`: Time between slides (milliseconds)

**Use Case:** Main promotional banners, seasonal campaigns, featured products

---

### 2. Banner Section (`banner`)
**Purpose:** Display promotional banners in grid or slider format

**Settings:**
```json
{
  "layout": "grid" | "slider",
  "banner_type": "promotional" | "category_banner" | "hero_slider",
  "position": "top" | "middle" | "bottom",
  "columns": 1 | 2 | 3 | 4
}
```

**How It Works:**
1. Admin creates banners in the Banner Management section
2. Banners are tagged with `type` and `position`
3. Banner section automatically displays matching banners
4. Grid layout shows banners in columns
5. Slider layout creates a carousel

**Example:**
```json
{
  "name": "mid_page_banners",
  "type": "banner",
  "settings": {
    "layout": "grid",
    "banner_type": "promotional",
    "columns": 2
  }
}
```

---

### 3. Product Row (`product_row`)
**Purpose:** Display a horizontal row of products filtered by category or tag

**Settings:**
```json
{
  "filter_type": "subcategory" | "tag",
  "filter_value": "subcategory_id" | "tag_id",
  "product_count": 8,
  "show_price": true,
  "show_add_to_cart": true
}
```

**How It Works:**
1. Admin selects filter type (subcategory or tag)
2. Admin selects specific subcategory or tag
3. System fetches products matching the filter
4. Products are displayed in a scrollable row
5. Respects `product_count` limit

**Example:**
```json
{
  "name": "bestsellers_row",
  "type": "product_row",
  "title_en": "Best Sellers",
  "title_ar": "الأكثر مبيعاً",
  "settings": {
    "filter_type": "tag",
    "filter_value": "5",
    "product_count": 12
  }
}
```

---

### 4. Featured Tags (`featured_tags`)
**Purpose:** Display clickable tag badges for quick navigation

**Settings:**
```json
{
  "display_style": "grid" | "horizontal_scroll",
  "show_icons": true,
  "max_tags": 10
}
```

**How It Works:**
1. System fetches all tags marked as `is_featured = true`
2. Tags are displayed with their custom colors and icons
3. Clicking a tag navigates to filtered product page
4. Useful for skin types, concerns, ingredients

---

### 5. Category Scroll (`category_scroll`)
**Purpose:** Horizontal scrollable list of product categories

**Settings:**
```json
{
  "show_images": true,
  "show_product_count": true,
  "categories_to_show": "all" | "featured"
}
```

**How It Works:**
1. Fetches categories from database
2. Displays category images and names
3. Shows product count per category
4. Horizontal scroll for mobile-friendly navigation

---

### 6. Tenant Carousel (`tenant_carousel`)
**Purpose:** Showcase partner vendors/tenants

**Settings:**
```json
{
  "display_count": 6,
  "autoplay": true,
  "show_logos": true
}
```

**How It Works:**
1. Fetches approved tenants
2. Displays tenant logos in carousel
3. Links to tenant store pages
4. Great for multi-vendor marketplaces

---

### 7. Featured Subcategories (`featured_subcategories`)
**Purpose:** Highlight specific subcategories with images

**Settings:**
```json
{
  "layout": "grid",
  "columns": 3,
  "show_product_count": true
}
```

**How It Works:**
1. Fetches subcategories marked as `is_featured = true`
2. Displays in grid layout with images
3. Shows product count per subcategory
4. Links to subcategory pages

---

### 8. Custom Section (`custom`)
**Purpose:** Flexible section for custom HTML/content

**Settings:**
```json
{
  "html_content_en": "<div>...</div>",
  "html_content_ar": "<div>...</div>",
  "css_classes": "custom-section"
}
```

**Use Case:** Special promotions, embedded videos, custom designs

---

## Admin Interface Features

### Section Management

#### Creating a Section
1. Click "Add Section" button
2. Fill in required fields:
   - **Internal Name**: Unique identifier (e.g., "summer_sale_banner")
   - **Section Type**: Choose from dropdown
   - **Title (EN/AR)**: Display titles for both languages
   - **Active Status**: Toggle visibility
3. Configure type-specific settings
4. Click "Create Section"

#### Editing a Section
1. Click edit icon on any section
2. Modify fields and settings
3. Click "Save Changes"

#### Reordering Sections
**Method 1: Arrow Buttons**
- Click up arrow to move section higher
- Click down arrow to move section lower

**Method 2: Drag and Drop** (Future Enhancement)
- Grab the grip icon
- Drag section to new position
- Drop to save new order

#### Activating/Deactivating
- Click eye icon to toggle visibility
- Inactive sections don't appear on homepage
- Useful for seasonal content

#### Deleting a Section
- Click trash icon
- Confirm deletion
- Section is permanently removed

---

## Frontend Rendering

### How Sections Are Displayed

1. **Fetch Active Sections**
   ```javascript
   const sections = await fetch('/api/home-sections?active=true')
     .then(res => res.json());
   ```

2. **Sort by Order**
   ```javascript
   sections.sort((a, b) => a.sort_order - b.sort_order);
   ```

3. **Render Each Section**
   ```jsx
   {sections.map(section => (
     <SectionRenderer 
       key={section.id}
       type={section.type}
       settings={section.settings}
       title={locale === 'ar' ? section.title_ar : section.title_en}
     />
   ))}
   ```

4. **Section-Specific Rendering**
   - Each section type has its own component
   - Settings are passed as props
   - Data is fetched based on settings

---

## API Endpoints

### Get All Sections
```
GET /api/admin/home-sections
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "hero_banner",
      "type": "hero_slider",
      "title_en": "Main Banner",
      "title_ar": "البانر الرئيسي",
      "settings": {...},
      "sort_order": 0,
      "is_active": true
    }
  ]
}
```

### Create Section
```
POST /api/admin/home-sections
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "name": "new_section",
  "type": "product_row",
  "title_en": "New Arrivals",
  "title_ar": "وصل حديثاً",
  "settings": {
    "filter_type": "tag",
    "filter_value": "3",
    "product_count": 8
  },
  "is_active": true,
  "sort_order": 5
}
```

### Update Section
```
PUT /api/admin/home-sections/{id}
Authorization: Bearer {token}
Content-Type: application/json

Body: {same as create}
```

### Toggle Status
```
POST /api/admin/home-sections/{id}/toggle-status
Authorization: Bearer {token}
```

### Update Sort Order
```
POST /api/admin/home-sections/update-sort-order
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "sections": [
    {"id": 1, "sort_order": 0},
    {"id": 2, "sort_order": 1},
    {"id": 3, "sort_order": 2}
  ]
}
```

### Delete Section
```
DELETE /api/admin/home-sections/{id}
Authorization: Bearer {token}
```

---

## Best Practices

### Section Naming
- Use descriptive, unique names
- Follow convention: `{location}_{type}_{number}`
- Examples: `top_hero_1`, `mid_products_bestsellers`, `bottom_banner_sale`

### Sort Order
- Start from 0
- Increment by 1 for each section
- Leave gaps (0, 10, 20) for future insertions

### Settings Configuration
- Always validate settings before saving
- Provide sensible defaults
- Document custom settings in comments

### Performance
- Limit product rows to 8-12 items
- Optimize banner images (WebP, lazy loading)
- Cache section data on frontend
- Use pagination for large datasets

### Internationalization
- Always provide both EN and AR titles
- Test RTL layout for Arabic
- Ensure images work in both languages

---

## Common Use Cases

### 1. Seasonal Campaign
```json
{
  "name": "summer_sale_2024",
  "type": "banner",
  "title_en": "Summer Sale",
  "title_ar": "تخفيضات الصيف",
  "settings": {
    "layout": "slider",
    "banner_type": "promotional",
    "columns": 1
  },
  "is_active": true,
  "sort_order": 1
}
```

### 2. Category Showcase
```json
{
  "name": "skincare_categories",
  "type": "category_scroll",
  "title_en": "Shop by Category",
  "title_ar": "تسوق حسب الفئة",
  "settings": {
    "show_images": true,
    "show_product_count": true
  },
  "is_active": true,
  "sort_order": 2
}
```

### 3. Trending Products
```json
{
  "name": "trending_now",
  "type": "product_row",
  "title_en": "Trending Now",
  "title_ar": "رائج الآن",
  "settings": {
    "filter_type": "tag",
    "filter_value": "trending_tag_id",
    "product_count": 10
  },
  "is_active": true,
  "sort_order": 3
}
```

---

## Troubleshooting

### Section Not Appearing
1. Check `is_active` status
2. Verify `sort_order` is set
3. Ensure settings are valid JSON
4. Check frontend cache

### Banners Not Showing
1. Verify banner `type` matches section settings
2. Check banner `is_active` status
3. Ensure banner `position` matches
4. Verify image URLs are accessible

### Products Not Loading
1. Check `filter_value` exists (valid subcategory/tag ID)
2. Verify products exist with that filter
3. Check product `is_active` status
4. Ensure `product_count` is reasonable

### Order Not Saving
1. Check for duplicate `sort_order` values
2. Verify API endpoint is accessible
3. Check authentication token
4. Review server logs for errors

---

## Future Enhancements

1. **Visual Page Builder** - Drag-and-drop interface
2. **Section Templates** - Pre-configured section bundles
3. **A/B Testing** - Test different layouts
4. **Analytics Integration** - Track section performance
5. **Scheduling** - Auto-activate/deactivate sections
6. **Preview Mode** - See changes before publishing
7. **Version History** - Rollback to previous layouts
8. **Section Duplication** - Clone existing sections

---

## Technical Notes

### State Management
- React useState for local state
- Fetch API for server communication
- Optimistic UI updates for better UX

### Validation
- Required fields: name, type, title_en, title_ar
- Unique name constraint
- Settings validated per section type

### Security
- JWT authentication required
- Admin role verification
- CSRF protection
- Input sanitization

### Localization
- next-intl for translations
- RTL support for Arabic
- Locale-aware content rendering

---

## Support

For questions or issues:
1. Check this documentation
2. Review API logs
3. Test in development environment
4. Contact development team

---

**Last Updated:** April 2026  
**Version:** 1.0  
**Maintained By:** Development Team

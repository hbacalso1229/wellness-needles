# Centralized Contact Configuration

## Overview
I've successfully created a centralized location for all contact details and business information that can be easily referenced throughout the application. This makes updates much easier and ensures consistency across all pages.

## Files Created/Modified

### 1. Contact Configuration (`src/lib/contact-config.ts`)
**Central source of truth for all contact information:**

- **Address**: 56 The Orchard Oldtown Mill Celbridge Co.Kildare W23 K603
  - Formatted for easy display across multiple lines
  - Includes MapPin icon from Lucide React
  
- **Phone**: 0860543085
  - Multiple format options: raw number, formatted display, international format
  - Includes clickable `tel:` link
  - Includes Phone icon from Lucide React
  
- **Email**: info@wellnessneedles.com
  - Includes clickable `mailto:` link
  - Includes Mail icon from Lucide React
  
- **Business Hours**: 
  - Monday-Friday: 9:00 AM - 7:00 PM
  - Saturday: 10:00 AM - 4:00 PM
  - Sunday: Closed
  - Emergency appointments note
  
- **Business Information**:
  - Company name, tagline, description
  - Social media links

### 2. Reusable Components

#### ContactInfo Component (`src/components/ContactInfo.tsx`)
Flexible component with multiple variants:
- **Default**: Full contact info with icons and multi-line layout
- **Compact**: Smaller version for tight spaces
- **Inline**: Horizontal layout for headers/footers

Individual contact components also available:
- `PhoneContact`
- `EmailContact` 
- `AddressContact`

#### BusinessHours Component (`src/components/BusinessHours.tsx`)
Displays business hours with variants:
- **Default**: Standard layout with hours and emergency note
- **Compact**: Minimal version for sidebars
- **Card**: Styled card format with background

### 3. Updated Components

#### Footer (`src/components/Footer.tsx`)
- Now uses centralized contact config
- Displays proper Irish address and phone number
- Maintains existing styling and layout

#### Contact Page (`src/app/contact/page.tsx`)
- Updated all contact information sections
- Uses centralized config for phone, email, address, and business hours
- Maintains interactive features (clickable phone/email links)

## Usage Examples

### Import the config:
```typescript
import { contactConfig } from '../lib/contact-config'
```

### Use contact information directly:
```typescript
// Phone number
{contactConfig.phone.displayText}
{contactConfig.phone.href} // for tel: links

// Address
{contactConfig.address.full}
{contactConfig.address.formatted.street}

// Business info
{contactConfig.businessInfo.name}
{contactConfig.businessInfo.hoursDisplay.map(hours => ...)}
```

### Use the reusable components:
```typescript
import ContactInfo from '../components/ContactInfo'
import BusinessHours from '../components/BusinessHours'

// Full contact info
<ContactInfo />

// Compact version
<ContactInfo variant="compact" />

// Show only phone and email
<ContactInfo showAddress={false} />

// Business hours card
<BusinessHours variant="card" />
```

## Benefits

1. **Single Source of Truth**: All contact details in one file
2. **Easy Updates**: Change address/phone once, updates everywhere
3. **Consistency**: Same formatting and styling across all pages
4. **Icons Included**: Proper icons (MapPin, Phone, Mail) with each contact method
5. **Accessibility**: Proper semantic markup and clickable links
6. **Reusable**: Components can be used throughout the app
7. **Flexible**: Multiple display variants for different contexts

## Irish Contact Details Applied

- **Address**: 56 The Orchard Oldtown Mill Celbridge Co.Kildare W23 K603
- **Phone**: 0860543085 (displayed as +353 86 054 3085 for international clarity)
- **Icons**: MapPin for address, Phone for mobile number

The configuration properly handles the Irish address format with street, town, county, and Eircode postal code structure.

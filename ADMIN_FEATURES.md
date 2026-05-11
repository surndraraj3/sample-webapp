# MSI Innovations - Admin Panel Features Documentation

## Overview

The Admin Panel is a comprehensive business management system designed specifically for your inventory-led hybrid model. It provides complete control over dealers, inventory, sales, customer service, and finances - all from a single, mobile-responsive interface.

## 🔐 Access Control

- **Role**: Only users with `admin` role can access the admin panel
- **Protected Route**: `/admin` path is protected via `ProtectedRoute` component
- **Credentials**: Use `username: admin` and `password: admin@123` to login

---

## 📊 1. Centralized Dashboard

### Features:

- **Real-time Key Metrics**
  - Monthly revenue with growth percentage
  - Total orders with pending count
  - Active dealers with approval status
  - Stock levels with low stock alerts

- **Sales Trend Chart** (6 months)
  - Area chart showing revenue progression
  - Month-over-month order volume

- **Dealer Performance Analytics**
  - Bar chart comparing top dealers by revenue
  - Visual identification of high-performing regions

- **Product Distribution**
  - Pie chart showing sales by product category
  - Percentage breakdown of product mix

- **Revenue & Profit Analysis**
  - Line chart tracking revenue, expenses, and profit
  - Financial health visualization

- **Pending Actions & Alerts**
  - Dealer approvals queue
  - Pending orders requiring action
  - Active support tickets
  - Low stock warnings

- **Quick Stats**
  - Order completion rate
  - Dealer satisfaction score
  - Ticket resolution rate
  - Average order value

- **Recent Activity Feed**
  - Real-time updates on orders, registrations, and alerts

### Mobile Responsive:

- Dropdown selector for navigation on mobile devices
- Card layouts stack vertically on small screens
- Charts adapt to available screen width

---

## 🛒 2. Order Management & Supply Chain

### Features:

- **Order Lifecycle Management**
  - Pending → Approved → Shipped → Delivered
  - Reject orders with notes
  - Filter by status

- **Order Details View**
  - Complete order information
  - Item-wise breakdown with quantities and prices
  - Dealer information

- **Shipping Management**
  - Add tracking IDs
  - Update shipping status
  - Courier/transport details

- **Return & Replacement Handling**
  - Track damaged shipments
  - Process return requests
  - Manage replacements

### Status Workflow:

1. **Pending**: New order awaiting approval
2. **Approved**: Ready for fulfillment
3. **Shipped**: In transit with tracking
4. **Delivered**: Completed successfully
5. **Rejected**: Declined with reason

### Mobile Features:

- Responsive table with horizontal scroll
- Touch-friendly action buttons
- Status badges with color coding

---

## 👥 3. Dealer & User Management (RBAC)

### Dealer Management:

- **Complete Dealer CRUD**
  - Add new dealers
  - Edit dealer information
  - Approve/Suspend dealers
  - Delete dealer records

- **KYC Verification System**
  - Pending/Verified/Rejected status
  - Document upload support
  - Visual verification workflow
  - Click on KYC badge to review

- **Credit Control System**
  - Set credit limits per dealer
  - Track outstanding amounts
  - Visual credit utilization bar
  - Block dealers exceeding limits
  - Automatic alerts for high utilization

- **Dealer Analytics**
  - Total orders and revenue per dealer
  - Performance metrics
  - Credit status overview
  - Joining date tracking

### Team Management (RBAC):

- **Role-Based Access Control**
  - Admin: Full system access
  - Production Manager: Inventory & stock management
  - Accountant: Finance & invoicing
  - Sales Manager: Dealers & orders
  - Support Staff: Tickets & customer service

- **Permission System**
  - Granular permission control (15+ permissions)
  - Role-based permission presets
  - Custom permission combinations
  - Active/Inactive user status

- **Team Member Features**
  - Add team members with credentials
  - Assign roles and permissions
  - Edit access levels
  - Track team member details

---

## 📦 4. Inventory & Production Control

### Finished Goods Management:

- **Stock Entry System**
  - Record stock IN and OUT movements
  - Reference numbers (PO/SO)
  - Optional notes for tracking
  - Automatic balance calculation

- **Real-time Stock Levels**
  - Current balance per product
  - Low stock alerts (< 20 units)
  - Stock movement history
  - Product-wise summaries

### Raw Materials Tracking:

- **Raw Material Inventory**
  - Add/Edit raw materials
  - Track quantity and units (pcs, kg, meters, etc.)
  - Set minimum stock levels
  - Supplier information
  - Last order date tracking

- **Low Stock Alerts**
  - Automatic alerts when below minimum
  - Visual indicators on dashboard
  - Highlighted rows in table

### Features:

- Tabbed interface (Finished Goods / Raw Materials)
- Recent movements with date tracking
- Balance calculation per product
- Category-based organization

---

## 💰 5. Financial Reporting & Analytics

### Invoice Generation:

- **GST-Compliant Invoicing**
  - Automatic GST calculation (18%)
  - Generate from delivered orders
  - Sequential invoice numbering
  - Due date tracking (30 days default)

- **Invoice Status Management**
  - Draft: Initial creation
  - Sent: Issued to dealer
  - Paid: Payment received
  - Overdue: Past due date

### Commission Calculator:

- **Dealer Commission Tracking**
  - Automatic 5% commission calculation
  - Based on total dealer revenue
  - Visual cards per dealer
  - Commission summary

### Financial Analytics:

- Total revenue from paid invoices
- Pending payments tracking
- GST collected summary
- Invoice count statistics

### Tax Reports:

- Monthly GST reports
- Sales tax summaries
- Download functionality for compliance

---

## 🎧 6. Customer Support & Ticketing

### Ticket Types:

- Complaint
- Warranty Claim
- General Query
- Return Request

### Priority Levels:

- Low
- Medium
- High
- Critical

### Ticket Lifecycle:

1. **Open**: New ticket created
2. **In Progress**: Being worked on
3. **Resolved**: Issue fixed
4. **Closed**: Completed

### Features:

- **Ticket Creation**
  - Create from admin panel
  - Auto-assignment capability
  - Priority setting
  - Type categorization

- **Ticket Management**
  - View complete ticket details
  - Add comments/notes
  - Update status
  - Track resolution time

- **Warranty Database**
  - Serial number tracking
  - Purchase date verification
  - Warranty status checking
  - Product information

- **Filter & Search**
  - Filter by status
  - Filter by priority
  - Quick statistics

### Service Management:

- Assign to technicians
- Track resolution time
- Comment history
- Customer/Dealer linking

---

## 📢 7. Marketing & Communication

### Push Notifications:

- **Notification Types**
  - Promo: Sales and offers
  - Alert: Important announcements
  - Update: Product/feature updates

- **Recipient Targeting**
  - All Users
  - Dealers Only
  - Customers Only

- **Notification Management**
  - Create and save as draft
  - Send to targeted audience
  - Track sent notifications
  - Schedule capability

### Banner Management:

- **Promotional Banners**
  - Upload banner images
  - Category: banner
  - Display on app home screen
  - Manage banner rotation

### Features:

- Tabbed interface (Notifications / Banners)
- Draft and send workflow
- Recipient targeting
- Statistics tracking

---

## 📈 8. Reports & Analytics

### Available Reports:

1. **Sales Report**
   - Monthly sales summary
   - Order details
   - Revenue breakdown

2. **GST Report**
   - Tax collected
   - Tax payable
   - Compliance data

3. **Dealer Performance**
   - Sales by dealer
   - Order count
   - Revenue contribution

4. **Inventory Report**
   - Stock levels
   - Movements
   - Raw materials

5. **Financial Summary**
   - Revenue vs expenses
   - Profit margins
   - Trends

6. **Support Tickets**
   - Ticket statistics
   - Resolution times
   - Customer issues

### Features:

- **Top Performer Highlight**
  - Best dealer by revenue
  - Visual recognition

- **Download Functionality**
  - PDF export (planned)
  - Excel support (planned)
  - Date range selection

- **Key Metrics Dashboard**
  - Total sales
  - GST collected
  - Order count
  - Active dealers

---

## 🎨 9. Media Library

### Features:

- **File Upload**
  - Drag & drop interface
  - Multiple file selection
  - Images and videos support

- **File Management**
  - Grid view
  - Preview on hover
  - Delete functionality
  - Category tagging

### Categories:

- Banner: Homepage banners
- Product: Product images
- Promo: Marketing materials

---

## 📱 Mobile Responsiveness

### Design Principles:

- **Mobile-First Approach**
  - Dropdown navigation on mobile
  - Stacked card layouts
  - Touch-friendly buttons
  - Responsive tables with horizontal scroll

- **Breakpoints**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

- **Optimizations**
  - Hidden columns on small screens
  - Compact data views
  - Bottom navigation on mobile
  - Swipe gestures

---

## 🔧 Technical Implementation

### Technologies Used:

- React 18 with TypeScript
- Shadcn/UI component library
- Recharts for data visualization
- React Router for navigation
- Lucide React for icons
- Tailwind CSS for styling

### Data Management:

- Local state with React hooks
- LocalStorage persistence (via AuthContext)
- Type-safe interfaces
- Immutable state updates

### Security:

- Protected routes with role-based access
- Authentication context
- Credential validation
- Session management

---

## 🚀 Getting Started

### For Admin Users:

1. Navigate to `/staff-login`
2. Login with admin credentials:
   - Username: `admin`
   - Password: `admin@123`
3. Access admin panel at `/admin`
4. Mobile users: Use dropdown menu for navigation

### Key Actions:

- **Daily**: Review pending orders, check tickets
- **Weekly**: Approve dealers, generate invoices
- **Monthly**: Download reports, calculate commissions
- **As Needed**: Update stock, send notifications

---

## 💡 Best Practices

### Dealer Management:

1. Always verify KYC before approving
2. Set appropriate credit limits
3. Monitor credit utilization
4. Regular performance reviews

### Inventory Management:

1. Record all stock movements
2. Set minimum stock levels
3. Track raw materials
4. Regular stock audits

### Financial Management:

1. Generate invoices promptly
2. Track pending payments
3. Download monthly reports
4. Monitor GST compliance

### Customer Support:

1. Respond to tickets promptly
2. Update ticket status regularly
3. Track warranty claims
4. Maintain comment history

---

## 📞 Support

For technical issues or feature requests, contact:

- Developer: Surendra
- Email: support@msi-innovations.com

---

## 🔄 Future Enhancements

Planned features:

- [ ] Real-time data sync with backend
- [ ] Email notifications for orders
- [ ] SMS alerts for tickets
- [ ] Advanced analytics dashboard
- [ ] Inventory forecasting
- [ ] Automated reorder points
- [ ] Multi-currency support
- [ ] Regional language support
- [ ] Mobile app version

---

**Last Updated**: May 11, 2026
**Version**: 2.0.0

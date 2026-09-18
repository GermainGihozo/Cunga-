# Cunga Business Model - Hybrid Marketplace + SaaS

## 🎯 Core Concept
Cunga combines a **public marketplace** (like Jumia/Konga) with a **premium shop management SaaS** (inventory, sales, analytics). Sellers can start free and upgrade for advanced features.

---

## 👥 User Types

### 1. **Buyers (Customers)**
- Browse marketplace products
- Search and filter
- Purchase from any seller
- Leave reviews
- Track orders
- **Free forever**

### 2. **Basic Sellers (Free)**
- Create seller profile
- List unlimited products on marketplace
- Receive orders
- Basic messaging with buyers
- Manual order tracking
- **Pay per sale commission only** (5-10%)

### 3. **Premium Sellers (SaaS Subscribers)**
- Everything in Basic PLUS:
- **Full shop management dashboard**
- Inventory management system
- Sales tracking & analytics
- Customer database (CRM)
- Advanced reporting
- Automated alerts (low stock, etc.)
- Priority marketplace placement
- Featured product slots
- Lower commission rates (3-5%)
- Multi-user access (for staff)
- API access
- **Monthly/Annual subscription fee**

---

## 💰 Revenue Streams

### 1. **Marketplace Commission**
- **Basic Sellers**: 7-10% per sale
- **Premium Sellers**: 3-5% per sale (incentive to upgrade)
- Deducted automatically from seller earnings
- No commission on refunded/cancelled orders

### 2. **SaaS Subscriptions**

#### Starter Plan (₦15,000/month)
- Up to 100 products
- Basic analytics
- 2 staff accounts
- Standard support
- 5% marketplace commission
- 1 featured product slot/month

#### Professional Plan (₦35,000/month)
- Up to 500 products
- Advanced analytics & reports
- 5 staff accounts
- Priority support
- 4% marketplace commission
- 5 featured product slots/month
- Custom branding

#### Enterprise Plan (₦75,000/month)
- Unlimited products
- Full analytics suite
- Unlimited staff accounts
- Dedicated account manager
- 3% marketplace commission
- 20 featured product slots/month
- Custom branding
- API access
- White-label option

### 3. **Featured Listings** (One-time)
- Basic sellers can buy featured placement
- ₦5,000 - ₦20,000 per product
- Duration: 7-30 days
- Appears in homepage carousel
- Top of search results
- Category featured section

### 4. **Advertising**
- Banner ads in search results
- Sponsored product placements
- Category sponsorships
- Email newsletter ads

---

## 🏪 What Each Seller Type Gets

### Free Basic Seller Dashboard

**Pages Available:**
- Simple product listing interface
- Basic order list
- Simple sales summary
- Product upload form
- Message inbox

**Features:**
- List products on marketplace
- Upload 5 images per product
- Basic product descriptions
- Manual inventory tracking
- Order notifications (email)
- Chat with buyers
- View earnings

**Limitations:**
- No advanced analytics
- No inventory alerts
- No sales forecasting
- No customer CRM
- No bulk operations
- Higher commission (7-10%)
- No priority support
- Limited featured slots (paid extra)

### Premium Seller Dashboard (SaaS Subscriber)

**All Basic Features PLUS:**

#### Inventory Management (`/seller/inventory`)
- Real-time stock tracking
- Low stock alerts
- Automatic reorder points
- SKU management
- Barcode scanning
- Bulk import/export
- Stock movement history
- Multi-location inventory

#### Advanced Analytics (`/seller/analytics`)
- Sales trends (daily/weekly/monthly)
- Revenue forecasting
- Product performance metrics
- Customer insights
- Conversion rates
- Traffic analysis
- Best-selling products
- Slow-moving inventory alerts

#### Customer Relationship Management (`/seller/customers`)
- Customer database
- Purchase history
- Customer segmentation
- Loyalty tracking
- Email campaigns
- Custom tags
- Notes & reminders

#### Advanced Reports (`/seller/reports`)
- Sales reports (custom date ranges)
- Inventory reports
- Financial summaries
- Tax reports
- Product performance
- Customer reports
- Export to PDF/Excel
- Scheduled reports (email)

#### Staff Management (`/seller/team`)
- Multiple staff accounts
- Role-based permissions
- Activity logs
- Performance tracking

#### Settings & Automation (`/seller/settings`)
- Automated emails
- Low stock alerts
- Price rules
- Discount management
- Shipping rules
- API access (Enterprise)

---

## 🎨 UI Differentiation

### Basic Seller Interface
- Simple, streamlined UI
- Essential features only
- Mobile-first design
- Quick product posting
- Clean and minimal

### Premium Seller Interface
- Full dashboard (existing Cunga SaaS)
- Advanced charts & graphs
- Multiple sections/modules
- Customizable widgets
- Power user features
- Desktop-optimized

---

## 🔄 Upgrade Path

### How Sellers Upgrade

1. **Start Free**
   - Seller registers (free)
   - Posts products on marketplace
   - Makes first sales
   - Pays 7-10% commission

2. **Growth Phase**
   - Seller gets more orders
   - Realizes need for inventory tracking
   - Manual management becomes tedious
   - Sees upgrade prompt in dashboard

3. **Upgrade Decision**
   - Sees comparison table
   - Trial offer (14-day free trial)
   - Lower commission benefit clear
   - Advanced features preview

4. **Premium Subscriber**
   - Choose plan (Starter/Pro/Enterprise)
   - Payment (monthly/annual)
   - Full dashboard unlocks
   - Lower commission applies
   - Featured slots available

### Upgrade Prompts

**When to show upgrade prompts:**
- After 10 products listed
- After 50 orders received
- When viewing analytics (show blurred preview)
- When inventory reaches 0
- When customer asks complex question
- Monthly: "You paid ₦X in commissions, save ₦Y with Premium"

---

## 📊 Seller Dashboard Routes

### Basic Seller Routes
```
/seller/dashboard          - Simple overview
/seller/products           - Product listing & add
/seller/products/new       - Add new product
/seller/products/:id/edit  - Edit product
/seller/orders             - Order management
/seller/messages           - Buyer messages
/seller/earnings           - Simple earnings view
/seller/settings           - Basic profile settings
```

### Premium Seller Routes (Additional)
```
/seller/inventory          - Advanced inventory management
/seller/analytics          - Full analytics dashboard
/seller/customers          - Customer CRM
/seller/reports            - Advanced reports
/seller/team               - Staff management
/seller/automation         - Automated workflows
/seller/api                - API keys (Enterprise)
/seller/branding           - Custom branding (Pro+)
```

---

## 🎁 Benefits of Premium

### For Sellers
✅ Save money on lower commissions
✅ Professional tools = more sales
✅ Time savings (automation)
✅ Better customer insights
✅ Competitive advantage
✅ Scale business efficiently
✅ Priority support
✅ Featured placement

### For Cunga
✅ Recurring revenue (MRR)
✅ Customer stickiness (harder to leave)
✅ Higher lifetime value (LTV)
✅ Differentiation from competitors
✅ Premium sellers = quality products
✅ Word-of-mouth from power users
✅ Enterprise opportunities

---

## 🚀 Implementation Strategy

### Phase 1: MVP (Current)
- ✅ Marketplace landing page
- ✅ Product listing page
- [ ] Product details page
- [ ] Basic seller registration
- [ ] Simple product posting
- [ ] Order management (basic)

### Phase 2: Premium Features
- [ ] Subscription plans page
- [ ] Payment integration (Paystack/Flutterwave)
- [ ] Upgrade flow
- [ ] Access control (feature gating)
- [ ] Dashboard for premium users
- [ ] Analytics module
- [ ] Inventory alerts

### Phase 3: Advanced Features
- [ ] Customer CRM
- [ ] Advanced reports
- [ ] Staff management
- [ ] API access
- [ ] White-label options
- [ ] Custom branding

### Phase 4: Growth
- [ ] Mobile apps
- [ ] Seller onboarding automation
- [ ] Marketing automation
- [ ] Seller success programs
- [ ] Partner integrations

---

## 💡 Key Differentiators

### vs Jumia/Konga (Pure Marketplaces)
- **Cunga offers:** Integrated shop management tools
- **They offer:** Just listing/selling platform
- **Advantage:** One-stop solution for sellers

### vs Pure SaaS (Shopify, etc.)
- **Cunga offers:** Built-in marketplace + traffic
- **They offer:** Just tools, no customers
- **Advantage:** Instant access to buyers

### vs Competitors
- **Lower barrier to entry** (free to start)
- **Clear upgrade path** (when they need it)
- **Localized** (Nigeria-focused features)
- **Better commission structure** (reward premium users)

---

## 🎯 Target Sellers

### Basic (Free Tier)
- Individual sellers
- Side hustlers
- Small-scale resellers
- First-time entrepreneurs
- Students selling
- Casual sellers

### Premium (Paid Tier)
- Growing businesses
- Established shops
- Multi-product stores
- High-volume sellers
- Professional retailers
- Brand owners
- Wholesalers

---

## 📈 Success Metrics

### Marketplace Health
- Total GMV (Gross Merchandise Value)
- Active sellers
- Active buyers
- Conversion rate
- Average order value
- Repeat purchase rate

### SaaS Health
- MRR (Monthly Recurring Revenue)
- Free-to-paid conversion rate
- Churn rate
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Net Promoter Score (NPS)

### Platform Health
- Sellers using both (marketplace + SaaS)
- Cross-sell success rate
- Premium seller satisfaction
- Support ticket volume
- Feature adoption rate

---

## 🔐 Access Control Logic

```typescript
// User roles
enum UserRole {
  BUYER = 'buyer',
  BASIC_SELLER = 'basic_seller',
  PREMIUM_SELLER = 'premium_seller',
  ADMIN = 'admin'
}

// Subscription tiers
enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

// Feature flags
const features = {
  // Basic seller (free)
  'product_listing': ['basic_seller', 'premium_seller'],
  'order_management': ['basic_seller', 'premium_seller'],
  'simple_analytics': ['basic_seller', 'premium_seller'],
  
  // Premium only
  'advanced_analytics': ['premium_seller'],
  'inventory_management': ['premium_seller'],
  'customer_crm': ['premium_seller'],
  'advanced_reports': ['premium_seller'],
  'staff_accounts': ['premium_seller'],
  'api_access': ['premium_seller'], // Enterprise tier
  'custom_branding': ['premium_seller'], // Pro+ tiers
}

// Commission rates
const commissionRates = {
  'free': 0.10,      // 10%
  'starter': 0.05,   // 5%
  'professional': 0.04, // 4%
  'enterprise': 0.03    // 3%
}
```

---

## 💬 Marketing Messages

### For Basic Sellers
> "Start selling today. List your products on Cunga's marketplace and reach thousands of buyers. **Free to start, pay only when you sell.**"

### Upgrade Prompt
> "You've made ₦500,000 in sales! Upgrade to Premium and save ₦25,000/month on lower commissions, plus get powerful tools to grow even faster."

### For Premium Sellers
> "Run your entire business from one dashboard. Cunga Premium gives you marketplace access + professional shop management tools. **More sales, less hassle.**"

---

**This hybrid model gives you the best of both worlds!** 🚀

- Marketplace attracts sellers with free entry
- SaaS subscription provides recurring revenue
- Sellers naturally upgrade as they grow
- You compete with both marketplaces AND shop management tools

Should I now build the **subscription/pricing page** and **seller registration flow** with tier selection, or continue with the **product details page**? 🤔
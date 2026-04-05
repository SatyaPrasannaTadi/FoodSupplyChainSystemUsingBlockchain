# Food Supply Chain Blockchain Tracker

A simple blockchain-based food supply chain tracking system for college project demonstration. Track products from farm to consumer with immutable blockchain records.

## Features

- ✅ **5 Role-Based Dashboards** - Producer, Supplier, Retailer, Consumer, Admin
- ✅ **Product Tracking** - Complete journey from production to delivery
- ✅ **Blockchain Verification** - Immutable record of all transactions
- ✅ **QR Code Support** - Easy product verification for consumers
- ✅ **Mock Data** - Pre-populated with sample food supply chain data

## User Roles

### 🌾 Producer
- Register new food products
- Add products to blockchain
- Track registered inventory

### 🚚 Supplier
- Update transport status
- Record temperature and location
- Monitor deliveries in transit

### 🏪 Retailer
- Verify product authenticity
- Check blockchain validity
- Manage inventory

### 👥 Consumer
- Scan QR codes
- View complete product journey
- Verify blockchain authenticity

### 🛡️ Admin
- Monitor entire system
- View blockchain explorer
- Audit all transactions

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Crypto (SHA-256)** - Blockchain hashing

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB running locally or MongoDB Atlas account

### Setup

1. **Clone the repository**
```bash
cd food-supply-blokchain
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd backend
npm install
```

4. **Configure Environment Variables**

Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/food-supply-chain
PORT=5000
```

5. **Start MongoDB** (if running locally)
```bash
mongod
```

6. **Start Backend Server**
```bash
cd backend
npm start
```

7. **Start Frontend** (in new terminal)
```bash
npm run dev
```

8. **Open Application**
```
http://localhost:3000
```

## Usage

### Quick Start

1. **Visit Homepage** - Click role buttons to access dashboards
2. **Producer Dashboard** - Register a new product
3. **Supplier Dashboard** - Update transport status
4. **Retailer Dashboard** - Verify the product
5. **Consumer Portal** - View complete journey
6. **Admin Dashboard** - Monitor blockchain

### Enable Mock Data

To pre-populate the database with sample products:

1. Edit `backend/index.js`
2. Uncomment line: `// mongoose.connection.once('open', initializeMockData);`
3. Restart backend server
4. 15+ sample products will be automatically created

## API Endpoints

### Products
- `POST /api/products/register` - Register new product
- `PUT /api/products/:id/transport` - Update transport
- `PUT /api/products/:id/verify` - Verify product
- `GET /api/products/:id` - Get product details
- `GET /api/products` - List all products

### Blockchain
- `GET /api/blockchain` - Get full blockchain
- `GET /api/blockchain/validate` - Validate chain
- `GET /api/blockchain/block/:index` - Get specific block
- `POST /api/blockchain/add` - Add block manually

## Project Structure

```
food-supply-blokchain/
├── app/
│   ├── dashboard/
│   │   ├── producer/       # Producer role dashboard
│   │   ├── supplier/       # Supplier role dashboard
│   │   ├── retailer/       # Retailer role dashboard
│   │   ├── consumer/       # Consumer portal
│   │   ├── admin/          # Admin dashboard
│   │   └── layout.tsx      # Dashboard layout
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Homepage
├── backend/
│   ├── blockchain/
│   │   └── blockchain.js   # Blockchain implementation
│   ├── models/
│   │   ├── User.js        # User schema
│   │   └── Product.js     # Product schema
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── product.routes.js
│   ├── utils/
│   │   └── mockData.js    # Mock data generator
│   └── index.js           # Express server
├── components/
│   └── ui/                # Shadcn components
└── README.md
```

## Blockchain Implementation

### Block Structure
```javascript
{
  index: number,
  timestamp: string,
  data: object,
  previousHash: string,
  hash: string
}
```

### Hash Calculation
```javascript
SHA-256(index + previousHash + timestamp + JSON.stringify(data))
```

### Chain Validation
- Verifies hash integrity of each block
- Ensures proper chain linkage
- Validates no tampering has occurred

## Screenshots

### Producer Dashboard
Register new food products and track inventory

### Consumer Portal
Scan QR codes and view complete product journey

### Admin Dashboard
Monitor system and explore blockchain

## Database Schema

### Product
- Product ID, name, category
- Producer details and origin
- Production and expiry dates
- Transport history
- Verification records
- Blockchain references

### User
- Name, email, password
- Role (producer/supplier/retailer/consumer/admin)
- Organization details

## Development Notes

- This is a **college project** - simplified for demonstration
- Blockchain is **in-memory** - resets on server restart
- No cryptocurrency or mining complexity
- MongoDB persistence for product data
- Authentication is basic (can be enhanced)

## Future Enhancements

- [ ] Persistent blockchain storage
- [ ] Real QR code scanning with camera
- [ ] JWT authentication
- [ ] Real-time updates with WebSockets
- [ ] IoT sensor integration for temperature
- [ ] SMS/Email notifications
- [ ] Multi-language support

## License

This is a college project for educational purposes.

## Contributors

Student Project - Food Supply Chain Blockchain Integration

---

**Note**: This implementation uses a simple local blockchain suitable for demonstration. For production use, consider using established blockchain platforms like Ethereum, Hyperledger, or Corda.

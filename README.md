# reCommerce  

A Next.js demo store showcasing **reCeption API's** smart contract analysis capabilities during cryptocurrency payments.

## Overview

reCommerce demonstrates how re Labs' flagship product **reCeption** can intercept and analyze smart contracts in real-time during crypto transactions, providing security analysis and protecting users from malicious contracts.

## Features

- **Single Product Display** - Clean product showcase with crypto payment option
- **Coinbase Commerce Integration** - Secure cryptocurrency payment processing
- **reCeption API Integration** - Real-time smart contract security analysis
- **Payment Gating** - Transactions blocked if contracts are deemed unsafe
- **Contract Analysis Display** - Visual feedback on security assessment
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Coinbase Commerce** - Cryptocurrency payment processing
- **reCeption API** - Smart contract analysis by re Labs

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Coinbase Commerce API Configuration (SANDBOX/TESTNET)
COINBASE_COMMERCE_API_KEY=your_sandbox_api_key
COINBASE_WEBHOOK_SECRET=your_sandbox_webhook_secret

# reCeption API Configuration  
RECEPTION_API_KEY=your_reception_api_key
RECEPTION_API_URL=https://api.re-labs.io:35765/predict

# reCeption API Configuration (Frontend access)
NEXT_PUBLIC_RECEPTION_API_KEY=your_reception_api_key
NEXT_PUBLIC_RECEPTION_API_URL=https://api.re-labs.io:35765/predict
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo store.

## API Configuration

### Coinbase Commerce Setup (Testnet/Sandbox)

1. Create a [Coinbase Commerce](https://commerce.coinbase.com/) account
2. **Switch to Sandbox mode** in the dashboard settings
3. Generate **sandbox API keys** (these will have different prefixes from production keys)
4. Set up webhook endpoint: `https://yourdomain.com/api/webhook` 
5. Configure webhook to send `charge:created` events
6. **Important**: Use testnet cryptocurrencies for testing (no real money involved)

### reCeption API Setup

1. Contact [re Labs](https://re-labs.io) for reCeption API access
2. Obtain your API key and endpoint URL
3. Configure the environment variables

## User Flow

1. **Product Display** - User sees the demo product with price and description
2. **Payment Initiation** - User clicks "Pay w/ Crypto" button
3. **Contract Analysis** - reCeption API analyzes the Coinbase Transfers contract (0x96A08D8e8631b6dB52Ea0cbd7232d9A85d239147)
4. **Security Results** - User sees real-time analysis results including risk score and vulnerabilities
5. **User Decision** - User chooses to "Proceed to Payment" or "Cancel" based on security analysis
6. **Conditional Payment** - Coinbase Commerce charge is created only if user approves
7. **Payment Completion** - User completes payment via Coinbase Commerce if approved

## API Endpoints

- `POST /api/create-charge` - Create Coinbase Commerce charge
- `POST /api/webhook` - Handle Coinbase webhooks and trigger reCeption analysis
- `GET /api/charge-status/[id]` - Check payment status

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── create-charge/route.ts    # Coinbase charge creation
│   │   ├── webhook/route.ts          # Webhook handler + reCeption integration
│   │   └── charge-status/[id]/route.ts # Payment status checker
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main product page
│   └── globals.css                   # Global styles
└── components/
    ├── Product.tsx                   # Product display component
    └── PaymentButton.tsx             # Crypto payment button with analysis
```

## Environment Variables Explained

| Variable | Description |
|----------|-------------|
| `COINBASE_COMMERCE_API_KEY` | Your Coinbase Commerce **sandbox** API key for creating test charges |
| `COINBASE_WEBHOOK_SECRET` | **Sandbox** webhook secret for verifying Coinbase webhook signatures |
| `RECEPTION_API_KEY` | Your reCeption API key for smart contract analysis (server-side) |
| `RECEPTION_API_URL` | reCeption API endpoint URL (server-side) |
| `NEXT_PUBLIC_RECEPTION_API_KEY` | Your reCeption API key for frontend contract analysis |
| `NEXT_PUBLIC_RECEPTION_API_URL` | reCeption API endpoint URL for frontend access |

## Security Features

- **Pre-Payment Analysis** - reCeption API analyzes Coinbase Transfers contract before payment creation
- **Real-time Results** - Users see actual security scores and vulnerability details
- **User Consent** - Payment proceeds only with explicit user approval after seeing analysis
- **Production Contract Analysis** - Analyzes actual Coinbase production smart contract (0x96A08D8e8631b6dB52Ea0cbd7232d9A85d239147)
- **Transparent Risk Assessment** - Clear display of risk scores and detected vulnerabilities

## Demo Product

The demo features a single hardcoded product:
- **Name:** Crypto Security Scanner Pro
- **Price:** $0.01 USD
- **Description:** Advanced smart contract analysis tool

## Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Deployment

This app is ready for deployment on platforms like:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**

Ensure all environment variables are configured in your deployment platform.

## Support

For questions about:
- **reCommerce Demo:** Check this repository's issues
- **reCeption API:** Contact [re Labs](https://re-labs.io)
- **Coinbase Commerce:** Check [Coinbase Commerce docs](https://commerce.coinbase.com/docs/)

## License

This is a demo application showcasing reCeption API capabilities.

---

**Powered by reCeption** • Smart Contract Security Analysis by re Labs

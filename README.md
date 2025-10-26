# reCommerce   

A Next.js demo store showcasing **reCeption API's** smart contract analysis capabilities during cryptocurrency payments.

## Overview

reCommerce demonstrates how re Labs' flagship product **reCeption** can intercept and analyze smart contracts in real-time during crypto transactions, providing security analysis and protecting users from malicious contracts.

## Features

- **Single Product Display** - Clean product showcase with crypto payment option
- **reCeption API Integration** - Real-time smart contract security analysis
- **Payment Gating** - Transactions blocked if contracts are deemed unsafe
- **Contract Analysis Display** - Visual feedback on security assessment
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **reCeption API** - Smart contract analysis by re Labs

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env


# reCeption API Configuration  
RECEPTION_API_KEY=your_reception_api_key
RECEPTION_API_URL=https://api.re-labs.io:22543/predict

# reCeption API Configuration (Frontend access)
NEXT_PUBLIC_RECEPTION_API_KEY=your_reception_api_key
NEXT_PUBLIC_RECEPTION_API_URL=https://api.re-labs.io:22543/predict
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


### reCeption API Setup

1. Contact [re Labs](https://re-labs.io) for reCeption API access
2. Obtain your API key and endpoint URL
3. Configure the environment variables

## User Flow

1. **Product Display** - User sees the demo product with price and description
2. **Payment Initiation** - User clicks "Pay w/ Crypto" button
3. **Contract Analysis** - reCeption API analyzes the PYUSD Transfers contract on the Ethereum Sepolia network (0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9)
4. **Security Results** - User sees real-time analysis results including risk score and vulnerabilities
5. **User Decision** - User chooses to "Proceed to Payment" or "Cancel" based on security analysis
7. **Payment Completion** - User completes payment if approved


## Project Structure

```
src/
├── app/
│   ├── api/
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
| `RECEPTION_API_KEY` | Your reCeption API key for smart contract analysis (server-side) |
| `RECEPTION_API_URL` | reCeption API endpoint URL (server-side) |
| `NEXT_PUBLIC_RECEPTION_API_KEY` | Your reCeption API key for frontend contract analysis |
| `NEXT_PUBLIC_RECEPTION_API_URL` | reCeption API endpoint URL for frontend access |

## Security Features

- **Pre-Payment Analysis** - reCeption API analyzes PYUSD Transfers contract before payment creation
- **Real-time Results** - Users see actual security scores and vulnerability details
- **User Consent** - Payment proceeds only with explicit user approval after seeing analysis
- **Production Contract Analysis** - Analyzes PYUSD smart contract on the Ethereum Sepolia network(0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9)
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

## License

This is a demo application showcasing reCeption API capabilities.

---

**Powered by reCeption** • Smart Contract Security Analysis by re Labs

# Slop - AI Video Generator

A clean, minimal web application for generating funny AI videos with Google's Veo 3 and publishing to TikTok.

## Design Inspiration

This frontend is built with a ChatGPT-style interface featuring:

- Clean, minimalistic design with white, gray, and black colors
- Modern Inter font typography
- Centered textarea with 400 character limit
- Animated loading states
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features (Frontend Only - No Backend Integration)

- ✅ Clean, ChatGPT-inspired interface
- ✅ Centered prompt textarea with character counter (400 max)
- ✅ "Make it funny" placeholder text
- ✅ Generate button with loading states
- ✅ Animated loading indicators
- ✅ Example prompts for inspiration
- ✅ Responsive design
- ✅ Modern typography (Inter font)
- ✅ Quota indicator in header
- ✅ Dashboard navigation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter from Google Fonts

## File Structure

```
slop/
├── app/
│   ├── globals.css     # Global styles and Tailwind imports
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main page component
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── next.config.js      # Next.js configuration
```

## Design Principles

Following the PRD requirements:

- Simple, clean, minimalistic design
- Primary colors: white, gray, black
- Modern, clean font (Inter)
- ChatGPT-style interface
- Maximum 400 character prompts
- Centered layout with good whitespace

## Next Steps

This is a frontend-only implementation. To complete the MVP:

1. Add backend API integration
2. Implement Google Veo 3 video generation
3. Add TikTok publishing functionality
4. Create user dashboard
5. Add authentication and quota management

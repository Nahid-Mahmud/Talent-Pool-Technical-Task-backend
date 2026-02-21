# Stripe Payment Integration Guide (Backend + Next.js Frontend)

This guide explains how to use the simplified Stripe payment module with a Next.js frontend. This version uses manual session confirmation instead of webhooks.

## 1. Backend Setup

### Prerequisites

Make sure you have the following environment variables set in your backend `.env` file:

```env
STRIPE_SECRET=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:3000
```

### Endpoints

1. **Create Checkout Session**: `POST /api/v1/payments/create-checkout-session`
   - **Payload**: `{ "courseId": "COURSE_UUID" }`
   - **Protection**: Requires `student` role and valid `accessToken` cookie.
   - **Response**: `{ "data": { "url": "https://checkout.stripe.com/..." } }`

2. **Confirm Payment**: `POST /api/v1/payments/confirm-payment`
   - **Payload**: `{ "sessionId": "cs_test_..." }`
   - **Protection**: Requires `student` role and valid `accessToken` cookie.
   - **Purpose**: Verifies the Stripe session and enrolls the student.

---

## 2. Next.js Frontend Implementation

### Step 1: Install Stripe SDK

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js axios
```

### Step 2: Handle Checkout on Course Detail Page

In your course detail component:

```tsx
'use client';

import axios from 'axios';

export const BuyButton = ({ courseId }: { courseId: string }) => {
  const handleCheckout = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-checkout-session`,
        { courseId },
        { withCredentials: true }
      );

      const { url } = response.data.data;
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment');
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
    >
      Enroll Now
    </button>
  );
};
```

### Step 3: Handle Success and Confirm Payment

Create `app/payment/success/page.tsx`. This page extracts the `session_id` from the URL and calls the backend to confirm enrollment.

```tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  useEffect(() => {
    if (sessionId) {
      axios
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/confirm-payment`,
          { sessionId },
          { withCredentials: true }
        )
        .then(() => {
          setStatus('success');
        })
        .catch((err) => {
          console.error('Confirmation error:', err);
          setStatus('error');
        });
    }
  }, [sessionId]);

  if (status === 'loading')
    return (
      <div className="text-center p-10 font-medium">
        Confirming your payment...
      </div>
    );

  if (status === 'error')
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-600">
          We couldn't confirm your payment. Please contact support if your
          payment was deducted.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
      <p className="mt-2 text-gray-600 max-w-md">
        Thank you for enrolling. Your course access has been activated.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
```

---

## 3. Security Considerations

- **Backend Verification**: The backend NEVER trusts frontend data; it verifies the session status directly with Stripe using the `sessionId`.
- **Ownership Check**: The backend verifies that the payment was for the specific user and course before creating the enrollment.
- **Cookie Security**: `withCredentials: true` is crucial to ensure the backend identifies the user via their `accessToken` cookie.

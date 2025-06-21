This is a template for Stripe integration. You can use this template to integrate Stripe in your application. Use this template as a reference and provide context for large language models (LLMs). You can change the code as per your application needs.

## **Step 1: Define Pricing Details**

**To maintain structured pricing, we create a JSON schema that includes pricing tiers with their respective Stripe** `price_id` **values.**

```typescript
interface PricingTier {
  name: string;
  description: string;
  features: Feature[];
  priceId?: string;
  disabled?: boolean;
}
```

## **Step 2: Create a Stripe Checkout Session**

### **Frontend Code**

**When a user selects a pricing plan, we send a request to the backend API to create a checkout session.**

```typescript
sessionStorage.setItem('pendingPayment', 'true');
const { data } = await apiClient.post('/api/stripe/checkout', {
  email: session?.user?.email,
  planName: name,
});
```

### **Backend Code**

**The backend retrieves the selected plan and its corresponding** `price_id`**, then creates a Stripe checkout session.**

```typescript
const selectedTier = tiers.find((tier) => tier.name === planName);

const priceId = selectedTier.priceId;

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'subscription',
  billing_address_collection: 'auto',
  customer_email: email,
  allow_promotion_codes: true,
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],

  success_url: ${process.env.NEXT_PUBLIC_BASE_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}#pricing,
  cancel_url: ${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true#pricing,
});
return NextResponse.json({ sessionId: session.id, url: session.url });
```

In frontend code we set a session variable and in backend the success and cancel URLs. We pass certain parameters in URL which are helpful to validate the payment from the user and perform necessary operations in frontend.

## **Step 3: Verify Payment**

### **Frontend Code**

**After the payment is completed, we verify its success by checking the URL parameters and making an API call to verify the session.**

```typescript
const pendingPayment = sessionStorage.getItem('pendingPayment');
sessionStorage.removeItem('pendingPayment');

const success = searchParams.get('success');
const sessionId = searchParams.get('session_id');
const canceled = searchParams.get('canceled');

if (success === 'true' && sessionId) {
    toast.promise(
      apiClient.get(`/api/stripe/verify-payment?session_id=${sessionId}`).then((response) => {
        if (response.data.success) {
           // Perform operations in UI like session/redirect or others on success.
        }
        return response;
      }),
      {
        loading: 'Verifying payment...',
        success: 'Plan purchased successfully!',
        error: 'Unable to verify payment',
      },
    );
  }
}
```

### **Backend Code**

**The backend verifies the payment status by checking the session details in Stripe.**

```typescript
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Payment not completed' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error verifying payment' }, { status: 500 });
  }
}
```

## **Step 4: Implement Webhooks for Database Updates**

**To handle subscription status updates (activation, expiration, and cancellation), we set up Stripe webhooks. Here I have setup the webhooks which are required formy application. You can add/remove webhooks based on your application need.**

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return new NextResponse('No signature', { status: 400 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const data = event.data;
    const eventType = event.type;

    switch (eventType) {
      case 'checkout.session.completed':
        const checkoutSession = data.object as Stripe.Checkout.Session;
        const session = await stripe.checkout.sessions.retrieve(checkoutSession.id, {
          expand: ['line_items.data.price'],
        });

        const email = session.customer_details?.email;
        const customerId = session.customer;
        const priceId = session.line_items?.data[0]?.price?.id;
        const planName = getPlanNameFromPriceId(priceId || '');

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const activatedAt = new Date(subscription.current_period_start * 1000);
        const expiresAt = new Date(subscription.current_period_end * 1000);

        // Perform any DB/Backend operation based on your application need here.

        break;

      case 'customer.subscription.updated':
        const updatedSubscription = data.object as Stripe.Subscription;
        const updatedCustomer = updatedSubscription.customer as string;

        const updatedUser = await prisma.users.findFirst({
          where: { stripeCustomerId: updatedCustomer },
          select: { id: true, planDetails: true },
        });

        if (!updatedUser) break;

        const updatedPriceId = updatedSubscription.items.data[0].price.id;
        const updatedPlanName = getPlanNameFromPriceId(updatedPriceId || '');
        const updatedAmount = '$' + (updatedSubscription.items.data[0].price.unit_amount || 0) / 100;
        const updatedActivatedAt = new Date(updatedSubscription.current_period_start * 1000);
        const updatedExpiresAt = new Date(updatedSubscription.current_period_end * 1000);

       // Perform any DB/Backend operation based on your application need here.
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = data.object as Stripe.Subscription;
        const customer = deletedSubscription.customer as string;

        const userToUpdate = await prisma.users.findFirst({
          where: { stripeCustomerId: customer },
          select: { id: true, planDetails: true },
        });

        if (!userToUpdate) break;

       // Perform any DB/Backend operation based on your application need here.
        break;

      case 'customer.subscription.resumed':
        const resumedSubscription = data.object as Stripe.Subscription;
        const resumedCustomer = resumedSubscription.customer as string;

        const resumedUser = await prisma.users.findFirst({
          where: { stripeCustomerId: resumedCustomer },
          select: { id: true, planDetails: true },
        });

        if (!resumedUser) break;

        const resumedPriceId = resumedSubscription.items.data[0].price.id;
        const resumedPlanName = getPlanNameFromPriceId(resumedPriceId || '');
        const resumedAmount = '$' + (resumedSubscription.items.data[0].price.unit_amount || 0) / 100;
        const resumedActivatedAt = new Date(resumedSubscription.current_period_start * 1000);
        const resumedExpiresAt = new Date(resumedSubscription.current_period_end * 1000);

       // Perform any DB/Backend operation based on your application need here.
        break;
    }

    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    return new NextResponse('Webhook handling error', { status: 500 });
  }
}
```

## Step 5 (Optional): Free Trial Integration.

This is a API for free trial. You can can call this API whenever required for free trial. This will enable free trial for the user in stripe.

```typescript
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const user = await UserService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
    });
    const customerId = customer.id;
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: tiers.find((tier) => tier.name === 'Free')?.priceId,
        },
      ],
      trial_period_days: 30,
    });
    // Perform DB/Backend Operation based on app. logic here.

    return NextResponse.json({ success: true, planDetails });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create free trial' }, { status: 500 });
  }
}
```
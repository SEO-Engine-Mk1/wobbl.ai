/**
 * Stripe Integration Configuration
 * Handles Stripe payment processing and subscription management
 */

import { createHmac } from 'crypto';

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
  apiVersion?: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
  created: number;
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, string>;
  images?: string[];
  price?: StripePrice;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count?: number;
  };
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  current_period_start: number;
  current_period_end: number;
  items: Array<{
    id: string;
    price: StripePrice;
    quantity: number;
  }>;
  metadata?: Record<string, string>;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  customer?: string;
  metadata?: Record<string, string>;
}

export interface StripeCheckoutSession {
  id: string;
  url?: string;
  customer?: string;
  payment_status: 'unpaid' | 'paid';
  status: 'open' | 'complete' | 'expired';
  metadata?: Record<string, string>;
}

class StripeIntegration {
  private config: StripeConfig;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(config: StripeConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': this.config.apiVersion || '2023-10-16',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Stripe API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  // Customer management
  async createCustomer(customer: {
    email: string;
    name?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCustomer> {
    const params = new URLSearchParams();
    params.append('email', customer.email);
    if (customer.name) params.append('name', customer.name);
    if (customer.description) params.append('description', customer.description);
    if (customer.metadata) {
      Object.entries(customer.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripeCustomer>('/customers', {
      method: 'POST',
      body: params,
    });
  }

  async getCustomer(customerId: string): Promise<StripeCustomer> {
    return this.makeRequest<StripeCustomer>(`/customers/${customerId}`);
  }

  async updateCustomer(
    customerId: string,
    updates: {
      email?: string;
      name?: string;
      description?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<StripeCustomer> {
    const params = new URLSearchParams();
    if (updates.email) params.append('email', updates.email);
    if (updates.name) params.append('name', updates.name);
    if (updates.description) params.append('description', updates.description);
    if (updates.metadata) {
      Object.entries(updates.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripeCustomer>(`/customers/${customerId}`, {
      method: 'POST',
      body: params,
    });
  }

  async deleteCustomer(customerId: string): Promise<{ deleted: boolean }> {
    return this.makeRequest(`/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  async listCustomers(options: {
    email?: string;
    limit?: number;
    starting_after?: string;
  } = {}): Promise<{
    data: StripeCustomer[];
    has_more: boolean;
    url: string;
  }> {
    const params = new URLSearchParams();
    if (options.email) params.append('email', options.email);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.starting_after) params.append('starting_after', options.starting_after);

    const query = params.toString();
    return this.makeRequest(`/customers${query ? `?${query}` : ''}`);
  }

  // Product management
  async createProduct(product: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
    images?: string[];
  }): Promise<StripeProduct> {
    const params = new URLSearchParams();
    params.append('name', product.name);
    if (product.description) params.append('description', product.description);
    if (product.images) {
      product.images.forEach((image, index) => {
        params.append(`images[${index}]`, image);
      });
    }
    if (product.metadata) {
      Object.entries(product.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripeProduct>('/products', {
      method: 'POST',
      body: params,
    });
  }

  async getProduct(productId: string): Promise<StripeProduct> {
    return this.makeRequest<StripeProduct>(`/products/${productId}`);
  }

  async updateProduct(
    productId: string,
    updates: {
      name?: string;
      description?: string;
      metadata?: Record<string, string>;
      images?: string[];
    }
  ): Promise<StripeProduct> {
    const params = new URLSearchParams();
    if (updates.name) params.append('name', updates.name);
    if (updates.description) params.append('description', updates.description);
    if (updates.images) {
      updates.images.forEach((image, index) => {
        params.append(`images[${index}]`, image);
      });
    }
    if (updates.metadata) {
      Object.entries(updates.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripeProduct>(`/products/${productId}`, {
      method: 'POST',
      body: params,
    });
  }

  // Price management
  async createPrice(price: {
    product: string;
    unit_amount: number;
    currency: string;
    recurring?: {
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count?: number;
    };
    metadata?: Record<string, string>;
  }): Promise<StripePrice> {
    const params = new URLSearchParams();
    params.append('product', price.product);
    params.append('unit_amount', price.unit_amount.toString());
    params.append('currency', price.currency);
    
    if (price.recurring) {
      params.append('recurring[interval]', price.recurring.interval);
      if (price.recurring.interval_count) {
        params.append('recurring[interval_count]', price.recurring.interval_count.toString());
      }
    }
    
    if (price.metadata) {
      Object.entries(price.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripePrice>('/prices', {
      method: 'POST',
      body: params,
    });
  }

  async getPrice(priceId: string): Promise<StripePrice> {
    return this.makeRequest<StripePrice>(`/prices/${priceId}`);
  }

  async listPrices(options: {
    product?: string;
    active?: boolean;
    limit?: number;
    starting_after?: string;
  } = {}): Promise<{
    data: StripePrice[];
    has_more: boolean;
    url: string;
  }> {
    const params = new URLSearchParams();
    if (options.product) params.append('product', options.product);
    if (options.active !== undefined) params.append('active', options.active.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.starting_after) params.append('starting_after', options.starting_after);

    const query = params.toString();
    return this.makeRequest(`/prices${query ? `?${query}` : ''}`);
  }

  // Payment Intents
  async createPaymentIntent(paymentIntent: {
    amount: number;
    currency: string;
    customer?: string;
    metadata?: Record<string, string>;
    automatic_payment_methods?: { enabled: boolean };
  }): Promise<StripePaymentIntent> {
    const params = new URLSearchParams();
    params.append('amount', paymentIntent.amount.toString());
    params.append('currency', paymentIntent.currency);
    if (paymentIntent.customer) params.append('customer', paymentIntent.customer);
    if (paymentIntent.automatic_payment_methods) {
      params.append('automatic_payment_methods[enabled]', 'true');
    }
    if (paymentIntent.metadata) {
      Object.entries(paymentIntent.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripePaymentIntent>('/payment_intents', {
      method: 'POST',
      body: params,
    });
  }

  async getPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    return this.makeRequest<StripePaymentIntent>(`/payment_intents/${paymentIntentId}`);
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    const params = new URLSearchParams();
    params.append('payment_method', 'pm_card_visa'); // Default payment method for testing

    return this.makeRequest<StripePaymentIntent>(`/payment_intents/${paymentIntentId}/confirm`, {
      method: 'POST',
      body: params,
    });
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    return this.makeRequest<StripePaymentIntent>(`/payment_intents/${paymentIntentId}/cancel`, {
      method: 'POST',
    });
  }

  // Checkout Sessions
  async createCheckoutSession(session: {
    customer?: string;
    customer_email?: string;
    line_items: Array<{
      price: string;
      quantity: number;
    }>;
    mode?: 'payment' | 'subscription';
    success_url: string;
    cancel_url: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCheckoutSession> {
    const params = new URLSearchParams();
    if (session.customer) params.append('customer', session.customer);
    if (session.customer_email) params.append('customer_email', session.customer_email);
    if (session.mode) params.append('mode', session.mode);
    params.append('success_url', session.success_url);
    params.append('cancel_url', session.cancel_url);
    
    session.line_items.forEach((item, index) => {
      params.append(`line_items[${index}][price]`, item.price);
      params.append(`line_items[${index}][quantity]`, item.quantity.toString());
    });
    
    if (session.metadata) {
      Object.entries(session.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripeCheckoutSession>('/checkout/sessions', {
      method: 'POST',
      body: params,
    });
  }

  async getCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
    return this.makeRequest<StripeCheckoutSession>(`/checkout/sessions/${sessionId}`);
  }

  // Subscriptions
  async createSubscription(subscription: {
    customer: string;
    items: Array<{
      price: string;
      quantity?: number;
    }>;
    metadata?: Record<string, string>;
    trial_period_days?: number;
  }): Promise<StripeSubscription> {
    const params = new URLSearchParams();
    params.append('customer', subscription.customer);
    
    subscription.items.forEach((item, index) => {
      params.append(`items[${index}][price]`, item.price);
      if (item.quantity) {
        params.append(`items[${index}][quantity]`, item.quantity.toString());
      }
    });
    
    if (subscription.trial_period_days) {
      params.append('trial_period_days', subscription.trial_period_days.toString());
    }
    
    if (subscription.metadata) {
      Object.entries(subscription.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripeSubscription>('/subscriptions', {
      method: 'POST',
      body: params,
    });
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    return this.makeRequest<StripeSubscription>(`/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(
    subscriptionId: string,
    updates: {
      items?: Array<{
        id: string;
        price?: string;
        quantity?: number;
        deleted?: boolean;
      }>;
      metadata?: Record<string, string>;
      trial_end?: number | 'now';
    }
  ): Promise<StripeSubscription> {
    const params = new URLSearchParams();
    
    if (updates.items) {
      updates.items.forEach((item, index) => {
        if (item.id) params.append(`items[${index}][id]`, item.id);
        if (item.price) params.append(`items[${index}][price]`, item.price);
        if (item.quantity) params.append(`items[${index}][quantity]`, item.quantity.toString());
        if (item.deleted !== undefined) params.append(`items[${index}][deleted]`, item.deleted.toString());
      });
    }
    
    if (updates.trial_end) {
      params.append('trial_end', updates.trial_end.toString());
    }
    
    if (updates.metadata) {
      Object.entries(updates.metadata).forEach(([key, value]) => {
        params.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest<StripeSubscription>(`/subscriptions/${subscriptionId}`, {
      method: 'POST',
      body: params,
    });
  }

  async cancelSubscription(
    subscriptionId: string,
    options: {
      at_period_end?: boolean;
      immediate?: boolean;
    } = {}
  ): Promise<StripeSubscription> {
    const params = new URLSearchParams();
    if (options.at_period_end) params.append('at_period_end', 'true');
    if (options.immediate) params.append('immediate', 'true');

    return this.makeRequest<StripeSubscription>(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      body: params,
    });
  }

  // Webhook handling
  constructWebhookEvent(payload: string, signature: string): any {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret is required for webhook event construction');
    }

    const webhookSecret = this.config.webhookSecret;
    const header = signature;
    
    try {
      return createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }

  // Balance and transactions
  async getBalance(): Promise<{
    available: Array<{ amount: number; currency: string; source_types: Record<string, number> }>;
    connect_reserved: Array<{ amount: number; currency: string }>;
    livemode: boolean;
    object: string;
  }> {
    return this.makeRequest('/balance');
  }

  async listBalanceTransactions(options: {
    limit?: number;
    starting_after?: string;
    created?: { gte?: number; lte?: number };
  } = {}): Promise<{
    data: any[];
    has_more: boolean;
    url: string;
  }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.starting_after) params.append('starting_after', options.starting_after);
    if (options.created?.gte) params.append('created[gte]', options.created.gte.toString());
    if (options.created?.lte) params.append('created[lte]', options.created.lte.toString());

    const query = params.toString();
    return this.makeRequest(`/balance_transactions${query ? `?${query}` : ''}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.getBalance();
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
      };
    }
  }
}

export default StripeIntegration;

// Utility functions
export function createStripeClient(config: StripeConfig): StripeIntegration {
  return new StripeIntegration(config);
}

export function validateStripeConfig(config: StripeConfig): boolean {
  return !!(config.secretKey && config.publishableKey);
}

export function getStripeConfigFromEnv(): StripeConfig | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !publishableKey) {
    return null;
  }

  return {
    secretKey,
    publishableKey,
    webhookSecret,
    apiVersion: '2023-10-16',
  };
}

// Common webhook event types
export const WEBHOOK_EVENTS = {
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
} as const;
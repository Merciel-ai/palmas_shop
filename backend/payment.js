const axios = require('axios');
const crypto = require('crypto');

// Orange Money API Configuration
const ORANGE_API = {
  baseUrl: 'https://api.orange.com',
  sandboxUrl: 'https://api.orange.com',
  merchantKey: process.env.ORANGE_MERCHANT_KEY || 'YOUR_ORANGE_MERCHANT_KEY',
  merchantId: process.env.ORANGE_MERCHANT_ID || 'YOUR_ORANGE_MERCHANT_ID',
  webhookSecret: process.env.ORANGE_WEBHOOK_SECRET || 'palmas_secret_2026'
};

// MTN Mobile Money API Configuration
const MTN_API = {
  baseUrl: 'https://sandbox.momoapi.mtn.com',
  subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY || 'YOUR_MTN_SUBSCRIPTION_KEY',
  userId: process.env.MTN_USER_ID || 'YOUR_MTN_USER_ID',
  apiKey: process.env.MTN_API_KEY || 'YOUR_MTN_API_KEY',
  webhookSecret: process.env.MTN_WEBHOOK_SECRET || 'palmas_mtn_secret_2026'
};

// Payment storage (in production, use database)
let payments = [];

// Generate unique transaction ID
const generateTransactionId = () => {
  return `PALMAS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ========== ORANGE MONEY PAYMENT ==========
const initiateOrangePayment = async (amount, phoneNumber, orderId) => {
  try {
    // Format phone number (remove leading 0, add country code)
    let formattedPhone = phoneNumber.toString().replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '237' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('237')) {
      formattedPhone = '237' + formattedPhone;
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Store payment record
    const paymentRecord = {
      transactionId,
      orderId,
      amount,
      phoneNumber: formattedPhone,
      provider: 'orange',
      status: 'pending',
      createdAt: new Date(),
      paymentUrl: null
    };
    payments.push(paymentRecord);

    // For Orange Money, we need to create a payment token
    // In production, you would call Orange Money API:
    /*
    const tokenResponse = await axios.post(`${ORANGE_API.baseUrl}/oauth/v3/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${ORANGE_API.merchantKey}:${ORANGE_API.merchantId}`).toString('base64')}`
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    const paymentResponse = await axios.post(
      `${ORANGE_API.baseUrl}/orange-money-webpay/cm/v1/webpayment`,
      {
        amount: amount,
        currency: 'XAF',
        orderId: transactionId,
        phoneNumber: formattedPhone,
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/status`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
        notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/webhook/orange`
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    paymentRecord.paymentUrl = paymentResponse.data.paymentUrl;
    */
    
    // For demo/sandbox, simulate payment request
    console.log(`[ORANGE MONEY] Payment request for ${amount} CFA to ${formattedPhone}`);
    
    return {
      success: true,
      transactionId,
      message: `Payment request sent to ${formattedPhone}. Please check your phone and enter your PIN to complete payment.`,
      instructions: "1. Check your phone\n2. Enter your Orange Money PIN\n3. Confirm the transaction\n4. You'll receive a confirmation message"
    };
    
  } catch (error) {
    console.error('Orange payment error:', error);
    return {
      success: false,
      error: 'Payment initialization failed. Please try again.'
    };
  }
};

// ========== MTN MOBILE MONEY PAYMENT ==========
const initiateMTNPayment = async (amount, phoneNumber, orderId) => {
  try {
    // Format phone number
    let formattedPhone = phoneNumber.toString().replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '237' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('237')) {
      formattedPhone = '237' + formattedPhone;
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();
    const referenceId = crypto.randomBytes(16).toString('hex');

    // Store payment record
    const paymentRecord = {
      transactionId,
      referenceId,
      orderId,
      amount,
      phoneNumber: formattedPhone,
      provider: 'mtn',
      status: 'pending',
      createdAt: new Date()
    };
    payments.push(paymentRecord);

    // For MTN Mobile Money API
    // In production, you would call MTN API:
    /*
    // Step 1: Get API Key
    const apiKeyResponse = await axios.post(`${MTN_API.baseUrl}/collection/token/`, 
      {
        grant_type: 'client_credentials'
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${MTN_API.userId}:${MTN_API.apiKey}`).toString('base64')}`,
          'Ocp-Apim-Subscription-Key': MTN_API.subscriptionKey
        }
      }
    );
    
    const accessToken = apiKeyResponse.data.access_token;
    
    // Step 2: Request to pay
    const paymentResponse = await axios.post(
      `${MTN_API.baseUrl}/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency: 'XAF',
        externalId: transactionId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: formattedPhone
        },
        payerMessage: `Payment for order ${orderId}`,
        payeeNote: 'Palmas Store Purchase'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'Ocp-Apim-Subscription-Key': MTN_API.subscriptionKey,
          'Content-Type': 'application/json'
        }
      }
    );
    */
    
    // For demo/sandbox, simulate payment request
    console.log(`[MTN MOMO] Payment request for ${amount} CFA to ${formattedPhone}`);
    
    return {
      success: true,
      transactionId,
      referenceId,
      message: `Payment request sent to ${formattedPhone}. Please check your phone and enter your PIN to complete payment.`,
      instructions: "1. Check your phone\n2. Enter your Mobile Money PIN\n3. Confirm the transaction\n4. You'll receive a confirmation message"
    };
    
  } catch (error) {
    console.error('MTN payment error:', error);
    return {
      success: false,
      error: 'Payment initialization failed. Please try again.'
    };
  }
};

// ========== CHECK PAYMENT STATUS ==========
const checkPaymentStatus = async (transactionId) => {
  const payment = payments.find(p => p.transactionId === transactionId);
  if (!payment) {
    return { success: false, error: 'Payment not found' };
  }
  
  return {
    success: true,
    status: payment.status,
    transactionId: payment.transactionId,
    amount: payment.amount,
    provider: payment.provider
  };
};

// ========== WEBHOOK HANDLER (Called by Mobile Money Provider) ==========
const handlePaymentWebhook = async (provider, data) => {
  console.log(`[WEBHOOK] Received from ${provider}:`, data);
  
  // Verify webhook signature (in production)
  // Update payment status
  const transactionId = data.transactionId || data.externalId;
  const payment = payments.find(p => p.transactionId === transactionId);
  
  if (payment) {
    if (data.status === 'SUCCESS' || data.status === 'successful') {
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.transactionReference = data.transactionReference || data.referenceId;
      
      console.log(`✅ Payment completed for transaction ${transactionId}`);
      return { success: true, message: 'Payment status updated' };
    } else if (data.status === 'FAILED' || data.status === 'failed') {
      payment.status = 'failed';
      payment.failedAt = new Date();
      console.log(`❌ Payment failed for transaction ${transactionId}`);
      return { success: true, message: 'Payment status updated' };
    }
  }
  
  return { success: false, message: 'Payment not found' };
};

// ========== SIMULATE PAYMENT (For Testing) ==========
const simulatePaymentSuccess = (transactionId) => {
  const payment = payments.find(p => p.transactionId === transactionId);
  if (payment) {
    payment.status = 'completed';
    payment.completedAt = new Date();
    return { success: true, message: 'Payment simulated successfully' };
  }
  return { success: false, error: 'Payment not found' };
};

module.exports = {
  initiateOrangePayment,
  initiateMTNPayment,
  checkPaymentStatus,
  handlePaymentWebhook,
  simulatePaymentSuccess,
  payments
};
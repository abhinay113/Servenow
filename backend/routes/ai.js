const express = require('express')
const router  = express.Router()
const Anthropic = require('@anthropic-ai/sdk')
const Service = require('../models/Service')

const client = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY
})

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body
    if (!messages || !messages.length)
      return res.status(400).json({ error: 'messages are required' })

    // Fetch live services from DB for context
    const services = await Service.find({ isActive: true })
      .select('name category price duration rating description')

    const servicesContext = services.map(s =>
      `- ${s.name} (${s.category}): ₹${s.price}, ${s.duration} mins, Rating: ${s.rating}/5 — ${s.description}`
    ).join('\n')

    const systemPrompt = `You are ServeNow's friendly AI assistant. ServeNow is a home services booking platform in India.

Your job is to:
- Answer questions about our services, pricing, and booking process
- Help users choose the right service for their problem
- Guide users on how to book, pay, and track their bookings
- Be helpful, friendly, and concise

Available Services on ServeNow right now:
${servicesContext}

How Booking Works:
1. Browse services → click Book Now
2. Pick a date and time slot
3. Enter your address
4. Pay via UPI or card through Razorpay (secure)
5. Get instant confirmation + email

Payment: We accept UPI, credit/debit cards via Razorpay. 100% secure.
Cancellation: Users can cancel from My Bookings page.
Support: Users can email us or chat here.

Available Coupon Codes:
- SAVE10 → 10% off
- FLAT100 → ₹100 off
- FIRST50 → 50% off
- SERVENOW → ₹200 off

Important rules:
- Keep answers short and helpful (2-4 lines max)
- If user wants to book, tell them to click "Book Now" on the service page
- Use ₹ for prices, not Rs or INR
- Be warm and conversational
- If you don't know something, say "I'll connect you with our support team"
- Never make up services or prices not listed above`

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 400,
      system:     systemPrompt,
      messages:   messages.map(m => ({
        role:    m.role,
        content: m.content
      }))
    })

    res.json({
      message: response.content[0].text
    })
  } catch (err) {
    console.error('AI error:', err.message)
    res.status(500).json({ error: 'AI service unavailable' })
  }
})

module.exports = router
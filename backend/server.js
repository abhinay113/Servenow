const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/slots',    require('./routes/slots'));
app.use('/api/payment',  require('./routes/payment'));
app.use('/api/admin',    require('./routes/admin'));

// Seed default services on first run
async function seedServices() {
  const Service = require('./models/Service');
  const count = await Service.countDocuments();
  if (count > 0) return;
  await Service.insertMany([
    { name: 'Premium Salon at Home',  category: 'salon',      description: 'Professional haircut, styling and grooming at your doorstep.', price: 599,  duration: 60,  rating: 4.8, reviewCount: 234, workingHours: { start: '09:00', end: '20:00' } },
    { name: 'Deep Home Cleaning',     category: 'cleaning',   description: 'Full home deep cleaning including kitchen and bathrooms.',      price: 1299, duration: 180, rating: 4.6, reviewCount: 189, workingHours: { start: '08:00', end: '18:00' } },
    { name: 'AC Repair & Service',    category: 'repair',     description: 'Expert AC repair, servicing and gas refill. All brands.',       price: 499,  duration: 90,  rating: 4.7, reviewCount: 312, workingHours: { start: '09:00', end: '19:00' } },
    { name: 'Plumbing Services',      category: 'plumbing',   description: 'Fix leaks, blockages, tap and bathroom fitting.',               price: 299,  duration: 60,  rating: 4.5, reviewCount: 156, workingHours: { start: '08:00', end: '20:00' } },
    { name: 'Electrical Work',        category: 'electrical', description: 'Wiring, fan installation, switchboard repair by certified pros.',price: 399,  duration: 60,  rating: 4.6, reviewCount: 201, workingHours: { start: '09:00', end: '19:00' } },
    { name: 'Bathroom Cleaning',      category: 'cleaning',   description: 'Complete bathroom sanitization, tile scrubbing, disinfection.', price: 499,  duration: 90,  rating: 4.4, reviewCount: 98,  workingHours: { start: '08:00', end: '18:00' } }
  ]);
  console.log('✅ Services seeded');
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedServices();
  })
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
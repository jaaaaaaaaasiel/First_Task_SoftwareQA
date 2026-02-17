import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), establishments(nombre)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { establishment_id, items, payment_method, pickup_slot } = req.body;
  const { data, error } = await supabase.from('orders').insert({
    user_id: req.user.id,
    establishment_id,
    payment_method,
    pickup_slot,
    status: 'pending'
  }).select('id').single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('establishments')
    .select('id, nombre, logo_url, is_accepting_orders, horario')
    .eq('is_accepting_orders', true);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id/menu', async (req, res) => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('establishment_id', req.params.id)
    .in('categoria', ['Entradas', 'Platos principales', 'Postres'])
    .order('categoria');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;

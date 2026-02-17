import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();
router.use(requireAuth);

router.get('/balance', async (req, res) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance_centavos')
    .eq('user_id', req.user.id)
    .single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  const balance = data ? data.balance_centavos / 100 : 0;
  res.json({ balance, balance_centavos: data?.balance_centavos ?? 0 });
});

router.post('/topup', async (req, res) => {
  const { amount_centavos } = req.body;
  const { data, error } = await supabase.rpc('wallet_topup', {
    p_user_id: req.user.id,
    p_amount: amount_centavos
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;

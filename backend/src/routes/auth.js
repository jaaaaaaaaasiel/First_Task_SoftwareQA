import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { emailValidator, validateLasalleEmail } from '../middleware/validateEmail.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', emailValidator, [
  body('nombre').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('matricula').trim().notEmpty()
], async (req, res) => {
  const { nombre, email, matricula, password } = req.body;
  if (!validateLasalleEmail(email)) {
    return res.status(400).json({ error: 'Correo debe ser @lasallebajio.edu.mx' });
  }
  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert({
    nombre, email: email.toLowerCase(), matricula, password_hash: hash
  }).select('id, nombre, email, matricula').single();
  if (error) return res.status(400).json({ error: error.message });
  const token = jwt.sign({ id: data.id, matricula: data.matricula }, JWT_SECRET);
  res.status(201).json({ user: data, token });
});

router.post('/login', [
  body('matricula').trim().notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const { matricula, password } = req.body;
  const { data: user, error } = await supabase
    .from('users')
    .select('id, nombre, email, matricula, password_hash')
    .eq('matricula', matricula)
    .single();
  if (error || !user) return res.status(401).json({ error: 'Credenciales inválidas' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
  const token = jwt.sign({ id: user.id, matricula: user.matricula }, JWT_SECRET);
  delete user.password_hash;
  res.json({ user, token });
});

export default router;

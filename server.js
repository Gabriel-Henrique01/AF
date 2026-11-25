import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

mongoose.connect(process.env.MONGODB_URI, { dbName: 'Movimentacao' })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro na conexão: ', err.message));

const movimentacaoSchema = new mongoose.Schema({
  descricao: { type: String, required: true, trim: true, minlength: 2 },
  tipo: { type: String, required: true, enum: ['entrada', 'saida'] },
  categoria: { type: String, required: true, trim: true },
  valor: { type: Number, required: true, min: 0 },
  data: { type: Date, required: true, default: Date.now }
}, { collection: 'Movimentacao', timestamps: true });

const Movimentacao = mongoose.model('Movimentacao', movimentacaoSchema, 'Movimentacao');

app.get('/', (req, res) => res.json({ msg: 'API rodando' }));

app.post('/movimentacoes', async (req, res) => {
  try {
    const movimentacao = await Movimentacao.create(req.body);
    res.status(201).json(movimentacao);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

app.get('/movimentacoes', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.categoria) {
      filtro.categoria = req.query.categoria;
    }
    const movimentacoes = await Movimentacao.find(filtro).sort({ data: -1 });
    res.json(movimentacoes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/movimentacoes/saldo', async (req, res) => {
  try {
    const todas = await Movimentacao.find();
    let entradas = 0;
    let saidas = 0;

    todas.forEach(item => {
      if (item.tipo === 'entrada') entradas += item.valor;
      else if (item.tipo === 'saida') saidas += item.valor;
    });

    res.json({
      entradas,
      saidas,
      saldo: entradas - saidas
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/movimentacoes/:id', async (req, res) => {
  try {
    await Movimentacao.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Movimentação excluída com sucesso' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
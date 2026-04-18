const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();


app.use(cors());
app.use(express.json());


// PARTE 1: ATIVIDADE ANTIGA (Cientistas)

const citacoesCientistas = [
  { autor: "Albert Einstein", citacao: "A imaginação é mais importante que o conhecimento." },
  { autor: "Isaac Newton", citacao: "Se vi mais longe, foi por estar de pé sobre ombros de gigantes." },
  { autor: "Marie Curie", citacao: "Nada na vida deve ser temido, somente compreendido." },
  { autor: "Galileu Galilei", citacao: "A matemática é o alfabeto com o qual Deus escreveu o universo." },
  { autor: "Charles Darwin", citacao: "Não é o mais forte que sobrevive, nem o mais inteligente, mas o que melhor se adapta às mudanças." },
  { autor: "Nikola Tesla", citacao: "O presente é deles; o futuro, pelo qual eu realmente trabalhei, é meu." },
  { autor: "Stephen Hawking", citacao: "A inteligência é a capacidade de se adaptar à mudança." },
  { autor: "Carl Sagan", citacao: "Alegações extraordinárias exigem evidências extraordinárias." },
  { autor: "Richard Feynman", citacao: "O que eu não posso criar, eu não entendo." },
  { autor: "Niels Bohr", citacao: "Um especialista é uma pessoa que cometeu todos os erros possíveis numa área muito restrita." }
  
];

app.get('/', (req, res) => {
  res.send('API Express rodando! Servindo Cientistas e Tarefas.');
});

app.get('/random', (req, res) => {
  const numero = Math.floor(Math.random() * 100) + 1;
  res.send(numero.toString());
});

app.get('/dado', (req, res) => {
  const dado = Math.floor(Math.random() * 6) + 1;
  res.send(dado.toString());
});

app.get('/citacoes', (req, res) => {
  const indiceAleatorio = Math.floor(Math.random() * citacoesCientistas.length);
  res.send(citacoesCientistas[indiceAleatorio]);
});


// PARTE 2: ATIVIDADE NOVA (Tarefas NeonDB)



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/tarefas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tarefas ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tarefas', async (req, res) => {
  try {
    const { descricao, concluida } = req.body;
    const result = await pool.query(
      'INSERT INTO tarefas (descricao, concluida) VALUES ($1, $2) RETURNING *',
      [descricao, concluida || false]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, concluida } = req.body;
    const result = await pool.query(
      'UPDATE tarefas SET descricao = $1, concluida = $2 WHERE id = $3 RETURNING *',
      [descricao, concluida, id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tarefas WHERE id = $1', [id]);
    res.json({ message: "Tarefa removida com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;

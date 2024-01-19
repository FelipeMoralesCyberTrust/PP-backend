import express from 'express';
import bodyParser from 'body-parser';
import { run } from './index.js';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Habilitar CORS

app.post('/chat', async (req, res) => {
  const userQuestion = req.body.query;

  try {
    const response = await run(userQuestion);
    res.json(response);
  } catch (error) {
    console.error('Error during chat processing:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(80, () => {
  console.log('Chatbot API listening on port 80');
});

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SCRAPER_KEY = '893615e3d67d13c8b09530af9d28c5c6';

app.get('/precos', async (req, res) => {
  const { nome } = req.query;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome da carta é obrigatório' });
  }

  try {
    const ligaUrl = `https://www.ligapokemon.com.br/?view=cards/card&card=${encodeURIComponent(nome)}`;
    const url = `https://api.scraperapi.com/?api_key=${SCRAPER_KEY}&url=${encodeURIComponent(ligaUrl)}`;

    const resposta = await axios.get(url);
    const $ = cheerio.load(resposta.data);
    const cartas = [];

    $('.mtg-single').each((i, el) => {
      const nomeCarta = $(el).find('.mtg-name a').text().trim();
      const numero = $(el).find('.mtg-numeric-code').text().trim();
      const colecao = $(el).find('.edition-name').text().trim();
      const min = $(el).find('.price-min').text().trim();
      const avg = $(el).find('.price-avg').text().trim();
      const max = $(el).find('.price-max').text().trim();

      if (nomeCarta) {
        cartas.push({ nome: nomeCarta, numero, colecao, min, avg, max });
      }
    });

    res.json({ cartas });
  } catch (erro) {
    console.error(erro.message);
    res.status(500).json({ erro: 'Erro ao buscar preços' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
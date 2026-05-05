const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/precos', async (req, res) => {
  const { nome } = req.query;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome da carta é obrigatório' });
  }

  try {
    const url = `https://www.ligapokemon.com.br/?view=cards/card&card=${encodeURIComponent(nome)}`;
    const resposta = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.ligapokemon.com.br/',
      },
    });

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
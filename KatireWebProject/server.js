const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const defaults = jsonServer.defaults({ logger: true });
const port = Number(process.env.PORT || 3000);

server.use(defaults);
server.use(jsonServer.bodyParser);

const googleConfigPath = path.join(__dirname, 'google.config.json');
let googleKeysCache = { expiresAt: 0, keys: [] };

function getGoogleClientId() {
  if (process.env.GOOGLE_CLIENT_ID) return process.env.GOOGLE_CLIENT_ID.trim();
  try {
    return String(JSON.parse(fs.readFileSync(googleConfigPath, 'utf8')).clientId || '').trim();
  } catch {
    return '';
  }
}

function decodeJwtPart(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

async function getGoogleKeys() {
  if (googleKeysCache.expiresAt > Date.now() && googleKeysCache.keys.length) {
    return googleKeysCache.keys;
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!response.ok) throw new Error('Não foi possível obter as chaves públicas do Google.');
  const data = await response.json();
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600);
  googleKeysCache = { keys: data.keys || [], expiresAt: Date.now() + maxAge * 1000 };
  return googleKeysCache.keys;
}

async function verifyGoogleCredential(credential) {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error('Login Google ainda não configurado.');
  const parts = String(credential || '').split('.');
  if (parts.length !== 3) throw new Error('Credencial Google inválida.');

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtPart(encodedHeader);
  const payload = decodeJwtPart(encodedPayload);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Assinatura Google inválida.');

  const keys = await getGoogleKeys();
  const jwk = keys.find(key => key.kid === header.kid);
  if (!jwk) throw new Error('Chave de autenticação Google não encontrada.');
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const validSignature = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    publicKey,
    Buffer.from(encodedSignature, 'base64url')
  );

  if (!validSignature) throw new Error('Assinatura Google inválida.');
  if (payload.aud !== clientId) throw new Error('Esta credencial não pertence ao aplicativo Katire.');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
    throw new Error('Emissor da credencial Google inválido.');
  }
  if (!payload.exp || payload.exp * 1000 <= Date.now()) throw new Error('A sessão Google expirou.');
  if (!payload.sub || !payload.email || payload.email_verified !== true) {
    throw new Error('A conta Google não possui e-mail verificado.');
  }
  return payload;
}

function findGoogleUser(payload) {
  const usuarios = router.db.get('usuarios');
  return usuarios.find({ googleId: payload.sub }).value()
    || usuarios.find({ email: String(payload.email).toLowerCase() }).value();
}

function saveLinkedGoogleUser(usuario, payload) {
  const atualizado = {
    ...usuario,
    googleId: payload.sub,
    provedorAuth: usuario.provedorAuth || 'google',
    avatar: usuario.avatar || payload.picture || ''
  };
  router.db.get('usuarios').find({ id: usuario.id }).assign(atualizado).write();
  return atualizado;
}

server.get('/config/google', (_req, res) => {
  const clientId = getGoogleClientId();
  res.json({ clientId, configurado: Boolean(clientId) });
});

server.post('/auth/google', async (req, res) => {
  try {
    const payload = await verifyGoogleCredential(req.body?.credential);
    const existente = findGoogleUser(payload);
    if (existente) {
      return res.json({ usuario: saveLinkedGoogleUser(existente, payload), precisaCadastro: false });
    }
    return res.json({
      precisaCadastro: true,
      perfil: {
        googleId: payload.sub,
        nome: payload.name || '',
        email: String(payload.email).toLowerCase(),
        avatar: payload.picture || ''
      }
    });
  } catch (error) {
    return res.status(401).json({ erro: error.message || 'Falha na autenticação Google.' });
  }
});

server.post('/auth/google/cadastro', async (req, res) => {
  try {
    const payload = await verifyGoogleCredential(req.body?.credential);
    const existente = findGoogleUser(payload);
    if (existente) {
      return res.json({ usuario: saveLinkedGoogleUser(existente, payload) });
    }

    const dados = req.body?.dados || {};
    const obrigatorios = ['dataNascimento', 'cep', 'endereco', 'bairro', 'numero', 'cidade', 'estado'];
    if (obrigatorios.some(campo => !String(dados[campo] || '').trim())) {
      return res.status(400).json({ erro: 'Complete a data de nascimento e o endereço.' });
    }

    const nascimento = new Date(`${dados.dataNascimento}T12:00:00`);
    const limite = new Date();
    limite.setFullYear(limite.getFullYear() - 18);
    if (Number.isNaN(nascimento.getTime()) || nascimento > limite) {
      return res.status(400).json({ erro: 'É necessário ter 18 anos ou mais.' });
    }

    const usuario = {
      id: String(Date.now()),
      nome: payload.name || String(payload.email).split('@')[0],
      email: String(payload.email).toLowerCase(),
      googleId: payload.sub,
      provedorAuth: 'google',
      avatar: payload.picture || '',
      dataNascimento: dados.dataNascimento,
      cep: String(dados.cep).replace(/\D/g, ''),
      endereco: dados.endereco,
      bairro: dados.bairro,
      numero: dados.numero,
      complemento: dados.complemento || '',
      cidade: dados.cidade,
      estado: String(dados.estado).toUpperCase(),
      avaliacoes: 0,
      totalTrocas: 0
    };
    router.db.get('usuarios').push(usuario).write();
    return res.status(201).json({ usuario });
  } catch (error) {
    return res.status(401).json({ erro: error.message || 'Falha no cadastro com Google.' });
  }
});

server.get('/status', (_req, res) => {
  res.json({
    online: true,
    banco: 'db.json',
    atualizadoEm: new Date().toISOString()
  });
});

server.use(router);

server.listen(port, () => {
  console.log(`Banco Katire disponível em http://localhost:${port}`);
});

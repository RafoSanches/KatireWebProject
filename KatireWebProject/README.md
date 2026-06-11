# Katire

Plataforma de trocas desenvolvida em Angular 19 com API local e persistencia
em JSON Server.

## Como executar

No Windows, abra a pasta do projeto e execute:

```text
INICIAR-KATIRE.bat
```

Ou use o terminal dentro desta pasta:

```bash
npm install
npm run dev
```

- Aplicacao: `http://localhost:4200`
- API: `http://localhost:3000`
- Banco local: `db.json`

O arquivo `index.html` da raiz e um prototipo completo que tambem pode ser
aberto diretamente, sem instalar dependencias. A aplicacao Angular usa
`src/index.html`.

## Conta de demonstracao

```text
E-mail: ana@email.com
Senha: 123456
```

## Funcionalidades

- Cadastro e login com formularios reativos e validacoes.
- Data de nascimento, consulta de CEP e preenchimento de endereco.
- Login com Google preparado para configuracao por Client ID.
- Rotas internas protegidas para usuarios autenticados.
- Cadastro, busca, filtros, edicao e exclusao de produtos.
- Upload, redimensionamento e previa de imagens.
- Propostas com aceite, recusa e notificacoes.
- Chat por proposta, com indicador de mensagem visualizada.
- Favoritos e lista de desejos.
- Avaliacoes de 1 a 5 estrelas, comentarios e reputacao publica.
- Historico de trocas e dashboard com estatisticas.
- Pontos seguros para trocas presenciais.
- Modo escuro e layout responsivo.

## Banco de dados

O servidor disponibiliza:

```text
/usuarios
/produtos
/propostas
/avaliacoes
/favoritos
/mensagens
/notificacoes
/status
```

Os dados sao gravados no arquivo `db.json`. As imagens enviadas sao
redimensionadas no navegador e persistidas no campo `fotos` do produto.

## Login com Google

O fluxo esta implementado, mas o Google exige um Client ID criado pelo
proprietario do projeto no Google Cloud Console.

1. Crie uma credencial OAuth 2.0 do tipo Aplicativo da Web.
2. Cadastre `http://localhost:4200` nas origens JavaScript autorizadas.
3. Coloque o Client ID em `google.config.json`.
4. Reinicie `npm run dev`.

Sem essa configuracao, cadastro e login por e-mail continuam funcionando.

## Entrega academica

- Relatorio: `RELATORIO-KATIRE.pdf`
- Versao editavel do relatorio: `RELATORIO-KATIRE.docx`
- Prototipo completo: `index.html`
- Codigo Angular: `src/`
- Banco local: `db.json`

O projeto usa Git com mensagens no padrao Conventional Commits. Pastas
geradas, caches e `node_modules` nao devem ser enviados.

> O JSON Server e adequado para demonstracao academica. Em producao, a
> autenticacao e os dados devem ser protegidos por um backend real.

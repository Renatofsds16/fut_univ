# fut_univ

Sistema web para gerenciamento de peladas de futebol, desenvolvido com React no frontend e Back4App/Parse Cloud Code no backend.

O projeto permite que usuários criem e consultem peladas, acessem uma pelada específica por link, realizem cadastro e login e participem de uma pelada por meio de confirmação vinculada ao jogador e ao pagamento via Pix.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Principais funcionalidades](#principais-funcionalidades)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Modelo de dados](#modelo-de-dados)
- [Autenticação](#autenticação)
- [Fluxo de uma pelada](#fluxo-de-uma-pelada)
- [Fluxo de pagamento Pix](#fluxo-de-pagamento-pix)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Configuração do Back4App](#configuração-do-back4app)
- [Configuração do Cloud Code](#configuração-do-cloud-code)
- [Configuração do frontend](#configuração-do-frontend)
- [Execução do projeto](#execução-do-projeto)
- [Rotas da aplicação](#rotas-da-aplicação)
- [Cloud Functions](#cloud-functions)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Segurança](#segurança)
- [Solução de problemas](#solução-de-problemas)
- [Próximos passos](#próximos-passos)
- [Licença](#licença)

---

## Sobre o projeto

O **fut_univ** é uma aplicação web voltada para organização e participação em peladas de futebol.

A aplicação foi estruturada separando o frontend da lógica de backend:

- **Frontend:** React;
- **Backend:** Back4App utilizando Parse Server e Cloud Code;
- **Banco de dados:** banco gerenciado pelo Parse Server/Back4App;
- **Autenticação:** usuários do Parse (`_User`) através de Cloud Functions;
- **Pagamentos:** integração com Mercado Pago para geração e consulta de pagamentos Pix.

Uma das decisões importantes do projeto foi centralizar as operações do backend em **Cloud Functions**, evitando que o frontend precise executar diretamente consultas e regras de negócio sensíveis no Parse.

---

## Principais funcionalidades

### Usuários

- Cadastro de usuário;
- Login;
- Autenticação utilizando sessão do Parse;
- Proteção de páginas privadas;
- Redirecionamento para a página originalmente solicitada após o login.

### Peladas

- Criação de peladas;
- Listagem de peladas;
- Consulta de peladas criadas por diferentes usuários;
- Acesso a uma pelada específica através do seu `objectId`;
- Compartilhamento de uma URL específica da pelada;
- Exibição de informações da pelada;
- Controle de peladas ativas.

### Jogadores

- Criação/identificação de jogador associado ao usuário autenticado;
- Associação do jogador à pelada;
- Armazenamento de informações como nome, telefone e posição.

### Confirmações

Cada participação em uma pelada pode possuir uma confirmação vinculada a:

- Pelada;
- Jogador;
- Status do pagamento;
- Identificador da transação Pix;
- Data da confirmação.

### Pagamento Pix

O projeto possui integração preparada para o fluxo de pagamento Pix, incluindo:

- Criação do pagamento;
- Consulta de status;
- Registro da transação;
- Associação do pagamento ao jogador;
- Associação do pagamento à pelada;
- Atualização da confirmação após aprovação;
- Webhook para atualização de pagamento;
- Cancelamento de pagamento.

O token de acesso do Mercado Pago deve ser configurado como variável de ambiente e nunca deve ser colocado diretamente no código-fonte.

---

# Tecnologias utilizadas

## Frontend

- React
- JavaScript
- React Router
- Parse JavaScript SDK
- CSS

Principais recursos utilizados no frontend:

- `useState`
- `useEffect`
- `useNavigate`
- `useParams`
- Rotas protegidas
- Serviços separados para comunicação com o backend

## Backend

- Back4App
- Parse Server
- Parse Cloud Code
- Node.js
- JavaScript
- Axios
- Dotenv

## Serviços externos

- Mercado Pago
- Back4App

---

# Arquitetura

A aplicação segue uma arquitetura semelhante a:

```text
┌───────────────────────────────┐
│           React               │
│          Frontend             │
│                               │
│ Pages / Components / Services │
└───────────────┬───────────────┘
                │
                │ Parse.Cloud.run()
                ▼
┌───────────────────────────────┐
│       Back4App / Parse        │
│                               │
│        Cloud Functions        │
├───────────────────────────────┤
│ auth.js                       │
│ jogadores.js                  │
│ peladas.js                    │
│ confirmacao.js                │
│ pix.js                        │
└───────────────┬───────────────┘
                │
       ┌────────┴─────────┐
       │                  │
       ▼                  ▼
┌───────────────┐  ┌────────────────┐
│ Parse Database │  │  Mercado Pago  │
│               │  │                │
│ _User         │  │ Pix            │
│ Pelada        │  │ Payments       │
│ Jogador       │  │                │
│ Confirmacao   │  │                │
└───────────────┘  └────────────────┘
```

O frontend não deve conter credenciais privadas do Mercado Pago.

---

# Estrutura do projeto

Uma estrutura esperada para o projeto é:

```text
fut_univ/
│
├── cloud/
│   ├── auth.js
│   ├── confirmacao.js
│   ├── jogadores.js
│   ├── peladas.js
│   ├── pix.js
│   └── main.js
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── FormCadastro.jsx
│   │   ├── FormLogin.jsx
│   │   └── PrivateRoute.jsx
│   │
│   ├── pages/
│   │   ├── AdminPeladaPage.jsx
│   │   ├── ConfirmadoPage.jsx
│   │   ├── PagamentoPage.jsx
│   │   └── PeladaPage.jsx
│   │
│   ├── services/
│   │   ├── auth.js
│   │   ├── game.js
│   │   ├── pagamento.js
│   │   └── parseConfig.js
│   │
│   ├── App.jsx
│   └── index.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

Os nomes e arquivos podem variar conforme a versão do projeto, mas a separação recomendada é manter:

- componentes de interface em `components`;
- páginas em `pages`;
- comunicação com o backend em `services`;
- funções do backend em `cloud`.

---

# Modelo de dados

## `_User`

Classe nativa do Parse utilizada para autenticação.

Campos principais utilizados:

```text
username
email
password
```

O campo `password` é gerenciado pelo Parse e não deve ser manipulado ou armazenado manualmente pela aplicação.

---

## `Pelada`

Representa uma pelada criada no sistema.

Campos utilizados:

| Campo | Tipo | Descrição |
|---|---|---|
| `dataHora` | Date | Data e horário da pelada |
| `valor` | Number | Valor para participação |
| `local` | String | Local da pelada |
| `ativa` | Boolean | Indica se a pelada está ativa |
| `criadoPor` | Pointer<_User> | Usuário responsável pela criação |

---

## `Jogador`

Representa o jogador participante.

Campos utilizados:

| Campo | Tipo | Descrição |
|---|---|---|
| `nome` | String | Nome do jogador |
| `telefone` | String | Telefone do jogador |
| `posicao` | String | Posição do jogador |
| `usuario` | Pointer<_User> | Usuário relacionado |

---

## `Confirmacao`

Representa a confirmação da participação do jogador.

Campos utilizados:

| Campo | Tipo | Descrição |
|---|---|---|
| `pelada` | Pointer<Pelada> | Pelada relacionada |
| `jogador` | Pointer<Jogador> | Jogador relacionado |
| `pago` | Boolean | Status do pagamento |
| `pixTxid` | String | Identificador da transação Pix |
| `dataConfirmacao` | Date | Data da confirmação |

A estrutura permite relacionar:

```text
Usuário
   │
   ▼
Jogador
   │
   ▼
Confirmação
   │
   ├── Pelada
   │
   └── Pagamento Pix
```

---

# Autenticação

A autenticação foi implementada utilizando Cloud Functions.

O frontend chama funções como:

```javascript
Parse.Cloud.run("login", {
  email,
  senha
});
```

e:

```javascript
Parse.Cloud.run("signup", {
  nome,
  email,
  password
});
```

A responsabilidade de validar e processar o login fica no backend.

Após o login, o Parse retorna uma sessão que permite executar operações protegidas.

---

# Rotas protegidas

O projeto utiliza um componente `PrivateRoute` para impedir que usuários não autenticados acessem determinadas páginas.

O fluxo é:

```text
Usuário acessa página privada
             │
             ▼
      Está autenticado?
        /           \
      Não            Sim
      │               │
      ▼               ▼
   Login          Página solicitada
      │
      ▼
Após login
      │
      ▼
Retorna para a URL originalmente solicitada
```

Isso permite, por exemplo, que um usuário abra diretamente:

```text
/pelada/ID_DA_PELADA
```

e, caso não esteja autenticado, seja enviado ao login antes de retornar para a pelada.

---

# Fluxo de uma pelada

## Listagem

A rota:

```text
/peladas
```

exibe as peladas disponíveis.

A listagem não deve ficar limitada somente ao usuário que está autenticado quando o objetivo for apresentar as peladas disponíveis no sistema.

---

## Pelada específica

A rota:

```text
/pelada/:peladaId
```

utiliza o `objectId` da classe `Pelada`.

Exemplo:

```text
/pelada/AbCdEf123
```

Nesse caso:

```javascript
const { peladaId } = useParams();
```

O valor de `peladaId` representa o ID da **Pelada**, e não o ID do usuário.

Essa distinção é importante para evitar que a aplicação tente procurar uma pelada utilizando o `objectId` do `_User`.

---

# Fluxo de participação

O fluxo geral é:

```text
Usuário
   │
   ▼
Login
   │
   ▼
Acessa /pelada/:peladaId
   │
   ▼
Visualiza a pelada
   │
   ▼
Inicia participação
   │
   ▼
Cria/identifica Jogador
   │
   ▼
Cria pagamento Pix
   │
   ▼
Usuário realiza pagamento
   │
   ▼
Mercado Pago confirma
   │
   ▼
Confirmação é registrada/atualizada
   │
   ▼
Participação confirmada
```

---

# Fluxo de pagamento Pix

O pagamento é processado no backend.

A ideia é evitar que informações sensíveis do Mercado Pago sejam expostas no navegador.

Fluxo:

```text
React
  │
  │ criar_pagamento_pix
  ▼
Back4App Cloud Code
  │
  │ credenciais privadas
  ▼
Mercado Pago
  │
  │ Pix
  ▼
Pagamento criado
  │
  ▼
Frontend apresenta as informações do pagamento
  │
  ▼
Status consultado / webhook recebido
  │
  ▼
Pagamento aprovado
  │
  ▼
Jogador + Confirmacao atualizados
```

O `pixTxid` é armazenado na confirmação para permitir a associação entre o pagamento e a participação.

---

# Configuração do ambiente

## Pré-requisitos

Antes de executar o projeto, instale:

- Node.js;
- npm;
- Git;
- uma conta no Back4App;
- uma aplicação criada no Back4App;
- uma conta/configuração do Mercado Pago caso utilize o fluxo de pagamento.

Recomenda-se utilizar uma versão LTS do Node.js.

Verifique:

```bash
node --version
npm --version
git --version
```

---

# Clonando o projeto

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Entre no diretório:

```bash
cd fut_univ
```

Instale as dependências:

```bash
npm install
```

---

# Configuração do Back4App

## 1. Criar a aplicação

No Back4App:

1. Crie uma aplicação;
2. Acesse as configurações da aplicação;
3. Localize as credenciais do Parse;
4. Copie o Application ID;
5. Copie a JavaScript Key;
6. Configure o Cloud Code.

O projeto utiliza o endpoint:

```text
https://parseapi.back4app.com/
```

---

# Configuração do Parse no frontend

O arquivo responsável pela configuração do Parse deve inicializar o SDK utilizando variáveis de ambiente.

Exemplo:

```javascript
import Parse from "parse";

Parse.initialize(
  process.env.REACT_APP_PARSE_APPLICATION_ID,
  process.env.REACT_APP_PARSE_JAVASCRIPT_KEY
);

Parse.serverURL = "https://parseapi.back4app.com/";

export default Parse;
```

Os nomes das variáveis devem corresponder aos utilizados no projeto.

---

# Arquivo `.env`

Na raiz do frontend, crie:

```text
.env
```

Exemplo:

```env
REACT_APP_PARSE_APPLICATION_ID=SEU_APPLICATION_ID
REACT_APP_PARSE_JAVASCRIPT_KEY=SUA_JAVASCRIPT_KEY
```

Não coloque valores reais no `README.md`.

Também não publique o `.env` no Git.

Adicione ao `.gitignore`:

```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
node_modules/
build/
```

Depois de alterar variáveis de ambiente, reinicie o servidor do React.

---

# Configuração do Cloud Code

O backend utiliza JavaScript.

A estrutura:

```text
cloud/
├── main.js
├── auth.js
├── peladas.js
├── jogadores.js
├── confirmacao.js
└── pix.js
```

O `main.js` deve carregar os módulos que registram as Cloud Functions.

Exemplo:

```javascript
require("./auth");
require("./peladas");
require("./jogadores");
require("./confirmacao");
require("./pix");
```

É importante que `pix.js` esteja sendo carregado pelo `main.js`. Caso contrário, as funções de pagamento não serão registradas no Parse.

---

# Variáveis de ambiente do Cloud Code

As credenciais privadas devem ser configuradas no ambiente do Back4App.

O projeto utiliza variáveis relacionadas à integração Pix, incluindo:

```env
MERCADO_PAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN
PIX_API_URL=SUA_URL_DA_API_PIX
PIX_CLIENT_ID=SEU_CLIENT_ID
PIX_CLIENT_SECRET=SEU_CLIENT_SECRET
PIX_KEY=SUA_CHAVE_PIX
```

Use somente as variáveis realmente necessárias para a implementação configurada no `pix.js`.

O token do Mercado Pago deve permanecer exclusivamente no backend.

Nunca faça:

```javascript
const token = "APP_USR-xxxxxxxx";
```

O correto é:

```javascript
const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
```

---

# Dependências do Cloud Code

O backend utiliza módulos Node.js como:

```javascript
const axios = require("axios");
const Parse = require("parse/node");
```

Caso o ambiente de Cloud Code do projeto exija a instalação das dependências, configure o `package.json` correspondente ao Cloud Code.

Exemplo:

```json
{
  "dependencies": {
    "axios": "^1.0.0",
    "dotenv": "^16.0.0",
    "parse": "^8.0.0"
  }
}
```

As versões devem acompanhar as versões efetivamente utilizadas pelo projeto.

---

# Publicação do Cloud Code

Depois de configurar o Cloud Code:

1. Acesse o painel do Back4App;
2. Abra a aplicação;
3. Acesse o Cloud Code;
4. Envie/publice os arquivos da pasta `cloud`;
5. Verifique os logs de publicação;
6. Confirme se as funções foram registradas.

Depois da publicação, as Cloud Functions podem ser chamadas pelo frontend através de:

```javascript
Parse.Cloud.run("nome_da_funcao", parametros);
```

---

# Cloud Functions

O projeto possui funções separadas por responsabilidade.

## Autenticação

Arquivo:

```text
cloud/auth.js
```

Responsável por operações relacionadas a:

- cadastro;
- login;
- validação dos dados do usuário;
- criação e recuperação de sessão.

---

## Peladas

Arquivo:

```text
cloud/peladas.js
```

Responsável por operações relacionadas às peladas, incluindo:

- criação;
- listagem;
- consulta;
- recuperação de uma pelada específica.

---

## Jogadores

Arquivo:

```text
cloud/jogadores.js
```

Responsável por:

- localizar jogador relacionado ao usuário;
- criar jogador;
- associar jogador ao usuário;
- manter os dados necessários para participação.

---

## Confirmações

Arquivo:

```text
cloud/confirmacao.js
```

Responsável por:

- localizar confirmação;
- criar confirmação;
- atualizar status;
- relacionar jogador e pelada;
- registrar informações de pagamento.

---

## Pix

Arquivo:

```text
cloud/pix.js
```

O módulo de Pix concentra as operações de pagamento.

Entre as funções trabalhadas no projeto estão:

```text
criar_pagamento_pix
checarStatusPix
consultar_pagamento_pix
webhook_pix
cancelar_pagamento_pix
```

A função de criação do pagamento é responsável por iniciar o pagamento e relacioná-lo à participação.

O status pode ser consultado posteriormente e o webhook permite receber atualizações do provedor de pagamento.

---

# Serviços do frontend

As chamadas ao backend são organizadas em `src/services`.

Exemplo:

```javascript
import Parse from "./parseConfig";

export async function login(email, senha) {
  const resposta = await Parse.Cloud.run("login", {
    email,
    senha,
  });

  return resposta;
}
```

Essa separação evita espalhar chamadas ao backend pelos componentes da interface.

Um serviço de pagamento pode seguir o mesmo padrão:

```javascript
Parse.Cloud.run("criar_pagamento_pix", parametros);
```

---

# Execução do projeto

Depois de configurar as variáveis de ambiente:

```bash
npm start
```

O endereço local normalmente será:

```text
http://localhost:3000
```

A porta pode variar de acordo com a configuração do projeto.

---

# Testando o cadastro

Abra:

```text
/register
```

ou a rota correspondente configurada no `App.jsx`.

Informe:

- nome;
- e-mail;
- senha.

O frontend deverá chamar:

```text
signup
```

no Cloud Code.

O usuário será criado na classe:

```text
_User
```

---

# Testando o login

Abra:

```text
/login
```

Informe:

- e-mail;
- senha.

O frontend chama:

```text
login
```

Após o login bem-sucedido, o Parse mantém a sessão do usuário.

---

# Rotas da aplicação

As rotas principais utilizadas no projeto incluem:

```text
/login
/register
/peladas
/pelada/:peladaId
```

Também existem páginas relacionadas à administração, confirmação e pagamento, conforme a configuração atual do frontend.

Exemplo de rota dinâmica:

```text
/pelada/67abc123def456
```

O valor:

```text
67abc123def456
```

é o `objectId` da classe `Pelada`.

---

# Configuração das rotas

O React Router é utilizado para controlar a navegação.

Exemplo:

```jsx
<Route
  path="/pelada/:peladaId"
  element={
    <PrivateRoute>
      <PeladaPage />
    </PrivateRoute>
  }
/>
```

O `PeladaPage` pode recuperar o ID através de:

```javascript
const { peladaId } = useParams();
```

Isso permite que o mesmo componente seja utilizado para diferentes peladas.

---

# Compartilhamento de peladas

Uma característica importante do projeto é permitir o compartilhamento direto de uma pelada.

Exemplo:

```text
https://seu-dominio.com/pelada/OBJECT_ID
```

Quando outro usuário acessa o endereço:

1. o `PrivateRoute` verifica a autenticação;
2. caso não esteja autenticado, o usuário é enviado para login;
3. após o login, o sistema retorna para a pelada solicitada;
4. a aplicação busca a pelada pelo `objectId`;
5. a pelada é apresentada ao usuário.

---

# Segurança

Algumas regras importantes devem ser mantidas no projeto.

## Nunca versionar credenciais

Não publique:

```text
.env
Access Token
Client Secret
senhas
tokens de sessão
chaves privadas
```

---

## Credenciais do Mercado Pago somente no backend

O frontend nunca deve receber:

```text
MERCADO_PAGO_ACCESS_TOKEN
PIX_CLIENT_SECRET
```

Essas informações devem existir somente no ambiente do Cloud Code.

---

## `useMasterKey`

Operações administrativas ou que precisam ignorar determinadas restrições do Parse podem utilizar:

```javascript
{ useMasterKey: true }
```

Esse recurso deve ser utilizado exclusivamente no backend.

Nunca envie uma chave master para o frontend.

---

# Solução de problemas

## `Invalid session token`

Esse erro normalmente indica que uma função protegida recebeu uma sessão inválida, expirada ou inexistente.

Verifique:

```javascript
Parse.User.current()
```

e confirme se o usuário está autenticado antes de executar operações que exigem sessão.

No Cloud Code, quando uma função exige usuário autenticado, confirme se a chamada está sendo feita com uma sessão válida.

---

## `unauthorized`

Verifique:

- se o usuário está logado;
- se o token de sessão está sendo enviado;
- se a Cloud Function exige usuário autenticado;
- se o frontend está utilizando a mesma aplicação Parse configurada no Back4App.

---

## Cloud Function não encontrada

Se aparecer algo semelhante a:

```text
Invalid function
```

verifique:

1. se a função foi realmente declarada;
2. se o arquivo foi publicado;
3. se o arquivo foi carregado pelo `main.js`;
4. os logs do Cloud Code.

Por exemplo, se `pix.js` contém:

```javascript
Parse.Cloud.define("criar_pagamento_pix", ...);
```

o `main.js` precisa carregar o módulo:

```javascript
require("./pix");
```

---

## Erro ao criar Jogador ou Confirmacao

Verifique os pointers.

Uma confirmação deve possuir referências válidas para:

```text
pelada -> Pelada
jogador -> Jogador
```

E o jogador deve estar associado ao usuário:

```text
usuario -> _User
```

Também verifique se o `objectId` utilizado realmente pertence à classe esperada.

---

## Pelada não encontrada

Confirme se a aplicação está usando o ID da pelada:

```javascript
const { peladaId } = useParams();
```

e não o ID do usuário.

A busca deve utilizar o `objectId` da classe `Pelada`.

---

# Desenvolvimento local

Durante o desenvolvimento, recomenda-se manter a seguinte separação:

```text
Frontend
    ↓
src/services
    ↓
Parse.Cloud.run()
    ↓
Cloud Functions
    ↓
Parse Database / Mercado Pago
```

Isso mantém as regras de negócio no backend e deixa os componentes React responsáveis principalmente pela interface e pelo estado da aplicação.

---

# Boas práticas adotadas

O projeto foi organizado buscando manter:

- separação entre frontend e backend;
- Cloud Functions para regras de negócio;
- serviços separados no React;
- autenticação centralizada;
- proteção de rotas;
- variáveis de ambiente;
- credenciais privadas fora do código;
- relacionamento entre `_User`, `Jogador`, `Pelada` e `Confirmacao`;
- integração de pagamento isolada no backend.

---

# Próximos passos

Possíveis evoluções do projeto:

- painel administrativo completo;
- gerenciamento de vagas;
- limite de jogadores por pelada;
- histórico de participações;
- histórico financeiro;
- melhorias no acompanhamento do Pix;
- validação mais completa do webhook;
- notificações;
- gerenciamento de equipes;
- ranking de jogadores;
- melhoria da experiência mobile;
- testes automatizados;
- documentação completa da API;
- controle de permissões por função.

---

# Licença

Defina aqui a licença escolhida para o projeto.

Exemplo:

```text
MIT License
```

Caso o projeto ainda não possua uma licença definida, não utilize uma licença no repositório até que essa decisão seja tomada.

---

# Autor

**Renato Firmino Santos da Silva**

Desenvolvedor em formação | Backend & Mobile

GitHub:

```text
https://github.com/Renatofsds16
```

Portfólio:

```text
https://www.unitechref.com.br/portfolio
```

---

## Observação

Este README descreve a arquitetura e o fluxo desenvolvido para o projeto `fut_univ`. Ao clonar uma versão diferente do projeto, confira os arquivos `package.json`, `.env.example`, `cloud/main.js`, `src/services` e `src/App.jsx` para garantir que os nomes das funções, variáveis e rotas correspondam exatamente à versão baixada.
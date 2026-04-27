# Wixoss Image Scrapbot 🤖🎴

Este é um bot automatizado para realizar o scraping de imagens de cartas do TCG Wixoss diretamente da Fandom Wiki. O projeto automatiza a busca por boosters, a extração de códigos de cartas e o download de imagens com compressão inteligente.

## 🚀 Funcionalidades

- **Busca Automatizada**: Localiza boosters na Wiki por nome ou código (ex: "WX-01", "Stirred Selector").
- **Extração Precisa**: Identifica automaticamente a "Card List" oficial e extrai apenas os códigos relevantes.
- **Download Inteligente**:
  - Pula arquivos que já foram baixados.
  - Lógica de tentativa (retry) em caso de erro de conexão.
  - **Qualidade Dinâmica**: Ajusta automaticamente a compressão JPEG para que cada imagem ocupe entre **21 KB e 25 KB**, mantendo a resolução de `250x349`.
- **Filtro de Prefixo**: Evita capturar códigos de outros sets que possam aparecer na página.

## 🛠️ Como Usar

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.

### 2. Instalação
No diretório do projeto, instale as dependências:
```bash
npm install
```

### 3. Configuração
Abra o arquivo `bot.js` e edite a variável no topo para definir quais boosters deseja baixar:
```javascript
const BOOSTERS_INPUT = "WX-01, WX-02"; // Separe por vírgula
```

### 4. Iniciar
Execute o comando:
```bash
npm start
```

## 📁 Estrutura do Projeto
- `bot.js`: Orquestrador principal.
- `lib/`: Módulos de lógica (API, Parser, Downloader).
- `images/`: Pasta onde as cartas serão salvas.

---
Desenvolvido para automatizar a coleção de imagens de Wixoss
para o jogo Webxoss.

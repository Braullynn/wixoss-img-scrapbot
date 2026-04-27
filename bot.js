const fs = require("fs");
const path = require("path");
const { getMainPageBoosters, findBooster, fetchPageHtml } = require("./lib/wiki-api");
const { extractCardList, extractGalleryLink } = require("./lib/card-parser");
const { downloadCardImages } = require("./lib/downloader");

// ==========================================
// ⚙️ CONFIGURAÇÃO DE INPUT
// Digite aqui o nome ou código dos boosters que deseja baixar.
// Separe múltiplos boosters por vírgula.
// Exemplos: "WX-01", "WX-01, WX-02", "Black Desire"
// ==========================================
const BOOSTERS_INPUT = "WX-02";
// ==========================================

const OUTPUT_BASE_DIR = path.join("C:", "Users", "Admin", "Documents", "PROJETOS", "scrapper-wixoss", "images");

async function processBooster(boosterQuery, boosterList) {
    console.log(`\n==================================================`);
    console.log(`🔍 Iniciando processo para: "${boosterQuery}"`);

    const booster = findBooster(boosterQuery, boosterList);

    if (!booster) {
        console.log(`❌ Booster "${boosterQuery}" não encontrado na Main Page. Verifique o nome/código.`);
        return;
    }

    console.log(`📦 Encontrado: ${booster.name} (${booster.wikiPath})`);

    // 1. Acessar a página do booster
    console.log(`📄 Carregando página do booster...`);
    const boosterHtml = await fetchPageHtml(booster.wikiPath);

    // 2. Extrair códigos das cartas (filtrando pelo prefixo do booster, ex: WX)
    console.log(`📋 Extraindo lista de cartas...`);
    const prefix = boosterQuery.split(/[- ]/)[0]; // Pega "WX" de "WX-02"
    const cardCodes = extractCardList(boosterHtml, prefix);
    
    if (cardCodes.length === 0) {
        console.log(`❌ Nenhuma carta encontrada na página do booster.`);
        return;
    }
    console.log(`✅ ${cardCodes.length} cartas encontradas (Filtro prefixo: "${prefix}").`);
    console.log(`Exemplo de cartas detectadas: ${cardCodes.slice(0, 5).join(", ")}...`);

    // 3. Encontrar link da galeria
    console.log(`🔍 Procurando link da Galeria...`);
    let galleryPath = extractGalleryLink(boosterHtml);
    
    if (!galleryPath) {
        console.log(`⚠️ Link "Gallery" não encontrado. Tentando url padrão...`);
        galleryPath = `${booster.wikiPath}/Gallery`;
    }
    console.log(`🔗 Galeria encontrada: ${galleryPath}`);

    // 4. Carregar página da galeria
    console.log(`🖼️ Carregando Galeria...`);
    let galleryHtml;
    try {
        galleryHtml = await fetchPageHtml(galleryPath);
    } catch (err) {
        console.log(`❌ Erro ao acessar a galeria: ${err.message}`);
        return;
    }

    // 5. Baixar imagens
    console.log(`⬇ Iniciando download das imagens...`);
    const { encontrados, comErro, pulados } = await downloadCardImages(galleryHtml, cardCodes, OUTPUT_BASE_DIR);

    console.log(`\n📊 Relatório Final para "${booster.name}":`);
    console.log(`   Cartas Listadas: ${cardCodes.length}`);
    console.log(`   Baixadas c/ Sucesso: ${encontrados}`);
    console.log(`   Puladas (já existem): ${pulados}`);
    console.log(`   Com Erro/Não encontradas: ${comErro}`);
}

async function run() {
    console.log(`🤖 Iniciando Bot Scrapper WIXOSS...`);

    if (!BOOSTERS_INPUT || BOOSTERS_INPUT.trim() === "") {
        console.log(`\n❌ ERRO: O campo de nome de booster está vazio.`);
        console.log(`👉 Por favor, edite o arquivo bot.js e adicione os boosters na variável BOOSTERS_INPUT.`);
        console.log(`   Exemplo: const BOOSTERS_INPUT = "WX-01, WX-02";\n`);
        return;
    }

    // Criar pasta de destino se não existir
    if (!fs.existsSync(OUTPUT_BASE_DIR)) {
        fs.mkdirSync(OUTPUT_BASE_DIR, { recursive: true });
        console.log(`📁 Pasta criada: ${OUTPUT_BASE_DIR}`);
    } else {
        console.log(`📁 Pasta de imagens já existe: ${OUTPUT_BASE_DIR}`);
    }

    // Processar os inputs
    const queries = BOOSTERS_INPUT.split(",").map(q => q.trim()).filter(q => q !== "");

    // Obter lista de boosters
    const boosterList = await getMainPageBoosters();

    for (const query of queries) {
        try {
            await processBooster(query, boosterList);
        } catch (err) {
            console.log(`❌ Erro fatal ao processar "${query}": ${err.message}`);
        }
    }

    console.log(`\n🎉 Processamento de todos os boosters concluído!`);
}

run();

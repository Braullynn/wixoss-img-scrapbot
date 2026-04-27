const axios = require("axios");
const cheerio = require("cheerio");
const { buildApiUrl } = require("./url-utils");

const MAIN_PAGE_URL = buildApiUrl("Category:Booster_Packs");

async function getMainPageBoosters() {
    console.log("📄 Buscando boosters na Main Page...");
    const { data } = await axios.get(MAIN_PAGE_URL);
    const htmlDaPagina = data.parse.text["*"];
    const $ = cheerio.load(htmlDaPagina);

    const boosters = [];

    // Os links dos boosters estão na página, normalmente dentro de <li> ou <a>
    $("a").each((_, el) => {
        const title = $(el).attr("title");
        const href = $(el).attr("href");
        
        if (title && href && href.startsWith("/wiki/")) {
            // Remove o /wiki/ para pegar o path correto
            const wikiPath = href.replace("/wiki/", "");
            
            // Verifica se é provável que seja um booster (contém WX, etc.)
            // Mas vamos pegar todos os links relevantes
            if (title.includes("Selector") || title.includes("DIVA") || title.match(/WX[A-Z0-9-]* /) || title.match(/WXD-[0-9]+/) || title.match(/SPEX/)) {
                boosters.push({
                    name: title,
                    wikiPath: wikiPath
                });
            }
        }
    });

    // Remove duplicatas
    const uniqueBoosters = [];
    const seen = new Set();
    for (const b of boosters) {
        if (!seen.has(b.wikiPath)) {
            seen.add(b.wikiPath);
            uniqueBoosters.push(b);
        }
    }

    console.log(`✅ ${uniqueBoosters.length} boosters encontrados na Main Page.`);
    return uniqueBoosters;
}

function findBooster(query, boosterList) {
    const q = query.trim().toLowerCase();
    
    // Busca exata ou por código
    const found = boosterList.find(b => 
        b.name.toLowerCase() === q || // Nome exato (case insensitive)
        b.name.toLowerCase().startsWith(q + " ") || // Começa com o código + espaço
        b.name.toLowerCase().includes(q) // Contém o termo em qualquer lugar
    );

    return found || null;
}

async function fetchPageHtml(pageName) {
    const url = buildApiUrl(pageName);
    const { data } = await axios.get(url);
    if (!data.parse || !data.parse.text) {
        throw new Error(`Não foi possível carregar a página: ${pageName}`);
    }
    return data.parse.text["*"];
}

module.exports = {
    getMainPageBoosters,
    findBooster,
    fetchPageHtml
};

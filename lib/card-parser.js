const cheerio = require("cheerio");

function extractCardList(html, prefixFilter = "") {
    const $ = cheerio.load(html);
    const cards = new Set();
    
    // Filtro de prefixo (letras iniciais do booster para garantir precisão)
    const filter = prefixFilter ? prefixFilter.toUpperCase().replace(/[^A-Z]/g, "") : "";

    // 1. Procurar em todas as tabelas (o ID #mw-content-text pode não vir na API)
    $("table").each((_, table) => {
        const $table = $(table);
        // Verifica se a tabela parece uma lista de cartas (cabeçalho com "No" ou "Name")
        const tableText = $table.text().toLowerCase();
        const hasCardHeaders = tableText.includes("no") || tableText.includes("card name");

        if (hasCardHeaders) {
            // 2. Extrair códigos de cada linha desta tabela específica
            $table.find("tr").each((_, row) => {
                // Tenta pegar o código na primeira ou segunda célula (algumas tabelas têm estrutura variada)
                const cells = $(row).find("td, th");
                const firstCellText = cells.eq(0).text().trim();
                const secondCellText = cells.eq(1).text().trim();
                
                // RegEx para capturar o padrão de código (ex: WX02-001)
                const regex = /[A-Z0-9]+-[A-Z0-9-]{1,8}\d{1,3}/g;

                [firstCellText, secondCellText].forEach(text => {
                    const matches = text.match(regex);
                    if (matches) {
                        matches.forEach(m => {
                            if (filter) {
                                // Pega apenas letras do prefixo (ex: WX de WX02 ou WD de WXD05)
                                const codePrefix = m.split("-")[0].replace(/[^A-Z]/g, "");
                                if (codePrefix.includes(filter) || filter.includes(codePrefix)) {
                                    cards.add(m);
                                }
                            } else {
                                cards.add(m);
                            }
                        });
                    }
                });
            });
        }
    });

    return Array.from(cards).sort();
}

function extractGalleryLink(html) {
    const $ = cheerio.load(html);
    let galleryPath = null;

    // Procura por um link que o texto seja "Gallery"
    $("a").each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr("href");
        
        if (text.toLowerCase() === "gallery" && href && href.startsWith("/wiki/")) {
            galleryPath = href.replace("/wiki/", "");
        }
    });

    return galleryPath;
}

module.exports = {
    extractCardList,
    extractGalleryLink
};

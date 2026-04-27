const { URL } = require("url");

function wikiUrlToApi(url) {
    try {
        const parsedUrl = new URL(url);
        const caminho = parsedUrl.pathname;

        if (!caminho.includes("/wiki/")) {
            throw new Error("URL não é uma página válida da wiki (/wiki/ não encontrado)");
        }

        let page = caminho.split("/wiki/")[1];
        page = page.replace(/^\/+/, "");

        return buildApiUrl(page);
    } catch (err) {
        throw err;
    }
}

function buildApiUrl(pageName) {
    return `https://wixoss.fandom.com/api.php?action=parse&page=${pageName}&format=json`;
}

module.exports = {
    wikiUrlToApi,
    buildApiUrl
};

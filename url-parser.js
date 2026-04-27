// url-parser.js

function converterParaAPI(url) {
    try {
        // valida URL
        const parsedUrl = new URL(url);

        // pega parte depois de /wiki/
        const caminho = parsedUrl.pathname;

        if (!caminho.includes("/wiki/")) {
            throw new Error("URL não é uma página válida da wiki (/wiki/ não encontrado)");
        }

        let page = caminho.split("/wiki/")[1];

        // remove barra inicial se existir
        page = page.replace(/^\/+/, "");

        // monta URL da API
        const apiUrl = `${parsedUrl.origin}/api.php?action=parse&page=${page}&format=json`;

        return apiUrl;

    } catch (err) {
        return `Erro: ${err.message}`;
    }
}

// ==========================
// 👇 COLE SUA URL AQUI
// ==========================

const URL_INPUT = "https://wixoss.fandom.com/wiki/Category:Booster_Packs";

// ==========================

if (!URL_INPUT) {
    console.log("⚠️ Cole a URL dentro do script na variável URL_INPUT");
} else {
    const resultado = converterParaAPI(URL_INPUT);

    console.log("\nURL original:");
    console.log(URL_INPUT);

    console.log("\nURL convertida:");
    console.log(resultado);
}

//inicia o script com: node url-parser.js
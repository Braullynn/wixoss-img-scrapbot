const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const sharp = require("sharp");

const URL = "https://wixoss.fandom.com/api.php?action=parse&page=WXD-05_Black_Desire/Gallery&format=json";

// cria pasta
if (!fs.existsSync("images")) {
    fs.mkdirSync("images");
}

// lista oficial das cartas (garante consistência)
const cartas = [
    "WD05-001", "WD05-002", "WD05-003", "WD05-004", "WD05-005", "WD05-006", "WD05-007", "WD05-008", "WD05-009", "WD05-010", "WD05-011", "WD05-012", "WD05-013", "WD05-014", "WD05-015", "WD05-016", "WD05-017", "WD05-018"
]
    ;

async function baixar() {
    console.log("Acessando galeria via API...");

    const { data } = await axios.get(URL);
    const htmlDaPagina = data.parse.text["*"];
    const $ = cheerio.load(htmlDaPagina);

    let encontrados = 0;

    for (const id of cartas) {
        try {
            console.log(`Procurando carta: ${id}`);

            // Busca por imagens que tenham o ID no data-caption ou alt
            let domImg = $(`img[data-caption*="${id}"], img[alt*="${id}"], img[data-image-key*="${id}"]`).first();

            if (!domImg || domImg.length === 0) {
                console.log(`❌ Não encontrado: ${id}`);
                continue;
            }

            let img = domImg.attr("data-src") || domImg.attr("src");

            if (img && img.startsWith("data:image")) {
                let noscriptImg = domImg.parent().find("noscript img").attr("src");
                if (noscriptImg) {
                    img = noscriptImg;
                }
            }

            if (!img) {
                console.log(`❌ Sem imagem: ${id}`);
                continue;
            }

            // limpa URL para pegar a resolução original
            img = img.split("/revision")[0];

            console.log(`⬇ Baixando ${id} da URL: ${img}`);

            const response = await axios.get(img, {
                responseType: "arraybuffer",
            });

            console.log(`Tamanho do buffer: ${response.data.length || response.data.byteLength}`);

            // salva comprimido
            await sharp(response.data)
                .resize(250, 349)
                .jpeg({ quality: 70 })
                .toFile(`images/${id}.jpg`);

            encontrados++;

        } catch (err) {
            console.log(`Erro em ${id}`);
        }
    }

    console.log(`\n✔ Concluído: ${encontrados} cartas baixadas`);
}

baixar();
const axios = require("axios");
const cheerio = require("cheerio");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function downloadCardImages(galleryHtml, cardCodes, outputDir) {
    const $ = cheerio.load(galleryHtml);
    let encontrados = 0;
    let comErro = 0;
    let pulados = 0;

    for (const id of cardCodes) {
        const outputPath = path.join(outputDir, `${id}.jpg`);

        // Verifica se o arquivo já existe para pular
        if (fs.existsSync(outputPath)) {
            console.log(`⏭️  Pulando (já existe): ${id}`);
            pulados++;
            continue;
        }

        let success = false;
        let retries = 3;

        while (!success && retries > 0) {
            try {
                console.log(`🔍 Procurando carta: ${id} (Tentativas restantes: ${retries})`);

                let domImg = $(`img[data-caption*="${id}"], img[alt*="${id}"], img[data-image-key*="${id}"]`).first();

                if (!domImg || domImg.length === 0) {
                     const simpleId = id.replace("-", "");
                     domImg = $(`img[data-caption*="${simpleId}"], img[alt*="${simpleId}"]`).first();
                }

                if (!domImg || domImg.length === 0) {
                    console.log(`❌ Não encontrado na galeria: ${id}`);
                    comErro++;
                    success = true; // Marca como "resolvido" pois não existe na galeria
                    continue;
                }

                let img = domImg.attr("data-src") || domImg.attr("src");
                if (img && img.startsWith("data:image")) {
                    let noscriptImg = domImg.parent().find("noscript img").attr("src");
                    if (noscriptImg) img = noscriptImg;
                }

                if (!img) {
                    console.log(`❌ Sem link de imagem válido: ${id}`);
                    comErro++;
                    success = true;
                    continue;
                }

                img = img.split("/revision")[0];
                console.log(`⬇ Baixando ${id}...`);

                const response = await axios.get(img, {
                    responseType: "arraybuffer",
                    timeout: 10000 // 10 segundos de timeout
                });

                // Lógica de Qualidade Dinâmica para atingir 21KB - 25KB
                let quality = 75;
                let finalBuffer;
                let attempts = 0;
                const minSize = 21 * 1024;
                const maxSize = 25 * 1024;

                while (attempts < 4) {
                    finalBuffer = await sharp(response.data)
                        .resize(250, 349)
                        .jpeg({ quality: quality, chromaSubsampling: '4:4:4' })
                        .toBuffer();
                    
                    if (finalBuffer.length < minSize && quality <= 95) {
                        quality += 7;
                    } else if (finalBuffer.length > maxSize && quality >= 10) {
                        quality -= 7;
                    } else {
                        break;
                    }
                    attempts++;
                }

                await fs.promises.writeFile(outputPath, finalBuffer);

                const sizeKB = (finalBuffer.length / 1024).toFixed(1);
                console.log(`✔ Salvo: ${id}.jpg (${sizeKB} KB)`);
                encontrados++;
                success = true;

                await new Promise(r => setTimeout(r, 200));

            } catch (err) {
                retries--;
                console.log(`⚠️ Erro em ${id}: ${err.message}. ${retries > 0 ? 'Tentando novamente...' : 'Falha definitiva.'}`);
                
                if (retries > 0) {
                    // Espera um pouco mais a cada falha (backoff)
                    await new Promise(r => setTimeout(r, 1000 * (3 - retries)));
                } else {
                    comErro++;
                }
            }
        }
    }

    return { encontrados, comErro, pulados };
}

module.exports = {
    downloadCardImages
};

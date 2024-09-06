const {
    createAPIUrl,
    listAPIUrl
} = require("../tools/api.js");
const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

module.exports = {
    name: "mangainfo",
    aliases: ["manga"],
    category: "internet",
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, {
            banned: true,
            coin: 3
        });
        if (status) return ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return ctx.reply(
            `${quote(global.msg.argument)}\n` +
            quote(`Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} neon genesis evangelion`)}`)
        );

        try {
            const mangaApiUrl = await createAPIUrl("https://api.jikan.moe", "/v4/manga", {
                q: input
            });
            const mangaResponse = await axios.get(mangaApiUrl, {
                headers: {
                    "User-Agent": global.system.userAgent
                }
            });
            const info = mangaResponse.data.data[0];

            const translationApiUrl = createAPIUrl("fasturl", "/tool/translate", {
                text: info.synopsis,
                target: "ids"
            });
            const translationResponse = await axios.get(translationApiUrl, {
                headers: {
                    "User-Agent": global.system.userAgent,
                    "x-api-key": listAPIUrl().fasturl.APIKey
                }
            });
            const synopsisId = translationResponse.data.translatedText || info.synopsis;

            return await ctx.reply(
                `${quote(`Judul: ${info.title}`)}\n` +
                `${quote(`Judul (Inggris): ${info.title_english}`)}\n` +
                `${quote(`Judul (Jepang): ${info.title_japanese}`)}\n` +
                `${quote(`Tipe: ${info.type}`)}\n` +
                `${quote(`Bab: ${info.chapters}`)}\n` +
                `${quote(`Volume: ${info.volumes}`)}\n` +
                `${quote(`Ringkasan: ${synopsisId.replace("\n\n", ". ")}`)}\n` +
                `${quote(`URL: ${info.url}`)}\n` +
                "\n" +
                global.msg.footer
            );
        } catch (error) {
            console.error("Error:", error);
            if (error.status !== 200) return ctx.reply(global.msg.notFound);
            return ctx.reply(quote(`⚠ Terjadi kesalahan: ${error.message}`));
        }
    }
};
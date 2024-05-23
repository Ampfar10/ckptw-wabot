const {
    createAPIUrl
} = require("../tools/api.js");
const {
    bold,
    monospace
} = require("@mengkodingan/ckptw");
const axios = require("axios");
const fg = require("api-dylux");
const mime = require("mime-types");

module.exports = {
    name: "ttdl",
    aliases: ["tiktokdl", "tiktokmp3", "tiktoknowm", "tt", "tta", "ttaudio", "ttmp3", "ttmusic", "ttmusik", "vt", "vta", "vtaudio", "vtdltiktok", "vtmp3", "vtmusic", "vtmusik", "vtnowm"],
    category: "downloader",
    code: async (ctx) => {
        const handlerObj = await global.handler(ctx, {
            banned: true,
            coin: 3
        });

        if (handlerObj.status) return ctx.reply(handlerObj.message);

        const input = ctx._args.join(" ");
        if (!input) return ctx.reply(
            `${global.msg.argument}\n` +
            `Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} https://example.com/`)}`
        );

        try {
            const mp3cmd = ["tiktokmp3", "tta", "ttaudio", "ttmp3", "ttmusic", "ttmusik", "vta", "vtaudio", "vtmp3", "vtmusic", "vtmusik"];

            const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)\b/i;
            if (!urlRegex.test(input)) throw new Error(global.msg.urlInvalid);

            const promises = [
                axios.get(createAPIUrl("nyx", "/dl/tiktok", {
                    url: input
                })).then(response => response.data),
                axios.get(createAPIUrl("ngodingaja", "/api/tiktok", {
                    url: input
                })).then(response => response.data),
                fg.tiktok(input)
            ];

            const results = await Promise.allSettled(promises);

            let result;
            for (const res of results) {
                if (res.status === "fulfilled" && res.value) {
                    if (mp3cmd.includes(ctx._used.command)) {
                        result = res.value.result?.musik || res.value.hasil?.musik;
                    } else {
                        result = res.value.result?.video_hd || res.value.result?.video2 || res.value.result?.video1 || res.value.hasil?.tanpawm || res.value.hdplay || res.value.play;
                    }

                    if (result) break;
                }
            }

            if (!result) throw new Error(global.msg.notFound);

            return await ctx.reply({
                video: {
                    url: result
                },
                mimetype: mime.contentType(mp3cmd.includes(ctx._used.command) ? "mp3" : "mp4"),
                caption: `❖ ${bold("TT Downloader")}\n` +
                    "\n" +
                    `➲ URL: ${input}\n` +
                    "\n" +
                    global.msg.footer,
                gifPlayback: false
            });
        } catch (error) {
            console.error("Error:", error);
            return ctx.reply(`${bold("[ ! ]")} Terjadi kesalahan: ${error.message}`);
        }
    }
};
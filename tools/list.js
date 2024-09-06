const {
    createUrl
} = require("./api.js");
const {
    convertMsToDuration
} = require("./general.js");
const {
    translate
} = require("./msg.js");
const pkg = require("../package.json");
const {
    bold,
    italic,
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const moment = require("moment-timezone");
const fetch = require("node-fetch");

async function get(type, ctx) {
    let text = "";

    const generateMenuText = (cmds, tags) => {
        let menuText =
            `${translate(`Hai ${ctx._sender.pushName || "Kak"}, berikut adalah daftar perintah yang tersedia!`, userLanguage)}\n` +
            "\n" +
            `${quote(`Runtime: ${convertMsToDuration(Date.now() - global.system.startTime) || global.tools.msg.translate("kurang dari satu detik.", userLanguage)}`)}\n` +
            `${quote(`${translate("Tanggal", userLanguage)}: ${moment.tz(global.system.timeZone).format("DD/MM/YY")}`)}\n` +
            `${quote(`${translate("Waktu", userLanguage)}: ${moment.tz(global.system.timeZone).format("HH:mm:ss")}`)}\n` +
            `${quote(`${translate("Versi", userLanguage)}: ${pkg.version}`)}\n` +
            `${quote(`Prefix: ${ctx._used.prefix}`)}\n` +
            "\n" +
            `${italic(translate("Jangan lupa berdonasi agar bot tetap online!"))}\n` +
            `${global.msg.readmore}\n`;

        for (const category of Object.keys(tags)) {
            const categoryCommands = Array.from(cmds.values())
                .filter(command => command.category === category)
                .map(command => ({
                    name: command.name,
                    aliases: command.aliases
                }));

            if (categoryCommands.length > 0) {
                menuText += `${bold(tags[category])}\n`;

                categoryCommands.forEach(cmd => {
                    menuText += quote(monospace(`${ctx._used.prefix || "/"}${cmd.name}`));
                    if (category === "main" && cmd.aliases && cmd.aliases.length > 0) {
                        menuText += `\n` + cmd.aliases.map(alias => quote(monospace(`${ctx._used.prefix || "/"}${alias}`))).join("\n");
                    }
                    menuText += "\n";
                });

                menuText += "\n";
            }
        }

        menuText += global.msg.footer;
        return menuText;
    };

    try {
        switch (type) {
            case "alkitab": {
                const response = await fetch(createUrl("https://beeble.vercel.app", "/api/v1/passage/list", {}));
                const data = await response.json();
                text = data.data.map(b =>
                    `${quote(`${translate("Buku", userLanguage)}: ${b.name} (${b.abbr})`)}\n` +
                    `${quote(`${translate("Jumlah Bab", userLanguage)}: ${b.chapter}`)}\n` +
                    "-----\n"
                ).join("");

                text += global.msg.footer;
                break;
            }

            case "alquran": {
                const response = await fetch(createUrl("https://equran.id", "/api/v2/surat", {}));
                const data = await response.json();
                text = data.data.map(s =>
                    `${quote(`${translate("Surah", userLanguage)}: ${s.namaLatin} (${s.nomor})`)}\n` +
                    `${quote(`${translate("Jumlah Ayat", userLanguage)}: ${s.jumlahAyat}`)}\n` +
                    "-----\n"
                ).join("");

                text += global.msg.footer;
                break;
            }

            case "disable_enable": {
                const deList = ["antilink", "welcome"];
                text = deList.map(item => `${quote(item)}`).join("\n");
                text += "\n" + global.msg.footer;
                break;
            }

            case "menu": {
                const cmds = ctx._self.cmd;
                const tags = {
                    main: "Main",
                    profile: "Profile",
                    ai: "AI",
                    game: "Game",
                    converter: "Converter",
                    downloader: "Downloader",
                    fun: "Fun",
                    group: "Group",
                    islamic: "Islamic",
                    internet: "Internet",
                    maker: "Maker",
                    tools: "Tools",
                    owner: "Owner",
                    info: "Info",
                    "": "No Category"
                };

                if (!cmds || cmds.size === 0) {
                    text = quote(`⚠ ${translate("Terjadi kesalahan: Tidak ada perintah yang ditemukan.", userLanguage)}`);
                } else {
                    text = generateMenuText(cmds, tags);
                }
                break;
            }

            default: {
                text = quote(`⚠ ${translate("Terjadi kesalahan: Jenis daftar tidak dikenal.", userLanguage)}`);
                break;
            }
        }
    } catch (error) {
        text = quote(`⚠ ${translate("Terjadi kesalahan", userLanguage)}: ${error.message}`);
    }

    return text;
}

module.exports = {
    get
};
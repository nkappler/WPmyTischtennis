// @ts-check

/**
 * Use this file for JavaScript code that you want to run in the front-end
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * ```js
 * {
 *   "viewScript": "file:./view.js"
 * }
 * ```
 *
 * If you're not making any changes to this file because your project doesn't need any
 * JavaScript running in the front-end, then you should delete this file and remove
 * the `viewScript` property from `block.json`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

(function () {

    let search = "";
    let replace = "";

    /** @type {Record<string, string>} */
    const classNameMap = {
        teams: "cozy ellipsis minus30ch",
        datetime: "cozy",
        team_name: "ellipsis minus24ch",
    }

    const TABLE_COLUMNS = [
        { key: "table_rank", label: "Rang" },
        { key: "team_name", label: "Team" },
        // { key: "matches_won", label: "Spiele gewonnen" },
        // { key: "matches_lost", label: "Spiele verloren" },
        // { key: "sets_won", label: "Sätze gewonnen" },
        // { key: "sets_lost", label: "Sätze verloren" },
        // { key: "games_won", label: "Spiele gewonnen (Einzel)" },
        // { key: "games_lost", label: "Spiele verloren (Einzel)" },
        // { key: "points_won", label: "Punkte" },
        // { key: "points_lost", label: "Punkte verloren" },
        { key: "games", label: "Spiele" },
        { key: "matches_relation", label: "+/-" },
        { key: "points", label: "Punkte" },
        { key: "points/mobile", label: "Pkt" },
        // { key: "games_relation", label: "Spielverhältnis" }
    ];

    const SCHEDULE_COLUMNS = [
        { key: "date", label: "Datum" },
        { key: "time", label: "Zeit" },
        { key: "datetime", label: "Termin" },
        { key: "team_home", label: "Heim" },
        { key: "team_away", label: "Gast" },
        { key: "teams", label: "Begegnung" },
        { key: "matches", label: "Ergebnis" },
        { key: "matches/mobile", label: "Erg." },
        // { key: "matches_won", label: "Heim Siege" },
        // { key: "matches_lost", label: "Gast Siege" },
        // { key: "pdf_url", label: "Spielbericht" }
    ];

    function formatColumn(data, col) {
        switch (col) {
            case "date":
                const date = new Date(data.date);

                const weekday = date.toLocaleDateString("de-de", { weekday: 'short' })
                const datum = date.toLocaleDateString("de-de", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });

                return `${weekday}. ${datum}`;
            case "time":
                const time = new Date(data.date);
                return time.toLocaleTimeString("de-de", {
                    hour: '2-digit',
                    minute: '2-digit',
                });
            case "datetime":
                const datetime = new Date(data.date);
                return datetime.toLocaleDateString("de-de", {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                }) + "<wbr> " + datetime.toLocaleTimeString("de-de", {
                    hour: '2-digit',
                    minute: '2-digit',
                }) + "&nbsp;Uhr";
            case "points":
            case "points/mobile":
                return (data.points_won ?? 0) + ":" + (data.points_lost ?? 0);
            case "matches":
            case "games":
            case "matches/mobile":
                return ([0, "0"].includes(data.matches_won) && [0, "0"].includes(data.matches_lost)) ? "" :
                    (data.matches_won ?? 0) + ":" + (data.matches_lost ?? 0);
            case "teams":
                // data might contain extra or double spaces
                let team_home = (data.team_home || "").replace(/\s+/g, ' ').trim();
                // data might contain extra or double spaces
                let team_away = (data.team_away || "").replace(/\s+/g, ' ').trim();
                if (search && replace) {
                    if (team_home.trim() === search.trim()) {
                        team_home = `<b>${replace}</b>`;
                    }
                    if (team_away.trim() === search.trim()) {
                        team_away = `<b>${replace}</b>`;
                    }
                }
                return `${team_home}<br />${team_away}`;
            default:
                let value = data[col];
                if (search && replace && typeof value === "string") {
                    // data might contain extra or double spaces
                    value = value.replace(/\s+/g, ' ').trim();

                    if (value === search.trim()) {
                        return `<b>${replace}</b>`;
                    }
                }
                return value || '';
        }
    }


    function init() {
        document.querySelectorAll("p.wp-block-ttc-tabelle-spielplan").forEach(replaceBlockWithTable);
    }

    async function replaceBlockWithTable(block) {
        const _url = block.dataset.url;
        const url = new URL(_url);
        if (!url) {
            console.warn("No URL provided for Tabelle & Spielplan block.");
            return;
        }

        search = block.dataset.search || "";
        replace = block.dataset.replace || "";

        const data = await (await fetch(`${location.origin}/proxy?url=${encodeURIComponent(`${url.origin}/${url.pathname}/?_data`)}`)).json();

        const container = document.createElement("div");

        if (isGesamtSpielplan(data?.data)) {
            const spielplan = createGesamtSpielplan(data?.data);
            container.appendChild(spielplan);
        } else {
            const scheduleTitle = document.createElement("h4");
            scheduleTitle.textContent = "Spielplan";
            const gameSchedule = createGameSchedule(data?.data);
            gameSchedule && container.appendChild(scheduleTitle);
            gameSchedule && container.appendChild(gameSchedule);

            container.appendChild(document.createElement("br"));
            container.appendChild(document.createElement("br"));

            const rankTitle = document.createElement("h4");
            rankTitle.textContent = "Tabelle";
            const rankTable = createRankTable(data?.data);
            rankTable && container.appendChild(rankTitle);
            rankTable && container.appendChild(rankTable);
        }


        block.replaceWith(container);


        search = "";
        replace = "";
    }

    function isGesamtSpielplan(data) {
        return data && !data.meetings_excerpt && !data.table;
    }

    function createGesamtSpielplan(data) {

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const games = Object.values(data).flat();

        games.map(game => {
            const tr = document.createElement("tr");
            SCHEDULE_COLUMNS.forEach(col => {
                const td = createColumn(col, game);
                if (game.round_name) {
                    td.classList.add("pokal");
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        const headerRow = document.createElement("tr");
        SCHEDULE_COLUMNS.forEach(col => {
            const th = document.createElement("th");
            th.className = col.key.replace("/", " ");
            th.textContent = col.label;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }

    function createGameSchedule(data) {
        if (!data || !data.meetings_excerpt || !data.meetings_excerpt.meetings || !Array.isArray(data.meetings_excerpt.meetings)) {
            return document.createTextNode("No game data available.");
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const games = data.meetings_excerpt.meetings
            .flatMap(_game => Object.values(_game)).flat();

        games.map(game => {
            const tr = document.createElement("tr");
            SCHEDULE_COLUMNS.forEach(col => {
                const td = createColumn(col, game);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        const headerRow = document.createElement("tr");
        SCHEDULE_COLUMNS.forEach(col => {
            const th = document.createElement("th");
            th.className = col.key.replace("/", " ");
            th.textContent = col.label;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;

    }

    function createRankTable(data) {
        if (!data || !data.table || !Array.isArray(data.table)) {
            return document.createTextNode("No table data available.");
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const clubs = data.table;

        clubs.map(club => {
            const tr = document.createElement("tr");
            TABLE_COLUMNS.forEach(col => {
                const td = createColumn(col, club);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        const headerRow = document.createElement("tr");
        TABLE_COLUMNS.forEach(col => {
            const th = document.createElement("th");
            th.className = col.key.replace("/", " ");
            th.textContent = col.label;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;

    }

    function createColumn(col, data) {
        const classes = classNameMap[col.key] ? classNameMap[col.key] : "";
        const td = document.createElement("td");
        td.className = classes + " " + col.key.replace("/", " ");
        td.innerHTML = formatColumn(data, col.key);
        return td;
    }

    if (document.readyState !== "complete") {
        document.addEventListener("readystatechange", () => {
            if (document.readyState === "complete") {
                init();
            }
        });
    } else {
        init();
    }

})();

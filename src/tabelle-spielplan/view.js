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

    const _replacements = [
        /* 
        * Diese Liste ersetzt den Clubnamen durch die internen Mannschaftsnamen, abhängig von der Anzahl Einträge pro Zeile:
        * 1 Wert (Beispiel ["spielfrei"]): Wird dieser Text in einer Tabellenzeile gefunden, wird die gesamte Zeile entfernt.
        * 2 Werte (Beispiel ["TTC Langensteinbach IV", "<b>Herren4</b>"]): Wird der erste Wert in einer Zeile gefunden, wird
        * er durch den zweiten Wert ersetzt.
        * 3 Werte (Beispiel ["He Bez", "TTC Langensteinbach", "<b>Herren 1</b>"]): Wird der erste Wert (Liga) irgendwo in einer
        * Zeile gefunden, wird in dieser Zeile der zweite Wert durch den dritten Wert ersetzt. Der Abgleich der Liga ist notwendig,
        * da "TTC Langensteinbach" nicht eindeutig ist. Aus diesem Grund gibt es das Argument "replaceClubName" für Tabellen in
        * denen die Liga nicht enthalten ist.
        **/
        ["spielfrei"],
        ["SG-Weingarten/L'steinbach", "<b>Damen</b>"],
        ["TTC Langensteinbach V", "<b>Erwachsene V</b>"],
        ["E Bez Li", "TTC Langensteinbach", "<b>Erwachsene I</b>"],
        ["E Kr Li", "TTC Langensteinbach II", "<b>Erwachsene II</b>"],
        ["E Kr Kl B", "TTC Langensteinbach III", "<b>Erwachsene III</b>"],
        ["E Kr Kl C", "TTC Langensteinbach IV", "<b>Erwachsene IV</b>"],
        ["Ju 19 Vb Kl", "TTC Langensteinbach", "<b>Jugend 19 I</b>"],
        ["Ju 19 Kr Li", "TTC Langensteinbach II", "<b>Jugend 19 II</b>"],
        ["Ju 19 Kr Kl", "TTC Langensteinbach III", "<b>Jugend 19 III</b>"],
        ["Ju 15", "TTC Langensteinbach", "<b>Jugend 15</b>"],
        ["Ju 13", "TTC Langensteinbach", "<b>Jugend 13</b>"],
        ["E B Pok", "TTC Langensteinbach", "<b>Erwachsene I (Pokal)</b>"],
        ["E C Pok", "TTC Langensteinbach II", "<b>Erwachsene II (Pokal)</b>"],
        ["Kl B Pok", "TTC Langensteinbach III", "<b>Erwachsene III (Pokal)</b>"],
        ["Kl CD Pok", "TTC Langensteinbach IV", "<b>Erwachsene IV (Pokal)</b>"],
        ["Ju 19 Pok", "TTC Langensteinbach II", "<b>Jungen 19 II (Pokal)</b>"],
        ["Ju 15 Pok", "TTC Langensteinbach", "<b>Jungen 15 (Pokal)</b>"],
    ];

    function formatColumn(data, col) {
        switch (col) {
            case "date":
                const date = new Date(data.date);
                return date.toLocaleDateString("de-de", {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                });
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
                }) + ",<wbr> " + datetime.toLocaleTimeString("de-de", {
                    hour: '2-digit',
                    minute: '2-digit',
                }) + "&nbsp;Uhr";
            case "points":
            case "points/mobile":
                console.log(data);
                return (data.points_won ?? 0) + ":" + (data.points_lost ?? 0);
            case "matches":
            case "games":
            case "matches/mobile":
                return ([0, "0"].includes(data.matches_won) && [0, "0"].includes(data.matches_lost)) ? "" :
                    (data.matches_won ?? 0) + ":" + (data.matches_lost ?? 0);
            case "teams":
                let team_home = data.team_home || "";
                let team_away = data.team_away || "";
                if (search && replace) {
                    if (team_home.trim() === search.trim()) {
                        team_home = `<b>${replace}</b>`;
                    }
                    if (team_away.trim() === search.trim()) {
                        team_away = `<b>${replace}</b>`;
                    }
                }
                return `${team_home}<wbr> vs. <wbr>${team_away}`;
            default:
                const value = data[col];
                if (search && replace && typeof value === "string") {
                    if (value.trim() === search.trim()) {
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

        // console.log("Fetching data for Tabelle & Spielplan block from URL:", url);

        const data = await (await fetch(`${location.origin}/proxy?url=${encodeURIComponent(`${url.origin}/${url.pathname}/?_data`)}`)).json();

        const container = document.createElement("div");

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

        block.replaceWith(container);


        search = "";
        replace = "";
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
            console.log(game)
            const tr = document.createElement("tr");
            SCHEDULE_COLUMNS.forEach(col => {
                const td = document.createElement("td");
                td.className = col.key.replace("/", " ");
                td.innerHTML = formatColumn(game, col.key)
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
                const td = document.createElement("td");
                td.className = col.key.replace("/", " ");
                td.innerHTML = formatColumn(club, col.key);
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

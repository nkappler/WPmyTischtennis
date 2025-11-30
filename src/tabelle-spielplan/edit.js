// @ts -check
/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import { InspectorControls } from '@wordpress/block-editor';
import { Button, __experimentalHStack as HStack, IconButton, PanelBody, TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';

const Sidebar = ({ attributes, setAttributes }) => {
	const { url, search, replace, liga } = attributes;

	const styles = document.createElement('style');
	styles.innerHTML = `
		.interface-complementary-area__fill,
		.editor-sidebar {
			width: 380px !important;
		}
	`;

	useEffect(() => {
		document.head.appendChild(styles);
		return () => {
			document.head.removeChild(styles);
		};
	}, [styles]);

	return <InspectorControls>
		<PanelBody title={__('Settings', 'tabelle-spielplan')}>
			<TextControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={__(
					'Abruf-URL',
					'tabelle-spielplan'
				)}
				value={url || ''}
				onChange={(value) =>
					setAttributes({ url: value })
				}
			/>

			<VStack spacing={2}>
				{search.map((_, i) => {

					return <HStack spacing={1} style={{ alignItems: "start" }} className='tabelle-spielplan-replace-rule'>

						<VStack spacing={0}>

							<HStack spacing={1} style={{ alignItems: "start" }}>

								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={__(
										'Suchen',
										'tabelle-spielplan'
									)}
									value={search[i] || ''}
									onChange={(value) =>
										setAttributes({ search: search.map((s, index) => index === i ? value : s) })
									}
								/>


								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={__(
										'Ersetzen',
										'tabelle-spielplan'
									)}
									value={replace[i] || ''}
									onChange={(value) =>
										setAttributes({ replace: replace.map((r, index) => index === i ? value : r) })
									}
								/>
							</HStack>

							<TextControl
								className='tabelle-spielplan-input'
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'für Liga (optional):',
									'tabelle-spielplan'
								)}
								value={liga[i] || ''}
								onChange={(value) =>
									setAttributes({ liga: liga.map((r, index) => index === i ? value : r) })
								}
							/>
						</VStack>

						<IconButton
							icon="trash"
							label={__('Regel löschen', 'tabelle-spielplan')}
							onClick={() => {
								setAttributes({
									search: search.filter((_, index) => index !== i),
									replace: replace.filter((_, index) => index !== i),
									liga: liga.filter((_, index) => index !== i),
								});
							}}
						/>
					</HStack>
				})}
			</VStack>

			<Button icon={"plus"} onClick={() => {
				setAttributes({
					search: [...search, ''],
					replace: [...replace, ''],
					liga: [...liga, ''],
				});
			}}>Weitere Regel</Button>

		</PanelBody>
	</InspectorControls>
};

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {import('wordpress__blocks').BlockEditProps<{
 *     url: string;
 *     search: string;
 *     replace: string;
 * }>} props
 * @return {import('react').ReactNode} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { url, search, replace, liga } = attributes;
	console.log('Edit attributes:', attributes);

	const [loading, setLoading] = useState(false);

	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const fetchIdRef = useRef(0);

	useEffect(() => {
		if (!url) return undefined;

		const urlObj = new URL(url);
		const fetchUrl = `${location.origin}/proxy?url=${encodeURIComponent(`${urlObj.origin}/${urlObj.pathname}/?_data`)}`

		const controller = new AbortController();
		const signal = controller.signal;
		const id = ++fetchIdRef.current;

		setLoading(true);
		setError(null);

		(async () => {
			try {
				const res = await fetch(fetchUrl, { signal });
				if (!res.ok) throw new Error(res.statusText || 'Fetch failed');

				const json = await res.json();

				// ignore result if a newer fetch started
				if (id !== fetchIdRef.current) return;
				setData(json);
			} catch (err) {
				// aborted requests are expected on cancel — ignore them
				if (err.name === 'AbortError') return;
				if (id !== fetchIdRef.current) return;
				setError(err.message || String(err));
				setData(null);
			} finally {
				if (id !== fetchIdRef.current) return;
				setLoading(false);
			}
		})();

		// cleanup: abort this fetch if attrs change / component unmounts
		return () => controller.abort();
	}, [url, search, replace]);

	console.log(data);

	if (!url) {
		return <>
			<Sidebar attributes={attributes} setAttributes={setAttributes} />
			<p {...useBlockProps()}>
				{__(
					'Tabelle & Spielplan',
					'tabelle-spielplan'
				)}
				<br />
				{__(
					'Gib eine Abruf-URL in den Block-Einstellungen an, um eine Vorschau zu sehen.',
					'tabelle-spielplan'
				)}
			</p>
		</>;
	}

	if (loading && !data) {
		return <>
			<Sidebar attributes={attributes} setAttributes={setAttributes} />
			<p {...useBlockProps()}>
				{__(
					'Tabelle & Spielplan',
					'tabelle-spielplan'
				)}
				<br />
				{__(
					'Lade Daten...',
					'tabelle-spielplan'
				)}
			</p>
		</>;
	}

	if (error) {
		return <>
			<Sidebar attributes={attributes} setAttributes={setAttributes} />
			<p {...useBlockProps()}>
				{__(
					'Tabelle & Spielplan',
					'tabelle-spielplan'
				)}
				<br />
				{__(
					'Fehler beim Laden der Daten: ' + error,
					'tabelle-spielplan'
				)}
			</p>
		</>;
	}

	return <>
		<Sidebar attributes={attributes} setAttributes={setAttributes} />
		<p {...useBlockProps()}>
			{__(
				'Tabelle & Spielplan' + (loading ? ' (aktualisiere Daten...)' : ''),
				'tabelle-spielplan'
			)}
		</p>
		<Tables search={search} replace={replace} liga={liga} data={data} />
	</>;
}

function Tables(props) {
	const { data: _data, search, replace, liga } = props;

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
					team_home = searchAndReplace(search, replace, team_home, data.league_name);
					team_away = searchAndReplace(search, replace, team_away, data.league_name);
				}
				return `${team_home}<br />${team_away}`;
			default:
				let value = data[col];
				if (search && replace && typeof value === "string") {
					// data might contain extra or double spaces
					// value = value.replace(/\s+/g, ' ').trim();

					// if (value === search.trim()) {
					//     return `<b>${replace}</b>`;
					// }
					return searchAndReplace(search, replace, value, data.league_name);
				}
				return value || '';
		}
	}

	function trim(str) {
		// trims double spaces and leading/trailing spaces
		return str?.replace(/\s+/g, ' ').trim();
	}

	function searchAndReplace(search, replace, data, league_name) {
		if (!search) return data;
		if (Array.isArray(search)) {

			const index = search.map(s => trim(s)).findIndex((s, i) => {
				if (!liga[i] || trim(liga[i]) === "") {
					return trim(s) === trim(data);
				}
				if (liga[i] && trim(liga[i]) !== "" && trim(liga[i]) === trim(league_name)) {
					return trim(s) === trim(data);
				}
				return false;
			});

			if (index === -1) {
				return data;
			}

			if (!liga[index] || trim(liga[index]) === "") {
				return `<b>${replace[index]}</b>`;
			}

			if (liga[index] && trim(liga[index]) !== "" && trim(liga[index]) === trim(league_name)) {
				return `<b>${replace[index]}</b>`;
			}
		}
		else if (data.trim() === search.trim()) {
			return `<b>${replace}</b>`;
		}
		return data;
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

	const children = [];

	if (isGesamtSpielplan(_data && _data.data)) {
		const spielplan = createGesamtSpielplan(_data && _data.data);
		children.push(spielplan);
	} else {
		const scheduleTitle = document.createElement("h4");
		scheduleTitle.textContent = "Spielplan";
		const gameSchedule = createGameSchedule(_data && _data.data);
		gameSchedule && children.push(scheduleTitle);
		gameSchedule && children.push(gameSchedule);

		children.push(document.createElement("br"));
		children.push(document.createElement("br"));

		const rankTitle = document.createElement("h4");
		rankTitle.textContent = "Tabelle";
		const rankTable = createRankTable(_data && _data.data);
		rankTable && children.push(rankTitle);
		rankTable && children.push(rankTable);
	}

	const ref = useRef();

	useEffect(() => {
		const block = ref.current;
		block && (block.innerHTML = "");
		block && block.append(...children);
	});

	return <div ref={ref} ></div>;

}

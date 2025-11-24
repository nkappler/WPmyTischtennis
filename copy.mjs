import fs from "fs";

if (fs.existsSync("wordpress/wp-content/plugins/tabelle-spielplan")) {
    fs.rmdirSync("wordpress/wp-content/plugins/tabelle-spielplan", { recursive: true });
}
fs.cpSync("build", "wordpress/wp-content/plugins/tabelle-spielplan/build", { recursive: true });
fs.cpSync("tabelle-spielplan.php", "wordpress/wp-content/plugins/tabelle-spielplan/tabelle-spielplan.php", { recursive: true });
import path from "node:path";
import process from "node:process";
import fs from "node:fs";
import os from "node:os";
import kleur from "kleur";
import boxen from "boxen";
import figlet from "figlet";

function capitalize(string) {
  const words = string.split(" ");
  const capitalizedArr = words.map((word) => {
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
  });
  return capitalizedArr.join(" ");
}

export function isWsl() {
  if (process.platform !== "linux") return false;
  if (os.release().toLowerCase().includes("microsoft")) return true;
}

export function alacrittyConfigPath() {
  const possibleLocations = [
    path.join(process.env.XDG_CONFIG_HOME || "", "alacritty/alacritty.toml"),
    path.join(process.env.XDG_CONFIG_HOME || "", "alacritty.toml"),
    path.join(process.env.HOME || "", ".config/alacritty/alacritty.toml"),
    path.join(process.env.HOME || "", ".alacritty.toml"),
    path.join(process.env.APPDATA || "", "alacritty/alacritty.toml"),
    path.join(
      "/mnt/c/Users/",
      os.hostname(),
      "AppData/Roaming/alacritty/alacritty.toml",
    ),
  ];

  return possibleLocations.find(function (location) {
    if (!fs.existsSync(location)) return;
    return location;
  });
}

export function alacrittyColorsPath(configPath) {
  if (!configPath) return null;

  const rootDirArr = configPath.split(path.sep);
  rootDirArr.pop();
  const location = path.join(rootDirArr.join(path.sep), "colors");

  if (!fs.existsSync(location)) return;
  if (fs.readdirSync(location).length == 0) return;

  return location;
}

export const boxenOpts = {
  padding: { top: 0, bottom: 0, left: 1, right: 1 },
  margin: { top: 1, bottom: 1, left: 1, right: 1 },
  borderStyle: "round",
  borderColor: "magenta",
};

export function welcomeTitle() {
  //TODO: Try With Figlet
  console.log(
    boxen(
      figlet.textSync("Alacritty Themes", {
        font: "Small",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 60,
        whitespaceBreak: true,
      }),
      boxenOpts,
    ),
  );
}

export function checkConfig() {
  if (!alacrittyConfigPath()) {
    console.log(
      `\n${boxen(
        kleur.red("❌ Oops! Your Config file Is Not There!"),
        boxenOpts,
      )}\n${boxen(
        "Please create your alacritty config file first!",
        boxenOpts,
      )}\n`,
    );
    process.exit(1);
  }
  if (!alacrittyColorsPath(alacrittyConfigPath())) {
    console.log(
      `\n${boxen(
        kleur.red(
          "❌ Oops! Your Colors Directory Is Not There Or It Is Empty!",
        ),
        boxenOpts,
      )}\n${boxen(
        "Please make sure you placed colors directory (Filled With Colors) in your alacritty root directory first!",
        boxenOpts,
      )}\n`,
    );

    process.exit(1);
  }
}

export function formatThemeName(fileName) {
  const deformatted = fileName.toLowerCase().split(".")[0];
  let cleaned = "";

  if (deformatted.includes("-")) {
    cleaned = deformatted.split("-").join(" ");
  } else if (deformatted.includes("_")) {
    cleaned = deformatted.split("_").join(" ");
  } else {
    cleaned = deformatted;
  }
  return capitalize(cleaned);
}

export const themes = fs
  .readdirSync(alacrittyColorsPath(alacrittyConfigPath()))
  .map((str) => str.toLowerCase())
  .sort()
  .map((themeName) => ({
    value: themeName,
    title: formatThemeName(themeName),
  }));

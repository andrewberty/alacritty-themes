#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import process from "node:process";
import path from "node:path";

import prompts from "prompts";
import kleur from "kleur";
import Fuse from "fuse.js";

import {
  alacrittyConfigPath,
  alacrittyColorsPath,
  themes,
  checkConfig,
  isWsl,
  welcomeTitle,
} from "./helpers.js";

welcomeTitle();
checkConfig();

const configPath = alacrittyConfigPath();

const currentConfig = fs.readFileSync(configPath).toString();
const regex = /^# Start Alacritty Themes\n[\s\S]*?\n# End Alacritty Themes/m;

function updateTheme(selectedTheme) {
  if (!selectedTheme) return;
  const selectedThemePath = path.join(
    alacrittyColorsPath(alacrittyConfigPath()),
    selectedTheme,
  );
  const selectedThemePathWindows = selectedThemePath.replaceAll("\\", "\\\\");
  const wslThemePath = `C:\\\\Users\\\\${os.hostname()}\\\\AppData\\\\Roaming\\\\alacritty\\\\colors\\\\${selectedTheme}`;

  const newTheme = `# Start Alacritty Themes\ngeneral.import = ["${
    process.env.APPDATA
      ? selectedThemePathWindows
      : isWsl()
        ? wslThemePath
        : selectedThemePath
  }"]\n# End Alacritty Themes`;

  if (!currentConfig.match(regex)) {
    const newConfig = [newTheme, "\n\n", currentConfig].join("");
    fs.writeFileSync(configPath, newConfig);
  } else {
    const newConfig = currentConfig.replace(regex, newTheme);
    fs.writeFileSync(configPath, newConfig);
  }
}

function revertSelection() {
  if (!currentConfig.match(regex)) return;
  const oldSchemeBlock = currentConfig.match(regex)[0] || "";
  const newConfig = currentConfig.replace(regex, oldSchemeBlock);
  fs.writeFileSync(configPath, newConfig);
}

async function startPrompt() {
  const response = await prompts(
    {
      type: "autocomplete",
      name: "themes",
      message: "Type to fuzzy search",
      choices: themes,
      limit: 10,
      fallback: kleur.red("Uh Oh! You don't have that theme yet"),
      suggest: (input, choices) => {
        const fuse = new Fuse(choices, {
          keys: ["title", "value"],
        });
        const filtered = fuse.search(input).map((item) => item.item);
        return Promise.resolve(filtered.length === 0 ? choices : filtered);
      },
      onState: (state) => updateTheme(state.value),
    },

    {
      onCancel: () => {
        revertSelection();
        console.log(kleur.green("It's Already Beautiful, Right?!"));
      },
    },
  );
  return response;
}
startPrompt();

// Import Modules
import { AQEActor } from "./actor/actor.js";
import { AQEActorSheet } from "./actor/actor-sheet.js";
import { AQEItem } from "./item/item.js";
import { AQEItemSheet } from "./item/item-sheet.js";
import { preloadHandlebarsTemplates } from "./preloadtemplates.js";
import { registerSettings } from "./settings.js";
import { upgradeWorld } from "./upgrade.js";

Hooks.once('init', async function() {
  game.eirendor = {
    AQEActor,
    AQEItem,
    rollItemMacro
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20 + @traits.ini.value",
    decimals: 2
  };
  registerSettings();

  // Define custom Entity classes
  CONFIG.Actor.documentClass = AQEActor;
  CONFIG.Item.documentClass = AQEItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("eirendor", AQEActorSheet, { 
    types: ["player", "non-player"],
    makeDefault: true,
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("eirendor", AQEItemSheet, {
    types: ["weapon", "armor", "gear", "talent", "spell", "background"],
    makeDefault: true
  });

  // Handlebars helpers, we use prefix "aqe_" to avoid problems with other modules
  Handlebars.registerHelper('aqe_concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('aqe_toLowerCase', function(str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('aqe_max', function(num1, num2) {
    return Math.max(num1, num2);
  });

  await preloadHandlebarsTemplates();
});

Hooks.once("ready", async function() {
  upgradeWorld();
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createAQEMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createAQEMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.eirendor.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "AQE.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}
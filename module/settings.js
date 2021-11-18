export const registerSettings = function () {

  game.settings.register("eirendor", "system-version", {
    name: game.i18n.localize("AQE.Setting.Version"),
    hint: game.i18n.localize("AQE.Setting.VersionHint"),
    scope: "world",
    config: true,
    default: 0,
    type: Number,
  });

  game.settings.register("eirendor", "flavor", {
    name: game.i18n.localize("AQE.Setting.Flavor"),
    hint: game.i18n.localize("AQE.Setting.FlavorHint"),
    default: "aqe",
    scope: "world",
    type: String,
    config: true,
    choices: {
      aqe: "El Albor de la Quinta Edad",
      arkham: "Leyendas de Arkham"
    },
    onChange: _ => window.location.reload()
  });
};

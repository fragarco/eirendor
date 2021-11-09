export const registerSettings = function () {

  game.settings.register("eirendor", "system-version", {
    name: game.i18n.localize("AQE.Setting.Version"),
    hint: game.i18n.localize("AQE.Setting.VersionHint"),
    scope: "world",
    config: true,
    default: 0,
    type: Number,
  });
};

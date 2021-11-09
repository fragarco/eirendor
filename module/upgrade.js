export const upgradeWorld = async () => {
    const currentRevision = 1;
    const storedRevision = Number(game.settings.get("eirendor", "system-version"));
    if (currentRevision !== storedRevision && game.user.isGM) {
        // Your code to perform the update
        // HERE
        game.settings.set("eirendor", "system-version", currentRevision);
        ui.notifications.info("Upgrade complete!");
    }
};

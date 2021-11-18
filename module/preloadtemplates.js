export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        //Character Sheets
        'systems/eirendor/templates/actor/actor-sheet.html',
        'systems/eirendor/templates/actor/actor-npc-sheet.html',
        //Actor partials
        'systems/eirendor/templates/actor/sections/basic-header.html',
        //Sheet tabs
        'systems/eirendor/templates/actor/sections/basic-skills.html',
        'systems/eirendor/templates/actor/sections/basic-combat.html',
        'systems/eirendor/templates/actor/sections/basic-gear.html',
        'systems/eirendor/templates/actor/sections/basic-spells.html',
        'systems/eirendor/templates/actor/sections/basic-bio.html',
        'systems/eirendor/templates/actor/sections/npc-skills.html',
        'systems/eirendor/templates/actor/sections/npc-combat.html',
    ];
    return loadTemplates(templatePaths);
};

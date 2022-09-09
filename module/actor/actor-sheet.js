/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class AQEActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["eirendor", "sheet", "actor"],
      width: 785,
      height: 650,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/eirendor/templates/actor";
    let sheet = "";
    const atype = this.actor.type; 
    sheet = (atype === 'player') ? "actor-sheet.html" : "actor-npc-sheet.html"; 
    return `${path}/${sheet}`;
  }
  
  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();

    // Redefine the template data references to the actor.
    const actorData = this.actor.toObject(false);
    context.actor = actorData;
    context.system = actorData.system;
    context.rollData = this.actor.getRollData.bind(this.actor);

    // Owned items.
    context.items = actorData.items;
    context.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));

    // Prepare items. Could be filtered if needed by type
    // using this.actor.type
    this._prepareBaseCharacterItems(context);
    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareBaseCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const stored = [];
    const weapons = [];
    const armor = [];
    const talents = [];
    const backgrounds = [];
    const spells = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []};
  
    // Iterate through items, allocating to containers
    for (let i of sheetData.items) {
      let item = i.system;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      switch (i.type) {
        case 'weapon':
          if (item.stored) {
            stored.push(i);
           } else {
            gear.push(i);
            if (item.number > 0) weapons.push(i);
          }
          break;
        case 'armor':
          if (item.stored) {
            stored.push(i);
          } else {
            gear.push(i);
            if (item.number > 0) armor.push(i);
          }
          break;
        case 'gear':
          if (item.stored) {
            stored.push(i);
          } else {
            gear.push(i);
          }
          break;
        case 'talent': talents.push(i); break;
        case 'spell':
          // Los trucos siempre estan preparados
          if (item.range === 0) item.runes = 1;
          // Filtrado de conjuros
          if (actorData.system.filters.spells === "ALL" ||
              actorData.system.filters.spells === ("level" + item.range) ||
              (actorData.system.filters.spells === "READY" && item.runes > 0)) {
            spells[item.range].push(i);
          }
          break;
        case 'background': backgrounds.push(i); break;
      }
    }
    // Reorder spells of same range by name 
    for (let range=0; range<10; range++) {
      spells[range].sort((a, b) => {
        if (a.name > b.name) return 1;
        return -1;
      });
    }

    // Assign and return
    sheetData.gear = gear;
    sheetData.stored = stored;
    sheetData.weapons = weapons;
    sheetData.armor = armor;
    sheetData.talents = talents;
    sheetData.spells = spells;
    sheetData.backgrounds = backgrounds;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Carry/Store inventory item
    html.find('.storable').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      const stored = !item.system.stored;
      item.update({'system.stored': stored});
    });

    // Toggle prepared or proficient item states
    html.find('.item-toggle').click(this._onToggleItem.bind(this));
    // Add or remove item quantity (prepared spells, arrows, etc.)
    html.find('.item-add').click(this._onItemAdd.bind(this));
    html.find('.item-del').click(this._onItemDel.bind(this));

    // Rollable abilities.
    html.find('.rollable').click(this._onSimpleDualRoll.bind(this));
    html.find('.attackroll').click(this._onAttackRoll.bind(this));
    html.find('.chatinfo').click(this._onPrintItemOnChat.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      // Find all items on the character sheet.
      html.find('tr.item').each((i, tr) => {
        // Add draggable attribute and dragstart listener.
        tr.setAttribute("draggable", true);
        tr.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * callback for clickable info we want to show in the chat.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onPrintItemOnChat(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    await item.roll();
  }

  /**
   * callback for clickable simple dual rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onSimpleDualRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    await this.__handleSimpleDualRoll(dataset);
  }

  /**
   * Handle simple dual rolls.
   * @param {DOMSTringMap} dataset originating click event roll data
   * @private
   */
  async __handleSimpleDualRoll(dataset) {
    const rollingstr = game.i18n.localize("AQE.Rolling")
    const bc = this.object.system.traits.bc.value;
    let roll = dataset.roll;
    if (dataset.comp === "true") {
      roll = roll + " + " + bc;
    }
    if (dataset.roll) {
      let roll1 = new Roll(roll, this.actor.getRollData());
      let roll2 = new Roll(roll, this.actor.getRollData());
      let label = dataset.label ? `${rollingstr} ${dataset.label}` : '';

      await roll1.evaluate({async: true});
      await roll2.evaluate({async: true});
      // Prepare rolls in case Dice So Nice! is being used
      const rolls = [roll1,roll2]; //array of Roll
      const pool = PoolTerm.fromRolls(rolls);
      const dsnroll = Roll.fromTerms([pool]);
      renderTemplate("systems/eirendor/templates/dice/simpledualroll.html",{roll1, roll2})
      .then(
        (msg) => {
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: dsnroll,
            flavor: label,
            content: msg,
          });
        }
      );
    }
  }

  /**
   * callback for clickable CaC attack rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onAttackRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const rolldata = this.actor.getRollData();
    // reaplace attribute name by its value if it appears in the damage roll
    const attributes = Object.keys(rolldata.attributes);
    attributes.forEach((a) => {
      const label = game.i18n.localize(rolldata.attributes[a].label);
      dataset.damage = dataset.damage.replace(label, rolldata.attributes[a].mod);
    });
    await this.__handleAttackDualRoll(dataset);
  }

  /**
   * Handle dual attack rolls.
   * @param {DOMSTringMap} dataset originating click event roll data
   * @private
   */
  async __handleAttackDualRoll(dataset) {
    const rollingstr = game.i18n.localize("AQE.AttackWith");
    if (dataset.roll) {
      let roll1 = new Roll(dataset.roll, this.actor.getRollData());
      let roll2 = new Roll(dataset.roll, this.actor.getRollData());
      let damage = new Roll(dataset.damage, this.actor.getRollData());
      let label = dataset.label ? `${rollingstr} ${dataset.label}` : '';

      await roll1.evaluate({async: true});
      await roll2.evaluate({async: true});
      await damage.evaluate({async: true});
      
      // in damage formulas dice should be first item
      const diceterm = damage.terms[0];
      let critformula = damage.total;
      if ('faces' in damage.terms[0]) {
        // critical hits reroll damage dice and add it to the result but does not apply twice
        // all other modifiers or extra damage dices (fire, posion, etc.)
        critformula = diceterm.number + "d" + diceterm.faces + " + " + damage.total; 
      }
      const critical = new Roll(critformula);
      await critical.evaluate({async: true});
      // Prepare rolls in case Dice So Nice! is being used
      const rolls = [roll1,roll2]; //array of Roll
      const pool = PoolTerm.fromRolls(rolls);
      const dsnroll = Roll.fromTerms([pool]);
      renderTemplate("systems/eirendor/templates/dice/attackdualroll.html",{roll1, roll2, damage, critical})
      .then(
        (msg) => {
          ChatMessage.create({
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: dsnroll,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: label,
            content: msg,
          });
        }
      );
    }
  }

  /**
   * Handle toggling the state of an Owned Item within the Actor.
   * @param {Event} ev        The triggering click event.
   * @private
   */
  _onToggleItem(ev) {
    ev.preventDefault();
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.update({'data.proficient': !item.data.system.proficient});
  }

  /**
   * Handle toggling the state of an Owned Item within the Actor.
   * @param {Event} ev        The triggering click event.
   * @private
   */
   _onItemAdd(ev) {
    ev.preventDefault();
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    switch (item.type) {
      case "spell":
        const runes = item.system.runes + 1
        item.update({'system.runes': item.system.range === 0 ? 1 : runes})
        break;
      case "weapon":
      case "armor":
      case "gear":
        let num = item.system.number + 1;
        item.update({'system.number': num});
        break;
    }
  }

  /**
   * Handle toggling the state of an Owned Item within the Actor.
   * @param {Event} ev        The triggering click event.
   * @private
   */
   _onItemDel(ev) {
    ev.preventDefault();
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    switch (item.type) {
      case "spell":
        let runes = item.system.runes - 1;
        if (runes < 0) runes = 0;
        item.update({'system.runes': item.system.range === 0 ? 1 : runes});
        break;
      case "weapon":
      case "armor":
      case "gear":
        let num = item.system.number - 1;
        if (num < 0) num = 0;
        item.update({'system.number': num});
        break;
    }
  }
}

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class AQEItem extends Item {
  
  /**
   * Calculate all derived item data.
   * @inheritdoc
   */
  prepareData(options) {
    super.prepareData(options);

    /* How can we access item data
    const itemData = this.system;
    const actorData = this.actor ? this.actor.system : {};
    const system = itemData.system;
    */
  }

  /**
 * Handle clickable rolls.
 * @param {Event} event   The originating click event
 * @private
 */
  async roll() {
    const item = this;
    if (item.type === "weapon") {
      this.handleAttackDualRoll({
        roll: "1d20 + " + item.system.attackmod,
        damage: item.system.damage + " + " + item.system.dmgmod,
        label: item.name
      });
    } else {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: "<h2>" + item.name + "</h2>",
        content: "<h3>" + item.system.tags + "<h3>" + item.system.description
      });
    }
  }

    /**
   * Handle dual attack rolls.
   * @param {DOMSTringMap} dataset originating click event roll data
   * @private
   */
  async handleAttackDualRoll(dataset) {
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
}

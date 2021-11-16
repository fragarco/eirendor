/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class AQEActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    switch (actorData.type) {
      case 'player':
        this._prepareCharacterData(actorData);
        break;
      case 'non-player':
        this._prepareNonCharacterData(actorData);
        break;
    }
    this._applySelectedHack(actorData);
  }

  /**
   * Default coin labels
   */
  _applyDefaultHackCoins(data) {
    data.money.gplabel = "AQE.CostMO";
    data.money.splabel = "AQE.CostMP";
    data.money.cplabel = "AQE.CostMC";
  }

  /**
   * 
   * Apply configured hack differences in case we want to add
   * different labes for Pulp, Leyendas de Arkham, etc., hacks
   */
  _applySelectedHack(actorData) {
    const data = actorData.data;
    data.traits.mp.label = "AQE.MP";
    this._applyDefaultHackCoins(data);
  }

  /**
   * 
   * calculate encumbrance data 
   */
  _prepareEncumbranceData(actorData) {
    const data = actorData.data;

    data.encumbrance.max = data.attributes.str.value * 3;
    // encumbrance due to coins, 100 coins = 1 Kg
    const coins = data.money.gp + data.money.sp + data.money.cp;
    let encumbrance = Math.floor(coins/100);

    // encumbrance due to carried items
    for (let i of actorData.items) {
      const item = i.data;
      if (item.type === 'weapon' || item.type === 'armor' || item.type === 'gear') {
        if (!item.data.stored) {
          encumbrance = encumbrance + item.data.weight;
        }
      }
    }
    data.encumbrance.current = encumbrance;
  }

  /**
   * Calculate character attribute modificators
   */
  _prepareAttributesData(actorData) {
    const data = actorData.data;
    // attribute mods
    for (let [key, attribute] of Object.entries(data.attributes)) {
      attribute.mod = Math.floor((attribute.value - 10)/2);
    }
    let nivel = data.header.level.value;
    if (nivel > 10) {
      nivel = 10;
    }
    data.traits.bc.value = Math.floor((nivel+1)/2) + 1;
    data.traits.pe.max = Math.floor(nivel/2) + 1 + data.attributes.con.mod;
  }

  /**
   * 
   * Calculate attack values for all equiped weapons.
   */
   _prepareAttackData(actorData) {
    const data = actorData.data;

    for (let i of actorData.items) {
      const item = i.data;
      let base = item.data.addmod;
      if (item.data.proficient) base = base + data.traits.bc.value;
      if (item.type === 'weapon') {
        item.data.attackmod = base + attributes[item.data.weapontype].mod;
        item.data.dmgmod = attributes[item.data.dmgtype].mod;
      }
    }
  }

  /**
   * 
   * Calculate attack values for all equiped weapons.
   */
  _prepareSpellsData(actorData) {
    const data = actorData.data;
    const bonus = data.attributes[data.traits.mp.char].mod + data.traits.bc.value;
    data.traits.mp.atkmod = bonus;
    data.traits.mp.CD = 8 + bonus;
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    this._prepareAttributesData(actorData);
    this._prepareEncumbranceData(actorData);
    this._prepareAttackData(actorData);
    this._prepareSpellsData(actorData);
  }

    /**
   * Prepare Non Character type specific data
   */
    _prepareNonCharacterData(actorData) {
      this._prepareAttributesData(actorData);
      this._prepareAttackData(actorData);
    }
}
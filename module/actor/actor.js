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
   * Leyendas de Arkham coin labels
   */
  _applyArkhamHackCoins(data) {
    data.money.gplabel = "AQE.CostLB";
    data.money.splabel = "AQE.CostPN";
    data.money.cplabel = "AQE.CostCH";
  }
  
  /**
   * 
   * Apply configured hack differences in case we want to add
   * different labes for Pulp, Leyendas de Arkham, etc., hacks
   */
  _applySelectedHack(actorData) {
    const data = actorData.data;
    const hack = game.settings.get("eirendor", "flavor");
    data.traits.mp.label = "AQE.MP";
    if (hack === "arkham") {
      this._applyArkhamHackCoins(data);
    } else {
      this._applyDefaultHackCoins(data);
    }
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
        const weight = item.data.unitweight * item.data.number;
        // Round result so it includes 2 decimal positions max
        item.data.weight = Math.round(weight * 100) / 100;
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
    if (data.isNPC){
      data.traits.bc.value = 2;
      data.traits.pe.max = 0;
    } else {
      data.traits.bc.value = Math.floor((nivel+1)/2) + 1;
      data.traits.pe.max = Math.floor(nivel/2) + 1 + data.attributes.con.mod;
    }
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
        if (data.isNPC) {
          item.data.attackmod = data.header.level.value + 2;
          item.data.dmgmod = 0;
        } else {
          item.data.attackmod = base + data.attributes[item.data.weapontype].mod;
          item.data.dmgmod = data.attributes[item.data.dmgtype].mod;
        }
      }
    }
  }

  /**
   * 
   * Calculate attack values for all equiped weapons.
   */
  _prepareSpellsData(actorData) {
    const data = actorData.data;
    let bonus = data.attributes[data.traits.mp.char].mod + data.traits.bc.value;
    if (data.isNPC) {
      bonus = data.header.level.value + data.attributes[data.traits.mp.char].mod;
    }
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
      this._prepareSpellsData(actorData);
    }
}
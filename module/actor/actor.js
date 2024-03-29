/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class AQEActor extends Actor {

  /**
   * Calculate all derived actor data.
   * @inheritdoc
   */
   prepareDerivedData(options) {
    super.prepareDerivedData(options);

    const actorData = this;
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
    const data = actorData.system;
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
    const data = actorData.system;

    data.encumbrance.max = data.attributes.str.value * 3;
    // encumbrance due to coins, 100 coins = 1 Kg
    const coins = data.money.gp + data.money.sp + data.money.cp;
    let encumbrance = Math.floor(coins/100);

    // encumbrance due to carried items
    for (let i of actorData.items) {
      if (i.type === "gear" || i.type === "weapon" || i.type === "armor") {
        const item = i;
        item.system.weight = item.system.unitweight * item.system.number;
        if (!item.system.stored) {
         encumbrance = encumbrance + item.system.weight;
        }
      }
    }
    data.encumbrance.current = encumbrance;
  }

  /**
   * Calculate character attribute modificators
   */
  _prepareAttributesData(actorData) {
    const data = actorData.system;
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
    const data = actorData.system;
    for (let item of actorData.items) {
      let base = item.system.addmod;
      if (item.system.proficient) base = base + data.traits.bc.value;
      if (item.type === 'weapon') {
        if (data.isNPC) {
          item.system.attackmod = data.header.level.value + 2;
          item.system.dmgmod = 0;
        } else {
          item.system.attackmod = base;
          if (item.system.weapontype !== "oth") {
            item.system.attackmod = base + data.attributes[item.system.weapontype].mod;
          }
          item.system.dmgmod = 0;
          if (item.system.dmgtype !== "oth") {
            item.system.dmgmod = data.attributes[item.system.dmgtype].mod;
          }
        }
      }
    }
  }

  /**
   * 
   * Calculate attack values for all equiped weapons.
   */
  _prepareSpellsData(actorData) {
    const data = actorData.system;
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
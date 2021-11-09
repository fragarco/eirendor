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

    data.encumbrance.max = data.attributes.str.value;
    // encumbrance due to coins
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
  }

  /**
   * 
   * Calculate Defense value. It adds base value to armor equiped. 
   * Dex modificator should be added by hand by the user to the base value. 
   */
  _prepareDefenseData(actorData) {
    const data = actorData.data;
    let def = data.traits.def.base;
    for (let i of actorData.items) {
      const item = i.data;
      if (item.type === 'armor' && !item.data.stored) {
          def = def + item.data.defmod;
      }
    }
    data.traits.def.current = def;
  }

  /**
   * 
   * Calculate attack values for all equiped weapons.
   */
   _prepareAttackData(actorData) {
    const data = actorData.data;
    for (let i of actorData.items) {
      const item = i.data;
      const base = item.data.addmod + data.traits.atk.value;
      if (item.type === 'weapon') {
        switch(item.data.weapontype) {
          case "strtype":
            item.data.attackmod = base + data.attributes.str.mod;
            break;
          case "dextype":
            item.data.attackmod = base + data.attributes.dex.mod;
            break;
          case "othtype":
            item.data.attackmod = base;
            break;
        }
      }
    }
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    this._prepareAttributesData(actorData);
    //AAA
    //this._prepareEncumbranceData(actorData);
    //this._prepareDefenseData(actorData);
    //this._prepareAttackData(actorData);
  }

    /**
   * Prepare Non Character type specific data
   */
    _prepareNonCharacterData(actorData) {
      this._prepareAttributesData(actorData);
      //AAA
      //this._prepareDefenseData(actorData);
      //this._prepareAttackData(actorData);
    }
}
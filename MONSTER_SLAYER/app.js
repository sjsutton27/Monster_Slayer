function getRandomValue(min, max) {
  //Generates random number between max and min for the value
  return Math.floor(Math.random() * (max - min)) + min;
}

const app = Vue.createApp({
  data() {
    return {
      playerHealth: 100,
      monsterHealth: 100,
      currentRound: 0,
      playerCriticalAttackChance: 0.1,
      monsterCriticalAttackChance: 0.1,
      winner: null,
      isPoisoned: false,
      poisonRounds: 0,
      logMessages: [],
      monsterImages: [
        "images/Godzilla.jpeg",
        "images/King_Kong.jpg",
        "images/King_Ghidorah.png",
      ],
      playerImages: [
        "images/Archer.jpg",
        "images/Knight.jpg",
        "images/Wizard.jpg",
      ],
      currentMonsterImageIndex: Math.floor(Math.random() * 3),
      currentPlayerImageIndex: Math.floor(Math.random() * 3),
    };
  },

  computed: {
    monsterBarStyles() {
      //Monster Health Bar
      if (this.monsterHealth < 0) {
        return { width: "0%" };
      }
      return { width: this.monsterHealth + "%" };
    },
    playerBarStyles() {
      //Player Health Bar
      if (this.playerHealth < 0) {
        return { width: "0%" };
      }
      return { width: this.playerHealth + "%" };
    },
    mayUseLevelUp() {
      return this.currentRound < 10;
    },
    mayUseHeal() {
      return this.currentRound % 2 !== 0;
    },
    mayUseSpecialAttack() {
      //Every three rounds player may use special attack
      return this.currentRound % 3 !== 0;
    },
    mayUsePoison() {
      return this.currentRound % 5 !== 0;
    },
  },

  watch: {
    playerHealth(value) {
      //Watches Player's Health
      if (value <= 0 && this.monsterHealth <= 0) {
        // A draw
        this.winner = "draw";
      } else if (value <= 0) {
        // Player lost
        this.winner = "monster";
      }
    },
    monsterHealth(value) {
      //Watches Monsters Health
      if (value <= 0 && this.playerHealth <= 0) {
        // A draw
        this.winner = "draw";
      } else if (value <= 0) {
        // Monster lost
        this.winner = "player";
      }
    },
  },

  methods: {
    startGame() {
      //Start a new game after one has been played and resets the features
      this.playerHealth = 100;
      this.monsterHealth = 100;
      this.winner = null;
      this.currentRound = 0;
      this.playerCriticalAttackChance = 0.1;
      this.isPoisoned = false;
      this.poisonRounds = 0;
      this.logMessages = [];
      this.currentMonsterImageIndex = Math.floor(Math.random() * 3);
      this.currentPlayerImageIndex = Math.floor(Math.random() * 3);
    },
    attackMonster() {
      //Damage dealt to monster
      this.currentRound++; //Increment Rounds
      const attackValue = getRandomValue(5, 12);
      //10% chance of critical damage, Math Random choose 0-1
      if (Math.random() < this.monsterCriticalAttackChance) {
        this.monsterHealth -= attackValue * 2;
        //double the damage if critical
        this.addLogMessage("player", "critical attack", attackValue * 2);
      } else {
        this.monsterHealth -= attackValue;
        this.addLogMessage("player", "attack", attackValue);
      }
      //Checks if monstered is poison and poison rounds are not zero or less then zero
      if (this.isPoisoned && this.poisonRounds > 0) {
        this.applyPoisonDamage();
      } else {
        this.isPoisoned = false;
      }
      this.attackPlayer();
    },
    attackPlayer() {
      //Damage dealt to player (Damage 8-15)
      const attackValue = getRandomValue(8, 16);
      //10% chance of critical damage, Math Random choose 0-1
      if (Math.random() < this.criticalAttackChance) {
        this.playerHealth -= attackValue * 2;
        this.addLogMessage("monster", "critical attack", attackValue * 2);
      } else {
        this.playerHealth -= attackValue;
        this.addLogMessage("monster", "attack", attackValue);
      }
    },
    specialAttackMonster() {
      //Special Attack Damage to monster
      this.currentRound++;
      const attackValue = getRandomValue(10, 25);
      //10% chance of critical damage, Math Random choose 0-1
      if (Math.random() < this.playerCriticalAttackChance) {
        this.monsterHealth -= attackValue * 2;
        this.addLogMessage("player", "attack", attackValue * 2);
      } else {
        this.monsterHealth -= attackValue;
        this.addLogMessage("player", "attack", attackValue);
      }
      //Checks if monstered is poison and poison rounds are not zero or less then zero
      if (this.isPoisoned && this.poisonRounds > 0) {
        this.applyPoisonDamage();
      } else {
        this.isPoisoned = false;
      }
      //Monster Attack
      this.attackPlayer();
    },
    healPlayer() {
      //Heals Player
      this.currentRound++;
      const healValue = getRandomValue(8, 20);
      //Checks if players health is 100 or not
      if (this.playerHealth + healValue > 100) {
        this.playerHealth = 100;
      } else {
        this.playerHealth += healValue;
      }
      this.addLogMessage("player", "heal", healValue);
      //Checks if monstered is poison and poison rounds are not zero or less then zero
      if (this.isPoisoned && this.poisonRounds > 0) {
        this.applyPoisonDamage();
      } else {
        this.isPoisoned = false;
      }
      //Monster attacks when player heals
      this.attackPlayer();
    },
    blockAttack() {
      // Blocks some of or all of the monster's attack that round
      this.currentRound++;
      // Monster's attack
      const monsterDamage = this.calculateMonsterAttack();
      // Calculate a random number between 0 and 1
      const randomValue = Math.random();
      // 75% chance of blocking
      const blockProbability = 0.75;
      // 50% chance of reflective Damage
      const reflectChance = 0.5;
      if (randomValue <= blockProbability && randomValue <= reflectChance) {
        // Calculates how much will be blocked and reflected
        // Percentage of block
        const blockValue = Math.max(Math.round(monsterDamage * randomValue), 1);
        const reflectValue = getRandomValue(1, blockValue);
        this.playerHealth -= Math.max(0, monsterDamage - blockValue);
        // Reflect damage to the monster
        this.monsterHealth -= reflectValue;
        this.addLogMessage("monster", "attack", monsterDamage);
        this.addLogMessage("player", "block", blockValue);
        this.addLogMessage("player", "reflect", reflectValue);
      } else if (randomValue <= blockProbability) {
        // Calculates how much will be reflected
        const blockValue = Math.max(Math.round(monsterDamage * randomValue), 1);
        this.playerHealth -= Math.max(0, monsterDamage - blockValue);
        this.addLogMessage("monster", "attack", monsterDamage);
        this.addLogMessage("player", "block", blockValue);
      } else {
        // If block was unsuccessful
        this.playerHealth -= monsterDamage;
        this.addLogMessage("monster", "attack", monsterDamage);
        this.addLogMessage("player", "failed block", 0);
      }
      //Checks if monstered is poison and poison rounds are not zero or less then zero
      if (this.isPoisoned && this.poisonRounds > 0) {
        this.applyPoisonDamage();
      } else {
        this.isPoisoned = false;
      }
    },

    //Method is for blockAttack
    calculateMonsterAttack() {
      // Calculate Monster's attack (Damage 8-16)
      const attackValue = getRandomValue(8, 16);
      // 10% chance of critical damage, Math.random() returns a value between 0 and 1
      if (Math.random() < this.monsterCriticalAttackChance) {
        return attackValue * 2; // double damage if critical
      }
      return attackValue;
    },

    poisonAttack() {
      //Player Poisons Monster for 5 rounds with an attack value 1-5
      this.currentRound++;
      //checks if poisoned or not
      if (!this.isPoisoned) {
        this.isPoisoned = true;
        this.poisonRounds = 5;
        const attackValue = getRandomValue(1, 5);
        this.monsterHealth -= attackValue;
        this.addLogMessage("player", "poison", attackValue);
      }
      //decrements round
      this.poisonRounds--;
      this.attackPlayer();
    },

    applyPoisonDamage() {
      //Applys poison damages while player is choosing other options
      const poisonDamage = getRandomValue(1, 5);
      this.monsterHealth -= poisonDamage;
      this.addLogMessage("player", "poison", poisonDamage);
      this.poisonRounds--;
    },

    levelUp() {
      this.currentRound++;
      //checks for round 10 or higher
      if (this.currentRound >= 10) {
        this.playerCriticalAttackChance *= 2; //doubles the critcial hit chance
        this.playerHealth += 20; //Increases Players health by 20
        this.addLogMessage(
          "player",
          "level up",
          " gained double chance for critical damage, a chance to reuse special and poison, and 20 extra health!",
        );
        this.addLogMessage("player", "heal", 20);
      }
      //Checks if monstered is poison and poison rounds are not zero or less then zero
      if (this.isPoisoned && this.poisonRounds > 0) {
        this.applyPoisonDamage();
      } else {
        this.isPoisoned = false;
      }
      //resets round to zero so a player can continous keep ranking up
      this.currentRound = 0;
      this.attackPlayer();
    },

    surrender() {
      //Game ends, monster wins
      this.winner = "monster";
    },
    addLogMessage(who, what, value) {
      //The battle log is for who did the attack, what was the move, and the value number for the move
      this.logMessages.unshift({
        //Action By Player or Monster
        actionBy: who,
        //Type of Action: Attack, Block, Heal, Poison, Level Up
        actionType: what,
        //Value of the action performed
        actionValue: value,
      });
    },
  },
});

app.mount("#game");

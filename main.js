const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, Movements, goals} = require('mineflayer-pathfinder')
const GoalFollow = goals.GoalFollow
const armorManager = require('mineflayer-armor-manager')
const autoeat = require('mineflayer-auto-eat')
const collectBlock = require('mineflayer-collectblock').plugin

const bot = mineflayer.createBot({
    host: 'TestAternosBOT.aternos.me',
    port: 50356,
    username: 'Bot',
})

bot.loadPlugin(pvp)
bot.loadPlugin(armorManager)
bot.loadPlugin(pathfinder)
bot.loadPlugin(autoeat)
bot.loadPlugin(collectBlock)

bot.on('spawn', () => {
  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 10,
    bannedFood: []
  }
})

bot.on('playerCollect', (collector, itemDrop) => {
  if (collector !== bot.entity) return

  setTimeout(() => {
    const sword = bot.inventory.items().find(item => item.name.includes('sword'))
    if (sword) bot.equip(sword, 'hand')
  }, 150)
})

bot.on('playerCollect', (collector, itemDrop) => {
  if (collector !== bot.entity) return

  setTimeout(() => {
    const shield = bot.inventory.items().find(item => item.name.includes('shield'))
    if (shield) bot.equip(shield, 'off-hand')
  }, 250)
})

let guardPos = null

function guardArea (pos) {
  guardPos = pos.clone()

  if (!bot.pvp.target) {
    moveToGuardPos()
  }
}

function stopGuarding () {
  guardPos = null
  bot.pvp.stop()
  bot.pathfinder.setGoal(null)
}

function moveToGuardPos () {
  const mcData = require('minecraft-data')(bot.version)
  bot.pathfinder.setMovements(new Movements(bot, mcData))
  bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z))
}

bot.on('stoppedAttacking', () => {
  if (guardPos) {
    moveToGuardPos()
  }
})

bot.on('physicTick', () => {
  if (bot.pvp.target) return
  if (bot.pathfinder.isMoving()) return

  const entity = bot.nearestEntity()
  if (entity) bot.lookAt(entity.position.offset(0, entity.height, 0))
})

bot.on('physicTick', () => {
  if (!guardPos) return

  const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 &&
                      e.mobType !== 'Armor Stand' // Mojang classifies armor stands as mobs for some reason?

  const entity = bot.nearestEntity(filter)
  if (entity) {
    bot.pvp.attack(entity)
  }
})

bot.on('chat', (username, message) => {
  if (username === 'Poyarik') {
    const mcData = require('minecraft-data')(bot.version)
    const args = message.split(' ')
    if (args[0] == '????????????'){

    // Get the correct block type
    const blockType = mcData.blocksByName[args[1]]
    if (!blockType) {
      bot.chat("???? ???????? ???????????? ??????????.")
      return
    }

    // Try and find that block type in the world
    const block = bot.findBlock({
      matching: blockType.id,
      maxDistance: 64
    })

    if (!block) {
      bot.chat("???? ???????? ?????????? ????????????????????")
      return
    }

    bot.chat('?????????????? ?????????????? ' + blockType.name)

    // Collect the block if we found one
    bot.collectBlock.collect(block, err => {
      if (err) bot.chat(err.message)
    })
    }

    if (message === '??????????????') {
      const player = bot.players[username]

      if (!player) {
        bot.chat("???? ???????? ???????? ??????????")
        return
      }

      bot.chat('???????? ???????????????? ?????? ??????????????.')
      guardArea(player.entity.position)
    }

    if (message.indexOf('???????? ') !== -1) {
      var replacement = "???????? ",
      toReplace = "",
      str = message

      str = str.replace(replacement, toReplace)
      bot.chat(str)
    }
    if (message.indexOf('???????? ') !== -1) {
      var replacement = "???????? ",
      toReplace = "",
      str = message

      str = str.replace(replacement, toReplace)
      const player = bot.players[str]

      if (!player) {
        bot.chat("???? ???????? ??????????.")
        return
      }

      const goal = new GoalFollow(player.entity, 1)
		  bot.pathfinder.setGoal(goal, true)
      }

    if (message.indexOf('???????????? ') !== -1) {
      var replacement = "???????????? ",
      toReplace = "",
      str = message

      str = str.replace(replacement, toReplace)
      const player = bot.players[str]

      if (!player) {
        bot.chat("???? ???????? ???????? ??????????.")
        return
      }

      bot.chat('?????????????????? ?? ??????????!')
      bot.pvp.attack(player.entity)
      }

      if (message === '????????') {
        bot.chat('???????????? ???? ??????????????.')
        stopGuarding()
      }
      if (message === '????????????') {
        function tossNext() {
          if (bot.inventory.items().length === 0)
            return
          const item = bot.inventory.items()[0]
          bot.tossStack(item, tossNext)
        }
        tossNext()
      }
    }
})
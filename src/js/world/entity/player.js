import { Particle, Popup } from './entities.js'
import { random } from '../../index.js'
import { noise } from '../world.js'

// Player
export class Player {
  constructor(controls, w, h) {
    // Player control - tracks status of button press
    this.controls = controls

    // Player image
    ;(this.imgBiker = null), (this.backdrop = new Image()), (this.img = new Image())
    this.backdrop.src = '/src/resources/etc/highlight_drop.png'
    this.img.src = '/src/resources/biker/biker.png'
    ;(this.canvasW = w), (this.canvasH = h)
    ;(this.w = 30), (this.h = 30)

    // Position
    ;(this.x = w / 2), (this.y = 0)
    this.doingTrick = false
    this.grounded = false
    this.trickCounter = 0
    this.seedX = -1

    // Velocity
    ;(this.xSpeed = 0), (this.ySpeed = 0)
    ;(this.rotation = 0), (this.rotationSpeed = 0)

    // Score popups + debris
    ;(this.popups = new Array()), (this.debris = new Array())

    // Stats
    this.score = 0
    this.gasoline = 125
    this.gameOver = false
    this.traveledDistance = 1

    // Game Objects
    this.cloudSeed = 0
    this.clouds = new Array()
    this.jerryCans = new Array()
  }

  update(ctx, distance) {
    // Calculate player position
    var rearWheel, frontWheel

    if (distance < this.canvasW) {
      rearWheel = this.canvasH * 0.25 //distance >= this.canvasW - 5 ? 100 - (distance - this.canvasW) : 100
      frontWheel = rearWheel
    } else {
      const disMultiplier = distance / 20000

      rearWheel = this.canvasH - noise(distance + 5 + this.x) * (0.25 * Math.max(1, disMultiplier))
      frontWheel = this.seedX
    }

    // Simulate road vibration while accelerating
    if (this.controls.up == 1 && this.controls.left == 0 && this.controls.right == 0)
      frontWheel += Math.round(Math.random()) == 1 ? (Math.random() * 20) / 100 + 0.1 : 0

    // Analayze if player is on ground or in air
    const off = frontWheel - 15

    if (!isNaN(off)) {
      if (off > this.y) {
        this.ySpeed += 0.1
        this.grounded = false
      } else {
        this.ySpeed -= this.y - off
        this.y = off

        this.grounded = true
      }
    }

    // Perform stunt trick or init crash
    var crashed = this.grounded && Math.abs(this.rotation) > Math.PI * 0.5

    if (!crashed) {
      var popSize = this.popups.length

      if (this.doingTrick) {
        if (this.grounded) {
          crashed = true
        } else if (this.controls.trick == 0) {
          ;(this.w = 30), (this.h = 30)
          this.img.src = '/src/resources/biker/biker.png'
          this.doingTrick = false
        } else {
          // Hold trick for points
          if (this.trickCounter < 25) {
            this.trickCounter += 1
          } else {
            // Successfully doing trick
            this.trickCounter = 0
            this.score += 250
            const px = this.x + (Math.round(Math.random()) == 1 ? random(-60, -45) : random(15, 30))
            this.popups[popSize == 0 ? 0 : (popSize += 1)] = new Popup('+250', px, this.y - random(15, 30))
          }
        }
      } else if (!this.grounded) {
        if (this.controls.trick == 1) {
          ;(this.w = 33), (this.h = 33)
          this.img.src = '/src/resources/biker/biker_trick.png'
          this.doingTrick = true
          this.trickCounter = 0
        }
      }
    }

    // Spawn debris
    const accelerating = this.grounded && this.gasoline > 0 && this.controls.up == 1

    if (accelerating && this.debris.length < random(8, 16 * (this.xSpeed + 1))) {
      const debrisToSpawn = random(8, 16)

      for (let spawn = 0; spawn < debrisToSpawn; spawn++) {
        var px = this.x - random(0, 50),
          py = this.y + random(0, 10)
        const rotOff = (this.rotation + 1) * 100

        if (rotOff < 90) {
          // Facing up hill
          py += random(0, 10)
        } else if (rotOff > 100) {
          // Facing down hill
          py -= random(0, 10)
        }

        this.debris.push(new Particle(Math.random() * 1, px, py))
      }
    }

    // Burn gasoline
    if (accelerating && Math.round(distance - this.canvasW) > 0)
      this.gasoline = this.gasoline - 0.75 < 0 ? 0 : this.gasoline - 0.75

    // If game is over, player runs out of gas, player is idling and touching start wall, or has crashed
    const outOfGas = this.gameOver || crashed ? false : this.gasoline < 1 && this.grounded && this.xSpeed < 0.015

    // End game
    if (
      this.gameOver ||
      crashed ||
      outOfGas ||
      distance < -250 ||
      (distance > this.canvasW && distance < this.canvasW + 10 && this.grounded && this.xSpeed < 0.009)
    ) {
      // Reset this.controls

      this.controls.up = 0
      this.controls.down = 0

      if (!this.gameOver) {
        // Game has just ended - show leaderboard and spawn wreckage
        var leaderboard = document.getElementById('leaderboard')
        leaderboard.style.display = 'block'

        if (!outOfGas) {
          // Split rider/bike sprite into 2 for crash animation
          this.img.src = '/src/resources/biker/bike_alacarte.png'

          // Pick random fall image
          this.imgBiker = new Image()
          this.imgBiker.src = '/src/resources/biker/biker_fall_' + Math.round(Math.random()) + '.png'

          // Determine which side to draw player on relavent to rotation
          this.crashOffset = this.rotation > 0.5 ? 10 : -10
        }

        // Set audio to end
        this.controls.audio.currentTime = 112
        this.controls.audio.loop = false

        this.controls.sfx.pause()
      }

      // Declare game is over - player has crashed or gone out of bounds
      this.gameOver = true

      // Rotate and position according to speed
      this.rotationSpeed = this.rotation > 0.5 ? this.xSpeed - this.xSpeed * 2 : this.xSpeed
      this.x -= this.xSpeed * 2.5
    }

    // Calculate player rotation and speed
    var angle = Math.atan2(rearWheel - 15 - this.y, this.x + 5 - this.x)
    this.y += this.ySpeed

    if (this.grounded && !this.gameOver) {
      this.rotation -= (this.rotation - angle) * 0.5
      this.rotationSpeed = this.rotationSpeed - (angle - this.rotation)
    }

    this.rotationSpeed +=
      distance < this.canvasW + 5 && distance > this.canvasW - 5
        ? -0.05
        : (this.controls.left - this.controls.right) * 0.05

    this.rotation -= this.rotationSpeed * 0.1

    var flipped = false
    // Normalize rotation
    if (this.rotation > Math.PI) {
      // Front flip
      this.rotation = -Math.PI
      flipped = true
    }

    if (this.rotation < -Math.PI) {
      // Back flip
      this.rotation = Math.PI
      flipped = true
    }

    if (!this.gameOver && flipped) {
      this.score += 1000
      const px = this.x + (Math.round(Math.random()) == 1 ? random(-60, -45) : random(15, 30))
      this.popups[popSize == 0 ? 0 : popSize + 1] = new Popup('+1000', px, this.y - random(15, 30))
    }

    // Draw to graphics
    if (this.imgBiker != null) {
      // Draw biker in crash
      ctx.save()
      ctx.translate(this.x + this.crashOffset, this.y)

      // Calculate biker rotation randomly
      ctx.rotate(this.rotation)

      ctx.drawImage(this.imgBiker, -15, -15, 20, 20)
      ctx.restore()
    }

    // Draw player
    ctx.save()

    // If player y is above canvas height - show player highlight backdrop
    const flyingHigh = this.score > 0 && this.y < 0

    if (flyingHigh) {
      if (this.doingTrick) {
        if (!this.img.src.includes('biker_trick_highlight.png')) {
          this.img.src = '/src/resources/biker/biker_trick_highlight.png'
        }
      } else {
        if (!this.img.src.includes('biker_highlight.png')) {
          this.img.src = '/src/resources/biker/biker_highlight.png'
        }
      }

      // Draw height text
      ctx.translate(this.x - 30, 0 + 15)
      ctx.drawImage(this.backdrop, 0, 0, 60, 60)

      ctx.fillStyle = 'gray'
      ctx.font = '1.15rem Verdana Bold'
      ctx.fillText(Math.round(this.canvasH - this.y) + 'M', 15, 75)

      ctx.translate(30, 30)

      //TODO
    } else {
      if (!this.doingTrick && !this.img.src.includes('biker.png')) this.img.src = '/src/resources/biker/biker.png'

      ctx.translate(this.x, this.y)
    }

    ctx.rotate(this.rotation + 0.05)
    ctx.drawImage(this.img, -15, -15, this.w, this.h)
    ctx.restore()
  }
}

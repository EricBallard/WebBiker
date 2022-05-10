// Clouds / Jerry Cans / Diagrams
export class GameObject {
  constructor(cloud, img, speed, x, y, w, h) {
    this.img = img
    this.cloud = cloud
    this.speed = speed
    ;(this.x = x), (this.y = y)
    ;(this.w = w), (this.h = h)
  }
}

// Pop up - info text / trick score
export class Popup {
  constructor(text, x, y) {
    ;(this.text = text), (this.x = x), (this.y = y)
  }
}

// Debris object spawned at end of bike
export class Particle {
  constructor(size, x, y) {
    ;(this.size = size), (this.x = x), (this.y = y)
  }
}

export class Position {
  constructor(x, y) {
    ;(this.x = x), (this.y = y)
  }
}

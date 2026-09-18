/** Port of standalone face/renderer.js — same mouth control points and idle life. */

export type FaceRenderState = {
  mode: string
  activity: string
  expression: string
  audioLevel?: number | null
}

const POSES: Record<string, number[]> = {
  happy: [23, 23, 224, 315, 291, 0, 0],
  excited: [29, 29, 218, 348, 265, 0, 0],
  curious: [25, 16, 240, 279, 266, 1, -9],
  annoyed: [10, 10, 265, 235, 245, 1, 12],
  surprised: [29, 29, 247, 311, 215, 0, 0],
  neutral: [22, 22, 252, 254, 252, 0, 0],
  focused: [15, 15, 252, 254, 252, 0, 0],
  sleepy: [2, 2, 252, 261, 256, 0, 0],
  smug: [14, 18, 236, 268, 248, 1, 8],
  angry: [8, 8, 270, 230, 238, 1, 16],
  confused: [20, 14, 248, 270, 258, 1, -14],
  thinking: [18, 22, 250, 262, 255, 1, -6],
  tired: [8, 8, 255, 250, 248, 0, 4],
}

type FaceNodes = {
  head: SVGElement
  features: SVGGElement
  leftEye: SVGEllipseElement
  rightEye: SVGEllipseElement
  leftBrow: SVGElement
  rightBrow: SVGElement
  mouth: SVGPathElement
  corners: SVGElement
}

export class FaceRenderer {
  private pose = [...POSES.happy]
  private sleep = 0
  private x = 0
  private y = 0
  private targetX = 0
  private targetY = 0
  private nextBlink = 1500 + Math.random() * 2000
  private blinkStart = -1000
  private nextLook = 1800
  private last = 0

  constructor(private nodes: FaceNodes) {}

  render(now: number, state: FaceRenderState, reduced = false) {
    const dt = Math.min(100, Math.max(0, now - this.last))
    this.last = now
    const activity = state.activity || 'idle'
    const sleeping = state.mode === 'SLEEP' && activity === 'idle'
    const smooth = reduced ? 1 : 1 - Math.exp(-dt / 150)
    if (now >= this.nextBlink) {
      this.blinkStart = now
      this.nextBlink = now + 2600 + Math.random() * 4500
    }
    if (now >= this.nextLook) {
      this.targetX = (Math.random() - 0.5) * 13
      this.targetY = (Math.random() - 0.5) * 7
      this.nextLook = now + 1800 + Math.random() * 3200
    }
    const active = !sleeping && state.mode !== 'WORK' && activity === 'idle' && !reduced
    this.x += ((active ? this.targetX : 0) - this.x) * smooth
    this.y += ((active ? this.targetY : 0) - this.y) * smooth
    this.sleep += ((sleeping ? 1 : 0) - this.sleep) * (reduced ? 1 : 1 - Math.exp(-dt / 450))
    const poseName =
      activity === 'listening'
        ? 'surprised'
        : activity === 'thinking'
          ? 'thinking'
          : activity === 'speaking'
            ? state.expression || 'happy'
            : state.expression
    const target = POSES[poseName] || POSES.happy
    this.pose = this.pose.map((value, index) => value + (target[index]! - value) * smooth)
    let [left, right, mouthY, outer, inner, brow, tilt] = this.pose
    if (activity === 'speaking') {
      const amount = reduced
        ? 0.45
        : (state.audioLevel ?? 0.18 + 0.82 * Math.abs(Math.sin(now / 93) * Math.cos(now / 167)))
      mouthY = 245
      outer = 260 + amount * 70
      inner = 250 - amount * 24
    }
    const elapsed = now - this.blinkStart
    const blink =
      !sleeping && !reduced && elapsed >= 0 && elapsed < 180 ? 1 - 0.94 * Math.sin((Math.PI * elapsed) / 180) : 1
    this.nodes.leftEye.setAttribute('ry', String(Math.max(1.5, left * blink)))
    this.nodes.rightEye.setAttribute('ry', String(Math.max(1.5, right * blink)))
    this.nodes.features.setAttribute('transform', `translate(${this.x} ${this.y})`)
    this.nodes.head.setAttribute('opacity', String(1 - this.sleep * 0.68))
    const breath = reduced ? 0 : Math.sin(now / (sleeping ? 1500 : 2200)) * (sleeping ? 1.4 : 0.55)
    this.nodes.head.setAttribute('transform', `translate(0 ${breath + this.sleep * 5}) rotate(${this.sleep * 5} 200 200)`)
    this.nodes.mouth.setAttribute(
      'd',
      `M82 ${mouthY} C140 ${outer} 260 ${outer} 318 ${mouthY} C264 ${inner} 136 ${inner} 82 ${mouthY}`,
    )
    this.nodes.corners.setAttribute('opacity', String(Math.max(0, 1 - Math.abs(mouthY - 224) / 14)))
    this.nodes.leftBrow.setAttribute('opacity', String(brow))
    this.nodes.rightBrow.setAttribute('opacity', String(brow))
    this.nodes.leftBrow.setAttribute('transform', `rotate(${tilt} 149 129)`)
    this.nodes.rightBrow.setAttribute('transform', `rotate(${-tilt} 251 129)`)
  }
}

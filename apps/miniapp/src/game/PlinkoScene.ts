import Phaser from 'phaser';

export type PlinkoDropResult = {
  slot: number;
  multiplier: number;
  bet: number;
  win: number;
};

export type PlinkoSceneEvents = {
  onDropStarted: (bet: number) => void;
  onDropFinished: (result: PlinkoDropResult) => void;
  onPegHit: () => void;
};

const MULTIPLIERS = [10, 3, 0.5, 0.5, 3, 10] as const;

type PegView = {
  x: number;
  y: number;
  r: number;
  hit: number;
  body: MatterJS.BodyType;
};

type BallState = {
  body: MatterJS.BodyType;
  radius: number;
  bet: number;
  trail: Phaser.Math.Vector2[];
  startedAt: number;
  done: boolean;
};

export class PlinkoScene extends Phaser.Scene {
  private callbacks: PlinkoSceneEvents;
  private boardWidth = 360;
  private boardHeight = 430;
  private pegs: PegView[] = [];
  private sparks: Array<{ x: number; y: number; vx: number; vy: number; life: number; r: number }> = [];
  private ball: BallState | null = null;
  private active = false;
  private slotLeft = 16;
  private slotWidth = 56;
  private graphics!: Phaser.GameObjects.Graphics;
  private trailGraphics!: Phaser.GameObjects.Graphics;
  private machineGraphics!: Phaser.GameObjects.Graphics;

  constructor(callbacks: PlinkoSceneEvents) {
    super('PlinkoScene');
    this.callbacks = callbacks;
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.trailGraphics = this.add.graphics();
    this.machineGraphics = this.add.graphics();
    this.matter.world.engine.gravity.y = 1.08;
    this.matter.world.set60Hz();
    this.rebuildMachine();
    this.scale.on('resize', () => this.rebuildMachine());
  }

  drop(bet: number): boolean {
    if (this.active || this.ball) return false;
    this.active = true;
    this.callbacks.onDropStarted(bet);

    const x = this.boardWidth / 2 + Phaser.Math.Between(-12, 12);
    const ball = this.matter.add.circle(x, 49, 9, {
      label: 'ball',
      restitution: 0.73,
      friction: 0.004,
      frictionAir: 0.0028,
      density: 0.0022,
    });

    this.matter.body.setVelocity(ball, {
      x: Phaser.Math.FloatBetween(-1.8, 1.8),
      y: Phaser.Math.FloatBetween(1.0, 1.55),
    });
    this.matter.body.setAngularVelocity(ball, Phaser.Math.FloatBetween(-0.12, 0.12));

    this.ball = {
      body: ball,
      radius: 9,
      bet,
      trail: [],
      startedAt: performance.now(),
      done: false,
    };
    return true;
  }

  update(): void {
    this.drawScene();
    this.checkTimeoutFinish();
  }

  private rebuildMachine(): void {
    this.boardWidth = Math.max(300, this.scale.width);
    this.boardHeight = Math.max(330, this.scale.height);
    this.pegs = [];
    this.matter.world.localWorld.bodies.slice().forEach((body) => this.matter.world.remove(body));
    this.matter.world.setBounds(22, 36, this.boardWidth - 44, this.boardHeight - 54, 28, true, true, false, true);

    const rows = 10;
    const top = 70;
    const bottom = this.boardHeight - 112;
    const rowGap = (bottom - top) / (rows - 1);
    const maxWidth = this.boardWidth * 0.78;

    for (let row = 0; row < rows; row += 1) {
      const count = row + 3;
      const gap = Math.min(32, maxWidth / (count - 1));
      const y = top + row * rowGap;
      const start = this.boardWidth / 2 - ((count - 1) * gap) / 2;
      for (let i = 0; i < count; i += 1) {
        const x = start + i * gap;
        const body = this.matter.add.circle(x, y, 5.25, {
          isStatic: true,
          label: `peg:${row}:${i}`,
          restitution: 0.92,
          friction: 0.01,
        });
        this.pegs.push({ x, y, r: 5.25, body, hit: 0 });
      }
    }

    this.matter.add.rectangle(26, this.boardHeight * 0.52, 10, this.boardHeight * 0.78, {
      isStatic: true,
      angle: -0.075,
      label: 'rail:left',
      restitution: 0.7,
      friction: 0.01,
    });
    this.matter.add.rectangle(this.boardWidth - 26, this.boardHeight * 0.52, 10, this.boardHeight * 0.78, {
      isStatic: true,
      angle: 0.075,
      label: 'rail:right',
      restitution: 0.7,
      friction: 0.01,
    });

    this.slotLeft = 14;
    this.slotWidth = (this.boardWidth - 28) / 6;
    const slotTop = this.boardHeight - 72;
    for (let divider = 1; divider < 6; divider += 1) {
      this.matter.add.rectangle(this.slotLeft + divider * this.slotWidth, slotTop + 24, 5, 54, {
        isStatic: true,
        label: 'slot-divider',
        restitution: 0.35,
        friction: 0.03,
      });
    }
    for (let slot = 0; slot < 6; slot += 1) {
      const sensor = this.matter.add.rectangle(this.slotLeft + slot * this.slotWidth + this.slotWidth / 2, this.boardHeight - 30, this.slotWidth - 6, 20, {
        isStatic: true,
        isSensor: true,
        label: `slot:${slot}`,
      });
      (sensor as MatterJS.BodyType & { slot?: number }).slot = slot;
    }

    this.matter.world.off('collisionstart');
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      for (const pair of event.pairs) {
        const a = pair.bodyA;
        const b = pair.bodyB;
        const ball = a.label === 'ball' ? a : b.label === 'ball' ? b : null;
        const other = ball === a ? b : a;
        if (!ball) continue;

        if (other.label.startsWith('peg:')) {
          const peg = this.pegs.find((item) => item.body === other);
          if (peg) peg.hit = 9;
          this.spawnSpark(ball.position.x, ball.position.y, 0.6);
          this.callbacks.onPegHit();
        }

        const slot = (other as MatterJS.BodyType & { slot?: number }).slot;
        if (other.isSensor && typeof slot === 'number') {
          this.finish(slot);
        }
      }
    });
  }

  private finish(slot: number): void {
    if (!this.ball || this.ball.done) return;
    this.ball.done = true;
    const multiplier = MULTIPLIERS[slot] ?? 0.5;
    const win = Math.round(this.ball.bet * multiplier);
    const body = this.ball.body;
    this.spawnSpark(this.slotLeft + slot * this.slotWidth + this.slotWidth / 2, this.boardHeight - 45, multiplier >= 10 ? 1.9 : 1.0);
    this.matter.world.remove(body);
    const result = { slot, multiplier, bet: this.ball.bet, win };
    this.ball = null;
    this.active = false;
    this.callbacks.onDropFinished(result);
  }

  private checkTimeoutFinish(): void {
    if (!this.ball || this.ball.done) return;
    const pos = this.ball.body.position;
    if (performance.now() - this.ball.startedAt > 7600 || pos.y > this.boardHeight - 26) {
      const slot = Phaser.Math.Clamp(Math.floor((pos.x - this.slotLeft) / (this.boardWidth - 28) * 6), 0, 5);
      this.finish(slot);
    }
  }

  private drawScene(): void {
    const g = this.graphics;
    const trail = this.trailGraphics;
    const machine = this.machineGraphics;
    g.clear();
    trail.clear();
    machine.clear();

    this.drawMachine(machine);
    for (const peg of this.pegs) {
      if (peg.hit > 0) peg.hit -= 1;
      if (peg.hit > 0) {
        g.fillStyle(0xffffff, 0.085);
        g.fillCircle(peg.x, peg.y, 18);
      }
      g.fillStyle(0xffffff, peg.hit > 0 ? 0.95 : 0.66);
      g.fillCircle(peg.x, peg.y, peg.r + (peg.hit > 0 ? 1.4 : 0));
      g.lineStyle(1, 0xffffff, 0.28);
      g.strokeCircle(peg.x, peg.y, peg.r + (peg.hit > 0 ? 1.4 : 0));
    }

    for (let i = this.sparks.length - 1; i >= 0; i -= 1) {
      const spark = this.sparks[i];
      spark.life -= 1;
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.05;
      g.fillStyle(0xffffff, Math.max(0, spark.life / 38));
      g.fillCircle(spark.x, spark.y, spark.r);
      if (spark.life <= 0) this.sparks.splice(i, 1);
    }

    if (this.ball && !this.ball.done) {
      const pos = this.ball.body.position;
      this.ball.trail.push(new Phaser.Math.Vector2(pos.x, pos.y));
      if (this.ball.trail.length > 17) this.ball.trail.shift();
      this.ball.trail.forEach((point, index) => {
        trail.fillStyle(0xffffff, ((index + 1) / this.ball!.trail.length) * 0.055);
        trail.fillCircle(point.x, point.y, 25);
      });
      g.fillStyle(0xffffff, 0.12);
      g.fillCircle(pos.x, pos.y, 32);
      g.fillStyle(0xffffff, 0.96);
      g.fillCircle(pos.x, pos.y, this.ball.radius);
      g.lineStyle(1, 0xffffff, 0.75);
      g.strokeCircle(pos.x, pos.y, this.ball.radius);
    }
  }

  private drawMachine(g: Phaser.GameObjects.Graphics): void {
    g.lineStyle(1, 0xffffff, 0.045);
    for (let y = 50; y < this.boardHeight - 90; y += 28) {
      g.lineBetween(24, y, this.boardWidth - 24, y);
    }

    g.lineStyle(4, 0xffffff, 0.17);
    g.beginPath();
    g.moveTo(32, 60);
    g.quadraticCurveTo(20, this.boardHeight * 0.5, 36, this.boardHeight - 90);
    g.strokePath();
    g.beginPath();
    g.moveTo(this.boardWidth - 32, 60);
    g.quadraticCurveTo(this.boardWidth - 20, this.boardHeight * 0.5, this.boardWidth - 36, this.boardHeight - 90);
    g.strokePath();

    g.lineStyle(1, 0xffffff, 0.13);
    for (let i = 0; i <= 6; i += 1) {
      const x = this.slotLeft + i * this.slotWidth;
      g.lineBetween(x, this.boardHeight - 72, x, this.boardHeight - 16);
    }
  }

  private spawnSpark(x: number, y: number, power: number): void {
    const count = Math.round(8 * power);
    for (let i = 0; i < count; i += 1) {
      this.sparks.push({
        x,
        y,
        vx: Phaser.Math.FloatBetween(-1.6, 1.6) * power,
        vy: Phaser.Math.FloatBetween(-2.3, 0.4) * power,
        life: Phaser.Math.Between(18, 38),
        r: Phaser.Math.FloatBetween(1, 2.2),
      });
    }
  }
}

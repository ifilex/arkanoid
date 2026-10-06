import {
  Ball,
  Brick,
  CoinPickup,
  EnemyDrone,
  GameStateStatus,
  LaserBolt,
  Paddle,
  PowerUpPill,
  PowerUpType,
  WarpGate,
} from './types';
import {
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  WALL_THICKNESS,
  buildBricksForRound,
} from './levels';
import { retroAudio } from './audio';
import { ParticleSystem } from './particles';
import { BALL_SKINS, THEME_SCENARIOS, VAUS_SKINS } from './shopData';

export interface GameEngineCallbacks {
  onScoreChange: (score: number) => void;
  onCoinsChange: (coins: number) => void;
  onLivesChange: (lives: number) => void;
  onRoundChange: (round: number) => void;
  onStatusChange: (status: GameStateStatus) => void;
  onActivePowerUp: (type: PowerUpType | null) => void;
}

export class GameEngine {
  public particles = new ParticleSystem();

  // Core state
  public status: GameStateStatus = 'menu';
  public score = 0;
  public highScore = 0;
  public coins = 0;
  public lives = 3;
  public round = 1;
  public activePowerUp: PowerUpType | null = null;

  // Customization
  public selectedVausSkin = 'vaus_classic';
  public selectedBallSkin = 'ball_energy';
  public selectedTheme = 'theme_arcade';
  public isDarkMode = true;

  // Entities
  public paddle: Paddle;
  public balls: Ball[] = [];
  public bricks: Brick[] = [];
  public powerUps: PowerUpPill[] = [];
  public lasers: LaserBolt[] = [];
  public coinsDrops: CoinPickup[] = [];
  public enemies: EnemyDrone[] = [];
  public warpGate: WarpGate;

  // Controls input
  public paddleTargetX: number = PLAYFIELD_WIDTH / 2;
  public isLaserKeyDown = false;
  private keyLeft = false;
  private keyRight = false;
  private keyFire = false;

  // Timers & spawner
  private enemySpawnTimer = 14;
  private roundStartTimer = 0;
  private callbacks: GameEngineCallbacks;

  constructor(callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    this.paddle = {
      x: PLAYFIELD_WIDTH / 2,
      y: 530,
      width: 64,
      height: 14,
      speed: 380,
      skinId: 'vaus_classic',
      hasLaser: false,
      hasCatch: false,
      isExpanded: false,
      laserCooldown: 0,
    };
    this.warpGate = {
      isOpen: false,
      x: PLAYFIELD_WIDTH - WALL_THICKNESS,
      y: 470,
      width: WALL_THICKNESS,
      height: 60,
      pulseTime: 0,
    };
  }

  public initGame(initialCoins = 0, initialHighScore = 0) {
    this.score = 0;
    this.coins = initialCoins;
    this.highScore = initialHighScore;
    this.lives = 3;
    this.round = 1;
    this.activePowerUp = null;
    this.callbacks.onScoreChange(this.score);
    this.callbacks.onCoinsChange(this.coins);
    this.callbacks.onLivesChange(this.lives);
    this.callbacks.onRoundChange(this.round);
    this.callbacks.onActivePowerUp(null);

    this.startRound(this.round);
  }

  public startRound(roundNum: number) {
    this.round = roundNum;
    this.activePowerUp = null;
    this.callbacks.onRoundChange(this.round);
    this.callbacks.onActivePowerUp(null);

    this.resetPaddle();
    this.bricks = buildBricksForRound(this.round);
    this.powerUps = [];
    this.lasers = [];
    this.coinsDrops = [];
    this.enemies = [];
    this.warpGate.isOpen = false;
    this.enemySpawnTimer = 16;
    this.roundStartTimer = 2.2; // "READY" announcement delay

    this.status = 'ready';
    this.callbacks.onStatusChange(this.status);

    retroAudio.playRoundStart();
    this.resetBall(true);
  }

  public resetPaddle() {
    this.paddle.x = PLAYFIELD_WIDTH / 2;
    this.paddle.width = 64;
    this.paddle.hasLaser = false;
    this.paddle.hasCatch = false;
    this.paddle.isExpanded = false;
    this.paddle.laserCooldown = 0;
    this.paddleTargetX = PLAYFIELD_WIDTH / 2;
  }

  public resetBall(attached = true) {
    this.balls = [
      {
        id: 'ball-main',
        x: this.paddle.x,
        y: this.paddle.y - 10,
        vx: 180,
        vy: -260,
        radius: 5,
        speed: 290 + Math.min(100, (this.round - 1) * 15),
        attachedToPaddle: attached,
        attachOffsetX: 0,
      },
    ];
  }

  public launchAttachedBall() {
    let launched = false;
    for (const b of this.balls) {
      if (b.attachedToPaddle) {
        b.attachedToPaddle = false;
        // Launch angle based on current offset
        const normOffset = b.attachOffsetX / (this.paddle.width / 2);
        const angle = Math.max(-0.85, Math.min(0.85, normOffset)) * (Math.PI / 3);
        b.vx = b.speed * Math.sin(angle);
        b.vy = -Math.abs(b.speed * Math.cos(angle));
        launched = true;
      }
    }
    if (launched) {
      retroAudio.playPaddleBounce();
    }
  }

  public fireLaser() {
    if (!this.paddle.hasLaser || this.paddle.laserCooldown > 0) return;
    if (this.status !== 'playing') return;

    const leftCannonX = this.paddle.x - this.paddle.width / 2 + 4;
    const rightCannonX = this.paddle.x + this.paddle.width / 2 - 4;
    const canonY = this.paddle.y - 2;

    this.lasers.push(
      {
        id: Math.random().toString(36).slice(2),
        x: leftCannonX,
        y: canonY,
        vy: -480,
        width: 3,
        height: 12,
      },
      {
        id: Math.random().toString(36).slice(2),
        x: rightCannonX,
        y: canonY,
        vy: -480,
        width: 3,
        height: 12,
      }
    );

    this.paddle.laserCooldown = 0.22;
    retroAudio.playLaserFire();
    this.particles.emitSparks(leftCannonX, canonY, '#ef4444', 4);
    this.particles.emitSparks(rightCannonX, canonY, '#ef4444', 4);
  }

  // Input bindings
  public handleKeyDown(code: string) {
    if (code === 'ArrowLeft' || code === 'KeyA') this.keyLeft = true;
    if (code === 'ArrowRight' || code === 'KeyD') this.keyRight = true;
    if (code === 'Space' || code === 'KeyZ' || code === 'ArrowUp') {
      this.keyFire = true;
      this.handleActionTrigger();
    }
  }

  public handleKeyUp(code: string) {
    if (code === 'ArrowLeft' || code === 'KeyA') this.keyLeft = false;
    if (code === 'ArrowRight' || code === 'KeyD') this.keyRight = false;
    if (code === 'Space' || code === 'KeyZ' || code === 'ArrowUp') this.keyFire = false;
  }

  public handleActionTrigger() {
    if (this.status === 'ready') {
      this.status = 'playing';
      this.callbacks.onStatusChange(this.status);
      this.launchAttachedBall();
      return;
    }
    if (this.status === 'playing') {
      const hasAttached = this.balls.some(b => b.attachedToPaddle);
      if (hasAttached) {
        this.launchAttachedBall();
      } else if (this.paddle.hasLaser) {
        this.fireLaser();
      }
    }
  }

  public setPaddleTargetFromRatio(ratio: number) {
    const minX = WALL_THICKNESS + this.paddle.width / 2;
    const maxX = PLAYFIELD_WIDTH - WALL_THICKNESS - this.paddle.width / 2;
    this.paddleTargetX = minX + ratio * (maxX - minX);
  }

  public movePaddleDelta(delta: number) {
    const minX = WALL_THICKNESS + this.paddle.width / 2;
    const maxX = PLAYFIELD_WIDTH - WALL_THICKNESS - this.paddle.width / 2;
    this.paddleTargetX = Math.max(minX, Math.min(maxX, this.paddleTargetX + delta));
  }

  // Update cycle
  public update(dt: number) {
    this.particles.update(dt);

    if (this.status === 'ready') {
      this.roundStartTimer -= dt;
      if (this.roundStartTimer <= 0) {
        this.status = 'playing';
        this.callbacks.onStatusChange(this.status);
        this.launchAttachedBall();
      }
    }

    if (this.status !== 'playing' && this.status !== 'ready') {
      return;
    }

    // Keyboard movement
    if (this.keyLeft) {
      this.movePaddleDelta(-this.paddle.speed * dt);
    }
    if (this.keyRight) {
      this.movePaddleDelta(this.paddle.speed * dt);
    }
    if (this.keyFire && this.paddle.hasLaser) {
      this.fireLaser();
    }

    // Direct paddle positioning from mouse / smooth interpolation
    const minX = WALL_THICKNESS + this.paddle.width / 2;
    const maxX = PLAYFIELD_WIDTH - WALL_THICKNESS - this.paddle.width / 2;
    this.paddleTargetX = Math.max(minX, Math.min(maxX, this.paddleTargetX));
    // High responsiveness: immediate follow for crisp mouse feel, smoothed for keys
    const lerpSpeed = (this.keyLeft || this.keyRight) ? Math.min(1, dt * 25) : Math.min(1, dt * 60);
    this.paddle.x += (this.paddleTargetX - this.paddle.x) * lerpSpeed;

    if (this.paddle.laserCooldown > 0) {
      this.paddle.laserCooldown = Math.max(0, this.paddle.laserCooldown - dt);
    }

    // Warp Gate effect
    if (this.warpGate.isOpen) {
      this.warpGate.pulseTime += dt;
      this.particles.emitWarpVortex(this.warpGate.x, this.warpGate.y, this.warpGate.width, this.warpGate.height);

      // Check if paddle entered warp gate
      if (this.paddle.x + this.paddle.width / 2 >= PLAYFIELD_WIDTH - WALL_THICKNESS) {
        this.warpToNextRound();
        return;
      }
    }

    // Update Balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];

      if (ball.attachedToPaddle) {
        ball.x = this.paddle.x + ball.attachOffsetX;
        ball.y = this.paddle.y - ball.radius - 1;
        continue;
      }

      // Ball trail particles
      const ballSkin = BALL_SKINS.find(s => s.id === this.selectedBallSkin) || BALL_SKINS[0];
      this.particles.emitTrail(ball.x, ball.y, ballSkin.trailColor, ballSkin.trailType);

      // Movement
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Left Wall collision
      if (ball.x - ball.radius <= WALL_THICKNESS) {
        ball.x = WALL_THICKNESS + ball.radius;
        ball.vx = Math.abs(ball.vx);
        retroAudio.playWallBounce();
        this.particles.emitSparks(ball.x, ball.y, '#93c5fd', 4);
      }

      // Right Wall collision (check if warp gate is open)
      if (ball.x + ball.radius >= PLAYFIELD_WIDTH - WALL_THICKNESS) {
        if (
          this.warpGate.isOpen &&
          ball.y >= this.warpGate.y &&
          ball.y <= this.warpGate.y + this.warpGate.height
        ) {
          // Ball went through warp gate!
          this.warpToNextRound();
          return;
        }
        ball.x = PLAYFIELD_WIDTH - WALL_THICKNESS - ball.radius;
        ball.vx = -Math.abs(ball.vx);
        retroAudio.playWallBounce();
        this.particles.emitSparks(ball.x, ball.y, '#93c5fd', 4);
      }

      // Top Wall collision
      if (ball.y - ball.radius <= WALL_THICKNESS) {
        ball.y = WALL_THICKNESS + ball.radius;
        ball.vy = Math.abs(ball.vy);
        retroAudio.playWallBounce();
        this.particles.emitSparks(ball.x, ball.y, '#93c5fd', 4);
      }

      // Paddle Collision
      const paddleTop = this.paddle.y - this.paddle.height / 2;
      const paddleBottom = this.paddle.y + this.paddle.height / 2;
      const paddleLeft = this.paddle.x - this.paddle.width / 2;
      const paddleRight = this.paddle.x + this.paddle.width / 2;

      if (
        ball.vy > 0 &&
        ball.y + ball.radius >= paddleTop &&
        ball.y - ball.radius <= paddleBottom &&
        ball.x + ball.radius >= paddleLeft &&
        ball.x - ball.radius <= paddleRight
      ) {
        if (this.paddle.hasCatch) {
          ball.attachedToPaddle = true;
          ball.attachOffsetX = ball.x - this.paddle.x;
          retroAudio.playPaddleBounce();
        } else {
          // Classic Arkanoid variable angle reflection
          const hitOffset = (ball.x - this.paddle.x) / (this.paddle.width / 2);
          const clampedOffset = Math.max(-0.95, Math.min(0.95, hitOffset));
          const maxAngle = Math.PI / 2.7; // ~66 degrees
          const angle = clampedOffset * maxAngle;

          ball.speed = Math.min(480, ball.speed + 2.5); // gradual speed acceleration
          ball.vx = ball.speed * Math.sin(angle);
          ball.vy = -Math.abs(ball.speed * Math.cos(angle));
          ball.y = paddleTop - ball.radius;

          retroAudio.playPaddleBounce();
          this.particles.emitSparks(ball.x, ball.y, '#ffffff', 8);
        }
      }

      // Brick Collisions
      this.checkBallBrickCollisions(ball);

      // Bottom death
      if (ball.y - ball.radius > PLAYFIELD_HEIGHT) {
        this.balls.splice(i, 1);
      }
    }

    // Check if all balls were lost
    if (this.balls.length === 0 && this.status === 'playing') {
      this.handleLifeLost();
      return;
    }

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.y += laser.vy * dt;

      // Laser vs top wall
      if (laser.y <= WALL_THICKNESS) {
        this.particles.emitLaserImpact(laser.x, laser.y);
        this.lasers.splice(i, 1);
        continue;
      }

      // Laser vs bricks
      let laserHit = false;
      for (const brick of this.bricks) {
        if (
          laser.x >= brick.x &&
          laser.x <= brick.x + brick.width &&
          laser.y >= brick.y &&
          laser.y <= brick.y + brick.height
        ) {
          laserHit = true;
          this.particles.emitLaserImpact(laser.x, laser.y);
          this.damageBrick(brick, true);
          break;
        }
      }
      if (laserHit) {
        this.lasers.splice(i, 1);
        continue;
      }

      // Laser vs enemies
      for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
        const en = this.enemies[eIdx];
        if (
          Math.abs(laser.x - en.x) < en.width / 2 + laser.width &&
          Math.abs(laser.y - en.y) < en.height / 2 + laser.height
        ) {
          this.enemies.splice(eIdx, 1);
          this.lasers.splice(i, 1);
          this.addScore(100);
          retroAudio.playBrickHit(1.5);
          this.particles.emitBrickBreak(en.x - 10, en.y - 10, 20, 20, '#a855f7');
          break;
        }
      }
    }

    // Update PowerUps
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pill = this.powerUps[i];
      pill.y += pill.vy * dt;

      // Check collision with paddle
      const paddleTop = this.paddle.y - this.paddle.height / 2;
      const paddleBottom = this.paddle.y + this.paddle.height / 2;
      const paddleLeft = this.paddle.x - this.paddle.width / 2;
      const paddleRight = this.paddle.x + this.paddle.width / 2;

      if (
        pill.y + pill.height / 2 >= paddleTop &&
        pill.y - pill.height / 2 <= paddleBottom &&
        pill.x + pill.width / 2 >= paddleLeft &&
        pill.x - pill.width / 2 <= paddleRight
      ) {
        this.applyPowerUp(pill.type);
        this.particles.emitSparks(pill.x, pill.y, pill.color, 14);
        this.particles.addFloatingText(pill.x, pill.y - 15, pill.label, pill.color, 9);
        this.powerUps.splice(i, 1);
        continue;
      }

      // Offscreen
      if (pill.y > PLAYFIELD_HEIGHT + 20) {
        this.powerUps.splice(i, 1);
      }
    }

    // Update Coins
    for (let i = this.coinsDrops.length - 1; i >= 0; i--) {
      const coin = this.coinsDrops[i];
      coin.y += coin.vy * dt;
      coin.rotation += dt * 4;

      // Check paddle collection
      const paddleTop = this.paddle.y - this.paddle.height / 2;
      const paddleBottom = this.paddle.y + this.paddle.height / 2;
      const paddleLeft = this.paddle.x - this.paddle.width / 2;
      const paddleRight = this.paddle.x + this.paddle.width / 2;

      if (
        coin.y + coin.radius >= paddleTop &&
        coin.y - coin.radius <= paddleBottom &&
        coin.x + coin.radius >= paddleLeft &&
        coin.x - coin.radius <= paddleRight
      ) {
        this.coins += coin.value;
        this.callbacks.onCoinsChange(this.coins);
        retroAudio.playCoinCollect();
        this.particles.emitCoinBurst(coin.x, coin.y, coin.value);
        this.coinsDrops.splice(i, 1);
        continue;
      }

      if (coin.y > PLAYFIELD_HEIGHT + 20) {
        this.coinsDrops.splice(i, 1);
      }
    }

    // Update Enemies
    this.enemySpawnTimer -= dt;
    if (this.enemySpawnTimer <= 0 && this.enemies.length < 3) {
      this.spawnEnemy();
      this.enemySpawnTimer = 15 + Math.random() * 8;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      en.time += dt;
      en.y += en.vy * dt;
      en.x += Math.sin(en.time * 2.5) * 45 * dt;

      // Bounce off walls
      if (en.x - en.width / 2 <= WALL_THICKNESS) {
        en.x = WALL_THICKNESS + en.width / 2;
      } else if (en.x + en.width / 2 >= PLAYFIELD_WIDTH - WALL_THICKNESS) {
        en.x = PLAYFIELD_WIDTH - WALL_THICKNESS - en.width / 2;
      }

      // Collide with paddle (destroys paddle!)
      const paddleTop = this.paddle.y - this.paddle.height / 2;
      const paddleLeft = this.paddle.x - this.paddle.width / 2;
      const paddleRight = this.paddle.x + this.paddle.width / 2;

      if (
        en.y + en.height / 2 >= paddleTop &&
        en.x >= paddleLeft &&
        en.x <= paddleRight
      ) {
        this.particles.emitBrickBreak(this.paddle.x - 30, this.paddle.y - 10, 60, 20, '#ef4444');
        this.enemies.splice(i, 1);
        this.handleLifeLost();
        return;
      }

      // Offscreen
      if (en.y > PLAYFIELD_HEIGHT + 40) {
        this.enemies.splice(i, 1);
      }
    }

    // Check if stage is cleared (all non-indestructible bricks destroyed)
    const remainingDestructible = this.bricks.filter(b => !b.indestructible);
    if (remainingDestructible.length === 0) {
      this.handleRoundCleared();
    }
  }

  private checkBallBrickCollisions(ball: Ball) {
    for (const brick of this.bricks) {
      // Find closest point on brick to ball center
      const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
      const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));

      const dx = ball.x - closestX;
      const dy = ball.y - closestY;
      const distSq = dx * dx + dy * dy;

      if (distSq < ball.radius * ball.radius) {
        // Collision detected! Determine impact normal
        const overlapLeft = Math.abs(ball.x - brick.x);
        const overlapRight = Math.abs(ball.x - (brick.x + brick.width));
        const overlapTop = Math.abs(ball.y - brick.y);
        const overlapBottom = Math.abs(ball.y - (brick.y + brick.height));

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          ball.vx = -ball.vx;
          ball.x = minOverlap === overlapLeft ? brick.x - ball.radius : brick.x + brick.width + ball.radius;
        } else {
          ball.vy = -ball.vy;
          ball.y = minOverlap === overlapTop ? brick.y - ball.radius : brick.y + brick.height + ball.radius;
        }

        this.damageBrick(brick, false);
        break; // Process one collision per frame for ball stability
      }
    }
  }

  private damageBrick(brick: Brick, fromLaser: boolean) {
    if (brick.indestructible) {
      retroAudio.playHardBrickHit();
      this.particles.emitSparks(brick.x + brick.width / 2, brick.y + brick.height / 2, '#facc15', 6);
      return;
    }

    brick.hitsLeft -= 1;

    if (brick.hitsLeft <= 0) {
      // Destroyed!
      const idx = this.bricks.indexOf(brick);
      if (idx !== -1) {
        this.bricks.splice(idx, 1);
      }

      this.addScore(brick.points);
      retroAudio.playBrickHit(brick.type === 'silver' ? 0.8 : 1.1);
      this.particles.emitBrickBreak(brick.x, brick.y, brick.width, brick.height, brick.baseColor);

      // PowerUp roll
      this.rollPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);

      // Coin roll
      this.rollCoin(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.type === 'silver');
    } else {
      // Silver brick hit but not destroyed yet
      retroAudio.playHardBrickHit();
      this.particles.emitSparks(brick.x + brick.width / 2, brick.y + brick.height / 2, '#f1f5f9', 8);
    }
  }

  private rollPowerUp(x: number, y: number) {
    // Only drop if no current active powerup capsule is already falling
    if (this.powerUps.length >= 1) return;

    // ~16% chance
    if (Math.random() > 0.16) return;

    const types: PowerUpType[] = ['S', 'C', 'L', 'E', 'D', 'B', 'P'];
    const weights = [20, 18, 16, 18, 15, 8, 5]; // 'B' and 'P' are rare
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let chosen: PowerUpType = 'S';

    for (let i = 0; i < types.length; i++) {
      if (rand < weights[i]) {
        chosen = types[i];
        break;
      }
      rand -= weights[i];
    }

    const config = this.getPowerUpConfig(chosen);
    this.powerUps.push({
      id: Math.random().toString(36).slice(2),
      x,
      y,
      vy: 120,
      type: chosen,
      width: 28,
      height: 14,
      color: config.color,
      label: config.label,
      glowColor: config.glow,
    });

    retroAudio.playPowerupSpawn();
  }

  private rollCoin(x: number, y: number, isSilver: boolean) {
    // Silver brick drops guaranteed coin; normal bricks have ~15% chance
    const chance = isSilver ? 0.95 : 0.15;
    if (Math.random() < chance) {
      const val = isSilver ? 25 : 10;
      this.coinsDrops.push({
        id: Math.random().toString(36).slice(2),
        x,
        y,
        vy: 110,
        value: val,
        radius: 7,
        rotation: 0,
      });
    }
  }

  private getPowerUpConfig(type: PowerUpType) {
    switch (type) {
      case 'S': return { color: '#f97316', label: 'SLOW', glow: 'rgba(249, 115, 22, 0.8)' };
      case 'C': return { color: '#22c55e', label: 'CATCH', glow: 'rgba(34, 197, 94, 0.8)' };
      case 'L': return { color: '#ef4444', label: 'LASER', glow: 'rgba(239, 68, 68, 0.8)' };
      case 'E': return { color: '#3b82f6', label: 'EXPAND', glow: 'rgba(59, 130, 246, 0.8)' };
      case 'D': return { color: '#06b6d4', label: 'DISRUPT', glow: 'rgba(6, 182, 212, 0.8)' };
      case 'B': return { color: '#ec4899', label: 'BREAK', glow: 'rgba(236, 72, 153, 0.8)' };
      case 'P': return { color: '#e2e8f0', label: 'PLAYER', glow: 'rgba(226, 232, 240, 0.8)' };
    }
  }

  public applyPowerUp(type: PowerUpType) {
    retroAudio.playPowerupCollect();
    this.activePowerUp = type;
    this.callbacks.onActivePowerUp(type);

    // Reset previous modes
    this.paddle.hasLaser = false;
    this.paddle.hasCatch = false;
    this.paddle.width = 64;

    switch (type) {
      case 'S': // Slow
        for (const b of this.balls) {
          b.speed = Math.max(220, b.speed * 0.7);
          const curAngle = Math.atan2(b.vx, -b.vy);
          b.vx = b.speed * Math.sin(curAngle);
          b.vy = -b.speed * Math.cos(curAngle);
        }
        break;

      case 'C': // Catch
        this.paddle.hasCatch = true;
        break;

      case 'L': // Laser
        this.paddle.hasLaser = true;
        break;

      case 'E': // Expand
        this.paddle.width = 96;
        this.paddle.isExpanded = true;
        break;

      case 'D': // Disruption (3 balls)
        if (this.balls.length > 0) {
          const main = this.balls[0];
          const newB1: Ball = {
            ...main,
            id: Math.random().toString(36).slice(2),
            vx: -main.speed * 0.7,
            vy: -Math.abs(main.speed * 0.7),
            attachedToPaddle: false,
          };
          const newB2: Ball = {
            ...main,
            id: Math.random().toString(36).slice(2),
            vx: main.speed * 0.7,
            vy: -Math.abs(main.speed * 0.7),
            attachedToPaddle: false,
          };
          this.balls.push(newB1, newB2);
        }
        break;

      case 'B': // Break / Warp Gate
        this.warpGate.isOpen = true;
        retroAudio.playWarpGate();
        this.particles.addFloatingText(this.warpGate.x - 20, this.warpGate.y, 'WARP OPEN', '#ec4899', 10);
        break;

      case 'P': // Player / Extra life
        this.lives = Math.min(5, this.lives + 1);
        this.callbacks.onLivesChange(this.lives);
        retroAudio.playExtraLife();
        break;
    }
  }

  private warpToNextRound() {
    retroAudio.playWarpGate();
    this.addScore(10000);
    this.particles.addFloatingText(PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2, '+10000 WARP BONUS!', '#facc15', 12);
    this.handleRoundCleared();
  }

  private spawnEnemy() {
    const types: ('pyramid' | 'sphere' | 'diamond' | 'cube')[] = ['pyramid', 'sphere', 'diamond', 'cube'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    this.enemies.push({
      id: Math.random().toString(36).slice(2),
      x: 80 + Math.random() * (PLAYFIELD_WIDTH - 160),
      y: WALL_THICKNESS + 10,
      vx: 0,
      vy: 45,
      type: chosenType,
      angle: 0,
      width: 18,
      height: 18,
      points: 100,
      time: 0,
    });
  }

  private handleLifeLost() {
    this.lives -= 1;
    this.callbacks.onLivesChange(this.lives);
    retroAudio.playLifeLost();

    if (this.lives <= 0) {
      this.status = 'game_over';
      this.callbacks.onStatusChange(this.status);
      retroAudio.playGameOver();
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
    } else {
      this.activePowerUp = null;
      this.callbacks.onActivePowerUp(null);
      this.resetPaddle();
      this.resetBall(true);
      this.status = 'ready';
      this.callbacks.onStatusChange(this.status);
      this.roundStartTimer = 1.8;
      retroAudio.playRoundStart();
    }
  }

  private handleRoundCleared() {
    this.status = 'round_clear';
    this.callbacks.onStatusChange(this.status);
    retroAudio.playExtraLife();

    // Reward completion coins
    const bonusCoins = 30 + this.round * 10;
    this.coins += bonusCoins;
    this.callbacks.onCoinsChange(this.coins);
    this.particles.addFloatingText(PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2, `+${bonusCoins} MONEDAS!`, '#facc15', 12);

    setTimeout(() => {
      this.startRound(this.round + 1);
    }, 2200);
  }

  private addScore(amount: number) {
    this.score += amount;
    this.callbacks.onScoreChange(this.score);
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  // Canvas Renderer
  public render(ctx: CanvasRenderingContext2D) {
    const theme = THEME_SCENARIOS.find(t => t.id === this.selectedTheme) || THEME_SCENARIOS[0];
    const vausSkin = VAUS_SKINS.find(v => v.id === this.selectedVausSkin) || VAUS_SKINS[0];
    const ballSkin = BALL_SKINS.find(b => b.id === this.selectedBallSkin) || BALL_SKINS[0];

    // 1. Background
    ctx.fillStyle = this.isDarkMode ? theme.bgDark : theme.bgLight;
    ctx.fillRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);

    // Subtle background grid
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1;
    const gridSize = 28;
    for (let x = 0; x < PLAYFIELD_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, PLAYFIELD_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < PLAYFIELD_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(PLAYFIELD_WIDTH, y);
      ctx.stroke();
    }

    // 2. Metallic Walls (Top, Left, Right)
    this.renderWalls(ctx, theme);

    // 3. Warp Gate (if active)
    if (this.warpGate.isOpen) {
      this.renderWarpGate(ctx);
    }

    // 4. Bricks
    for (const brick of this.bricks) {
      this.renderBrick(ctx, brick);
    }

    // 5. PowerUp Pills
    for (const pill of this.powerUps) {
      this.renderPowerUp(ctx, pill);
    }

    // 6. Coins
    for (const coin of this.coinsDrops) {
      this.renderCoin(ctx, coin);
    }

    // 7. Laser Bolts
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    for (const laser of this.lasers) {
      ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(laser.x - laser.width / 4, laser.y + 2, laser.width / 2, laser.height - 4);
      ctx.fillStyle = '#ef4444';
    }
    ctx.shadowBlur = 0;

    // 8. Enemies
    for (const en of this.enemies) {
      this.renderEnemy(ctx, en);
    }

    // 9. Vaus Paddle
    this.renderPaddle(ctx, vausSkin);

    // 10. Balls
    for (const ball of this.balls) {
      this.renderBall(ctx, ball, ballSkin);
    }

    // 11. Particles
    this.particles.render(ctx);

    // 12. Overlay notices ("READY", "ROUND CLEAR", "GAME OVER")
    this.renderOverlays(ctx);
  }

  private renderWalls(ctx: CanvasRenderingContext2D, theme: any) {
    ctx.save();
    // Top wall
    const topGrad = ctx.createLinearGradient(0, 0, 0, WALL_THICKNESS);
    topGrad.addColorStop(0, theme.wallHighlight);
    topGrad.addColorStop(0.5, theme.wallColor);
    topGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, PLAYFIELD_WIDTH, WALL_THICKNESS);

    // Left wall
    const leftGrad = ctx.createLinearGradient(0, 0, WALL_THICKNESS, 0);
    leftGrad.addColorStop(0, theme.wallHighlight);
    leftGrad.addColorStop(0.5, theme.wallColor);
    leftGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, WALL_THICKNESS, PLAYFIELD_HEIGHT);

    // Right wall
    const rightGrad = ctx.createLinearGradient(PLAYFIELD_WIDTH - WALL_THICKNESS, 0, PLAYFIELD_WIDTH, 0);
    rightGrad.addColorStop(0, '#0f172a');
    rightGrad.addColorStop(0.5, theme.wallColor);
    rightGrad.addColorStop(1, theme.wallHighlight);
    ctx.fillStyle = rightGrad;
    ctx.fillRect(PLAYFIELD_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, PLAYFIELD_HEIGHT);

    // Corner rivets / bolts
    ctx.fillStyle = '#cbd5e1';
    for (let y = WALL_THICKNESS + 20; y < PLAYFIELD_HEIGHT; y += 45) {
      ctx.fillRect(WALL_THICKNESS / 2 - 2, y, 4, 4);
      ctx.fillRect(PLAYFIELD_WIDTH - WALL_THICKNESS / 2 - 2, y, 4, 4);
    }
    for (let x = WALL_THICKNESS + 30; x < PLAYFIELD_WIDTH - WALL_THICKNESS; x += 45) {
      ctx.fillRect(x, WALL_THICKNESS / 2 - 2, 4, 4);
    }

    // Top hatch door indicators
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(110, 4, 40, 4);
    ctx.fillRect(PLAYFIELD_WIDTH - 150, 4, 40, 4);

    ctx.restore();
  }

  private renderWarpGate(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const pulse = (Math.sin(this.warpGate.pulseTime * 6) + 1) * 0.5;
    ctx.fillStyle = `rgba(236, 72, 153, ${0.4 + pulse * 0.5})`;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 12;
    ctx.fillRect(this.warpGate.x, this.warpGate.y, this.warpGate.width, this.warpGate.height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.warpGate.x, this.warpGate.y, this.warpGate.width, this.warpGate.height);
    ctx.restore();
  }

  private renderBrick(ctx: CanvasRenderingContext2D, brick: Brick) {
    ctx.save();
    // Base brick body
    ctx.fillStyle = brick.baseColor;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    // Bevel highlights & shadow
    ctx.fillStyle = brick.highlightColor;
    // Top highlight
    ctx.fillRect(brick.x, brick.y, brick.width, 2);
    // Left highlight
    ctx.fillRect(brick.x, brick.y, 2, brick.height);

    // Bottom shadow
    ctx.fillStyle = brick.shadowColor;
    ctx.fillRect(brick.x, brick.y + brick.height - 2, brick.width, 2);
    // Right shadow
    ctx.fillRect(brick.x + brick.width - 2, brick.y, 2, brick.height);

    // Silver multi-hit cracks
    if (brick.type === 'silver' && brick.hitsLeft < brick.maxHits) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(brick.x + 8, brick.y + 3);
      ctx.lineTo(brick.x + 18, brick.y + 9);
      ctx.lineTo(brick.x + 28, brick.y + 13);
      ctx.stroke();
    }

    // Gold brick inner metallic stripe
    if (brick.type === 'gold') {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(brick.x + 4, brick.y + 4, brick.width - 8, brick.height - 8);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(brick.x + 6, brick.y + 6, brick.width - 12, brick.height - 12);
    }

    ctx.restore();
  }

  private renderPaddle(ctx: CanvasRenderingContext2D, skin: any) {
    ctx.save();
    const x = this.paddle.x;
    const y = this.paddle.y;
    const w = this.paddle.width;
    const h = this.paddle.height;
    const halfW = w / 2;
    const halfH = h / 2;

    // Glowing aura if powerup active
    if (this.paddle.hasLaser) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
    } else if (this.paddle.hasCatch) {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
    }

    // Paddle body (pill shape with metallic gradient)
    const bodyGrad = ctx.createLinearGradient(0, y - halfH, 0, y + halfH);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.3, skin.bodyColor);
    bodyGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(x - halfW, y - halfH, w, h, 6);
    ctx.fill();

    // Red/Trim Wingtips
    ctx.fillStyle = skin.trimColor;
    ctx.beginPath();
    ctx.roundRect(x - halfW, y - halfH, 10, h, [6, 0, 0, 6]);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + halfW - 10, y - halfH, 10, h, [0, 6, 6, 0]);
    ctx.fill();

    // Center Cockpit / Sensor Orb
    ctx.fillStyle = skin.cockpitColor;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Laser Cannons (twin blasters on wings)
    if (this.paddle.hasLaser) {
      ctx.fillStyle = '#ef4444';
      // Left cannon
      ctx.fillRect(x - halfW + 3, y - halfH - 4, 3, 5);
      // Right cannon
      ctx.fillRect(x + halfW - 6, y - halfH - 4, 3, 5);
    }

    ctx.restore();
  }

  private renderBall(ctx: CanvasRenderingContext2D, ball: Ball, skin: any) {
    ctx.save();
    ctx.shadowColor = skin.glowColor;
    ctx.shadowBlur = 8;

    if (skin.trailType === 'pixel') {
      ctx.fillStyle = skin.coreColor;
      ctx.fillRect(ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
    } else {
      const grad = ctx.createRadialGradient(
        ball.x - 1, ball.y - 1, 1,
        ball.x, ball.y, ball.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, skin.coreColor);
      grad.addColorStop(1, skin.glowColor);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderPowerUp(ctx: CanvasRenderingContext2D, pill: PowerUpPill) {
    ctx.save();
    ctx.shadowColor = pill.glowColor;
    ctx.shadowBlur = 8;

    // Outer capsule
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(pill.x - pill.width / 2, pill.y - pill.height / 2, pill.width, pill.height, 6);
    ctx.fill();

    // Colored rim
    ctx.strokeStyle = pill.color;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Inner letter
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 9px 'Press Start 2P', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pill.type, pill.x, pill.y + 1);

    ctx.restore();
  }

  private renderCoin(ctx: CanvasRenderingContext2D, coin: CoinPickup) {
    ctx.save();
    ctx.translate(coin.x, coin.y);

    const scaleX = Math.cos(coin.rotation);
    ctx.scale(scaleX, 1);

    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (Math.abs(scaleX) > 0.4) {
      ctx.fillStyle = '#854d0e';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);
    }

    ctx.restore();
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, en: EnemyDrone) {
    ctx.save();
    ctx.translate(en.x, en.y);
    ctx.rotate(en.time * 2);

    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 6;

    if (en.type === 'pyramid') {
      ctx.beginPath();
      ctx.moveTo(0, -en.height / 2);
      ctx.lineTo(en.width / 2, en.height / 2);
      ctx.lineTo(-en.width / 2, en.height / 2);
      ctx.closePath();
      ctx.fill();
    } else if (en.type === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(0, -en.height / 2);
      ctx.lineTo(en.width / 2, 0);
      ctx.lineTo(0, en.height / 2);
      ctx.lineTo(-en.width / 2, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, en.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, en.width / 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderOverlays(ctx: CanvasRenderingContext2D) {
    ctx.save();
    if (this.status === 'ready') {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText(`ROUND ${this.round}`, PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2 - 20);

      ctx.fillStyle = '#facc15';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText('READY!', PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2 + 15);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('TOCA O PULSA ESPACIO', PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2 + 40);
    } else if (this.status === 'round_clear') {
      ctx.fillStyle = '#22c55e';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText('ROUND CLEARED!', PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2 - 15);

      ctx.fillStyle = '#facc15';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('WARP AL SIGUIENTE SECTOR...', PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2 + 15);
    } else if (this.status === 'game_over') {
      ctx.fillStyle = '#ef4444';
      ctx.font = '18px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText('GAME OVER', PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2 - 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(`PUNTUACIÓN: ${this.score}`, PLAYFIELD_WIDTH / 2, PLAYFIELD_HEIGHT / 2 + 10);
    }
    ctx.restore();
  }
}

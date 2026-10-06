import { Particle, FloatingText } from './types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private maxParticles = 350;

  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      if (p.friction) {
        p.vx *= Math.pow(p.friction, dt * 60);
        p.vy *= Math.pow(p.friction, dt * 60);
      }

      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += dt;
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'square') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.size, p.y - 1, p.size * 2, 2);
      } else if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife * 1.5 + 0.5), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render floating texts (e.g. +100, +COIN)
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  // Explode brick into colored fragments
  public emitBrickBreak(x: number, y: number, width: number, height: number, color: string) {
    const count = 14;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      this.particles.push({
        x: x + Math.random() * width,
        y: y + Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.35,
        size: 3 + Math.random() * 4,
        color: color,
        alpha: 1,
        shape: Math.random() > 0.4 ? 'square' : 'circle',
        gravity: 240,
        friction: 0.96,
      });
    }
  }

  // Ball spark bounce
  public emitSparks(x: number, y: number, color = '#ffffff', count = 8) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.15 + Math.random() * 0.2,
        size: 2 + Math.random() * 2,
        color,
        alpha: 1,
        shape: 'circle',
        friction: 0.92,
      });
    }
  }

  // Ball movement trail
  public emitTrail(x: number, y: number, color: string, type: string = 'simple') {
    if (this.particles.length >= this.maxParticles) return;
    
    if (type === 'fire') {
      const colors = ['#f97316', '#ef4444', '#facc15'];
      const chosen = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 + 20,
        life: 0,
        maxLife: 0.2 + Math.random() * 0.15,
        size: 3 + Math.random() * 3,
        color: chosen,
        alpha: 0.8,
        shape: 'circle',
        friction: 0.94,
      });
    } else if (type === 'plasma') {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        life: 0,
        maxLife: 0.25,
        size: 2 + Math.random() * 3,
        color: '#38bdf8',
        alpha: 0.9,
        shape: 'circle',
      });
    } else if (type === 'pixel') {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.2,
        size: 4,
        color: color || '#22c55e',
        alpha: 0.8,
        shape: 'square',
      });
    } else {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.15,
        size: 3,
        color: color || '#ffffff',
        alpha: 0.6,
        shape: 'circle',
      });
    }
  }

  // Laser beam impact
  public emitLaserImpact(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.random() * Math.PI) + (Math.PI / 2);
      const speed = 70 + Math.random() * 100;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.2,
        size: 2.5,
        color: '#ef4444',
        alpha: 1,
        shape: 'spark',
      });
    }
  }

  // Coin collect burst
  public emitCoinBurst(x: number, y: number, value: number) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.35,
        size: 3 + Math.random() * 2,
        color: '#facc15',
        alpha: 1,
        shape: 'spark',
        gravity: 100,
      });
    }

    this.addFloatingText(x, y - 10, `+${value}`, '#facc15', 10);
  }

  // Floating text
  public addFloatingText(x: number, y: number, text: string, color = '#ffffff', size = 8) {
    this.floatingTexts.push({
      id: Math.random().toString(36).slice(2),
      x,
      y,
      vy: -40,
      text,
      color,
      life: 0,
      maxLife: 0.8,
      size,
    });
  }

  // Warp Gate vortex
  public emitWarpVortex(x: number, y: number, width: number, height: number) {
    for (let i = 0; i < 3; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 + Math.random() * 15;
      this.particles.push({
        x: x + width / 2 + Math.cos(angle) * dist,
        y: y + height / 2 + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 35 - Math.sin(angle) * 30,
        vy: -Math.sin(angle) * 35 + Math.cos(angle) * 30,
        life: 0,
        maxLife: 0.4,
        size: 2 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#ec4899' : '#a855f7',
        alpha: 0.9,
        shape: 'circle',
      });
    }
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}

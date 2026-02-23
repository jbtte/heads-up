export class TiltController {
  constructor({ onCorrect, onPassed }) {
    this.onCorrect = onCorrect;
    this.onPassed = onPassed;

    // Configurações de Sensibilidade
    this.DISPARO_CORRETO = 35;   // Graus de delta para acerto (inclina para frente)
    this.DISPARO_PASSADO = 50;   // Graus de delta para passou (inclina para trás, mais deliberado)
    this.ZONA_NEUTRA = 70;       // Gamma acima disso = posição neutra (testa)
    this.TEMPO_MINIMO = 200;     // Milissegundos segurando a inclinação

    this.travado = false;
    this.anguloReferencia = null;
    this.tempoInicio = null;
    this.lockedUntil = 0;

    this.handleMotion = this.handleMotion.bind(this);
  }

  start() {
    this.resetReferencia();
    window.addEventListener('deviceorientation', this.handleMotion);
  }

  stop() {
    window.removeEventListener('deviceorientation', this.handleMotion);
  }

  pausar(ms) {
    this.lockedUntil = Date.now() + ms;
  }

  resetReferencia() {
    this.anguloReferencia = null;
    this.travado = false;
    this.tempoInicio = null;
    this.lockedUntil = 0;
  }

  handleMotion(event) {
    const gamma = event.gamma;
    if (gamma === null) return;

    const dbg = document.getElementById('debug-overlay');
    if (dbg) dbg.textContent = `γ:${gamma.toFixed(1)}°`;

    // Captura a referência só quando o celular já está na posição neutra (testa)
    if (this.anguloReferencia === null) {
      if (gamma > this.ZONA_NEUTRA) {
        this.anguloReferencia = gamma;
      }
      return; // aguarda posição neutra sem processar gestos
    }

    // Período de pausa: ignora gestos mas referência já foi capturada
    if (Date.now() < this.lockedUntil) return;

    // Cálculo do delta com correção de wrap para gamma (escala ±90°, não ±180°)
    let delta = gamma - this.anguloReferencia;
    if (delta > 90) delta -= 180;
    if (delta < -90) delta += 180;

    // Destravamento por zona: só libera quando o celular volta à posição neutra
    if (this.travado) {
      if (gamma > this.ZONA_NEUTRA) this.travado = false;
      return;
    }

    // Thresholds assimétricos: verde (frente, 35°) vs vermelho (trás, 50°)
    const limiar = delta < 0 ? this.DISPARO_CORRETO : this.DISPARO_PASSADO;

    // Detecção de gesto com validação de tempo mínimo (evita gestos acidentais)
    if (Math.abs(delta) > limiar) {
      if (!this.tempoInicio) {
        this.tempoInicio = Date.now();
        return;
      }
      if (Date.now() - this.tempoInicio > this.TEMPO_MINIMO) {
        this.travado = true;
        this.tempoInicio = null;
        this.pausar(800); // pausa após gesto para evitar disparo duplo no retorno
        // delta < 0: inclina para frente (visor→chão) = acertou
        // delta > 0: inclina para trás  (visor→teto)  = passou
        if (delta < 0) this.onCorrect();
        else this.onPassed();
      }
    } else {
      this.tempoInicio = null;
    }
  }
}

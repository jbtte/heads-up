// =============================================================
// DETECÇÃO DE INCLINAÇÃO (Gyroscope / DeviceOrientation)
// =============================================================
//
// Eixo usado: gamma (rotação em Y)
//
//   Posição neutra (celular na testa):  gamma ≈ 89°
//   Inclina para frente (visor p/ chão): gamma cai  → ~40°
//   Inclina para trás  (visor p/ teto):  gamma cruza ±90° → ~-30°
//
// Zonas:
//   gamma > ZONA_NEUTRA             → neutro, nada dispara
//   0° < gamma < ZONA_VERDE         → acertou  (verde)
//   gamma < ZONA_VERMELHA           → passou    (vermelho)
//
// Anti-repetição (travado):
//   Após um gesto, bloqueia até o celular voltar à zona neutra.
// =============================================================

const ZONA_NEUTRA   = 70;   // acima disso = posição inicial
const ZONA_VERDE    = 45;   // abaixo disso (e > 0) = acertou
const ZONA_VERMELHA = -25;  // abaixo disso = passou

let travado = false;

// Chamada pelo jogo quando inicia uma partida
function tiltStart(onCorrect, onPassed) {
  travado = false;

  function handleMotion(event) {
    const gamma = event.gamma;
    if (gamma === null) return;

    const dbg = document.getElementById('debug-overlay');
    if (dbg) dbg.textContent = `γ:${gamma.toFixed(1)}°`;

    // Anti-repetição: aguarda retorno à zona neutra
    if (travado) {
      if (gamma > ZONA_NEUTRA) travado = false;
      return;
    }

    // Zona neutra: não dispara
    if (gamma > ZONA_NEUTRA) return;

    if (gamma > 0 && gamma < ZONA_VERDE) {
      travado = true;
      onCorrect();
    } else if (gamma < ZONA_VERMELHA) {
      travado = true;
      onPassed();
    }
  }

  window.addEventListener('deviceorientation', handleMotion);

  // Retorna função para parar a detecção
  return function tiltStop() {
    window.removeEventListener('deviceorientation', handleMotion);
  };
}

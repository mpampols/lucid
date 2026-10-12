# Lúcid

**Entrena lo que la IA te está haciendo olvidar.**

Lúcid es una web de entrenamiento mental diario. Cada día propone cuatro ejercicios cortos de áreas distintas (cálculo, memoria, atención, lenguaje, razonamiento espacial…) para mantener el hábito de pensar por uno mismo. Es gratis, no pide registro y funciona en el navegador del móvil o del ordenador.

👉 **[mpampols.github.io/lucid](https://mpampols.github.io/lucid/)**

## Qué incluye

- **Entrenamiento diario** de 4 ejercicios, el mismo para todo el mundo cada día, con racha de días seguidos.
- **9 juegos** con dificultad adaptativa:

  | Juego | Área | Qué entrena |
  |---|---|---|
  | Cálculo mental | Cálculo | Fluidez numérica y memoria de trabajo |
  | Tinta | Atención | Control inhibitorio (efecto Stroop) |
  | Dígitos | Memoria | Amplitud de dígitos |
  | Constelación | Espacial | Memoria visoespacial (tipo bloques de Corsi) |
  | Anagramas | Lenguaje | Vocabulario y flexibilidad verbal |
  | ¿Cuál es mayor? | Velocidad | Estimación y cálculo rápido |
  | Reglas | Flexibilidad | Cambio de tarea |
  | Eco | Memoria | Memoria de trabajo (n-back) |
  | Espejo | Espacial | Rotación mental |

- **Progreso**: mapa de actividad, evolución por juego, récords, tendencia y reparto por áreas.
- **Tres idiomas**: castellano, catalán e inglés. Se elige solo según el idioma del navegador y se puede cambiar a mano.
- Modo claro y oscuro, sonidos opcionales y control con teclado.

## Cómo funciona por dentro

Es una sola página (`index.html`) con HTML, CSS y JavaScript, sin frameworks ni compilación. Solo carga dos tipografías de Google Fonts.

- **Datos**: se guardan en el `localStorage` del navegador (clave `lucid.v2`). No se envía nada a ningún servidor. Desde la pestaña *Progreso* se puede copiar una copia de seguridad y restaurarla en otro navegador.
- **Sonidos**: se generan con la Web Audio API, sin archivos de audio.
- **Plan diario**: se calcula a partir de la fecha con un generador pseudoaleatorio con semilla, así que coincide para todos los usuarios sin necesidad de backend.

## Ejecutarlo en local

No hace falta instalar nada. Abre `index.html` en el navegador o, si prefieres un servidor local:

```bash
python3 -m http.server 8000
# y abre http://localhost:8000
```

## Hoja de ruta

- Más juegos, incluidos retos "sin IA" (estimaciones, cálculo cotidiano, orientación).
- Instalable como app (PWA) y uso sin conexión.
- Versión móvil para iOS y Android.
- Sincronización opcional entre dispositivos.

## Sobre el rigor

Los ejercicios se basan en tareas clásicas de la psicología cognitiva (Stroop, n-back, Corsi, rotación mental, cambio de tarea). Aun así, la evidencia de que el entrenamiento cerebral mejore capacidades fuera del propio juego es limitada. Lúcid no promete milagros: la idea es mantener el hábito de esforzarse un poco cada día.

## Autor

Hecho por [Marc Pàmpols](https://marcpampols.net).

## Licencia

[MIT](LICENSE)

---

### English

Lúcid is a free daily brain-training web app: four short exercises a day, nine adaptive games, a streak and a progress page. No sign-up, no ads, and everything is stored locally in your browser. Available in Spanish, Catalan and English. Try it at [mpampols.github.io/lucid](https://mpampols.github.io/lucid/).

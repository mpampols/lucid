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

HTML, CSS y JavaScript sin frameworks ni compilación. El JavaScript usa módulos nativos del navegador (`import`/`export`), así que GitHub Pages sirve los archivos tal cual. Solo carga dos tipografías de Google Fonts.

- **Datos**: se guardan en el `localStorage` del navegador (clave `lucid.v2`). No se envía nada a ningún servidor. Desde la pestaña *Progreso* se puede copiar una copia de seguridad y restaurarla en otro navegador.
- **Sonidos**: se generan con la Web Audio API, sin archivos de audio.
- **Plan diario**: se calcula a partir de la fecha con un generador pseudoaleatorio con semilla, así que coincide para todos los usuarios sin necesidad de backend.

### Estructura

```
index.html            Página y estructura base
assets/               Favicon
css/
  tokens.css          Colores, tipografías y temas claro/oscuro
  base.css            Base, cabecera, pestañas y botones
  home.css            Pantalla de inicio
  progress.css        Pantalla de progreso
  play.css            Partida: barra, intro y resultados
  games.css           Estilos propios de cada juego
  animations.css      Animaciones y movimiento reducido
js/
  main.js             Punto de entrada y eventos globales
  state.js            Estado de la app
  store.js            Guardado (localStorage), migraciones y copias
  daily.js            Entrenamiento del día y racha
  engine.js           Motor de partida: tiempo, puntos, resultados
  nav.js              Navegación entre vistas
  sound.js            Efectos de sonido
  icons.js            Iconos SVG
  confetti.js         Confeti
  utils.js            Utilidades
  i18n/               Textos en es, ca y en, y detección de idioma
  games/              Un archivo por juego + registro (index.js)
  views/              Cabecera, inicio y progreso
```

### Añadir un juego

1. Crea `js/games/mijuego.js` con una función `initMiJuego(stage, api)`. Recibe el contenedor y una pequeña API: `api.correct(puntos)`, `api.wrong()`, `api.later(fn, ms)`, `api.key(fn)` y `api.t()` para los textos.
2. Regístralo en `js/games/index.js` (área, duración o vidas) y añádelo a `ORDER`.
3. Añade sus textos en `js/i18n/es.js`, `ca.js` y `en.js`, dentro de `games`.
4. Si necesita estilos, van en `css/games.css`.

El guardado pasa siempre por `js/store.js`: si algún día hay backend, solo hay que cambiar ese módulo.

## Ejecutarlo en local

Al usar módulos, el navegador no permite abrir `index.html` con doble clic: hace falta un servidor local. Con Python:

```bash
python3 -m http.server 8000
# y abre http://localhost:8000
```

También vale `npx serve` o la extensión Live Server de VS Code.

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

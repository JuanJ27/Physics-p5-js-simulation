# Casimir dinámico (p5.js)

Simulación didáctica local y offline del fenómeno base:

- dos espejos en una cavidad,
- uno fijo y uno oscilante,
- aparición de luz en la cavidad al oscilar,
- aumento rápido de intensidad al subir la rapidez,
- modo no acelerado y acelerado.

## Ejecución local

Opción 1 (más rápida):
- Abrí `index.html` directamente en tu navegador.

Opción 2 (servidor estático recomendado):
- Desde esta carpeta ejecutá:
  - `python3 -m http.server 8000`
- Luego abrí `http://localhost:8000`.

## Controles mínimos

- Iniciar/Detener oscilación.
- Modo no acelerado o acelerado.
- Multiplicador de rapidez.

## Métricas visibles

- Modo.
- Separación de cavidad.
- Frecuencia efectiva.
- Intensidad relativa.

## Qué deberías observar (desde el primer frame)

- La cavidad entre espejos aparece clara y centrada al cargar.
- Durante la oscilación emergen ondas y fotones visibles dentro de la cavidad.
- Al subir rapidez, la intensidad crece de forma notoria.
- En modo acelerado, el crecimiento de intensidad es más rápido.

> Nota: es un modelo cualitativo pedagógico 2D en p5.js, robusto para uso local/offline.

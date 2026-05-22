# Efecto Casimir dinámico - Simulación local mínima en p5.js

Este entregable presenta una visualización local mínima de una **cavidad de efecto Casimir dinámico**:

- dos espejos ideales en vacío,
- un espejo fijo y un espejo oscilante,
- la oscilación puede generar fotones/ondas visibles entre los espejos,
- una oscilación más rápida produce mayor intensidad visible.

## Ejecución local

Opción 1 (más rápida):
- Abrí `index.html` directamente en tu navegador.

Opción 2 (servidor estático recomendado):
- Desde esta carpeta ejecutá:
  - `python3 -m http.server 8000`
- Luego abrí `http://localhost:8000`.

## Controles

- **Iniciar oscilación / Detener oscilación** activa o detiene el movimiento del espejo.
- **Modo de movimiento** permite elegir:
  - no acelerado (frecuencia constante), o
  - acelerado (la frecuencia aumenta con el tiempo).
- **Multiplicador de rapidez** cambia qué tan rápido oscila el espejo.

## Qué deberías observar

- Sin oscilación, la cavidad permanece oscura.
- Durante la oscilación, aparecen ondas tipo luz entre los espejos.
- Al aumentar la rapidez, aumenta la intensidad visual de la luz.

> Nota: este es un modelo cualitativo pedagógico, no un simulador experimental completo.

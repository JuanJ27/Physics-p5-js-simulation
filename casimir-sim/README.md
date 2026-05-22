# Efecto Casimir dinámico - Simulación didáctica local en p5.js

Esta simulación presenta una visualización pedagógica de una **cavidad de efecto Casimir dinámico**:

- dos espejos ideales en vacío,
- un espejo fijo y un espejo oscilante,
- la oscilación puede generar fotones/ondas visibles entre los espejos,
- una oscilación más rápida produce mayor intensidad visible,
- la escena enfatiza el contraste entre vacío oscuro en reposo y emisión de luz durante oscilación.

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

## Escala y magnitudes SI

Para expresar magnitudes en unidades del Sistema Internacional, se usa una escala didáctica explícita:

- **1 px = 2 nm**

Con esa equivalencia, la interfaz muestra:

- separación de cavidad en **nm/µm**,
- velocidad instantánea del espejo en **mm/s**,
- frecuencia efectiva de oscilación en **Hz**,
- intensidad relativa de luz como valor **adimensional**.

## Qué deberías observar

- Sin oscilación, el vacío se percibe oscuro y estable.
- Durante la oscilación, surgen ondas, halos y destellos entre los espejos.
- Al aumentar la rapidez, crece la intensidad visual de la luz emergente.

> Nota: este es un modelo cualitativo pedagógico; no reemplaza un simulador experimental calibrado.

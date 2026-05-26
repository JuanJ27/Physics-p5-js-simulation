# Entrega final — Simulación efecto Casimir (p5.js)

Este repositorio deja los **3 entregables finales** en ubicaciones explícitas para evitar ambigüedad entre archivos históricos en raíz y la versión final en `Doc/`.

## Ubicación de entregables

1. **Entregable 1 (código p5.js):**
   - `entregable1-codigo-p5-casimir.txt`

2. **Entregable 2 (actividad):**
   - Fuente: `Doc/actividad-casimir.tex`
   - PDF final: `Doc/actividad-casimir.pdf`

3. **Entregable 3 (informe físico):**
   - Fuente: `Doc/entregable3-informe-fisico.tex`
   - PDF final: `Doc/entregable3-informe-fisico.pdf`

## Notas de compilación

- Los `.tex` se compilan desde `Doc/` porque allí está la plantilla `aa.cls`.
- También se conserva `Doc/main.tex` como archivo de apoyo de la plantilla.

Comandos sugeridos:

```bash
cd Doc
pdflatex actividad-casimir.tex
pdflatex entregable3-informe-fisico.tex
```

## Limpieza

- Los archivos auxiliares de LaTeX (`.aux`, `.log`) no forman parte de la entrega final.

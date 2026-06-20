# Spec — Legales y Privacidad

> Estado del spec: **observaciones preliminares** · 2026-06-20
> ⚠️ Contenido orientativo, **no es asesoría legal**. Requiere revisión por abogado/a
> especializado/a en protección de datos antes de la entrada en vigencia de la Ley 21.719.

## Observaciones registradas (2026-06-20)

- **OBS-1 — Términos y Condiciones NO están redactados.** Hay que escribirlos. El registro
  los referencia/exige (ver B-6 en `01-auth.md`) pero el texto no existe.
- **OBS-2 — Política de Privacidad NO está redactada.** Requerida por la Ley 21.719
  (deber de información). Tampoco existe el texto.

## Aplicabilidad de la Ley N° 21.719 (por verificar con fuente oficial / abogado)

RecomiendoPymes trata datos personales de personas en Chile (nombres, emails, IPs, datos
de dueños de negocios, reseñas) → es **responsable de datos** y **la ley le aplica**.
No hay exención general para pymes ni MVP.

- **Norma:** Ley 21.719, "regula la protección y el tratamiento de los datos personales y
  crea la Agencia de Protección de Datos Personales". Moderniza la Ley 19.628; estilo GDPR.
- **Publicación:** ~13-dic-2024. **Vigencia:** ~24 meses después → **~diciembre 2026**
  (fecha exacta **por confirmar** en la BCN).
- **Obligaciones que tocan al proyecto:**
  - Consentimiento informado (libre, específico, inequívoco) → captura en registro (B-6).
  - Deber de información → **Política de Privacidad** (qué datos, finalidad, base legal,
    retención, derechos, contacto).
  - Derechos ARCO+ del titular (Acceso, Rectificación, Cancelación/Supresión, Oposición,
    Portabilidad) → borrado de cuenta (B-7 en `01-auth.md`).
  - Seguridad del tratamiento y **notificación de brechas**.
  - Sanciones por tramos (multas que pueden ser altas) — montos **por verificar**.

## Backlog legal

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **L-1** | Redactar **Términos y Condiciones** | Medio | Incluir desactivación de listado y responsabilidad del emprendedor (diseño §8) |
| **L-2** | Redactar **Política de Privacidad** conforme a Ley 21.719 | Medio | Datos, finalidad, base legal, retención, derechos ARCO+, contacto |
| **L-3** | Revisión por abogado/a de datos | — | Antes de la vigencia (~dic 2026) |
| **L-4** | Versionar los textos legales (fecha + versión) y enlazarlos al consentimiento (B-6) | Bajo | Para trazabilidad de qué versión aceptó cada usuario |
| **L-5** | Confirmar fecha exacta de vigencia y montos de sanciones en BCN | Bajo | Fuentes en vivo no disponibles al redactar esto |

> Nota: el panel admin ya contempla editar T&C y Privacidad (Markdown). Lo que falta es el
> **contenido** redactado y su revisión legal.

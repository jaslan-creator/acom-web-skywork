# Contrato futuro de checkout para agentes (no activo)

Este documento es un diseño de integración. ACOM no publica hoy un endpoint de checkout, no acepta pagos autónomos y no debe anunciar esa capacidad hasta completar autenticación, proveedor de pago, conciliación, idempotencia, webhooks y aprobación explícita del comprador.

## Flujo propuesto

1. Un agente autenticado consulta productos y disponibilidad desde una fuente transaccional futura, no desde el catálogo editorial actual.
2. `POST /api/agent/checkout-intents` valida identidad, alcance, precio, inventario e idempotencia, y crea una intención con vencimiento corto.
3. Si falta pago, el servidor devuelve `402 Payment Required` con una oferta de pago versionada. Nunca incluye secretos, datos de tarjeta ni una orden confirmada.
4. El agente presenta condiciones, monto final y comerciante al usuario. La aprobación humana genera una firma o token de autorización ligado a intención, monto, moneda, audiencia y vencimiento.
5. El agente reintenta con la credencial del protocolo elegido. El servidor verifica firma, nonce e idempotency key antes de confirmar.
6. El webhook del proveedor se valida criptográficamente y actualiza la orden. La URL pública de confirmación solo consulta el resultado; no acredita el pago por sí sola.

## Borrador de respuesta x402

El nombre de headers y el payload deberán fijarse contra la versión del estándar y el SDK elegidos en la implementación. El borrador para x402 v2 usa `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE` y `PAYMENT-RESPONSE`:

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
PAYMENT-REQUIRED: <requisito-codificado-y-firmado>
Cache-Control: no-store
```

```json
{
  "type": "https://acomve.com/problems/payment-required",
  "title": "Payment required",
  "status": 402,
  "protocol": "x402",
  "version": "2",
  "checkoutIntentId": "ci_example",
  "amount": { "value": "250.00", "currency": "USD" },
  "paymentMethods": [
    { "type": "stripe", "confirmationUrl": "https://www.acomve.com/checkout/ci_example" },
    { "type": "stablecoin", "network": "configured-at-launch", "asset": "configured-at-launch" }
  ],
  "expiresAt": "RFC3339 timestamp",
  "statusUrl": "https://www.acomve.com/api/agent/checkout-intents/ci_example",
  "webhookProcessing": "server-to-server; not callable as payment proof by the agent"
}
```

MPP es un protocolo distinto y no debe etiquetarse como x402. Si se adopta, se negociará mediante `WWW-Authenticate: Payment` y la autorización se enviará con `Authorization: Payment ...`, usando un contrato y verificación separados.

## Controles mínimos antes de activar

- Autenticación de agentes con claves rotables y scopes de lectura/checkout.
- Firma de solicitudes, nonce, expiración, prevención de replay y claves de idempotencia.
- Aprobación humana demostrable para monto, moneda, comercio y artículos exactos.
- Precios e inventario autoritativos; límites por agente, usuario, IP y valor.
- Verificación de webhooks con secreto independiente y conciliación con el proveedor.
- Registro auditable sin PAN, secretos, tokens completos ni datos personales innecesarios.
- Estados explícitos: `requires_payment`, `processing`, `paid`, `failed`, `expired` y `cancelled`.
- Pruebas de doble envío, cambio de precio, pago tardío, webhook repetido, firma inválida y reembolso.

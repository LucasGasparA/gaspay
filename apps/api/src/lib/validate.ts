import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';

/**
 * Wrapper do `zValidator` que joga o `ZodError` para o handler global em vez de
 * responder direto. Assim todo erro de validação sai no mesmo formato, com
 * `requestId`, e nenhuma rota precisa lembrar disso.
 *
 * Os schemas vêm de `@dindim/shared` e são todos `.strict()`: campo
 * desconhecido no body vira 400. É o que impede o cliente de injetar `userId`.
 */
export function validate<Target extends keyof ValidationTargets, Schema extends ZodType>(
  target: Target,
  schema: Schema,
) {
  return zValidator(target, schema, (result) => {
    if (!result.success) throw result.error;
    return undefined;
  });
}

# v7.2.17 — Chat Route Patch Instructions

See src/lib/smart-cart-context.ts. Required edits:
1. Add import: `import { SMART_CART_CONTEXT, inferScopeFromMessage, buildSmartCartUrl } from '@/lib/smart-cart-context'`
2. Append `${SMART_CART_CONTEXT}` to system prompt
3. (Optional) Log inferred scope from latest user message
4. No changes to lead-capture logic

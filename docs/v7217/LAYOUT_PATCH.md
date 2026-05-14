# v7.2.17 — Layout Patch Instructions

In src/app/layout.tsx:
1. Add: `import ChatBubble from '@/components/ChatBubble'`
2. Mount `<ChatBubble />` before closing </body>
3. (Optional) Also mount `<OrganizationSchema />` from v7.2.16

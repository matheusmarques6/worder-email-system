# AUTORUN-CLONE-REFS.md — Clonar repositórios de referência

Execute TUDO abaixo. Isso clona os repos de referência para a pasta /reference/ do projeto.
Os outros 5 Claudes vão poder ler esses arquivos.

```bash
mkdir -p reference/adtracked reference/acelle

# === ADTRACKED (nosso repo — webhook handler, OAuth, tracking) ===
git clone --depth 1 https://github.com/matheusmarques6/adtracked.git /tmp/adtracked

cp /tmp/adtracked/app/api/webhooks/shopify/route.ts reference/adtracked/webhook-handler.ts
cp /tmp/adtracked/app/api/shopify/register-webhooks/route.ts reference/adtracked/register-webhooks.ts
cp /tmp/adtracked/app/api/track/route.ts reference/adtracked/track-endpoint.ts
cp /tmp/adtracked/public/tracker.js reference/adtracked/tracker.js
cp /tmp/adtracked/public/shopify-pixel.js reference/adtracked/shopify-pixel.js
cp /tmp/adtracked/lib/services/klaviyo.ts reference/adtracked/klaviyo-service.ts
cp /tmp/adtracked/app/api/auth/shopify/route.ts reference/adtracked/shopify-oauth.ts
cp /tmp/adtracked/app/api/auth/shopify/callback/route.ts reference/adtracked/shopify-callback.ts

rm -rf /tmp/adtracked

# === ACELLE MAIL (worder-email — automações, segmentação, merge tags) ===
git clone --depth 1 https://github.com/matheusmarques6/worder-email.git /tmp/acelle

# Models
for f in Automation2 AutoTrigger Campaign Segment SegmentCondition Subscriber SendingDomain SendingServer Template MailList TrackingLog; do
  find /tmp/acelle -name "${f}.php" -path "*/Models/*" -exec cp {} reference/acelle/ \; 2>/dev/null
done

# Controllers
find /tmp/acelle -name "CampaignController.php" -path "*/Controllers/*" -exec cp {} reference/acelle/ \; 2>/dev/null
find /tmp/acelle -name "AutomationController.php" -path "*/Controllers/*" -exec cp {} reference/acelle/ \; 2>/dev/null
find /tmp/acelle -name "SegmentController.php" -path "*/Controllers/*" -exec cp {} reference/acelle/ \; 2>/dev/null

# Jobs
find /tmp/acelle -name "SendMessage.php" -path "*/Jobs/*" -exec cp {} reference/acelle/ \; 2>/dev/null
find /tmp/acelle -name "RunAutomation.php" -path "*/Jobs/*" -exec cp {} reference/acelle/ \; 2>/dev/null

# Library
find /tmp/acelle -name "StringHelper.php" -exec cp {} reference/acelle/ \; 2>/dev/null

rm -rf /tmp/acelle

# === SHADCN WORKFLOWS (React Flow + shadcn + custom nodes) ===
git clone --depth 1 https://github.com/nobruf/shadcn-next-workflows.git reference/shadcn-workflows

# === WHATSAPP EXAMPLES (templates e-commerce) ===
git clone --depth 1 https://github.com/fbsamples/whatsapp-api-examples.git reference/whatsapp-examples

# === Não commitar os references (já está no .gitignore) ===
echo ""
echo "✅ Referências clonadas:"
ls -la reference/adtracked/
ls -la reference/acelle/
ls reference/shadcn-workflows/ | head -5
ls reference/whatsapp-examples/ | head -5
```

Depois de clonar, os arquivos ficam em:
- reference/adtracked/webhook-handler.ts (1173 linhas — webhook Shopify completo)
- reference/adtracked/register-webhooks.ts (209 linhas — auto-registro)
- reference/adtracked/track-endpoint.ts (1625 linhas — tracking server-side)
- reference/adtracked/klaviyo-service.ts (456 linhas — estrutura de eventos e-commerce)
- reference/adtracked/shopify-oauth.ts + shopify-callback.ts (OAuth flow)
- reference/acelle/Automation2.php (flow execution engine)
- reference/acelle/CampaignController.php (open/click/unsubscribe tracking)
- reference/acelle/StringHelper.php (merge tag engine)
- reference/acelle/SegmentCondition.php (condition → SQL translation)
- reference/acelle/SendMessage.php (render → send → log pipeline)
- reference/shadcn-workflows/ (React Flow canvas com custom nodes)
- reference/whatsapp-examples/ (templates WhatsApp e-commerce)

NÃO faça git add/commit destes arquivos — eles ficam apenas local para consulta.

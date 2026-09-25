#!/usr/bin/env bash
# Leva uma versão nova do site (cronofoco.html) para o app (www/index.html) sem perder a camada de voz.
#
# Uso (na raiz do repositório, no Linux/macOS ou no "Git Bash" do Windows):
#   docs/sincronizacao/sincronizar.sh /caminho/do/cronofoco.html 42
#     1º argumento: o cronofoco.html novo do site
#     2º argumento: o número da versão do site (ex.: 42)
#
# Como funciona: fusão de três vias (git merge-file).
#   base   = docs/sincronizacao/base-site-vNN.html  (versão do site usada na última sincronização)
#   nosso  = www/index.html                          (app atual = base + voz)
#   deles  = o cronofoco.html novo do site
# O resultado é "o site novo + a voz do app". Se não houver conflito, o script grava o resultado em
# www/index.html, troca a base pela versão nova e regenera o arquivo de diferenças. Se houver
# conflito, NADA é alterado: o resultado com marcadores <<<<<<< / >>>>>>> fica em www/index.html.merge
# para resolver à mão (os conflitos só devem aparecer nos trechos de voz do Cálculo e do Stroop).
# Depois de resolver, conclua com:
#   docs/sincronizacao/sincronizar.sh --concluir /caminho/do/cronofoco.html 42
set -euo pipefail

CONCLUIR=0
if [ "${1:-}" = "--concluir" ]; then CONCLUIR=1; shift; fi
NOVO="${1:-}"; VER="${2:-}"
if [ -z "$NOVO" ] || [ -z "$VER" ] || [ ! -f "$NOVO" ]; then
  echo "Uso: $0 [--concluir] caminho/do/cronofoco.html NUMERO_DA_VERSAO_DO_SITE" >&2; exit 1
fi
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
DIR="$RAIZ/docs/sincronizacao"
APP="$RAIZ/www/index.html"
BASE="$(ls "$DIR"/base-site-v*.html | sort -V | tail -n1)"
echo "Base:  $(basename "$BASE")"
echo "App:   www/index.html"
echo "Novo:  $NOVO (site v$VER)"

TMP="$(mktemp)"
if [ "$CONCLUIR" -eq 1 ]; then
  [ -f "$APP.merge" ] || { echo "Não existe www/index.html.merge para concluir." >&2; exit 1; }
  if grep -qE '^(<<<<<<<|\|\|\|\|\|\|\||=======|>>>>>>>)( |$)' "$APP.merge"; then
    echo "Ainda há marcadores de conflito em www/index.html.merge." >&2; exit 2
  fi
  cp "$APP.merge" "$TMP"; rm -f "$APP.merge"
  CONFLITOS=0
else
set +e
git merge-file -p --diff3 -L "app (www/index.html)" -L "base ($(basename "$BASE"))" -L "site v$VER" \
  "$APP" "$BASE" "$NOVO" > "$TMP"
CONFLITOS=$?
set -e
fi

if [ "$CONFLITOS" -ne 0 ]; then
  cp "$TMP" "$APP.merge"
  echo ""
  echo "⚠ $CONFLITOS conflito(s). Nada foi alterado."
  echo "  Resolva os blocos <<<<<<< ... >>>>>>> em www/index.html.merge (mantendo a lógica de voz do app"
  echo "  e as mudanças do site) e conclua com:"
  echo "    $0 --concluir $NOVO $VER"
  exit 2
fi

cp "$TMP" "$APP"
NOVA_BASE="$DIR/base-site-v$VER.html"
if [ "$BASE" != "$NOVA_BASE" ]; then rm -f "$BASE"; fi
cp "$NOVO" "$NOVA_BASE"
rm -f "$DIR"/diferencas-site-v*-para-app*.diff
diff -u --label "site v$VER (cronofoco.html)" --label "app (www/index.html)" "$NOVA_BASE" "$APP" \
  > "$DIR/diferencas-site-v$VER-para-app.diff" || true
echo ""
echo "✔ Sem conflitos. www/index.html atualizado; base agora é base-site-v$VER.html."
echo "  Próximos passos: rodar os testes (docs/08-testes.md), subir versionCode em android/app/build.gradle,"
echo "  atualizar docs/06-diferencas-site-x-app.md e docs/CHANGELOG.md, commit e push."

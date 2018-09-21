#!/bin/bash

BASE_URL="https://podentender.com"
EPISODES_URL="$BASE_URL/post-sitemap.xml"
EPISODES=`curl -s $EPISODES_URL | grep -e 'loc.https://' | sed -e 's/<loc>\(.*\)<\/loc>/\1/g' | tr -d '[:blank:]'`

fetch_http_resource() {
  curl -si $URL
}

fetch_http_code() {
  echo $CONTENT | head -n1 | cut -d' ' -f2
}

if_not_200_exit() {
  if [ $HTTP_CODE -ne 200 ]; then
    echo "Falha ao carregar a página $URL"
    exit 1
  fi
}

logar_pagina_atual() {
  echo "Baixando página '$URL'...\n"
}

# Baixar home
URL=https://podentender.com
logar_pagina_atual
CONTENT=`fetch_http_resource`
HTTP_CODE=`fetch_http_code`

if_not_200_exit

echo $CONTENT > index.html

# Baixar episódios
for EPISODE in $EPISODES;
do
  URL=$EPISODE
  logar_pagina_atual
  CONTENT=`fetch_http_resource`
  HTTP_CODE=`fetch_http_code`

  if [ $HTTP_CODE -eq 200 ]; then
    DIR=`dirname $EPISODE | sed -e 's/https:\/\/podentender.com//g'`
    FILE=`basename $EPISODE`
    OUTPUT="./$DIR/$FILE"

    mkdir -p "./$DIR"
    echo $CONTENT | sed -e '1p' > $OUTPUT
  else
    echo "Falha ao requisitar a página $EPISODE"
    exit 1
  fi

  sleep 1; # Dá um respiro pro server
done;

# O Estatista
------------

O Estatista é um experimento que visa gerar páginas estáticas a partir do
site PODEntender.com e serví-las usando o serviço gh-pages.

Com este projeto pretendemos manter o custo baixo de infraestrutura ao passo que
a única razão para mantermos o nosso servidor pago é a criação de conteúdo pelo WordPress.

## Como funciona?

O Estatista irá verificar todos os dias os arquivos `sitemap` que o site oferece. A partir
destes arquivos O Estatista `pod entender` quais páginas existem no site, buscar seu conteúdo
e guardá-lo já processado.

O projeto conta com uma build em Node JS que analisa o sitemap e baixa as páginas estáticas.
Esta build está configurada no serviço Travis Ci e roda ao menos uma vez por dia, atualizando
as páginas do repositório e enviando ao branch `gh-pages`.

Esta nova build é então servida através do endereço https://estatista.podentender.com, que
está também protegido por uma camada de cache no Cloudflare.

## Instalação

Clone o projeto localmente:

`$ git clone git@github.com:PODEntender/estatista.git`

Na raiz do projeto, instale as dependências e rode a build:

```bash
$ cd estatista/
$ npm install

$ npm run build
```

As páginas estáticas deverão estar presentes no diretório raiz.

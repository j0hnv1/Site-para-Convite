# Painel de confirmações — instalação (≈ 5 minutos, gratuito)

O convite não tem servidor próprio. As confirmações ficam numa **planilha do Google** e o painel escondido lê essa planilha.
A senha do painel é conferida **dentro do Google** (não aparece no código do site).

## 1. Criar a planilha e o script
1. Acesse [sheets.new](https://sheets.new) (entre com a conta Google que será a dona da lista) e dê um nome, ex.: *Confirmações Linda 21*.
2. Menu **Extensões > Apps Script**.
3. Apague o código que vier e **cole todo o conteúdo do arquivo `backend/apps-script.gs`**.
4. (Opcional, recomendado) No início do código, troque `ADMIN_USER` e `ADMIN_PASS` por um usuário e uma senha só seus. Hoje estão `linda123@` / `linda123@`.
5. Clique em **Salvar** (ícone de disquete).

## 2. Publicar
1. Botão **Implantar > Nova implantação**.
2. Na engrenagem, escolha **App da Web**.
3. Configure: **Executar como: Eu** · **Quem pode acessar: Qualquer pessoa**.
4. Clique em **Implantar** e autorize quando o Google pedir (se aparecer "app não verificado": *Avançado > Acessar … (não seguro)* — é o seu próprio script).
5. Copie o **URL do app da Web** (termina em `/exec`).

> Sempre que alterar o código do script, use **Implantar > Gerenciar implantações > ✏️ > Versão: Nova versão > Implantar** (o URL continua o mesmo).

## Atualizar o script (quando eu mandar uma versão nova)
1. Cole o código novo no editor do Apps Script (Ctrl+A, Delete, Ctrl+V) e salve (Ctrl+S).
2. **Implantar > Gerenciar implantações > ✏️** e, em **Versão**, escolha **Nova versão** (não deixe a versão antiga) > **Implantar**.
3. Abra o URL `/exec` e confira o número de `version`.
Se continuar antigo: **Implantar > Nova implantação > App da Web** gera um URL **novo**; cole esse URL em `inviteConfig.js` e rode `npm run build`.

## 3. Conectar ao convite
Abra `src/config/inviteConfig.js` e cole o URL:
```js
backend: { url: 'https://script.google.com/macros/s/XXXX/exec' },
```
Depois `npm run build` e publique de novo.

**Teste rápido:** abra o URL `/exec` no navegador; deve aparecer `{"ok":true,"service":"convite-linda-21","version":4,"actions":["rsvp","list","delete"]}`. Se não aparecer `delete`, o script publicado é antigo (veja "Atualizar o script" abaixo).

## 4. Como usar o painel
- Na **primeira página (o envelope)**, toque **5 vezes seguidas** no canto **inferior esquerdo** da tela (em até 3 segundos). Também funciona abrir o site com `#painel` no final do endereço.
- Entre com o usuário e a senha.
- Você vê: total de pessoas, número de confirmações, acompanhantes, e a lista com quem confirmou e **quem cada pessoa vai levar**. Se alguém confirmar de novo com o mesmo nome, a confirmação anterior é substituída (não conta em dobro).
- A mesma lista está na aba **Confirmacoes** da planilha (dá para baixar em Excel/CSV).

## Segurança e limites (leia)
- Usuário e senha simples (`linda123@`) protegem contra curiosos, **não** contra quem queira muito. Troque por algo mais forte no passo 1.4.
- Qualquer pessoa com o link do convite consegue *enviar* uma confirmação (é assim que o convite funciona). Se alguém enviar lixo, apague a linha na planilha.
- O painel só mostra o que chegou ao Google. Se alguém confirmar sem internet, a mensagem do WhatsApp ainda vale como confirmação.
- Limites gratuitos do Google são mais que suficientes para uma festa.

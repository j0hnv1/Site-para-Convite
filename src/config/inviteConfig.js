/**
 * ÚNICO LUGAR PARA EDITAR OS DADOS DO CONVITE.
 */
export const inviteConfig = {
  /**
   * Cronômetro regressivo (página 2, a principal).
   * Por enquanto: meia-noite de 10/01/2027, horário de Brasília.
   * (A imagem da página 3 mostra "Sab. 23 Jan. – 19hrs": quando decidir, basta
   *  trocar para date: '2027-01-23' e time: '19:00'.)
   */
  countdown: {
    date: '2027-01-10', // AAAA-MM-DD
    time: '00:00', // HH:mm (24h)
    timeZone: 'America/Sao_Paulo',
  },

  /**
   * Localização (abre ao tocar em "Localização" na página 3).
   * O nome abaixo foi tirado do próprio link do Google Maps ("viva eventos");
   * confira e corrija se necessário. Se quiser, preencha também o endereço.
   */
  location: {
    name: 'Viva Eventos',
    address: '', // endereço completo (opcional)
    mapsUrl:
      'https://www.google.com/maps?vet=10CAAQoqAOahcKEwjo8MbvkuiXAxUAAAAAHQAAAAAQDg..i&udm&fvr=1&pvq=Cg0vZy8xMWw2OTI1OV9mIhIKDHZpdmEgZXZlbnRvcxACGAM&lqi=Cgx2aXZhIGV2ZW50b3MiA4gBAUjtz4qRmbKAgAhaFhAAEAEYABgBIgx2aXZhIGV2ZW50b3OSAQxiYW5xdWV0X2hhbGyaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMjF3VUU1c09WcE9NVXBRVkdwVmVHTXdkRmxUVjFad1ZERldiMlJ1WXhBQvoBBAgAEEQ&cs=1&um=1&ie=UTF-8&fb=1&gl=br&sa=X&ftid=0x94dceffdee361f23:0x8a171c585692154a',
    placeholder: 'Local a definir',
  },

  /**
   * Evento no calendário. Ao confirmar a presença, o convidado recebe este
   * evento (arquivo .ics e link do Google Agenda).
   * ATENÇÃO: data e hora seguem o que está escrito na imagem da página 3
   * (Sáb. 23 Jan., 19h). A duração NÃO foi informada: 4 horas é um valor
   * provisório, ajuste em durationHours.
   */
  calendar: {
    date: '2027-01-23', // AAAA-MM-DD
    time: '19:00', // HH:mm
    timeZone: 'America/Sao_Paulo',
    durationHours: 4,
    title: '21st Birthday: Fantasy Edition — Linda',
    description: 'Aniversário de 21 anos da Linda.',
  },

  /**
   * Confirmação de presença por WhatsApp (página 3 > "Confirmar presença").
   * A pessoa informa o nome (e, se for levar alguém, os nomes e quantas
   * pessoas) e o WhatsApp abre com a mensagem pronta para enviar.
   */
  rsvp: {
    title: 'Confirmar presença',
    // Número que recebe as confirmações (+55 41 9698-7814): só dígitos, com 55 + DDD.
    // Se o WhatsApp não encontrar o contato, confira se falta o 9 na frente
    // (ex.: '5541996987814').
    whatsappNumber: '554196987814',
    // Textos da mensagem. {nome}, {acompanhantes} e {pessoas} são preenchidos sozinhos.
    messageAlone:
      'Olá, Linda! Aqui é {nome} e estou confirmando minha presença no seu aniversário! Vou sozinho(a).',
    messageWithGuests:
      'Olá, Linda! Aqui é {nome} e estou confirmando minha presença no seu aniversário! Vou levar {pessoas}: {acompanhantes}.',
    maxGuests: 10,
  },
};

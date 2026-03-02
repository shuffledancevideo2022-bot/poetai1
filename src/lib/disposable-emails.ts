// Common disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'guerrillamail.info',
  'grr.la', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'bccto.me',
  'mailinator.com', 'maildrop.cc', 'dispostable.com', 'yopmail.com', 'yopmail.fr',
  'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj',
  'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf',
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashemail.de',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'spam4.me',
  'mailnesia.com', 'tempail.com', 'tempr.email', 'temp-mail.org', 'temp-mail.io',
  'fakeinbox.com', 'mailcatch.com', 'mailnull.com', 'mailscrap.com',
  'discard.email', 'discardmail.com', 'discardmail.de', 'emailondeck.com',
  'getairmail.com', 'harakirimail.com', 'mailexpire.com', 'mailforspam.com',
  'mailinater.com', 'mailismagic.com', 'mailnator.com', 'mailtothis.com',
  'mintemail.com', 'mt2015.com', 'nobulk.com', 'noclickemail.com',
  'nowmymail.com', 'sharklasers.com', 'sogetthis.com', 'spamgourmet.com',
  'tempinbox.com', 'tempmailer.com', 'throwam.com', 'trashymail.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wh4f.org', 'yopmail.net',
  '10minutemail.com', '10minutemail.net', '20minutemail.com', '20minutemail.it',
  'mailtemp.info', 'tmpmail.net', 'tmpmail.org', 'boun.cr', 'crazymailing.com',
  'emailigo.de', 'filzmail.com', 'fleckens.hu', 'jourrapide.com',
  'kurzepost.de', 'mfsa.ru', 'mfsa.info', 'mohmal.com', 'tmail.ws',
  'rmqkr.net', 'royal.net', 'cuvox.de', 'dayrep.com', 'einrot.com',
  'fleckens.hu', 'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com',
  'teleworm.us', 'armyspy.com', 'mailnull.com',
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  return DISPOSABLE_DOMAINS.has(domain);
}

export function isValidEmailFormat(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

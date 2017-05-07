import crypto from 'crypto';
import shortid from 'shortid';

export function symbols(...items) {
  const out = {};
  items.forEach(item => out[item] = Symbol(item));
  return out;
}

export function makeGenID() {
  return () => shortid.generate();
  // return () => crypto.randomBytes(3*4).toString('base64');
}

export function keyEvent (ev) {
  const parts = [];
  if (ev.ctrlKey) { parts.push('Ctrl'); }
  if (ev.shiftKey) { parts.push('Shift'); }
  if (ev.altKey) { parts.push('Alt'); }
  parts.push(ev.key);
  return parts.join(' ');
}

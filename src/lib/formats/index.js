export class BaseFormat {
  constructor(options) { this.options = options; }
  importContent(content) { return {}; }
  exportOutline(outline) { return ''; }
}

export const JSONFormat = require('./JSON').default;
export const OPMLFormat = require('./OPML').default;

export const extensions = {
  json: JSONFormat,
  opml: OPMLFormat
};

import {BaseFormat} from './index';

export default class OPMLFormat extends BaseFormat {
  importContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "application/xml");
    return doc;
  }
  exportOutline(outline) {
  }
}

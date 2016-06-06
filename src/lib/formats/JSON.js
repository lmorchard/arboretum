import {BaseFormat} from './index';

import stringify from 'json-stringify-pretty-compact';

export default class JSONFormat extends BaseFormat {
  importContent(content) {
    return JSON.parse(content);
  }
  exportOutline(outline) {
    return stringify(outline);
  }
}

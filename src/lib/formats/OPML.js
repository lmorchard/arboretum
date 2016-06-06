import {BaseFormat} from './index';

export default class OPMLFormat extends BaseFormat {
  importContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "application/xml");
    const root = doc.querySelector('body');
    const data = this._importNodes(root);
    return data;
  }

  _importNodes(root) {
    const data = [];
    const children = root.children;
    for (let idx = 0; idx < children.length; idx++) {
      const child = children[idx];
      if (child.tagName !== 'outline') { continue; }
      const node = {
        title: child.getAttribute('text')
      };
      if (child.children.length) {
        node.children = this._importNodes(child);
      }
      data.push(node);
    }
    return data;
  }

  exportOutline(outline) {
  }
}

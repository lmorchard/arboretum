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

  exportOutline(nodes) {
    const doc = document.implementation.createDocument("", "", null);

    const opml = doc.createElement('opml');
    opml.setAttribute('version', '2.0');

    const head = doc.createElement('head');
    // TODO: metadata!
    opml.appendChild(head);

    const body = doc.createElement('body');
    this._exportNodes(doc, body, nodes);
    opml.appendChild(body);

    doc.appendChild(opml);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }

  _exportNodes(doc, root, nodes) {
    nodes.forEach(node => {
      const outline = doc.createElement('outline');
      outline.setAttribute('text', node.title);
      if (node.children) {
        this._exportNodes(doc, outline, node.children);
      }
      root.appendChild(outline);
    });
  }
}

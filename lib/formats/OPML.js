import SAX from 'sax';
import XMLWriter from 'xml-writer';
import Immutable from 'immutable';

import { makeGenID } from '../utils';

export function parse(input) {
  const genId = makeGenID();

  let inHead = false;
  let inBody = false;
  let metaEl = null;

  const meta = {};
  const root = [];
  const nodes = {};
  const stack = [];

  Object.assign(SAX.parser(true), {

    onopentag: xmlNode => {
      if (inHead) {
        metaEl = xmlNode.name;
        meta[metaEl] = '';
      }

      if (inBody) {
        if ('outline' === xmlNode.name) {
          const id = genId();
          const node = nodes[id] = {
            id,
            parent: null,
            children: [],
            attributes: xmlNode.attributes,
          };
          if (stack.length === 0) {
            root.push(node.id);
          } else {
            const parent = stack[stack.length - 1];
            node.parent = parent.id;
            parent.children.push(node.id);
          }
          stack.push(node);
        }
      }

      if ('head' === xmlNode.name) { inHead = true; }
      if ('body' === xmlNode.name) { inBody = true; }
    },

    ontext: text => {
      if (inHead) {
        if (metaEl !== null) { meta[metaEl] += text; }
      }
    },

    onclosetag: xmlNodeName => {
      metaEl = null;
      if ('head' === xmlNodeName) { inHead = false; }
      if ('body' === xmlNodeName) { inBody = false; }
      if (inBody) {
        if ('outline' === xmlNodeName) { stack.pop(); }
      }
    }

    // onerror: err => console.log('err', err),
    // onend: () => console.log('End')
  }).write(input).close();

  return Immutable.fromJS({meta, root, nodes});
}

export function serialize(store) {
  const xw = new XMLWriter(true);
  const nodes = store.get('nodes');

  const serializeNodes = ids => ids.forEach(id => {
    const node = nodes.get(id);
    xw.startElement('outline');
    node.get('attributes').forEach((v, k) => xw.writeAttribute(k, v));
    serializeNodes(node.get('children'));
    xw.endElement();
  });

  xw.startDocument();
  xw.startElement('opml');
  xw.writeAttribute('version', '2.0');
  xw.startElement('head');
  store.get('meta').sortBy((v, k) => k).forEach((v, k) => {
    xw.startElement(k);
    xw.text(v);
    xw.endElement();
  });
  xw.endElement();
  xw.startElement('body');
  serializeNodes(store.get('root'));
  xw.endElement();
  xw.endElement();
  xw.endDocument();

  return xw.toString();
}

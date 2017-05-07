import path from 'path';
import fs from 'fs';
import assert from 'assert';

import Immutable from 'immutable';

import * as formatOPML from '../../../lib/formats/OPML';

const FIXTURES_BASE = path.join(__dirname, '..', '..', '_fixtures');
const STATES_OPML_FN = path.join(FIXTURES_BASE, 'states.opml');
const STATES_JSON_FN = path.join(FIXTURES_BASE, 'states.json');

describe('lib/formats/OPML', () => {

  const input = fs.readFileSync(STATES_OPML_FN);

  it('should parse', () => {
    const store = formatOPML.parse(input);

    //console.log(store);
    //console.log(JSON.stringify(store.toJS(), null, ' '));
  });

  it('should serialize', () => {
    const store = formatOPML.parse(input);
    const xmlData = formatOPML.serialize(store);

    // console.log(xmlData);
  });

});

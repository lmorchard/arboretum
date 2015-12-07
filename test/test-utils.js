import { expect } from "chai";
import { createStore, applyMiddleware } from 'redux';
import Immutable from 'immutable';

import reducers from '../src/lib/reducers';
import * as Utils from '../src/lib/utils';

describe('utils', function () {

  beforeEach(function () {

    this.state = Immutable.fromJS([
      {title: "alpha"},
      {title: "beta", children: [
        {title: "foo"},
        {title: "bar", children: [
          {title: "quux"},
          {title: "xyzzy"}
        ]},
        {title: "baz"}
      ]},
      {title: "gamma"},
      {title: "level1", children: [
        {title: 'level2', children: [
          {title: 'level3', children: [
            {title: 'level4'}
          ]}
        ]}
      ]},
      {title: 'thud'}
    ]);

    this.store = createStore(reducers, {
      nodes: this.state
    });

    this.expectedSeries = [
      '0',
      '1',
      '1.children.0',
      '1.children.1',
      '1.children.1.children.0',
      '1.children.1.children.1',
      '1.children.2',
      '2',
      '3',
      '3.children.0',
      '3.children.0.children.0',
      '3.children.0.children.0.children.0',
      '4'
    ];

  });

  describe('splitPath', function () {
    it('should split a dot-delimited path into a key array', function () {
      expect(Utils.splitPath('1.children.1.children.2')).to.deep.equal(['1', 'children', '1', 'children', '2']);
    })
  })

  describe('getNodeContext', function () {
    it('should construct contextual information for a node path', function () {
      var path = '1.children.1.children.0';
      var expected = {
        key: ['1', 'children', '1', 'children', '0'],
        parentKey: ['1', 'children', '1'],
        index: 0,
        value: this.state.getIn(['1', 'children', '1', 'children', '0']),
        siblings: this.state.getIn(['1', 'children', '1', 'children'])
      };
      var result = Utils.getNodeContext(this.state, path);
      expect(result).to.deep.equal(expected);
    })
  })

  describe('getNextNodePath', function () {
    it('should find the path to the next node', function () {
      var current, expected, result;
      current = this.expectedSeries.shift();
      while (this.expectedSeries.length) {
        expected = this.expectedSeries.shift();
        result = Utils.getNextNodePath(this.state, current);
        expect(result).to.equal(expected);
        current = expected;
      }
    })
  });

  describe('getPreviousNodePath', function () {
    it('should find the path to the previous node', function () {
      var current, expected, result;
      this.expectedSeries.reverse();
      current = this.expectedSeries.shift();
      while (this.expectedSeries.length) {
        expected = this.expectedSeries.shift();
        result = Utils.getPreviousNodePath(this.state, current);
        expect(result).to.equal(expected);
        current = expected;
      }
    })
  });

});

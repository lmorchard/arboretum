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

    this.expectedSiblings = [
      ['0', '1', '2', '3', '4'],
      ['1.children.0', '1.children.1', '1.children.2'],
      ['1.children.1.children.0', '1.children.1.children.1'],
      ['3.children.0']
      ['3.children.0.children.0'],
      ['3.children.0.children.0.children.0'],
    ];

  });

  describe('splitPath', function () {
    it('should split a dot-delimited path into a key array', function () {
      expect(Utils.splitPath('1.children.1.children.2'))
        .to.deep.equal(['1', 'children', '1', 'children', '2']);
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
  });

  function commonSiblingPathTest (inReverse, state, expectedSiblings) {
    var traversal = inReverse ?
      Utils.getPreviousSiblingPath :
      Utils.getNextSiblingPath;
    var siblingList;
    while (siblingList = expectedSiblings.shift()) {
      if (inReverse) { siblingList.reverse(); }
      var current, expected, result;
      current = siblingList.shift();
      while (siblingList.length) {
        expected = siblingList.shift();
        result = traversal(state, current);
        expect(result).to.equal(expected);
        current = expected;
      }
      result = traversal(state, current);
      expect(result).to.equal(null);
    }
  }

  describe('getNextSiblingPath', function () {
    it('should find the path to the next sibling', function () {
      commonSiblingPathTest(false, this.state, this.expectedSiblings);
    });
  });

  describe('getPreviousSiblingPath', function () {
    it('should find the path to the previous sibling', function () {
      commonSiblingPathTest(true, this.state, this.expectedSiblings);
    });
  });

  function commonNodePathTest (inReverse, state, expectedSeries) {
    var current, expected, result;

    var traversal = (inReverse) ?
      Utils.getPreviousNodePath : Utils.getNextNodePath;

    if (inReverse) { expectedSeries.reverse(); }

    current = expectedSeries.shift();
    while (expectedSeries.length) {
      expected = expectedSeries.shift();
      result = traversal(state, current);
      expect(result).to.equal(expected);
      current = expected;
    }
  }

  describe('getNextNodePath', function () {

    it('should find the path to the next node', function () {
      commonNodePathTest(false, this.state, this.expectedSeries);
    })

    it('should skip children of collapsed nodes', function () {
      let state = this.state;
      ['1', '3.children.0'].forEach(path => {
        state = state.updateIn(
          path.split('.'),
          n => n.set('collapsed', true));
      });
      commonNodePathTest(false, state,
        ['0', '1', '2', '3', '3.children.0', '4']);
    });

  });

  describe('getPreviousNodePath', function () {

    it('should find the path to the previous node', function () {
      commonNodePathTest(true, this.state, this.expectedSeries);
    });

    it('should skip children of collapsed nodes', function () {
      let state = this.state;
      ['1', '3.children.0'].forEach(path => {
        state = state.updateIn(
          path.split('.'),
          n => n.set('collapsed', true));
      });
      commonNodePathTest(true, state,
        ['0', '1', '2', '3', '3.children.0', '4']);
    });

  });

});

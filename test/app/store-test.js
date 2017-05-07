import path from 'path';
import fs from 'fs';
import assert from 'assert';

import { expect } from "chai";
import Immutable from 'immutable';

import { makeGenID } from '../../lib/utils';
import { createInitialStore, createNode,
         positions, outlineActions } from '../../app/store';
const { insertNode, moveNode, deleteNode } = outlineActions;

describe('app/store', () => {

  it('handles basic outline store', () => {
    const expected = ['test1', 'test2', 'test3'];
    const store = titlesToStore(expected);
    expect(storeToTitles(store)).to.deep.equal(expected);
  });

  describe('outline', () => {

    describe('insertNode', () => {

      it('supports default insert at root', () => {
        const store = titlesToStore(['test1', 'test2', 'test3']);

        store.dispatch(insertNode(createNode({ title: 'inserted' })));

        expect(storeToTitles(store))
          .to.deep.equal(['inserted', 'test1', 'test2', 'test3']);
      });

      it('supports BEFORE position at root', () => {
        const store = titlesToStore(['test1', 'test2', 'test3']);

        store.dispatch(insertNode(
          createNode({ title: 'inserted' }),
          positions.BEFORE,
          findIdByTitle(store, 'test2')
        ));

        expect(storeToTitles(store))
          .to.deep.equal(['test1', 'inserted', 'test2', 'test3']);
      });

      it('supports AFTER position at root', () => {
        const store = titlesToStore(['test1', 'test2', 'test3']);

        store.dispatch(insertNode(
          createNode({ title: 'inserted' }),
          positions.AFTER,
          findIdByTitle(store, 'test2')
        ));

        expect(storeToTitles(store))
          .to.deep.equal(['test1', 'test2', 'inserted', 'test3']);
      });

      it('supports ADOPT position at root', () => {
        const store = titlesToStore(['test1', 'test2', 'test3']);

        ['inserted1', 'inserted2', 'inserted3'].forEach(title =>
          store.dispatch(insertNode(
            createNode({ title }),
            positions.ADOPT,
            findIdByTitle(store, 'test2')
          )));

        expect(storeToTitles(store))
          .to.deep.equal([
            'test1',
            ['test2', [ 'inserted3', 'inserted2', 'inserted1' ]],
            'test3'
          ]);
      });

      it('supports ADOPT_LAST position at root', () => {
        const store = titlesToStore(['test1', 'test2', 'test3']);

        ['inserted1', 'inserted2', 'inserted3'].forEach(title =>
          store.dispatch(insertNode(
            createNode({ title }),
            positions.ADOPT_LAST,
            findIdByTitle(store, 'test2')
          )));

        expect(storeToTitles(store))
          .to.deep.equal([
            'test1',
            ['test2', [ 'inserted1', 'inserted2', 'inserted3' ]],
            'test3'
          ]);
      });

      it('supports BEFORE position at child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', [ 'child1', 'child2', 'child3' ]],
          'test3'
        ]);

        ['inserted1', 'inserted2', 'inserted3'].forEach(title =>
          store.dispatch(insertNode(
            createNode({ title }),
            positions.BEFORE,
            findIdByTitle(store, 'child2')
          )));

        expect(storeToTitles(store))
          .to.deep.equal([
            'test1',
            ['test2', [ 'child1', 'inserted1', 'inserted2', 'inserted3', 'child2', 'child3' ]],
            'test3'
          ]);
      });

      it('supports AFTER position at child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', [ 'child1', 'child2', 'child3' ]],
          'test3'
        ]);

        ['inserted1', 'inserted2', 'inserted3'].forEach(title =>
          store.dispatch(insertNode(
            createNode({ title }),
            positions.AFTER,
            findIdByTitle(store, 'child2')
          )));

        expect(storeToTitles(store))
          .to.deep.equal([
            'test1',
            ['test2', [
              'child1', 'child2', 'inserted3', 'inserted2', 'inserted1', 'child3'
            ]],
            'test3'
          ]);
      });

      it('supports ADOPT position at child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', [ 'child1', 'child2', 'child3' ]],
          'test3'
        ]);

        ['inserted1', 'inserted2', 'inserted3'].forEach(title =>
          store.dispatch(insertNode(
            createNode({ title }),
            positions.ADOPT,
            findIdByTitle(store, 'child2')
          )));

        expect(storeToTitles(store))
          .to.deep.equal([
            'test1',
            ['test2', [
              'child1', ['child2', ['inserted3', 'inserted2', 'inserted1']], 'child3'
            ]],
            'test3'
          ]);
      });

      it('supports ADOPT_LAST position at child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', [ 'child1', 'child2', 'child3' ]],
          'test3'
        ]);

        ['inserted1', 'inserted2', 'inserted3'].forEach(title =>
          store.dispatch(insertNode(
            createNode({ title }),
            positions.ADOPT_LAST,
            findIdByTitle(store, 'child2')
          )));

        expect(storeToTitles(store))
          .to.deep.equal([
            'test1',
            ['test2', [
              'child1', ['child2', ['inserted1', 'inserted2', 'inserted3']], 'child3'
            ]],
            'test3'
          ]);
      });

    });

    describe('moveNode', () => {

      it('supports BEFORE position at root', () => {
        const store = titlesToStore(['test1', 'test2', 'test3']);

        store.dispatch(moveNode(
          findIdByTitle(store, 'test3'),
          positions.BEFORE,
          findIdByTitle(store, 'test1')
        ));

        expect(storeToTitles(store))
          .to.deep.equal(['test3', 'test1', 'test2']);
      });

      it('supports AFTER position at root', () => {
        const store = titlesToStore(['test1', 'test2', 'test3']);

        store.dispatch(moveNode(
          findIdByTitle(store, 'test3'),
          positions.AFTER,
          findIdByTitle(store, 'test1')
        ));

        expect(storeToTitles(store))
          .to.deep.equal(['test1', 'test3', 'test2']);
      });

      it('supports ADOPT position at root', () => {
        const store = titlesToStore([['test1', ['test2']], 'test3', 'toMove']);

        store.dispatch(moveNode(
          findIdByTitle(store, 'toMove'),
          positions.ADOPT,
          findIdByTitle(store, 'test1')
        ));

        expect(storeToTitles(store))
          .to.deep.equal([['test1', ['toMove', 'test2']], 'test3']);
      });

      it('supports ADOPT_LAST position at root', () => {
        const store = titlesToStore([['test1', ['test2']], 'test3', 'toMove']);

        store.dispatch(moveNode(
          findIdByTitle(store, 'toMove'),
          positions.ADOPT_LAST,
          findIdByTitle(store, 'test1')
        ));

        expect(storeToTitles(store))
          .to.deep.equal([['test1', ['test2', 'toMove']], 'test3']);
      });

      it('supports BEFORE position at child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', ['child1', 'child2', 'child3']],
          'test3',
          'toMove'
        ]);

        store.dispatch(moveNode(
          findIdByTitle(store, 'toMove'),
          positions.BEFORE,
          findIdByTitle(store, 'child2')
        ));

        expect(storeToTitles(store)).to.deep.equal([
          'test1',
          ['test2', ['child1', 'toMove', 'child2', 'child3']],
          'test3'
        ]);
      });

      it('supports AFTER position at child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', ['child1', 'child2', 'child3']],
          'test3',
          'toMove'
        ]);

        store.dispatch(moveNode(
          findIdByTitle(store, 'toMove'),
          positions.AFTER,
          findIdByTitle(store, 'child2')
        ));

        expect(storeToTitles(store)).to.deep.equal([
          'test1',
          ['test2', ['child1', 'child2', 'toMove', 'child3']],
          'test3'
        ]);
      });

      it('supports ADOPT position at child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', ['child1', ['child2', ['subchild1']], 'child3']],
          'test3',
          'toMove'
        ]);

        store.dispatch(moveNode(
          findIdByTitle(store, 'toMove'),
          positions.ADOPT,
          findIdByTitle(store, 'child2')
        ));

        expect(storeToTitles(store)).to.deep.equal([
          'test1',
          ['test2', ['child1', ['child2', ['toMove', 'subchild1']], 'child3']],
          'test3'
        ]);
      });

      it('supports ADOPT_LAST position at child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', ['child1', ['child2', ['subchild1']], 'child3']],
          'test3',
          'toMove'
        ]);

        store.dispatch(moveNode(
          findIdByTitle(store, 'toMove'),
          positions.ADOPT_LAST,
          findIdByTitle(store, 'child2')
        ));

        expect(storeToTitles(store)).to.deep.equal([
          'test1',
          ['test2', ['child1', ['child2', ['subchild1', 'toMove']], 'child3']],
          'test3'
        ]);
      });

    });

    describe('deleteNode', () => {

      it('supports delete at root', () => {
        const store = titlesToStore(['test1', 'test2', 'test3']);

        store.dispatch(deleteNode(findIdByTitle(store, 'test2')));

        expect(findIdByTitle(store, 'test2')).to.be.undefined;
        expect(storeToTitles(store)).to.deep.equal(['test1', 'test3']);
      });

      it('supports delete of child', () => {
        const store = titlesToStore([
          'test1',
          ['test2', ['child1', 'child2', 'child3']],
          'test3'
        ]);

        store.dispatch(deleteNode(findIdByTitle(store, 'child2')));

        expect(findIdByTitle(store, 'child2')).to.be.undefined;
        expect(storeToTitles(store)).to.deep.equal([
          'test1',
          ['test2', ['child1', 'child3']],
          'test3'
        ]);
      });

    });

  });

});

const titlesToStore = dataIn => {
  const genId = makeGenID();
  const outline = { meta: {}, root: [], nodes: {} };
  const load = (data, parent) => {
    data.forEach(item => {
      let title, children;
      if (Array.isArray(item)) {
        [title, children] = item;
      } else {
        title = item;
      }
      const id = genId();
      const node = outline.nodes[id] = {
        id,
        attributes: { title },
        parent: parent ? parent.id : null,
        children: []
      };
      if (parent) {
        parent.children.push(id);
      } else {
        outline.root.push(id);
      }
      if (children) { load(children, node); }
    });
  };
  load(dataIn);
  return createInitialStore({ outline });
};

const outlineState = store => store.getState().outline;

const findIdByTitle = (store, title) =>
  ( outlineState(store).get('nodes').find(v => v.getIn(['attributes', 'title']) === title) ||
    Immutable.Map() )
  .get('id');

const storeToTitles = store => {
  const state = outlineState(store);
  const serialize = root => root.map(id => {
    const node = state.getIn(['nodes', id]);
    const title = node.getIn(['attributes', 'title']);
    const children = node.get('children');
    return children.count() === 0 ? title : [ title, serialize(children) ];
  }).toJS();
  return serialize(state.get('root'));
};

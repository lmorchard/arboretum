(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/lmorchard/devel/arboretum/src/index.js":[function(require,module,exports){
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _actions = require('./lib/actions');

var actions = _interopRequireWildcard(_actions);

var _reducers = require('./lib/reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _components = require('./lib/components');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = function logger(store) {
  return function (next) {
    return function (action) {
      console.log('dispatching', action);
      var result = next(action);
      console.log('next state', store.getState());
      return result;
    };
  };
};

var createStoreWithMiddleware = (0, _redux.applyMiddleware)(logger)(_redux.createStore);

var store = createStoreWithMiddleware(_reducers2.default, {
  nodes: _immutable2.default.fromJS([{ title: "alpha" }, { title: "beta", children: [{ title: "foo" }, { title: "bar", children: [{ title: "quux" }, { title: "xyzzy" }] }, { title: "baz" }] }, { title: "gamma" }])
});

window.store = store;

_reactDom2.default.render(_react2.default.createElement(
  _reactRedux.Provider,
  { store: store },
  _react2.default.createElement(_components.Outline, null)
), document.getElementById('app'));

},{"./lib/actions":"/Users/lmorchard/devel/arboretum/src/lib/actions.js","./lib/components":"/Users/lmorchard/devel/arboretum/src/lib/components.js","./lib/reducers":"/Users/lmorchard/devel/arboretum/src/lib/reducers.js","immutable":"immutable","react":"react","react-dom":"react-dom","react-redux":"react-redux","redux":"redux"}],"/Users/lmorchard/devel/arboretum/src/lib/actions.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insertNode = insertNode;
exports.deleteNode = deleteNode;
exports.moveNode = moveNode;
var MOVE_NODE = exports.MOVE_NODE = 'MOVE_NODE';
var INSERT_NODE = exports.INSERT_NODE = 'INSERT_NODE';
var DELETE_NODE = exports.DELETE_NODE = 'DELETE_NODE';
var CHANGE_NODE_TITLE = exports.CHANGE_NODE_TITLE = 'CHANGE_NODE_TITLE';

var MovePositions = exports.MovePositions = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
  ADOPT: 'ADOPT'
};

function insertNode(node, path, before) {
  return { type: INSERT_NODE, node: node, path: path, before: before };
}

function deleteNode(path) {
  return { type: DELETE_NODE, path: path };
}

function moveNode(fromPath, toPath, position) {
  return { type: MOVE_NODE, fromPath: fromPath, toPath: toPath, position: position };
}

},{}],"/Users/lmorchard/devel/arboretum/src/lib/components.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OutlineNode = exports.OutlineTree = exports.Outline = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Outline = exports.Outline = (0, _reactRedux.connect)(function (state) {
  return { nodes: state.nodes.toJS() };
})(function (_ref) {
  var dispatch = _ref.dispatch;
  var nodes = _ref.nodes;
  return _react2.default.createElement(OutlineTree, { dispatch: dispatch, nodes: nodes, path: '' });
});

var OutlineTree = exports.OutlineTree = function OutlineTree(_ref2) {
  var dispatch = _ref2.dispatch;
  var nodes = _ref2.nodes;
  var path = _ref2.path;
  return _react2.default.createElement(
    'ul',
    { className: 'outline' },
    nodes.map(function (node, index) {
      return _react2.default.createElement(OutlineNode, { dispatch: dispatch, node: node,
        key: index, index: index, path: path + index });
    })
  );
};

var OutlineNode = exports.OutlineNode = _react2.default.createClass({
  displayName: 'OutlineNode',
  getInitialState: function getInitialState() {
    return {
      dragging: false,
      positionPreview: null
    };
  },
  render: function render() {
    var _props = this.props;
    var dispatch = _props.dispatch;
    var node = _props.node;
    var path = _props.path;
    var positionPreview = this.state.positionPreview;

    var style = {
      padding: '0.125em',
      backgroundColor: positionPreview == actions.MovePositions.ADOPT ? '#ccc' : 'transparent',
      borderTop: positionPreview == actions.MovePositions.BEFORE ? '1px solid #ccc' : '1px solid transparent',
      borderBottom: positionPreview == actions.MovePositions.AFTER ? '1px solid #ccc' : '1px solid transparent',
      opacity: this.state.dragging ? 0.5 : 1
    };
    var titleStyle = {};
    return _react2.default.createElement(
      'li',
      { className: 'outline-node',
        style: style,
        draggable: true,
        onDragStart: this.onDragStart,
        onDragEnter: this.onDragEnter,
        onDragOver: this.onDragOver,
        onDragLeave: this.onDragLeave,
        onDragEnd: this.onDragEnd,
        onDrop: this.onDrop.bind(this, dispatch) },
      _react2.default.createElement(
        'button',
        { style: { margin: "0 0.5em" },
          onClick: this.onDelete.bind(this, dispatch) },
        'X'
      ),
      _react2.default.createElement(
        'span',
        { className: 'title',
          style: titleStyle },
        node.title
      ),
      !node.children ? null : _react2.default.createElement(OutlineTree, { dispatch: dispatch,
        path: path + '.children.', nodes: node.children })
    );
  },
  onDragStart: function onDragStart(ev) {
    var _props2 = this.props;
    var path = _props2.path;
    var node = _props2.node;

    setDragMeta(ev, { path: path });
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', JSON.stringify({ path: path, node: node }));
    this.setState({ dragging: true });
    ev.stopPropagation();
  },
  onDragEnter: function onDragEnter(ev) {
    var _getDragMeta = getDragMeta(ev);

    var draggedPath = _getDragMeta.path;

    if (draggedPath != this.props.path) {
      ev.dataTransfer.dropEffect = 'move';
    }
    return stahp(ev);
  },
  onDragOver: function onDragOver(ev) {
    var _getDragMeta2 = getDragMeta(ev);

    var draggedPath = _getDragMeta2.path;

    if (this.props.path.indexOf(draggedPath) !== 0) {
      var rect = ev.target.getBoundingClientRect();
      var pos = ev.clientX > rect.left + 50 ? 'ADOPT' : ev.clientY < rect.top + rect.height / 2 ? 'BEFORE' : 'AFTER';
      this.setState({ positionPreview: actions.MovePositions[pos] });
    }
    return stahp(ev);
  },
  onDragLeave: function onDragLeave(ev) {
    this.setState({ positionPreview: null });
    return stahp(ev);
  },
  onDragEnd: function onDragEnd(ev) {
    this.setState({ dragging: false });
    return stahp(ev);
  },
  onDrop: function onDrop(dispatch, ev) {
    // TODO: Accept drops from outside the browser.

    var _getDragMeta3 = getDragMeta(ev);

    var draggedPath = _getDragMeta3.path;

    var data = JSON.parse(ev.dataTransfer.getData('text'));
    if (this.props.path.indexOf(draggedPath) !== 0) {
      dispatch(actions.moveNode(data.path, this.props.path, this.state.positionPreview));
    }
    this.setState({ positionPreview: null });
    return stahp(ev);
  },
  onDelete: function onDelete(dispatch, ev) {
    dispatch(actions.deleteNode(this.props.path));
    return stahp(ev);
  }
});

function stahp(ev) {
  ev.stopPropagation();
  ev.preventDefault();
}

// HACK: Encode data in type names to circumvent dataTransfer protected mode
// http://www.w3.org/TR/2011/WD-html5-20110113/dnd.html#concept-dnd-p
function setDragMeta(ev, data) {
  Object.keys(data).forEach(function (key) {
    ev.dataTransfer.setData('x-meta/' + key + '/' + data[key], data[key]);
  });
}

// HACK: Decode data from type names to circumvent dataTransfer protected mode
// http://www.w3.org/TR/2011/WD-html5-20110113/dnd.html#concept-dnd-p
function getDragMeta(ev) {
  var data = {};
  var types = ev.dataTransfer.types;
  for (var i = 0; i < types.length; i++) {
    var parts = types[i].split('/');
    if (parts[0] == 'x-meta') {
      data[parts[1]] = parts[2];
    }
  }
  return data;
}

},{"./actions":"/Users/lmorchard/devel/arboretum/src/lib/actions.js","react":"react","react-dom":"react-dom","react-redux":"react-redux"}],"/Users/lmorchard/devel/arboretum/src/lib/reducers.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function nodes() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  var action = arguments[1];

  switch (action.type) {

    case actions.INSERT_NODE:
      return state;

    case actions.DELETE_NODE:
      // TODO: Need to prune empty children lists from parents?
      return state.deleteIn(action.path.split('.'));

    case actions.MOVE_NODE:
      var position = action.position;
      var fromPath = action.fromPath.split('.');
      var toPath = action.toPath.split('.');

      // Grab the node from the tree.
      var node = state.getIn(fromPath);

      // HACK: Set the node null to mark for deletion. Doing this because I'm
      // too lazy to recalculate toPath to compensate for the missing node.
      // Might discover this is regrettably expensive, later.
      state = state.setIn(fromPath, null);

      // Insert the node into the new position...
      if (position == actions.MovePositions.ADOPT) {
        // Adopt the node into parent, creating the child list if necessary.
        state = state.updateIn(toPath, function (parent) {
          return parent.has('children') ? parent.update('children', function (children) {
            return children.unshift(node);
          }) : parent.set('children', _immutable2.default.List([node]));
        });
      } else {
        (function () {
          // Insert node before or after toPath, depending on action position
          var index = parseInt(toPath.pop()) + (position == actions.MovePositions.BEFORE) ? 0 : 1;
          state = state.updateIn(toPath, function (nodes) {
            return nodes.splice(index, 0, node);
          });
        })();
      }

      // Remove any nodes marked to be deleted.
      return state.update(omitNullNodes);

    case actions.CHANGE_NODE_TITLE:
      return state;

    default:
      return state;

  }
}

var omitNullNodes = function omitNullNodes(children) {
  return children.filter(function (node) {
    return node !== null;
  }).map(function (node) {
    return !node.has('children') ? node : node.update('children', omitNullNodes);
  });
};

exports.default = (0, _redux.combineReducers)({
  nodes: nodes
});

},{"./actions":"/Users/lmorchard/devel/arboretum/src/lib/actions.js","immutable":"immutable","redux":"redux"}]},{},["/Users/lmorchard/devel/arboretum/src/index.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbGliL2FjdGlvbnMuanMiLCJzcmMvbGliL2NvbXBvbmVudHMuanMiLCJzcmMvbGliL3JlZHVjZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNRWSxPQUFPOzs7Ozs7Ozs7Ozs7QUFJbkIsSUFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUcsS0FBSztTQUFJLFVBQUEsSUFBSTtXQUFJLFVBQUEsTUFBTSxFQUFJO0FBQ3hDLGFBQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ2xDLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN6QixhQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUMzQyxhQUFPLE1BQU0sQ0FBQTtLQUNkO0dBQUE7Q0FBQSxDQUFDOztBQUVGLElBQU0seUJBQXlCLEdBQUcsV0FiWixlQUFlLEVBYWEsTUFBTSxDQUFDLFFBYmhELFdBQVcsQ0Fha0QsQ0FBQzs7QUFFdkUsSUFBTSxLQUFLLEdBQUcseUJBQXlCLHFCQUFXO0FBQ2hELE9BQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsQ0FDdEIsRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLEVBQ2hCLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FDeEIsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLEVBQ2QsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUN2QixFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsRUFDZixFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FDakIsRUFBQyxFQUNGLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFB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QSxBQUVyQyxTQUFLLE9BQU8sQ0FBQyxpQkFBaUI7QUFDNUIsYUFBTyxLQUFLLENBQUM7O0FBQUEsQUFFZjtBQUNFLGFBQU8sS0FBSyxDQUFDOztBQUFBLEdBRWhCO0NBQ0Y7O0FBRUQsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFJLFFBQVE7U0FDM0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7V0FBSSxJQUFJLEtBQUssSUFBSTtHQUFBLENBQUMsQ0FDN0IsR0FBRyxDQUFDLFVBQUEsSUFBSTtXQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FDckIsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQztHQUFBLENBQUM7Q0FBQSxDQUFDOztrQkFFekQsV0ExRE4sZUFBZSxFQTBETztBQUM3QixPQUFLLEVBQUwsS0FBSztDQUNOLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuXG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5cbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtcmVkdXgnO1xuaW1wb3J0IHsgY3JlYXRlU3RvcmUsIGFwcGx5TWlkZGxld2FyZSB9IGZyb20gJ3JlZHV4JztcblxuaW1wb3J0ICogYXMgYWN0aW9ucyBmcm9tICcuL2xpYi9hY3Rpb25zJztcbmltcG9ydCByZWR1Y2VycyBmcm9tICcuL2xpYi9yZWR1Y2Vycyc7XG5pbXBvcnQgeyBPdXRsaW5lIH0gZnJvbSAnLi9saWIvY29tcG9uZW50cyc7XG5cbmNvbnN0IGxvZ2dlciA9IHN0b3JlID0+IG5leHQgPT4gYWN0aW9uID0+IHtcbiAgY29uc29sZS5sb2coJ2Rpc3BhdGNoaW5nJywgYWN0aW9uKVxuICBsZXQgcmVzdWx0ID0gbmV4dChhY3Rpb24pXG4gIGNvbnNvbGUubG9nKCduZXh0IHN0YXRlJywgc3RvcmUuZ2V0U3RhdGUoKSlcbiAgcmV0dXJuIHJlc3VsdFxufTtcblxuY29uc3QgY3JlYXRlU3RvcmVXaXRoTWlkZGxld2FyZSA9IGFwcGx5TWlkZGxld2FyZShsb2dnZXIpKGNyZWF0ZVN0b3JlKTtcblxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZVdpdGhNaWRkbGV3YXJlKHJlZHVjZXJzLCB7XG4gIG5vZGVzOiBJbW11dGFibGUuZnJvbUpTKFtcbiAgICB7dGl0bGU6IFwiYWxwaGFcIn0sXG4gICAge3RpdGxlOiBcImJldGFcIiwgY2hpbGRyZW46IFtcbiAgICAgIHt0aXRsZTogXCJmb29cIn0sXG4gICAgICB7dGl0bGU6IFwiYmFyXCIsIGNoaWxkcmVuOiBbXG4gICAgICAgIHt0aXRsZTogXCJxdXV4XCJ9LFxuICAgICAgICB7dGl0bGU6IFwieHl6enlcIn1cbiAgICAgIF19LFxuICAgICAge3RpdGxlOiBcImJhelwifVxuICAgIF19LFxuICAgIHt0aXRsZTogXCJnYW1tYVwifVxuICBdKVxufSk7XG5cbndpbmRvdy5zdG9yZSA9IHN0b3JlO1xuXG5SZWFjdERPTS5yZW5kZXIoXG4gIDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuICAgIDxPdXRsaW5lIC8+XG4gIDwvUHJvdmlkZXI+LFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJylcbik7XG4iLCJleHBvcnQgY29uc3QgTU9WRV9OT0RFID0gJ01PVkVfTk9ERSc7XG5leHBvcnQgY29uc3QgSU5TRVJUX05PREUgPSAnSU5TRVJUX05PREUnO1xuZXhwb3J0IGNvbnN0IERFTEVURV9OT0RFID0gJ0RFTEVURV9OT0RFJztcbmV4cG9ydCBjb25zdCBDSEFOR0VfTk9ERV9USVRMRSA9ICdDSEFOR0VfTk9ERV9USVRMRSc7XG5cbmV4cG9ydCBjb25zdCBNb3ZlUG9zaXRpb25zID0ge1xuICBCRUZPUkU6ICdCRUZPUkUnLFxuICBBRlRFUjogJ0FGVEVSJyxcbiAgQURPUFQ6ICdBRE9QVCdcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnROb2RlKG5vZGUsIHBhdGgsIGJlZm9yZSkge1xuICByZXR1cm4geyB0eXBlOiBJTlNFUlRfTk9ERSwgbm9kZSwgcGF0aCwgYmVmb3JlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVOb2RlKHBhdGgpIHtcbiAgcmV0dXJuIHsgdHlwZTogREVMRVRFX05PREUsIHBhdGggfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVOb2RlKGZyb21QYXRoLCB0b1BhdGgsIHBvc2l0aW9uKSB7XG4gIHJldHVybiB7IHR5cGU6IE1PVkVfTk9ERSwgZnJvbVBhdGgsIHRvUGF0aCwgcG9zaXRpb24gfTtcbn1cbiIsImltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQsIFByb3BUeXBlcyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJ3JlYWN0LXJlZHV4JztcblxuaW1wb3J0ICogYXMgYWN0aW9ucyBmcm9tICcuL2FjdGlvbnMnO1xuXG5leHBvcnQgY29uc3QgT3V0bGluZSA9IGNvbm5lY3Qoc3RhdGUgPT4ge1xuICByZXR1cm4geyBub2Rlczogc3RhdGUubm9kZXMudG9KUygpIH07XG59KSgoeyBkaXNwYXRjaCwgbm9kZXMgfSkgPT5cbiAgPE91dGxpbmVUcmVlIGRpc3BhdGNoPXtkaXNwYXRjaH0gbm9kZXM9e25vZGVzfSBwYXRoPVwiXCIgLz5cbik7XG5cbmV4cG9ydCBjb25zdCBPdXRsaW5lVHJlZSA9ICh7IGRpc3BhdGNoLCBub2RlcywgcGF0aCB9KSA9PlxuICA8dWwgY2xhc3NOYW1lPVwib3V0bGluZVwiPlxuICAgIHtub2Rlcy5tYXAoKG5vZGUsIGluZGV4KSA9PlxuICAgICAgPE91dGxpbmVOb2RlIGRpc3BhdGNoPXtkaXNwYXRjaH0gbm9kZT17bm9kZX1cbiAgICAgICAga2V5PXtpbmRleH0gaW5kZXg9e2luZGV4fSBwYXRoPXtwYXRoICsgaW5kZXh9IC8+XG4gICAgKX1cbiAgPC91bD47XG5cbmV4cG9ydCBjb25zdCBPdXRsaW5lTm9kZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkcmFnZ2luZzogZmFsc2UsXG4gICAgICBwb3NpdGlvblByZXZpZXc6IG51bGxcbiAgICB9O1xuICB9LFxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBkaXNwYXRjaCwgbm9kZSwgcGF0aCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IHBvc2l0aW9uUHJldmlldyB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBzdHlsZSA9IHtcbiAgICAgIHBhZGRpbmc6ICcwLjEyNWVtJyxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogcG9zaXRpb25QcmV2aWV3ID09IGFjdGlvbnMuTW92ZVBvc2l0aW9ucy5BRE9QVCA/XG4gICAgICAgICcjY2NjJyA6ICd0cmFuc3BhcmVudCcsXG4gICAgICBib3JkZXJUb3A6IHBvc2l0aW9uUHJldmlldyA9PSBhY3Rpb25zLk1vdmVQb3NpdGlvbnMuQkVGT1JFID9cbiAgICAgICAgJzFweCBzb2xpZCAjY2NjJyA6ICcxcHggc29saWQgdHJhbnNwYXJlbnQnLFxuICAgICAgYm9yZGVyQm90dG9tOiBwb3NpdGlvblByZXZpZXcgPT0gYWN0aW9ucy5Nb3ZlUG9zaXRpb25zLkFGVEVSID9cbiAgICAgICAgJzFweCBzb2xpZCAjY2NjJyA6ICcxcHggc29saWQgdHJhbnNwYXJlbnQnLFxuICAgICAgb3BhY2l0eTogKHRoaXMuc3RhdGUuZHJhZ2dpbmcpID8gMC41IDogMVxuICAgIH07XG4gICAgY29uc3QgdGl0bGVTdHlsZSA9IHtcbiAgICB9O1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPVwib3V0bGluZS1ub2RlXCJcbiAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgZHJhZ2dhYmxlPXt0cnVlfVxuICAgICAgICAgIG9uRHJhZ1N0YXJ0PXt0aGlzLm9uRHJhZ1N0YXJ0fVxuICAgICAgICAgIG9uRHJhZ0VudGVyPXt0aGlzLm9uRHJhZ0VudGVyfVxuICAgICAgICAgIG9uRHJhZ092ZXI9e3RoaXMub25EcmFnT3Zlcn1cbiAgICAgICAgICBvbkRyYWdMZWF2ZT17dGhpcy5vbkRyYWdMZWF2ZX1cbiAgICAgICAgICBvbkRyYWdFbmQ9e3RoaXMub25EcmFnRW5kfVxuICAgICAgICAgIG9uRHJvcD17dGhpcy5vbkRyb3AuYmluZCh0aGlzLCBkaXNwYXRjaCl9PlxuICAgICAgICA8YnV0dG9uIHN0eWxlPXt7IG1hcmdpbjogXCIwIDAuNWVtXCIgfX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRGVsZXRlLmJpbmQodGhpcywgZGlzcGF0Y2gpfT5YPC9idXR0b24+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRpdGxlXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3RpdGxlU3R5bGV9Pntub2RlLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgeyghbm9kZS5jaGlsZHJlbikgPyBudWxsIDogKFxuICAgICAgICAgIDxPdXRsaW5lVHJlZSBkaXNwYXRjaD17ZGlzcGF0Y2h9XG4gICAgICAgICAgICAgICAgICAgICAgIHBhdGg9e3BhdGggKyAnLmNoaWxkcmVuLid9IG5vZGVzPXtub2RlLmNoaWxkcmVufSAvPlxuICAgICAgICApfVxuICAgICAgPC9saT5cbiAgICApO1xuICB9LFxuICBvbkRyYWdTdGFydChldikge1xuICAgIGNvbnN0IHsgcGF0aCwgbm9kZSB9ID0gdGhpcy5wcm9wcztcbiAgICBzZXREcmFnTWV0YShldiwge3BhdGh9KTtcbiAgICBldi5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9ICdtb3ZlJztcbiAgICBldi5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9wbGFpbicsIEpTT04uc3RyaW5naWZ5KHtwYXRoLCBub2RlfSkpO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBkcmFnZ2luZzogdHJ1ZSB9KTtcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcbiAgb25EcmFnRW50ZXIoZXYpIHtcbiAgICBjb25zdCB7IHBhdGg6IGRyYWdnZWRQYXRoIH0gPSBnZXREcmFnTWV0YShldik7XG4gICAgaWYgKGRyYWdnZWRQYXRoICE9IHRoaXMucHJvcHMucGF0aCkge1xuICAgICAgZXYuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSc7XG4gICAgfVxuICAgIHJldHVybiBzdGFocChldik7XG4gIH0sXG4gIG9uRHJhZ092ZXIoZXYpIHtcbiAgICBjb25zdCB7IHBhdGg6IGRyYWdnZWRQYXRoIH0gPSBnZXREcmFnTWV0YShldik7XG4gICAgaWYgKHRoaXMucHJvcHMucGF0aC5pbmRleE9mKGRyYWdnZWRQYXRoKSAhPT0gMCkge1xuICAgICAgY29uc3QgcmVjdCA9IGV2LnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IHBvcyA9IChldi5jbGllbnRYID4gKHJlY3QubGVmdCArIDUwKSkgPyAnQURPUFQnIDpcbiAgICAgICAgICAgICAgICAgIChldi5jbGllbnRZIDwgKHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyKSkgPyAnQkVGT1JFJyA6XG4gICAgICAgICAgICAgICAgICAnQUZURVInO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBvc2l0aW9uUHJldmlldzogYWN0aW9ucy5Nb3ZlUG9zaXRpb25zW3Bvc10gfSk7XG4gICAgfVxuICAgIHJldHVybiBzdGFocChldik7XG4gIH0sXG4gIG9uRHJhZ0xlYXZlKGV2KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBvc2l0aW9uUHJldmlldzogbnVsbCB9KTtcbiAgICByZXR1cm4gc3RhaHAoZXYpO1xuICB9LFxuICBvbkRyYWdFbmQoZXYpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgZHJhZ2dpbmc6IGZhbHNlIH0pO1xuICAgIHJldHVybiBzdGFocChldik7XG4gIH0sXG4gIG9uRHJvcChkaXNwYXRjaCwgZXYpIHtcbiAgICAvLyBUT0RPOiBBY2NlcHQgZHJvcHMgZnJvbSBvdXRzaWRlIHRoZSBicm93c2VyLlxuICAgIGNvbnN0IHsgcGF0aDogZHJhZ2dlZFBhdGggfSA9IGdldERyYWdNZXRhKGV2KTtcbiAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShldi5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dCcpKTtcbiAgICBpZiAodGhpcy5wcm9wcy5wYXRoLmluZGV4T2YoZHJhZ2dlZFBhdGgpICE9PSAwKSB7XG4gICAgICBkaXNwYXRjaChhY3Rpb25zLm1vdmVOb2RlKGRhdGEucGF0aCwgdGhpcy5wcm9wcy5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnBvc2l0aW9uUHJldmlldykpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHsgcG9zaXRpb25QcmV2aWV3OiBudWxsIH0pO1xuICAgIHJldHVybiBzdGFocChldik7XG4gIH0sXG4gIG9uRGVsZXRlKGRpc3BhdGNoLCBldikge1xuICAgIGRpc3BhdGNoKGFjdGlvbnMuZGVsZXRlTm9kZSh0aGlzLnByb3BzLnBhdGgpKVxuICAgIHJldHVybiBzdGFocChldik7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBzdGFocChldikge1xuICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZXYucHJldmVudERlZmF1bHQoKTtcbn1cblxuLy8gSEFDSzogRW5jb2RlIGRhdGEgaW4gdHlwZSBuYW1lcyB0byBjaXJjdW12ZW50IGRhdGFUcmFuc2ZlciBwcm90ZWN0ZWQgbW9kZVxuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvMjAxMS9XRC1odG1sNS0yMDExMDExMy9kbmQuaHRtbCNjb25jZXB0LWRuZC1wXG5mdW5jdGlvbiBzZXREcmFnTWV0YShldiwgZGF0YSkge1xuICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgZXYuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3gtbWV0YS8nICsga2V5ICsgJy8nICsgZGF0YVtrZXldLCBkYXRhW2tleV0pO1xuICB9KTtcbn1cblxuLy8gSEFDSzogRGVjb2RlIGRhdGEgZnJvbSB0eXBlIG5hbWVzIHRvIGNpcmN1bXZlbnQgZGF0YVRyYW5zZmVyIHByb3RlY3RlZCBtb2RlXG4vLyBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDExL1dELWh0bWw1LTIwMTEwMTEzL2RuZC5odG1sI2NvbmNlcHQtZG5kLXBcbmZ1bmN0aW9uIGdldERyYWdNZXRhKGV2KSB7XG4gIGNvbnN0IGRhdGEgPSB7fTtcbiAgY29uc3QgdHlwZXMgPSBldi5kYXRhVHJhbnNmZXIudHlwZXM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwYXJ0cyA9IHR5cGVzW2ldLnNwbGl0KCcvJyk7XG4gICAgaWYgKHBhcnRzWzBdID09ICd4LW1ldGEnKSB7XG4gICAgICBkYXRhW3BhcnRzWzFdXSA9IHBhcnRzWzJdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGF0YTtcbn1cbiIsImltcG9ydCB7IGNvbWJpbmVSZWR1Y2VycyB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcblxuaW1wb3J0ICogYXMgYWN0aW9ucyBmcm9tICcuL2FjdGlvbnMnO1xuXG5mdW5jdGlvbiBub2RlcyhzdGF0ZT1bXSwgYWN0aW9uKSB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcblxuICAgIGNhc2UgYWN0aW9ucy5JTlNFUlRfTk9ERTpcbiAgICAgIHJldHVybiBzdGF0ZTtcblxuICAgIGNhc2UgYWN0aW9ucy5ERUxFVEVfTk9ERTpcbiAgICAgIC8vIFRPRE86IE5lZWQgdG8gcHJ1bmUgZW1wdHkgY2hpbGRyZW4gbGlzdHMgZnJvbSBwYXJlbnRzP1xuICAgICAgcmV0dXJuIHN0YXRlLmRlbGV0ZUluKGFjdGlvbi5wYXRoLnNwbGl0KCcuJykpO1xuXG4gICAgY2FzZSBhY3Rpb25zLk1PVkVfTk9ERTpcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gYWN0aW9uLnBvc2l0aW9uO1xuICAgICAgY29uc3QgZnJvbVBhdGggPSBhY3Rpb24uZnJvbVBhdGguc3BsaXQoJy4nKTtcbiAgICAgIGNvbnN0IHRvUGF0aCA9IGFjdGlvbi50b1BhdGguc3BsaXQoJy4nKTtcblxuICAgICAgLy8gR3JhYiB0aGUgbm9kZSBmcm9tIHRoZSB0cmVlLlxuICAgICAgY29uc3Qgbm9kZSA9IHN0YXRlLmdldEluKGZyb21QYXRoKTtcblxuICAgICAgLy8gSEFDSzogU2V0IHRoZSBub2RlIG51bGwgdG8gbWFyayBmb3IgZGVsZXRpb24uIERvaW5nIHRoaXMgYmVjYXVzZSBJJ21cbiAgICAgIC8vIHRvbyBsYXp5IHRvIHJlY2FsY3VsYXRlIHRvUGF0aCB0byBjb21wZW5zYXRlIGZvciB0aGUgbWlzc2luZyBub2RlLlxuICAgICAgLy8gTWlnaHQgZGlzY292ZXIgdGhpcyBpcyByZWdyZXR0YWJseSBleHBlbnNpdmUsIGxhdGVyLlxuICAgICAgc3RhdGUgPSBzdGF0ZS5zZXRJbihmcm9tUGF0aCwgbnVsbCk7XG5cbiAgICAgIC8vIEluc2VydCB0aGUgbm9kZSBpbnRvIHRoZSBuZXcgcG9zaXRpb24uLi5cbiAgICAgIGlmIChwb3NpdGlvbiA9PSBhY3Rpb25zLk1vdmVQb3NpdGlvbnMuQURPUFQpIHtcbiAgICAgICAgLy8gQWRvcHQgdGhlIG5vZGUgaW50byBwYXJlbnQsIGNyZWF0aW5nIHRoZSBjaGlsZCBsaXN0IGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgc3RhdGUgPSBzdGF0ZS51cGRhdGVJbih0b1BhdGgsIHBhcmVudCA9PiBwYXJlbnQuaGFzKCdjaGlsZHJlbicpID9cbiAgICAgICAgICAgIHBhcmVudC51cGRhdGUoJ2NoaWxkcmVuJywgY2hpbGRyZW4gPT4gY2hpbGRyZW4udW5zaGlmdChub2RlKSkgOlxuICAgICAgICAgICAgcGFyZW50LnNldCgnY2hpbGRyZW4nLCBJbW11dGFibGUuTGlzdChbbm9kZV0pKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJbnNlcnQgbm9kZSBiZWZvcmUgb3IgYWZ0ZXIgdG9QYXRoLCBkZXBlbmRpbmcgb24gYWN0aW9uIHBvc2l0aW9uXG4gICAgICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQodG9QYXRoLnBvcCgpKSArXG4gICAgICAgICAgICAgICAgICAgICAgKHBvc2l0aW9uID09IGFjdGlvbnMuTW92ZVBvc2l0aW9ucy5CRUZPUkUpID8gMCA6IDE7XG4gICAgICAgIHN0YXRlID0gc3RhdGUudXBkYXRlSW4odG9QYXRoLCBub2RlcyA9PiBub2Rlcy5zcGxpY2UoaW5kZXgsIDAsIG5vZGUpKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIGFueSBub2RlcyBtYXJrZWQgdG8gYmUgZGVsZXRlZC5cbiAgICAgIHJldHVybiBzdGF0ZS51cGRhdGUob21pdE51bGxOb2Rlcyk7XG5cbiAgICBjYXNlIGFjdGlvbnMuQ0hBTkdFX05PREVfVElUTEU6XG4gICAgICByZXR1cm4gc3RhdGU7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlO1xuXG4gIH1cbn1cblxuY29uc3Qgb21pdE51bGxOb2RlcyA9IChjaGlsZHJlbikgPT5cbiAgICBjaGlsZHJlbi5maWx0ZXIobm9kZSA9PiBub2RlICE9PSBudWxsKVxuICAgICAgICAgICAgLm1hcChub2RlID0+ICFub2RlLmhhcygnY2hpbGRyZW4nKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSA6IG5vZGUudXBkYXRlKCdjaGlsZHJlbicsIG9taXROdWxsTm9kZXMpKTtcblxuZXhwb3J0IGRlZmF1bHQgY29tYmluZVJlZHVjZXJzKHtcbiAgbm9kZXNcbn0pO1xuIl19

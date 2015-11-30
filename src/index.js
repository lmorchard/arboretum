import React from 'react';
import ReactDOM from 'react-dom';

const OutlineNode = React.createClass({
  render() {
    var children = (!this.props.node.children) ? '' :
      (<Outline nodes={this.props.node.children} />);
    return (
      <li class="outline-node">
        <span class="title">{this.props.node.title}</span>
        {children}
      </li>
    );
  }
});

const Outline = React.createClass({
  render() {
    var nodes = this.props.nodes.map(node => (<OutlineNode node={node} />));
    return (
      <ul class="outline">
        {nodes}
      </ul>
    );
  }
});

const App = React.createClass({
  getInitialState() {
    return {
      nodes: [
        {title: "alpha"},
        {title: "beta", children: [
          {title: "foo"},
          {title: "bar"},
          {title: "baz"}
        ]},
        {title: "gamma"}
      ]
    }
  },
  render() {
    return (
      <Outline nodes={this.state.nodes} />
    );
  }
});

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

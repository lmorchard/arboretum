import React from 'react';
import ReactDOM from 'react-dom';

const OUTLINE_DATA = [
  {title: "alpha"},
  {title: "beta", children: [
    {title: "foo"},
    {title: "bar", children: [
      {title: "quux"},
      {title: "xyzzy"}
    ]},
    {title: "baz"}
  ]},
  {title: "gamma"}
];

const OutlineNode = React.createClass({
  getInitialState() {
    return {
      dragging: false,
      over: false,
      isDestination: false
    };
  },
  render() {
    const style = {
      opacity: (this.state.dragging) ? 0.5 : 1
    };
    const titleStyle = {
      display: 'block',
      backgroundColor: (this.state.isDestination) ? '#d33' : 'transparent',
    };
    return (
      <li className="outline-node"
          style={style}
          draggable={true}
          onDragStart={this.handleDragStart}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDragEnd={this.handleDragEnd}
          onDrop={this.handleDrop}>
        <span className="title" style={titleStyle}>{this.props.node.title}</span>
        {(!this.props.node.children) ? '' :
          (<Outline nodes={this.props.node.children} />)}
      </li>
    );
  },
  handleDragStart(ev) {
    this.setState({ dragging: true });
    ev.dataTransfer.setData('text/plain', JSON.stringify({
      index: this.props.index,
      node: this.props.node
    }));
    ev.stopPropagation();
  },
  handleDragEnter(ev) {
    /*
    if (ev.target == ReactDOM.findDOMNode(this)) {
      ev.dropEffect = 'none';
      return;
    }
    */
    ev.dropEffect = 'move';
    this.setState({ isDestination: true });
    console.log('DRAG ENTER', this.props.node.title);
    ev.stopPropagation();
    ev.preventDefault();
  },
  handleDragOver(ev) {
    // TODO: update drop location preview feedback
    ev.stopPropagation();
    ev.preventDefault();
  },
  handleDragLeave(ev) {
    this.setState({ isDestination: false });
    console.log('DRAG LEAVE', this.props.node.title);
    ev.stopPropagation();
    ev.preventDefault();
  },
  handleDragEnd(ev) {
    this.setState({ dragging: false });
    console.log("DRAG END", this.props.node.title, ev.dataTransfer.getData('text'));
    ev.stopPropagation();
    ev.preventDefault();
  },
  // TODO: Accept drops from outside the browser...
  handleDrop(ev) {
    this.setState({ isDestination: false });
    console.log('DROP', this.props.node.title, ev.dataTransfer.getData('text'));
    ev.stopPropagation();
    ev.preventDefault();
  }
});

const Outline = React.createClass({
  render() {
    return (
      <ul className="outline">
        {this.props.nodes.map((node, index) => (
          <OutlineNode key={index} index={index} node={node} />
        ))}
      </ul>
    );
  }
});

const App = React.createClass({
  getInitialState() {
    return { nodes: this.props.nodes }
  },
  render() {
    return ( <Outline nodes={this.state.nodes} /> );
  }
});

ReactDOM.render(
  <App nodes={OUTLINE_DATA} />,
  document.getElementById('app')
);

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

const OutlineStore = {
};

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
          (<OutlineTree path={this.props.path} nodes={this.props.node.children} />)}
      </li>
    );
  },
  handleDragStart(ev) {
    ev.dataTransfer.setData('text/plain', JSON.stringify({
      path: this.props.path,
      node: this.props.node
    }));
    ev.stopPropagation();
    this.setState({ dragging: true });
  },
  handleDragEnter(ev) {
    // TODO: Forbid drop onto self.
    ev.stopPropagation();
    ev.preventDefault();
    ev.dropEffect = 'move';
    this.setState({ isDestination: true });
  },
  handleDragOver(ev) {
    // TODO: update drop location preview feedback
    ev.stopPropagation();
    ev.preventDefault();
  },
  handleDragLeave(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    this.setState({ isDestination: false });
  },
  handleDragEnd(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    this.setState({ dragging: false });
    // this.props.removeNode();
  },
  // TODO: Accept drops from outside the browser...
  handleDrop(ev) {
    // TODO: Forbid drop onto self.
    ev.stopPropagation();
    ev.preventDefault();
    this.setState({ isDestination: false });
    var data = JSON.parse(ev.dataTransfer.getData('text'));
    console.log("MOVE FROM", data.path, "TO", this.props.path);
    // this.props.insertNodeAfter(node);
  }
});

const OutlineTree = React.createClass({
  getInitialState() {
    return {
      path: this.props.path || [],
      nodes: this.props.nodes
    };
  },
  removeNode(index) {
    console.log("REMOVE NODE", index);
    let nodes = this.state.nodes;
    nodes.splice(index, 1);
    this.setState({ nodes: nodes });
  },
  insertNodeBefore(index, node) {
    console.log("INSERT NODE BEFORE", index);
    let nodes = this.state.nodes;
    nodes.splice(index, 0, node);
    this.setState({ nodes: nodes });
  },
  insertNodeAfter(index, node) {
    console.log("INSERT NODE AFTER", index);
    let nodes = this.state.nodes;
    nodes.splice(index + 1, 0, node);
    this.setState({ nodes: nodes });
  },
  render() {
    return (
      <ul className="outline">
        {this.state.nodes.map((node, index) => (
          <OutlineNode node={node}
            key={index} index={index}
            path={this.state.path.concat([index])}
            removeNode={this.removeNode.bind(this, index)}
            insertNodeBefore={this.insertNodeBefore.bind(this, index)}
            insertNodeAfter={this.insertNodeAfter.bind(this, index)} />
        ))}
      </ul>
    );
  }
});

const Outline = React.createClass({
  getInitialState() {
    return { nodes: this.props.nodes }
  },
  render() {
    return ( <OutlineTree nodes={this.state.nodes} /> );
  }
});

ReactDOM.render(
  <Outline nodes={OUTLINE_DATA} />,
  document.getElementById('app')
);

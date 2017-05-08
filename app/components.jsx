import React, { Component } from 'react';
import classnames from 'classnames';

import { createNode, positions, outlineActions,
         getNodes, getRootNodes, getNodeById } from './store';

const { updateNode, setNodeExpanded,
        insertNode, moveNode, deleteNode } = outlineActions;

export const Outline = props =>
  <OutlineTree {...props} root={['root']} />;

export const OutlineTree = props =>
  <ul className="outline">
    {props.outline.getIn(props.root).map(id =>
      <OutlineNode {...props} key={id} node={ props.outline.getIn(['nodes', id]) } /> )}
  </ul>;

export class OutlineNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      positionPreview: null
    };
  }

  render() {
    const { dispatch, outline, node } = this.props;
    const attributes = node.get('attributes');
    const nodeId = node.get('id');

    const className = classnames({
      'outline-node': true,
    });

    return (
      <li className={className} key={nodeId} id={nodeId}>
        <div className="content">
          <span className="content">{attributes.get('title') || attributes.get('text')}</span>
        </div>
        {node.get('children').count() > 0 &&
          <OutlineTree {...{ dispatch, outline }} root={['nodes', nodeId, 'children']} />}
      </li>
    )
  }

}

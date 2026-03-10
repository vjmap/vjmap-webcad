export default {
  // ==================== plugin metadata ====================
  'network.plugin.name': 'Network Graph',
  'network.plugin.description': 'Network Graph Plugin - Supports topological network drawing with nodes and branches, data generation, and topology-preserving copy-paste',

  // ==================== commands ====================
  'network.cmd.drawNetworkGraph': 'Draw Network Graph',
  'network.cmd.generateNetwork': 'Generate Network',
  'network.cmd.mergeNodes': 'Merge Nodes',
  'network.cmd.breakBranch': 'Break Branch',
  'network.cmd.reverseBranch': 'Reverse Branch',

  // ==================== ribbon ====================
  'network.ribbon.groupLabel': 'Network Graph',

  // ==================== DrawNetworkGraphCommand ====================
  'network.draw.startMsg': 'Draw Network Graph - Click to specify start/end node positions (auto-snap to existing nodes), Enter=line, click third point=arc',
  'network.draw.specifyStart': 'Specify start node position:',
  'network.draw.specifyEnd': 'Specify end node position:',
  'network.draw.specifyArcPoint': 'Specify arc through point <Line>:',
  'network.draw.branchCreated': 'Created branch {label} ({shape}): Node{startLabel} → Node{endLabel}',
  'network.draw.shape.line': 'Line',
  'network.draw.shape.arc': 'Arc',
  'network.draw.undoNodes': 'Undone {count} incomplete nodes',
  'network.draw.snapExisting': 'Snapped to existing node {label}',
  'network.draw.createNew': 'Create new node {label}',

  // ==================== GenerateNetworkCommand ====================
  'network.generate.startMsg': 'Generate Network Graph...',
  'network.generate.cancelled': 'Cancelled',
  'network.generate.noNodes': 'No node data',
  'network.generate.noEntities': 'No entities generated.',
  'network.generate.specifyBasePoint': 'Specify base point:',
  'network.generate.complete': 'Network graph generated: {nodeCount} nodes, {branchCount} branches',

  // ==================== MergeNodesCommand ====================
  'network.merge.startMsg': 'Merge Nodes - Select node to remove, then select target node',
  'network.merge.selectRemove': 'Select node to remove:',
  'network.merge.selectTarget': 'Select target node (merge to this node):',
  'network.merge.removeNode': 'Remove node: {label}',
  'network.merge.targetNode': 'Target node: {label}',
  'network.merge.cannotMergeSelf': 'Cannot merge to itself',
  'network.merge.complete': 'Merged node {removeLabel} to node {targetLabel}',
  'network.merge.pleaseSelectNode': 'Please select a network node',

  // ==================== BreakBranchCommand ====================
  'network.break.startMsg': 'Break Branch - Select branch to break',
  'network.break.selectBranch': 'Select branch to break:',
  'network.break.specifyPoint': 'Specify break point:',
  'network.break.branchSelected': 'Selected branch {label}',
  'network.break.complete': 'Broke branch {branchLabel} at node {nodeLabel}',
  'network.break.pleaseSelectBranch': 'Please select a network branch',

  // ==================== ReverseBranchCommand ====================
  'network.reverse.startMsg': 'Reverse Branch - Select branch to reverse',
  'network.reverse.selectBranch': 'Select branch to reverse:',
  'network.reverse.complete': 'Reversed branch {label}',
  'network.reverse.pleaseSelectBranch': 'Please select a network branch',

  // ==================== entities ====================
  'network.entity.node.displayName': 'Network Node',
  'network.entity.branch.displayName': 'Network Branch',
  'network.entity.category.basic': 'Basic',
  'network.entity.category.geometry': 'Geometry',
  'network.entity.category.network': 'Network',
  'network.entity.category.display': 'Display',
  'network.entity.prop.type': 'Type',
  'network.entity.prop.label': 'Label',
  'network.entity.prop.positionX': 'Position X',
  'network.entity.prop.positionY': 'Position Y',
  'network.entity.prop.radius': 'Radius',
  'network.entity.prop.networkId': 'Network ID',
  'network.entity.prop.shape': 'Shape',
  'network.entity.prop.bulge': 'Bulge',
  'network.entity.prop.arrow': 'Arrow',
  'network.entity.prop.associative': 'Associative',
  'network.entity.value.yes': 'Yes',
  'network.entity.value.no': 'No',
  'network.entity.value.line': 'Line',
  'network.entity.value.arc': 'Arc',

  // ==================== GenerateNetworkDialog ====================
  'network.dialog.title': 'Generate Network Graph',
  'network.dialog.noEntities': 'No network graph entities in current drawing',
  'network.dialog.nodeDataEmpty': 'Node data is empty',
  'network.dialog.branchDataEmpty': 'Branch data is empty',
  'network.dialog.twoTableMode': 'Two Table Mode',
  'network.dialog.singleTableMode': 'Single Table Mode',
  'network.dialog.layoutAlgorithm': 'Layout Algorithm (when no coordinates)',
  'network.dialog.forceDirected': 'Force Directed',
  'network.dialog.circular': 'Circular',
  'network.dialog.hierarchical': 'Hierarchical',
  'network.dialog.parameters': 'Parameters',
  'network.dialog.nodeRadius': 'Node Radius:',
  'network.dialog.nodeSpacing': 'Node Spacing:',
  'network.dialog.loadExample': 'Load Example',
  'network.dialog.loadFromGraph': 'Get from Current Graph',
  'network.dialog.cancel': 'Cancel',
  'network.dialog.generate': 'Generate',
  'network.dialog.nodeData': 'Node Data (CSV: id,label,x,y)',
  'network.dialog.branchData': 'Branch Data (CSV: startNodeId,endNodeId,label,bulge)',
  'network.dialog.branchRelation': 'Branch Relations (CSV: startNode,endNode,label)',
  'network.dialog.autoExtractHint': 'Nodes will be auto-extracted from branch relations, coordinates generated by layout algorithm',
} as const;

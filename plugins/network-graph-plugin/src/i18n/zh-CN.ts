export default {
  // ==================== plugin metadata ====================
  'network.plugin.name': '网络图',
  'network.plugin.description': '网络图绘制插件 - 支持节点和分支的拓扑网络图绘制、数据生成和拓扑保持的复制粘贴',

  // ==================== commands ====================
  'network.cmd.drawNetworkGraph': '绘制网络图',
  'network.cmd.generateNetwork': '生成网络图',
  'network.cmd.mergeNodes': '合并节点',
  'network.cmd.breakBranch': '打断分支',
  'network.cmd.reverseBranch': '分支反向',

  // ==================== ribbon ====================
  'network.ribbon.groupLabel': '网络图',

  // ==================== DrawNetworkGraphCommand ====================
  'network.draw.startMsg': '绘制网络图 - 点击指定起止节点位置（自动捕捉已有节点），回车=直线，点击第三点=圆弧',
  'network.draw.specifyStart': '指定起始节点位置:',
  'network.draw.specifyEnd': '指定终止节点位置:',
  'network.draw.specifyArcPoint': '指定圆弧经过点 <直线>:',
  'network.draw.branchCreated': '已创建分支 {label} ({shape}): 节点{startLabel} → 节点{endLabel}',
  'network.draw.shape.line': '直线',
  'network.draw.shape.arc': '圆弧',
  'network.draw.undoNodes': '已撤销 {count} 个未完成的节点',
  'network.draw.snapExisting': '捕捉到已有节点 {label}',
  'network.draw.createNew': '创建新节点 {label}',

  // ==================== GenerateNetworkCommand ====================
  'network.generate.startMsg': '生成网络图...',
  'network.generate.cancelled': '已取消',
  'network.generate.noNodes': '没有节点数据',
  'network.generate.noEntities': '没有生成任何实体。',
  'network.generate.specifyBasePoint': '指定放置基点:',
  'network.generate.complete': '已生成网络图：{nodeCount} 个节点，{branchCount} 条分支',

  // ==================== MergeNodesCommand ====================
  'network.merge.startMsg': '合并节点 - 选择要移除的节点，再选择目标节点',
  'network.merge.selectRemove': '选择要移除的节点:',
  'network.merge.selectTarget': '选择目标节点（合并到此节点）:',
  'network.merge.removeNode': '移除节点: {label}',
  'network.merge.targetNode': '目标节点: {label}',
  'network.merge.cannotMergeSelf': '不能合并到自身',
  'network.merge.complete': '已将节点 {removeLabel} 合并到节点 {targetLabel}',
  'network.merge.pleaseSelectNode': '请选择网络节点',

  // ==================== BreakBranchCommand ====================
  'network.break.startMsg': '打断分支 - 选择要打断的分支',
  'network.break.selectBranch': '选择要打断的分支:',
  'network.break.specifyPoint': '指定打断点:',
  'network.break.branchSelected': '已选择分支 {label}',
  'network.break.complete': '已在节点 {nodeLabel} 处打断分支 {branchLabel}',
  'network.break.pleaseSelectBranch': '请选择网络分支',

  // ==================== ReverseBranchCommand ====================
  'network.reverse.startMsg': '分支反向 - 选择要反向的分支',
  'network.reverse.selectBranch': '选择要反向的分支:',
  'network.reverse.complete': '已反向分支 {label}',
  'network.reverse.pleaseSelectBranch': '请选择网络分支',

  // ==================== entities ====================
  'network.entity.node.displayName': '网络节点',
  'network.entity.branch.displayName': '网络分支',
  'network.entity.category.basic': '基本',
  'network.entity.category.geometry': '几何',
  'network.entity.category.network': '网络',
  'network.entity.category.display': '显示',
  'network.entity.prop.type': '类型',
  'network.entity.prop.label': '标签',
  'network.entity.prop.positionX': '位置 X',
  'network.entity.prop.positionY': '位置 Y',
  'network.entity.prop.radius': '半径',
  'network.entity.prop.networkId': '网络ID',
  'network.entity.prop.shape': '形状',
  'network.entity.prop.bulge': '凸度',
  'network.entity.prop.arrow': '箭头',
  'network.entity.prop.associative': '关联',
  'network.entity.value.yes': '是',
  'network.entity.value.no': '否',
  'network.entity.value.line': '直线',
  'network.entity.value.arc': '圆弧',

  // ==================== GenerateNetworkDialog ====================
  'network.dialog.title': '生成网络图',
  'network.dialog.noEntities': '当前图形中没有网络图实体',
  'network.dialog.nodeDataEmpty': '节点数据为空',
  'network.dialog.branchDataEmpty': '分支数据为空',
  'network.dialog.twoTableMode': '两表模式',
  'network.dialog.singleTableMode': '单表模式',
  'network.dialog.layoutAlgorithm': '布局算法（无坐标时）',
  'network.dialog.forceDirected': '力导向',
  'network.dialog.circular': '圆形',
  'network.dialog.hierarchical': '层次',
  'network.dialog.parameters': '参数',
  'network.dialog.nodeRadius': '节点半径:',
  'network.dialog.nodeSpacing': '节点间距:',
  'network.dialog.loadExample': '加载示例',
  'network.dialog.loadFromGraph': '获取当前图形',
  'network.dialog.cancel': '取消',
  'network.dialog.generate': '生成',
  'network.dialog.nodeData': '节点数据 (CSV: id,label,x,y)',
  'network.dialog.branchData': '分支数据 (CSV: startNodeId,endNodeId,label,bulge)',
  'network.dialog.branchRelation': '分支关系 (CSV: startNode,endNode,label)',
  'network.dialog.autoExtractHint': '节点将从分支关系中自动提取，坐标由布局算法生成',
} as const;

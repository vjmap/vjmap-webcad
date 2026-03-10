export default {
  // ==================== plugin metadata ====================
  'view3d.plugin.name': '三维查看',
  'view3d.plugin.description': '三维查看插件 - 将WebCAD中带Z值的实体在3D视图中可视化显示',
  'view3d.plugin.loaded': '插件已加载',
  'view3d.plugin.activated': '插件已激活',
  'view3d.plugin.deactivated': '插件已停用',
  'view3d.plugin.unloaded': '插件已卸载',

  // ==================== command ====================
  'view3d.cmd.view3d': '三维查看',
  'view3d.cmd.openPanel': '打开三维查看面板',

  // ==================== ribbon ====================
  'view3d.ribbon.groupLabel': '三维查看',
  'view3d.ribbon.prompt': '三维查看',

  // ==================== panel UI ====================
  'view3d.panel.title': '三维查看',
  'view3d.panel.fullscreen': '全屏',
  'view3d.panel.close': '关闭',
  'view3d.panel.refresh': '刷新',
  'view3d.panel.settings': '设置',
  'view3d.panel.settingsExpanded': '▾ 设置',
  'view3d.panel.settingsCollapsed': '▸ 设置',
  'view3d.panel.onlyWithElevation': '仅有Z值',
  'view3d.panel.useTubeRendering': '管道',
  'view3d.panel.scaleZ': 'Z缩放',
  'view3d.panel.tubeColor': '管道色',
  'view3d.panel.resetDefaults': '还原默认',
  'view3d.panel.loading': '加载中...',
  'view3d.panel.entityCount': '实体:',

  // ==================== settings drawer ====================
  'view3d.settings.layerFilter': '图层筛选',
  'view3d.settings.entityType': '实体类型',
  'view3d.settings.displayRange': '显示范围',
  'view3d.settings.displayRange.all': '全部',
  'view3d.settings.displayRange.currentView': '当前视图',
  'view3d.settings.displayRange.custom': '自定义范围',
  'view3d.settings.tubeRadius': '管道半径',
  'view3d.settings.customRange': '自定义范围 (Xmin, Ymin, Xmax, Ymax)',
  'view3d.settings.selectRangeFromMap': '从图中选择范围',

  // ==================== coord bar ====================
  'view3d.coord.locate2dTo3d': '2D→3D',
  'view3d.coord.locate2dTo3dTitle': '2D选中→3D定位',
  'view3d.coord.locate3dTo2d': '3D→2D',
  'view3d.coord.locate3dTo2dTitle': '3D选中→2D定位',

  // ==================== messages ====================
  'view3d.msg.selectEntityIn2d': '请先在2D视图中选择实体',
  'view3d.msg.locatedTo3d': '已定位到3D实体 (源ID: {entityId})',
  'view3d.msg.notFoundIn3d': '未在3D视图中找到对应实体',
  'view3d.msg.selectEntityIn3d': '请先在3D视图中点击选择实体',
  'view3d.msg.locatedTo2d': '已定位到2D实体 (ID: {entityId})',
  'view3d.msg.selectedEntity': '选中实体 ID: {entityId}',
  'view3d.msg.specifyFirstCorner': '请指定范围的第一个角点',
  'view3d.msg.specifyOppositeCorner': '请指定范围的对角点',
} as const;

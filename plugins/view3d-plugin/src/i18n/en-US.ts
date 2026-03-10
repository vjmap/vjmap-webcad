export default {
  // ==================== plugin metadata ====================
  'view3d.plugin.name': '3D View',
  'view3d.plugin.description': '3D View Plugin - Visualize WebCAD entities with Z values in 3D view',
  'view3d.plugin.loaded': 'Plugin loaded',
  'view3d.plugin.activated': 'Plugin activated',
  'view3d.plugin.deactivated': 'Plugin deactivated',
  'view3d.plugin.unloaded': 'Plugin unloaded',

  // ==================== command ====================
  'view3d.cmd.view3d': '3D View',
  'view3d.cmd.openPanel': 'Open 3D View Panel',

  // ==================== ribbon ====================
  'view3d.ribbon.groupLabel': '3D View',
  'view3d.ribbon.prompt': '3D View',

  // ==================== panel UI ====================
  'view3d.panel.title': '3D View',
  'view3d.panel.fullscreen': 'Fullscreen',
  'view3d.panel.close': 'Close',
  'view3d.panel.refresh': 'Refresh',
  'view3d.panel.settings': 'Settings',
  'view3d.panel.settingsExpanded': '▾ Settings',
  'view3d.panel.settingsCollapsed': '▸ Settings',
  'view3d.panel.onlyWithElevation': 'Only with Z',
  'view3d.panel.useTubeRendering': 'Tube',
  'view3d.panel.scaleZ': 'Z Scale',
  'view3d.panel.tubeColor': 'Tube Color',
  'view3d.panel.resetDefaults': 'Reset Defaults',
  'view3d.panel.loading': 'Loading...',
  'view3d.panel.entityCount': 'Entities:',

  // ==================== settings drawer ====================
  'view3d.settings.layerFilter': 'Layer Filter',
  'view3d.settings.entityType': 'Entity Type',
  'view3d.settings.displayRange': 'Display Range',
  'view3d.settings.displayRange.all': 'All',
  'view3d.settings.displayRange.currentView': 'Current View',
  'view3d.settings.displayRange.custom': 'Custom Range',
  'view3d.settings.tubeRadius': 'Tube Radius',
  'view3d.settings.customRange': 'Custom Range (Xmin, Ymin, Xmax, Ymax)',
  'view3d.settings.selectRangeFromMap': 'Select Range from Map',

  // ==================== coord bar ====================
  'view3d.coord.locate2dTo3d': '2D→3D',
  'view3d.coord.locate2dTo3dTitle': '2D Selection → 3D Location',
  'view3d.coord.locate3dTo2d': '3D→2D',
  'view3d.coord.locate3dTo2dTitle': '3D Selection → 2D Location',

  // ==================== messages ====================
  'view3d.msg.selectEntityIn2d': 'Please select an entity in 2D view first',
  'view3d.msg.locatedTo3d': 'Located to 3D entity (Source ID: {entityId})',
  'view3d.msg.notFoundIn3d': 'Corresponding entity not found in 3D view',
  'view3d.msg.selectEntityIn3d': 'Please click to select an entity in 3D view first',
  'view3d.msg.locatedTo2d': 'Located to 2D entity (ID: {entityId})',
  'view3d.msg.selectedEntity': 'Selected entity ID: {entityId}',
  'view3d.msg.specifyFirstCorner': 'Specify first corner of range',
  'view3d.msg.specifyOppositeCorner': 'Specify opposite corner of range',
} as const;

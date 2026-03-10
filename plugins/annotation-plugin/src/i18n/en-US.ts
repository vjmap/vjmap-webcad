export default {
  // ==================== plugin metadata ====================
  'anno.plugin.name': 'Annotation',
  'anno.plugin.description': 'CAD Markup/Redline Review Tools — cloud, arrow, rectangle, ellipse, text, leader, freehand, stamp, highlight',
  'anno.plugin.loaded': 'Plugin loaded',
  'anno.plugin.activated': 'Plugin activated',
  'anno.plugin.deactivated': 'Plugin deactivated',
  'anno.plugin.unloaded': 'Plugin unloaded',

  // ==================== ribbon ====================
  'anno.ribbon.tab': 'Review',
  'anno.ribbon.tools': 'Annotation',
  'anno.ribbon.manage': 'Manage',

  // ==================== menu ====================
  'anno.menu.review': 'Review',

  // ==================== commands ====================
  'anno.cmd.toolbar': 'Open Annotation Toolbar',
  'anno.cmd.cloud': 'Cloud Annotation',
  'anno.cmd.arrow': 'Arrow Annotation',
  'anno.cmd.rect': 'Rectangle Annotation',
  'anno.cmd.ellipse': 'Ellipse Annotation',
  'anno.cmd.text': 'Text Annotation',
  'anno.cmd.leader': 'Leader Annotation',
  'anno.cmd.freehand': 'Freehand Annotation',
  'anno.cmd.stamp': 'Stamp Annotation',
  'anno.cmd.highlight': 'Highlight Annotation',
  'anno.cmd.show': 'Show Annotation',
  'anno.cmd.hide': 'Hide Annotation',
  'anno.cmd.list': 'Annotation List',
  'anno.cmd.clear': 'Clear Annotation',

  // ==================== toolbar ====================
  'anno.toolbar.title': 'Annotation Tools',
  'anno.toolbar.cloud': 'Cloud',
  'anno.toolbar.arrow': 'Arrow',
  'anno.toolbar.rect': 'Rectangle',
  'anno.toolbar.ellipse': 'Ellipse',
  'anno.toolbar.text': 'Text',
  'anno.toolbar.leader': 'Leader',
  'anno.toolbar.freehand': 'Freehand',
  'anno.toolbar.stamp': 'Stamp',
  'anno.toolbar.highlight': 'Highlight',
  'anno.toolbar.show': 'Show',
  'anno.toolbar.hide': 'Hide',
  'anno.toolbar.list': 'List',
  'anno.toolbar.clear': 'Clear',

  // ==================== messages ====================
  'anno.cloud.startMsg': 'Cloud Annotation — Current arc length: {arcLength}',
  'anno.cloud.specifyArcLength': 'Specify arc length <{arcLength}>',
  'anno.cloud.specifyStart': 'Specify start point:',
  'anno.cloud.specifyNext': 'Specify next point [Undo(U)]:',
  'anno.cloud.specifyNextOrClose': 'Specify next point [Close(C)/Undo(U)]:',
  'anno.cloud.complete': 'Cloud annotation complete.',

  'anno.arrow.specifyStyle': 'Arrow style [Single(S)/Double(D)/Polyline(P)]',
  'anno.arrow.singleArrow': 'Single',
  'anno.arrow.doubleArrow': 'Double',
  'anno.arrow.polylineArrow': 'Polyline',
  'anno.arrow.startMsg': '{style} arrow annotation — Specify start point:',
  'anno.arrow.specifyStart': 'Specify start point:',
  'anno.arrow.specifyEnd': 'Specify end point:',
  'anno.arrow.specifyNextOrDone': 'Specify next point [Done(D)]: ({count} points)',
  'anno.arrow.complete': 'Arrow annotation complete.',
  'anno.arrow.polylineComplete': 'Polyline arrow annotation complete.',

  'anno.rect.startMsg': 'Rectangle Annotation — Specify first corner:',
  'anno.rect.specifyCorner1': 'Specify first corner:',
  'anno.rect.specifyCorner2': 'Specify opposite corner:',
  'anno.rect.complete': 'Rectangle annotation complete.',

  'anno.ellipse.startMsg': 'Ellipse Annotation — Specify center:',
  'anno.ellipse.specifyCenter': 'Specify center:',
  'anno.ellipse.specifyMajor': 'Specify major axis endpoint:',
  'anno.ellipse.specifyMinor': 'Specify minor axis endpoint:',
  'anno.ellipse.complete': 'Ellipse annotation complete.',

  'anno.text.startMsg': 'Text Annotation — Switched to annotation layer, start typing',

  'anno.leader.startMsg': 'Leader Annotation',

  'anno.freehand.startMsg': 'Freehand Annotation — Specify start point:',
  'anno.freehand.specifyStart': 'Specify start point:',
  'anno.freehand.draw': 'Move mouse to draw, click to finish or press ESC to cancel:',
  'anno.freehand.complete': 'Freehand annotation complete.',

  'anno.stamp.selectStamp': 'Select stamp [{options}]',
  'anno.stamp.specifyPosition': 'Specify position:',
  'anno.stamp.placed': 'Stamp "{stampName}" placed.',

  'anno.highlight.startMsg': 'Highlight Annotation — Specify first corner:',
  'anno.highlight.specifyCorner1': 'Specify first corner:',
  'anno.highlight.specifyCorner2': 'Specify opposite corner:',
  'anno.highlight.complete': 'Highlight annotation complete.',

  'anno.show.complete': 'Annotation layer is visible.',
  'anno.hide.complete': 'Annotation layer is hidden.',
  'anno.clear.noAnnotations': 'No annotation entities to clear.',
  'anno.clear.complete': 'Cleared {count} annotation entities.',

  'anno.toolbar.opened': 'Annotation toolbar opened',

  'anno.list.title': 'Annotation List',
  'anno.list.opened': 'Annotation list panel opened.',
  'anno.list.closed': 'Annotation list panel closed.',
  'anno.list.empty': 'No annotations',
  'anno.list.refresh': 'Refresh',
  'anno.list.count': '({count})',

  // ==================== entity types ====================
  'anno.entity.polyline': 'Polyline',
  'anno.entity.text': 'Text',
  'anno.entity.mtext': 'Multiline Text',
  'anno.entity.hatch': 'Hatch',
  'anno.entity.mleader': 'Leader',

  // ==================== stamp presets ====================
  'anno.stamp.approved': 'Approved',
  'anno.stamp.rejected': 'Rejected',
  'anno.stamp.reviewed': 'Reviewed',
  'anno.stamp.revised': 'Revised',
  'anno.stamp.void': 'Void',
  'anno.stamp.draft': 'Draft',
} as const;

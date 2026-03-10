export default {
  // ==================== plugin metadata ====================
  'anno.plugin.name': '批注',
  'anno.plugin.description': 'CAD 批注/标记审阅工具 — 云线、箭头、矩形、椭圆、文字、引线、自由线、图章、高亮',
  'anno.plugin.loaded': '插件已加载',
  'anno.plugin.activated': '插件已激活',
  'anno.plugin.deactivated': '插件已停用',
  'anno.plugin.unloaded': '插件已卸载',

  // ==================== ribbon ====================
  'anno.ribbon.tab': '审阅',
  'anno.ribbon.tools': '批注',
  'anno.ribbon.manage': '管理',

  // ==================== menu ====================
  'anno.menu.review': '审阅',

  // ==================== commands ====================
  'anno.cmd.toolbar': '打开批注工具栏',
  'anno.cmd.cloud': '云线批注',
  'anno.cmd.arrow': '箭头批注',
  'anno.cmd.rect': '矩形批注',
  'anno.cmd.ellipse': '椭圆批注',
  'anno.cmd.text': '文字批注',
  'anno.cmd.leader': '引线批注',
  'anno.cmd.freehand': '自由线批注',
  'anno.cmd.stamp': '图章批注',
  'anno.cmd.highlight': '高亮批注',
  'anno.cmd.show': '显示批注',
  'anno.cmd.hide': '隐藏批注',
  'anno.cmd.list': '批注列表',
  'anno.cmd.clear': '清除批注',

  // ==================== toolbar ====================
  'anno.toolbar.title': '批注工具',
  'anno.toolbar.cloud': '云线',
  'anno.toolbar.arrow': '箭头',
  'anno.toolbar.rect': '矩形',
  'anno.toolbar.ellipse': '椭圆',
  'anno.toolbar.text': '文字',
  'anno.toolbar.leader': '引线',
  'anno.toolbar.freehand': '自由线',
  'anno.toolbar.stamp': '图章',
  'anno.toolbar.highlight': '高亮',
  'anno.toolbar.show': '显示批注',
  'anno.toolbar.hide': '隐藏批注',
  'anno.toolbar.list': '批注列表',
  'anno.toolbar.clear': '清除批注',

  // ==================== messages ====================
  'anno.cloud.startMsg': '云线批注 — 当前弧长: {arcLength}',
  'anno.cloud.specifyArcLength': '指定弧长 <{arcLength}>',
  'anno.cloud.specifyStart': '指定起点:',
  'anno.cloud.specifyNext': '指定下一点[撤销(U)]:',
  'anno.cloud.specifyNextOrClose': '指定下一点[闭合(C)/撤销(U)]:',
  'anno.cloud.complete': '云线批注完成。',

  'anno.arrow.specifyStyle': '箭头样式 [单向(S)/双向(D)/折线(P)]',
  'anno.arrow.singleArrow': '单向',
  'anno.arrow.doubleArrow': '双向',
  'anno.arrow.polylineArrow': '折线',
  'anno.arrow.startMsg': '{style}箭头批注 — 指定起点:',
  'anno.arrow.specifyStart': '指定起点:',
  'anno.arrow.specifyEnd': '指定终点:',
  'anno.arrow.specifyNextOrDone': '指定下一点[完成(D)]: (已{count}点)',
  'anno.arrow.complete': '箭头批注完成。',
  'anno.arrow.polylineComplete': '折线箭头批注完成。',

  'anno.rect.startMsg': '矩形批注 — 指定第一个角点:',
  'anno.rect.specifyCorner1': '指定第一个角点:',
  'anno.rect.specifyCorner2': '指定对角点:',
  'anno.rect.complete': '矩形批注完成。',

  'anno.ellipse.startMsg': '椭圆批注 — 指定中心点:',
  'anno.ellipse.specifyCenter': '指定中心点:',
  'anno.ellipse.specifyMajor': '指定长轴端点:',
  'anno.ellipse.specifyMinor': '指定短轴端点:',
  'anno.ellipse.complete': '椭圆批注完成。',

  'anno.text.startMsg': '文字批注 — 已切换到批注图层，开始输入文字',

  'anno.leader.startMsg': '引线批注',

  'anno.freehand.startMsg': '自由线批注 — 指定起点:',
  'anno.freehand.specifyStart': '指定起点:',
  'anno.freehand.draw': '移动鼠标绘制，点击结束或按 ESC 取消:',
  'anno.freehand.complete': '自由线批注完成。',

  'anno.stamp.selectStamp': '选择图章 [{options}]',
  'anno.stamp.specifyPosition': '指定放置点:',
  'anno.stamp.placed': '图章 "{stampName}" 放置完成。',

  'anno.highlight.startMsg': '高亮批注 — 指定第一个角点:',
  'anno.highlight.specifyCorner1': '指定第一个角点:',
  'anno.highlight.specifyCorner2': '指定对角点:',
  'anno.highlight.complete': '高亮批注完成。',

  'anno.show.complete': '批注图层已显示。',
  'anno.hide.complete': '批注图层已隐藏。',
  'anno.clear.noAnnotations': '没有批注实体可清除。',
  'anno.clear.complete': '已清除 {count} 个批注实体。',

  'anno.toolbar.opened': '批注工具栏已打开',

  'anno.list.title': '批注列表',
  'anno.list.opened': '批注列表面板已打开。',
  'anno.list.closed': '批注列表面板已关闭。',
  'anno.list.empty': '暂无批注',
  'anno.list.refresh': '刷新',
  'anno.list.count': '({count})',

  // ==================== entity types ====================
  'anno.entity.polyline': '多段线',
  'anno.entity.text': '文字',
  'anno.entity.mtext': '多行文字',
  'anno.entity.hatch': '填充',
  'anno.entity.mleader': '引线',

  // ==================== stamp presets ====================
  'anno.stamp.approved': '批准',
  'anno.stamp.rejected': '驳回',
  'anno.stamp.reviewed': '审核',
  'anno.stamp.revised': '修改',
  'anno.stamp.void': '作废',
  'anno.stamp.draft': '草稿',
} as const;

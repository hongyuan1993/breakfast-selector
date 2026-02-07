// 预设早餐选项 - 自动分类: 主食、蛋类、面食、饮品、水果
export const CATEGORIES = {
  staple: { name: '主食', emoji: '🍚' },
  egg: { name: '蛋类', emoji: '🥚' },
  pasta: { name: '面食', emoji: '🍜' },
  drink: { name: '饮品', emoji: '🧃' },
  fruit: { name: '水果', emoji: '🍓' },
}

// 预设早餐 - 自动分类，emoji 作为视觉主体
export const BREAKFAST_PRESETS = [
  { id: 'xiaoguo-mixian', name: '小锅米线', emoji: '🍜', category: 'pasta' },
  { id: 'zheng-yumi', name: '蒸玉米', emoji: '🌽', category: 'staple' },
  { id: 'zhu-jidan', name: '煮鸡蛋', emoji: '🥚', category: 'egg', options: [{ key: 'cooked', label: '熟度', values: ['全熟', '溏心'] }] },
  { id: 'jian-jidan', name: '煎鸡蛋', emoji: '🍳', category: 'egg', options: [{ key: 'cooked', label: '熟度', values: ['全熟', '半熟', '流心'] }] },
  { id: 'sanmingzhi', name: '三明治', emoji: '🥪', category: 'staple' },
  { id: 'houdanshao', name: '厚蛋烧', emoji: '🥞', category: 'egg' },
  { id: 'zhu-yanmaipian', name: '煮燕麦片', emoji: '🥣', category: 'staple' },
  { id: 'zheng-baozi', name: '蒸包子', emoji: '🥟', category: 'pasta' },
  { id: 'caomei', name: '草莓', emoji: '🍓', category: 'fruit' },
  { id: 'xiangjiao', name: '香蕉', emoji: '🍌', category: 'fruit' },
  { id: 'tangfan', name: '烫饭', emoji: '🍲', category: 'staple' },
  { id: 'heimi-hongdou-zha', name: '黑米红豆榨汁', emoji: '🧃', category: 'drink' },
]

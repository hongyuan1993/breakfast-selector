// 根据名称和分类自动生成图标
// 关键词匹配优先级高于分类默认

const KEYWORD_EMOJI_MAP = [
  // 面食
  ['米线', '米粉', '面条', '粉', '面'], '🍜',
  ['包子', '饺子', '馄饨', '烧麦', '小笼'], '🥟',
  ['汉堡肉饼'], '🍔',
  ['三明治', '汉堡', '吐司'], '🥪',
  ['煎饼', '蛋饼', '厚蛋烧', '华夫饼', 'waffle'], '🧇',
  ['饭团', '粢饭团', '糍饭团', '饭卷'], '🍙',
  ['寿司'], '🍣',
  ['油条'], '🥖',
  // 主食
  ['玉米'], '🌽',
  ['燕麦', '麦片', '稀饭', '粥'], '🥣',
  ['饭', '炒饭', '烫饭', '盖浇饭'], '🍲',
  ['米饭', '米'], '🍚',
  ['面包', '馒头', '大饼'], '🍞',
  ['可颂', '牛角'], '🥐',
  // 蛋类
  ['煮鸡蛋', '水煮蛋'], '🥚',
  ['煎蛋', '荷包蛋', '炒蛋'], '🍳',
  ['蛋'], '🥚',
  // 饮品
  ['豆浆', '牛奶', '奶'], '🥛',
  ['咖啡'], '☕',
  ['茶'], '🍵',
  ['果汁', '榨汁', '汁', '豆浆机'], '🧃',
  ['可乐', '汽水', '饮料'], '🥤',
  // 水果
  ['草莓'], '🍓',
  ['香蕉'], '🍌',
  ['苹果'], '🍎',
  ['橙', '橘子', '柑'], '🍊',
  ['葡萄'], '🍇',
  ['西瓜'], '🍉',
  ['梨'], '🍐',
  ['桃', '李'], '🍑',
  ['樱桃'], '🍒',
  ['猕猴桃', '奇异果'], '🥝',
  ['牛油果', '酪梨'], '🥑',
  ['蓝莓', '莓'], '🫐',
  ['芒果'], '🥭',
  ['菠萝', '凤梨'], '🍍',
  ['椰子'], '🥥',
  ['柠檬', '青柠'], '🍋',
  ['果'], '🍓',
  // 其他
  ['沙拉'], '🥗',
  ['培根'], '🥓',
  ['香肠', '热狗'], '🌭',
  ['蛋糕', '糕点'], '🎂',
  ['酸奶', '优格'], '🥛',
  ['饼干'], '🍪',
  ['坚果'], '🥜',
]

// 将扁平数组转为 [keyword[], emoji][] 方便遍历
const KEYWORD_PAIRS = []
for (let i = 0; i < KEYWORD_EMOJI_MAP.length; i += 2) {
  const keywords = KEYWORD_EMOJI_MAP[i]
  const emoji = KEYWORD_EMOJI_MAP[i + 1]
  const arr = Array.isArray(keywords) ? keywords : [keywords]
  KEYWORD_PAIRS.push([arr, emoji])
}

const CATEGORY_DEFAULT = {
  staple: '🍚',
  egg: '🥚',
  pasta: '🍜',
  drink: '🧃',
  fruit: '🍓',
}

// 关键词 -> 分类映射 (顺序决定优先级，先匹配优先)
const KEYWORD_CATEGORY_MAP = [
  [['米线', '米粉', '面条', '粉', '包子', '饺子', '馄饨', '烧麦', '小笼'], 'pasta'],
  [['煮鸡蛋', '水煮蛋', '煎蛋', '荷包蛋', '炒蛋', '厚蛋烧', '煎饼', '蛋饼', '蛋'], 'egg'],
  [['豆浆', '牛奶', '奶', '咖啡', '茶', '果汁', '榨汁', '汁', '可乐', '汽水', '饮料', '豆浆机'], 'drink'],
  [['草莓', '香蕉', '苹果', '橙', '橘子', '柑', '葡萄', '西瓜', '梨', '桃', '李', '樱桃', '猕猴桃', '奇异果', '牛油果', '酪梨', '蓝莓', '莓', '芒果', '菠萝', '凤梨', '椰子', '柠檬', '青柠', '果'], 'fruit'],
  [['玉米', '燕麦', '麦片', '稀饭', '粥', '饭', '炒饭', '烫饭', '盖浇饭', '米饭', '米', '面包', '馒头', '油条', '大饼', '可颂', '牛角', '三明治', '汉堡', '汉堡肉饼', '吐司', '饭团', '粢饭团', '寿司', '华夫饼', '培根', '香肠', '热狗'], 'staple'],
]

export function generateCategory(name) {
  if (!name || !name.trim()) return 'staple'
  const text = name.trim()
  for (const [keywords, category] of KEYWORD_CATEGORY_MAP) {
    for (const kw of keywords) {
      if (text.includes(kw)) return category
    }
  }
  return 'staple'
}

export function generateEmoji(name, category = 'staple') {
  const cat = category || generateCategory(name)
  if (!name || !name.trim()) return CATEGORY_DEFAULT[cat] || '🍽️'
  const text = name.trim().toLowerCase()
  for (const [keywords, emoji] of KEYWORD_PAIRS) {
    for (const kw of keywords) {
      if (text.includes(kw)) return emoji
    }
  }
  return CATEGORY_DEFAULT[cat] || '🍽️'
}

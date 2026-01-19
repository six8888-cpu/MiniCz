// 64卦数据：按先天八卦排列（乾1兑2离3震4巽5坎6艮7坤8）
// 索引 = (上卦-1)*8 + (下卦-1)
const HEXAGRAMS = [
  // 上卦乾(1): 乾乾、乾兑、乾离、乾震、乾巽、乾坎、乾艮、乾坤
  { name: "乾", symbol: "䷀", level: "吉", desc: "元亨利贞，大吉大利" },
  { name: "履", symbol: "䷉", level: "吉", desc: "谨慎行事，平安顺遂" },
  { name: "同人", symbol: "䷌", level: "吉", desc: "志同道合，合作顺利" },
  { name: "无妄", symbol: "䷘", level: "中等", desc: "顺其自然，不可妄为" },
  { name: "姤", symbol: "䷫", level: "中等", desc: "不期而遇，宜谨慎交往" },
  { name: "讼", symbol: "䷅", level: "凶", desc: "争讼不利，宜和解" },
  { name: "遁", symbol: "䷠", level: "中等", desc: "退避三舍，以退为进" },
  { name: "否", symbol: "䷋", level: "凶", desc: "天地不交，诸事不顺" },
  // 上卦兑(2): 兑乾、兑兑、兑离、兑震、兑巽、兑坎、兑艮、兑坤
  { name: "夬", symbol: "䷪", level: "中等", desc: "果断决断，谨防小人" },
  { name: "兑", symbol: "䷹", level: "吉", desc: "喜悦和乐，人际融洽" },
  { name: "革", symbol: "䷰", level: "中等", desc: "变革更新，宜因时制宜" },
  { name: "随", symbol: "䷐", level: "中等", desc: "随机应变，顺势而为" },
  { name: "大过", symbol: "䷛", level: "凶", desc: "过犹不及，宜收敛" },
  { name: "困", symbol: "䷮", level: "凶", desc: "困顿窘迫，宜守待变" },
  { name: "咸", symbol: "䷞", level: "吉", desc: "感应相通，婚恋吉利" },
  { name: "萃", symbol: "䷬", level: "吉", desc: "聚集汇合，人缘兴旺" },
  // 上卦离(3): 离乾、离兑、离离、离震、离巽、离坎、离艮、离坤
  { name: "大有", symbol: "䷍", level: "吉", desc: "丰收富足，大吉大利" },
  { name: "睽", symbol: "䷥", level: "中等", desc: "意见相左，小事可成" },
  { name: "离", symbol: "䷝", level: "吉", desc: "光明磊落，前途光明" },
  { name: "噬嗑", symbol: "䷔", level: "中等", desc: "排除障碍，终可成功" },
  { name: "鼎", symbol: "䷱", level: "吉", desc: "鼎新革故，大业可成" },
  { name: "未济", symbol: "䷿", level: "中等", desc: "尚未完成，继续努力" },
  { name: "旅", symbol: "䷷", level: "中等", desc: "旅途在外，宜谨慎行事" },
  { name: "晋", symbol: "䷢", level: "吉", desc: "日出地上，步步高升" },
  // 上卦震(4): 震乾、震兑、震离、震震、震巽、震坎、震艮、震坤
  { name: "大壮", symbol: "䷡", level: "吉", desc: "阳刚强盛，宜勇往直前" },
  { name: "归妹", symbol: "䷵", level: "凶", desc: "处事不当，宜三思后行" },
  { name: "丰", symbol: "䷶", level: "吉", desc: "丰盛富足，宜珍惜当下" },
  { name: "震", symbol: "䷲", level: "中等", desc: "雷声震动，宜保持警惕" },
  { name: "恒", symbol: "䷟", level: "吉", desc: "持之以恒，终有所成" },
  { name: "解", symbol: "䷧", level: "吉", desc: "困难化解，雨过天晴" },
  { name: "小过", symbol: "䷽", level: "中等", desc: "小有过失，宜谨小慎微" },
  { name: "豫", symbol: "䷏", level: "吉", desc: "和乐安逸，顺心如意" },
  // 上卦巽(5): 巽乾、巽兑、巽离、巽震、巽巽、巽坎、巽艮、巽坤
  { name: "小畜", symbol: "䷈", level: "中等", desc: "积少成多，稍有阻滞" },
  { name: "中孚", symbol: "䷼", level: "吉", desc: "诚信为本，吉祥如意" },
  { name: "家人", symbol: "䷤", level: "吉", desc: "家庭和睦，内外皆宜" },
  { name: "益", symbol: "䷩", level: "吉", desc: "有所增益，大吉大利" },
  { name: "巽", symbol: "䷸", level: "中等", desc: "顺势而为，柔顺处事" },
  { name: "涣", symbol: "䷺", level: "中等", desc: "涣散之象，宜聚拢人心" },
  { name: "渐", symbol: "䷴", level: "吉", desc: "循序渐进，稳步前行" },
  { name: "观", symbol: "䷓", level: "中等", desc: "静观其变，审时度势" },
  // 上卦坎(6): 坎乾、坎兑、坎离、坎震、坎巽、坎坎、坎艮、坎坤
  { name: "需", symbol: "䷄", level: "中等", desc: "等待时机，不宜急躁" },
  { name: "节", symbol: "䷻", level: "中等", desc: "节制有度，不宜过分" },
  { name: "既济", symbol: "䷾", level: "吉", desc: "功成名就，宜守成" },
  { name: "屯", symbol: "䷂", level: "中等", desc: "初始艰难，宜守不宜进" },
  { name: "井", symbol: "䷯", level: "中等", desc: "滋养万物，宜修身养性" },
  { name: "坎", symbol: "䷜", level: "凶", desc: "险阻重重，需小心谨慎" },
  { name: "蹇", symbol: "䷦", level: "凶", desc: "行路艰难，宜待时机" },
  { name: "比", symbol: "䷇", level: "吉", desc: "亲近和睦，吉祥如意" },
  // 上卦艮(7): 艮乾、艮兑、艮离、艮震、艮巽、艮坎、艮艮、艮坤
  { name: "大畜", symbol: "䷙", level: "吉", desc: "积蓄力量，大有收获" },
  { name: "损", symbol: "䷨", level: "中等", desc: "有所损失，先苦后甜" },
  { name: "贲", symbol: "䷕", level: "中等", desc: "文饰修养，小事可成" },
  { name: "颐", symbol: "䷚", level: "中等", desc: "颐养身心，谨言慎食" },
  { name: "蛊", symbol: "䷑", level: "凶", desc: "积弊需除，宜整顿革新" },
  { name: "蒙", symbol: "䷃", level: "中等", desc: "启蒙开智，循序渐进" },
  { name: "艮", symbol: "䷳", level: "中等", desc: "适可而止，宜静不宜动" },
  { name: "剥", symbol: "䷖", level: "凶", desc: "剥落衰败，宜守不宜动" },
  // 上卦坤(8): 坤乾、坤兑、坤离、坤震、坤巽、坤坎、坤艮、坤坤
  { name: "泰", symbol: "䷊", level: "吉", desc: "天地交泰，万事亨通" },
  { name: "临", symbol: "䷒", level: "吉", desc: "居高临下，如意吉祥" },
  { name: "明夷", symbol: "䷣", level: "凶", desc: "光明受损，宜韬光养晦" },
  { name: "复", symbol: "䷗", level: "吉", desc: "一阳来复，转机出现" },
  { name: "升", symbol: "䷭", level: "吉", desc: "积极上进，步步高升" },
  { name: "师", symbol: "䷆", level: "中等", desc: "行动需谨慎，贵人相助" },
  { name: "谦", symbol: "䷎", level: "吉", desc: "谦虚受益，吉无不利" },
  { name: "坤", symbol: "䷁", level: "吉", desc: "厚德载物，顺利亨通" }
];

// 梅花易数 - 时间起卦算法
function divineByTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const ms = now.getMilliseconds();

  // 计算上卦：(年+月+日+毫秒) % 8，结果1-8对应八卦
  const upperNum = (year + month + day + ms) % 8 || 8;
  
  // 计算下卦：(年+月+日+时+毫秒) % 8
  const lowerNum = (year + month + day + hour + ms) % 8 || 8;
  
  // 计算动爻：(年+月+日+时+分+秒+毫秒) % 6，结果1-6
  const changingLine = (year + month + day + hour + minute + second + ms) % 6 || 6;
  
  // 通过上下卦计算64卦索引（0-63）
  // 八卦顺序：乾1、兑2、离3、震4、巽5、坎6、艮7、坤8
  // 64卦 = (上卦-1) * 8 + (下卦-1)
  const hexagramIndex = (upperNum - 1) * 8 + (lowerNum - 1);
  
  const hexagram = HEXAGRAMS[hexagramIndex];
  
  // 格式化时间（补零）
  const pad = (n) => n.toString().padStart(2, '0');
  
  return {
    hexagram: hexagram,
    upperGua: upperNum,
    lowerGua: lowerNum,
    changingLine: changingLine,
    time: `${year}年${month}月${day}日 ${pad(hour)}:${pad(minute)}:${pad(second)}`
  };
}

// 语音包配置
const VOICE_PACKS = {
  // 大吉语音 - 兴奋、鼓励上车
  ji: [
    "大吉啊哥们.mp3",
    "梭进去死了算了.mp3",
    "别怪我没喊你们.mp3",
    "最后上车机会.mp3",
    "顶级.mp3",
    "真东西.mp3",
    "1M的东西.mp3",
    "名牌新项目.mp3",
    "勾兑好的.mp3"
  ],
  // 中等语音 - 观望、研究
  zhongdeng: [
    "中等 还是别动了.mp3",
    "研究.mp3",
    "还在顿.mp3",
    "这个有点有意思.mp3",
    "看dev来源.mp3",
    "看榜1地址.mp3",
    "差点看漏了.mp3",
    "官方角度.mp3",
    "对生活有帮助.mp3"
  ],
  // 凶语音 - 警告
  xiong: [
    "凶啊哥们.mp3"
  ],
  // 彩蛋语音 - 特色/英文
  special: [
    "我哥来了.mp3",
    "老外组局.mp3",
    "自拉盘.mp3",
    "look this.mp3",
    "Funds are SAFU.mp3",
    "Keep building!.mp3",
    "If you can't hold, you won't be rich.mp3",
    "All my money is in crypto, I don't have dollars..mp3"
  ]
};

// 随机获取数组中的一个元素
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 获取吉凶对应的音频文件名（随机选择）
function getAudioFile(level) {
  // 5%概率触发彩蛋语音
  if (Math.random() < 0.05) {
    return randomPick(VOICE_PACKS.special);
  }
  
  switch(level) {
    case "吉": return randomPick(VOICE_PACKS.ji);
    case "中等": return randomPick(VOICE_PACKS.zhongdeng);
    case "凶": return randomPick(VOICE_PACKS.xiong);
    default: return randomPick(VOICE_PACKS.zhongdeng);
  }
}

// 获取吉凶对应的颜色
function getLevelColor(level) {
  switch(level) {
    case "吉": return "#e74c3c";  // 红色（中国传统吉祥色）
    case "中等": return "#f39c12"; // 橙黄色
    case "凶": return "#27ae60";   // 绿色（凶用绿色，避免太刺眼）
    default: return "#f39c12";
  }
}

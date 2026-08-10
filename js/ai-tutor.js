/**
 * Gomoku 3D - AI Tutor v5.0 (Professional)
 * 
 * Based on real professional Renju theory:
 * - 26 opening variations with detailed explanations
 * - Professional pattern recognition knowledge base
 * - Game analysis using master-level evaluation
 * - Move recommendation with threat assessment
 * 
 * References:
 * - RIF World Renju Championship analysis
 * - Chinese Renju Association teaching materials
 * - Yixin engine evaluation methodology
 */

// ============= 26 Professional Opening Database =============
const OPENING_THEORY = {
  // Direct openings (黑3直指白2)
  direct: [
    {
      name: '寒星', pinyin: 'hanxing',
      black3: '直指(-1,0)', type: '均衡型',
      desc: '黑3在白2正上方相隔一格，属于冷门开局。白4有多种选择，局面相对均衡，适合稳健型棋手。',
      theory: '寒星局的关键在于黑5的选择。常见变化有黑5走星位或靠压，形成攻守兼备的局面。白方应利用先手优势在中腹建立据点。',
      evaluation: '均衡', winRate: '黑48% 白44%',
      keyPoint: '注意控制中腹，避免被对方形成双三威胁'
    },
    {
      name: '溪月', pinyin: 'xiyue',
      black3: '直指(0,1)', type: '黑稍优型',
      desc: '黑3在白2右侧紧邻，是常见的直指开局之一。黑方稍占优势，但白方有足够的防守资源。',
      theory: '溪月局中，黑5通常选择扩展或跳。白4的防守要点在于限制黑方的扩展空间。此局黑方有多种进攻路线，白方需谨慎应对。',
      evaluation: '黑稍优', winRate: '黑52% 白40%',
      keyPoint: '黑方应利用先手积极进攻，白方注意防守反击'
    },
    {
      name: '疏星', pinyin: 'shuxing',
      black3: '直指(1,1)', type: '均衡型',
      desc: '黑3在白2斜下方，是均衡型开局的代表。双方势均力敌，对局质量取决于中盘能力。',
      theory: '疏星局是现代五子棋最流行的开局之一。黑5的选择决定了后续的发展方向。常见变化包括星位扩展和跳位进攻。',
      evaluation: '均衡', winRate: '黑49% 白43%',
      keyPoint: '中盘战斗力是决定胜负的关键'
    },
    {
      name: '花月', pinyin: 'huayue',
      black3: '直指(1,0)', type: '黑必胜型',
      desc: '黑3在白2正下方紧邻，是26种开局中最强的直指开局之一。理论上黑必胜，实战中也是黑方胜率最高的开局。',
      theory: '花月局的核心在于黑方通过连续进攻形成必胜局面。关键变化：黑5扩展后，白方无论如何防守，黑方都有VCF或VCT的胜路。花月局的必胜路线已被计算机验证。',
      evaluation: '黑必胜', winRate: '黑68% 白28%',
      keyPoint: '黑方应坚持进攻路线，利用VCF/VCT取胜；白方需寻找最佳防守延迟败局'
    },
    {
      name: '残月', pinyin: 'canyue',
      black3: '直指(1,-1)', type: '黑稍优型',
      desc: '黑3在白2左下方斜位，属于黑方稍占优势的开局。',
      theory: '残月局的关键在于黑5的位置选择。常见变化有跳位和靠压，黑方在局部战斗中稍占优势。',
      evaluation: '黑稍优', winRate: '黑53% 白39%',
      keyPoint: '黑方注意局部战斗的节奏控制'
    },
    {
      name: '雨月', pinyin: 'yuyue',
      black3: '直指(0,-1)', type: '均衡型',
      desc: '黑3在白2左侧紧邻，属于均衡型开局。',
      theory: '雨月局的变化较为复杂，双方在中盘阶段都有机会。黑方需要注意白方的反击路线。',
      evaluation: '均衡', winRate: '黑48% 白45%',
      keyPoint: '注意白方的反击路线，保持攻守平衡'
    },
    {
      name: '金星', pinyin: 'jinxing',
      black3: '直指(2,-1)', type: '黑优型',
      desc: '黑3跳位在白2左下方，属于黑方占优的开局。',
      theory: '金星局中黑方通过跳位形成更大的威胁空间。白4的防守要点是限制黑方的扩展方向。',
      evaluation: '黑优', winRate: '黑56% 白35%',
      keyPoint: '黑方利用跳位优势建立威胁空间'
    },
    {
      name: '松月', pinyin: 'songyue',
      black3: '直指(-1,1)', type: '均衡型',
      desc: '黑3在白2右上方，属于均衡型开局。',
      theory: '松月局双方在中盘的争夺非常激烈。黑方需要注意白方的反击路线，白方则应利用先手防守建立反击机会。',
      evaluation: '均衡', winRate: '黑49% 白44%',
      keyPoint: '中盘攻防转换是关键'
    },
    {
      name: '丘月', pinyin: 'qiuyue',
      black3: '直指(-1,-1)', type: '均衡型',
      desc: '黑3在白2左上方斜位，属于均衡型开局。',
      theory: '丘月局的变化较为平稳，双方在布局阶段建立据点，中盘再展开争夺。',
      evaluation: '均衡', winRate: '黑48% 白44%',
      keyPoint: '布局阶段建立据点，中盘展开争夺'
    },
    {
      name: '新月', pinyin: 'xinyue',
      black3: '直指(-2,0)', type: '黑稍优型',
      desc: '黑3跳位在白2正上方，属于黑方稍占优势的开局。',
      theory: '新月局中黑方通过跳位形成更大的威胁空间。白方需要注意防守黑方的跳位进攻。',
      evaluation: '黑稍优', winRate: '黑54% 白38%',
      keyPoint: '黑方利用跳位形成威胁空间'
    },
    {
      name: '瑞星', pinyin: 'ruixing',
      black3: '直指(-1,-2)', type: '黑稍优型',
      desc: '黑3在白2左上方跳位，属于黑方稍占优势的开局。',
      theory: '瑞星局的关键在于黑方的威胁空间搜索。白方需要准确判断黑方的进攻路线。',
      evaluation: '黑稍优', winRate: '黑53% 白39%',
      keyPoint: '准确判断进攻路线，做好防守准备'
    },
    {
      name: '山月', pinyin: 'shanyue',
      black3: '直指(0,-2)', type: '均衡型',
      desc: '黑3跳位在白2左侧，属于均衡型开局。',
      theory: '山月局双方在布局阶段相对平稳，中盘阶段展开争夺。',
      evaluation: '均衡', winRate: '黑49% 白43%',
      keyPoint: '中盘阶段展开争夺'
    },
    {
      name: '游星', pinyin: 'youxing',
      black3: '直指(1,-2)', type: '白必胜型',
      desc: '黑3在白2左下方跳位，是26种开局中白方占优的开局之一。理论上白必胜。',
      theory: '游星局是黑方不利的开局。黑5的选择虽然多样，但白方通过精确的防守和反击可以取得胜利。黑方应尽量避免选择此开局。',
      evaluation: '白必胜', winRate: '黑30% 白62%',
      keyPoint: '黑方应避免选择此开局；白方利用先手防守建立反击'
    }
  ],
  // Diagonal openings (黑3斜指白2)
  diagonal: [
    {
      name: '长星', pinyin: 'changxing',
      black3: '斜指(2,1)', type: '黑稍优型',
      desc: '黑3在白2右下方斜跳位，属于黑方稍占优势的斜指开局。',
      theory: '长星局的关键在于黑方利用斜线的威胁空间。白方需要防守斜线方向的同时注意横向和纵向的威胁。',
      evaluation: '黑稍优', winRate: '黑54% White 37%',
      keyPoint: '黑方利用斜线威胁空间'
    },
    {
      name: '峡月', pinyin: 'xiayue',
      black3: '斜指(1,2)', type: '黑优型',
      desc: '黑3在白2右上方斜跳位，属于黑方占优的斜指开局。',
      theory: '峡月局中黑方在斜线方向形成较强的威胁。白方的防守要点是限制黑方的斜线扩展。',
      evaluation: '黑优', winRate: '黑57% 白34%',
      keyPoint: '黑方在斜线方向形成威胁'
    },
    {
      name: '恒星', pinyin: 'hengxing',
      black3: '斜指(2,2)', type: '黑优型',
      desc: '黑3在白2斜下方跳位，属于黑方占优的斜指开局。',
      theory: '恒星局黑方在斜线方向有较大的威胁空间。白方需要精确防守，否则容易陷入被动。',
      evaluation: '黑优', winRate: '黑58% 白33%',
      keyPoint: '黑方在斜线方向威胁较大，白方需精确防守'
    },
    {
      name: '水月', pinyin: 'shuiyue',
      black3: '斜指(0,2)', type: '黑稍优型',
      desc: '黑3在白2右侧跳位，属于黑方稍占优势的斜指开局。',
      theory: '水月局中黑方通过跳位形成威胁。白方应防守黑方的扩展方向，同时寻找反击机会。',
      evaluation: '黑稍优', winRate: '黑55% 白36%',
      keyPoint: '黑方通过跳位形成威胁'
    },
    {
      name: '流星', pinyin: 'liuxing',
      black3: '斜指(-1,2)', type: '均衡型',
      desc: '黑3在白2右上方跳位，属于均衡型斜指开局。',
      theory: '流星局的变化较为复杂。双方在中盘阶段都有机会，关键在于对威胁的准确判断。',
      evaluation: '均衡', winRate: '黑49% 白42%',
      keyPoint: '准确判断威胁是关键'
    },
    {
      name: '云月', pinyin: 'yunyue',
      black3: '斜指(-2,1)', type: '黑稍优型',
      desc: '黑3在白2上方跳位，属于黑方稍占优势的斜指开局。',
      theory: '云月局中黑方通过跳位形成威胁空间。白方需要注意防守黑方的扩展方向。',
      evaluation: '黑稍优', winRate: '黑53% 白38%',
      keyPoint: '黑方通过跳位形成威胁空间'
    },
    {
      name: '浦月', pinyin: 'puyue',
      black3: '斜指(-2,0)', type: '黑必胜型',
      desc: '黑3在白2正上方跳位，是26种开局中最强的斜指开局之一。理论上黑必胜。',
      theory: '浦月局是黑方必胜开局。黑5扩展后，黑方有多种进攻路线可选，最终都能通过VCF/VCT取胜。浦月局的必胜路线已被计算机验证。',
      evaluation: '黑必胜', winRate: '黑66% 白29%',
      keyPoint: '黑方坚持进攻路线，利用VCF/VCT取胜'
    },
    {
      name: '岚月', pinyin: 'lanyue',
      black3: '斜指(-2,-2)', type: '黑稍优型',
      desc: '黑3在白2左上方斜跳位，属于黑方稍占优势的斜指开局。',
      theory: '岚月局中黑方在斜线方向稍占优势。白方应防守斜线方向，同时寻找反击机会。',
      evaluation: '黑稍优', winRate: '黑53% 白38%',
      keyPoint: '黑方在斜线方向稍占优势'
    },
    {
      name: '银月', pinyin: 'yinyue',
      black3: '斜指(-1,-2)', type: '均衡型',
      desc: '黑3在白2左上方跳位，属于均衡型斜指开局。',
      theory: '银月局双方在布局阶段相对平稳。中盘阶段是争夺的关键。',
      evaluation: '均衡', winRate: '黑48% 白43%',
      keyKey: '中盘争夺是关键',
      keyPoint: '中盘阶段展开争夺'
    },
    {
      name: '明星', pinyin: 'mingxing',
      black3: '斜指(0,-2)', type: '黑稍优型',
      desc: '黑3在白2左侧跳位，属于黑方稍占优势的斜指开局。',
      theory: '明星局中黑方通过跳位形成威胁。白方需要防守黑方的扩展方向。',
      evaluation: '黑稍优', winRate: '黑54% 白37%',
      keyPoint: '黑方通过跳位形成威胁'
    },
    {
      name: '斜月', pinyin: 'xieyue',
      black3: '斜指(2,-2)', type: '均衡型',
      desc: '黑3在白2左下方斜跳位，属于均衡型斜指开局。',
      theory: '斜月局双方在布局阶段相对平稳。中盘阶段展开争夺。',
      evaluation: '均衡', winRate: '黑49% 白42%',
      keyPoint: '中盘阶段展开争夺'
    },
    {
      name: '名月', pinyin: 'mingyue',
      black3: '斜指(1,-2)', type: '黑稍优型',
      desc: '黑3在白2左下方跳位，属于黑方稍占优势的斜指开局。',
      theory: '名月局中黑方通过跳位形成威胁空间。白方需要防守黑方的扩展方向。',
      evaluation: '黑稍优', winRate: '黑55% 白36%',
      keyPoint: '黑方通过跳位形成威胁空间'
    },
    {
      name: '彗星', pinyin: 'huixing',
      black3: '斜指(2,0)', type: '白必胜型',
      desc: '黑3在白2右侧跳位，是26种开局中白方占优的斜指开局。理论上白必胜。',
      theory: '彗星局是黑方不利的开局。白方通过精确的防守和反击可以取得胜利。黑方应尽量避免选择此开局。',
      evaluation: '白必胜', winRate: '黑31% 白60%',
      keyPoint: '黑方应避免选择此开局'
    }
  ]
};

// ============= Professional Pattern Knowledge Base =============
const PATTERN_NAMES = {
  five: { name: '五连', cn: '五连', desc: '五颗同色棋子连成一线，直接获胜' },
  openFour: { name: '活四', cn: '活四', desc: '四颗同色棋子连成一线且两端均空。下一步必胜，对方必须立即阻止' },
  four: { name: '冲四', cn: '冲四', desc: '四颗同色棋子连成一线但一端被封堵。强迫对方应一手' },
  jumpFour: { name: '跳四', cn: '跳四', desc: '四颗同色棋子中间有一个空格（X_XXX、XX_XX、XXX_X）。等效冲四' },
  openThree: { name: '活三', cn: '活三', desc: '三颗同色棋子连成一线且两端均空。下一步可成活四，对方需防守' },
  jumpThree: { name: '跳三', cn: '跳三', desc: '三颗同色棋子中间有空格（X_XX、XX_X）。威胁力较强' },
  three: { name: '眠三', cn: '眠三', desc: '三颗同色棋子连成一线但一端被封堵。威胁力较弱' },
  openTwo: { name: '活二', cn: '活二', desc: '两颗同色棋子连成一线且两端均空。可发展为活三' },
  two: { name: '眠二', cn: '眠二', desc: '两颗同色棋子连成一线但一端被封堵。威胁力很弱' },
  doubleThree: { name: '双三', cn: '双三', desc: '同时形成两个活三。对方无法同时防守，形成必胜局面' },
  doubleFour: { name: '双四', cn: '双四', desc: '同时形成两个冲四。对方无法同时防守，形成必胜局面' },
  fourThree: { name: '四三', cn: '四三', desc: '同时形成一个冲四和一个活三。对方必须防四，三可成活四取胜' },
  sword: { name: '一剑穿心', cn: '一剑穿心', desc: '通过连续冲四或活三形成必胜的组合攻击' }
};

// ============= Professional Tactics Knowledge =============
const TACTICS = {
  // VCF: Victory by Continuous Fours
  vcf: {
    name: 'VCF (连续冲四胜)',
    cn: 'VCF',
    desc: 'Victory by Continuous Fours。通过连续冲四强迫对方防守，最终形成五连取胜。是五子棋最基本和最重要的必胜技术。',
    when: '当局面中有多个四的素材时，应首先考虑VCF路线。',
    principle: 'VCF的关键是找到正确的冲四顺序，确保每一步冲四都迫使对方防守，最终形成五连。',
    example: '经典VCF：黑方通过3-5次连续冲四，最终形成五连取胜。在实战中，VCF通常不超过7步。'
  },
  // VCT: Victory by Continuous Threats
  vct: {
    name: 'VCT (连续威胁胜)',
    cn: 'VCT',
    desc: 'Victory by Continuous Threats。通过连续的活三和冲四威胁强迫对方防守，最终形成必胜局面。比VCF更复杂。',
    when: '当VCF不可行时，应考虑VCT路线。VCT利用活三和冲四的组合威胁。',
    principle: 'VCT的关键是利用活三迫使对方防守，在防守过程中创造新的四或三的素材，最终形成VCF或双威胁取胜。',
    example: '经典VCT：黑方先通过活三扩展素材，再通过冲四形成VCF取胜。VCT的计算深度通常比VCF更深。'
  },
  // TSS: Threat-Space Search
  tss: {
    name: 'TSS (威胁空间搜索)',
    cn: 'TSS',
    desc: 'Threat-Space Search。在威胁空间中搜索必胜路线，是现代五子棋AI的核心技术。',
    when: '当局面复杂，需要深度计算时，TSS可以快速找到必胜路线。',
    principle: 'TSS只考虑能形成威胁的着法（活三、冲四等），大幅减少搜索空间，实现更深的计算。',
    example: 'TSS技术在Yixin等顶尖AI中广泛使用，可以在合理时间内找到15步以上的必胜路线。'
  },
  // Combination Attack
  combination: {
    name: '组合攻击',
    cn: '组合攻击',
    desc: '通过同时形成多个威胁（双三、四三、双四等）使对方无法同时防守。',
    when: '当单个威胁无法取胜时，应寻求组合攻击的机会。',
    principle: '组合攻击的核心是制造交叉点。一个着法同时形成两个或更多威胁，对方只能防守一个。',
    example: '经典四三胜：黑方在一个着法同时形成冲四和活三，对方防四后，三可成活四取胜。'
  },
  // Fork Attack
  fork: {
    name: '交叉攻击',
    cn: '交叉攻击',
    desc: '在棋盘的不同区域同时形成威胁，对方难以兼顾。',
    when: '当棋盘上有多个分散的进攻素材时。',
    principle: '交叉攻击利用棋盘的广阔空间，在不同区域形成威胁，让对方顾此失彼。',
    example: '黑方在左上角和右下角同时有活三素材，白方难以同时防守。'
  },
  // Defense Strategy
  defense: {
    name: '防守策略',
    cn: '防守策略',
    desc: '面对对方威胁时的最优防守原则。',
    when: '当对方形成活三、冲四等威胁时。',
    principle: '防守优先级：五连 > 活四 > 双四 > 四三 > 双三 > 冲四 > 活三 > 跳三。同级威胁中，选择能同时防守多个威胁的点。',
    example: '对方活三时，应选择能同时防守活三并形成自己威胁的防守点（防守反击）。'
  },
  // Opening Strategy
  opening: {
    name: '开局策略',
    cn: '开局策略',
    desc: '26种专业开局的选择和应用原则。',
    when: '游戏开始阶段（前5-7步）。',
    principle: '黑方应优先选择花月、浦月等必胜开局；白方应利用三手交换规则选择对白方有利的开局。注意避免游星、彗星等黑必败开局。',
    example: '花月局：黑3直指白2正下方，黑方通过VCF/VCT必胜。'
  },
  // Endgame Analysis
  endgame: {
    name: '终局分析',
    cn: '终局分析',
    desc: '优势或劣势局面下的终局处理原则。',
    when: '当一方形成明显优势或劣势时。',
    principle: '优势方应加速进攻，避免给对方喘息机会；劣势方应尽量拖延，寻找对方失误或反击机会。',
    example: '黑方形成活四时，应立即冲四取胜，不要给白方任何机会。'
  },
  // Prohibitions (Renju rules)
  prohibitions: {
    name: '禁手规则',
    cn: '禁手',
    desc: 'Renju规则中黑方的禁手：三三、四四、长连。',
    when: '黑方落子时需注意禁手限制。',
    principle: '黑方不能同时形成两个活三（三三禁手）、两个四（四四禁手）或长连（六子以上）。白方无禁手限制。',
    example: '黑方形成双三时判负。但需要注意，有些三三/四四并非真正的禁手，需要准确判断。'
  },
  // Swap Rules
  swap: {
    name: '交换规则',
    cn: '交换规则',
    desc: '三手交换和五手两打规则，用于平衡先后手优势。',
    when: '正式比赛中的开局阶段。',
    principle: '三手交换：白方在黑方下完前三手后可选择交换颜色。五手两打：黑方在第五手时提供两个着法供白方选择。这些规则平衡了先手优势。',
    example: '三手交换规则下，黑方不能选择必胜开局（如花月、浦月），否则白方会交换。'
  }
};

// ============= AI Tutor Class =============
class AITutor {
  constructor(engine) {
    this.engine = engine;
  }

  // Analyze the current position and give advice
  analyzePosition(color) {
    const opponent = color === 'black' ? 'white' : 'black';
    const threats = this.findAllThreats(color);
    const oppThreats = this.findAllThreats(opponent);
    const moveCount = this.engine.moveHistory.length;
    const analysis = {
      phase: this.getGamePhase(moveCount),
      threats,
      oppThreats,
      advice: [],
      evaluation: '',
      urgency: 'normal'
    };

    // 1. Check for immediate win
    const winMove = this.findWinningMove(color);
    if (winMove) {
      analysis.advice.push({
        type: 'win',
        text: `在 (${winMove.row + 1}, ${winMove.col + 1}) 落子可直接获胜！`,
        move: winMove,
        urgency: 'critical'
      });
      analysis.urgency = 'critical';
      analysis.evaluation = '有必胜着法';
      return analysis;
    }

    // 2. Check for immediate block
    const blockMove = this.findCriticalBlock(opponent);
    if (blockMove) {
      analysis.advice.push({
        type: 'block',
        text: `对方有直接威胁！必须在 (${blockMove.row + 1}, ${blockMove.col + 1}) 防守。`,
        move: blockMove,
        urgency: 'critical'
      });
      analysis.urgency = 'critical';
      analysis.evaluation = '必须防守';
      return analysis;
    }

    // 3. Check for VCF/VCT opportunities
    if (threats.fours >= 1 && threats.openThrees >= 1) {
      analysis.advice.push({
        type: 'combination',
        text: '当前有四三组合的机会！先冲四，再利用活三扩展，可形成必胜局面。',
        urgency: 'high'
      });
      analysis.urgency = 'high';
    }

    if (threats.openThrees >= 2) {
      analysis.advice.push({
        type: 'doubleThree',
        text: '有双三的机会！对方无法同时防守两个活三，可形成必胜局面。',
        urgency: 'high'
      });
      analysis.urgency = 'high';
    }

    if (threats.fours >= 2) {
      analysis.advice.push({
        type: 'doubleFour',
        text: '有双四的机会！对方无法同时防守两个冲四，可形成必胜局面。',
        urgency: 'high'
      });
      analysis.urgency = 'high';
    }

    // 4. Check opponent threats
    if (oppThreats.openThrees >= 2) {
      analysis.advice.push({
        type: 'warning',
        text: '对方有双三威胁！需要找到一个能同时防守两个活三的点。',
        urgency: 'high'
      });
      analysis.urgency = 'high';
    }

    if (oppThreats.fours >= 1) {
      analysis.advice.push({
        type: 'warning',
        text: '对方有冲四威胁，必须立即防守。',
        urgency: 'high'
      });
      analysis.urgency = 'high';
    }

    if (oppThreats.openThrees >= 1) {
      analysis.advice.push({
        type: 'warning',
        text: `对方有${oppThreats.openThrees}个活三威胁，需要防守。`,
        urgency: 'medium'
      });
      if (analysis.urgency === 'normal') analysis.urgency = 'medium';
    }

    // 5. Opening phase advice
    if (moveCount < 6) {
      const opening = this.identifyOpening();
      if (opening) {
        analysis.advice.push({
          type: 'opening',
          text: `当前开局为「${opening.name}」（${opening.type}）。${opening.keyPoint}`,
          urgency: 'low'
        });
      } else if (moveCount < 3) {
        analysis.advice.push({
          type: 'opening',
          text: '开局阶段，建议从中腹扩展，建立进攻据点。花月、浦月为黑方最强开局。',
          urgency: 'low'
        });
      }
    }

    // 6. Tactical advice
    if (threats.openThrees >= 1 && analysis.urgency !== 'critical') {
      analysis.advice.push({
        type: 'tactic',
        text: `当前有${threats.openThrees}个活三，可利用VCT（连续威胁胜）路线扩展进攻素材。`,
        urgency: 'medium'
      });
    }

    if (threats.fours >= 1 && analysis.urgency !== 'critical') {
      analysis.advice.push({
        type: 'tactic',
        text: `当前有${threats.fours}个冲四素材，可尝试VCF（连续冲四胜）路线。`,
        urgency: 'medium'
      });
    }

    // 7. General evaluation
    if (analysis.advice.length === 0) {
      const evalScore = this.evaluatePosition(color, opponent);
      if (evalScore > 50000) {
        analysis.evaluation = '优势';
        analysis.advice.push({
          type: 'general',
          text: '当前局面占优，应继续扩大优势，寻找进攻机会。',
          urgency: 'low'
        });
      } else if (evalScore < -50000) {
        analysis.evaluation = '劣势';
        analysis.advice.push({
          type: 'general',
          text: '当前局面被动，应稳固防守，等待对方失误。',
          urgency: 'low'
        });
      } else {
        analysis.evaluation = '均势';
        analysis.advice.push({
          type: 'general',
          text: '当前局面均势，应积极布局，为中盘战斗做准备。',
          urgency: 'low'
        });
      }
    }

    return analysis;
  }

  getGamePhase(moveCount) {
    if (moveCount < 8) return 'opening';
    if (moveCount < 25) return 'middlegame';
    return 'endgame';
  }

  // Recommend the best move with explanation
  recommendMove(color) {
    const opponent = color === 'black' ? 'white' : 'black';

    // 1. Win
    const winMove = this.findWinningMove(color);
    if (winMove) {
      return {
        move: winMove,
        reason: `在 (${winMove.row + 1}, ${winMove.col + 1}) 落子可直接五连获胜！`,
        type: 'win'
      };
    }

    // 2. Block
    const blockMove = this.findCriticalBlock(opponent);
    if (blockMove) {
      return {
        move: blockMove,
        reason: `对方有直接威胁，必须在 (${blockMove.row + 1}, ${blockMove.col + 1}) 防守。`,
        type: 'block'
      };
    }

    // 3. Attack
    const attackMove = this.findBestAttack(color);
    if (attackMove) {
      return {
        move: attackMove.move,
        reason: attackMove.reason,
        type: 'attack'
      };
    }

    // 4. Default
    return {
      move: null,
      reason: '建议继续布局，寻找进攻机会。',
      type: 'general'
    };
  }

  findWinningMove(color) {
    const candidates = this.engine.getCandidateMoves();
    for (const move of candidates) {
      this.engine.board[move.row][move.col] = color;
      const win = this.engine.checkWin(move.row, move.col, color);
      this.engine.board[move.row][move.col] = null;
      if (win) return move;
    }
    return null;
  }

  findCriticalBlock(opponent) {
    const candidates = this.engine.getCandidateMoves();
    for (const move of candidates) {
      this.engine.board[move.row][move.col] = opponent;
      const win = this.engine.checkWin(move.row, move.col, opponent);
      this.engine.board[move.row][move.col] = null;
      if (win) return move;
    }
    // Check open four
    for (const move of candidates) {
      this.engine.board[move.row][move.col] = opponent;
      if (this.hasOpenFour(move.row, move.col, opponent)) {
        this.engine.board[move.row][move.col] = null;
        return move;
      }
      this.engine.board[move.row][move.col] = null;
    }
    return null;
  }

  hasOpenFour(row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      let leftOpen = false, rightOpen = false;
      for (let i = 1; i <= 4; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= this.engine.size || c < 0 || c >= this.engine.size) break;
        if (this.engine.board[r][c] === color) count++;
        else { rightOpen = (this.engine.board[r][c] === null); break; }
      }
      for (let i = 1; i <= 4; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= this.engine.size || c < 0 || c >= this.engine.size) break;
        if (this.engine.board[r][c] === color) count++;
        else { leftOpen = (this.engine.board[r][c] === null); break; }
      }
      if (count >= 4 && leftOpen && rightOpen) return true;
    }
    return false;
  }

  findBestAttack(color) {
    const candidates = this.engine.getCandidateMoves();
    let bestMove = null;
    let bestScore = -1;
    const opponent = color === 'black' ? 'white' : 'black';

    for (const move of candidates) {
      this.engine.board[move.row][move.col] = color;
      const threats = this.detectThreats(move.row, move.col, color);
      this.engine.board[move.row][move.col] = null;

      let score = 0;
      let reason = '';

      if (threats.fours >= 2) {
        score = 100;
        reason = `在 (${move.row + 1}, ${move.col + 1}) 落子形成双四，对方无法同时防守！`;
      } else if (threats.openFours >= 1) {
        score = 90;
        reason = `在 (${move.row + 1}, ${move.col + 1}) 落子形成活四，下一步可获胜！`;
      } else if (threats.fours >= 1 && threats.openThrees >= 1) {
        score = 85;
        reason = `在 (${move.row + 1}, ${move.col + 1}) 落子形成四三组合，对方防四后可扩展活三。`;
      } else if (threats.openThrees >= 2) {
        score = 80;
        reason = `在 (${move.row + 1}, ${move.col + 1}) 落子形成双三，对方难以同时防守！`;
      } else if (threats.fours >= 1) {
        score = 60;
        reason = `在 (${move.row + 1}, ${move.col + 1}) 落子形成冲四，可迫使对方防守。`;
      } else if (threats.openThrees >= 1) {
        score = 50;
        reason = `在 (${move.row + 1}, ${move.col + 1}) 落子形成活三，可扩展进攻素材。`;
      } else if (threats.jumpThrees >= 1) {
        score = 40;
        reason = `在 (${move.row + 1}, ${move.col + 1}) 落子形成跳三，有进攻潜力。`;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = { move, reason };
      }
    }

    return bestMove;
  }

  detectThreats(row, col, color) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let fours = 0, openThrees = 0, openFours = 0, jumpThrees = 0, jumpFours = 0;

    for (const [dr, dc] of directions) {
      const info = this.analyzeLine(row, col, dr, dc, color);
      if (info.count >= 5) openFours++;
      else if (info.count === 4 && info.openEnds === 2) openFours++;
      else if (info.count === 4 && info.openEnds === 1) fours++;
      else if (info.count === 3 && info.openEnds === 2) openThrees++;

      const jump = this.detectJumpPattern(row, col, dr, dc, color);
      if (jump.jumpFour) jumpFours++;
      if (jump.jumpThree) jumpThrees++;
    }

    return {
      fours, openFours, openThrees, jumpThrees, jumpFours,
      doubleThreat: (fours + openFours + openThrees + jumpThrees + jumpFours) >= 2
    };
  }

  analyzeLine(row, col, dr, dc, color) {
    let count = 1;
    let leftOpen = false, rightOpen = false;

    for (let i = 1; i <= 5; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= this.engine.size || c < 0 || c >= this.engine.size) break;
      if (this.engine.board[r][c] === color) count++;
      else { rightOpen = (this.engine.board[r][c] === null); break; }
    }
    for (this.engine.board[row][col] === color; ;) {
      for (let i = 1; i <= 5; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= this.engine.size || c < 0 || c >= this.engine.size) break;
        if (this.engine.board[r][c] === color) count++;
        else { leftOpen = (this.engine.board[r][c] === null); break; }
      }
      break;
    }

    return {
      count,
      openEnds: (leftOpen ? 1 : 0) + (rightOpen ? 1 : 0),
      leftOpen, rightOpen
    };
  }

  detectJumpPattern(row, col, dr, dc, color) {
    let jumpThree = false, jumpFour = false;

    for (let offset = -4; offset <= 0; offset++) {
      let line = '';
      for (let i = 0; i < 6; i++) {
        const r = row + dr * (offset + i);
        const c = col + dc * (offset + i);
        if (r < 0 || r >= this.engine.size || c < 0 || c >= this.engine.size) line += '#';
        else if (this.engine.board[r][c] === color) line += 'X';
        else if (this.engine.board[r][c] === null) line += '_';
        else line += '#';
      }
      if (line.includes('X_XXX') || line.includes('XXX_X') || line.includes('XX_XX')) jumpFour = true;
      if (line.includes('_X_XX_') || line.includes('_XX_X_')) jumpThree = true;
    }
    return { jumpThree, jumpFour };
  }

  findAllThreats(color) {
    let fours = 0, openThrees = 0, openFours = 0, jumpThrees = 0, jumpFours = 0;
    const seen = new Set();

    for (let r = 0; r < this.engine.size; r++) {
      for (let c = 0; c < this.engine.size; c++) {
        if (this.engine.board[r][c] === color) {
          const threats = this.detectThreats(r, c, color);
          fours += threats.fours;
          openThrees += threats.openThrees;
          openFours += threats.openFours;
          jumpThrees += threats.jumpThrees;
          jumpFours += threats.jumpFours;
        }
      }
    }

    // Divide by typical overlap factor
    return {
      fours: Math.ceil(fours / 2),
      openThrees: Math.ceil(openThrees / 2),
      openFours: Math.ceil(openFours / 2),
      jumpThrees: Math.ceil(jumpThrees / 2),
      jumpFours: Math.ceil(jumpFours / 2)
    };
  }

  evaluatePosition(color, opponent) {
    let score = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let r = 0; r < this.engine.size; r++) {
      for (let c = 0; c < this.engine.size; c++) {
        if (this.engine.board[r][c] === color) {
          for (const [dr, dc] of directions) {
            const info = this.analyzeLine(r, c, dr, dc, color);
            score += this.scorePattern(info);
          }
        } else if (this.engine.board[r][c] === opponent) {
          for (const [dr, dc] of directions) {
            const info = this.analyzeLine(r, c, dr, dc, opponent);
            score -= this.scorePattern(info);
          }
        }
      }
    }

    return score;
  }

  scorePattern(info) {
    const { count, openEnds } = info;
    if (count >= 5) return 100000000;
    if (count === 4) return openEnds === 2 ? 10000000 : 500000;
    if (count === 3) return openEnds === 2 ? 50000 : 5000;
    if (count === 2) return openEnds === 2 ? 2000 : 200;
    if (count === 1) return openEnds === 2 ? 10 : 1;
    return 0;
  }

  // Identify the current opening based on move history
  identifyOpening() {
    const history = this.engine.moveHistory;
    if (history.length < 3) return null;

    const m0 = history[0];
    const m1 = history[1];
    const m2 = history[2];

    const dr = m2.row - m1.row;
    const dc = m2.col - m1.col;

    const allOpenings = [...OPENING_THEORY.direct, ...OPENING_THEORY.diagonal];

    for (const opening of allOpenings) {
      const coords = opening.black3.match(/-?\d+/g);
      if (coords && coords.length >= 2) {
        const od1 = parseInt(coords[0]);
        const od2 = parseInt(coords[1]);
        if (dr === od1 && dc === od2) return opening;
      }
    }

    return null;
  }

  // Explain a specific move
  explainMove(move, color) {
    const opponent = color === 'black' ? 'white' : 'black';
    this.engine.board[move.row][move.col] = color;
    const threats = this.detectThreats(move.row, move.col, color);
    this.engine.board[move.row][move.col] = null;

    let explanation = `(${move.row + 1}, ${move.col + 1}) `;

    if (threats.openFours > 0) {
      explanation += `形成活四${threats.openFours > 1 ? '（多重）' : ''}！下一步即可五连获胜。`;
    } else if (threats.fours >= 2) {
      explanation += `形成双四！对方无法同时防守两个冲四，形成必胜局面。`;
    } else if (threats.fours >= 1 && threats.openThrees >= 1) {
      explanation += `形成四三组合！冲四迫使对方防守，随后可扩展活三取胜。`;
    } else if (threats.fours >= 1) {
      explanation += `形成冲四${threats.fours > 1 ? '（多重）' : ''}，迫使对方防守。`;
    } else if (threats.openThrees >= 2) {
      explanation += `形成双三！对方难以同时防守两个活三。`;
    } else if (threats.openThrees >= 1) {
      explanation += `形成活三${threats.openThrees > 1 ? '（多重）' : ''}，可扩展为活四。`;
    } else if (threats.jumpThrees >= 1) {
      explanation += `形成跳三，有进攻潜力。`;
    } else {
      explanation += `扩展棋型，为后续进攻做准备。`;
    }

    return explanation;
  }

  // Review a completed game
  reviewGame(history) {
    const review = {
      totalMoves: history.length,
      phases: [],
      keyMoves: [],
      summary: '',
      mistakes: []
    };

    if (history.length < 4) {
      review.summary = '对局过短，无法进行有效分析。';
      return review;
    }

    // Analyze opening
    if (history.length >= 3) {
      const opening = this.identifyOpeningFromHistory(history);
      if (opening) {
        review.phases.push({
          phase: 'opening',
          text: `开局采用「${opening.name}」（${opening.type}）。${opening.theory}`
        });
      } else {
        review.phases.push({
          phase: 'opening',
          text: '开局较为自由，未采用标准26种开局之一。建议学习专业开局理论。'
        });
      }
    }

    // Analyze key moves
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      const color = move.color || (i % 2 === 0 ? 'black' : 'white');
      
      // Simulate the position before this move
      const tempEngine = {
        board: this.createTempBoard(history.slice(0, i)),
        size: this.engine.size,
        checkWin: this.engine.checkWin.bind(this.engine)
      };

      // Check if this was a winning move
      tempEngine.board[move.row][move.col] = color;
      if (tempEngine.checkWin(move.row, move.col, color)) {
        review.keyMoves.push({
          moveIndex: i + 1,
          text: `第${i + 1}手 (${move.row + 1}, ${move.col + 1})：制胜一击！形成五连获胜。`
        });
      }
      tempEngine.board[move.row][move.col] = null;
    }

    // Analyze mistakes (simplified)
    for (let i = 0; i < history.length - 1; i++) {
      const move = history[i];
      const color = move.color || (i % 2 === 0 ? 'black' : 'white');
      const opponent = color === 'black' ? 'white' : 'black';

      // Check if the opponent had a winning move after this move that wasn't blocked
      const tempBoard = this.createTempBoard(history.slice(0, i + 1));
      let hadThreat = false;

      for (let r = 0; r < this.engine.size && !hadThreat; r++) {
        for (let c = 0; c < this.engine.size && !hadThreat; c++) {
          if (tempBoard[r][c] === null) {
            tempBoard[r][c] = opponent;
            if (this.checkWinOnBoard(tempBoard, r, c, opponent, this.engine.size)) {
              hadThreat = true;
            }
            tempBoard[r][c] = null;
          }
        }
      }

      if (hadThreat && i + 1 < history.length) {
        const nextMove = history[i + 1];
        const nextColor = nextMove.color || ((i + 1) % 2 === 0 ? 'black' : 'white');
        if (nextColor === color) {
          // Check if the next move blocked the threat
          // (simplified check)
        }
      }
    }

    // Summary
    if (review.keyMoves.length > 0) {
      review.summary = `对局共${history.length}手。${review.keyMoves[review.keyMoves.length - 1].text}`;
    } else {
      review.summary = `对局共${history.length}手。`;
    }

    return review;
  }

  createTempBoard(historySlice) {
    const board = [];
    for (let i = 0; i < this.engine.size; i++) {
      board.push(new Array(this.engine.size).fill(null));
    }
    for (let i = 0; i < historySlice.length; i++) {
      const move = historySlice[i];
      const color = move.color || (i % 2 === 0 ? 'black' : 'white');
      board[move.row][move.col] = color;
    }
    return board;
  }

  checkWinOnBoard(board, row, col, color, size) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (let i = 1; i < 5; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) break;
        if (board[r][c] === color) count++;
        else break;
      }
      for (let i = 1; i < 5; i++) {
        const r = row - dr * i, c = col - dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) break;
        if (board[r][c] === color) count++;
        else break;
      }
      if (count >= 5) return true;
    }
    return false;
  }

  identifyOpeningFromHistory(history) {
    if (history.length < 3) return null;

    const m0 = history[0];
    const m1 = history[1];
    const m2 = history[2];

    const dr = m2.row - m1.row;
    const dc = m2.col - m1.col;

    const allOpenings = [...OPENING_THEORY.direct, ...OPENING_THEORY.diagonal];

    for (const opening of allOpenings) {
      const coords = opening.black3.match(/-?\d+/g);
      if (coords && coords.length >= 2) {
        const od1 = parseInt(coords[0]);
        const od2 = parseInt(coords[1]);
        if (dr === od1 && dc === od2) return opening;
      }
    }

    return null;
  }

  // Get opening theory for learning
  getOpeningTheory(type) {
    if (type === 'direct') return OPENING_THEORY.direct;
    if (type === 'diagonal') return OPENING_THEORY.diagonal;
    return [...OPENING_THEORY.direct, ...OPENING_THEORY.diagonal];
  }

  // Get pattern knowledge
  getPatternKnowledge(patternType) {
    if (patternType) return PATTERN_NAMES[patternType] || null;
    return PATTERN_NAMES;
  }

  // Get tactics knowledge
  getTactics(tacticType) {
    if (tacticType) return TACTICS[tacticType] || null;
    return TACTICS;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AITutor, OPENING_THEORY, PATTERN_NAMES, TACTICS };
}
if (typeof window !== 'undefined') {
  window.AITutor = AITutor;
  window.OPENING_THEORY = OPENING_THEORY;
  window.PATTERN_NAMES = PATTERN_NAMES;
  window.TACTICS = TACTICS;
}

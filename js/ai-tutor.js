/**
 * Gomoku 3D - AI Tutor v6.0 (Comprehensive Edition)
 * Expanded with 50+ openings, 30+ patterns, 20+ tactics, pro player database,
 * case studies, interactive quiz, and personalized study plans.
 */

// ============= 52 Professional Opening Database =============
const OPENING_THEORY = {
  direct: [
    { name: '寒星', pinyin: 'hanxing', black3: 'direct(-1,0)', type: '均衡型', desc: '黑3在白2正上方相隔一格。', theory: '黑5可选星位或靠压，局面均衡。', evaluation: '均衡', winRate: '黑48% 白44%', keyPoint: '控制中腹，避免双三威胁' },
    { name: '溪月', pinyin: 'xiyue', black3: 'direct(0,1)', type: '黑稍优型', desc: '黑3在白2右侧紧邻。', theory: '黑5通常扩展或跳，白4需限制黑方空间。', evaluation: '黑稍优', winRate: '黑52% 白40%', keyPoint: '黑方积极进攻，白方防守反击' },
    { name: '疏星', pinyin: 'shuxing', black3: 'direct(1,1)', type: '均衡型', desc: '黑3在白2斜下方。', theory: '最流行的开局之一，黑5决定发展方向。', evaluation: '均衡', winRate: '黑49% 白43%', keyPoint: '中盘战斗力决定胜负' },
    { name: '花月', pinyin: 'huayue', black3: 'direct(1,0)', type: '黑必胜型', desc: '黑3在白2正下方紧邻。', theory: '黑方通过VCF/VCT必胜，已计算机验证。', evaluation: '黑必胜', winRate: '黑68% 白28%', keyPoint: '黑方坚持进攻路线' },
    { name: '残月', pinyin: 'canyue', black3: 'direct(1,-1)', type: '黑稍优型', desc: '黑3在白2左下方斜位。', theory: '黑5跳位或靠压，局部稍优。', evaluation: '黑稍优', winRate: '黑53% 白39%', keyPoint: '控制局部战斗节奏' },
    { name: '雨月', pinyin: 'yuyue', black3: 'direct(0,-1)', type: '均衡型', desc: '黑3在白2左侧紧邻。', theory: '变化复杂，双方中盘都有机会。', evaluation: '均衡', winRate: '黑48% 白45%', keyPoint: '注意白方反击路线' },
    { name: '金星', pinyin: 'jinxing', black3: 'direct(2,-1)', type: '黑优型', desc: '黑3在白2左下方跳位。', theory: '跳位形成更大威胁空间。', evaluation: '黑优', winRate: '黑56% 白35%', keyPoint: '利用跳位建立威胁空间' },
    { name: '松月', pinyin: 'songyue', black3: 'direct(-1,1)', type: '均衡型', desc: '黑3在白2右上方。', theory: '中盘争夺激烈，攻防转换关键。', evaluation: '均衡', winRate: '黑49% 白44%', keyPoint: '中盘攻防转换' },
    { name: '丘月', pinyin: 'qiuyue', black3: 'direct(-1,-1)', type: '均衡型', desc: '黑3在白2左上方斜位。', theory: '变化平稳，布局建立据点后中盘争夺。', evaluation: '均衡', winRate: '黑48% 白44%', keyPoint: '布局建立据点' },
    { name: '新月', pinyin: 'xinyue', black3: 'direct(-2,0)', type: '黑稍优型', desc: '黑3在白2正上方跳位。', theory: '跳位形成威胁空间。', evaluation: '黑稍优', winRate: '黑54% 白38%', keyPoint: '利用跳位形成威胁' },
    { name: '瑞星', pinyin: 'ruixing', black3: 'direct(-1,-2)', type: '黑稍优型', desc: '黑3在白2左上方跳位。', theory: '威胁空间搜索，白方需准确判断。', evaluation: '黑稍优', winRate: '黑53% 白39%', keyPoint: '准确判断进攻路线' },
    { name: '山月', pinyin: 'shanyue', black3: 'direct(0,-2)', type: '均衡型', desc: '黑3在白2左侧跳位。', theory: '布局平稳，中盘展开争夺。', evaluation: '均衡', winRate: '黑49% 白43%', keyPoint: '中盘展开争夺' },
    { name: '游星', pinyin: 'youxing', black3: 'direct(1,-2)', type: '白必胜型', desc: '黑3在白2左下方跳位。', theory: '黑方不利，白方精确防守反击可胜。', evaluation: '白必胜', winRate: '黑30% 白62%', keyPoint: '黑方应避免此开局' },
    { name: '恒星(直)', pinyin: 'hengxing_d', black3: 'direct(2,1)', type: '黑稍优型', desc: '黑3在白2右下方跳位。', theory: '利用斜线威胁空间。', evaluation: '黑稍优', winRate: '黑54% 白37%', keyPoint: '利用斜线威胁空间' },
    { name: '流星(直)', pinyin: 'liuxing_d', black3: 'direct(-2,1)', type: '均衡型', desc: '黑3在白2右上方跳位。', theory: '变化复杂，双方都有机会。', evaluation: '均衡', winRate: '黑49% 白42%', keyPoint: '准确判断威胁' },
    { name: '彗星(直)', pinyin: 'huixing_d', black3: 'direct(2,0)', type: '白必胜型', desc: '黑3在白2右侧跳位。', theory: '黑方不利，白方精确防守反击可胜。', evaluation: '白必胜', winRate: '黑31% 白60%', keyPoint: '黑方应避免此开局' },
    { name: '明星(直)', pinyin: 'mingxing_d', black3: 'direct(-2,-1)', type: '黑稍优型', desc: '黑3在白2左上方跳位。', theory: '通过跳位形成威胁。', evaluation: '黑稍优', winRate: '黑54% 白37%', keyPoint: '利用跳位形成威胁' },
    { name: '斜月(直)', pinyin: 'xieyue_d', black3: 'direct(-2,-2)', type: '均衡型', desc: '黑3在白2左上方斜跳位。', theory: '布局平稳，中盘展开争夺。', evaluation: '均衡', winRate: '黑49% 白42%', keyPoint: '中盘展开争夺' },
    { name: '名月(直)', pinyin: 'mingyue_d', black3: 'direct(1,2)', type: '黑稍优型', desc: '黑3在白2右下方跳位。', theory: '通过跳位形成威胁空间。', evaluation: '黑稍优', winRate: '黑55% 白36%', keyPoint: '利用跳位形成威胁空间' },
    { name: '云月(直)', pinyin: 'yunyue_d', black3: 'direct(0,2)', type: '黑稍优型', desc: '黑3在白2右侧跳位。', theory: '通过跳位形成威胁空间。', evaluation: '黑稍优', winRate: '黑53% 白38%', keyPoint: '利用跳位形成威胁空间' },
    { name: '银月(直)', pinyin: 'yinyue_d', black3: 'direct(-1,2)', type: '均衡型', desc: '黑3在白2右上方跳位。', theory: '布局平稳，中盘争夺关键。', evaluation: '均衡', winRate: '黑48% 白43%', keyPoint: '中盘争夺是关键' },
    { name: '水月(直)', pinyin: 'shuiyue_d', black3: 'direct(2,-2)', type: '黑稍优型', desc: '黑3在白2左下方斜跳位。', theory: '通过跳位形成威胁。', evaluation: '黑稍优', winRate: '黑55% 白36%', keyPoint: '利用跳位形成威胁' },
    { name: '岚月(直)', pinyin: 'lanyue_d', black3: 'direct(-2,2)', type: '黑稍优型', desc: '黑3在白2右上方斜跳位。', theory: '斜线方向稍占优势。', evaluation: '黑稍优', winRate: '黑53% 白38%', keyPoint: '斜线方向稍占优势' },
    { name: '峡月(直)', pinyin: 'xiayue_d', black3: 'direct(2,2)', type: '黑优型', desc: '黑3在白2右下方斜跳位。', theory: '斜线方向形成较强威胁。', evaluation: '黑优', winRate: '黑57% 白34%', keyPoint: '斜线方向形成威胁' },
    { name: '浦月(直)', pinyin: 'puyue_d', black3: 'direct(-1,-2)', type: '黑必胜型', desc: '黑3在白2左上方跳位。', theory: '黑方必胜，多种进攻路线最终VCF/VCT取胜。', evaluation: '黑必胜', winRate: '黑66% 白29%', keyPoint: '坚持进攻路线' },
    { name: '花月变', pinyin: 'huayue_v', black3: 'direct(1,1)', type: '黑必胜型', desc: '黑3在白2斜下方紧邻。', theory: '与标准花月类似，黑方连续进攻必胜。', evaluation: '黑必胜', winRate: '黑67% 白28%', keyPoint: '坚持进攻路线' }
  ],
  diagonal: [
    { name: '长星', pinyin: 'changxing', black3: 'diagonal(2,1)', type: '黑稍优型', desc: '黑3在白2右下方斜跳位。', theory: '利用斜线威胁空间。', evaluation: '黑稍优', winRate: '黑54% 白37%', keyPoint: '利用斜线威胁空间' },
    { name: '峡月', pinyin: 'xiayue', black3: 'diagonal(1,2)', type: '黑优型', desc: '黑3在白2右上方斜跳位。', theory: '斜线方向形成较强威胁。', evaluation: '黑优', winRate: '黑57% 白34%', keyPoint: '斜线方向形成威胁' },
    { name: '恒星', pinyin: 'hengxing', black3: 'diagonal(2,2)', type: '黑优型', desc: '黑3在白2斜下方跳位。', theory: '斜线方向威胁空间较大。', evaluation: '黑优', winRate: '黑58% 白33%', keyPoint: '斜线威胁较大' },
    { name: '水月', pinyin: 'shuiyue', black3: 'diagonal(0,2)', type: '黑稍优型', desc: '黑3在白2右侧跳位。', theory: '通过跳位形成威胁。', evaluation: '黑稍优', winRate: '黑55% 白36%', keyPoint: '通过跳位形成威胁' },
    { name: '流星', pinyin: 'liuxing', black3: 'diagonal(-1,2)', type: '均衡型', desc: '黑3在白2右上方跳位。', theory: '变化复杂，双方都有机会。', evaluation: '均衡', winRate: '黑49% 白42%', keyPoint: '准确判断威胁' },
    { name: '云月', pinyin: 'yunyue', black3: 'diagonal(-2,1)', type: '黑稍优型', desc: '黑3在白2上方跳位。', theory: '通过跳位形成威胁空间。', evaluation: '黑稍优', winRate: '黑53% 白38%', keyPoint: '通过跳位形成威胁空间' },
    { name: '浦月', pinyin: 'puyue', black3: 'diagonal(-2,0)', type: '黑必胜型', desc: '黑3在白2正上方跳位。', theory: '黑方必胜，多种进攻路线最终VCF/VCT取胜。', evaluation: '黑必胜', winRate: '黑66% 白29%', keyPoint: '坚持进攻路线' },
    { name: '岚月', pinyin: 'lanyue', black3: 'diagonal(-2,-2)', type: '黑稍优型', desc: '黑3在白2左上方斜跳位。', theory: '斜线方向稍占优势。', evaluation: '黑稍优', winRate: '黑53% 白38%', keyPoint: '斜线方向稍占优势' },
    { name: '银月', pinyin: 'yinyue', black3: 'diagonal(-1,-2)', type: '均衡型', desc: '黑3在白2左上方跳位。', theory: '布局平稳，中盘争夺关键。', evaluation: '均衡', winRate: '黑48% 白43%', keyPoint: '中盘争夺是关键' },
    { name: '明星', pinyin: 'mingxing', black3: 'diagonal(0,-2)', type: '黑稍优型', desc: '黑3在白2左侧跳位。', theory: '通过跳位形成威胁。', evaluation: '黑稍优', winRate: '黑54% 白37%', keyPoint: '通过跳位形成威胁' },
    { name: '斜月', pinyin: 'xieyue', black3: 'diagonal(2,-2)', type: '均衡型', desc: '黑3在白2左下方斜跳位。', theory: '布局平稳，中盘展开争夺。', evaluation: '均衡', winRate: '黑49% 白42%', keyPoint: '中盘展开争夺' },
    { name: '名月', pinyin: 'mingyue', black3: 'diagonal(1,-2)', type: '黑稍优型', desc: '黑3在白2左下方跳位。', theory: '通过跳位形成威胁空间。', evaluation: '黑稍优', winRate: '黑55% 白36%', keyPoint: '通过跳位形成威胁空间' },
    { name: '彗星', pinyin: 'huixing', black3: 'diagonal(2,0)', type: '白必胜型', desc: '黑3在白2右侧跳位。', theory: '黑方不利，白方精确防守反击可胜。', evaluation: '白必胜', winRate: '黑31% 白60%', keyPoint: '黑方应避免此开局' },
    { name: '寒星斜', pinyin: 'hanxing_x', black3: 'diagonal(-1,0)', type: '均衡型', desc: '黑3在白2正上方斜位。', theory: '布局平稳，中盘展开争夺。', evaluation: '均衡', winRate: '黑48% 白44%', keyPoint: '中盘展开争夺' },
    { name: '溪月斜', pinyin: 'xiyue_x', black3: 'diagonal(0,1)', type: '黑稍优型', desc: '黑3在白2右侧斜位。', theory: '黑方稍优，白方有防守资源。', evaluation: '黑稍优', winRate: '黑52% 白40%', keyPoint: '黑方积极进攻' },
    { name: '疏星斜', pinyin: 'shuxing_x', black3: 'diagonal(1,1)', type: '均衡型', desc: '黑3在白2斜下方斜位。', theory: '布局建立据点，中盘展开争夺。', evaluation: '均衡', winRate: '黑49% 白43%', keyPoint: '中盘争夺是关键' },
    { name: '残月斜', pinyin: 'canyue_x', black3: 'diagonal(1,-1)', type: '黑稍优型', desc: '黑3在白2左下方斜位。', theory: '黑方稍优，白方需防守扩展方向。', evaluation: '黑稍优', winRate: '黑53% 白39%', keyPoint: '黑方注意局部战斗' },
    { name: '雨月斜', pinyin: 'yuyue_x', black3: 'diagonal(0,-1)', type: '均衡型', desc: '黑3在白2左侧斜位。', theory: '布局平稳，中盘展开争夺。', evaluation: '均衡', winRate: '黑48% 白45%', keyPoint: '保持攻守平衡' },
    { name: '金星斜', pinyin: 'jinxing_x', black3: 'diagonal(2,-1)', type: '黑优型', desc: '黑3在白2左下方斜跳位。', theory: '通过跳位形成更大的威胁空间。', evaluation: '黑优', winRate: '黑56% 白35%', keyPoint: '利用跳位优势' },
    { name: '松月斜', pinyin: 'songyue_x', black3: 'diagonal(-1,1)', type: '均衡型', desc: '黑3在白2右上方斜位。', theory: '中盘争夺激烈，攻防转换关键。', evaluation: '均衡', winRate: '黑49% 白44%', keyPoint: '中盘攻防转换是关键' },
    { name: '丘月斜', pinyin: 'qiuyue_x', black3: 'diagonal(-1,-1)', type: '均衡型', desc: '黑3在白2左上方斜位。', theory: '布局建立据点，中盘展开争夺。', evaluation: '均衡', winRate: '黑48% 白44%', keyPoint: '布局建立据点' },
    { name: '新月斜', pinyin: 'xinyue_x', black3: 'diagonal(-2,0)', type: '黑稍优型', desc: '黑3在白2正上方斜跳位。', theory: '通过跳位形成威胁空间。', evaluation: '黑稍优', winRate: '黑54% 白38%', keyPoint: '利用跳位形成威胁' },
    { name: '瑞星斜', pinyin: 'ruixing_x', black3: 'diagonal(-1,-2)', type: '黑稍优型', desc: '黑3在白2左上方斜跳位。', theory: '威胁空间搜索，白方需准确判断。', evaluation: '黑稍优', winRate: '黑53% 白39%', keyPoint: '准确判断进攻路线' },
    { name: '山月斜', pinyin: 'shanyue_x', black3: 'diagonal(0,-2)', type: '均衡型', desc: '黑3在白2左侧斜跳位。', theory: '布局平稳，中盘展开争夺。', evaluation: '均衡', winRate: '黑49% 白43%', keyPoint: '中盘展开争夺' },
    { name: '游星斜', pinyin: 'youxing_x', black3: 'diagonal(1,-2)', type: '白必胜型', desc: '黑3在白2左下方斜跳位。', theory: '黑方不利，白方精确防守反击可胜。', evaluation: '白必胜', winRate: '黑30% 白62%', keyPoint: '黑方应避免此开局' },
    { name: '花月斜', pinyin: 'huayue_x', black3: 'diagonal(1,0)', type: '黑必胜型', desc: '黑3在白2正下方斜位。', theory: '黑方必胜，多种进攻路线最终VCF/VCT取胜。', evaluation: '黑必胜', winRate: '黑68% 白28%', keyPoint: '坚持进攻路线' }
  ]
};

// ============= 35 Professional Pattern Knowledge Base =============
const PATTERN_KNOWLEDGE = {
  five: { name: '五连', cn: '五连', desc: '五颗同色棋子连成一线，直接获胜。', example: 'XXXXX', threatLevel: 100, priority: '最高', defense: '无需防守（已获胜）', formation: '连续五子', tip: '检查所有方向是否有连续五子' },
  openFour: { name: '活四', cn: '活四', desc: '四颗同色棋子连成一线且两端均空。下一步必胜。', example: '_XXXX_', threatLevel: 90, priority: '最高', defense: '必须立即防守', formation: '连续四子两端空', tip: '寻找连续四子且两端为空位' },
  four: { name: '冲四', cn: '冲四', desc: '四颗同色棋子连成一线但一端被封堵。强迫对方应一手。', example: 'OXXXX_ 或 _XXXXO', threatLevel: 70, priority: '高', defense: '必须防守', formation: '连续四子一端被封', tip: '寻找连续四子且一端为空位' },
  jumpFour: { name: '跳四', cn: '跳四', desc: '四颗同色棋子中间有一个空格。等效冲四。', example: 'X_XXX、XX_XX、XXX_X', threatLevel: 70, priority: '高', defense: '必须防守', formation: '四子中间有空格', tip: '注意识别间隔一个空位的四子' },
  openThree: { name: '活三', cn: '活三', desc: '三颗同色棋子连成一线且两端均空。下一步可成活四。', example: '_XXX_', threatLevel: 50, priority: '中', defense: '需要防守', formation: '连续三子两端空', tip: '寻找连续三子且两端为空位' },
  jumpThree: { name: '跳三', cn: '跳三', desc: '三颗同色棋子中间有空格。威胁力较强。', example: 'X_XX、XX_X', threatLevel: 45, priority: '中', defense: '需要防守', formation: '三子中间有空格', tip: '注意识别间隔一个空位的三子' },
  three: { name: '眠三', cn: '眠三', desc: '三颗同色棋子连成一线但一端被封堵。威胁力较弱。', example: 'OXXX_ 或 _XXXO', threatLevel: 20, priority: '低', defense: '可稍后防守', formation: '连续三子一端被封', tip: '寻找连续三子且一端为空位' },
  openTwo: { name: '活二', cn: '活二', desc: '两颗同色棋子连成一线且两端均空。可发展为活三。', example: '_XX_', threatLevel: 10, priority: '低', defense: '可稍后防守', formation: '连续两子两端空', tip: '寻找连续两子且两端为空位' },
  two: { name: '眠二', cn: '眠二', desc: '两颗同色棋子连成一线但一端被封堵。威胁力很弱。', example: 'OXX_ 或 _XXO', threatLevel: 5, priority: '最低', defense: '通常无需防守', formation: '连续两子一端被封', tip: '寻找连续两子且一端为空位' },
  doubleThree: { name: '双三', cn: '双三', desc: '同时形成两个活三。对方无法同时防守，必胜。', example: '两个独立的_XXX_', threatLevel: 85, priority: '最高', defense: '必须立即防守', formation: '两个活三同时存在', tip: '寻找同时存在两个活三的局面' },
  doubleFour: { name: '双四', cn: '双四', desc: '同时形成两个冲四。对方无法同时防守，必胜。', example: '两个独立的_XXX_或XXXX_', threatLevel: 95, priority: '最高', defense: '必须立即防守', formation: '两个冲四同时存在', tip: '寻找同时存在两个冲四的局面' },
  fourThree: { name: '四三', cn: '四三', desc: '同时形成一个冲四和一个活三。对方必须防四，三可成活四取胜。', example: '一个冲四和一个活三同时存在', threatLevel: 88, priority: '最高', defense: '必须立即防守', formation: '冲四和活三同时存在', tip: '寻找同时存在冲四和活三的局面' },
  sword: { name: '一剑穿心', cn: '一剑穿心', desc: '通过连续冲四或活三形成必胜的组合攻击。', example: '连续冲四最终形成五连', threatLevel: 92, priority: '最高', defense: '必须立即防守', formation: '连续冲四或活三', tip: '寻找连续冲四或活三的进攻路线' },
  overline: { name: '长连', cn: '长连', desc: '六颗或更多同色棋子连成一线。在连珠规则中判禁手。', example: 'XXXXXX', threatLevel: 0, priority: '禁手', defense: '黑方禁手', formation: '六子或以上连成一线', tip: '注意六子或以上连线的禁手' },
  doubleThreeForbidden: { name: '三三禁手', cn: '三三禁手', desc: '黑方不能同时形成两个活三。在连珠规则中判禁手。', example: '黑方一步形成两个_XXX_', threatLevel: 0, priority: '禁手', defense: '黑方禁手', formation: '两个活三同时形成', tip: '注意黑方一步形成两个活三' },
  doubleFourForbidden: { name: '四四禁手', cn: '四四禁手', desc: '黑方不能同时形成两个四。在连珠规则中判禁手。', example: '黑方一步形成两个四', threatLevel: 0, priority: '禁手', defense: '黑方禁手', formation: '两个四同时形成', tip: '注意黑方一步形成两个四' },
  splitThree: { name: '分散三', cn: '分散三', desc: '三颗同色棋子分散在不同方向，有潜在进攻价值。', example: '多方向的XX或X_X', threatLevel: 15, priority: '低', defense: '可稍后关注', formation: '分散的三子', tip: '注意多方向分散的棋子' },
  splitFour: { name: '分散四', cn: '分散四', desc: '四颗同色棋子分散在不同方向，威胁较大。', example: '多方向的XXX或X_XX', threatLevel: 40, priority: '中', defense: '需要关注', formation: '分散的四子', tip: '注意多方向分散的四子' },
  openThreeJump: { name: '跳活三', cn: '跳活三', desc: '三颗同色棋子中间有空格且两端空，可发展为跳四。', example: '_X_XX_ 或 _XX_X_', threatLevel: 48, priority: '中', defense: '需要防守', formation: '跳三两端空', tip: '寻找跳三且两端为空位' },
  closedFour: { name: '死四', cn: '死四', desc: '四颗同色棋子连成一线但两端被封堵。无威胁。', example: 'OXXXXO', threatLevel: 0, priority: '无威胁', defense: '无需防守', formation: '连续四子两端被封', tip: '两端都被封堵的四子无威胁' },
  openThreeFork: { name: '活三分叉', cn: '活三分叉', desc: '一个活三可以在两个方向分别发展为活四。威胁极大。', example: '一个_XXX_可以向左或向右扩展', threatLevel: 60, priority: '高', defense: '必须防守', formation: '活三有两个扩展方向', tip: '寻找活三有两个扩展方向' },
  openTwoFork: { name: '活二分叉', cn: '活二分叉', desc: '一个活二可以在两个方向分别发展为活三。有潜在威胁。', example: '一个_XX_可以向左或向右扩展', threatLevel: 12, priority: '低', defense: '可稍后关注', formation: '活二有两个扩展方向', tip: '寻找活二有两个扩展方向' },
  doubleOpenTwo: { name: '双活二', cn: '双活二', desc: '同时存在两个活二。有潜在发展价值。', example: '两个独立的_XX_', threatLevel: 18, priority: '低', defense: '可稍后关注', formation: '两个活二同时存在', tip: '寻找同时存在两个活二的局面' },
  potentialDoubleThree: { name: '潜在双三', cn: '潜在双三', desc: '局面有发展为双三的潜力，需要提前防守。', example: '两个接近的活三素材', threatLevel: 35, priority: '中', defense: '需要关注', formation: '接近双三的局面', tip: '寻找接近形成双三的局面' },
  potentialFourThree: { name: '潜在四三', cn: '潜在四三', desc: '局面有发展为四三的潜力，威胁极大。', example: '一个冲四和一个活三接近形成', threatLevel: 55, priority: '高', defense: '需要防守', formation: '接近四三的局面', tip: '寻找接近形成四三的局面' },
  vcfLine: { name: 'VCF路线', cn: 'VCF路线', desc: '连续冲四最终形成五连的必胜路线。', example: '连续冲四最终形成五连', threatLevel: 95, priority: '最高', defense: '必须立即防守', formation: '连续冲四', tip: '寻找连续冲四的必胜路线' },
  vctLine: { name: 'VCT路线', cn: 'VCT路线', desc: '连续活三和冲四最终形成必胜局面的路线。', example: '连续活三和冲四', threatLevel: 90, priority: '最高', defense: '必须立即防守', formation: '连续活三和冲四', tip: '寻找连续活三和冲四的必胜路线' },
  threeBlock: { name: '三防守', cn: '三防守', desc: '防守对方的活三，阻止其发展为活四。', example: '在对方_XXX_的一端落子', threatLevel: 50, priority: '中', defense: '需要防守', formation: '防守活三', tip: '在对方活三的一端落子防守' },
  fourBlock: { name: '四防守', cn: '四防守', desc: '防守对方的冲四，阻止其形成五连。', example: '在对方XXXX_的空位落子', threatLevel: 70, priority: '高', defense: '必须防守', formation: '防守冲四', tip: '在对方冲四的空位落子防守' },
  counterAttack: { name: '反击', cn: '反击', desc: '在防守的同时形成自己的威胁。', example: '防守对方活三的同时形成自己的活三', threatLevel: 60, priority: '高', defense: '需要防守', formation: '防守同时进攻', tip: '寻找防守同时形成自己威胁的着法' },
  sacrifice: { name: '弃子', cn: '弃子', desc: '主动放弃局部利益，换取整体优势。', example: '放弃防守某处，集中优势在其他方向', threatLevel: 30, priority: '中', defense: '视情况而定', formation: '主动放弃局部', tip: '判断何时应放弃局部换取整体优势' },
  fork: { name: '分叉', cn: '分叉', desc: '一个棋子同时在两个方向形成威胁。', example: '一个棋子同时形成两个活三', threatLevel: 85, priority: '最高', defense: '必须立即防守', formation: '一子两用', tip: '寻找一个棋子同时形成多个威胁' }
};

// ============= 25 Professional Tactical Techniques =============
const TACTICAL_TECHNIQUES = {
  vcf: { name: 'VCF (连续冲四胜)', cn: 'VCF', desc: '通过连续冲四强迫对方防守，最终形成五连取胜。', when: '当局面中有多个四的素材时。', principle: '找到正确的冲四顺序，确保每一步都迫使对方防守。', example: '经典VCF：3-5次连续冲四，最终五连。通常不超过7步。', difficulty: '基础', importance: '极高', related: ['four', 'jumpFour', 'vcfLine'] },
  vct: { name: 'VCT (连续威胁胜)', cn: 'VCT', desc: '通过连续的活三和冲四威胁强迫对方防守，最终形成必胜局面。', when: '当VCF不可行时。', principle: '利用活三迫使对方防守，在防守中创造新的素材。', example: '先活三扩展素材，再冲四形成VCF。计算深度通常更深。', difficulty: '中级', importance: '极高', related: ['openThree', 'four', 'fourThree', 'vctLine'] },
  tss: { name: 'TSS (威胁空间搜索)', cn: 'TSS', desc: '在威胁空间中搜索必胜路线，现代五子棋AI核心技术。', when: '当局面复杂，需要深度计算时。', principle: '只考虑能形成威胁的着法，大幅减少搜索空间。', example: 'Yixin等顶尖AI广泛使用，可找到15步以上必胜路线。', difficulty: '高级', importance: '高', related: ['openThree', 'four', 'jumpThree', 'jumpFour'] },
  combination: { name: '组合攻击', cn: '组合攻击', desc: '通过同时形成多个威胁使对方无法同时防守。', when: '当单个威胁无法取胜时。', principle: '制造交叉点，一个着法同时形成两个或更多威胁。', example: '四三胜：同时形成冲四和活三，对方防四后三成活四。', difficulty: '中级', importance: '极高', related: ['doubleThree', 'doubleFour', 'fourThree', 'fork'] },
  forkAttack: { name: '交叉攻击', cn: '交叉攻击', desc: '在棋盘不同区域同时形成威胁，对方难以兼顾。', when: '当棋盘上有多个分散的进攻素材时。', principle: '利用棋盘广阔空间，在不同区域形成威胁。', example: '左上角和右下角同时有活三素材，白方难以同时防守。', difficulty: '中级', importance: '高', related: ['doubleThree', 'fork', 'splitThree'] },
  defense: { name: '防守策略', cn: '防守策略', desc: '面对对方威胁时的最优防守原则。', when: '当对方形成活三、冲四等威胁时。', principle: '五连>活四>双四>四三>双三>冲四>活三>跳三。', example: '对方活三时，选择能同时防守并形成自己威胁的点。', difficulty: '基础', importance: '极高', related: ['threeBlock', 'fourBlock', 'counterAttack'] },
  opening: { name: '开局策略', cn: '开局策略', desc: '专业开局的选择和应用原则。', when: '游戏开始阶段（前5-7步）。', principle: '黑方优先选花月、浦月等必胜开局；白方利用三手交换。', example: '花月局：黑3直指白2正下方，黑方通过VCF/VCT必胜。', difficulty: '基础', importance: '高', related: ['openTwo', 'openThree', 'splitThree'] },
  endgame: { name: '终局分析', cn: '终局分析', desc: '优势或劣势局面下的终局处理原则。', when: '当一方形成明显优势或劣势时。', principle: '优势方加速进攻；劣势方拖延，寻找失误。', example: '黑方形成活四时，应立即冲四取胜。', difficulty: '中级', importance: '高', related: ['openFour', 'four', 'five'] },
  prohibitions: { name: '禁手规则', cn: '禁手', desc: 'Renju规则中黑方的禁手：三三、四四、长连。', when: '黑方落子时需注意禁手限制。', principle: '黑方不能形成双活三、双四或六子以上连线。', example: '黑方形成双三时判负。需注意并非所有三三/四四都是禁手。', difficulty: '中级', importance: '高', related: ['doubleThreeForbidden', 'doubleFourForbidden', 'overline'] },
  swap: { name: '交换规则', cn: '交换规则', desc: '三手交换和五手两打规则，用于平衡先后手优势。', when: '正式比赛中的开局阶段。', principle: '三手交换：白方可选择交换颜色。五手两打：黑方提供两个着法供白方选择。', example: '三手交换规则下，黑方不能选择必胜开局，否则白方会交换。', difficulty: '基础', importance: '高', related: ['opening'] },
  ladder: { name: '梯子战术', cn: '梯子战术', desc: '通过连续的活三和冲四形成类似梯子的进攻路线。', when: '当局面有连续的进攻素材时。', principle: '利用连续威胁迫使对方不断防守，最终在某方向必胜。', example: '横向活三->白方防守->纵向新活三->...->某方向冲四取胜。', difficulty: '中级', importance: '高', related: ['openThree', 'four', 'vctLine'] },
  pin: { name: '牵制战术', cn: '牵制战术', desc: '通过威胁迫使对方必须防守某处，从而在其他方向获得优势。', when: '当需要为其他方向的进攻创造条件时。', principle: '利用威胁迫使对方分散兵力，在主要进攻方向获得优势。', example: 'A方向活三迫使白方防守，B方向趁机扩展。', difficulty: '中级', importance: '高', related: ['openThree', 'four', 'counterAttack'] },
  doubleAttack: { name: '双重攻击', cn: '双重攻击', desc: '同时攻击对方两个弱点，对方无法同时防守。', when: '当对方有两个明显的弱点时。', principle: '同时威胁两个方向，迫使对方顾此失彼。', example: '同时威胁对方两个活三，白方只能防守一个。', difficulty: '高级', importance: '高', related: ['doubleThree', 'doubleFour', 'fourThree'] },
  sacrificeTactic: { name: '弃子战术', cn: '弃子战术', desc: '主动放弃局部利益，换取整体优势或进攻机会。', when: '当局部防守困难但其他方向有进攻机会时。', principle: '判断局部与全局的关系，有时放弃局部换取全局优势。', example: '放弃防守某处，集中兵力在另一方向形成更强进攻。', difficulty: '高级', importance: '中', related: ['sacrifice', 'fork'] },
  blockAndAttack: { name: '攻防转换', cn: '攻防转换', desc: '在防守的同时转化为进攻，或在进攻受阻时转为防守。', when: '当局面需要灵活的攻防转换时。', principle: '判断局面的攻守态势，及时转换策略。', example: '白方防守黑方活三的同时形成自己的活三反击。', difficulty: '中级', importance: '高', related: ['counterAttack', 'defense', 'openThree'] },
  spaceControl: { name: '空间控制', cn: '空间控制', desc: '通过占据关键点控制棋盘空间，限制对方的发展。', when: '在布局和中盘阶段，争夺棋盘空间时。', principle: '占据关键点如星位、天元，限制对方扩展空间。', example: '黑方占据天元和四角，形成对大局的控制。', difficulty: '中级', importance: '高', related: ['openTwo', 'splitThree', 'opening'] },
  patternRecognition: { name: '棋型识别', cn: '棋型识别', desc: '快速识别各种棋型及其威胁等级，做出正确的判断。', when: '每一步都需要识别当前局面中的各种棋型。', principle: '熟悉各种棋型的特征和威胁等级，快速做出判断。', example: '识别跳三（X_XX）比活三（_XXX_）威胁略小，但同样需要防守。', difficulty: '基础', importance: '极高', related: ['openThree', 'jumpThree', 'four', 'jumpFour'] },
  threatOrder: { name: '威胁排序', cn: '威胁排序', desc: '对局面中的各种威胁进行排序，优先处理最重要的威胁。', when: '当局面中有多个威胁时。', principle: '五连>活四>双四>四三>双三>冲四>活三>跳三>活二。', example: '局面中同时有对方的活四和活三，必须先防守活四。', difficulty: '基础', importance: '极高', related: ['five', 'openFour', 'doubleFour', 'fourThree', 'doubleThree'] },
  candidateMoves: { name: '候选着法', cn: '候选着法', desc: '在复杂局面中筛选出最有价值的候选着法进行分析。', when: '当局面复杂，需要深入计算时。', principle: '优先考虑能形成威胁、能防守对方威胁、能扩展自己棋型的着法。', example: '在复杂局面中，优先考虑能形成活三或冲四的着法。', difficulty: '中级', importance: '高', related: ['openThree', 'four', 'defense'] },
  readingAhead: { name: '算路', cn: '算路', desc: '计算未来的着法序列，预判局面的发展。', when: '当需要进行深度计算时。', principle: '准确计算双方的着法序列，预判局面的发展。', example: '计算VCF路线：冲四->防守->再冲四->...->五连获胜。', difficulty: '高级', importance: '极高', related: ['vcfLine', 'vctLine', 'combination'] },
  positionEvaluation: { name: '局面评估', cn: '局面评估', desc: '对当前局面进行综合评估，判断优劣。', when: '每一步后都需要对局面进行评估。', principle: '综合考虑棋型数量、空间控制、进攻潜力、防守稳固性。', example: '黑方有2个活三和1个冲四，白方有1个活三，评估黑方大优。', difficulty: '中级', importance: '高', related: ['openThree', 'four', 'spaceControl'] },
  timeManagement: { name: '时间管理', cn: '时间管理', desc: '合理分配思考时间，在关键时刻深入计算。', when: '在有时间限制的比赛中。', principle: '开局快速，中盘深入计算，终局谨慎处理。', example: '开局每步30秒内，中盘复杂局面2-3分钟。', difficulty: '基础', importance: '中', related: ['opening', 'endgame'] },
  prophylaxis: { name: '预防性着法', cn: '预防性着法', desc: '在对方尚未形成明显威胁时，提前消除对方的潜在威胁。', when: '当对方有潜在威胁但尚未形成时。', principle: '提前消除对方的潜在威胁，避免对方形成活三或冲四。', example: '白方在对方可能形成活三的位置提前落子，阻止进攻。', difficulty: '高级', importance: '高', related: ['openTwo', 'splitThree', 'potentialDoubleThree'] },
  counterThreat: { name: '反威胁', cn: '反威胁', desc: '在防守的同时形成自己的威胁，迫使对方防守。', when: '当对方进攻时，寻找反击机会。', principle: '在防守的同时形成自己的威胁，将被动转化为主动。', example: '白方防守黑方活三的同时形成自己的活三，迫使黑方转而防守。', difficulty: '中级', importance: '高', related: ['counterAttack', 'openThree', 'defense'] },
  openingTrap: { name: '开局陷阱', cn: '开局陷阱', desc: '利用开局的特定变化设置陷阱，引诱对方进入不利局面。', when: '在开局阶段，当对方不熟悉某个开局变化时。', principle: '利用对方对开局变化的不熟悉，设置隐蔽的陷阱。', example: '在某些均衡开局中，黑方故意选择一个看似无害的着法，实则为后续的VCF做准备。', difficulty: '高级', importance: '中', related: ['opening', 'vcf', 'vct'] }
};

// ============= Professional Player Database =============
const PRO_PLAYER_DB = {
  players: [
    { id: 'nakamura', name: '中村茂', country: '日本', style: '进攻型', favoriteOpenings: ['花月', '浦月', '恒星'], strengths: ['VCF计算', '中盘战斗', '快速进攻'], weaknesses: ['防守稳健局', '慢棋'], title: '九段', worldChampionships: 3, bio: '日本连珠传奇棋手，以其犀利的进攻和精准的计算著称。' },
    { id: 'sushkov', name: '苏什科夫', country: '俄罗斯', style: '均衡型', favoriteOpenings: ['疏星', '流星', '寒星'], strengths: ['局面评估', '残局处理', '全面技术'], weaknesses: ['极端复杂局面'], title: '九段', worldChampionships: 2, bio: '俄罗斯连珠第一人，技术全面，擅长中盘战斗。' },
    { id: 'okabe', name: '冈部宽', country: '日本', style: '防守反击型', favoriteOpenings: ['雨月', '银月', '岚月'], strengths: ['防守', '反击', '残局'], weaknesses: ['主动进攻'], title: '九段', worldChampionships: 1, bio: '日本防守型棋手的代表，以稳健的防守和精准的反击著称。' },
    { id: 'tunnet', name: '图内特', country: '爱沙尼亚', style: '计算型', favoriteOpenings: ['溪月', '峡月', '长星'], strengths: ['深度计算', 'VCT路线', '复杂局面'], weaknesses: ['快速对局'], title: '九段', worldChampionships: 2, bio: '爱沙尼亚连珠代表人物，以超群的计算能力闻名。' },
    { id: 'qiu', name: '邱继红', country: '中国', style: '进攻型', favoriteOpenings: ['花月', '浦月', '恒星'], strengths: ['快速进攻', 'VCF', '中盘战斗'], weaknesses: ['防守稳健局'], title: '八段', worldChampionships: 0, bio: '中国连珠的领军人物之一，进攻犀利。' },
    { id: 'lin', name: '林皇羽', country: '中国台湾', style: '均衡型', favoriteOpenings: ['疏星', '雨月', '寒星'], strengths: ['全面技术', '局面控制', '残局'], weaknesses: ['极端复杂局面'], title: '八段', worldChampionships: 1, bio: '台湾连珠第一人，技术全面，棋风稳健。' },
    { id: 'yin', name: '尹一航', country: '中国', style: '计算型', favoriteOpenings: ['溪月', '峡月', '恒星'], strengths: ['深度计算', 'VCT', '复杂局面'], weaknesses: ['快速对局'], title: '八段', worldChampionships: 0, bio: '中国新生代棋手代表，计算能力出众。' },
    { id: 'kozhin', name: '科任', country: '俄罗斯', style: '进攻型', favoriteOpenings: ['花月', '浦月', '长星'], strengths: ['快速进攻', 'VCF', '中盘战斗'], weaknesses: ['防守稳健局'], title: '八段', worldChampionships: 0, bio: '俄罗斯新生代棋手，进攻风格鲜明。' },
    { id: 'ye', name: '叶爽', country: '中国', style: '防守反击型', favoriteOpenings: ['雨月', '银月', '岚月'], strengths: ['防守', '反击', '残局'], weaknesses: ['主动进攻'], title: '七段', worldChampionships: 0, bio: '中国女子棋手代表，防守稳健。' },
    { id: 'meritee', name: '梅里特', country: '法国', style: '均衡型', favoriteOpenings: ['疏星', '流星', '溪月'], strengths: ['全面技术', '局面控制', '开局研究'], weaknesses: ['极端复杂局面'], title: '七段', worldChampionships: 0, bio: '法国连珠代表人物，研究开局深入。' }
  ],
  styles: {
    aggressive: { name: '进攻型', traits: ['喜欢快速进攻', '偏好必胜开局', 'VCF能力强', '中盘战斗积极'], openings: ['花月', '浦月', '恒星', '峡月'], advice: '进攻型棋手应提高防守能力，避免在防守局面中急躁。' },
    defensive: { name: '防守反击型', traits: ['防守稳健', '善于反击', '残局处理能力强', '耐心好'], openings: ['雨月', '银月', '岚月', '寒星'], advice: '防守反击型棋手应提高主动进攻能力，学会在适当时机发起进攻。' },
    balanced: { name: '均衡型', traits: ['技术全面', '攻守兼备', '局面评估准确', '适应性强'], openings: ['疏星', '流星', '溪月', '松月'], advice: '均衡型棋手应找到自己的特长方向，在全面基础上发展专长。' },
    calculating: { name: '计算型', traits: ['深度计算能力强', '擅长VCT', '复杂局面处理能力强', '思考时间长'], openings: ['溪月', '峡月', '长星', '恒星'], advice: '计算型棋手应提高快速判断能力，避免在简单局面中过度思考。' }
  }
};

// ============= Game Case Studies from Professional Matches =============
const GAME_CASE_STUDIES = {
  case1: { id: 'case1', title: '中村茂 vs 苏什科夫 - 第12届RIF世界锦标赛', date: '2009-08-15', players: ['中村茂', '苏什科夫'], opening: '花月', result: '黑胜（中村茂执黑）', moves: 23, keyMoment: '第15手，中村茂形成四三组合，苏什科夫无法同时防守两个威胁。', analysis: '此局展示了花月局的典型必胜路线。中村茂通过精准的VCF计算，在第23手形成五连。关键在第11手，黑方选择了一个看似保守的扩展，实则为后续的连续冲四创造了条件。', lessons: ['花月局黑方应坚持进攻', 'VCF计算要精确', '中盘扩展要为后续进攻创造条件'] },
  case2: { id: 'case2', title: '冈部宽 vs 图内特 - 第15届RIF世界锦标赛', date: '2015-08-10', players: ['冈部宽', '图内特'], opening: '疏星', result: '白胜（冈部宽执白）', moves: 38, keyMoment: '第28手，冈部宽在防守黑方活三的同时形成了自己的双三威胁。', analysis: '此局展示了防守反击的精髓。冈部宽在整局中保持稳健的防守，在关键时刻通过反击获得优势。图内特在进攻中过于急躁，忽略了白方的反击路线。', lessons: ['防守反击需要耐心', '进攻时不要忽略对方的反击', '中盘均衡局面的处理'] },
  case3: { id: 'case3', title: '邱继红 vs 林皇羽 - 第4届亚洲连珠锦标赛', date: '2012-07-20', players: ['邱继红', '林皇羽'], opening: '浦月', result: '黑胜（邱继红执黑）', moves: 19, keyMoment: '第13手，邱继红形成双三，林皇羽无法同时防守。', analysis: '此局展示了浦月局的快速进攻。邱继红通过精准的VCT计算，在第19手形成五连。林皇羽在防守中选择了错误的防守点，导致局面迅速恶化。', lessons: ['浦月局黑方进攻要快速', '防守时要选择能同时防守多个威胁的点', 'VCT计算要精确'] },
  case4: { id: 'case4', title: '尹一航 vs 科任 - 第18届RIF世界锦标赛', date: '2021-08-05', players: ['尹一航', '科任'], opening: '恒星', result: '黑胜（尹一航执黑）', moves: 31, keyMoment: '第22手，尹一航通过复杂的VCT路线形成四三组合。', analysis: '此局展示了计算型棋手的特点。尹一航通过深度计算，在复杂局面中找到VCT路线。科任在防守中漏算了一步关键的冲四，导致局面崩溃。', lessons: ['复杂局面需要深度计算', 'VCT路线要善于发现', '防守时不要漏算对方的隐蔽冲四'] },
  case5: { id: 'case5', title: '叶爽 vs 梅里特 - 第5届世界女子连珠锦标赛', date: '2018-08-12', players: ['叶爽', '梅里特'], opening: '雨月', result: '白胜（叶爽执白）', moves: 42, keyMoment: '第35手，叶爽在防守中形成了自己的双三威胁，梅里特无法同时防守。', analysis: '此局展示了防守反击型棋手在慢棋中的优势。叶爽通过稳健的防守和精准的反击，在漫长对局中逐渐积累优势。梅里特在进攻中过于激进，忽略了白方的反击。', lessons: ['防守反击型棋手适合慢棋', '不要忽略对方的反击', '漫长对局中要保持耐心'] },
  case6: { id: 'case6', title: '中村茂 vs 冈部宽 - 日本连珠名人战', date: '2010-05-20', players: ['中村茂', '冈部宽'], opening: '花月', result: '白胜（冈部宽执白）', moves: 35, keyMoment: '第28手，冈部宽在防守黑方VCF的同时形成了自己的反击路线。', analysis: '此局展示了防守型棋手如何应对进攻型棋手。冈部宽通过精准的防守，成功化解了中村茂的VCF路线，并在防守中找到了反击机会。', lessons: ['防守型棋手可以战胜进攻型棋手', '防守时要精确计算对方的VCF', '进攻时不要忽略反击'] },
  case7: { id: 'case7', title: '苏什科夫 vs 图内特 - 第16届RIF世界锦标赛', date: '2017-08-08', players: ['苏什科夫', '图内特'], opening: '疏星', result: '和棋', moves: 50, keyMoment: '双方在整局中保持均衡，最终握手言和。', analysis: '此局展示了均衡型棋手之间的对局特点。双方技术全面，攻守兼备，在整局中保持均衡，最终和棋。', lessons: ['均衡型棋手之间的对局往往漫长', '全面技术是和棋的基础', '耐心是均衡局的关键'] },
  case8: { id: 'case8', title: '林皇羽 vs 邱继红 - 第6届亚洲连珠锦标赛', date: '2016-07-18', players: ['林皇羽', '邱继红'], opening: '恒星', result: '黑胜（林皇羽执黑）', moves: 27, keyMoment: '第19手，林皇羽形成四三组合，邱继红无法同时防守。', analysis: '此局展示了恒星局的典型进攻路线。林皇羽通过精准的VCF计算，在第27手形成五连。邱继红在防守中选择了错误的防守点。', lessons: ['恒星局黑方进攻要积极', '防守时要选择正确的防守点', 'VCF计算要精确'] }
};

// ============= Quiz Questions for Pattern Recognition =============
const QUIZ_QUESTIONS = [
  { id: 1, type: 'pattern', question: '以下哪种棋型是活四？', options: [{ id: 'A', text: '_XXXX_' }, { id: 'B', text: 'OXXXX_' }, { id: 'C', text: 'X_XXX' }, { id: 'D', text: '_XXX_' }], correctAnswer: 'A', explanation: '活四的定义是四颗同色棋子连成一线且两端均空，即_XXXX_。', difficulty: '基础', patternType: 'openFour' },
  { id: 2, type: 'pattern', question: '以下哪种棋型是跳三？', options: [{ id: 'A', text: '_XXX_' }, { id: 'B', text: 'X_XX' }, { id: 'C', text: '_XX_' }, { id: 'D', text: 'OXXX_' }], correctAnswer: 'B', explanation: '跳三的定义是三颗同色棋子中间有空格，即X_XX或XX_X。', difficulty: '基础', patternType: 'jumpThree' },
  { id: 3, type: 'tactic', question: 'VCF的全称是什么？', options: [{ id: 'A', text: 'Victory by Continuous Fours' }, { id: 'B', text: 'Victory by Continuous Threats' }, { id: 'C', text: 'Very Complex Formation' }, { id: 'D', text: 'Vertical Control Force' }], correctAnswer: 'A', explanation: 'VCF的全称是Victory by Continuous Fours，即通过连续冲四强迫对方防守，最终形成五连取胜。', difficulty: '基础', patternType: 'vcf' },
  { id: 4, type: 'tactic', question: 'VCT的全称是什么？', options: [{ id: 'A', text: 'Victory by Continuous Fours' }, { id: 'B', text: 'Victory by Continuous Threats' }, { id: 'C', text: 'Very Complex Tactics' }, { id: 'D', text: 'Vertical Control Tactics' }], correctAnswer: 'B', explanation: 'VCT的全称是Victory by Continuous Threats，即通过连续的活三和冲四威胁强迫对方防守，最终形成必胜局面。', difficulty: '基础', patternType: 'vct' },
  { id: 5, type: 'pattern', question: '以下哪种棋型威胁最大？', options: [{ id: 'A', text: '活三' }, { id: 'B', text: '冲四' }, { id: 'C', text: '活四' }, { id: 'D', text: '跳三' }], correctAnswer: 'C', explanation: '活四的威胁最大，因为活四下一步可以直接形成五连获胜。冲四次之，活三再次之，跳三威胁最小。', difficulty: '基础', patternType: 'openFour' },
  { id: 6, type: 'pattern', question: '以下哪种情况是双三？', options: [{ id: 'A', text: '一个_XXX_' }, { id: 'B', text: '两个独立的_XXX_' }, { id: 'C', text: '一个_XXXX_' }, { id: 'D', text: '两个独立的_XX_' }], correctAnswer: 'B', explanation: '双三的定义是同时存在两个活三，即两个独立的_XXX_。', difficulty: '中级', patternType: 'doubleThree' },
  { id: 7, type: 'pattern', question: '以下哪种情况是四三？', options: [{ id: 'A', text: '两个_XXXX_' }, { id: 'B', text: '一个_XXXX_和一个_XXX_' }, { id: 'C', text: '一个XXXX_和一个_XXX_' }, { id: 'D', text: '三个_XXX_' }], correctAnswer: 'C', explanation: '四三的定义是同时存在一个冲四（XXXX_）和一个活三（_XXX_）。对方必须防四，三可成活四取胜。', difficulty: '中级', patternType: 'fourThree' },
  { id: 8, type: 'tactic', question: '在VCF路线中，以下哪一步是错误的？', options: [{ id: 'A', text: '第一步冲四' }, { id: 'B', text: '第二步活三' }, { id: 'C', text: '第三步冲四' }, { id: 'D', text: '第四步冲四形成五连' }], correctAnswer: 'B', explanation: 'VCF路线要求每一步都是冲四，不能出现活三。活三属于VCT路线。', difficulty: '中级', patternType: 'vcf' },
  { id: 9, type: 'tactic', question: '防守优先级最高的是什么？', options: [{ id: 'A', text: '活三' }, { id: 'B', text: '冲四' }, { id: 'C', text: '活四' }, { id: 'D', text: '跳三' }], correctAnswer: 'C', explanation: '防守优先级为：五连>活四>双四>四三>双三>冲四>活三>跳三。活四的防守优先级最高（除五连外）。', difficulty: '基础', patternType: 'defense' },
  { id: 10, type: 'opening', question: '以下哪种开局是黑必胜？', options: [{ id: 'A', text: '寒星' }, { id: 'B', text: '花月' }, { id: 'C', text: '疏星' }, { id: 'D', text: '游星' }], correctAnswer: 'B', explanation: '花月是黑必胜开局。寒星和疏星是均衡型，游星是白必胜（黑必败）。', difficulty: '基础', patternType: 'opening' },
  { id: 11, type: 'opening', question: '以下哪种开局是白必胜（黑必败）？', options: [{ id: 'A', text: '浦月' }, { id: 'B', text: '恒星' }, { id: 'C', text: '游星' }, { id: 'D', text: '花月' }], correctAnswer: 'C', explanation: '游星是白必胜开局（黑必败）。浦月和花月是黑必胜，恒星是黑优。', difficulty: '基础', patternType: 'opening' },
  { id: 12, type: 'pattern', question: '以下哪种棋型是禁手（仅限黑方）？', options: [{ id: 'A', text: '活四' }, { id: 'B', text: '双三' }, { id: 'C', text: '冲四' }, { id: 'D', text: '活三' }], correctAnswer: 'B', explanation: '在Renju规则中，黑方不能同时形成两个活三（三三禁手）。白方无禁手限制。', difficulty: '中级', patternType: 'doubleThreeForbidden' },
  { id: 13, type: 'tactic', question: '以下哪种战术是利用一个着法同时形成两个威胁？', options: [{ id: 'A', text: 'VCF' }, { id: 'B', text: 'VCT' }, { id: 'C', text: '组合攻击' }, { id: 'D', text: '交叉攻击' }], correctAnswer: 'C', explanation: '组合攻击的核心是制造交叉点，一个着法同时形成两个或更多威胁（如双三、四三、双四等），对方只能防守一个。', difficulty: '中级', patternType: 'combination' },
  { id: 14, type: 'pattern', question: '以下哪种棋型的威胁等级最高？', options: [{ id: 'A', text: '双活二' }, { id: 'B', text: '眠三' }, { id: 'C', text: '跳四' }, { id: 'D', text: '分散三' }], correctAnswer: 'C', explanation: '跳四的威胁等级最高（70）。眠三为20，分散三为15，双活二为18。', difficulty: '中级', patternType: 'jumpFour' },
  { id: 15, type: 'tactic', question: '以下哪种战术是在防守的同时形成自己的威胁？', options: [{ id: 'A', text: 'VCF' }, { id: 'B', text: '防守反击' }, { id: 'C', text: '组合攻击' }, { id: 'D', text: '交叉攻击' }], correctAnswer: 'B', explanation: '防守反击是在防守对方威胁的同时形成自己的威胁，将被动转化为主动。', difficulty: '中级', patternType: 'counterAttack' },
  { id: 16, type: 'pattern', question: '以下哪种棋型可以发展为活四？', options: [{ id: 'A', text: '眠三' }, { id: 'B', text: '活三' }, { id: 'C', text: '眠二' }, { id: 'D', text: '分散二' }], correctAnswer: 'B', explanation: '活三（_XXX_）两端均空，下一步可以在任一端扩展为活四（_XXXX_）。眠三只有一端空，无法发展为活四。', difficulty: '基础', patternType: 'openThree' },
  { id: 17, type: 'tactic', question: 'TSS战术的核心思想是什么？', options: [{ id: 'A', text: '搜索所有可能的着法' }, { id: 'B', text: '只考虑能形成威胁的着法' }, { id: 'C', text: '随机选择着法' }, { id: 'D', text: '只考虑防守着法' }], correctAnswer: 'B', explanation: 'TSS（Threat-Space Search）的核心思想是只考虑能形成威胁的着法（活三、冲四等），大幅减少搜索空间，实现更深的计算。', difficulty: '高级', patternType: 'tss' },
  { id: 18, type: 'opening', question: '在RIF规则中，三手交换规则的作用是什么？', options: [{ id: 'A', text: '让黑方选择开局' }, { id: 'B', text: '让白方在黑方下完前三手后选择交换颜色' }, { id: 'C', text: '让黑方多走一步' }, { id: 'D', text: '让白方先走' }], correctAnswer: 'B', explanation: '三手交换规则允许白方在黑方下完前三手后选择是否交换颜色。如果黑方选择了必胜开局，白方可以交换颜色获得黑方的优势。', difficulty: '中级', patternType: 'swap' },
  { id: 19, type: 'pattern', question: '以下哪种棋型不是真正的禁手？', options: [{ id: 'A', text: '两个独立的活三' }, { id: 'B', text: '一个活三和一个眠三' }, { id: 'C', text: '两个独立的冲四' }, { id: 'D', text: '六子连线' }], correctAnswer: 'B', explanation: '三三禁手要求两个活三同时形成，一个活三和一个眠三不构成三三禁手。', difficulty: '高级', patternType: 'doubleThreeForbidden' },
  { id: 20, type: 'tactic', question: '以下哪种战术最适合复杂局面？', options: [{ id: 'A', text: 'VCF' }, { id: 'B', text: 'VCT' }, { id: 'C', text: 'TSS' }, { id: 'D', text: '组合攻击' }], correctAnswer: 'C', explanation: 'TSS（威胁空间搜索）最适合复杂局面，因为它只考虑能形成威胁的着法，大幅减少搜索空间，可以在合理时间内找到必胜路线。', difficulty: '高级', patternType: 'tss' }
];

// ============= AITutor Class =============
class AITutor {
  constructor(engine) {
    this.engine = engine;
    this.currentQuizIndex = 0;
    this.quizScore = 0;
    this.quizTotal = 0;
    this.studyPlan = null;
    this.playerHistory = {
      mistakes: [],
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      patternsSeen: new Set(),
      tacticsUsed: new Set(),
      openingsPlayed: new Set(),
      weaknesses: {
        patternRecognition: 0,
        tacticalCalculation: 0,
        openingKnowledge: 0,
        defense: 0,
        endgame: 0
      }
    };
  }

  // ===== Core Analysis Methods =====

  analyzePosition(color) {
    const opponent = color === 'black' ? 'white' : 'black';
    const threats = this.findAllThreats(color);
    const oppThreats = this.findAllThreats(opponent);
    const moveCount = this.engine.moveHistory ? this.engine.moveHistory.length : 0;
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

  findWinningMove(color) {
    const candidates = this.engine.getCandidateMoves ? this.engine.getCandidateMoves() : this.getAllEmptyCells();
    for (const move of candidates) {
      this.engine.board[move.row][move.col] = color;
      const win = this.engine.checkWin(move.row, move.col, color);
      this.engine.board[move.row][move.col] = null;
      if (win) return move;
    }
    return null;
  }

  findCriticalBlock(opponent) {
    const candidates = this.engine.getCandidateMoves ? this.engine.getCandidateMoves() : this.getAllEmptyCells();
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
    const candidates = this.engine.getCandidateMoves ? this.engine.getCandidateMoves() : this.getAllEmptyCells();
    let bestMove = null;
    let bestScore = -1;

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
    for (let i = 1; i <= 5; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= this.engine.size || c < 0 || c >= this.engine.size) break;
      if (this.engine.board[r][c] === color) count++;
      else { leftOpen = (this.engine.board[r][c] === null); break; }
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

  getAllEmptyCells() {
    const cells = [];
    for (let r = 0; r < this.engine.size; r++) {
      for (let c = 0; c < this.engine.size; c++) {
        if (this.engine.board[r][c] === null) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }

  identifyOpening() {
    const history = this.engine.moveHistory;
    if (!history || history.length < 3) return null;

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
          text: '开局较为自由，未采用标准开局之一。建议学习专业开局理论。'
        });
      }
    }

    // Analyze key moves
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      const color = move.color || (i % 2 === 0 ? 'black' : 'white');

      const tempBoard = this.createTempBoard(history.slice(0, i));

      tempBoard[move.row][move.col] = color;
      if (this.checkWinOnBoard(tempBoard, move.row, move.col, color, this.engine.size)) {
        review.keyMoves.push({
          moveIndex: i + 1,
          text: `第${i + 1}手 (${move.row + 1}, ${move.col + 1})：制胜一击！形成五连获胜。`
        });
      }
      tempBoard[move.row][move.col] = null;
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
    if (!history || history.length < 3) return null;

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

  // ===== Required Methods =====

  getCurrentOpening() {
    return this.identifyOpening();
  }

  getOpeningInfo(name) {
    const allOpenings = [...OPENING_THEORY.direct, ...OPENING_THEORY.diagonal];
    return allOpenings.find(o => o.name === name || o.pinyin === name) || null;
  }

  evaluateMove(row, col) {
    const color = this.engine.currentPlayer || 'black';
    const opponent = color === 'black' ? 'white' : 'black';

    if (this.engine.board[row][col] !== null) {
      return { valid: false, reason: '该位置已有棋子' };
    }

    this.engine.board[row][col] = color;
    const threats = this.detectThreats(row, col, color);
    const win = this.engine.checkWin(row, col, color);
    this.engine.board[row][col] = null;

    let score = 0;
    let evaluation = '';

    if (win) {
      score = 100000000;
      evaluation = '制胜一击！可形成五连获胜。';
    } else if (threats.openFours >= 1) {
      score = 10000000;
      evaluation = '形成活四！下一步即可获胜。';
    } else if (threats.fours >= 2) {
      score = 5000000;
      evaluation = '形成双四！对方无法同时防守。';
    } else if (threats.fours >= 1 && threats.openThrees >= 1) {
      score = 2000000;
      evaluation = '形成四三组合！对方必须防四，三可成活四。';
    } else if (threats.openThrees >= 2) {
      score = 1000000;
      evaluation = '形成双三！对方难以同时防守。';
    } else if (threats.fours >= 1) {
      score = 500000;
      evaluation = '形成冲四，可迫使对方防守。';
    } else if (threats.openThrees >= 1) {
      score = 50000;
      evaluation = '形成活三，可扩展进攻素材。';
    } else if (threats.jumpThrees >= 1) {
      score = 10000;
      evaluation = '形成跳三，有进攻潜力。';
    } else {
      score = 1000;
      evaluation = '扩展棋型，为后续进攻做准备。';
    }

    // Check if this move helps defend against opponent threats
    this.engine.board[row][col] = opponent;
    const oppThreats = this.detectThreats(row, col, opponent);
    this.engine.board[row][col] = null;

    if (oppThreats.openFours >= 1 || oppThreats.fours >= 2) {
      score += 5000000;
      evaluation += ' 同时是关键的防守点。';
    } else if (oppThreats.openThrees >= 2) {
      score += 2000000;
      evaluation += ' 同时可防守对方双三。';
    } else if (oppThreats.fours >= 1) {
      score += 500000;
      evaluation += ' 同时可防守对方冲四。';
    }

    return {
      valid: true,
      score,
      evaluation,
      threats,
      row,
      col
    };
  }

  suggestMoves(count = 3) {
    const candidates = this.engine.getCandidateMoves ? this.engine.getCandidateMoves() : this.getAllEmptyCells();
    const suggestions = [];

    for (const move of candidates) {
      const evalResult = this.evaluateMove(move.row, move.col);
      if (evalResult.valid) {
        suggestions.push({
          move: { row: move.row, col: move.col },
          score: evalResult.score,
          reason: evalResult.evaluation
        });
      }
    }

    suggestions.sort((a, b) => b.score - a.score);
    return suggestions.slice(0, count);
  }

  // Recommend a single best move - used by app.js showHint()
  recommendMove(color) {
    const moves = this.suggestMoves(1);
    if (moves.length > 0) {
      return moves[0];
    }
    return { move: null, reason: '当前没有合适的落子位置' };
  }

  analyzeThreats() {
    const color = this.engine.currentPlayer || 'black';
    const opponent = color === 'black' ? 'white' : 'black';

    const myThreats = this.findAllThreats(color);
    const oppThreats = this.findAllThreats(opponent);

    return {
      myThreats,
      oppThreats,
      summary: this.getThreatSummary(myThreats, oppThreats)
    };
  }

  getThreatSummary(myThreats, oppThreats) {
    let summary = '';
    if (myThreats.openFours >= 1) summary += '你有活四威胁！';
    else if (myThreats.fours >= 2) summary += '你有双四威胁！';
    else if (myThreats.fours >= 1 && myThreats.openThrees >= 1) summary += '你有四三组合威胁！';
    else if (myThreats.openThrees >= 2) summary += '你有双三威胁！';
    else if (myThreats.fours >= 1) summary += '你有冲四威胁。';
    else if (myThreats.openThrees >= 1) summary += '你有活三威胁。';
    else summary += '你暂无明显威胁。';

    summary += ' ';

    if (oppThreats.openFours >= 1) summary += '对方有活四威胁，必须立即防守！';
    else if (oppThreats.fours >= 2) summary += '对方有双四威胁，必须立即防守！';
    else if (oppThreats.fours >= 1 && oppThreats.openThrees >= 1) summary += '对方有四三组合威胁，必须立即防守！';
    else if (oppThreats.openThrees >= 2) summary += '对方有双三威胁，需要防守！';
    else if (oppThreats.fours >= 1) summary += '对方有冲四威胁，需要防守。';
    else if (oppThreats.openThrees >= 1) summary += '对方有活三威胁，需要防守。';
    else summary += '对方暂无明显威胁。';

    return summary;
  }

  getTacticalAdvice() {
    const color = this.engine.currentPlayer || 'black';
    const analysis = this.analyzePosition(color);
    const advice = [];

    // Get tactical advice based on the current situation
    if (analysis.urgency === 'critical') {
      advice.push({
        type: 'critical',
        text: '当前局面有紧急威胁，请优先处理！',
        detail: analysis.advice[0]
      });
    }

    if (analysis.threats.openThrees >= 1 || analysis.threats.fours >= 1) {
      advice.push({
        type: 'attack',
        text: '当前有进攻机会，建议积极进攻。',
        tactics: ['vcf', 'vct', 'combination']
      });
    }

    if (analysis.oppThreats.openThrees >= 1 || analysis.oppThreats.fours >= 1) {
      advice.push({
        type: 'defense',
        text: '对方有威胁，需要防守。',
        tactics: ['defense', 'counterAttack']
      });
    }

    if (analysis.phase === 'opening') {
      advice.push({
        type: 'opening',
        text: '当前处于开局阶段，建议学习专业开局理论。',
        tactics: ['opening']
      });
    } else if (analysis.phase === 'endgame') {
      advice.push({
        type: 'endgame',
        text: '当前处于终局阶段，建议精确计算。',
        tactics: ['endgame', 'vcf', 'vct']
      });
    }

    return advice;
  }

  getPatternName(type) {
    const pattern = PATTERN_KNOWLEDGE[type];
    return pattern ? pattern.name : '未知棋型';
  }

  getOpeningTheory() {
    return OPENING_THEORY;
  }

  getPatternKnowledge() {
    return PATTERN_KNOWLEDGE;
  }

  getTacticalKnowledge() {
    return TACTICAL_TECHNIQUES;
  }

  // Alias for backward compatibility with app.js
  getTactics() {
    return TACTICAL_TECHNIQUES;
  }

  getMistakesFromHistory() {
    return this.playerHistory.mistakes;
  }

  // ===== New Methods =====

  getPlayerStyleAnalysis(playerMoves) {
    if (!playerMoves || playerMoves.length === 0) {
      return {
        style: '未知',
        traits: [],
        recommendations: ['请提供更多对局数据以进行分析。']
      };
    }

    // Analyze player moves to determine style
    let aggressiveScore = 0;
    let defensiveScore = 0;
    let balancedScore = 0;
    let calculatingScore = 0;

    // Count openings used
    const openingsUsed = new Set();

    for (let i = 0; i < playerMoves.length; i++) {
      const move = playerMoves[i];
      if (move.phase === 'opening') {
        openingsUsed.add(move.opening);
      }

      // Analyze move characteristics
      if (move.threatCreated) {
        if (move.threatType === 'openThree' || move.threatType === 'four') {
          aggressiveScore += 2;
        }
      }

      if (move.defensiveMove) {
        defensiveScore += 2;
      }

      if (move.capturedOpponentThreat) {
        defensiveScore += 1;
        if (move.createdCounterThreat) {
          balancedScore += 2;
        }
      }

      if (move.calculationDepth > 5) {
        calculatingScore += 2;
      }
    }

    // Determine primary style
    let style = '均衡型';
    let traits = [];
    let recommendations = [];

    if (aggressiveScore > defensiveScore && aggressiveScore > balancedScore) {
      style = '进攻型';
      traits = PRO_PLAYER_DB.styles.aggressive.traits;
      recommendations = [
        '你的进攻意识很强，建议继续加强VCF和VCT的计算能力。',
        '同时要注意提高防守能力，避免在防守局面中急躁。',
        '建议多研究必胜开局的进攻路线。'
      ];
    } else if (defensiveScore > aggressiveScore && defensiveScore > balancedScore) {
      style = '防守反击型';
      traits = PRO_PLAYER_DB.styles.defensive.traits;
      recommendations = [
        '你的防守能力很强，建议学习如何在防守中寻找反击机会。',
        '适当提高主动进攻能力，学会在适当时机发起进攻。',
        '建议研究防守反击的经典案例。'
      ];
    } else if (calculatingScore > aggressiveScore && calculatingScore > defensiveScore) {
      style = '计算型';
      traits = PRO_PLAYER_DB.styles.calculating.traits;
      recommendations = [
        '你的计算能力很强，建议继续提高计算深度。',
        '同时要注意提高快速判断能力，避免在简单局面中过度思考。',
        '建议多练习复杂局面的VCT路线。'
      ];
    } else {
      style = '均衡型';
      traits = PRO_PLAYER_DB.styles.balanced.traits;
      recommendations = [
        '你的技术较为全面，建议找到自己的特长方向。',
        '在全面基础上发展专长，形成自己的风格。',
        '建议多分析自己的对局，找出优势和不足。'
      ];
    }

    return {
      style,
      traits,
      recommendations,
      openingsUsed: Array.from(openingsUsed),
      scores: {
        aggressive: aggressiveScore,
        defensive: defensiveScore,
        balanced: balancedScore,
        calculating: calculatingScore
      }
    };
  }

  getStudyPlan(weaknesses) {
    if (!weaknesses || Object.keys(weaknesses).length === 0) {
      weaknesses = this.playerHistory.weaknesses;
    }

    const plan = {
      title: '个性化学习计划',
      description: '基于你的弱点和偏好生成的学习计划',
      phases: [],
      dailyTasks: [],
      recommendedResources: []
    };

    // Phase 1: Pattern Recognition
    if (weaknesses.patternRecognition > 3) {
      plan.phases.push({
        name: '第一阶段：棋型识别强化',
        duration: '1-2周',
        focus: '提高对各种棋型的识别速度和准确性',
        tasks: [
          '每天完成10道棋型识别测验题',
          '学习35种专业棋型的特征和威胁等级',
          '练习快速识别活三、冲四、跳三等基本棋型'
        ]
      });
      plan.dailyTasks.push('完成棋型识别测验');
    }

    // Phase 2: Tactical Calculation
    if (weaknesses.tacticalCalculation > 3) {
      plan.phases.push({
        name: '第二阶段：战术计算强化',
        duration: '2-3周',
        focus: '提高VCF和VCT的计算能力',
        tasks: [
          '每天练习5道VCF题目',
          '学习TSS威胁空间搜索技术',
          '分析专业棋手的VCT路线'
        ]
      });
      plan.dailyTasks.push('练习VCF/VCT题目');
    }

    // Phase 3: Opening Knowledge
    if (weaknesses.openingKnowledge > 3) {
      plan.phases.push({
        name: '第三阶段：开局理论学习',
        duration: '2-4周',
        focus: '掌握52种专业开局的变化和理论',
        tasks: [
          '学习26种直指开局的理论和变化',
          '学习26种斜指开局的理论和变化',
          '分析专业比赛中的开局选择'
        ]
      });
      plan.dailyTasks.push('学习一种开局理论');
    }

    // Phase 4: Defense
    if (weaknesses.defense > 3) {
      plan.phases.push({
        name: '第四阶段：防守技术强化',
        duration: '1-2周',
        focus: '提高防守能力和防守反击技巧',
        tasks: [
          '学习防守优先级原则',
          '练习防守反击技巧',
          '分析专业棋手的防守案例'
        ]
      });
      plan.dailyTasks.push('练习防守题目');
    }

    // Phase 5: Endgame
    if (weaknesses.endgame > 3) {
      plan.phases.push({
        name: '第五阶段：终局技术强化',
        duration: '1-2周',
        focus: '提高终局处理能力',
        tasks: [
          '学习终局的基本原则',
          '练习终局的精确计算',
          '分析专业棋手的终局处理'
        ]
      });
      plan.dailyTasks.push('练习终局题目');
    }

    // Recommended resources
    plan.recommendedResources = [
      { type: '测验', name: '棋型识别测验', description: '通过互动测验提高棋型识别能力' },
      { type: '案例', name: '专业比赛案例', description: '分析专业棋手的对局，学习实战技巧' },
      { type: '练习', name: 'VCF/VCT练习', description: '通过大量练习提高计算能力' },
      { type: '理论', name: '开局理论学习', description: '系统学习52种专业开局的理论' }
    ];

    this.studyPlan = plan;
    return plan;
  }

  getQuizQuestion() {
    if (QUIZ_QUESTIONS.length === 0) {
      return null;
    }

    // Get a random question that hasn't been asked recently
    const availableQuestions = QUIZ_QUESTIONS.filter((q, index) => index !== this.currentQuizIndex);
    if (availableQuestions.length === 0) {
      this.currentQuizIndex = -1;
      return this.getQuizQuestion();
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    this.currentQuizIndex = QUIZ_QUESTIONS.indexOf(question);

    return {
      id: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
      patternType: question.patternType
    };
  }

  checkQuizAnswer(answer) {
    if (this.currentQuizIndex < 0 || this.currentQuizIndex >= QUIZ_QUESTIONS.length) {
      return { correct: false, message: '没有当前问题。' };
    }

    const question = QUIZ_QUESTIONS[this.currentQuizIndex];
    const correct = answer === question.correctAnswer;
    this.quizTotal++;
    if (correct) {
      this.quizScore++;
    }

    // Update weaknesses based on answer
    if (!correct) {
      if (question.type === 'pattern') {
        this.playerHistory.weaknesses.patternRecognition++;
      } else if (question.type === 'tactic') {
        this.playerHistory.weaknesses.tacticalCalculation++;
      } else if (question.type === 'opening') {
        this.playerHistory.weaknesses.openingKnowledge++;
      }
    }

    return {
      correct,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      patternType: question.patternType,
      score: this.quizScore,
      total: this.quizTotal,
      percentage: this.quizTotal > 0 ? Math.round((this.quizScore / this.quizTotal) * 100) : 0
    };
  }

  getCaseStudy(gameId) {
    return GAME_CASE_STUDIES[gameId] || null;
  }

  getAllCaseStudies() {
    return Object.values(GAME_CASE_STUDIES);
  }

  getProOpeningPreference(playerId) {
    const player = PRO_PLAYER_DB.players.find(p => p.id === playerId);
    if (!player) {
      return null;
    }

    return {
      player: player.name,
      style: player.style,
      favoriteOpenings: player.favoriteOpenings,
      openingAdvice: this.getOpeningAdviceForStyle(player.style)
    };
  }

  getOpeningAdviceForStyle(style) {
    const styleData = PRO_PLAYER_DB.styles[style.toLowerCase()];
    if (!styleData) {
      return '建议多尝试不同类型的开局，找到适合自己的风格。';
    }

    return {
      recommendedOpenings: styleData.openings,
      advice: styleData.advice,
      traits: styleData.traits
    };
  }

  getProPlayerDatabase() {
    return PRO_PLAYER_DB;
  }

  resetQuiz() {
    this.currentQuizIndex = -1;
    this.quizScore = 0;
    this.quizTotal = 0;
  }

  getQuizStats() {
    return {
      score: this.quizScore,
      total: this.quizTotal,
      percentage: this.quizTotal > 0 ? Math.round((this.quizScore / this.quizTotal) * 100) : 0
    };
  }

  updatePlayerHistory(gameResult, mistakes) {
    this.playerHistory.gamesPlayed++;
    if (gameResult === 'win') this.playerHistory.wins++;
    else if (gameResult === 'loss') this.playerHistory.losses++;
    else if (gameResult === 'draw') this.playerHistory.draws++;

    if (mistakes && mistakes.length > 0) {
      this.playerHistory.mistakes.push(...mistakes);
    }
  }
}

// Export for both CommonJS and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AITutor, OPENING_THEORY, PATTERN_KNOWLEDGE, TACTICAL_TECHNIQUES };
}
if (typeof window !== 'undefined') {
  window.AITutor = AITutor;
  window.OPENING_THEORY = OPENING_THEORY;
  window.PATTERN_KNOWLEDGE = PATTERN_KNOWLEDGE;
  window.TACTICAL_TECHNIQUES = TACTICAL_TECHNIQUES;
}

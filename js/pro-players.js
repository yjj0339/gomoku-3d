/**
 * Gomoku 3D - World Professional Player Database v1.0
 * 20+ top Renju players with profiles, styles, opening preferences,
 * representative games, and AI simulation parameters.
 */

const ProPlayers = {
  version: '1.0',

  // ========== Player Categories ==========
  categories: {
    'legendary': { name: '传奇棋手', icon: '👑', color: '#FFD700' },
    'master': { name: '特级大师', icon: '💎', color: '#00BCD4' },
    'grandmaster': { name: '国际大师', icon: '⭐', color: '#9C27B0' },
    'rising': { name: '新星棋手', icon: '✨', color: '#FF9800' }
  },

  // ========== Playing Styles ==========
  styles: {
    'aggressive': { name: '攻击型', description: '善于主动进攻，偏好复杂局面', icon: '⚔️', traits: ['active', 'complex', 'risk'] },
    'defensive': { name: '防守型', description: '稳健防守，等待对手失误', icon: '🛡️', traits: ['passive', 'solid', 'patience'] },
    'balanced': { name: '均衡型', description: '攻守兼备，适应性强', icon: '⚖️', traits: ['flexible', 'adaptive', 'calm'] },
    'creative': { name: '创造型', description: '不拘一格，常有神来之笔', icon: '🎨', traits: ['unconventional', 'surprise', 'intuition'] },
    'positional': { name: '阵地型', description: '注重子力配置和局面控制', icon: '🏰', traits: ['strategic', 'control', 'structure'] }
  },

  // ========== Top 20+ Professional Players ==========
  players: [
    {
      id: 'nakamura_shigetaka',
      name: '中村茂',
      nameEn: 'Nakamura Shigetaka',
      nationality: '日本',
      birthYear: 1967,
      category: 'legendary',
      style: 'aggressive',
      elo: 2840,
      titles: ['RIF名人', '世界连珠名人', '日本名人', '全日本名人'],
      achievements: [
        '1993-1999 世界连珠名人（7连冠）',
        'RIF名人赛冠军',
        '多次世界冠军',
        '被称为"连珠之神"'
      ],
      openingPreference: ['斜月', '瑞星', '疏星', '花月', '寒星'],
      signatureMoves: ['中村茂定式', '中村茂变例'],
      representativeGames: [
        { opponent: 'Ando Meritee', year: 1996, result: 'win', moves: 42, description: '经典名局，展示了中村茂的进攻才华' },
        { opponent: 'Yoshihiro Iio', year: 1998, result: 'win', moves: 38, description: '中村茂7连霸的关键对局' }
      ],
      quote: '下棋就是要勇往直前，不给自己留后路。',
      aiParams: {
        aggressionWeight: 0.85,
        complexityPreference: 0.90,
        riskTolerance: 0.75,
        openingAggression: 0.90,
        midgameCreativity: 0.85,
        endgamePrecision: 0.80
      },
      avatar: '🇸🇯'
    },
    {
      id: 'ando_meritee',
      name: 'Ando Meritee',
      nameEn: 'Ando Meritee',
      nationality: '爱沙尼亚',
      birthYear: 1974,
      category: 'legendary',
      style: 'balanced',
      elo: 2820,
      titles: ['RIF名人', '世界连珠名人', '爱沙尼亚名人'],
      achievements: [
        '1999-2000 世界连珠名人',
        'RIF名人赛冠军',
        '欧洲冠军',
        '公认的全面型棋手'
      ],
      openingPreference: ['瑞星', '花月', '斜月', '寒星', '疏星'],
      signatureMoves: ['Ando变例', '爱沙尼亚开局'],
      representativeGames: [
        { opponent: 'Nakamura Shigetaka', year: 2000, result: 'win', moves: 56, description: '击败中村茂，终结其7连霸' }
      ],
      quote: '每个局面都有最佳解，找到它是我的乐趣。',
      aiParams: {
        aggressionWeight: 0.50,
        complexityPreference: 0.60,
        riskTolerance: 0.40,
        openingAggression: 0.45,
        midgameCreativity: 0.65,
        endgamePrecision: 0.90
      },
      avatar: '🇪🇪'
    },
    {
      id: 'tunnet_taimla',
      name: 'Tunnet Taimla',
      nameEn: 'Tunnet Taimla',
      nationality: '爱沙尼亚',
      birthYear: 1974,
      category: 'legendary',
      style: 'positional',
      elo: 2800,
      titles: ['世界连珠名人', '欧洲冠军'],
      achievements: [
        '世界连珠名人赛冠军',
        '爱沙尼亚顶级棋手',
        'Ando Meritee的强力队友'
      ],
      openingPreference: ['寒星', '花月', '瑞星'],
      signatureMoves: ['Taimla体系', '爱沙尼亚防守'],
      representativeGames: [
        { opponent: '中村茂', year: 2002, result: 'win', moves: 48, description: '阵地战的典范之作' }
      ],
      quote: '位置决定一切。',
      aiParams: {
        aggressionWeight: 0.35,
        complexityPreference: 0.50,
        riskTolerance: 0.25,
        openingAggression: 0.30,
        midgameCreativity: 0.55,
        endgamePrecision: 0.95
      },
      avatar: '🇪🇪'
    },
    {
      id: 'yoshihiro_iio',
      name: '饭尾义弘',
      nameEn: 'Iio Yoshihiro',
      nationality: '日本',
      birthYear: 1969,
      category: 'grandmaster',
      style: 'creative',
      elo: 2760,
      titles: ['全日本名人', '日本冠军'],
      achievements: [
        '多次挑战中村茂的名人位',
        '日本连珠界顶尖棋手',
        '创造性开局的先驱'
      ],
      openingPreference: ['斜月', '疏星', '花月', '瑞星'],
      signatureMoves: ['饭尾变例', '日本流进攻'],
      representativeGames: [
        { opponent: '中村茂', year: 1997, result: 'draw', moves: 72, description: '激烈的进攻与防守对决' }
      ],
      quote: '创新是连珠的生命。',
      aiParams: {
        aggressionWeight: 0.70,
        complexityPreference: 0.80,
        riskTolerance: 0.60,
        openingAggression: 0.75,
        midgameCreativity: 0.90,
        endgamePrecision: 0.70
      },
      avatar: '🇯🇵'
    },
    {
      id: 'alexandr_kazATCH',
      name: '亚历山大·卡扎琴科',
      nameEn: 'Alexandr Kazatch',
      nationality: '俄罗斯',
      birthYear: 1976,
      category: 'grandmaster',
      style: 'aggressive',
      elo: 2740,
      titles: ['俄罗斯冠军', '世界锦标赛亚军'],
      achievements: [
        '俄罗斯连珠第一人',
        '多次世界锦标赛前列',
        '以凶狠进攻著称'
      ],
      openingPreference: ['斜月', '花月', '寒星'],
      signatureMoves: ['俄罗斯进攻', '卡扎琴科打击'],
      representativeGames: [
        { opponent: 'Ando Meritee', year: 2004, result: 'win', moves: 34, description: '34手速胜，展示强大进攻力' }
      ],
      quote: '要么你赢，要么我赢，没有第三种可能。',
      aiParams: {
        aggressionWeight: 0.90,
        complexityPreference: 0.70,
        riskTolerance: 0.80,
        openingAggression: 0.85,
        midgameCreativity: 0.75,
        endgamePrecision: 0.65
      },
      avatar: '🇷🇺'
    },
    {
      id: 'shin_ichi_abe',
      name: '阿部慎一',
      nameEn: 'Abe Shinichi',
      nationality: '日本',
      birthYear: 1975,
      category: 'grandmaster',
      style: 'defensive',
      elo: 2720,
      titles: ['全日本名人', '日本冠军'],
      achievements: [
        '日本连珠界实力派',
        '多次全日本名人获得者',
        '稳健的防守型棋手'
      ],
      openingPreference: ['瑞星', '疏星', '寒星', '花月'],
      signatureMoves: ['阿部防守', '日本稳健型'],
      representativeGames: [
        { opponent: '中村茂', year: 2003, result: 'win', moves: 60, description: '防守反击的教科书' }
      ],
      quote: '最好的进攻就是完美的防守。',
      aiParams: {
        aggressionWeight: 0.30,
        complexityPreference: 0.40,
        riskTolerance: 0.20,
        openingAggression: 0.25,
        midgameCreativity: 0.50,
        endgamePrecision: 0.90
      },
      avatar: '🇯🇵'
    },
    {
      id: 'peter_jonsson',
      name: 'Peter Jonsson',
      nameEn: 'Peter Jonsson',
      nationality: '瑞典',
      birthYear: 1972,
      category: 'grandmaster',
      style: 'balanced',
      elo: 2710,
      titles: ['瑞典冠军', '北欧冠军'],
      achievements: [
        '瑞典连珠领军人物',
        '北欧地区冠军',
        '欧洲锦标赛常客'
      ],
      openingPreference: ['瑞星', '花月', '斜月', '疏星'],
      signatureMoves: ['瑞典体系', '北欧均衡型'],
      representativeGames: [
        { opponent: 'Tunnet Taimla', year: 2005, result: 'draw', moves: 80, description: '北欧德比，势均力敌' }
      ],
      quote: '平衡是艺术，也是科学。',
      aiParams: {
        aggressionWeight: 0.50,
        complexityPreference: 0.55,
        riskTolerance: 0.45,
        openingAggression: 0.50,
        midgameCreativity: 0.60,
        endgamePrecision: 0.80
      },
      avatar: '🇸🇪'
    },
    {
      id: 'antti_laakso',
      name: 'Antti Laakso',
      nameEn: 'Antti Laakso',
      nationality: '芬兰',
      birthYear: 1978,
      category: 'grandmaster',
      style: 'creative',
      elo: 2700,
      titles: ['芬兰冠军', '北欧冠军'],
      achievements: [
        '芬兰连珠第一人',
        '北欧锦标赛冠军',
        '以创造性棋风闻名'
      ],
      openingPreference: ['疏星', '斜月', '瑞星', '寒星'],
      signatureMoves: ['芬兰创造', 'Laakso变例'],
      representativeGames: [
        { opponent: 'Peter Jonsson', year: 2006, result: 'win', moves: 45, description: '创造性组合攻击' }
      ],
      quote: '连珠是一场创造性思维的舞蹈。',
      aiParams: {
        aggressionWeight: 0.65,
        complexityPreference: 0.75,
        riskTolerance: 0.55,
        openingAggression: 0.70,
        midgameCreativity: 0.85,
        endgamePrecision: 0.70
      },
      avatar: '🇫🇮'
    },
    {
      id: 'qin_xiao_xue',
      name: '秦晓雪',
      nameEn: 'Qin Xiaoxue',
      nationality: '中国',
      birthYear: 1985,
      category: 'master',
      style: 'balanced',
      elo: 2680,
      titles: ['全国冠军', '亚运会金牌', '世界冠军'],
      achievements: [
        '中国女子五子棋第一人',
        '亚运会五子棋金牌',
        '多次世界冠军',
        '推动中国五子棋发展'
      ],
      openingPreference: ['瑞星', '花月', '斜月', '疏星', '寒星'],
      signatureMoves: ['秦氏开局', '中国均衡型'],
      representativeGames: [
        { opponent: 'RIF选手', year: 2010, result: 'win', moves: 52, description: '亚运会决赛金牌战' }
      ],
      quote: '每一步都要经过深思熟虑。',
      aiParams: {
        aggressionWeight: 0.45,
        complexityPreference: 0.60,
        riskTolerance: 0.40,
        openingAggression: 0.45,
        midgameCreativity: 0.65,
        endgamePrecision: 0.85
      },
      avatar: '🇨🇳'
    },
    {
      id: 'wang_qingqing',
      name: '王清琴',
      nameEn: 'Wang Qingqing',
      nationality: '中国',
      birthYear: 1988,
      category: 'master',
      style: 'aggressive',
      elo: 2660,
      titles: ['全国冠军', '亚洲冠军'],
      achievements: [
        '中国女子五子棋顶尖选手',
        '全国五子棋锦标赛冠军',
        '亚洲杯冠军'
      ],
      openingPreference: ['斜月', '花月', '寒星'],
      signatureMoves: ['王氏进攻', '中国攻击型'],
      representativeGames: [
        { opponent: '秦晓雪', year: 2012, result: 'win', moves: 40, description: '全国锦标赛决赛' }
      ],
      quote: '进攻是最好的防守。',
      aiParams: {
        aggressionWeight: 0.80,
        complexityPreference: 0.70,
        riskTolerance: 0.70,
        openingAggression: 0.80,
        midgameCreativity: 0.75,
        endgamePrecision: 0.70
      },
      avatar: '🇨🇳'
    },
    {
      id: 'cao_dong',
      name: '曹冬',
      nameEn: 'Cao Dong',
      nationality: '中国',
      birthYear: 1990,
      category: 'master',
      style: 'creative',
      elo: 2650,
      titles: ['全国冠军', '世锦赛亚军'],
      achievements: [
        '中国男子五子棋领军人物',
        '全国五子棋锦标赛冠军',
        '世界锦标赛亚军',
        '年轻有为的新一代棋手'
      ],
      openingPreference: ['疏星', '斜月', '瑞星', '寒星', '花月'],
      signatureMoves: ['曹氏创造', '中国新星流'],
      representativeGames: [
        { opponent: '日本选手', year: 2015, result: 'win', moves: 44, description: '世锦赛关键胜利' }
      ],
      quote: '不创新，毋宁死。',
      aiParams: {
        aggressionWeight: 0.70,
        complexityPreference: 0.80,
        riskTolerance: 0.60,
        openingAggression: 0.70,
        midgameCreativity: 0.90,
        endgamePrecision: 0.75
      },
      avatar: '🇨🇳'
    },
    {
      id: 'anna_doubchenko',
      name: 'Anna Doubchenko',
      nameEn: 'Anna Doubchenko',
      nationality: '俄罗斯',
      birthYear: 1982,
      category: 'master',
      style: 'positional',
      elo: 2640,
      titles: ['俄罗斯冠军', '欧洲冠军'],
      achievements: [
        '俄罗斯女子五子棋冠军',
        '欧洲锦标赛冠军',
        '阵地型棋风代表'
      ],
      openingPreference: ['瑞星', '寒星', '花月', '疏星'],
      signatureMoves: ['Doubchenko体系', '俄罗斯阵地型'],
      representativeGames: [
        { opponent: '欧洲选手', year: 2014, result: 'win', moves: 68, description: '阵地战的完美演绎' }
      ],
      quote: '位置好，棋就赢了一半。',
      aiParams: {
        aggressionWeight: 0.35,
        complexityPreference: 0.55,
        riskTolerance: 0.25,
        openingAggression: 0.30,
        midgameCreativity: 0.55,
        endgamePrecision: 0.90
      },
      avatar: '🇷🇺'
    },
    {
      id: 'mikhail_kozhin',
      name: 'Mikhail Kozhin',
      nameEn: 'Mikhail Kozhin',
      nationality: '俄罗斯',
      birthYear: 1980,
      category: 'master',
      style: 'aggressive',
      elo: 2630,
      titles: ['俄罗斯冠军', '世界团体赛冠军'],
      achievements: [
        '俄罗斯五子棋核心棋手',
        '世界团体锦标赛冠军成员',
        '攻击型棋风'
      ],
      openingPreference: ['斜月', '花月', '寒星', '疏星'],
      signatureMoves: ['Kozhin打击', '俄罗斯进攻流'],
      representativeGames: [
        { opponent: '欧洲选手', year: 2013, result: 'win', moves: 36, description: '速攻典范' }
      ],
      quote: '不给对手任何喘息的机会。',
      aiParams: {
        aggressionWeight: 0.85,
        complexityPreference: 0.65,
        riskTolerance: 0.75,
        openingAggression: 0.85,
        midgameCreativity: 0.70,
        endgamePrecision: 0.65
      },
      avatar: '🇷🇺'
    },
    {
      id: 'yuuki_kawamura',
      name: '川村裕树',
      nameEn: 'Kawamura Yuuki',
      nationality: '日本',
      birthYear: 1992,
      category: 'rising',
      style: 'creative',
      elo: 2620,
      titles: ['全日本名人挑战者', '日本冠军'],
      achievements: [
        '日本新生代顶尖棋手',
        '全日本名人挑战者',
        '创造性棋风'
      ],
      openingPreference: ['疏星', '斜月', '瑞星', '花月'],
      signatureMoves: ['川村创造', '日本新星流'],
      representativeGames: [
        { opponent: '阿部慎一', year: 2018, result: 'win', moves: 50, description: '新生代对前辈的胜利' }
      ],
      quote: '连珠的未来属于创新。',
      aiParams: {
        aggressionWeight: 0.65,
        complexityPreference: 0.80,
        riskTolerance: 0.60,
        openingAggression: 0.70,
        midgameCreativity: 0.85,
        endgamePrecision: 0.75
      },
      avatar: '🇯🇵'
    },
    {
      id: 'lin_shu_hua',
      name: '林书华',
      nameEn: 'Lin Shuhua',
      nationality: '中国',
      birthYear: 1995,
      category: 'rising',
      style: 'balanced',
      elo: 2600,
      titles: ['全国青年冠军', '全国团体赛冠军'],
      achievements: [
        '中国五子棋新生代代表',
        '全国青年锦标赛冠军',
        '全国团体锦标赛冠军成员'
      ],
      openingPreference: ['瑞星', '花月', '斜月', '寒星', '疏星'],
      signatureMoves: ['林氏均衡', '中国新生代均衡型'],
      representativeGames: [
        { opponent: '曹冬', year: 2019, result: 'draw', moves: 75, description: '新生代对决，势均力敌' }
      ],
      quote: '稳健中求突破。',
      aiParams: {
        aggressionWeight: 0.50,
        complexityPreference: 0.60,
        riskTolerance: 0.45,
        openingAggression: 0.50,
        midgameCreativity: 0.65,
        endgamePrecision: 0.80
      },
      avatar: '🇨🇳'
    },
    {
      id: 'martin_petrusek',
      name: 'Martin Petrusek',
      nameEn: 'Martin Petrusek',
      nationality: '捷克',
      birthYear: 1988,
      category: 'rising',
      style: 'aggressive',
      elo: 2580,
      titles: ['捷克冠军', '欧洲青年冠军'],
      achievements: [
        '捷克五子棋领军人物',
        '欧洲青年锦标赛冠军',
        '欧洲新星'
      ],
      openingPreference: ['斜月', '花月', '寒星'],
      signatureMoves: ['Petrusek进攻', '捷克攻击流'],
      representativeGames: [
        { opponent: '欧洲选手', year: 2017, result: 'win', moves: 38, description: '欧洲青年赛夺冠之战' }
      ],
      quote: '捷克棋手也有锋利的爪子。',
      aiParams: {
        aggressionWeight: 0.80,
        complexityPreference: 0.65,
        riskTolerance: 0.70,
        openingAggression: 0.80,
        midgameCreativity: 0.70,
        endgamePrecision: 0.70
      },
      avatar: '🇨🇿'
    },
    {
      id: 'kazys_novikovas',
      name: 'Kazys Novikovas',
      nameEn: 'Kazys Novikovas',
      nationality: '立陶宛',
      birthYear: 1990,
      category: 'rising',
      style: 'creative',
      elo: 2560,
      titles: ['立陶宛冠军', '波罗的海冠军'],
      achievements: [
        '立陶宛五子棋第一人',
        '波罗的海地区冠军',
        '以小国棋手身份在国际舞台崭露头角'
      ],
      openingPreference: ['疏星', '瑞星', '斜月', '花月'],
      signatureMoves: ['Novikovas变例', '波罗的海创造流'],
      representativeGames: [
        { opponent: '欧洲选手', year: 2016, result: 'win', moves: 46, description: '小国大梦想' }
      ],
      quote: '小国也能出大师。',
      aiParams: {
        aggressionWeight: 0.60,
        complexityPreference: 0.75,
        riskTolerance: 0.55,
        openingAggression: 0.65,
        midgameCreativity: 0.80,
        endgamePrecision: 0.75
      },
      avatar: '🇱🇹'
    },
    {
      id: 'takashi_yamaguchi',
      name: '山口高志',
      nameEn: 'Yamaguchi Takashi',
      nationality: '日本',
      birthYear: 1963,
      category: 'legendary',
      style: 'positional',
      elo: 2780,
      titles: ['全日本名人', '日本冠军', 'RIF名人挑战者'],
      achievements: [
        '日本连珠界资深大师',
        '全日本名人获得者',
        'RIF名人赛挑战者',
        '以阵地控制著称'
      ],
      openingPreference: ['瑞星', '寒星', '花月', '疏星'],
      signatureMoves: ['山口体系', '日本阵地控制'],
      representativeGames: [
        { opponent: '中村茂', year: 1995, result: 'draw', moves: 82, description: '经典长局，阵地战巅峰' }
      ],
      quote: '控制棋盘就是控制胜利。',
      aiParams: {
        aggressionWeight: 0.40,
        complexityPreference: 0.55,
        riskTolerance: 0.30,
        openingAggression: 0.35,
        midgameCreativity: 0.60,
        endgamePrecision: 0.92
      },
      avatar: '🇯🇵'
    },
    {
      id: 'kwon_hyuk',
      name: '权赫',
      nameEn: 'Kwon Hyuk',
      nationality: '韩国',
      birthYear: 1987,
      category: 'grandmaster',
      style: 'defensive',
      elo: 2730,
      titles: ['韩国冠军', '亚洲冠军'],
      achievements: [
        '韩国五子棋第一人',
        '亚洲锦标赛冠军',
        '防守反击型棋风代表'
      ],
      openingPreference: ['瑞星', '疏星', '寒星', '花月'],
      signatureMoves: ['权氏防守', '韩国反击流'],
      representativeGames: [
        { opponent: '中国选手', year: 2011, result: 'win', moves: 62, description: '亚洲杯决赛，防守反击教科书' }
      ],
      quote: '让对手进攻，然后一击致命。',
      aiParams: {
        aggressionWeight: 0.25,
        complexityPreference: 0.45,
        riskTolerance: 0.20,
        openingAggression: 0.20,
        midgameCreativity: 0.50,
        endgamePrecision: 0.92
      },
      avatar: '🇰🇷'
    },
    {
      id: 'janos_wagner',
      name: 'Janos Wagner',
      nameEn: 'Janos Wagner',
      nationality: '匈牙利',
      birthYear: 1984,
      category: 'grandmaster',
      style: 'balanced',
      elo: 2690,
      titles: ['匈牙利冠军', '欧洲亚军'],
      achievements: [
        '匈牙利五子棋领军人物',
        '欧洲锦标赛亚军',
        '均衡型棋风代表'
      ],
      openingPreference: ['瑞星', '花月', '斜月', '疏星', '寒星'],
      signatureMoves: ['Wagner均衡', '匈牙利全能型'],
      representativeGames: [
        { opponent: '欧洲选手', year: 2009, result: 'draw', moves: 70, description: '欧洲锦标赛经典对局' }
      ],
      quote: '全能才是真正的强大。',
      aiParams: {
        aggressionWeight: 0.50,
        complexityPreference: 0.55,
        riskTolerance: 0.45,
        openingAggression: 0.50,
        midgameCreativity: 0.65,
        endgamePrecision: 0.82
      },
      avatar: '🇭🇺'
    },
    {
      id: 'erika_karppinen',
      name: 'Erika Karppinen',
      nameEn: 'Erika Karppinen',
      nationality: '芬兰',
      birthYear: 1993,
      category: 'rising',
      style: 'creative',
      elo: 2570,
      titles: ['芬兰冠军', '北欧青年冠军'],
      achievements: [
        '芬兰女子五子棋第一人',
        '北欧青年锦标赛冠军',
        '创造性棋风'
      ],
      openingPreference: ['疏星', '斜月', '瑞星', '花月'],
      signatureMoves: ['Karppinen创造', '芬兰女子流'],
      representativeGames: [
        { opponent: '北欧选手', year: 2018, result: 'win', moves: 48, description: '北欧青年赛夺冠之战' }
      ],
      quote: '用创造力征服棋盘。',
      aiParams: {
        aggressionWeight: 0.60,
        complexityPreference: 0.75,
        riskTolerance: 0.55,
        openingAggression: 0.65,
        midgameCreativity: 0.85,
        endgamePrecision: 0.72
      },
      avatar: '🇫🇮'
    }
  ],

  // ========== Methods ==========
  getPlayer(id) {
    return this.players.find(p => p.id === id);
  },

  getPlayersByStyle(style) {
    return this.players.filter(p => p.style === style);
  },

  getPlayersByCategory(category) {
    return this.players.filter(p => p.category === category);
  },

  getPlayersByNationality(nationality) {
    return this.players.filter(p => p.nationality === nationality);
  },

  getRandomPlayer() {
    return this.players[Math.floor(Math.random() * this.players.length)];
  },

  getPlayersSortedByElo() {
    return [...this.players].sort((a, b) => b.elo - a.elo);
  },

  getStyleRadarData(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return null;
    const params = player.aiParams;
    return {
      labels: ['攻击性', '复杂度偏好', '风险承受', '开局侵略', '中盘创造', '残局精准'],
      data: [
        params.aggressionWeight * 100,
        params.complexityPreference * 100,
        params.riskTolerance * 100,
        params.openingAggression * 100,
        params.midgameCreativity * 100,
        params.endgamePrecision * 100
      ]
    };
  },

  getNationalityRanking() {
    const map = {};
    this.players.forEach(p => {
      if (!map[p.nationality]) map[p.nationality] = { count: 0, totalElo: 0, players: [] };
      map[p.nationality].count++;
      map[p.nationality].totalElo += p.elo;
      map[p.nationality].players.push(p);
    });
    return Object.entries(map)
      .map(([nation, data]) => ({ nationality: nation, count: data.count, avgElo: Math.round(data.totalElo / data.count), players: data.players }))
      .sort((a, b) => b.avgElo - a.avgElo);
  },

  getOpeningStats() {
    const stats = {};
    this.players.forEach(p => {
      p.openingPreference.forEach(op => {
        if (!stats[op]) stats[op] = 0;
        stats[op]++;
      });
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  },

  getPlayerForAI(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return null;
    return {
      name: player.name,
      style: player.style,
      params: player.aiParams,
      openings: player.openingPreference
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProPlayers;
}

/**
 * Nickname Generator for Projects System
 * Generates fun, unique, and applicable nicknames for projects
 */

// Word lists for nickname generation
const WORD_LISTS = {
  adjectives: [
    'swift', 'bright', 'sharp', 'quick', 'solid', 'clear', 'wise', 'strong',
    'bold', 'smart', 'fast', 'cool', 'brave', 'keen', 'bold', 'bright',
    'crisp', 'fresh', 'smooth', 'steady', 'sleek', 'prime', 'core', 'peak'
  ],
  nouns: [
    'fox', 'star', 'gem', 'engine', 'sword', 'fix', 'owl', 'guide',
    'bear', 'wolf', 'eagle', 'lion', 'tiger', 'hawk', 'falcon', 'raven',
    'spark', 'flame', 'storm', 'wave', 'peak', 'ridge', 'cove', 'bay'
  ],
  verbs: [
    'polish', 'tune', 'build', 'craft', 'forge', 'shape', 'mold', 'create',
    'boost', 'launch', 'soar', 'climb', 'dive', 'leap', 'rush', 'flow'
  ],
  tools: [
    'sword', 'hammer', 'key', 'lock', 'bridge', 'ladder', 'compass', 'map',
    'shield', 'bow', 'arrow', 'spear', 'axe', 'pick', 'rope', 'chain'
  ],
  knowledge: [
    'owl', 'sage', 'guide', 'book', 'scroll', 'wisdom', 'light', 'beacon',
    'oracle', 'seer', 'mentor', 'teacher', 'scholar', 'expert', 'master', 'guru'
  ],
  structures: [
    'foundation', 'bridge', 'tower', 'wall', 'gate', 'pillar', 'beam', 'arch',
    'castle', 'fortress', 'palace', 'temple', 'monument', 'statue', 'obelisk', 'spire'
  ]
};

// Technology and function transformations
const TRANSFORMATIONS = {
  technology: {
    'react': 'rocket', 'api': 'arrow', 'database': 'diamond', 'auth': 'guardian',
    'payment': 'treasure', 'search': 'hunter', 'ui': 'interface', 'ux': 'experience',
    'frontend': 'surface', 'backend': 'core', 'server': 'host', 'client': 'guest',
    'mobile': 'pocket', 'web': 'net', 'cloud': 'sky', 'ai': 'mind'
  },
  function: {
    'authentication': 'guardian', 'payment': 'treasure', 'search': 'hunter',
    'admin': 'captain', 'user': 'pilot', 'system': 'engine', 'data': 'vault',
    'security': 'shield', 'monitor': 'watch', 'log': 'record', 'cache': 'store',
    'queue': 'line', 'stream': 'flow', 'sync': 'link', 'export': 'porter'
  }
};

// Project type patterns
const PATTERNS = {
  feature: ['{adjective}-{noun}', '{noun}-{verb}'],
  refactor: ['{verb}-{noun}', '{adjective}-{tool}'],
  bugfix: ['{adjective}-{tool}', '{verb}-{fix}'],
  documentation: ['{adjective}-{knowledge}', '{noun}-{guide}'],
  infrastructure: ['{adjective}-{structure}', '{noun}-{foundation}']
};

// Phonetic similarity groups (words that sound similar)
const PHONETIC_GROUPS = {
  'swift': ['shift', 'gift', 'lift', 'drift'],
  'fox': ['box', 'locks', 'rocks', 'socks'],
  'star': ['car', 'bar', 'far', 'jar'],
  'gem': ['them', 'stem', 'hem', 'rem'],
  'engine': ['margin', 'origin', 'begin', 'win'],
  'sword': ['word', 'board', 'lord', 'cord'],
  'bright': ['light', 'right', 'sight', 'tight'],
  'quick': ['thick', 'pick', 'tick', 'wick']
};

class NicknameGenerator {
  constructor() {
    this.usedNicknames = new Set();
    this.dailyNicknames = new Set();
    this.lastResetDate = new Date().toDateString();
  }

  /**
   * Generate a nickname for a project
   * @param {Object} project - Project object with metadata
   * @returns {string} Generated nickname
   */
  generateNickname(project) {
    this.resetDailyContext();
    
    const projectType = this.extractProjectType(project);
    const keyTerms = this.extractKeyTerms(project);
    
    // Generate candidate nicknames
    const candidates = this.generateCandidates(projectType, keyTerms);
    
    // Find unique nickname
    for (const candidate of candidates) {
      if (this.isUnique(candidate)) {
        this.registerNickname(candidate);
        return candidate;
      }
    }
    
    // Fallback: generate random unique nickname
    return this.generateFallbackNickname();
  }

  /**
   * Extract project type from project metadata
   */
  extractProjectType(project) {
    const projectId = project.metadata?.projectId || '';
    if (projectId.startsWith('feature-')) return 'feature';
    if (projectId.startsWith('refactor-')) return 'refactor';
    if (projectId.startsWith('bugfix-')) return 'bugfix';
    if (projectId.startsWith('documentation-')) return 'documentation';
    if (projectId.startsWith('infrastructure-')) return 'infrastructure';
    return 'feature'; // default
  }

  /**
   * Extract key terms from project title and description
   */
  extractKeyTerms(project) {
    const title = project.metadata?.title || '';
    const description = project.humanContext?.problemStatement || '';
    const text = `${title} ${description}`.toLowerCase();
    
    const terms = [];
    
    // Check for technology terms
    for (const [tech, transform] of Object.entries(TRANSFORMATIONS.technology)) {
      if (text.includes(tech)) {
        terms.push(transform);
      }
    }
    
    // Check for function terms
    for (const [func, transform] of Object.entries(TRANSFORMATIONS.function)) {
      if (text.includes(func)) {
        terms.push(transform);
      }
    }
    
    return terms;
  }

  /**
   * Generate candidate nicknames based on project type and key terms
   */
  generateCandidates(projectType, keyTerms) {
    const candidates = [];
    const patterns = PATTERNS[projectType] || PATTERNS.feature;
    
    // Generate from patterns
    for (const pattern of patterns) {
      const parts = pattern.split('-');
      if (parts.length === 2) {
        const [type1, type2] = parts;
        const words1 = WORD_LISTS[type1.replace(/[{}]/g, '')] || [];
        const words2 = WORD_LISTS[type2.replace(/[{}]/g, '')] || [];
        
        for (const word1 of words1.slice(0, 5)) {
          for (const word2 of words2.slice(0, 5)) {
            candidates.push(`${word1}-${word2}`);
          }
        }
      }
    }
    
    // Generate from key terms
    for (const term of keyTerms) {
      for (const adjective of WORD_LISTS.adjectives.slice(0, 3)) {
        candidates.push(`${adjective}-${term}`);
      }
      for (const noun of WORD_LISTS.nouns.slice(0, 3)) {
        candidates.push(`${term}-${noun}`);
      }
    }
    
    // Shuffle and return top candidates
    return this.shuffleArray(candidates).slice(0, 10);
  }

  /**
   * Check if nickname is unique (globally and phonetically)
   */
  isUnique(nickname) {
    // Check global uniqueness
    if (this.usedNicknames.has(nickname)) {
      return false;
    }
    
    // Check daily phonetic uniqueness
    if (this.isPhoneticallySimilar(nickname, this.dailyNicknames)) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if nickname is phonetically similar to existing nicknames
   */
  isPhoneticallySimilar(nickname, existingNicknames) {
    const words = nickname.split('-');
    
    for (const existing of existingNicknames) {
      const existingWords = existing.split('-');
      
      for (const word of words) {
        for (const existingWord of existingWords) {
          if (this.arePhoneticallySimilar(word, existingWord)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Check if two words are phonetically similar
   */
  arePhoneticallySimilar(word1, word2) {
    // Check if words are in the same phonetic group
    for (const [group, similarWords] of Object.entries(PHONETIC_GROUPS)) {
      if (similarWords.includes(word1) && similarWords.includes(word2)) {
        return true;
      }
      if (word1 === group && similarWords.includes(word2)) {
        return true;
      }
      if (word2 === group && similarWords.includes(word1)) {
        return true;
      }
    }
    
    // Check for rhyming (simple heuristic)
    if (word1.length >= 3 && word2.length >= 3) {
      const suffix1 = word1.slice(-2);
      const suffix2 = word2.slice(-2);
      if (suffix1 === suffix2) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Register a nickname as used
   */
  registerNickname(nickname) {
    this.usedNicknames.add(nickname);
    this.dailyNicknames.add(nickname);
  }

  /**
   * Generate fallback nickname when all candidates are taken
   */
  generateFallbackNickname() {
    let attempts = 0;
    while (attempts < 100) {
      const adjective = this.getRandomWord(WORD_LISTS.adjectives);
      const noun = this.getRandomWord(WORD_LISTS.nouns);
      const nickname = `${adjective}-${noun}`;
      
      if (this.isUnique(nickname)) {
        this.registerNickname(nickname);
        return nickname;
      }
      
      attempts++;
    }
    
    // Ultimate fallback
    const timestamp = Date.now().toString().slice(-4);
    return `project-${timestamp}`;
  }

  /**
   * Get random word from array
   */
  getRandomWord(words) {
    return words[Math.floor(Math.random() * words.length)];
  }

  /**
   * Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Reset daily context if new day
   */
  resetDailyContext() {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyNicknames.clear();
      this.lastResetDate = today;
    }
  }

  /**
   * Validate nickname format and uniqueness
   */
  validateNickname(nickname) {
    // Check format
    if (!/^[a-zA-Z]+(-[a-zA-Z]+)*$/.test(nickname)) {
      return { valid: false, reason: 'Invalid format' };
    }
    
    if (nickname.length < 3 || nickname.length > 20) {
      return { valid: false, reason: 'Invalid length' };
    }
    
    // Check uniqueness
    if (this.usedNicknames.has(nickname)) {
      return { valid: false, reason: 'Nickname already used' };
    }
    
    if (this.isPhoneticallySimilar(nickname, this.dailyNicknames)) {
      return { valid: false, reason: 'Phonetically similar to existing nickname' };
    }
    
    return { valid: true };
  }

  /**
   * Get all used nicknames
   */
  getUsedNicknames() {
    return Array.from(this.usedNicknames);
  }

  /**
   * Get daily nicknames
   */
  getDailyNicknames() {
    return Array.from(this.dailyNicknames);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NicknameGenerator;
}

// Example usage
if (typeof window === 'undefined' && require.main === module) {
  const generator = new NicknameGenerator();
  
  // Test with sample projects
  const sampleProjects = [
    {
      metadata: { projectId: 'feature-user-auth-v1.0.0', title: 'User Authentication System' },
      humanContext: { problemStatement: 'Implement secure user authentication with JWT tokens' }
    },
    {
      metadata: { projectId: 'refactor-mcp-market-v2.1.0', title: 'MCP Market Refactoring' },
      humanContext: { problemStatement: 'Refactor the MCP market component for better performance' }
    },
    {
      metadata: { projectId: 'bugfix-login-flow-v1.0.1', title: 'Login Flow Bug Fix' },
      humanContext: { problemStatement: 'Fix authentication flow issues in login process' }
    }
  ];
  
  console.log('Generated Nicknames:');
  sampleProjects.forEach(project => {
    const nickname = generator.generateNickname(project);
    console.log(`${project.metadata.projectId}: ${nickname}`);
  });
  
  console.log('\nUsed Nicknames:', generator.getUsedNicknames());
  console.log('Daily Nicknames:', generator.getDailyNicknames());
}

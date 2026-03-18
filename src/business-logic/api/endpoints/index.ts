export const API = {
  quests: {
    daily: '/quests/daily',          // GET ?branch=career&stamina=80
    complete: (id: string) => `/quests/${id}/complete`, // POST
  },
  skillTree: {
    nodes: '/skill-tree/nodes',      // GET
    updateNode: (id: string) => `/skill-tree/nodes/${id}`, // PATCH
  },
  challenges: {
    list: '/challenges',             // GET
    join: (id: string) => `/challenges/${id}/join`, // POST
    leave: (id: string) => `/challenges/${id}/leave`, // POST
  },
  assessment: {
    questions: '/assessment/questions', // GET
  },
  user: {
    me: '/user/me',                  // GET
    update: '/user/me',              // PATCH
  },
  customTrees: {
    list: '/custom-trees',                   // GET
    seed: '/custom-trees/seed',              // POST (first-time demo data)
  },
  roadmap: {
    list: '/roadmap/milestones',                        // GET
    create: '/roadmap/milestones',                      // POST
    update: (id: string) => `/roadmap/milestones/${id}`, // PATCH
    delete: (id: string) => `/roadmap/milestones/${id}`, // DELETE
  },
} as const;

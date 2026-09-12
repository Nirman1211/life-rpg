import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting LIFE RPG database seed...");

  // 1. Clean existing records for a fresh seed
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.xPTransaction.deleteMany();
  await prisma.questCompletion.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.bossQuest.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.questCategory.deleteMany();
  await prisma.attributes.deleteMany();
  await prisma.character.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.user.deleteMany();

  // 2. Default Quest Categories
  const categories = [
    { name: "Coding & Tech", slug: "coding", icon: "Code2", color: "#00f0ff", defaultAttribute: "intelligence" },
    { name: "Academic & Study", slug: "study", icon: "GraduationCap", color: "#60a5fa", defaultAttribute: "intelligence" },
    { name: "Fitness & Strength", slug: "fitness", icon: "Dumbbell", color: "#ef4444", defaultAttribute: "strength" },
    { name: "Reading & Wisdom", slug: "reading", icon: "BookOpen", color: "#a855f7", defaultAttribute: "wisdom" },
    { name: "Mindfulness & Zen", slug: "mindfulness", icon: "Brain", color: "#10b981", defaultAttribute: "focus" },
    { name: "Career & Business", slug: "career", icon: "Briefcase", color: "#f59e0b", defaultAttribute: "discipline" },
    { name: "Creativity & Art", slug: "creativity", icon: "Palette", color: "#ec4899", defaultAttribute: "creativity" },
    { name: "Finance & Wealth", slug: "finance", icon: "Coins", color: "#eab308", defaultAttribute: "discipline" },
    { name: "Habits & Routine", slug: "habits", icon: "CheckCircle2", color: "#14b8a6", defaultAttribute: "consistency" },
    { name: "Health & Vitality", slug: "health", icon: "HeartPulse", color: "#f43f5e", defaultAttribute: "vitality" },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.questCategory.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ Seeded ${categories.length} Quest Categories`);

  // 3. System Achievements
  const achievements = [
    {
      code: "FIRST_BLOOD",
      name: "First Blood",
      description: "Complete your very first quest in the realm.",
      icon: "Sword",
      rarity: "COMMON",
      requirementType: "QUEST_COUNT",
      requirementValue: 1,
      xpReward: 50,
      goldReward: 25,
    },
    {
      code: "WARRIOR_PATH",
      name: "Path of the Warrior",
      description: "Complete 10 fitness and strength quests.",
      icon: "ShieldAlert",
      rarity: "COMMON",
      requirementType: "QUEST_COUNT",
      requirementValue: 10,
      xpReward: 100,
      goldReward: 50,
    },
    {
      code: "SCHOLAR_MIND",
      name: "Sage of Knowledge",
      description: "Reach 30 Intelligence through coding and study.",
      icon: "Scroll",
      rarity: "RARE",
      requirementType: "ATTRIBUTE_REACHED",
      requirementValue: 30,
      xpReward: 150,
      goldReward: 75,
    },
    {
      code: "STREAK_FLAME",
      name: "Kindled Spirit",
      description: "Maintain a consecutive streak for 7 days.",
      icon: "Flame",
      rarity: "RARE",
      requirementType: "STREAK_DAYS",
      requirementValue: 7,
      xpReward: 200,
      goldReward: 100,
    },
    {
      code: "IRON_WILL",
      name: "Iron Will",
      description: "Maintain an unstoppable streak of 30 consecutive days.",
      icon: "ShieldCheck",
      rarity: "EPIC",
      requirementType: "STREAK_DAYS",
      requirementValue: 30,
      xpReward: 500,
      goldReward: 300,
    },
    {
      code: "CENTURION",
      name: "Centurion",
      description: "Attain Character Level 10.",
      icon: "Crown",
      rarity: "EPIC",
      requirementType: "LEVEL_REACHED",
      requirementValue: 10,
      xpReward: 400,
      goldReward: 200,
    },
    {
      code: "BOSS_SLAYER",
      name: "Titan Slayer",
      description: "Slay your first mighty Boss Quest.",
      icon: "Skull",
      rarity: "EPIC",
      requirementType: "BOSS_DEFEATED",
      requirementValue: 1,
      xpReward: 600,
      goldReward: 350,
    },
    {
      code: "GOLD_HOARDER",
      name: "Midas Touch",
      description: "Amass 500 Gold in your treasury.",
      icon: "Sparkles",
      rarity: "RARE",
      requirementType: "GOLD_EARNED",
      requirementValue: 500,
      xpReward: 150,
      goldReward: 100,
    },
    {
      code: "QUEST_MASTER",
      name: "Master of Tasks",
      description: "Successfully complete 50 quests.",
      icon: "Trophy",
      rarity: "EPIC",
      requirementType: "QUEST_COUNT",
      requirementValue: 50,
      xpReward: 500,
      goldReward: 250,
    },
    {
      code: "ZEN_MASTER",
      name: "Still Mind",
      description: "Reach 30 Focus through deep work and meditation.",
      icon: "Sparkle",
      rarity: "RARE",
      requirementType: "ATTRIBUTE_REACHED",
      requirementValue: 30,
      xpReward: 150,
      goldReward: 75,
    },
    {
      code: "LIVING_LEGEND",
      name: "Living Legend",
      description: "Ascend to Character Level 25.",
      icon: "Medal",
      rarity: "LEGENDARY",
      requirementType: "LEVEL_REACHED",
      requirementValue: 25,
      xpReward: 1500,
      goldReward: 1000,
    },
    {
      code: "APEX_ASCENDANT",
      name: "Apex Ascendant",
      description: "Complete 100 total quests across all disciplines.",
      icon: "Zap",
      rarity: "LEGENDARY",
      requirementType: "QUEST_COUNT",
      requirementValue: 100,
      xpReward: 2000,
      goldReward: 1500,
    },
  ];

  const achievementMap = new Map<string, string>();
  for (const ach of achievements) {
    const created = await prisma.achievement.create({ data: ach });
    achievementMap.set(ach.code, created.id);
  }
  console.log(`✅ Seeded ${achievements.length} Achievements`);

  // 4. Rewards Catalog (Themes, Titles, Frames, Boosters)
  const rewards = [
    // Themes
    {
      name: "Cyberpunk 2099 Theme",
      description: "Neon cyan and deep obsidian holographic UI palette.",
      cost: 0,
      rarity: "COMMON",
      category: "THEME",
      icon: "Laptop",
      effectType: "THEME_ID",
      effectValue: "cyberpunk",
      isDefault: true,
    },
    {
      name: "Arcane Void Theme",
      description: "Mystic purple gradients and ethereal starfield glow.",
      cost: 150,
      rarity: "RARE",
      category: "THEME",
      icon: "Sparkles",
      effectType: "THEME_ID",
      effectValue: "arcane",
      isDefault: false,
    },
    {
      name: "Emerald Forest Theme",
      description: "Restorative jade tones inspired by ancient groves.",
      cost: 150,
      rarity: "RARE",
      category: "THEME",
      icon: "Leaf",
      effectType: "THEME_ID",
      effectValue: "emerald",
      isDefault: false,
    },
    {
      name: "Neon Synthwave Theme",
      description: "Hot magenta and laser cyan retrofuturistic HUD.",
      cost: 300,
      rarity: "EPIC",
      category: "THEME",
      icon: "Flame",
      effectType: "THEME_ID",
      effectValue: "neon",
      isDefault: false,
    },
    {
      name: "Midnight Obsidian Theme",
      description: "Ultra-clean stealth dark mode with diamond gold trim.",
      cost: 500,
      rarity: "LEGENDARY",
      category: "THEME",
      icon: "Moon",
      effectType: "THEME_ID",
      effectValue: "midnight",
      isDefault: false,
    },
    // Titles
    {
      name: "Novice Wanderer",
      description: "A brave soul stepping beyond the threshold of ordinary life.",
      cost: 0,
      rarity: "COMMON",
      category: "TITLE",
      icon: "Compass",
      effectType: "TITLE_STRING",
      effectValue: "Novice Wanderer",
      isDefault: true,
    },
    {
      name: "Code Crusader",
      description: "Vanqisher of runtime bugs and architect of digital realms.",
      cost: 120,
      rarity: "RARE",
      category: "TITLE",
      icon: "Terminal",
      effectType: "TITLE_STRING",
      effectValue: "Code Crusader",
      isDefault: false,
    },
    {
      name: "Iron Disciplinarian",
      description: "Unshakable focus and indomitable consistency.",
      cost: 200,
      rarity: "RARE",
      category: "TITLE",
      icon: "Shield",
      effectType: "TITLE_STRING",
      effectValue: "Iron Disciplinarian",
      isDefault: false,
    },
    {
      name: "Grand Scholar",
      description: "A master of deep concepts, wisdom, and lifelong learning.",
      cost: 250,
      rarity: "EPIC",
      category: "TITLE",
      icon: "BookOpen",
      effectType: "TITLE_STRING",
      effectValue: "Grand Scholar",
      isDefault: false,
    },
    {
      name: "Apex Transcendent",
      description: "The pinnacle of real-world productivity mastery.",
      cost: 800,
      rarity: "LEGENDARY",
      category: "TITLE",
      icon: "Crown",
      effectType: "TITLE_STRING",
      effectValue: "Apex Transcendent",
      isDefault: false,
    },
    // Avatar Frames
    {
      name: "Neon Cyber Ring",
      description: "A rotating cyan laser perimeter encasing your avatar.",
      cost: 100,
      rarity: "COMMON",
      category: "AVATAR_FRAME",
      icon: "CircleDot",
      effectType: "FRAME_ID",
      effectValue: "frame-cyan",
      isDefault: false,
    },
    {
      name: "Gilded Aureole",
      description: "A radiant gold halo displaying your high status.",
      cost: 350,
      rarity: "EPIC",
      category: "AVATAR_FRAME",
      icon: "Sun",
      effectType: "FRAME_ID",
      effectValue: "frame-gold",
      isDefault: false,
    },
    {
      name: "Violet Void Aura",
      description: "Swirling cosmic matter pulsing with dark energy.",
      cost: 450,
      rarity: "EPIC",
      category: "AVATAR_FRAME",
      icon: "Eye",
      effectType: "FRAME_ID",
      effectValue: "frame-purple",
      isDefault: false,
    },
    {
      name: "Inferno Dragon Crest",
      description: "Roaring flames enveloping your character silhouette.",
      cost: 750,
      rarity: "LEGENDARY",
      category: "AVATAR_FRAME",
      icon: "Flame",
      effectType: "FRAME_ID",
      effectValue: "frame-inferno",
      isDefault: false,
    },
    // Boosters
    {
      name: "Elixir of Focus",
      description: "Instant mental clarity (+10 Focus point surge).",
      cost: 75,
      rarity: "COMMON",
      category: "BOOSTER",
      icon: "Zap",
      effectType: "BOOST",
      effectValue: "focus:+10",
      isDefault: false,
    },
    {
      name: "Ambrosia of the Gods",
      description: "A mythical nectar granting +100 bonus XP upon consumption.",
      cost: 200,
      rarity: "RARE",
      category: "BOOSTER",
      icon: "Sparkle",
      effectType: "BOOST",
      effectValue: "xp:+100",
      isDefault: false,
    },
  ];

  const rewardMap = new Map<string, string>();
  for (const rew of rewards) {
    const created = await prisma.reward.create({ data: rew });
    rewardMap.set(rew.name, created.id);
  }
  console.log(`✅ Seeded ${rewards.length} Shop Rewards`);

  // 5. Seed Leaderboard Community Players
  const communityUsers = [
    {
      email: "valkyrie@liferpg.app",
      username: "Valkyrie_99",
      displayName: "Valerie Kane",
      avatarUrl: "/avatars/avatar-valkyrie.png",
      level: 18,
      totalXp: 9240,
      gold: 1450,
      rank: "Elite",
      streak: 24,
      attributes: { strength: 42, intelligence: 38, wisdom: 35, discipline: 45, vitality: 40, focus: 39, creativity: 30, consistency: 48 },
    },
    {
      email: "codephantom@liferpg.app",
      username: "CodePhantom",
      displayName: "Kai Takahashi",
      avatarUrl: "/avatars/avatar-ninja.png",
      level: 15,
      totalXp: 7120,
      gold: 980,
      rank: "Elite",
      streak: 19,
      attributes: { strength: 22, intelligence: 55, wisdom: 42, discipline: 38, vitality: 28, focus: 45, creativity: 40, consistency: 36 },
    },
    {
      email: "irontitan@liferpg.app",
      username: "IronTitan",
      displayName: "Marcus Vance",
      avatarUrl: "/avatars/avatar-paladin.png",
      level: 14,
      totalXp: 6350,
      gold: 820,
      rank: "Warrior",
      streak: 31,
      attributes: { strength: 60, intelligence: 25, wisdom: 28, discipline: 48, vitality: 52, focus: 30, creativity: 20, consistency: 55 },
    },
    {
      email: "zenmonk@liferpg.app",
      username: "ZenMonk",
      displayName: "Tenzin Norbu",
      avatarUrl: "/avatars/avatar-mage.png",
      level: 12,
      totalXp: 4890,
      gold: 670,
      rank: "Warrior",
      streak: 14,
      attributes: { strength: 25, intelligence: 36, wisdom: 48, discipline: 40, vitality: 38, focus: 58, creativity: 32, consistency: 35 },
    },
    {
      email: "pixelmage@liferpg.app",
      username: "PixelMage",
      displayName: "Elena Rostova",
      avatarUrl: "/avatars/avatar-elf.png",
      level: 8,
      totalXp: 2850,
      gold: 410,
      rank: "Adventurer",
      streak: 8,
      attributes: { strength: 18, intelligence: 32, wisdom: 28, discipline: 24, vitality: 22, focus: 30, creativity: 48, consistency: 22 },
    },
  ];

  const defaultPassword = await bcrypt.hash("password123", 10);

  for (const comm of communityUsers) {
    const user = await prisma.user.create({
      data: {
        email: comm.email,
        passwordHash: defaultPassword,
        profile: {
          create: {
            username: comm.username,
            displayName: comm.displayName,
            avatarUrl: comm.avatarUrl,
            bio: "Active adventurer leveling up every single day.",
          },
        },
        character: {
          create: {
            level: comm.level,
            currentXp: 200,
            totalXp: comm.totalXp,
            gold: comm.gold,
            rank: comm.rank,
            attributes: {
              create: comm.attributes,
            },
          },
        },
        streak: {
          create: {
            currentStreak: comm.streak,
            longestStreak: comm.streak + 5,
            lastActiveDate: new Date().toISOString().split("T")[0],
          },
        },
        settings: {
          create: {
            theme: "cyberpunk",
            soundEnabled: true,
            publicProfile: true,
            showOnLeaderboard: true,
          },
        },
      },
    });
  }
  console.log(`✅ Seeded ${communityUsers.length} Community Leaderboard Users`);

  // 6. Seed Primary Demo User (demo@liferpg.app) for Instant Judge Access
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@liferpg.app",
      passwordHash: defaultPassword,
      profile: {
        create: {
          username: "CyberKnight",
          displayName: "Alexander Vance",
          avatarUrl: "/avatars/warrior.png",
          bio: "Senior code artisan and reality conqueror. Turning daily discipline into legendary stats.",
          timezone: "UTC",
        },
      },
      character: {
        create: {
          level: 4,
          currentXp: 180,
          totalXp: 780,
          gold: 380,
          health: 100,
          maxHealth: 100,
          rank: "Adventurer",
          attributes: {
            create: {
              strength: 24,
              intelligence: 38,
              wisdom: 22,
              discipline: 30,
              vitality: 20,
              focus: 26,
              creativity: 18,
              consistency: 28,
            },
          },
        },
      },
      streak: {
        create: {
          currentStreak: 6,
          longestStreak: 12,
          lastActiveDate: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Active yesterday, ready for today's streak increment!
        },
      },
      settings: {
        create: {
          theme: "cyberpunk",
          soundEnabled: true,
          publicProfile: true,
          showOnLeaderboard: true,
        },
      },
    },
  });

  // Give Demo user default equipped theme & title
  const defaultTheme = await prisma.reward.findFirst({ where: { effectValue: "cyberpunk" } });
  const defaultTitle = await prisma.reward.findFirst({ where: { effectValue: "Novice Wanderer" } });
  if (defaultTheme) {
    await prisma.inventory.create({
      data: { userId: demoUser.id, rewardId: defaultTheme.id, isEquipped: true },
    });
  }
  if (defaultTitle) {
    await prisma.inventory.create({
      data: { userId: demoUser.id, rewardId: defaultTitle.id, isEquipped: true },
    });
  }

  // Unlock First Blood achievement for demo user
  const firstBloodAch = achievementMap.get("FIRST_BLOOD");
  if (firstBloodAch) {
    await prisma.userAchievement.create({
      data: { userId: demoUser.id, achievementId: firstBloodAch },
    });
  }

  // Create Active Boss Quest for Demo User: "Complete Machine Learning Project"
  const bossQuest = await prisma.bossQuest.create({
    data: {
      userId: demoUser.id,
      title: "Conquer Machine Learning Pipeline",
      description: "Architect and ship an end-to-end predictive machine learning pipeline with production deployment.",
      bossName: "The Overfitting Hydra",
      bossAvatar: "/avatars/boss-dragon.png",
      totalHp: 100,
      currentHp: 50, // 2 subquests completed, 2 remaining!
      xpReward: 500,
      goldReward: 250,
      isDefeated: false,
    },
  });

  // Quests for Demo User
  const codingCatId = categoryMap.get("coding");
  const fitnessCatId = categoryMap.get("fitness");
  const readingCatId = categoryMap.get("reading");
  const mindfulnessCatId = categoryMap.get("mindfulness");

  // Daily / General Quests
  await prisma.quest.createMany({
    data: [
      {
        userId: demoUser.id,
        categoryId: codingCatId,
        title: "Solve 2 LeetCode Hard DSA Problems",
        description: "Focus on Dynamic Programming on Trees and Dijkstra shortest path.",
        difficulty: "HARD",
        status: "TODO",
        recurrence: "DAILY",
        xpReward: 80,
        goldReward: 40,
        attributeReward: 5,
        attributeType: "intelligence",
        estimatedMins: 60,
      },
      {
        userId: demoUser.id,
        categoryId: fitnessCatId,
        title: "Morning Heavy Deadlift & Calisthenics",
        description: "5 sets of 5 deadlifts followed by 50 weighted dips and pull-ups.",
        difficulty: "NORMAL",
        status: "TODO",
        recurrence: "DAILY",
        xpReward: 50,
        goldReward: 25,
        attributeReward: 4,
        attributeType: "strength",
        estimatedMins: 45,
      },
      {
        userId: demoUser.id,
        categoryId: readingCatId,
        title: "Read Chapter 4 of 'Designing Data-Intensive Apps'",
        description: "Encoding and Evolution: Protocol Buffers vs Avro schemas.",
        difficulty: "NORMAL",
        status: "TODO",
        recurrence: "ONCE",
        xpReward: 45,
        goldReward: 20,
        attributeReward: 3,
        attributeType: "wisdom",
        estimatedMins: 35,
      },
      {
        userId: demoUser.id,
        categoryId: mindfulnessCatId,
        title: "20-Minute Vipassana Meditation",
        description: "Deep breath mindfulness and focused attention training.",
        difficulty: "EASY",
        status: "TODO",
        recurrence: "DAILY",
        xpReward: 25,
        goldReward: 15,
        attributeReward: 3,
        attributeType: "focus",
        estimatedMins: 20,
      },
      // Boss Sub-Quests
      {
        userId: demoUser.id,
        categoryId: codingCatId,
        bossQuestId: bossQuest.id,
        title: "[Boss Phase 1] Data Ingestion & Cleansing",
        description: "Ingest tabular datasets and handle missing values & outlier clipping.",
        difficulty: "NORMAL",
        status: "COMPLETED",
        recurrence: "ONCE",
        xpReward: 60,
        goldReward: 30,
        attributeReward: 4,
        attributeType: "intelligence",
        completedAt: new Date(Date.now() - 172800000),
      },
      {
        userId: demoUser.id,
        categoryId: codingCatId,
        bossQuestId: bossQuest.id,
        title: "[Boss Phase 2] Exploratory Data Analysis & Features",
        description: "Correlation heatmaps, mutual info score, and categorical target encoding.",
        difficulty: "HARD",
        status: "COMPLETED",
        recurrence: "ONCE",
        xpReward: 90,
        goldReward: 45,
        attributeReward: 5,
        attributeType: "intelligence",
        completedAt: new Date(Date.now() - 86400000),
      },
      {
        userId: demoUser.id,
        categoryId: codingCatId,
        bossQuestId: bossQuest.id,
        title: "[Boss Phase 3] Hyperparameter Tuning & Cross-Validation",
        description: "Grid search with 5-fold CV to optimize LightGBM and XGBoost models.",
        difficulty: "EPIC",
        status: "TODO",
        recurrence: "ONCE",
        xpReward: 180,
        goldReward: 80,
        attributeReward: 8,
        attributeType: "intelligence",
      },
      {
        userId: demoUser.id,
        categoryId: codingCatId,
        bossQuestId: bossQuest.id,
        title: "[Boss Phase 4] Deploy FastAPI Model Inference Endpoint",
        description: "Containerize model with Docker and verify p99 latency < 20ms.",
        difficulty: "LEGENDARY",
        status: "TODO",
        recurrence: "ONCE",
        xpReward: 250,
        goldReward: 120,
        attributeReward: 10,
        attributeType: "intelligence",
      },
    ]
  });

  // Recent Activity Logs for Demo User
  await prisma.activityLog.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "QUEST_COMPLETED",
        title: "Completed Boss Phase 2",
        description: "Finished 'Exploratory Data Analysis & Features' with high precision.",
        xpDelta: 90,
        goldDelta: 45,
        attributeDelta: 5,
        attributeType: "intelligence",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        userId: demoUser.id,
        type: "LEVEL_UP",
        title: "Level Up: Level 4 Reached!",
        description: "Ascended to Level 4. Unlocked Adventurer rank and new store rewards.",
        xpDelta: 0,
        goldDelta: 100,
        attributeDelta: 0,
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        userId: demoUser.id,
        type: "ACHIEVEMENT_UNLOCKED",
        title: "Achievement: First Blood",
        description: "Earned badge for completing your first quest.",
        xpDelta: 50,
        goldDelta: 25,
        createdAt: new Date(Date.now() - 172800000),
      },
    ],
  });

  // Welcome Notification
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      title: "Welcome to LIFE RPG, Champion!",
      message: "Your journey begins now. Complete daily quests, level up your attributes, and conquer the boss!",
      type: "INFO",
      read: false,
    },
  });

  console.log(`✅ Seeded Demo User: demo@liferpg.app (Password: password123) with Quests, Boss Battles, and Activity!`);
  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

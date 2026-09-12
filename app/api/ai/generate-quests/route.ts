import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

const GenerateQuestSchema = z.object({
  goal: z.string().min(3, "Goal must be at least 3 characters").max(200),
  difficultyPreference: z.enum(["BALANCED", "INTENSE", "CASUAL"]).optional().default("BALANCED"),
});

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const { goal, difficultyPreference } = GenerateQuestSchema.parse(body);

    const apiKey = process.env.AI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `You are an RPG Game Master. The user has a real-world productivity goal: "${goal}".
Break down this goal into 4 to 5 sequential RPG quests.
Format strictly as JSON array with objects matching:
[
  {
    "title": "Quest Title",
    "description": "Short tactical objective (1 sentence)",
    "difficulty": "EASY" | "NORMAL" | "HARD" | "EPIC",
    "attributeType": "strength" | "intelligence" | "wisdom" | "discipline" | "vitality" | "focus" | "creativity" | "consistency",
    "estimatedMins": number
  }
]`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (geminiRes.ok) {
          const resData = await geminiRes.json();
          const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return apiSuccess({
                quests: parsed,
                source: "AI_GENERATED",
              });
            }
          }
        }
      } catch (aiErr) {
        console.warn("AI generation call encountered issue, falling back to heuristic engine:", aiErr);
      }
    }

    // Heuristic Smart Fallback Engine
    const lowerGoal = goal.toLowerCase();
    let decomposedQuests = [];

    if (lowerGoal.includes("code") || lowerGoal.includes("program") || lowerGoal.includes("machine learning") || lowerGoal.includes("ai") || lowerGoal.includes("dsa")) {
      decomposedQuests = [
        {
          title: `Study Foundations & Architecture for ${goal}`,
          description: "Read documentation and map out core components and algorithms.",
          difficulty: "NORMAL",
          attributeType: "intelligence",
          estimatedMins: 45,
        },
        {
          title: `Build Core Prototype & Data Flow`,
          description: "Write initial implementation scripts and solve the primary logic bottleneck.",
          difficulty: "HARD",
          attributeType: "intelligence",
          estimatedMins: 60,
        },
        {
          title: `Unit Test & Refactor Edge Cases`,
          description: "Write automated tests and eliminate any potential bugs or regressions.",
          difficulty: "NORMAL",
          attributeType: "discipline",
          estimatedMins: 35,
        },
        {
          title: `Deploy and Benchmark Performance`,
          description: "Containerize and deploy the project with benchmark metrics logging.",
          difficulty: "EPIC",
          attributeType: "intelligence",
          estimatedMins: 75,
        },
      ];
    } else if (lowerGoal.includes("gym") || lowerGoal.includes("workout") || lowerGoal.includes("fit") || lowerGoal.includes("run")) {
      decomposedQuests = [
        {
          title: `Dynamic Warmup & Mobility Drill`,
          description: "Perform 10 minutes of active stretching and joint preparation.",
          difficulty: "EASY",
          attributeType: "vitality",
          estimatedMins: 15,
        },
        {
          title: `Primary Progressive Overload Compound Session`,
          description: "Execute 4 heavy sets at targeted RPE intensity.",
          difficulty: "HARD",
          attributeType: "strength",
          estimatedMins: 45,
        },
        {
          title: `Core & Accessory Super-set`,
          description: "Complete 3 rounds of functional core and stabilizing endurance drills.",
          difficulty: "NORMAL",
          attributeType: "strength",
          estimatedMins: 25,
        },
        {
          title: `Post-Workout Hydration & Protein Synthesis`,
          description: "Hydrate with electrolytes and consume optimal recovery nutrition.",
          difficulty: "EASY",
          attributeType: "vitality",
          estimatedMins: 15,
        },
      ];
    } else if (lowerGoal.includes("read") || lowerGoal.includes("book") || lowerGoal.includes("study") || lowerGoal.includes("exam")) {
      decomposedQuests = [
        {
          title: `Deep Reading: Part 1 for ${goal}`,
          description: "Read first 25 pages without phone distractions or interruptions.",
          difficulty: "NORMAL",
          attributeType: "wisdom",
          estimatedMins: 40,
        },
        {
          title: `Synthesize Key Mental Models & Summary`,
          description: "Write down 3 core takeaways and diagrams in your personal notebook.",
          difficulty: "NORMAL",
          attributeType: "focus",
          estimatedMins: 25,
        },
        {
          title: `Active Recall & Flashcard Drilling`,
          description: "Test understanding using spaced repetition or self-inquiry.",
          difficulty: "HARD",
          attributeType: "intelligence",
          estimatedMins: 30,
        },
      ];
    } else {
      decomposedQuests = [
        {
          title: `Phase 1: Research & Scope ${goal}`,
          description: "Break down prerequisites and create a structured checklist.",
          difficulty: "EASY",
          attributeType: "focus",
          estimatedMins: 25,
        },
        {
          title: `Phase 2: Focused Execution Block`,
          description: "45 minutes of uninterrupted deep work dedicated directly to the objective.",
          difficulty: "NORMAL",
          attributeType: "discipline",
          estimatedMins: 45,
        },
        {
          title: `Phase 3: Milestone Review & Polish`,
          description: "Refine outputs and verify completeness against quality standards.",
          difficulty: "HARD",
          attributeType: "creativity",
          estimatedMins: 40,
        },
        {
          title: `Phase 4: Habit Anchor & Retrospective`,
          description: "Reflect on lessons learned and log consistency streak.",
          difficulty: "EASY",
          attributeType: "consistency",
          estimatedMins: 15,
        },
      ];
    }

    return apiSuccess({
      quests: decomposedQuests,
      source: "HEURISTIC_ENGINE",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

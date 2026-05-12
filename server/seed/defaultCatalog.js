import Exercise from "../models/Exercise.js";
import WorkoutTemplate from "../models/WorkoutTemplate.js";

export const DEFAULT_EXERCISES = [
  {
    name: "Присідання зі штангою",
    muscleGroup: "Ноги",
    equipment: "Штанга",
  },
  {
    name: "Жим штанги лежачи",
    muscleGroup: "Груди",
    equipment: "Штанга",
  },
  { name: "Станова тяга", muscleGroup: "Спина", equipment: "Штанга" },
  { name: "Підтягування", muscleGroup: "Спина", equipment: "Турнік" },
  {
    name: "Жим гантелей сидячи",
    muscleGroup: "Плечі",
    equipment: "Гантелі",
  },
  { name: "Віджимання", muscleGroup: "Груди", equipment: "Власна вага" },
  { name: "Планка", muscleGroup: "Кор", equipment: "Килимок" },
  {
    name: "Інтервальне кардіо",
    muscleGroup: "Кардіо",
    equipment: "Доріжка / вело",
  },
  {
    name: "Випади з гантелями",
    muscleGroup: "Ноги",
    equipment: "Гантелі",
  },
  {
    name: "Згинання рук з гантелями",
    muscleGroup: "Руки",
    equipment: "Гантелі",
  },
];

function presetDefinitions(map) {
  const g = (name) => map[name];
  return [
    {
      name: "Схуднення · кардіо та легка сила",
      exercises: [
        { exerciseId: g("Інтервальне кардіо"), sets: 1, reps: 20, weight: 0 },
        { exerciseId: g("Планка"), sets: 3, reps: 45, weight: 0 },
        { exerciseId: g("Віджимання"), sets: 3, reps: 15, weight: 0 },
        {
          exerciseId: g("Випади з гантелями"),
          sets: 3,
          reps: 12,
          weight: 8,
        },
      ],
    },
    {
      name: "Набір маси · база",
      exercises: [
        {
          exerciseId: g("Присідання зі штангою"),
          sets: 4,
          reps: 6,
          weight: 40,
        },
        {
          exerciseId: g("Жим штанги лежачи"),
          sets: 4,
          reps: 8,
          weight: 35,
        },
        { exerciseId: g("Станова тяга"), sets: 3, reps: 5, weight: 50 },
        { exerciseId: g("Підтягування"), sets: 3, reps: 8, weight: 0 },
      ],
    },
    {
      name: "Загальна форма · тонус",
      exercises: [
        {
          exerciseId: g("Присідання зі штангою"),
          sets: 3,
          reps: 12,
          weight: 25,
        },
        {
          exerciseId: g("Жим гантелей сидячи"),
          sets: 3,
          reps: 12,
          weight: 12,
        },
        {
          exerciseId: g("Станова тяга"),
          sets: 3,
          reps: 8,
          weight: 35,
        },
        { exerciseId: g("Планка"), sets: 3, reps: 30, weight: 0 },
      ],
    },
  ];
}

export async function seedCatalogIfEmpty() {
  const count = await Exercise.countDocuments();
  if (count > 0) return;
  await Exercise.insertMany(DEFAULT_EXERCISES);
}

export async function attachStarterTemplates(userId) {
  const existing = await WorkoutTemplate.countDocuments({ userId });
  if (existing > 0) return true;
  const all = await Exercise.find().lean();
  if (all.length < 8) return false;
  const map = Object.fromEntries(all.map((e) => [e.name, e._id]));
  const defs = presetDefinitions(map);
  if (defs.some((d) => d.exercises.some((x) => !x.exerciseId))) return false;
  await WorkoutTemplate.insertMany(
    defs.map((d) => ({ ...d, userId })),
  );
  return true;
}

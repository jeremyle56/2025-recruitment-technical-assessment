import express, { Request, Response } from 'express';

// ==== Type Definitions, feel free to add or modify ==========================
interface CookbookEntry {
  type: string;
}

interface RequiredItem {
  name: string;
  quantity: number;
}

interface Recipe extends CookbookEntry {
  requiredItems: RequiredItem[];
}

interface Ingredient extends CookbookEntry {
  cookTime: number;
}

interface RecipeSummary {
  name: string;
  cookTime: number;
  ingredients: RequiredItem[];
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: Record<string, Recipe | Ingredient> = {};

// Task 1 helper (don't touch)
app.post('/parse', (req: Request, res: Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input);
  if (parsed_string == null) {
    res.status(400).send('this string is cooked');
    return;
  }
  res.json({ msg: parsed_string });
  return;
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a human readable form
const parse_handwriting = (recipeName: string): string | null => {
  /*
    Maintain list of regex replacements ([pattern, replacement])
    1. Replacing all hyphens and underscores with a whitespace
    2. Removing all non letters and non whitespace
    3. Squash all whitespace to single whitespace
  */
  const replacements: [RegExp, string][] = [
    [/[-_]/g, ' '],
    [/[^a-zA-Z\s]/g, ''],
    [/\s+/g, ' '],
  ];

  // Apply all regex replacements
  for (let [pattern, replacement] of replacements) {
    recipeName = recipeName.replace(pattern, replacement);
  }

  // Trim leading and trailing whitespace
  recipeName = recipeName.trim();

  // Capitalise first character of every word
  recipeName = recipeName.toLowerCase();
  recipeName = recipeName.replace(/\b\w/g, (m: string) => m.toUpperCase());

  return recipeName ? recipeName : null;
};

// [TASK 2] ====================================================================

const ERROR = 400;
const SUCCESS = 200;

/**
 * Cookbook entry validator. Helper function for POST /entry.
 *
 * @param type - recipe or ingredient
 * @param name - name of item
 * @param requiredItems - array of required items for recipe
 * @param cookTime - integer for cook time for ingredients
 * @returns SUCCESS or ERROR code and message
 */
const entryValidator = (
  type: string,
  name: string,
  requiredItems: RequiredItem[],
  cookTime: number
): [Number, string] => {
  // Check type is either 'recipe' or 'ingredient'
  if (!['recipe', 'ingredient'].includes(type))
    return [ERROR, 'type can only be "recipe" or "ingredient".'];

  // Check entry names must be unique
  if (name in cookbook) return [ERROR, 'entry already exists in cookbook'];

  // Check uniqueness of requiredItems in recipes
  if (type === 'recipe' && new Set(requiredItems.map((i) => i.name)).size !== requiredItems.length)
    return [ERROR, 'Recipe requiredItems must be unique names'];

  // Check cook time greater or equal to 0
  if (type === 'ingredient' && !(typeof cookTime === 'number' && cookTime >= 0))
    return [ERROR, 'cookTime must be greater or equal to 0'];

  return [SUCCESS, ''];
};

// Endpoint that adds a CookbookEntry to your magical cookbook
app.post('/entry', (req: Request, res: Response) => {
  const { type, name, requiredItems, cookTime } = req.body;

  // Validate cookbook entry
  const [code, message] = entryValidator(type, name, requiredItems, cookTime);

  // If successful, add entry to the cookbook
  if (code === SUCCESS) {
    cookbook[name] = type === 'recipe' ? { type, requiredItems } : { type, cookTime };
    return res.status(code).json({});
  }

  res.status(code).json({ message });
});

// [TASK 3] ====================================================================

/**
 * Recursive function to collect required items and cook time. Helper for GET /summary.
 *
 * @param summary - summary object to be returned
 * @param recipe - current recipe
 * @param quantity - amount required for current recipe
 * @returns - summary object for GET request
 */
const createSummary = (
  summary: RecipeSummary,
  recipe: Recipe,
  quantity: number
): RecipeSummary | null => {
  // Iterate through required items of current recipe
  for (const { name: itemName, quantity: itemQty } of recipe.requiredItems) {
    // Check recipe contains items that are in the cookbook
    if (!(itemName in cookbook)) return null;

    // If item is recipe, call the function recursively. If ingredient, add to summary object.
    if (cookbook[itemName].type === 'recipe')
      summary = createSummary(summary, cookbook[itemName] as Recipe, itemQty);
    else {
      // Total Quantity = current required ingredient * quantity of recipe
      const totalQty = itemQty * quantity;

      // If item already exists in summary object, add quantity to that object
      const existing = summary.ingredients.find((i) => i.name === itemName);
      if (existing) existing.quantity += totalQty;
      else summary.ingredients.push({ name: itemName, quantity: totalQty });

      // Increase total cook time based on ingredient cook time and quantity
      summary.cookTime += (cookbook[itemName] as Ingredient).cookTime * totalQty;
    }
  }

  return summary;
};

// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get('/summary', (req: Request, res: Request) => {
  const { name } = req.query;

  // Check if recipe with corresponding name is in the cookbook
  if (!(name in cookbook)) return res.status(ERROR).send(`Recipe '${name}'f cannot be found.`);

  // Check if searched name is a recipe
  if (cookbook[name].type !== 'recipe')
    return res.status(ERROR).send(`Searched name: ${name} is not a recipe name.`);

  // Create summary object
  const summary = createSummary(
    { name, cookTime: 0, ingredients: [] },
    cookbook[name] as Recipe,
    1
  );

  res.status(summary ? SUCCESS : ERROR).json(summary);
});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});

from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
import re


# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
    name: str


@dataclass
class RequiredItem:
    name: str
    quantity: int


@dataclass
class Recipe(CookbookEntry):
    required_items: List[RequiredItem]


@dataclass
class Ingredient(CookbookEntry):
    cook_time: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
cookbook = None


# Task 1 helper (don't touch)
@app.route("/parse", methods=["POST"])
def parse():
    data = request.get_json()
    recipe_name = data.get("input", "")
    parsed_name = parse_handwriting(recipe_name)
    if parsed_name is None:
        return "Invalid recipe name", 400
    return jsonify({"msg": parsed_name}), 200


# [TASK 1] ====================================================================
# Takes in a recipeName and returns it in a human readable form
def parse_handwriting(recipeName: str) -> Union[str | None]:
    """
    Given a recipeName with potentially abysmal handwriting, return human readable string.

    1. All hyphens and underscores are replaced with whitespace.
    2. Food names can only contain letters and whitespace. All other characters are removed.
    3. First character of every word should be capitalised.
    4. Single whitespace between words. No leading and trailing whitespace.
    5. Final string must be length > 0 characters.
    """
    # Maintain list of regex replacements
    replacements = [
        (r"[-_]", r" "),
        (r"[^a-zA-Z ]", r""),
        (r"\s+", " "),
    ]

    # Apply all regex replacements
    for old, new in replacements:
        recipeName = re.sub(old, new, recipeName)

    # Apply upper case (title) formatting
    recipeName = recipeName.strip().title()

    # Return None is string is empty
    return recipeName if recipeName else None


# [TASK 2] ====================================================================
# Endpoint that adds a CookbookEntry to your magical cookbook
@app.route("/entry", methods=["POST"])
def create_entry():
    entry_data = request.get_json()
    return "not implemented", 500


# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route("/summary", methods=["GET"])
def summary():
    # TODO: implement me
    return "not implemented", 500


# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == "__main__":
    app.run(debug=True, port=8080)

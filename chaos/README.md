> This question is relevant for **chaos backend**

# DevSoc Subcommittee Recruitment: Chaos Backend

**_Complete as many questions as you can._**

## Question 1

You have been given a skeleton function `process_data` in the `data.rs` file.
Complete the parameters and body of the function so that given a JSON request of the form

```json
{
  "data": ["Hello", 1, 5, "World", "!"]
}
```

the handler returns the following JSON:

```json
{
  "string_len": 11,
  "int_sum": 6
}
```

Edit the `DataResponse` and `DataRequest` structs as you need.

## Question 2

### a)

Write (Postgres) SQL `CREATE TABLE` statements to create the following schema.
Make sure to include foreign keys for the relationships that will `CASCADE` upon deletion.
![Database Schema](db_schema.png)

**Answer box:**

In PostgreSQL, you can use SERIAL to automatically increment an integer column which is useful for ID generation and I have used it here. You could also just replace SERIAL with int if this is not desired.

```sql
-- Custom ENUM for question type, values are just example values
CREATE TYPE question_type AS ENUM ('MultiSelect', 'MultiChoice', 'ShortAnswer');

CREATE TABLE forms (
    id          SERIAL PRIMARY KEY,
    title       text,
    description text,
);

CREATE TABLE questions (
    id              SERIAL PRIMARY KEY,
    form_id         int NOT NULL,
    title           text,
    question_type   question_type,
    FOREIGN KEY (form_id) REFERENCES forms(id) on DELETE CASCADE
);

CREATE TABLE question_options (
    id              SERIAL PRIMARY KEY,
    question_id     int NOT NULL,
    option          text,
    FOREIGN KEY (question_id) REFERENCES questions(id) on DELETE CASCADE
);
```

### b)

Using the above schema, write a (Postgres) SQL `SELECT` query to return all questions in the following format, given the form id `26583`:

```
   id    |   form_id   |           title             |   question_type   |     options
------------------------------------------------------------------------------------------------------------
 2       | 26583       | What is your full name?     | ShortAnswer       | [null]
 3       | 26583       | What languages do you know? | MultiSelect       | {"Rust", "JavaScript", "Python"}
 7       | 26583       | What year are you in?       | MultiChoice       | {"1", "2", "3", "4", "5+"}
```

**Answer box:**

```sql
SELECT
  q.id,
  q.form_id,
  q.title,
  q.question_type,
  COALESCE(array_agg(qo.option), ARRAY[NULL]::text[]) AS options
FROM
    questions q
    LEFT JOIN question_options ON q.id = qo.question_id
WHERE
  q.form_id = 26583
GROUP BY
  q.id, q.form_id, q.title, q.question_type
ORDER BY
  q.id
;
```

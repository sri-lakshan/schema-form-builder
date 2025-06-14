# Schema-Driven Form Builder with Live Validation

A minimal full-stack web application that dynamically renders and validates forms based on a given JSON Schema. The design for the form is inspired by the default [Zoho forms template](https://www.zoho.com/forms/templates.html). A big thanks to Zoho for providing the problem description!

## Project Structure

```
schema-form-builder/
├── client/      # Angular app frontend
└── server/      # Java Spring Boot backend
```

## Setup Instructions

### Prerequisites

- node.js + NPM
- Java JDK
- Maven
- Angular CLI

### 1. Clone the Repository

```bash
git clone https://github.com/sri-lakshan/schema-form-builder.git
cd schema-form-builder
```

### 2. Run the Backend Server (Spring Boot)

```bash
cd server
mvnw.cmd spring-boot:run  # Windows
```

The server will start on http://localhost:8080. All valid submissions will be saved in `server/submissions.json`.

### 3. Run the Frontend Client (Angular)

```bash
cd ../client
npm install
ng serve
```

Open http://localhost:4200 to view the app.

### If You See an Empty Form

If no schema has been uploaded yet, a snackbar message will appear:

"You have not uploaded any schema yet, please click on the import button to import your schema."

To import a schema, simply click on the Import JSON Schema button and upload your desired schema.

## Summary of how the app handles each requirement:

### 1. Input

- The app uses the default [Zoho forms template](https://www.zoho.com/forms/templates.html). Users can import a valid JSON Schema.

### 2. Dynamic Form Rendering

- Forms are dynamically generated using Angular based on the uploaded schema.
- Only the fields described in the schema are rendered.
- Types, labels, and constraints are adhered to.

### 3. Real-Time Validation

- Client-side validation is powered by `ajv` and `ajv-formats`.
- Errors are shown inline with each field during user interaction.

### 4. Server Validation

- On submission, data is sent to a Spring Boot backend.
- The backend uses the same JSON Schema for validation (via `everit-org/json-schema`).
- On success, the data and associated schema are stored persistently in `submissions.json`.

### 5. Export

- User can export the current schema and filled-in data.
- Exported file can be re-imported, fully restoring the state of the form.

### 6. Persistence

- Valid submissions are stored in a JSON file (`server/submissions.json`).
- Each entry contains the submitted form data along with the schema it was based on.
- View all previous submissions from the “Submissions” screen in the app.

## Libraries Used

Front-end : Angular 17, Angular Material, AJV, fp-ts 
The client-side form validator uses `fp-ts` for a type-safe approach to export the form data.

Back-end : Spring Boot (Java 17), Everit JSON Schema
For Validation : AJV (client), Everit JSON Schema (server)

## Repo Notes

### submissions.json

This file holds a list of all valid submission entries. Each entry contains:

```json
{
  "schema": { ... },
  "data": { ... }
}
```

## Side Notes

- Try uploading an invalid schema — an error will be shown
- Submit invalid form data — errors will be shown inline and submission will be blocked
- Submit valid data — it will be saved and appear under “Submissions”


## Author

Built by Srilakshan A for the Zoho Schema-Driven Form Builder assessment.



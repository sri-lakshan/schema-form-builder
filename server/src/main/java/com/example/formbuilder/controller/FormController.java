// src/main/java/com/example/demo/controller/FormController.java

package com.example.formbuilder.controller;

import com.example.formbuilder.dto.FormRequest;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.everit.json.schema.Schema;
import org.everit.json.schema.loader.SchemaLoader;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/form")
@CrossOrigin(origins = "http://localhost:4200") // or use "*" during dev
public class FormController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/submit")
    public ResponseEntity<?> receiveForm(@RequestBody Map<String, Object> payload) {
        try {
            Object schemaObj = payload.get("schema");
            Object dataObj = payload.get("data");

            if (schemaObj == null || dataObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing schema or data."));
            }

            JSONObject schemaJson = new JSONObject((Map<?, ?>) schemaObj);
            JSONObject dataJson = new JSONObject((Map<?, ?>) dataObj);

            Schema schema = SchemaLoader.load(schemaJson);
            schema.validate(dataJson);

            System.out.println("Storing: " + dataJson);

            Path path = Paths.get("submissions.json");
            List<Object> submissions = new ArrayList<>();

            if (Files.exists(path)) {
                String content = Files.readString(path);
                if (!content.trim().isEmpty()) {
                    submissions = new ObjectMapper().readValue(content, List.class);
                }
            }

            Map<String, Object> submissionEntry = new HashMap<>();
            submissionEntry.put("schema", schemaObj);
            submissionEntry.put("data", dataObj);

            submissions.add(submissionEntry);

            Files.writeString(path, new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(submissions));


            return ResponseEntity.ok(Map.of("message", "Form validated and stored!"));

        } catch (org.everit.json.schema.ValidationException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error", "Validation failed.",
                            "details", e.getAllMessages()
                    ));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error", "details", e.getMessage()));
        }
    }

    @GetMapping("/submissions")
    public ResponseEntity<String> getAllSubmissions() {
        try {
            Path path = Paths.get("submissions.json");
            String jsonContent = Files.readString(path);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonContent);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Unable to read submissions.\"}");
        }
    }

}

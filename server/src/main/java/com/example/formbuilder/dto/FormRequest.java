package com.example.formbuilder.dto;

import com.fasterxml.jackson.databind.JsonNode;

public class FormRequest {
    private JsonNode schema;
    private JsonNode data;

    public JsonNode getSchema() {
        return schema;
    }

    public void setSchema(JsonNode schema) {
        this.schema = schema;
    }

    public JsonNode getData() {
        return data;
    }

    public void setData(JsonNode data) {
        this.data = data;
    }
}

package com.example.formbuilder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class FormbuilderApplication {
	public static void main(String[] args) {
		SpringApplication.run(FormbuilderApplication.class, args);
	}

}

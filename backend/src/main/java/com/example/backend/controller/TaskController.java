package com.example.backend.controller;

import com.example.backend.model.Task;
import com.example.backend.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Create task
    @PostMapping
    public Task createTask(
            @RequestBody Task task) {

        return taskService.createTask(task);
    }

    // Get all tasks
    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    // Get tasks by status
    @GetMapping("/status/{status}")
    public List<Task> getTasksByStatus(
            @PathVariable String status) {

        return taskService.getTasksByStatus(status);
    }

    // Mark task complete
    @PutMapping("/complete/{id}")
    public Task markCompleted(
            @PathVariable String id) {

        return taskService.markTaskCompleted(id);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable String id, @RequestBody Task task) {
        task.setId(id);
        return taskService.updateTask(task);
    }

    // Delete task
    @DeleteMapping("/{id}")
    public void deleteTask(
            @PathVariable String id) {

        taskService.deleteTask(id);
    }
}
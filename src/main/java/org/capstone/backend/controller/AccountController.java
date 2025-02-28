package org.capstone.backend.controller;

import jakarta.persistence.EntityNotFoundException;
import org.capstone.backend.dto.account.AccountResponseDTO;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.service.account.AccountService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/accounts")
@CrossOrigin("*")
public class AccountController {
    @Autowired
    private  AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@Validated @PathVariable Long id, @ModelAttribute("account") AccountResponseDTO account,
                                            BindingResult bindingResult,
                                            @RequestParam("avatar") MultipartFile avatar) throws IOException {
        Employee existingUser = employeeRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("User not found with ID: " + id)
        );
        BeanUtils.copyProperties(employeeDetails, existingUser, "employeeId");
        Employee updatedEmployee = employeeService.updateEmployee(id, existingUser);
        if (updatedEmployee != null) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}

package org.capstone.backend.controller.admin;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.group.GroupSummaryDTO;
import org.capstone.backend.service.group.GroupService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/groups")
@RequiredArgsConstructor
public class ManageGroupController {

    private final GroupService groupService;

    @GetMapping("/all")
    public Page<GroupSummaryDTO> getGroups(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return groupService.searchGroups(keyword, page, size);
    }
}

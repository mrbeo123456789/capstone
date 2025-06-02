package org.capstone.backend.controller.admin;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.dashboard.DashboardResponseDTO;
import org.capstone.backend.dto.dashboard.GrowthDataDTO;
import org.capstone.backend.service.dashboard.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Controller
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashBoardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardResponseDTO getSummary() {
        return dashboardService.getSummary();
    }

    @GetMapping("/growth")
    public GrowthDataDTO getGrowthChart(@RequestParam(defaultValue = "MONTH") String range) {
        return dashboardService.getGrowthChart(range);
    }
}

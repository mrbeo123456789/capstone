package org.capstone.backend.service.dashboard;

import org.capstone.backend.dto.dashboard.DashboardResponseDTO;
import org.capstone.backend.dto.dashboard.GrowthDataDTO;

public interface DashboardService {
    DashboardResponseDTO getSummary();
    GrowthDataDTO getGrowthChart(String range);
}

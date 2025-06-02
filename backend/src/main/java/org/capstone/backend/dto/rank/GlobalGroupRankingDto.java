package org.capstone.backend.dto.rank;

public interface GlobalGroupRankingDto {
    Long getGroupId();
    String getGroupName();
    String getGroupPicture();
    Double getTotalStars();
    Integer getMemberCount(); // 👈 Thêm dòng này
}

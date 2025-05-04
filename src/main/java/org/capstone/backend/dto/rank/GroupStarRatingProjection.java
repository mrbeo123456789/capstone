package org.capstone.backend.dto.rank;

public interface GroupStarRatingProjection {
    Long getGroupId();
    String getGroupName();
    String getPicture();
    Double getAverageStar();
    Integer getMemberCount();
}

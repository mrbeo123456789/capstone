package org.capstone.backend.utils.suggestion;

import lombok.Getter;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.entity.Interest;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.GroupMemberRepository;
import org.capstone.backend.repository.InterestRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.enums.InvitePermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MemberSuggestionService {

    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMember;
    private final InterestRepository interestRepository;
    @Autowired
    public MemberSuggestionService(MemberRepository memberRepository, GroupMemberRepository groupMember, InterestRepository interestRepository) {
        this.memberRepository = memberRepository;

        this.groupMember = groupMember;
        this.interestRepository = interestRepository;
    }

    // Hàm tính điểm tương đồng sở thích (Cosine Similarity)
    public static double cosineSimilarity(Set<Interest> interests1, Set<Interest> interests2, List<Interest> allInterests) {
        // Tạo 2 vector nhị phân (boolean vectors) cho mỗi thành viên
        Map<Long, Integer> interestMap = new HashMap<>();
        int index = 0;

        // Tạo một danh sách tất cả các sở thích
        for (Interest interest : allInterests) {
            interestMap.put(interest.getId(), index++);
        }

        // Vector cho thành viên 1
        int[] vector1 = new int[interestMap.size()];
        for (Interest interest : interests1) {
            vector1[interestMap.get(interest.getId())] = 1; // Đánh dấu sở thích của thành viên 1
        }

        // Vector cho thành viên 2
        int[] vector2 = new int[interestMap.size()];
        for (Interest interest : interests2) {
            vector2[interestMap.get(interest.getId())] = 1; // Đánh dấu sở thích của thành viên 2
        }

        // Tính tích vô hướng (dot product) giữa hai vector
        int dotProduct = 0;
        for (int i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i];
        }

        // Tính độ dài của hai vector
        double magnitude1 = Math.sqrt(Arrays.stream(vector1).sum());
        double magnitude2 = Math.sqrt(Arrays.stream(vector2).sum());

        // Tránh trường hợp chia cho 0 nếu một trong hai vector có độ dài bằng 0
        if (magnitude1 == 0 || magnitude2 == 0) {
            return 0;
        }

        // Trả về độ tương đồng Cosine
        return dotProduct / (magnitude1 * magnitude2);
    }

    // Hàm tính điểm tương đồng địa lý
    public static double calculateLocationSimilarity(Member member1, Member member2) {
        int score = 0;

        // So sánh cấp thành phố (province)
        if (member1.getProvince() != null && member2.getProvince() != null &&
                member1.getProvince().equalsIgnoreCase(member2.getProvince())) {
            score += 1; // Thành phố giống nhau
        }

        // So sánh cấp quận/huyện (district)
        if (member1.getDistrict() != null && member2.getDistrict() != null &&
                member1.getDistrict().equalsIgnoreCase(member2.getDistrict())) {
            score += 1; // Quận/huyện giống nhau
        }

        // So sánh cấp phường/xã (ward)
        if (member1.getWard() != null && member2.getWard() != null &&
                member1.getWard().equalsIgnoreCase(member2.getWard())) {
            score += 1; // Phường/xã giống nhau
        }

        // Trả về điểm tương đồng địa lý (từ 0 đến 3)
        return score;
    }

    // Lớp phụ trợ để chứa thành viên và điểm tương đồng của họ

        private record MemberSimilarity(Member member, double score) {
    }

    public List<MemberSearchResponse> suggestMembers(Long id) {
        Member currentUser = memberRepository.getReferenceById(id);
        // Lấy danh sách các thành viên trong hệ thống
        List<Member> allMembers = memberRepository.findAll();

        // Lọc bỏ thành viên hiện tại
        allMembers.removeIf(member -> member.getId().equals(currentUser.getId()));

        // Tạo một danh sách để chứa điểm tương đồng
        List<MemberSimilarity> memberSimilarities = new ArrayList<>();

        // Lấy tất cả các sở thích từ InterestRepository
        List<Interest> allInterests = interestRepository.findAll();

        for (Member member : allMembers) {
            // Kiểm tra quyền mời của thành viên
            if (!canInvite(currentUser, member)) {
                continue; // Nếu không thể mời, bỏ qua thành viên này
            }

            // Tính điểm tương đồng sở thích giữa hai thành viên
            double similarity = cosineSimilarity(currentUser.getInterests(), member.getInterests(), allInterests);

            // Tính điểm tương đồng địa lý (dựa trên địa chỉ)
            double locationSimilarity = calculateLocationSimilarity(currentUser, member);

            // Kết hợp sở thích và địa lý (ví dụ: 70% sở thích, 30% địa lý)
            double finalScore = 0.7 * similarity + 0.3 * locationSimilarity;

            // Lưu điểm tương đồng và thành viên
            memberSimilarities.add(new MemberSimilarity(member, finalScore));
        }

        // Sắp xếp các thành viên theo điểm tương đồng và lấy 10 kết quả đầu tiên
        List<Member> topMembers = memberSimilarities.stream()
                .sorted((m1, m2) -> Double.compare(m2.score(), m1.score()))
                .limit(10) // Chỉ lấy top 10 kết quả
                .map(MemberSimilarity::member)
                .toList();

        // Chuyển đổi từ Member sang MemberSearchResponse và trả về danh sách
        return topMembers.stream()
                .map(m -> new MemberSearchResponse(
                        m.getId(),
                        m.getAccount().getEmail(),
                        m.getAvatar(),
                        m.getFullName()
                ))
                .collect(Collectors.toList());
    }

    // Kiểm tra xem người dùng có thể mời thành viên này không
    private boolean canInvite(Member currentUser, Member targetMember) {
        InvitePermission permission = currentUser.getInvitePermission();

        if (permission == InvitePermission.EVERYONE) {
            return true;
        } else if (permission == InvitePermission.SAME_GROUP) {
            // Kiểm tra xem thành viên mục tiêu có phải là bạn bè không
            return groupMember.checkIfInSameGroup(currentUser.getId(), targetMember.getId());
        } else if (permission == InvitePermission.NO_ONE) {
            return false;
        }

        return false;
    }


}

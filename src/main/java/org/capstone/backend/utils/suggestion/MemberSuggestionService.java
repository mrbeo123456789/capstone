package org.capstone.backend.utils.suggestion;

import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.entity.ChallengeMember;
import org.capstone.backend.entity.Interest;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.ChallengeMemberRepository;
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
    private final ChallengeMemberRepository challengeMemberRepository;

    @Autowired
    public MemberSuggestionService(MemberRepository memberRepository,
                                   GroupMemberRepository groupMember,
                                   InterestRepository interestRepository,
                                   ChallengeMemberRepository challengeMemberRepository) {
        this.memberRepository = memberRepository;
        this.groupMember = groupMember;
        this.interestRepository = interestRepository;
        this.challengeMemberRepository = challengeMemberRepository;
    }

    // Hàm tính điểm tương đồng sở thích (Cosine Similarity)
    public static double cosineSimilarity(Set<Interest> interests1, Set<Interest> interests2, List<Interest> allInterests) {
        Map<Long, Integer> interestMap = new HashMap<>();
        int index = 0;
        for (Interest interest : allInterests) {
            interestMap.put(interest.getId(), index++);
        }

        int[] vector1 = new int[interestMap.size()];
        for (Interest interest : interests1) {
            vector1[interestMap.get(interest.getId())] = 1;
        }

        int[] vector2 = new int[interestMap.size()];
        for (Interest interest : interests2) {
            vector2[interestMap.get(interest.getId())] = 1;
        }

        int dotProduct = 0;
        for (int i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i];
        }

        double magnitude1 = Math.sqrt(Arrays.stream(vector1).sum());
        double magnitude2 = Math.sqrt(Arrays.stream(vector2).sum());

        if (magnitude1 == 0 || magnitude2 == 0) {
            return 0;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }

    // Hàm tính điểm tương đồng địa lý
    public static double calculateLocationSimilarity(Member member1, Member member2) {
        int score = 0;
        if (member1.getProvince() != null && member2.getProvince() != null &&
                member1.getProvince().equalsIgnoreCase(member2.getProvince())) {
            score += 1;
        }
        if (member1.getDistrict() != null && member2.getDistrict() != null &&
                member1.getDistrict().equalsIgnoreCase(member2.getDistrict())) {
            score += 1;
        }
        if (member1.getWard() != null && member2.getWard() != null &&
                member1.getWard().equalsIgnoreCase(member2.getWard())) {
            score += 1;
        }
        return score;
    }

    // Lớp phụ trợ để chứa thành viên và điểm tương đồng của họ
    private record MemberSimilarity(Member member, double score) {}

    /**
     * Hàm suggestMembers tối ưu: lọc ra những thành viên phù hợp dựa trên
     * điểm tương đồng sở thích, địa lý và quyền mời (canInvite),
     * đồng thời loại bỏ những thành viên đã tham gia thử thách.
     *
     * @param id          ID của người dùng hiện tại
     * @param challengeId ID của thử thách cần lọc (loại bỏ thành viên đã tham gia)
     * @return danh sách gợi ý dưới dạng MemberSearchResponse
     */
    public List<MemberSearchResponse> suggestMembers(Long id, Long challengeId) {
        // Lấy người dùng hiện tại
        Member currentUser = memberRepository.getReferenceById(id);
        // Lấy tất cả các thành viên
        List<Member> allMembers = memberRepository.findAll();
        // Loại bỏ chính currentUser
        allMembers.removeIf(member -> member.getId().equals(currentUser.getId()));

        // Lấy danh sách các memberId đã tham gia thử thách (status JOINED)
        List<Long> joinedMemberIds = challengeMemberRepository.findMemberIdsByChallengeId(challengeId);
        // Loại bỏ những thành viên đã tham gia thử thách
        allMembers.removeIf(member -> joinedMemberIds.contains(member.getId()));

        // Tạo danh sách chứa điểm tương đồng
        List<MemberSimilarity> memberSimilarities = new ArrayList<>();
        // Lấy tất cả các sở thích
        List<Interest> allInterests = interestRepository.findAll();

        for (Member member : allMembers) {
            // Kiểm tra quyền mời của currentUser với target member
            if (!canInvite(currentUser, member)) {
                continue;
            }

            double similarity = cosineSimilarity(currentUser.getInterests(), member.getInterests(), allInterests);
            double locationSimilarity = calculateLocationSimilarity(currentUser, member);
            double finalScore = 0.7 * similarity + 0.3 * locationSimilarity;
            memberSimilarities.add(new MemberSimilarity(member, finalScore));
        }

        // Sắp xếp theo điểm tương đồng và lấy top 10
        List<Member> topMembers = memberSimilarities.stream()
                .sorted((m1, m2) -> Double.compare(m2.score(), m1.score()))
                .limit(10)
                .map(MemberSimilarity::member)
                .toList();

        // Chuyển đổi sang MemberSearchResponse
        return topMembers.stream()
                .map(m -> new MemberSearchResponse(
                        m.getId(),
                        m.getAccount().getEmail(),
                        m.getAvatar(),
                        m.getFullName()))
                .collect(Collectors.toList());
    }

    // Kiểm tra xem currentUser có thể mời targetMember không dựa trên quyền mời.
    // Trong trường hợp InvitePermission là SAME_GROUP, kiểm tra xem có ít nhất một nhóm chung nào không.
    private boolean canInvite(Member currentUser, Member targetMember) {
        InvitePermission permission = currentUser.getInvitePermission();
        if (permission == InvitePermission.EVERYONE) {
            return true;
        } else if (permission == InvitePermission.SAME_GROUP) {
            // Kiểm tra qua method checkIfInSameGroup
            boolean sameGroup = groupMember.checkIfInSameGroup(currentUser.getId(), targetMember.getId());
            // Nếu method checkIfInSameGroup không đủ, ta có thể bổ sung thêm kiểm tra qua danh sách group của từng thành viên.
            if (!sameGroup) {
                List<Long> currentUserGroupIds = groupMember.findGroupIdsByMemberId(currentUser.getId());
                List<Long> targetMemberGroupIds = groupMember.findGroupIdsByMemberId(targetMember.getId());
                sameGroup = currentUserGroupIds.stream().anyMatch(targetMemberGroupIds::contains);
            }
            return sameGroup;
        } else if (permission == InvitePermission.NO_ONE) {
            return false;
        }
        return false;
    }
}

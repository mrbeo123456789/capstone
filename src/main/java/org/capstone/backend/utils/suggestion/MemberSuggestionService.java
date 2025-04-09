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
            if(interestMap.containsKey(interest.getId())) {
                vector1[interestMap.get(interest.getId())] = 1;
            }
        }

        int[] vector2 = new int[interestMap.size()];
        for (Interest interest : interests2) {
            if(interestMap.containsKey(interest.getId())) {
                vector2[interestMap.get(interest.getId())] = 1;
            }
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
    // Số điểm tối đa là 3 (province, district, ward)
    public static int calculateLocationScore(Member member1, Member member2) {
        int score = 0;
        if (member1.getProvince() != null && member2.getProvince() != null &&
                member1.getProvince().equalsIgnoreCase(member2.getProvince())) {
            score++;
        }
        if (member1.getDistrict() != null && member2.getDistrict() != null &&
                member1.getDistrict().equalsIgnoreCase(member2.getDistrict())) {
            score++;
        }
        if (member1.getWard() != null && member2.getWard() != null &&
                member1.getWard().equalsIgnoreCase(member2.getWard())) {
            score++;
        }
        return score;
    }

    // Lớp phụ trợ để chứa thành viên cùng với điểm số và lý do gợi ý
    private record MemberSuggestion(Member member, double interestScore, int locationScore, String reason, double totalScore) {}

    /**
     * Hàm suggestMembers cải tiến: tách riêng ra thành viên gần và thành viên cùng sở thích,
     * đồng thời thêm lý do gợi ý.
     *
     * @param id          ID của người dùng hiện tại
     * @param challengeId ID của thử thách cần lọc (loại bỏ thành viên đã tham gia)
     * @return danh sách gợi ý dưới dạng MemberSearchResponse với lý do gợi ý
     */
    public List<MemberSearchResponse> suggestMembers(Long id, Long challengeId) {
        // Lấy người dùng hiện tại
        Member currentUser = memberRepository.getReferenceById(id);
        // Lấy tất cả các thành viên
        List<Member> allMembers = memberRepository.findAll();
        // Loại bỏ chính currentUser
        allMembers.removeIf(member -> member.getId().equals(currentUser.getId()));

        // Loại bỏ những thành viên đã tham gia thử thách
        List<Long> joinedMemberIds = challengeMemberRepository.findMemberIdsByChallengeId(challengeId);
        allMembers.removeIf(member -> joinedMemberIds.contains(member.getId()));

        // Lấy tất cả các sở thích
        List<Interest> allInterests = interestRepository.findAll();

        List<MemberSuggestion> suggestions = new ArrayList<>();

        for (Member member : allMembers) {
            // Kiểm tra quyền mời của currentUser với target member
            if (!canInvite(currentUser, member)) {
                continue;
            }

            double interestScore = cosineSimilarity(currentUser.getInterests(), member.getInterests(), allInterests);
            int locationScore = calculateLocationScore(currentUser, member);

            // Chỉ đưa thành viên có điểm nào đó (có cùng sở thích hoặc gần địa chỉ)
            if (interestScore <= 0 && locationScore <= 0) {
                continue;
            }

            // Xác định lý do gợi ý
            String reason;
            if (interestScore > 0 && locationScore > 0) {
                reason = "Cùng sở thích và gần địa chỉ";
            } else if (interestScore > 0) {
                reason = "Cùng sở thích";
            } else {
                reason = "Gần địa chỉ";
            }

            // Tổng điểm sắp xếp: có thể điều chỉnh theo trọng số nếu cần (ví dụ: 0.7 * interestScore + 0.3 * (locationScore / 3.0))
            double totalScore = 0.7 * interestScore + 0.3 * (locationScore / 3.0);

            suggestions.add(new MemberSuggestion(member, interestScore, locationScore, reason, totalScore));
        }

        // Sắp xếp theo tổng điểm giảm dần và lấy top 10
        List<Member> topMembers = suggestions.stream()
                .sorted((s1, s2) -> Double.compare(s2.totalScore(), s1.totalScore()))
                .limit(10)
                .map(MemberSuggestion::member)
                .toList();

        // Nếu DTO MemberSearchResponse chưa có field reason, bạn cần bổ sung nó.
        // Ở đây ta giả sử MemberSearchResponse đã có constructor:
        // MemberSearchResponse(Long id, String email, String avatar, String fullName, String reason)
        Map<Long, String> memberIdToReason = suggestions.stream()
                .collect(Collectors.toMap(s -> s.member().getId(), s -> s.reason(), (oldVal, newVal) -> oldVal));

        return topMembers.stream()
                .map(m -> new MemberSearchResponse(
                        m.getId(),
                        m.getAccount().getEmail(),
                        m.getAvatar(),
                        m.getFullName(),
                        memberIdToReason.get(m.getId()) // thêm lý do gợi ý
                ))
                .collect(Collectors.toList());
    }

    // Kiểm tra xem currentUser có thể mời targetMember không dựa trên quyền mời.
    // Trong trường hợp InvitePermission là SAME_GROUP, kiểm tra xem có ít nhất một nhóm chung nào không.
    private boolean canInvite(Member currentUser, Member targetMember) {
        InvitePermission permission = currentUser.getInvitePermission();
        if (permission == InvitePermission.EVERYONE) {
            return true;
        } else if (permission == InvitePermission.SAME_GROUP) {
            boolean sameGroup = groupMember.checkIfInSameGroup(currentUser.getId(), targetMember.getId());
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

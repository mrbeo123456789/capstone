package org.capstone.backend.repository;

import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository  extends JpaRepository<Member, Long> {
    Optional<Member> findByAccount(Account account);
    @Query("SELECT m FROM Member m WHERE m.account.email = :email")
    Optional<Member> findByEmail(@Param("email") String email);
    @Query("SELECT m FROM Member m WHERE LOWER(m.account.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(m.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Member> searchByEmailOrFullName(@Param("keyword") String keyword, Pageable pageable);
}




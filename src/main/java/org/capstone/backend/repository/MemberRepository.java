package org.capstone.backend.repository;

import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository  extends JpaRepository<Member, Long> {
    Optional<Member> findByAccount(Account account);

}

package org.capstone.backend.repository;


import org.capstone.backend.dto.account.AccountDTO;
import org.capstone.backend.entity.Account;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("""
   SELECT new org.capstone.backend.dto.account.AccountDTO(
       a.id, a.username, a.email, a.role, a.status, a.createdAt, a.updatedAt
   )
   FROM Account a
   WHERE (:keyword IS NULL OR 
         LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%')) 
      OR LOWER(COALESCE(a.username, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
     AND (:status IS NULL OR a.status = :status)
     AND a.role <> org.capstone.backend.utils.enums.Role.ADMIN
   ORDER BY a.createdAt DESC
""")
    Page<AccountDTO> findAllByKeywordAndStatus(
            @Param("keyword") String keyword,
            @Param("status") AccountStatus status,
            Pageable pageable);


    Optional<Account> findByUsername(String username);
    Optional<Account> findByEmail(String email);
}

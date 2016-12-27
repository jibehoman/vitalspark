package org.springframework.webflow.samples.aurea;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * A JPA-based implementation of the Commission Service. Delegates to a JPA entity manager to issue data access calls
 * against the backing repository. The EntityManager reference is provided by the managing container (Spring)
 * automatically.
 */
@Service("commissionService")
@Repository
public class JpaCommissionService implements CommissionService {

    private EntityManager em;

    @PersistenceContext
    public void setEntityManager(EntityManager em) {
	this.em = em;
    }
    @Transactional(readOnly = true)
    public Commission createCommission() {
	Commission aurea = new Commission();
	return aurea;
    }

    @Transactional
    public void persistCommission(Commission aurea) {
	em.persist(aurea);
    }

    @Transactional
    public void cancelCommission(Long id) {
	Commission aurea = em.find(Commission.class, id);
	if (aurea != null) {
	    em.remove(aurea);
	}
    }

}
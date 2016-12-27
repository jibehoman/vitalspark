package org.springframework.webflow.samples.aurea;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * A JPA-based implementation of the Services Service. Delegates to a JPA entity manager to issue data access calls
 * against the backing repository. The EntityManager reference is provided by the managing container (Spring)
 * automatically.
 */
@Service("servicesService")
@Repository
public class JpaServicesService implements ServicesService {

    private EntityManager em;

    @PersistenceContext
    public void setEntityManager(EntityManager em) {
	this.em = em;
    }
    @Transactional(readOnly = true)
    public Services createServices() {
	Services aurea = new Services();
	return aurea;
    }

    @Transactional
    public void persistServices(Services aurea) {
	em.persist(aurea);
    }

    @Transactional
    public void cancelServices(Long id) {
	Services aurea = em.find(Services.class, id);
	if (aurea != null) {
	    em.remove(aurea);
	}
    }

}
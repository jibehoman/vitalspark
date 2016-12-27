package org.springframework.webflow.samples.aurea;

import java.util.List;

/**
 * A service interface for commissioning Aurea applications
 */
public interface CommissionService {

    /**
     * Create a new, transient Aurea Commission instance for the given user.
     * @return the new transient Aurea Commission instance
     */
    public Commission createCommission();

    /**
     * Persist the aurea to the database
     * @param aurea the aurea
     */
    public void persistCommission(Commission aurea);

    /**
     * Cancel an existing aurea.
     * @param id the aurea id
     */
    public void cancelCommission(Long id);

}

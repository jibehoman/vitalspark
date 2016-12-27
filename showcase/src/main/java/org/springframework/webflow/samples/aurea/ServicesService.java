package org.springframework.webflow.samples.aurea;

import java.util.List;

/**
 * A service implementation for adding new Aurea services from a repository
 */
public interface ServicesService {

    /**
     * Create a new, transient Aurea Services instance for the given user.
     * @return the new transient aurea instance
     */
    public Services createServices();

    /**
     * Persist the aurea to the database
     * @param aurea the aurea
     */
    public void persistServices(Services aurea);

    /**
     * Cancel an existing aurea.
     * @param id the aurea id
     */
    public void cancelServices(Long id);

}

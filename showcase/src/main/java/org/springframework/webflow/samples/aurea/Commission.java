package org.springframework.webflow.samples.aurea;

import java.io.Serializable;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.Basic;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;
import javax.validation.constraints.Future;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;
import org.springframework.format.annotation.DateTimeFormat;

/**
 * A Commission
 */
@Entity
public class Commission implements Serializable {

    private Long id;
    private String applicationType;

    private String domainName;
    private String userName;
    private String password;
    private String url;

    private String processName;
    private String xarName;
    
    private String patternName;
    private String robustnessAndAvailabilityName;
    private String uploadPatternURL;

    private boolean monitoringModel;
    private HashSet<String> mediationFeatures;
    private HashSet<String> monitoringFeatures;
    private HashSet<String> testFeatures;
 
    public Commission() {
    	 setApplicationType("Sonic");
    	 setDomainName("Domain1");
    	 setUserName("Administrator");
    	 setPassword("Administrator");
    	 setUrl("tcp://localhost:2506");
   	     setMonitoringModel(true);
    	 setMediationFeatures(new HashSet<String>());
    	 setMonitoringFeatures(new HashSet<String>());
    	 setTestFeatures(new HashSet<String>());
 
    }

    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    public Long getId() {
	return id;
    }

    public void setId(Long id) {
	this.id = id;
    }

	public String getApplicationType() {
		return applicationType;
	}

	public void setApplicationType(String applicationType) {
		this.applicationType = applicationType;
	}

	public String getDomainName() {
		return domainName;
	}

	public void setDomainName(String domainName) {
		this.domainName = domainName;
	}

	public boolean isMonitoringModel() {
		return monitoringModel;
	}

	public void setMonitoringModel(boolean monitoringModel) {
		this.monitoringModel = monitoringModel;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String passwordName) {
		this.password = password;
	}

	public String getPatternName() {
		return patternName;
	}

	public void setPatternName(String patternName) {
		this.patternName = patternName;
	}

	public String getProcessName() {
		return processName;
	}

	public void setProcessName(String processName) {
		this.processName = processName;
	}

	public String getRobustnessAndAvailabilityName() {
		return robustnessAndAvailabilityName;
	}

	public void setRobustnessAndAvailabilityName(
			String robustnessAndAvailabilityName) {
		this.robustnessAndAvailabilityName = robustnessAndAvailabilityName;
	}

	public String getUploadPatternURL() {
		return uploadPatternURL;
	}

	public void setUploadPatternURL(String uploadPatternURL) {
		this.uploadPatternURL = uploadPatternURL;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getXarName() {
		return xarName;
	}

	public void setXarName(String xarName) {
		this.xarName = xarName;
	}

	public HashSet<String> getMediationFeatures() {
		return mediationFeatures;
	}

	public void setMediationFeatures(HashSet<String> mediationFeatures) {
  	  this.mediationFeatures = mediationFeatures;
	}

	public HashSet<String> getMonitoringFeatures() {
		return monitoringFeatures;
	}

	public void setMonitoringFeatures(HashSet<String> monitoringFeatures) {
		this.monitoringFeatures = monitoringFeatures;
	}

	public HashSet<String> getTestFeatures() {
		return testFeatures;
	}

	public void setTestFeatures(HashSet<String> testFeatures) {
		this.testFeatures = testFeatures;
	}

}

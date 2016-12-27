package org.springframework.webflow.samples.aurea;

import java.io.Serializable;

import org.springframework.web.multipart.commons.CommonsMultipartFile;

/**
 * A Commission
 */
@SuppressWarnings("serial")
public class FlowStateHolder implements Serializable {

    private String uploadApplication;
    private CommonsMultipartFile xar;
    private CommonsMultipartFile sdm;
 
     public FlowStateHolder() {
    	 setUploadApplication("false");
    }

	public String getUploadApplication() {
		return uploadApplication;
	}

	public void setUploadApplication(String uploadApplication) {
		this.uploadApplication = uploadApplication;
	}
	
	public CommonsMultipartFile getXar() {
		return xar;
	}

	public void setXar(CommonsMultipartFile xar) {
		this.xar = xar;
	}
	public CommonsMultipartFile getSdm() {
		return sdm;
	}

	public void setSdm(CommonsMultipartFile sdm) {
		this.sdm = sdm;
	}
}

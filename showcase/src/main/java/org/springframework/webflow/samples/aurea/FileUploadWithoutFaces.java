/** Using file upload with either prime-faces or
 *  Rich faces appears to be a version hell nightmare!
 */
package org.springframework.webflow.samples.aurea;
import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;
import org.springframework.webflow.context.servlet.ServletExternalContext;
import org.springframework.webflow.engine.RequestControlContext;
@Component("fileUploadWithoutFaces")
public class FileUploadWithoutFaces implements Serializable {
	private MultipartFile file;

	public void uploadFile(RequestControlContext requestContext) {
		setFile(null);
		final ServletExternalContext context = (ServletExternalContext) requestContext
				.getExternalContext();
		Map<String, MultipartFile> m = ((org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest)context.getNativeRequest()).getFileMap();
		for ( String k: m.keySet() ) {
			System.out.println(k);			
		}
		for (MultipartFile f : m.values()) {
			System.out.println(f.getOriginalFilename() + ":" + f.getSize());
			if (f.getSize() != 0) {
				try {
					File move = new File(".lastupload");
					move.delete();
					f.transferTo(move);
					setFile(f);
				} catch (Exception e) {
					// FUDF
				}
			}
		}
	}

	public void setFile(MultipartFile file) {
		this.file = file;
	}
	public MultipartFile getFile() {
		return file;
	}
	public void setValid(boolean valid) {
		//m_valid = valid;
	}	
	public boolean isValid() {
		return file != null;
	}
}
package org.springframework.webflow.samples.aurea;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.persistence.Transient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

@SuppressWarnings("serial")
public class Domain implements Serializable {
	private Services services;
	private Properties m_properties = new Properties();
	
	public Domain() {
	}
	
	@Transient
	public void setServices(Services services) {
		this.services = services;
	}
	@Transient
	public Services getServices() {
		return services;
	}
		
    /**
     * update
     * Run sdm update against model changes
     */
	public boolean update() {
		AntRunner ar = new AntRunner();
		try {
			Map<String, String> ps = new HashMap<String, String>();
			String stageroot = getProperties().getProperty("stage.test.mgr.framework.home",  "c:/workspaces/Tertiary/SONIC86/stagetestmgr/build/stage");
			if (stageroot == null)
				throw new Exception("Property stage.test.mgr.framework.home is unset");
			String antfile = stageroot + File.separator + "stagetestmgrbuild.xml";			

			String sonichome = getProperties().getProperty("sonic.home", "C:/Sonic2013");
			if (sonichome == null)
				throw new Exception("Property sonic.home is unset");
			String sonicmajorminor = getProperties().getProperty("sonic.major.minor", "8.6");
			if (sonicmajorminor == null)
				throw new Exception("Property sonic.major.minor is unset");
			String sonicstagebase = getProperties().getProperty("sonic.esb.stage.base.dir", "C:/workspaces/Tertiary/SONIC86/aurea-showcase/src/main/webapp/stage");
			if (sonicstagebase == null)
				throw new Exception("Property sonic.esb.stage.base.dir is unset");
			ps.put("sonic.home", sonichome);
			ps.put("sonic.major.minor", sonicmajorminor);
			
			ps.put("sonic.esb.sdm.dir", "esbtestprobe");
			ps.put("sonic.esb.stage.base.dir", sonicstagebase);
			writeSDMArtifacts(ps);
			//ar.runAnt(antfile, "test", ps);
			ar.runAnt(antfile, "applysdmmodel", ps);
		} catch (Exception e) {
			return false;
		}
		return true;
	}

	private void writeSDMArtifacts(Map<String, String> ps) throws FileNotFoundException {
		File modelBase = new File(ps.get("sonic.esb.stage.base.dir") + File.separator + "models" + File.separator + ps.get("sonic.esb.sdm.dir"));
		File model = new File(modelBase, "Model.xml");
		File tuning = new File(modelBase, "DefaultTuning.xml");
		File environment = new File(modelBase, "defaultEnvironment.xml");
		writeFile(model, services.getModel());
		writeFile(tuning, services.getTuning());
		writeFile(environment, services.getParameters());
	
	}

	private void writeFile(File f, String contents) throws FileNotFoundException { 
		PrintWriter pw = new PrintWriter(f);
		pw.print(contents);
		pw.close();
	}

	public Properties getProperties() {
		return m_properties;
	}

	@Autowired
	@Qualifier("aureaProperties")
	public void setProperties(Properties m_properties) {
		this.m_properties = m_properties;
	}
}

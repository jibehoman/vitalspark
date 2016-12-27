package org.springframework.webflow.samples.aurea;
import java.io.File;
import java.io.Serializable;
import java.util.Map;

import org.apache.tools.ant.Project;
import org.apache.tools.ant.ProjectHelper;

@SuppressWarnings("serial")
public class AntRunner implements Serializable {   
	public AntRunner() {
		
	}
    public void runAnt(String file, String target, Map<String, String>props) throws Exception{
        File buildFile = new File(file);
        if(!buildFile.exists()){
            throw new Exception(buildFile.getAbsolutePath()+" does not exist");
        }            
        Project p = new Project();
        p.setUserProperty("ant.file", buildFile.getAbsolutePath());
        for (String key:props.keySet())
        	p.setProperty(key, props.get(key));
        p.init();
        ProjectHelper helper = ProjectHelper.getProjectHelper();
        p.addReference("ant.projectHelper", helper);
        helper.parse(p, buildFile);
        p.executeTarget(target);
    }    

}
package org.springframework.webflow.samples.aurea;

import java.io.Serializable;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Transient;

/**
 * A service implementation for adding new Aurea services from a repository
 */
@SuppressWarnings("serial")
@Entity
public class Services implements Serializable {

    private Long id;
    private String applicationType;

    private String domainName;
    private String userName;
    private String password;
    private String url;

    private String xarName;
    private String restBaseURI;
    
    private String uploadPatternURL;
    private HashSet<String> softwareFeatures;
 
    private String model;
    private String tuning;
    private String parameters;
    private boolean inInit;

    private static final DateFormat DATE_FORMAT;
    private String timeid = null;

    static
    {
        DATE_FORMAT = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT);
        if (DATE_FORMAT instanceof SimpleDateFormat)
            ((SimpleDateFormat)DATE_FORMAT).applyPattern("yyMMdd:kk:mm:ss");
        
    }
    
    public Services() {
    	try {
    	 inInit = true;
    	 timeid = DATE_FORMAT.format(new Date(System.currentTimeMillis()));
    	 
    	 setApplicationType("Sonic");
    	 setDomainName("Domain1");
    	 setUserName("Administrator");
    	 setPassword("Administrator");
    	 setUrl("tcp://localhost:2506");
    	 setRestBaseURI("http://localhost:5700/Sonic");
    	 setSoftwareFeatures(new HashSet<String>()); 
    	 setTuning("<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>"
+"\n<ParameterSets xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"file:///C:/Sonic8.6/SDM8.6/schemas/Tuning.xsd\">"
+"\n  <!-- Activator" + timeid + "_DefaultTuning -->"
+"\n  <ESBContainerParameters id=\"_default\">"
+"\n    <Resources><Classpath>sonicfs:///System/SonicESB/8.6/lib/esbtrace-interceptor.jar</Classpath>"
+"\n    </Resources>"
+"\n    <JmsDefaultConnection>@JmsDefaultConnection@</JmsDefaultConnection>"
+"\n    <ActionalConfig>"   
+"\n      <InterceptorEnabled>@ActionalEnabled@</InterceptorEnabled>"    
+"\n      <PayloadReportingEnabled>@ActionalEnabled@</PayloadReportingEnabled>"    
+"\n    </ActionalConfig>" 
+"\n  </ESBContainerParameters>"
+"\n</ParameterSets>"
);
    	 setModel("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"    			 
+"\n<Model xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xi=\"http://www.w3.org/2001/XInclude\" xsi:noNamespaceSchemaLocation=\"file:///C:/Sonic2013/SDM8.6/schemas/Model.xsd\">"
+"\n  <GeneralConfig>"
+"\n    <ModelName>Activator" + timeid + "_Model</ModelName>"
+"\n    <Version>V1.0.0</Version>"
+"\n    <Description>ActivatorGenerated</Description>"
+"\n  </GeneralConfig>"
+"\n  <DSReference>"
+"\n    <DomainName>@DomainName@</DomainName>"
+"\n    <BasePort>@PrimaryManagementPort@</BasePort>"
+"\n    <DSHostName>@dshost.Id@</DSHostName>"
+"\n    <User>@AdministratorUser@</User>"
+"\n    <Password>@AdministratorPassword@</Password>"
+"\n  </DSReference>"
+"\n  <ESBBase>"
+"\n    <License>@ESBLicenseKey@</License>"
+"\n  </ESBBase>"
+"\n  <ESBArchive>"
+"\n    <Id>esb.xar</Id>"
+"\n  </ESBArchive>"
+"\n  <ESBContainer>"
+"\n    <LogicalHosts>"
+"\n      <LogicalHost>esb1host</LogicalHost>"
+"\n    </LogicalHosts>"
+"\n    <Id>UniversalRESTOnRamp</Id>"
+"\n    <AutoStart>true</AutoStart>"
+"\n    <BootContainer>true</BootContainer>"
+"\n    <Services>"
+"\n      <Service>"
+"\n         <Id>ConnectFaultHandling</Id>"
+"\n         <ListenerCount>1</ListenerCount>"
+"\n      </Service>"
+"\n      <Service>"
+"\n         <Id>prod.Prototype</Id>"
+"\n         <ListenerCount>1</ListenerCount>"
+"\n      </Service>"
+"\n      <Service>"
+"\n         <Id>prod.CBR</Id>"
+"\n         <ListenerCount>1</ListenerCount>"
+"\n      </Service>"
+"\n    </Services>"
+"\n  </ESBContainer>"
+"\n</Model>");
    	} finally {
    	 inInit = false;
    	}
    	setParameters();
    }

    private void setParameters() {
    	if (inInit)
    		return;
   	 setParameters("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
+"\n<Environment>"
+"\n  <!-- Activator" + timeid + "_Distillate_Parameters -->"
+"\n  <Id>default</Id>"
+ getMachines()
+"\n  <Settings/>"
+"\n  <Parameters>"
+"\n    <Parameter>"
+"\n      <Id>@DomainName@</Id>"
+"\n      <Value>" + getDomainName() + "</Value>"
+"\n    </Parameter>"
+"\n    <Parameter>"
+"\n      <Id>@AdministratorUser@</Id>"
+"\n      <Value>" + getUserName() + "</Value>"
+"\n    </Parameter>"
+"\n    <Parameter>"
+"\n      <Id>@AdministratorPassword@</Id>"
+"\n      <Value>" + getPassword() + "</Value>"
+"\n    </Parameter>"
+"\n    <Parameter>"
+"\n      <Id>@PrimaryManagementPort@</Id>"
+"\n      <Value>" + getUrlHostport() + "</Value>"
+"\n    </Parameter>"
+"\n    <Parameter>"
+"\n      <Id>@ESBLicenseKey@</Id>"
+"\n      <Value>hjvwgkqjwt8aan3</Value>"
+"\n    </Parameter>"
+"\n    <Parameter>"
+"\n      <Id>@ActionalEnabled@</Id>"
+"\n      <Value>true</Value>"
+"\n    </Parameter>"
+"\n    <Parameter>"
+"\n      <Id>@JmsDefaultConnection@</Id>"
+"\n      <Value>StandardConnection</Value>"
+"\n    </Parameter>"
+"\n    <Parameter>"
+"\n      <Id>@prop.ConnectFaultHandling.properties.Resource.RESTProcess.sonic.resourceUri@</Id>"
+"\n      <Value>" + getRestResourceUri() + "</Value>"
+"\n    </Parameter>"
+"\n    <Parameter>"
+"\n      <Id>@prop.ConnectFaultHandling.properties.Resource.RESTProcess.sonic.baseUrl@</Id>"
+"\n      <Value>" + getRestBaseUrl() + "</Value>"
+"\n    </Parameter>"
+"\n  </Parameters>"
+"\n</Environment>"
);
		
	}
    
    @Transient
    private String getMachines() {
    	boolean same = getUrlHostname(url).equals(getUrlHostname(restBaseURI));
    	if (same)
    		return 
    		 "\n  <Machines>"
    		+"\n    <Machine>"
    		+"\n      <Id>" + getUrlHostname() + "</Id>"
    		+"\n      <LogicalHosts>"
    		+"\n        <LogicalHost>dshost</LogicalHost>"
    		+"\n        <LogicalHost>esb1host</LogicalHost>"
    		+"\n      </LogicalHosts>"
    		+"\n    </Machine>"
    	    +"\n  </Machines>";
    	else return
       		 "\n  <Machines>"
     		+"\n    <Machine>"
     		+"\n      <Id>" + getUrlHostname() + "</Id>"
     		+"\n      <LogicalHosts>"
     		+"\n        <LogicalHost>dshost</LogicalHost>"
     		+"\n      </LogicalHosts>"
     		+"\n    </Machine>"
     		+"\n    <Machine>"
     		+"\n      <Id>" + getUrlHostname(restBaseURI) + "</Id>"
     		+"\n      <LogicalHosts>"
     		+"\n        <LogicalHost>esb1host</LogicalHost>"
     		+"\n      </LogicalHosts>"
     		+"\n    </Machine>"
     		+"\n  </Machines>";

    }

	@Transient
    private String getRestBaseUrl() {
		int endOfProtocolPragma = restBaseURI.indexOf("://");
		int protocolPragmaLength = 0;
		if (endOfProtocolPragma != -1)
			protocolPragmaLength = endOfProtocolPragma + 3;
		int slash = restBaseURI.indexOf("/", protocolPragmaLength);
		if (slash != 1)
			return restBaseURI.substring(0, slash);
		else
			return restBaseURI;
	}

	@Transient
	private String getRestResourceUri() {
		String candidate = restBaseURI;
		int endOfProtocolPragma = restBaseURI.indexOf("://");
		if (endOfProtocolPragma != -1)
			candidate = restBaseURI.substring(endOfProtocolPragma+3);
		int slash = candidate.indexOf("/");
		if (slash != 1)
			return candidate.substring(slash);
		else
			return "";
	}

	@Transient
	private String getUrlHostport() {
		return url.substring(url.lastIndexOf(":")+1);
	}

    @Transient
	private String getUrlHostname() {
		return getUrlHostname(url);
	}
    
    @Transient
	private String getUrlHostname(String url) {
		String candidate = url;
		int endOfProtocolPragma = url.indexOf("://");
		if (endOfProtocolPragma != -1)
			candidate = url.substring(endOfProtocolPragma+3);

		int endOfHostPragma = candidate.indexOf(":");
		if (endOfHostPragma == -1)
			endOfHostPragma = candidate.indexOf("/");
		if (endOfHostPragma != -1)
			return candidate.substring(0,endOfHostPragma);
		else
			return candidate;
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
   	    setParameters();
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
   	    setParameters();
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
   	    setRestHost(getUrlHostname());
   	    setParameters();
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
   	    setParameters();
	}

	public String getXarName() {
		return xarName;
	}

	public void setXarName(String xarName) {
		this.xarName = xarName;
	}

	public HashSet<String> getSoftwareFeatures() {
		return softwareFeatures;
	}

	public void setSoftwareFeatures(HashSet<String> softwareFeatures) {
  	  this.softwareFeatures = softwareFeatures;
	}
	
	/**todo lovely big data below!
	 */
	public void setModel(String model) {
		this.model = model;
	}

	public String getModel() {
		return model;
	}

	public String getTuning() {
		return tuning;
	}

	public void setTuning(String tuning) {
		this.tuning = tuning;
	}

	public String getParameters() {
		return parameters;
	}

	public void setParameters(String parameters) {
		this.parameters = parameters;
	}

	public String getRestBaseURI() {
		return restBaseURI;
	}

	public void setRestBaseURI(String restBaseURI) {
		this.restBaseURI = restBaseURI;
   	    setParameters();
	}
	
	private void setRestHost(String host) {
    	if (inInit)
    		return;
		String old = getUrlHostname(restBaseURI);
		restBaseURI = restBaseURI.replace(old, host);
	}

}

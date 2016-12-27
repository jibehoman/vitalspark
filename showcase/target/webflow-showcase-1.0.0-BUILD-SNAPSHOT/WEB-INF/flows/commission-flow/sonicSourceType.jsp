<div id="commissionFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Select Sonic application source type</p>
	<form id="sonicSourceType" action="${flowExecutionUrl}" method="POST">
		<h:outputLabel>Application Source Type: </h:outputLabel>
		<br/>
		<input type="radio" name="uploadApplication" value="xar" checked>Upload XAR<br/>
        <input type="radio" name="uploadApplication" value="sdm">Upload SDM<br/>
        <input type="radio" name="uploadApplication" value="domain" >Connect to a development Domain<br/>
        <input type="radio" name="uploadApplication" value="blanksheet">Fresh Start<br/>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
		    Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'sonicSourceType',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'sonicSourceType',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'sonicSourceType',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>Source Type</h6>
		<p>Select applications for deployment by a number of different means. You can use
		the Sonic Archive(xar) format, or connect to an existing development domain.<br/><br/>For more complex deployments, where customer or field service Maven-generated SDM models are available you can use these as a source for deployment. <p>
<br><b>Notes</b>
<nl>
    <li>Electing source type of <i>xar</i>(Sonic Application Archive) to deployment, has a direct analogy in EC-2. 
    Take a look at EC-2 Elastic Beanstalk. With  Elastic Beanstalk you 
    deploy a .war(Web Application Archive) into the cloud, front ended be Elastic Load Balancers and configured with
    auto-scaling.
    <li><i><font color="Red">Tension:</font></i> most of our .xar and .sdm models are applied in incremental layers(e.g. the field best-practices prescribe incremental SDM models for domain, messaging , and application)
    Customers, particularly BA, will have multiple models to apply. We need to consider how this tool supports that,
    and/or whether model dependencies can be reflected elsewhere(repository or sdm model).  
    <li><i>Fresh Start</i> is listed but is for future thought.
    </li><br><br>
    <a href="http://jira.aurea.local/browse/ESB-7479" target="_blank">feedback</a>
 </nl>   
     
	</div>
</div>
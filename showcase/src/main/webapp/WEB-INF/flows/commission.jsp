<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<div>
	<h2 class="alt">Commissioning</h2>
	<h4 class="alt"><a href="<c:url value="/"/>">Home</a></h4>
	<hr>
	<div class="span-4 colborder">
		<h6>Select applications</h6>
		<br/>Aurea Experience Activator makes it easy to select and deploy your applications in the cloud and on-premise hardware. AxA supports a number of options
		for application selection. You can point to an existing Workbench development environment to select
		processes for deployment, or to a Sonic application archive(xar) created from Workbench.
	</div>
	<div class="span-14 colborder">
		<h3 class="alt">Commission an Application</h3>
		<div id="commissionFlow">
			<a id="startFlow" href="commission-flow">Start Commissioning Now</a>
			<script type="text/javascript">
				Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:"startFlow",event:"onclick",params:{fragments:"body",mode:"embedded"}}));
			</script>
		<br><br>
 Give us your <a href="http://jira.aurea.local/browse/ESB-7481" target="_blank">feedback</a> on the commissioning experience. Feedback on all
 the commissioning content is welcome including technical commentary and do-list sections. Where the word <font color="Red"><i>tension</i></font> appears, it means the story is not clicking cleanly. Please give me you help and opinions particularly in these areas.
		</div>
	</div>
    <div class="span-5">
		<h6>Do List</h6>
		<ol compact>
		<li>xar upload functional in this Webflow UI(xarUpload.jsp) &#x2714;</li>
		<li>dremToModel scripts accepts xars &#x2714;</li>
		<li>generate drem instructions(primarily Drem.xml) - we can hard-code the pattern initially, 
		and, we can also do a rule-of-thumb that we'll deploy every process in the xar.
		In the longer-term there is a process selection screen similar to Workbench's.</li>
		<li>run dremToModel against the xar</li>
		<li>revise templates to use vdi2 placeholders for machine and ip addresses</li>
		<li>generate virtualization.xml - base off the placeholder references - run sdm-deploy(Vagrant/Chef)</li>
		<li>At this point everything is up and running!
		</ol>
		<br><br>
		What do you think the first packaging priority for us is? Any other comments? <a href="http://jira.aurea.local/browse/ESB-7486" target="_blank">feedback</a>.		
		
	</div>
</div>
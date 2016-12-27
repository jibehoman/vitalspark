<div id="servicesFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Specify Deployment Parameters</p>
	<form id="specifyDeploymentParameters" action="${flowExecutionUrl}" method="POST">
	   You have chosen to apply the following services. Below are the parameters for these
	   selections. You may review and change parameters here. Hit proceed to continue.  
       <br>&nbsp;</br><font color="Blue"><i>1. Universal REST Enabler - REST Enable All Processes</i></font><br>
       <p/>
       <div class="span-3" >	
 	   <h:outputLabel>REST Base URI</h:outputLabel>
       </div>
       <div class="span-4 last">
		 <input id="restBaseURI" name="restBaseURI" value="${services.restBaseURI}">
       </div>
<p>&nbsp;</p>
       <font color="Blue"><i>2. ESBTraceRoute - Enables Test Probes into the ESB to be issued from any browser.</i></font><br>&nbsp;</br>This feature takes no parameters. An 
       ESBTraceRoute intercepter will deployed into all ESB containers. Deployment will perform a full-restart of
       all ESB containers. 24x7 availability requirements will be upheld during restart sequencing.
       <p>&nbsp;</p>
       	<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
		    Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
	</div>
	</div>
</div>
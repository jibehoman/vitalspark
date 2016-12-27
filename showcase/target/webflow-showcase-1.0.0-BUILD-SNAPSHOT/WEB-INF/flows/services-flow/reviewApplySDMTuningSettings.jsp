<div id="servicesFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Review SDM Tuning Settings</p>
	<form id="reviewApplySDMTuningSettings" action="${flowExecutionUrl}" method="POST">
	   <p>
	   This update requires SDM Tuning to be applied. <br/><br/>SDM Tuning allows you to fine tune the SDM Model through
	   <i>parameter sets</i>(similar in concept to macros). SDM Tuning is typically required if container-level classpath
	   changes are needed, for example if ESB interceptors are being introduced to the system. 
	   <br/><br/>
	   Please review the following carefully.
	   <br/><br/>
	   You may make changes here
	   before continuing. 
<textarea name="tuning" cols="80" rows="40" wrap="off">
${services.tuning}
</textarea>
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
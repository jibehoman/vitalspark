<div id="servicesFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Review SDM Environment Settings</p>
	<form id="reviewApplySDMTopologyEnvironmentSettings" action="${flowExecutionUrl}" method="POST">
	   <p>
	   Based on your system, and previous configuration choices, 
	   the following parameters will be applied to the SDM model.
	   <br/><br/>
	   Please review the following carefully.
	   <br/><br/>
	   You may make changes here
	   before continuing. 
	   <textarea name="parameters" cols="80" rows="40" wrap="off">
${services.parameters}
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
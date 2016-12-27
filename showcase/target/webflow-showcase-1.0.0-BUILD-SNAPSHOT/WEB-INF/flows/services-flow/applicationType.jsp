<div id="servicesFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Select Aurea application type</p>
	<form id="applicationType" action="${flowExecutionUrl}" method="POST">
		<h:outputLabel>Application Type</h:outputLabel>
        <select name="applicationType" value="${services.applicationType}">
                                <option value="Sonic">Sonic</option>
                                <option value="Savvion">Savvion</option>
                            </select><br/>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<script type="text/javascript">
            Spring.addDecoration(new Spring.ValidateAllDecoration({elementId:'next', event:'onclick'}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'applicationType',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'applicationType',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>Application Type</h6>
		<p>Sonic is currently supported.<p>
	</div>
	</div>
</div>
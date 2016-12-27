<div id="servicesFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Review SDM Model Updates</p>
	<form id="reviewApplySDMUpdate" action="${flowExecutionUrl}" method="POST">
	   <p>
	   Please review the following SDM Model updates carefully.
	   <br/><br/>
	   Typically, <i>you should not need to make any changes here</i>, because in
	   this Model document host machines and parameters are fully parameterized.
	   Actual parameter assignments are shown in following screens.
	   <br/><br/> If you wish make changes here 
	   and are a skillful SDM modeler, make them now before continuing. 
	   <textarea name="model" cols="80" rows="40" wrap="off">
${services.model}
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